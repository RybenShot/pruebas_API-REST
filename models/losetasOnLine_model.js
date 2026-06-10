import mongoose from 'mongoose'
import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }

const UserInZone = mongoose.model('UserInZone', new mongoose.Schema({
    idZone:      mongoose.Schema.Types.Mixed,
    idUser:      String,
    invData:     mongoose.Schema.Types.Mixed,
    available:   { type: Boolean, default: true },
    lastEddited: Number
}))

const FIFTEEN_MINUTES = 15 * 60 * 1000

export class losetasOnLineModel {

    static _getZoneMeta(idZone) {
        return listLosetasOnLine.find(z => z.idZone == idZone)
    }

    static async _removeInactiveUsers() {
        const cutoff = Date.now() - FIFTEEN_MINUTES
        await UserInZone.deleteMany({ lastEddited: { $lt: cutoff } })
    }

    static async getAllUsersOnLine() {
        await this._removeInactiveUsers()
        const total = await UserInZone.countDocuments()
        console.log(`📊 Total usuarios online: ${total}`)
        return total
    }

    static async getUsersInZone({ idZone }) {
        await this._removeInactiveUsers()

        const zoneMeta = this._getZoneMeta(idZone)
        if (!zoneMeta) return null

        const users = await UserInZone.find({ idZone })

        return {
            idZone: zoneMeta.idZone,
            nameZone: zoneMeta.nameZone,
            userCount: users.length,
            users,
            specialEvent: zoneMeta.specialEvent
        }
    }

    static async getRandomUserInZone({ idZone }, idUser) {
        await this._removeInactiveUsers()

        const zoneMeta = this._getZoneMeta(idZone)
        if (!zoneMeta) return null

        const users = await UserInZone.find({
            idZone,
            available: { $ne: false },
            idUser: { $ne: String(idUser) }
        })

        if (users.length === 0) return null

        const randomUser = users[Math.floor(Math.random() * users.length)]

        return {
            user: randomUser,
            zone: { idZone: zoneMeta.idZone, nameZone: zoneMeta.nameZone },
            totalUsersInZone: users.length
        }
    }

    static async addOrUpdateUserInZone({ idZone, idUser, invData, available = true }) {
        const zoneMeta = this._getZoneMeta(idZone)
        if (!zoneMeta) throw new Error('ZONE_NOT_FOUND')

        // sacar al usuario de cualquier zona donde esté
        await UserInZone.deleteMany({ idUser })

        // añadirlo a la nueva zona
        await UserInZone.create({
            idZone,
            idUser,
            invData: invData || [],
            available,
            lastEddited: Date.now()
        })

        console.log(`➕ Usuario ${idUser} agregado a zona ${zoneMeta.nameZone}`)
        return true
    }
}