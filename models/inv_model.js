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

async function getOrCreateInvVotes(idInv) {
    const numId = Number(idInv)
    let doc = await InvVotes.findOne({ idInv: numId })
    if (!doc) {
        const invJSON = invListJSON.find(i => i.idInv == numId)
        doc = await InvVotes.create({
            idInv: numId,
            extraData: invJSON?.extraData || { likes: 0, dislikes: 0, NVotesLikeDislike: 0 },
            votes: [], comments: []
        })
    }
    return doc
}

export class InvModel{

    static async getAll({archetype}){
        if (archetype) {
            const filterArchetype = invListJSON.filter(
                // cuando ajuste la base de datos debo cambiar este "arquetipos" por "archetypes"
                inv => inv.arquetipos.some(
                    tipo => tipo.toLowerCase() === archetype.toLowerCase()
                )
            )

            return filterArchetype
        }
        // si no se ha pasado arquetipo, devolvemos todos los investigadores
        return invListJSON
    }

    static async getAllPreview({ rol }){
        const activos = previewInvListJSON.filter(inv => inv.isActive);
        if (rol) {
            const filterRol = activos.filter (
                
                previewInv => previewInv.rol.some(
                    tipo => tipo.toLowerCase() === rol.toLowerCase()
                )
            )
            return filterRol
        }
        return activos
    }

    static async getInvObjects({ id }) {
        const inv = invListJSON.find(inv => inv.idInv == id);
        if (!inv || !inv.possessions) {
          return {
            objects: [],
            optionalText: '',
            optionalObjects: []
          };
        }
      
        const { required = [], optional = [], optionalText = '' } = inv.possessions;
      
        const objects = await Promise.all(
          required.map(id => ObjectModel.getObjectByID({ id }))
        );
      
        const optionalObjects = await Promise.all(
          optional.map(id => ObjectModel.getObjectByID({ id }))
        );
      
        return {
          objects,
          optionalText,
          optionalObjects
        };
    }

    static async getByID ({id}){
        const inv = invListJSON.find(inv => inv.idInv == id)
        return inv
    }

    // retornamos votacion de likes y dislikes de un investigador
    static async getLikeDislike(idInv) {
        const doc = await getOrCreateInvVotes(idInv)
        return {
            likes: doc.extraData.likes || 0,
            dislikes: doc.extraData.dislikes || 0,
            NVotesLikeDislike: doc.extraData.NVotesLikeDislike || 0
        }
    }

    // votacion de like dislike
    static async likeDislike({ idInv, idUser, value }) {
        const doc = await getOrCreateInvVotes(idInv)

        const prev = doc.votes.find(v => v.idUser == idUser && v.type === 'likeDislike')
        if (prev) {
            if (prev.value === value) return doc
            if (prev.value === 1) doc.extraData.likes--
            else doc.extraData.dislikes--
            prev.value = value
            prev.dateCreated = Date.now()
        } else {
            doc.votes.push({ idUser, type: 'likeDislike', value, dateCreated: Date.now() })
            doc.extraData.NVotesLikeDislike++
        }

        if (value === 1) doc.extraData.likes++
        else if (value === -1) doc.extraData.dislikes++

        doc.markModified('extraData')
        doc.markModified('votes')
        await doc.save()
        return doc
    }

    static async createInv({input}){
        const newInv = {
            id: randomUUID(),
            ...input
        }
    
        invListJSON.push(newInv)
    
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))

        return newInv
    }

        // get de los comentarios de un investigador
    static async getComments(idInv) {
        const doc = await getOrCreateInvVotes(idInv)
        return doc.comments
    }

    // post para comentario sobre un investigador
    static async postComment({ idInv, idUser, comment }) {
        if (typeof idInv !== 'number' || typeof idUser !== 'string' || typeof comment !== 'string') {
            console.error('❌ postComment - tipos incorrectos')
            return false
        }

        const doc = await getOrCreateInvVotes(idInv)
        const existing = doc.comments.find(c => c.idUser == idUser)

        if (existing) {
            existing.comment = comment
            existing.dateCreated = Date.now()
        } else {
            doc.comments.push({ idUser, comment, dateCreated: Date.now() })
        }

        doc.markModified('comments')
        await doc.save()
        return existing || doc.comments[doc.comments.length - 1]
    }

    static async deleteInv({id}){
        const invIndex = invListJSON.findIndex(inv => inv.id == id)

        // Si no se ha encontrado el investigador, devolvemos false
        if (invIndex === -1) return false

        // Eliminamos el investigador de la lista
        invListJSON.splice(invIndex, 1)

        // Guardamos la lista actualizada en el archivo
        writeFileSync('./listaInvestigadores.json', JSON.stringify(invListJSON, null, 2))
        
        //retornamos true para indicar que se ha eliminado correctamente
        return true
    }

    static async updateInv({id, input}){
        // buscamos el investigador por la id
        const invIndex = invListJSON.findIndex(inv => inv.id == id)

        // si no se ha encontrado el investigador, devolvemos false
        if (invIndex === -1) return false

        // cogemos el investigaor de la lista y lo actualizamos con los datos del body
        const invUpdated = {
            ...invListJSON[invIndex],
            ...input
        }

        // metemos al investigador actualizado de nuevo en la lista, machacando el anterior que habia
        invListJSON[invIndex] = invUpdated

        // Guardamos la lista actualizada en el archivo
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))
        return invUpdated
    }
}