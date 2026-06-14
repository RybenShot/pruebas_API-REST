import invListJSON from '../databaseJSON/investigadores.json' with { type: "json" }
import previewInvListJSON from '../databaseJSON/previewInv.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'
import { ObjectModel } from '../models/object_model.js';
import mongoose from 'mongoose'

const InvVotes = mongoose.model('InvVotes', new mongoose.Schema({
    idInv:     { type: Number, required: true, unique: true },
    extraData: mongoose.Schema.Types.Mixed,
    votes:     [mongoose.Schema.Types.Mixed],
    comments:  [mongoose.Schema.Types.Mixed]
}))

async function getOrCreate(idInv) {
    const id = Number(idInv)
    let doc = await InvVotes.findOne({ idInv: id })
    if (!doc) {
        const invJSON = invListJSON.find(inv => inv.idInv == id)
        doc = await InvVotes.create({
            idInv: id,
            extraData: invJSON?.extraData || { likes: 0, dislikes: 0, NVotesLikeDislike: 0 },
            votes: [],
            comments: []
        })
    }
    return doc
}

export class InvModel {

    static async getAll({ archetype }) {
        if (archetype) {
            return invListJSON.filter(
                inv => inv.arquetipos.some(
                    tipo => tipo.toLowerCase() === archetype.toLowerCase()
                )
            )
        }
        return invListJSON
    }

    static async getAllPreview({ rol }) {
        const activos = previewInvListJSON.filter(inv => inv.isActive)
        if (rol) {
            return activos.filter(
                previewInv => previewInv.rol.some(
                    tipo => tipo.toLowerCase() === rol.toLowerCase()
                )
            )
        }
        return activos
    }

    static async getInvObjects({ id }) {
        const inv = invListJSON.find(inv => inv.idInv == id)
        if (!inv || !inv.possessions) {
            return { objects: [], optionalText: '', optionalObjects: [] }
        }
        const { required = [], optional = [], optionalText = '' } = inv.possessions
        const objects = await Promise.all(required.map(id => ObjectModel.getObjectByID({ id })))
        const optionalObjects = await Promise.all(optional.map(id => ObjectModel.getObjectByID({ id })))
        return { objects, optionalText, optionalObjects }
    }

    static async getByID({ id }) {
        return invListJSON.find(inv => inv.idInv == id)
    }

    // ── LIKES / DISLIKES ──────────────────────────────────────────────

    static async getLikeDislike(idInv) {
        const doc = await getOrCreate(idInv)
        return {
            likes: doc.extraData.likes,
            dislikes: doc.extraData.dislikes,
            NVotesLikeDislike: doc.extraData.NVotesLikeDislike
        }
    }

    static async likeDislike({ idInv, idUser, value }) {
        const doc = await getOrCreate(idInv)

        doc.extraData = doc.extraData || { likes: 0, dislikes: 0, NVotesLikeDislike: 0 }
        doc.extraData.likes             = doc.extraData.likes             || 0
        doc.extraData.dislikes          = doc.extraData.dislikes          || 0
        doc.extraData.NVotesLikeDislike = doc.extraData.NVotesLikeDislike || 0

        const now = Date.now()
        const prev = doc.votes.find(v => v.idUser == idUser && v.type === 'likeDislike')

        if (prev) {
            if (prev.value === value) return doc
            if (prev.value === 1) doc.extraData.likes--
            else doc.extraData.dislikes--
            prev.value = value
            prev.dateCreated = now
        } else {
            doc.votes.push({ idUser, type: 'likeDislike', value, dateCreated: now })
            doc.extraData.NVotesLikeDislike++
        }

        if (value === 1) doc.extraData.likes++
        else if (value === -1) doc.extraData.dislikes++

        doc.markModified('extraData')
        doc.markModified('votes')
        await doc.save()
        return doc
    }

    // ── COMENTARIOS ───────────────────────────────────────────────────

    static async getComments(idInv) {
        const doc = await getOrCreate(idInv)
        return doc.comments
    }

    static async postComment({ idInv, idUser, nameUser, comment }) {
        if (typeof idInv !== 'number' || typeof idUser !== 'string' || typeof comment !== 'string') {
            console.error('❌ model - postComment. Tipos de datos incorrectos:', { idInv, idUser, comment })
            return false
        }

        const doc = await getOrCreate(idInv)
        const existing = doc.comments.find(c => c.idUser == idUser)

        if (existing) {
            existing.comment = comment
            existing.nameUser = nameUser
            existing.dateCreated = Date.now()
        } else {
            doc.comments.push({ idUser, nameUser, comment, dateCreated: Date.now() })
        }

        doc.markModified('comments')
        await doc.save()
        return existing || doc.comments[doc.comments.length - 1]
    }

    // ── ADMIN (no usados en producción, mantienen JSON) ───────────────

    static async createInv({ input }) {
        const newInv = { id: randomUUID(), ...input }
        invListJSON.push(newInv)
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))
        return newInv
    }

    static async deleteInv({ id }) {
        const invIndex = invListJSON.findIndex(inv => inv.id == id)
        if (invIndex === -1) return false
        invListJSON.splice(invIndex, 1)
        writeFileSync('./databaseJSON/investigadores.json', JSON.stringify(invListJSON, null, 2))
        return true
    }

    static async updateInv({ id, input }) {
        const invIndex = invListJSON.findIndex(inv => inv.id == id)
        if (invIndex === -1) return false
        const invUpdated = { ...invListJSON[invIndex], ...input }
        invListJSON[invIndex] = invUpdated
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))
        return invUpdated
    }
}