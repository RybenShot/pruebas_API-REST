import mongoose from 'mongoose'

const Achievements = mongoose.model('Achievements', new mongoose.Schema({
    idUser:   { type: String, required: true, unique: true },
    coins:    { type: Number, default: 0 }, // monedas ganadas al reclamar recompensas de logros
    unlocked: [{
        id:         { type: String, required: true }, // debe coincidir con un id del catálogo del frontend
        unlockedAt: { type: Number, required: true },
        claimed:    { type: Boolean, default: false },
        claimedAt:  { type: Number, default: null }
    }]
}))

export class AchievementsModel {

    static async getByUser({ idUser }) {
        const doc = await Achievements.findOne({ idUser })
        return doc ? { unlocked: doc.unlocked, coins: doc.coins } : { unlocked: [], coins: 0 }
    }

    // Idempotente: si ya estaba desbloqueado, no lo duplica y devuelve la lista tal cual.
    static async unlock({ idUser, achievementId }) {
        if (typeof idUser !== 'string' || !idUser) throw new Error('INVALID_USER')
        if (typeof achievementId !== 'string' || !achievementId) throw new Error('INVALID_ACHIEVEMENT')

        let doc = await Achievements.findOne({ idUser })
        if (!doc) {
            doc = await Achievements.create({ idUser, unlocked: [], coins: 0 })
        }

        const yaDesbloqueado = doc.unlocked.some(a => a.id === achievementId)
        if (!yaDesbloqueado) {
            doc.unlocked.push({ id: achievementId, unlockedAt: Date.now(), claimed: false, claimedAt: null })
            doc.markModified('unlocked')
            await doc.save()
        }

        return { unlocked: doc.unlocked, coins: doc.coins }
    }

    // Reclama la recompensa en monedas de un logro ya desbloqueado (una sola vez).
    static async claim({ idUser, achievementId, coins }) {
        if (typeof idUser !== 'string' || !idUser) throw new Error('INVALID_USER')
        if (typeof achievementId !== 'string' || !achievementId) throw new Error('INVALID_ACHIEVEMENT')

        const doc = await Achievements.findOne({ idUser })
        const logro = doc?.unlocked.find(a => a.id === achievementId)
        if (!logro) throw new Error('ACHIEVEMENT_NOT_UNLOCKED')
        if (logro.claimed) throw new Error('ACHIEVEMENT_ALREADY_CLAIMED')

        logro.claimed = true
        logro.claimedAt = Date.now()
        doc.coins += Number(coins) || 0
        doc.markModified('unlocked')
        await doc.save()

        return { unlocked: doc.unlocked, coins: doc.coins }
    }
}
