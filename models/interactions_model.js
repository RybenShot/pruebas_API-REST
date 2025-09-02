import listInteractionsOnLine from '../databaseJSON/interactionsOnLine.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'

export class InteractionsModel {
    // método privado para guardar cambios en el JSON
    static _saveAll() {
        writeFileSync('./databaseJSON/interactionsOnLine.json', JSON.stringify(listInteractionsOnLine, null, 2))
    }

    // función para generar número aleatorio (simulación de dado)
    static _rollDice() {
        return Math.floor(Math.random() * 6) + 1
    }
        // función privada para generar recompensa aleatoria al ganar
    static _generateRandomReward(loserInvestigator) {
        const rewardTypes = ['clue', 'remnant', 'money', 'object']
        const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)]

        switch (randomType) {
            case 'clue':
                return {
                    type: 'clue',
                    amount: 1,
                    description: '1 pista ganada'
                }
            case 'remnant':
                return {
                    type: 'remnant', 
                    amount: 2,
                    description: '2 restos ganado'
                }
            case 'money':
                return {
                    type: 'money', 
                    amount: 3,
                    description: '3 dinero ganado'
                }
            case 'object':
                // Si tiene objetos, tomar uno aleatorio
                if (loserInvestigator.possessions && loserInvestigator.possessions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * loserInvestigator.possessions.length)
                    const randomObject = loserInvestigator.possessions[randomIndex]
                    return {
                        type: 'object',
                        objectId: randomObject.id,
                        objectData: randomObject,
                        description: `Objeto ganado: ${randomObject.translations?.es?.name || randomObject.name || 'Objeto desconocido'}`
                    }
                }
            default:
                return {
                    type: 'money',
                    amount: 3,
                    description: '3 dinero ganado (default)'
                }
        }
    }

    // obtener invitaciones pendientes para el GUEST
    static async getPendingInvitations({ idUser }) {
        console.log('🔍 --- getPendingInvitations --- recibido:', idUser);
        
        // this.removeInactiveInteractions()

        const pendingInteractions = listInteractionsOnLine.filter(interaction =>
            interaction.idUserGest === idUser && 
            interaction.status === "pending"
        )

        if (!pendingInteractions[0]) return null

        return pendingInteractions[0]
    }
    
    // endpoint para polling del HOST - espera respuesta del otro
    static async pollHostInteraction({ idInteraction, idUser }) {
        console.log('🔄 --- pollHostInteraction --- recibido:', { idInteraction, idUser });

        // buscamos la interaccion
        const interaction = listInteractionsOnLine.find(interaction => interaction.idInteraccionOnLine === idInteraction)

        // miramos si existe
        if (!interaction) {
            return "no existe esta interaccion"
        } else if (interaction.status != "pending" && interaction.status != "accepted" && interaction.status != "rejected") {
            return "el estado de esta interaccion esta rechazada, expirado o finalizado"
        } else if (interaction.idUserHost !== idUser && interaction.idUserGest !== idUser) {
            return "no estas autorizado para ver esta informacion"
        }

        // retornar estado actual para que el host o gest sepa qué pasó
        return interaction
    }

    // crear nueva interacción entre usuarios
    static async createInteraction({ idUserHost, idUserGuest, invData, type, idLocationMap }) {
        console.log('➕ --- createInteraction --- recibido:', { idUserHost, idUserGuest, type, idLocationMap });

        // limpiar interacciones inactivas primero
        // this.removeInactiveInteractions()

        // verificar que no exista ya una interacción activa entre estos usuarios
        const existingInteraction = listInteractionsOnLine.find(interaction => 
            interaction.isActive && 
            ((interaction.idUserHost === idUserHost && interaction.idUserGest === idUserGuest) ||
             (interaction.idUserHost === idUserGuest && interaction.idUserGest === idUserHost))
        )

        if (existingInteraction) {
            console.warn('⚠️ Ya existe una interacción activa entre estos usuarios');
            return null
        }

        const now = Date.now()
        const newInteraction = {
            idInteraccionOnLine: randomUUID(),
            idLocationMap: idLocationMap,
            idUserHost: idUserHost,
            idUserGest: idUserGuest,
            status: "pending", // "accepted" | "rejected" | "expired" | "finished"
            created: now,
            lastEdited: now,
            event: {
                type: type, // "fight", "trade", "cooperation", etc.
                invDataHost: invData || null,
                invDataGest: null, // se llenará cuando el invitado acepte
                turn: null, // se establecerá cuando inicie la interacción
                // aquí se añadirán variables específicas según el tipo de evento
                
            }
        }

        // añadir la nueva interacción
        listInteractionsOnLine.push(newInteraction)
        this._saveAll()

        console.log(`✅ Nueva interacción creada: ${newInteraction.idInteraccionOnLine} (${type})`)
        return newInteraction
    }

    // responder a una invitación (aceptar o denegar)
    static async respondToInvitation({ idInteraction, idUser, response, invData }) {
        console.log('✅❌ --- respondToInvitation --- recibido:', { idInteraction, idUser, response });

        // buscar la interacción
        const interactionIndex = listInteractionsOnLine.findIndex(interaction => 
            interaction.idInteraccionOnLine === idInteraction
        )
        // si no encuentra ninguno ...
        if (interactionIndex === -1) return { success: false, message: "Interacción no encontrada" }

        // gracias a la posicion, nos guardamos los datos de la interaccion
        const interaction = listInteractionsOnLine[interactionIndex]

        // verificar que el usuario sea el GUEST
        if (interaction.idUserGest !== idUser) return { success: false, message: "No tienes autorización para responder esta invitación" }
        // verificar que la invitación esté pendiente
        if (interaction.status !== "pending") return { success: false, message: `Esta invitación ya no está disponible porque ya ha sido respondida con ${interaction.status}` }

        // actualizar la interacción según la respuesta
        const now = Date.now()
        
        if (response === "accepted") {
            listInteractionsOnLine[interactionIndex] = {
                // copiamos lo que habia en el objeto de la invitacion y actualizamos solo lo que nos interesa
                ...interaction,
                status: "accepted",
                lastEdited: now,
                event: {
                    // igual que aqui
                    ...interaction.event,
                    invDataGest: invData || null
                }
            }

            // comienza el evento que sea
            await this.startEventOnLine(listInteractionsOnLine[interactionIndex])
            
            this._saveAll()
            console.log(`✅ Invitación aceptada: ${idInteraction}`)

            return { 
                success: true, 
                message: "Invitación aceptada", 
                interaction: listInteractionsOnLine[interactionIndex] 
            }
            
        } else if (response === "rejected") {
            listInteractionsOnLine[interactionIndex] = {
                ...interaction,
                status: "rejected",
                lastEdited: now
            }
            
            this._saveAll()
            console.log(`❌ Invitación rechazada: ${idInteraction}`)
            return { 
                success: true, 
                message: "Invitación rechazada", 
                interaction: listInteractionsOnLine[interactionIndex] 
            }
            
        } else if (response === "timeout") {
            listInteractionsOnLine[interactionIndex] = {
                ...interaction,
                status: "timeout",
                lastEdited: now
            }
            
            this._saveAll()
            console.log(`❌ Invitacion cerrada por tiempo excedido: ${idInteraction}`)
            return { 
                success: true, 
                message: "Tiempo excedido", 
                interaction: listInteractionsOnLine[interactionIndex] 
            }
            
        } 
        else {
            return { success: false, message: "Respuesta no válida. Use 'accepted' o 'rejected'" }
        }
    }

    // Disparador de eventoOnLine
    static startEventOnLine(interactionActual){
        if (interactionActual.event.type === "fight") {
            // Inicializar datos del juego
            const hostLife = interactionActual.event.invDataHost.atributes.life
            const gestLife = interactionActual.event.invDataGest.atributes.life
            
            interactionActual.event = {
                ...interactionActual.event,
                round: 0,
                gameData: {
                    currentLifeHost: hostLife,
                    currentLifeGest: gestLife,
                    maxLifeHost: hostLife,
                    maxLifeGest: gestLife,
                    initialRollHost: null,
                    initialRollGest: null,
                    bothRolled: false,
                    history: []
                },
                winner: null,
                status: "waitingInitialRoll" // nuevo estado para controlar la fase del juego
            }
            console.log(`🎮 Juego de pelea inicializado para interacción: ${interactionActual.idInteraccionOnLine}`)

        } else if (interactionActual.event.type === "trade") {
            console.log('🔄 Iniciando evento de intercambio')
            
        } else if (interactionActual.event.type === "resonance") {
            console.log('✨ Iniciando evento de resonancia')
            
        } else {
            console.warn(`⚠️ Tipo de evento desconocido: ${interactionActual.event.type}`)
            return null
        }
        return interactionActual
    }

    // FASE 1: Tirada inicial de dados
    static async initialRoll({ idInteraction, idUser, diceResult }) {

        // Buscar la interacción
        const interaction = listInteractionsOnLine.find(interaction => 
            interaction.idInteraccionOnLine === idInteraction
        )

        if (!interaction ) {
            return { success: false, message: "Interacción no encontrada" }
        }

        const now = Date.now()

        // asignar el resultado si es el HOST o el GEST
        if (interaction.idUserHost === idUser) {
            if (interaction.event.gameData.initialRollHost !== null) {
                return { success: false, message: "Ya has realizado tu tirada inicial" }
            }
            interaction.event.gameData.initialRollHost = diceResult
        } else {
            if (interaction.event.gameData.initialRollGest !== null) {
                return { success: false, message: "Ya has realizado tu tirada inicial" }
            }
            interaction.event.gameData.initialRollGest = diceResult
        }

        // Actualizar timestamp
        interaction.lastEdited = now

        // Verificar si ambos han tirado
        const hostRoll = interaction.event.gameData.initialRollHost
        const gestRoll = interaction.event.gameData.initialRollGest

        if (hostRoll != null && gestRoll != null) {
            // Ambos han tirado, determinar quién empieza
            let start
            if (hostRoll > gestRoll) {
                start = interaction.idUserHost
            } else if (gestRoll > hostRoll) {
                start = interaction.idUserGest
            } else {
                // Empate, gana el host
                start = interaction.idUserHost
            }

            // Actualizar el estado del juego
            interaction.event.turn = start
            interaction.event.gameData.bothRolled = true
            interaction.event.status = "playing"
            interaction.event.round = 1

            console.log(`🎲 Tiradas completas - Host: ${hostRoll}, Guest: ${gestRoll}, Comienza: ${start}`)
        }

        this._saveAll()

        return { 
            success: true, 
            message: "Tirada registrada correctamente"
        }
    }

    // FASE 1: Consultar si es mi turno
    static async checkMyTurn({ idInteraction, idUser }) {
        console.log('🔍 --- checkMyTurn --- recibido:', { idInteraction, idUser });

        // Buscar la interacción
        const interaction = listInteractionsOnLine.find(interaction => 
            interaction.idInteraccionOnLine === idInteraction
        )

        if (!interaction) {
            return { success: false, message: "Interacción no encontrada" }
        }

        // Verificar estados del juego, por si has ganado
        if (interaction.status === "finished" && interaction.event.winner) {
            if (interaction.event.winner === idUser) {
                return { status: "you won" }
            } else {
                return { status: "you lost" }
            }
        }

        if (interaction.status === "abandoned") {
            return { status: "your rival has left the game" }
        }

        if (interaction.status === "timeout") {
            return { status: "your rival has closed the game" }
        }

        // Si el juego está en progreso
        if (interaction.event.status === "playing") {
            if (interaction.event.turn === idUser) {
                return { 
                    status: "your turn", 
                    interaction: interaction 
                }
            } else {
                return { status: "not your" }
            }
        }

        // Si está esperando tiradas iniciales
        if (interaction.event.status == "waitingInitialRoll") {
            return { 
                status: "waiting_initial_roll"
            }
        }

        // Estado por defecto
        return { status: "false" }
    }

    // FASE 2: Enviar aciertos y procesar daño
    static async sendHits({ idInteraction, idUser, hits }) {
        // Buscar la interacción
        const interaction = listInteractionsOnLine.find(interaction => 
            interaction.idInteraccionOnLine === idInteraction
        )

        if (!interaction) {
            return { success: false, message: "Interacción no encontrada" }
        }

        // Verificar que sea el turno del usuario
        if (interaction.event.turn !== idUser) {
            return { success: false, message: "No es tu turno" }
        }


        const now = Date.now()
        const isHost = interaction.idUserHost === idUser

        // Calcular daño al rival
        if (isHost) {
            // El host atacó al guest
            interaction.event.gameData.currentLifeGest -= hits
        } else {
            // El guest atacó al host  
            interaction.event.gameData.currentLifeHost -= hits
        }

        // Añadir al historial
        interaction.event.gameData.history.push({
            player: isHost ? 'host' : 'guest',
            damage: hits,
            round: interaction.event.round
        })

        // Actualizar timestamp
        interaction.lastEdited = now

        // Verificar si alguien ha muerto
        const hostLife = interaction.event.gameData.currentLifeHost
        const gestLife = interaction.event.gameData.currentLifeGest

        if (hostLife <= 0 || gestLife <= 0) {
            // Alguien ha perdido, terminar el juego
            const winner = hostLife > 0 ? interaction.idUserHost : interaction.idUserGest
            const loser = hostLife > 0 ? interaction.idUserGest : interaction.idUserHost
            const loserInvestigator = hostLife > 0 ? interaction.event.invDataGest : interaction.event.invDataHost

            // Actualizar estado final
            interaction.status = "finished"
            interaction.event.winner = winner
            interaction.event.status = "finished"

            // Generar recompensa aleatoria
            const reward = this._generateRandomReward(loserInvestigator)

            this._saveAll()

            console.log(`🏆 Juego terminado - Ganador: ${winner}, Perdedor: ${loser}`)

            return {
                success: true,
                status: "you win",
                reward: reward
            }

        } else {
            // Ambos siguen vivos, cambiar turno
            interaction.event.turn = isHost ? interaction.idUserGest : interaction.idUserHost
            
            // incrementar el round
            interaction.event.round += 1

            this._saveAll()

            return {
                success: true,
                status: "continue",
                interaction: interaction
            }
        }
    }
}