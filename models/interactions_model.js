import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'

const Interaction = mongoose.model('Interaction', new mongoose.Schema({
    idInteraccionOnLine: { type: String, required: true, unique: true },
    idLocationMap:       mongoose.Schema.Types.Mixed,
    idUserHost:          String,
    nameUserHost:        String,
    idUserGest:          String,
    nameUserGest:        String,
    status:              { type: String, default: 'pending' },
    isActive:            { type: Boolean, default: true },
    created:             Number,
    lastEdited:          Number,
    event:               mongoose.Schema.Types.Mixed
}))

export class InteractionsModel {

    static async getAll() {
        return await Interaction.find({})
    }

    static _generateRandomReward(loserInvestigator) {
        const rewardTypes = ['clue', 'remnant', 'money']
        const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)]
        switch (randomType) {
            case 'clue':    return { type: 'clue', amount: 1, description: '1 pista ganada' }
            case 'remnant': return { type: 'remnant', amount: 2, description: '2 restos ganados' }
            case 'money':   return { type: 'money', amount: 3, description: '3 dinero ganado' }
            default:        return { type: 'money', amount: 3, description: '3 dinero ganado (default)' }
        }
    }

    static async getPendingInvitations({ idUser }) {
        const pending = await Interaction.findOne({ idUserGest: idUser, status: 'pending' })
        return pending || null
    }

    static async pollHostInteraction({ idInteraction, idUser }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return "no existe esta interaccion"
        if (!['pending', 'accepted', 'rejected'].includes(interaction.status)) return "el estado de esta interaccion esta rechazada, expirado o finalizado"
        if (interaction.idUserHost !== idUser && interaction.idUserGest !== idUser) return "no estas autorizado para ver esta informacion"
        return interaction
    }

    static async createInteraction({ idUserHost, nameUserHost, idUserGuest, nameUserGest, invData, type, idLocationMap }) {

        const now = Date.now()
        const newInteraction = await Interaction.create({
            idInteraccionOnLine: randomUUID(),
            idLocationMap,
            idUserHost,
            nameUserHost: nameUserHost || 'Anfitrión',
            idUserGest: idUserGuest,
            nameUserGest: nameUserGest || 'Invitado',
            status: 'pending',
            isActive: true,
            created: now,
            lastEdited: now,
            event: { type, invDataHost: invData || null, invDataGest: null, turn: null }
        })

        console.log(`✅ Nueva interacción creada: ${newInteraction.idInteraccionOnLine} (${type})`)
        return newInteraction
    }

    static async eventDimensionalMirror(interaction) {
        interaction.status = 'finished'
        interaction.lastEdited = Date.now()
        interaction.event = { ...interaction.event, type: 'dimensionalMirror' }
        interaction.markModified('event')
        await interaction.save()
        console.log(` 𖥠𖥠 Espejo Dimensional 𖥠𖥠 `)
        return { success: true, message: 'Espejo Dimensional', interaction }
    }

    static startEventOnLine(interaction) {
        if (interaction.event.type === 'fight') {
            const hostLife = interaction.event.invDataHost.atributes.life
            const gestLife = interaction.event.invDataGest.atributes.life
            interaction.event = {
                ...interaction.event,
                round: 0,
                gameData: {
                    currentLifeHost: hostLife, currentLifeGest: gestLife,
                    maxLifeHost: hostLife, maxLifeGest: gestLife,
                    initialRollHost: null, initialRollGest: null,
                    bothRolled: false, history: []
                },
                winner: null,
                status: 'waitingInitialRoll'
            }
            console.log(`🎮 Juego de pelea inicializado: ${interaction.idInteraccionOnLine}`)
        } else if (interaction.event.type === 'trade') {
            interaction.event = {
                ...interaction.event,
                tradeData: {
                    status: 'waitingOffer',
                    offer: null,
                    counteroffer: null,
                    result: null,
                    finalDeal: null
                }
            }
            console.log('🔄 Intercambio inicializado:', interaction.idInteraccionOnLine)
        } else if (interaction.event.type === 'resonance') {
            interaction.event = {
                ...interaction.event,
                resonanceData: {
                status: 'waiting',
                host: { bet: null, roll: null, ready: false },
                guest: { bet: null, roll: null, ready: false },
                result: null,
                portalTurns: 0
                }
            }
            interaction.markModified('event')
            console.log('✨ Resonancia inicializada:', interaction.idInteraccionOnLine)
        } else {
            console.warn(`⚠️ Tipo de evento desconocido: ${interaction.event.type}`)
            return null
        }
        return interaction
    }

    static async respondToInvitation({ idInteraction, idUser, nameUser, response, invData }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserGest !== idUser) return { success: false, message: 'No tienes autorización para responder esta invitación' }
        if (interaction.status !== 'pending') return { success: false, message: `Esta invitación ya no está disponible porque ya ha sido respondida con ${interaction.status}` }

        if (interaction.event.invDataHost.idInv === invData.idInv) {
            return this.eventDimensionalMirror(interaction)
        }

        const now = Date.now()

        if (response === 'accepted') {
            interaction.status = 'accepted'
            interaction.lastEdited = now
            interaction.nameUserGest = nameUser || 'Invitado'
            interaction.event = { ...interaction.event, invDataGest: invData || null }
            this.startEventOnLine(interaction)
            interaction.markModified('event')
            await interaction.save()
            console.log(`✅ Invitación aceptada: ${idInteraction}`)
            return { success: true, message: 'Invitación aceptada', interaction }

        } else if (response === 'rejected') {
            interaction.status = 'rejected'
            interaction.lastEdited = now
            await interaction.save()
            console.log(`❌ Invitación rechazada: ${idInteraction}`)
            return { success: true, message: 'Invitación rechazada', interaction }

        } else if (response === 'timeout') {
            interaction.status = 'timeout'
            interaction.lastEdited = now
            await interaction.save()
            console.log(`❌ Invitación cerrada por tiempo excedido: ${idInteraction}`)
            return { success: true, message: 'Tiempo excedido', interaction }

        } else {
            return { success: false, message: "Respuesta no válida. Use 'accepted' o 'rejected'" }
        }
    }

    static async initialRoll({ idInteraction, idUser, diceResult }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }

        if (interaction.idUserHost === idUser) {
            if (interaction.event.gameData.initialRollHost !== null) return { success: false, message: 'Ya has realizado tu tirada inicial' }
            interaction.event.gameData.initialRollHost = diceResult
        } else {
            if (interaction.event.gameData.initialRollGest !== null) return { success: false, message: 'Ya has realizado tu tirada inicial' }
            interaction.event.gameData.initialRollGest = diceResult
        }

        interaction.lastEdited = Date.now()
        const hostRoll = interaction.event.gameData.initialRollHost
        const gestRoll = interaction.event.gameData.initialRollGest

        if (hostRoll != null && gestRoll != null) {
            const start = hostRoll >= gestRoll ? interaction.idUserHost : interaction.idUserGest
            interaction.event.turn = start
            interaction.event.gameData.bothRolled = true
            interaction.event.status = 'playing'
            interaction.event.round = 1
            console.log(`🎲 Tiradas completas - Host: ${hostRoll}, Guest: ${gestRoll}, Comienza: ${start}`)
        }

        interaction.markModified('event')
        await interaction.save()
        return { success: true, message: 'Tirada registrada correctamente' }
    }

    static async checkMyTurn({ idInteraction, idUser }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }

        if (interaction.status === 'finished' && interaction.event.winner) {
            return { 
                status: interaction.event.winner === idUser ? 'you won' : 'you lost',
                reward: interaction.event.reward || null
            }
        }
        if (interaction.status === 'abandoned') return { 
            status: 'your_rival_abandoned',
            reward: interaction.event.reward || null
        }
        if (interaction.status === 'timeout') return { status: 'your rival has closed the game' }
        if (interaction.event.status === 'playing') {
            return interaction.event.turn === idUser ? { status: 'your turn', interaction } : { status: 'not your' }
        }
        if (interaction.event.status === 'waitingInitialRoll') return { status: 'waiting_initial_roll' }
        return { status: 'false' }
    }

    static async getGameState({ idInteraction, idUser }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserHost !== idUser && interaction.idUserGest !== idUser) {
            return { success: false, message: 'No tienes autorización para ver esta interacción' }
        }
        return { success: true, interaction }
    }

    static async sendHits({ idInteraction, idUser, hits }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.event.turn !== idUser) return { success: false, message: 'No es tu turno' }

        const isHost = interaction.idUserHost === idUser
        if (isHost) interaction.event.gameData.currentLifeGest -= hits
        else interaction.event.gameData.currentLifeHost -= hits

        interaction.event.gameData.history.push({
            player: isHost ? 'host' : 'guest',
            damage: hits,
            round: interaction.event.round
        })
        interaction.lastEdited = Date.now()

        const hostLife = interaction.event.gameData.currentLifeHost
        const gestLife = interaction.event.gameData.currentLifeGest

        if (hostLife <= 0 || gestLife <= 0) {
            const winner = hostLife > 0 ? interaction.idUserHost : interaction.idUserGest
            const loserInv = hostLife > 0 ? interaction.event.invDataGest : interaction.event.invDataHost
            interaction.status = 'finished'
            interaction.event.winner = winner
            interaction.event.status = 'finished'
            const reward = this._generateRandomReward(loserInv)
            interaction.event.reward = reward
            interaction.markModified('event')
            await interaction.save()
            console.log(`🏆 Juego terminado - Ganador: ${winner}`)
            return { success: true, status: 'you win', reward }
        } else {
            interaction.event.turn = isHost ? interaction.idUserGest : interaction.idUserHost
            interaction.event.round += 1
            interaction.markModified('event')
            await interaction.save()
            return { success: true, message: 'continue' }
        }
    }

    static async abandonEncounter({ idInteraction, idUser }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserHost !== idUser && interaction.idUserGest !== idUser) {
            return { success: false, message: 'No tienes autorización para abandonar esta interacción' }
        }
        const loserInv = interaction.idUserHost === idUser ? interaction.event.invDataHost : interaction.event.invDataGest
        const reward = this._generateRandomReward(loserInv)
        interaction.status = 'abandoned'
        interaction.lastEdited = Date.now()
        interaction.event.winner = interaction.idUserHost === idUser ? interaction.idUserGest : interaction.idUserHost
        interaction.event.reward = reward
        interaction.markModified('event')
        await interaction.save()
        console.log(`🏳️ Interacción abandonada por: ${idUser}`)
        return { success: true, message: 'Has abandonado la interacción', interaction }
    }

    static async sendTradeOffer({ idInteraction, idUser, fromHost, fromGuest }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserHost !== idUser) return { success: false, message: 'Solo el anfitrión puede enviar la oferta' }
        if (interaction.event.tradeData.status !== 'waitingOffer') return { success: false, message: 'Ya se ha enviado una oferta' }

        interaction.event.tradeData.status = 'offerPending'
        interaction.event.tradeData.offer = { fromHost, fromGuest }
        interaction.lastEdited = Date.now()
        interaction.markModified('event')
        await interaction.save()
        console.log(`📤 Oferta de intercambio enviada: ${idInteraction}`)
        return { success: true, message: 'Oferta enviada' }
    }

    static async guestRespondToOffer({ idInteraction, idUser, response, counterFromHost, counterFromGuest }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserGest !== idUser) return { success: false, message: 'Solo el invitado puede responder' }
        if (interaction.event.tradeData.status !== 'offerPending') return { success: false, message: 'No hay oferta pendiente' }

        const now = Date.now()
        if (response === 'accepted') {
            const deal = interaction.event.tradeData.offer
            interaction.event.tradeData.status = 'finished'
            interaction.event.tradeData.result = 'accepted'
            interaction.event.tradeData.finalDeal = deal
            interaction.status = 'finished'
            interaction.lastEdited = now
            interaction.markModified('event')
            await interaction.save()
            console.log(`✅ Intercambio aceptado por guest: ${idInteraction}`)
            return { success: true, message: 'Intercambio aceptado' }
        } else if (response === 'counteroffer') {
            interaction.event.tradeData.status = 'counterofferPending'
            interaction.event.tradeData.counteroffer = { fromHost: counterFromHost, fromGuest: counterFromGuest }
            interaction.lastEdited = now
            interaction.markModified('event')
            await interaction.save()
            console.log(`🔄 Contraoferta enviada: ${idInteraction}`)
            return { success: true, message: 'Contraoferta enviada' }
        } else {
            return { success: false, message: "Respuesta no válida. Use 'accepted' o 'counteroffer'" }
        }
    }

    static async hostResolveCounteroffer({ idInteraction, idUser, response }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserHost !== idUser) return { success: false, message: 'Solo el anfitrión puede resolver la contraoferta' }
        if (interaction.event.tradeData.status !== 'counterofferPending') return { success: false, message: 'No hay contraoferta pendiente' }

        const now = Date.now()
        if (response === 'accepted') {
            const deal = interaction.event.tradeData.counteroffer
            interaction.event.tradeData.status = 'finished'
            interaction.event.tradeData.result = 'accepted'
            interaction.event.tradeData.finalDeal = deal
            interaction.status = 'finished'
            interaction.lastEdited = now
            interaction.markModified('event')
            await interaction.save()
            console.log(`✅ Contraoferta aceptada por host: ${idInteraction}`)
            return { success: true, message: 'Contraoferta aceptada' }
        } else if (response === 'rejected') {
            interaction.event.tradeData.status = 'cancelled'
            interaction.event.tradeData.result = 'rejected'
            interaction.status = 'finished'
            interaction.lastEdited = now
            interaction.markModified('event')
            await interaction.save()
            console.log(`❌ Contraoferta rechazada por host: ${idInteraction}`)
            return { success: true, message: 'Contraoferta rechazada' }
        } else {
            return { success: false, message: "Respuesta no válida. Use 'accepted' o 'rejected'" }
        }
    }

    static async cancelTrade({ idInteraction, idUser }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }
        if (interaction.idUserHost !== idUser && interaction.idUserGest !== idUser) {
            return { success: false, message: 'No tienes autorización' }
        }
        if (interaction.status === 'finished') return { success: false, message: 'La interacción ya ha finalizado' }

        interaction.event.tradeData.status = 'cancelled'
        interaction.event.tradeData.result = 'cancelled'
        interaction.status = 'finished'
        interaction.lastEdited = Date.now()
        interaction.markModified('event')
        await interaction.save()
        console.log(`🚫 Intercambio cancelado por: ${idUser}`)
        return { success: true, message: 'Intercambio cancelado' }
    }

    static async submitResonance({ idInteraction, idUser, bet, successes, dice }) {
        const interaction = await Interaction.findOne({ idInteraccionOnLine: idInteraction })
        if (!interaction) return { success: false, message: 'Interacción no encontrada' }

        const rd = interaction.event.resonanceData
        if (!rd) return { success: false, message: 'No hay datos de resonancia' }
        if (rd.status === 'finished') return { success: false, message: 'El ritual ya ha finalizado' }

        const isHost = interaction.idUserHost === idUser
        const playerKey = isHost ? 'host' : 'guest'

        if (rd[playerKey].ready) return { success: false, message: 'Ya has activado tu parte del ritual' }

        rd[playerKey] = {
            bet: bet || 0,
            roll: { dice: dice || [], successes: successes || 0 },
            ready: true
        }

        const otherKey = isHost ? 'guest' : 'host'
        if (rd[otherKey].ready) {
            const bothSucceed = rd.host.roll.successes >= 1 && rd.guest.roll.successes >= 1
            const totalBet = (rd.host.bet || 0) + (rd.guest.bet || 0)
            rd.result = bothSucceed ? 'success' : 'failure'
            rd.portalTurns = bothSucceed ? totalBet * 2 : 0
            rd.status = 'finished'
            interaction.status = 'finished'
            console.log(`✨ Resonancia finalizada: ${rd.result} | portal: ${rd.portalTurns} turnos`)
        }

        interaction.event.resonanceData = rd
        interaction.markModified('event.resonanceData')
        interaction.lastEdited = Date.now()
        await interaction.save()

        return { success: true, resonanceData: rd }
    }
}