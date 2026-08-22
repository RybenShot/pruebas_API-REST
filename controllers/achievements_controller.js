import { AchievementsModel } from '../models/achievements_model.js'

export class AchievementsController {

    static async getByUser(req, res) {
        try {
            const { idUser } = req.params
            const { unlocked, coins } = await AchievementsModel.getByUser({ idUser })
            res.json({ unlocked, coins })
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

            const { unlocked, coins } = await AchievementsModel.unlock({ idUser, achievementId })
            res.status(201).json({ message: 'Logro desbloqueado', unlocked, coins })
        } catch (error) {
            if (error.message === 'INVALID_USER' || error.message === 'INVALID_ACHIEVEMENT') {
                return res.status(400).json({ message: 'Datos inválidos' })
            }
            console.error('❌ unlock (achievements) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async claim(req, res) {
        try {
            const { idUser, achievementId, coins } = req.body
            if (!idUser || !achievementId) {
                return res.status(400).json({ message: 'Faltan datos requeridos: idUser y achievementId son obligatorios' })
            }

            const result = await AchievementsModel.claim({ idUser, achievementId, coins })
            res.json({ message: 'Recompensa reclamada', ...result })
        } catch (error) {
            if (error.message === 'INVALID_USER' || error.message === 'INVALID_ACHIEVEMENT') {
                return res.status(400).json({ message: 'Datos inválidos' })
            }
            if (error.message === 'ACHIEVEMENT_NOT_UNLOCKED' || error.message === 'ACHIEVEMENT_ALREADY_CLAIMED') {
                return res.status(409).json({ message: error.message })
            }
            console.error('❌ claim (achievements) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }
}
