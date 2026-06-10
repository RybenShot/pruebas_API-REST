import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'
import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }

const LosetaOnLine = mongoose.model('LosetaOnLine', new mongoose.Schema({
    idZone:       mongoose.Schema.Types.Mixed,
    nameZone:     String,
    specialEvent: mongoose.Schema.Types.Mixed,
    invOnLine:    [mongoose.Schema.Types.Mixed]
}))

const FIFTEEN_MINUTES = 15 * 60 * 1000

export class losetasOnLineModel {

    static async _ensureZonesExist() {
        const count = await LosetaOnLine.countDocuments()
        if (count === 0) {
            const zones = listLosetasOnLine.map(z => ({
                idZone: z.idZone,
                nameZone: z.nameZone,
                specialEvent: z.specialEvent || null,
                invOnLine: []
            }))
            await LosetaOnLine.insertMany(zones)
            console.log('🌱 Zonas inicializadas en MongoDB')
        }
    }

    static async _removeInactiveUsers() {
        const cutoff = Date.now() - FIFTEEN_MINUTES
        await LosetaOnLine.updateMany(
            {},
            { $pull: { invOnLine: { idUser: { $exists: true }, lastEddited: { $lt: cutoff } } } }
        )
    }

    static async _removeUserFromMap(idUser) {
        await LosetaOnLine.updateMany(
            {},
            { $pull: { invOnLine: { idUser: idUser } } }
        )
    }

    static async getAllUsersOnLine() {
        await this._ensureZonesExist()
        await this._removeInactiveUsers()

        const zones = await LosetaOnLine.find({})
        let total = 0
        zones.forEach(zone => {
            total += zone.invOnLine.filter(u => u.idUser).length
        })

        console.log(`📊 Total usuarios online: ${total}`)
        return total
    }

    static async getUsersInZone({ idZone }) {
        await this._ensureZonesExist()
        await this._removeInactiveUsers()

        const zone = await LosetaOnLine.findOne({ idZone })
        if (!zone) return null

        const activeUsers = zone.invOnLine.filter(u => u.idUser)

        return {
            idZone: zone.idZone,
            nameZone: zone.nameZone,
            userCount: activeUsers.length,
            users: activeUsers,
            specialEvent: zone.specialEvent
        }
    }

    static async getRandomUserInZone({ idZone }, idUser) {
        await this._ensureZonesExist()
        await this._removeInactiveUsers()

        const zone = await LosetaOnLine.findOne({ idZone })
        if (!zone) return null

        const availableUsers = zone.invOnLine.filter(u =>
            u.idUser && u.available !== false && u.idUser != idUser
        )

        if (availableUsers.length === 0) return null

        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)]

        return {
            user: randomUser,
            zone: { idZone: zone.idZone, nameZone: zone.nameZone },
            totalUsersInZone: availableUsers.length
        }
    }

    static async addOrUpdateUserInZone({ idZone, idUser, invData, available = true }) {
        await this._ensureZonesExist()

        const targetZone = await LosetaOnLine.findOne({ idZone })
        if (!targetZone) throw new Error('ZONE_NOT_FOUND')

        // sacar al usuario de cualquier zona donde esté
        await this._removeUserFromMap(idUser)

        // añadirlo a la nueva zona
        const userData = {
            idUser,
            invData: invData || [],
            available,
            lastEddited: Date.now()
        }

        await LosetaOnLine.findOneAndUpdate(
            { idZone },
            { $push: { invOnLine: userData } }
        )

        console.log(`➕ Usuario ${idUser} agregado a zona ${targetZone.nameZone}`)
        return true
    }
}