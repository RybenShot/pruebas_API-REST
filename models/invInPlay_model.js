import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'

const InvInPlay = mongoose.model('InvInPlay', new mongoose.Schema({
    idUser:               { type: String, required: true, unique: true },
    investigadoresOnLine: [mongoose.Schema.Types.Mixed]
}))

export class InvInPlayModel {

    static async getInvOnLineById({ id }) {
        const docs = await InvInPlay.find({})
        for (const doc of docs) {
            const inv = doc.investigadoresOnLine.find(inv => inv.id === id)
            if (inv) return inv
        }
        return null
    }

    static async getAllInvOnLineByUser({ id }) {
        const doc = await InvInPlay.findOne({ idUser: id })
        if (!doc || doc.investigadoresOnLine.length === 0) return null
        return doc.investigadoresOnLine
    }

    static async createOrUpdateInvOnLine({ investigadorData }) {
        let { id, idUser } = investigadorData

        if (!id) {
            id = randomUUID()
            investigadorData.id = id
        }

        let doc = await InvInPlay.findOne({ idUser })
        if (!doc) {
            doc = await InvInPlay.create({ idUser, investigadoresOnLine: [] })
        }

        const existingIndex = doc.investigadoresOnLine.findIndex(inv => inv.id === id)
        investigadorData.lastUpdated = Date.now()

        if (existingIndex !== -1) {
            doc.investigadoresOnLine[existingIndex] = investigadorData
        } else {
            if (doc.investigadoresOnLine.length >= 10) throw new Error('LIMIT_EXCEEDED')
            doc.investigadoresOnLine.push(investigadorData)
        }

        doc.markModified('investigadoresOnLine')
        await doc.save()
        return investigadorData
    }

    static async deleteInvOnLine({ id, idUser }) {
        const doc = await InvInPlay.findOne({ idUser })
        if (!doc) return false

        const invIndex = doc.investigadoresOnLine.findIndex(inv => inv.id === id)
        if (invIndex === -1) return false

        doc.investigadoresOnLine.splice(invIndex, 1)
        doc.markModified('investigadoresOnLine')
        await doc.save()
        return true
    }
}