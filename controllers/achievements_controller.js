import { AchievementsModel } from '../models/achievements_model.js'

export class AchievementsController {

    static async getByUser(req, res) {
        try {
            const { idUser } = req.params
            const unlocked = await AchievementsModel.getByUser({ idUser })
            res.json({ unlocked })
        } catch (error) {
            console.error('❌ getByUser (achievements) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async unlock(req, res) {
        try {
            const { idUser, achievementId } = req.body
            if (!idUser || !achievementId) {
                return res.status(400).json({ message: 'Faltan datos requeridos: idUser y achievementId son obligatorios' })
            }

            const unlocked = await AchievementsModel.unlock({ idUser, achievementId })
            res.status(201).json({ message: 'Logro desbloqueado', unlocked })
        } catch (error) {
            if (error.message === 'INVALID_USER' || error.message === 'INVALID_ACHIEVEMENT') {
                return res.status(400).json({ message: 'Datos inválidos' })
            }
            console.error('❌ unlock (achievements) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }
}
