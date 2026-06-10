import mongoose from 'mongoose'
import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }

const UserOnline = mongoose.model('UserOnline', new mongoose.Schema({
    idUser:   { type: String, required: true, unique: true },
    idZone:   mongoose.Schema.Types.Mixed,
    invData:  mongoose.Schema.Types.Mixed,
    available: { type: Boolean, default: true },
    lastSeen: { type: Number, default: Date.now }
}))

const FIFTEEN_MINUTES = 15 * 60 * 1000
const activeCutoff = () => Date.now() - FIFTEEN_MINUTES

export class losetasOnLineModel {

    static async getAllUsersOnLine() {
        return await UserOnline.countDocuments({ lastSeen: { $gt: activeCutoff() } })
    }

    static async getUsersInZone({ idZone }) {
        const zoneMeta = listLosetasOnLine.find(z => z.idZone == idZone)
        if (!zoneMeta) return null

        const users = await UserOnline.find({ idZone, lastSeen: { $gt: activeCutoff() } })
        return {
            idZone: zoneMeta.idZone,
            nameZone: zoneMeta.nameZone,
            userCount: users.length,
            users,
            specialEvent: zoneMeta.specialEvent
        }
    }

    static async getRandomUserInZone({ idZone }, idUser) {
        const users = await UserOnline.find({
            idZone,
            idUser: { $ne: String(idUser) },
            available: { $ne: false },
            lastSeen: { $gt: activeCutoff() }
        })

        if (users.length === 0) return null

        const randomUser = users[Math.floor(Math.random() * users.length)]
        const zoneMeta = listLosetasOnLine.find(z => z.idZone == idZone)

        return {
            user: randomUser,
            zone: { idZone, nameZone: zoneMeta?.nameZone },
            totalUsersInZone: users.length
        }
    }

    static async addOrUpdateUserInZone({ idZone, idUser, invData, available = true }) {
        const zoneMeta = listLosetasOnLine.find(z => z.idZone == idZone)
        if (!zoneMeta) throw new Error('ZONE_NOT_FOUND')

        await UserOnline.findOneAndUpdate(
            { idUser: String(idUser) },
            { $set: { idZone, invData: invData || [], available, lastSeen: Date.now() } },
            { upsert: true, new: true }
        )

        return true
    }
}