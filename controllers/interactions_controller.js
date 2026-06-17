import { InteractionsModel } from '../models/interactions_model.js'

export class InteractionsController {

    // GET todas las interacciones (para admin/debug)
    static async getAllInteractions(req, res) {
        try {
            const interactions = await InteractionsModel.getAll()
            res.json(interactions)
        } catch (error) {
            console.error('❌ getAllInteractions error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    // GET para polling del HOST - espera respuesta del guest
    static async pollHostInteraction(req, res) {
        try {
            const { id } = req.params // id de la interacción
            const { idUser } = req.query // id del host
            console.log('🔄 --- pollHostInteraction --- recibido:', { id, idUser });

            const pollingResult = await InteractionsModel.pollHostInteraction({ 
                idInteraction: id, 
                idUser: idUser 
            })

            console.log(pollingResult)
            
            if (!pollingResult) {
                return res.status(404).json({ message: 'Interacción no encontrada o no autorizada' })
            }

            res.json(pollingResult)

        } catch (error) {
            console.error('❌ pollHostInteraction error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET invitaciones pendientes para el GUEST
    static async getPendingInvitations(req, res) {
        try {
            const { id } = req.params // id del guest
            console.log('🔍 --- getPendingInvitations --- recibido:', id);

            const pendingInteractions = await InteractionsModel.getPendingInvitations({ idUser: id })
            
            res.json(pendingInteractions)

        } catch (error) {
            console.error('❌ getPendingInvitations error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // PUT para responder a una invitación
    static async respondToInvitation(req, res) {
        try {
            const { id } = req.params // id de la interacción
            const { idUser, nameUser, response, invData } = req.body
            console.log('✅❌ --- respondToInvitation --- recibido:', { id, idUser, nameUser,  response });

            // Validaciones básicas
            if (!idUser || !response) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUser y response son obligatorios' 
                });
            }

            // Validar respuestas permitidas (corregido 'bandoned' → 'abandoned')
            const allowedResponses = ['accepted', 'rejected', 'timeout', 'finished', 'cancelled', 'abandoned']
            if (!allowedResponses.includes(response)) {
                return res.status(400).json({ 
                    message: `Respuesta no válida. Permitidas: ${allowedResponses.join(', ')}` 
                });
            }

            // Si acepta, es requerido que envie los datos del investigador
            if (response === 'accepted' && !invData) {
                return res.status(400).json({ 
                    message: 'invData es requerido cuando se acepta una invitación' 
                });
            }

            // Si abandona, marcar al contrario como ganador automáticamente
            if (response === 'abandoned') {
                console.log(`🏃‍♂️ Usuario ${idUser} ha abandonado la interacción ${id}`);
                // Aquí el modelo debería manejar la lógica de declarar ganador al oponente
            }

            const result = await InteractionsModel.respondToInvitation({ idInteraction: id, idUser, nameUser, response, invData })

            // si ha salido mal ...
            if (!result.success) return res.status(400).json({ message: result.message })

            // Mensaje específico para abandono
            let responseMessage = result.message;
            if (response === 'abandoned') {
                responseMessage = 'Jugador ha abandonado la partida. El oponente ha sido declarado ganador.';
            }

            // si todo va bien ...
            res.json({ message: responseMessage, interaction: result.interaction })

        } catch (error) {
            console.error('❌ respondToInvitation error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }


    // POST crear nueva interacción
    //TODO cuando se haga este POOST el host debe ponerse como inactivo para qeu no le llegen peticiones de emparejamiento
    static async createInteraction(req, res) {
        try {
            const { idUserHost, nameUserHost, idUserGuest, invData, type, idLocationMap } = req.body
            console.log('➕ --- createInteraction --- recibido:', { idUserHost, nameUserHost, idUserGuest, type, idLocationMap });

            // Validaciones básicas
            if (!idUserHost || !idUserGuest || !type || !idLocationMap ) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUserHost, idUserGuest, type e idLocationMap son obligatorios' 
                });
            }

            // Validar tipos de interacción permitidos
            const allowedTypes = ['fight', 'trade', 'resonance', '___']
            if (!allowedTypes.includes(type)) {
                return res.status(400).json({ 
                    message: `Tipo de interacción no válido. Permitidos: ${allowedTypes.join(', ')}` 
                });
            }

            const newInteraction = await InteractionsModel.createInteraction({ 
                idUserHost,
                nameUserHost,
                idUserGuest, 
                nameUserGest: 'Invitado', // Nombre por defecto para el invitado
                invData, 
                type, 
                idLocationMap 
            })

            res.status(201).json({
                message: 'Interacción creada exitosamente',
                idInteraction: newInteraction.idInteraccionOnLine
            })

        } catch (error) {
            console.error('❌ createInteraction error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }


    // ===========================================
    // FASE 1 - JUEGO: TIRADA INICIAL
    // ===========================================

    // PUT - Tirada inicial de dados
    static async initialRoll(req, res) {
        try {
            const { id } = req.params // id de la interacción
            const { idUser, diceResult } = req.body
            console.log('🎲 --- initialRoll --- recibido:', { id, idUser, diceResult });

            // Validaciones básicas
            if (!idUser || !diceResult) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUser y diceResult son obligatorios' 
                });
            }

            // Validar que el resultado del dado sea válido
            if (typeof diceResult !== 'number' || diceResult < 1 || diceResult > 6) {
                return res.status(400).json({ 
                    message: 'diceResult debe ser un número entre 1 y 6' 
                });
            }

            const result = await InteractionsModel.initialRoll({ idInteraction: id, idUser, diceResult })

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            // Respuesta exitosa
            res.json({ 
                message: result.message, 
                interaction: result.interaction 
            })

        } catch (error) {
            console.error('❌ initialRoll error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET - Consultar mi turno
    static async checkMyTurn(req, res) {
        try {
            const { id } = req.params // id de la interacción
            const { idUser } = req.query // id del usuario
            console.log('🔍 --- checkMyTurn --- recibido:', { id, idUser });

            // Validaciones básicas
            if (!idUser) {
                return res.status(400).json({ 
                    message: 'idUser es obligatorio como query parameter' 
                });
            }

            const result = await InteractionsModel.checkMyTurn({ idInteraction: id, idUser })

            if (!result.success && result.message) {
                return res.status(400).json({ message: result.message })
            }

            // Respuesta exitosa con el status del turno
            res.json(result)

        } catch (error) {
            console.error('❌ checkMyTurn error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET - Consultar estado del juego 
    static async getGameState(req, res) {
        try {
            const { idInteraction  } = req.params // id de la interacción
            const { idUser } = req.query // id del usuario

            const result = await InteractionsModel.getGameState({ idInteraction, idUser })
            if (!result.success && result.message) {
                return res.status(400).json({ message: result.message })
            }

            // Respuesta exitosa con el estado del juego
            res.json(result)

        } catch (error) {
            console.error('❌ getGameState error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // PUT - Enviar aciertos
    static async sendHits(req, res) {
        try {
            const { id } = req.params // id de la interacción
            const { idUser, hits } = req.body
            console.log('🎯 --- sendHits --- recibido:', { id, idUser, hits });

            // Validaciones básicas
            if (!idUser || hits === undefined || hits === null) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUser y hits son obligatorios' 
                });
            }

            // Validar que hits sea un número válido (mayor o igual a 0)
            if (typeof hits !== 'number' || hits < 0 || hits > 10) {
                return res.status(400).json({ 
                    message: 'hits debe ser un número mayor o igual a 0 y menor que 10' 
                });
            }

            const result = await InteractionsModel.sendHits({ idInteraction: id, idUser, hits })

            if (!result.success) {
                return res.status(400).json({
                    status: result.success,
                    message: result.message 
                })
            }

            return res.json({ 
                status: result.success,
                message: result.message
            })

        } catch (error) {
            console.error('❌ sendHits error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET - Abandonar encuentro
    static async abandonEncounter(req, res) {
        try {
            const { idInteraction } = req.params // id de la interacción
            const { idUser } = req.query
            console.log('🏃‍♂️ --- abandonEncounter --- recibido:', { idInteraction, idUser });
            if (!idUser) {
                return res.status(400).json({ 
                    message: 'idUser es obligatorio como query parameter' 
                });
            }

            const result = await InteractionsModel.abandonEncounter({ idInteraction, idUser })
            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.json({ 
                status: result.success,
                message: result.message 
            })

        } catch (error) {
            console.error('❌ abandonEncounter error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async sendTradeOffer(req, res) {
        try {
            const { id } = req.params
            const { idUser, fromHost, fromGuest } = req.body
            console.log('📤 --- sendTradeOffer --- recibido:', { id, idUser, fromHost, fromGuest })
            if (!idUser || fromHost === undefined || fromGuest === undefined) {
                return res.status(400).json({ message: 'Faltan datos: idUser, fromHost y fromGuest son obligatorios' })
            }
            const result = await InteractionsModel.sendTradeOffer({ idInteraction: id, idUser, fromHost, fromGuest })
            if (!result.success) return res.status(400).json({ message: result.message })
            res.json({ message: result.message })
        } catch (error) {
            console.error('❌ sendTradeOffer error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async guestRespondToOffer(req, res) {
        try {
            const { id } = req.params
            const { idUser, response, counterFromHost, counterFromGuest } = req.body
            console.log('🔄 --- guestRespondToOffer --- recibido:', { id, idUser, response })
            if (!idUser || !response) {
                return res.status(400).json({ message: 'Faltan datos: idUser y response son obligatorios' })
            }
            const result = await InteractionsModel.guestRespondToOffer({ idInteraction: id, idUser, response, counterFromHost, counterFromGuest })
            if (!result.success) return res.status(400).json({ message: result.message })
            res.json({ message: result.message })
        } catch (error) {
            console.error('❌ guestRespondToOffer error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async hostResolveCounteroffer(req, res) {
        try {
            const { id } = req.params
            const { idUser, response } = req.body
            console.log('🤝 --- hostResolveCounteroffer --- recibido:', { id, idUser, response })
            if (!idUser || !response) {
                return res.status(400).json({ message: 'Faltan datos: idUser y response son obligatorios' })
            }
            const result = await InteractionsModel.hostResolveCounteroffer({ idInteraction: id, idUser, response })
            if (!result.success) return res.status(400).json({ message: result.message })
            res.json({ message: result.message })
        } catch (error) {
            console.error('❌ hostResolveCounteroffer error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async cancelTrade(req, res) {
        try {
            const { id } = req.params
            const { idUser } = req.body
            console.log('🚫 --- cancelTrade --- recibido:', { id, idUser })
            if (!idUser) return res.status(400).json({ message: 'idUser es obligatorio' })
            const result = await InteractionsModel.cancelTrade({ idInteraction: id, idUser })
            if (!result.success) return res.status(400).json({ message: result.message })
            res.json({ message: result.message })
        } catch (error) {
            console.error('❌ cancelTrade error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async submitResonance(req, res) {
        try {
            const { id } = req.params
            const { idUser, bet, successes, dice } = req.body
            console.log('🕯️ --- submitResonance [CONTROLLER] --- body completo:', JSON.stringify(req.body, null, 2))
            console.log('🕯️ --- submitResonance [CONTROLLER] --- desestructurado:', { id, idUser, bet, successes, dice: JSON.stringify(dice) })

            if (!idUser || bet === undefined || bet < 0) {
                return res.status(400).json({ message: 'Faltan datos: idUser y bet (≥0) son obligatorios' })
            }

            const result = await InteractionsModel.submitResonance({ idInteraction: id, idUser, bet, successes, dice })
            if (!result.success) return res.status(400).json({ message: result.message })

            res.json({ message: 'Ritual activado', resonanceData: result.resonanceData })
        } catch (error) {
            console.error('❌ submitResonance error:', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }
}