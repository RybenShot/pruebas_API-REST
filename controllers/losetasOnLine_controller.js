import { losetasOnLineModel } from '../models/losetasOnLine_model.js'
import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }

export class losetasOnLineController {

    static async getAllDataLosetas(req, res) {
        try {
            res.json(listLosetasOnLine)
        } catch (error) {
            console.error('❌ getAllDataLosetas error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getAllUsersOnLine(req, res) {
        try {
            const totalUsers = await losetasOnLineModel.getAllUsersOnLine()  // ← await
            res.json({
                totalUsersOnline: totalUsers,
                message: `Hay ${totalUsers} investigadores conectados`
            })
        } catch (error) {
            console.error('❌ getAllUsersOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getAllUsers1ZoneOnLine(req, res) {
        try {
            const { id } = req.params
            const zoneData = await losetasOnLineModel.getUsersInZone({ idZone: id })  // ← await
            if (!zoneData) return res.status(404).json({ message: `Zona con ID ${id} no encontrada` })
            res.json(zoneData)
        } catch (error) {
            console.error('❌ getAllUsers1ZoneOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getRandomUserInZone(req, res) {
        try {
            const { id, idUser } = req.params
            const randomUserData = await losetasOnLineModel.getRandomUserInZone({ idZone: id }, idUser)  // ← await
            if (!randomUserData) return res.status(200).json({ user: null, message: "No hay usuarios disponibles en esta zona" })
            res.json(randomUserData)
        } catch (error) {
            console.error('❌ getRandomUserInZone error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async postUserInZone(req, res) {
        try {
            const { idZone, idUser, invData, available } = req.body
            if (!idZone || !idUser) return res.status(400).json({ message: 'Faltan datos requeridos: idZone e idUser son obligatorios' })

            const result = await losetasOnLineModel.addOrUpdateUserInZone({ idZone, idUser, invData, available })  // ← await

            if (result === true) {
                res.status(201).json({ message: 'OK' })
            } else {
                res.status(500).json({ message: 'Algo ha salido mal' })
            }
        } catch (error) {
            console.error('❌ postUserInZone error :', error);
            if (error.message === 'ZONE_NOT_FOUND') return res.status(404).json({ message: 'Zona no encontrada' })
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}