import listInteractionsOnLine from '../databaseJSON/interactionsOnLine.json' with { type: "json" }
import { InteractionsModel } from '../models/interactions_model.js'

export class InteractionsController {

    // GET todas las interacciones (para admin/debug)
    static async getAllInteractions(req, res) {
        try {
            console.log('🔍 --- getAllInteractions ---');
            res.json(listInteractionsOnLine)
        } catch (error) {
            console.error('❌ getAllInteractions error:', error);
            return res.status(500).json({ message: 'Error interno' });
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
            const { idUser, response, invData } = req.body
            console.log('✅❌ --- respondToInvitation --- recibido:', { id, idUser, response });

            // Validaciones básicas
            if (!idUser || !response) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUser y response son obligatorios' 
                });
            }

            // Validar respuestas permitidas
            const allowedResponses = ['accepted', 'rejected']
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

            const result = await InteractionsModel.respondToInvitation({ idInteraction: id, idUser, response, invData })

            // si ha salido mal ...
            if (!result.success) return res.status(400).json({ message: result.message })

            // si todo va bien ...
            res.json({ message: result.message, interaction: result.interaction })

        } catch (error) {
            console.error('❌ respondToInvitation error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }


    // POST crear nueva interacción
    //TODO cuando se haga este POOST el host debe ponerse como inactivo para qeu no le llegen peticiones de emparejamiento
    static async createInteraction(req, res) {
        try {
            const { idUserHost, idUserGuest, invData, type, idLocationMap } = req.body
            console.log('➕ --- createInteraction --- recibido:', { idUserHost, idUserGuest, type, idLocationMap });

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
                idUserGuest, 
                invData, 
                type, 
                idLocationMap 
            })

            if (!newInteraction) {
                return res.status(409).json({ 
                    message: 'Ya existe una interacción activa entre estos usuarios' 
                });
            }

            res.status(201).json({
                message: 'Interacción creada exitosamente',
                idInteraction: newInteraction.idInteraccionOnLine
            })

        } catch (error) {
            console.error('❌ createInteraction error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}