import listInteractionsOnLine from '../databaseJSON/interactionsOnLine.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'

export class InteractionsModel {
    // método privado para guardar cambios en el JSON
    static _saveAll() {
        writeFileSync('./databaseJSON/interactionsOnLine.json', JSON.stringify(listInteractionsOnLine, null, 2))
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

    // Disparador de eventoOnLine
    startEventOnLine(interactionActual){
        if (interactionActual.event.type === "fight") {
            
        } else if (interactionActual.event.type === "trade") {
            
        } else if (interactionActual.event.type === "resonance") {
            
        } else {
            console.warn(`⚠️ Tipo de evento desconocido: ${interactionActual.event.type}`)
            return null
        }
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
            
            this._saveAll()
            console.log(`✅ Invitación aceptada: ${idInteraction}`)
            // comienza el evento que sea
            await startEventOnLine(listInteractionsOnLine[interactionIndex])
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
                invDataGest: {}, // se llenará cuando el invitado acepte
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


}