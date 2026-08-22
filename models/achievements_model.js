import mongoose from 'mongoose'

const Achievements = mongoose.model('Achievements', new mongoose.Schema({
    idUser:   { type: String, required: true, unique: true },
    unlocked: [{
        id:         { type: String, required: true }, // debe coincidir con un id del catálogo del frontend
        unlockedAt: { type: Number, required: true }
    }]
}))

export class AchievementsModel {

    static async getByUser({ idUser }) {
        const doc = await Achievements.findOne({ idUser })
        return doc ? doc.unlocked : []
    }

    // Idempotente: si ya estaba desbloqueado, no lo duplica y devuelve la lista tal cual.
    static async unlock({ idUser, achievementId }) {
        if (typeof idUser !== 'string' || !idUser) throw new Error('INVALID_USER')
        if (typeof achievementId !== 'string' || !achievementId) throw new Error('INVALID_ACHIEVEMENT')

        let doc = await Achievements.findOne({ idUser })
        if (!doc) {
            doc = await Achievements.create({ idUser, unlocked: [] })
        }

        const yaDesbloqueado = doc.unlocked.some(a => a.id === achievementId)
        if (!yaDesbloqueado) {
            doc.unlocked.push({ id: achievementId, unlockedAt: Date.now() })
            doc.markModified('unlocked')
            await doc.save()
        }

        return doc.unlocked
    }
}
