import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }
import listPreviewMaps from '../databaseJSON/previewMaps.json' with { type: "json" }
import mongoose from 'mongoose'
import { EnemiesModel } from "./enemies_model.js"

const MapVotes = mongoose.model('MapVotes', new mongoose.Schema({
    idMap:     { type: Number, required: true, unique: true },
    extraData: mongoose.Schema.Types.Mixed,
    votes:     [mongoose.Schema.Types.Mixed],
    comments:  [mongoose.Schema.Types.Mixed],
    invRec:    [mongoose.Schema.Types.Mixed]
}))

async function getOrCreateMapVotes(idMap) {
    const numId = Number(idMap)
    let doc = await MapVotes.findOne({ idMap: numId })
    if (!doc) {
        const mapJSON = mapsListJSON.find(m => m.idMap == numId)
        doc = await MapVotes.create({
            idMap: numId,
            extraData: mapJSON?.extraData || {
                likes: 0, dislikes: 0, NVotesLikeDislike: 0,
                timeEstimated: 0, NVotestime: 0,
                difficulty: 0, NVotesDifficulty: 0
            },
            votes: [], comments: [], invRec: []
        })
    }
    return doc
}

export class MapModel {

    static async getAll({ expansion }) {
        if (expansion) {
            const filtered = mapsListJSON.filter(m => m.expansion.toLowerCase() === expansion.toLowerCase())
            return filtered.length === 0 ? { message: 'No se han encontrado mapas para la expansión solicitada' } : filtered
        }
        return mapsListJSON
    }

    static getPreviewMap() {
        return listPreviewMaps
    }

    static async getAllEnemies({ id }) {
        const map = mapsListJSON.find(m => m.idMap == id)
        if (!map) return []
        const { enemies = [], specialEnemies = [], textSpecialEnemies = "" } = map
        const EStextSpecialEnemies = map.translations.es.textSpecialEnemies
        const enemiesList = await Promise.all(enemies.map(id => EnemiesModel.getByID({ id })))
        const specialEnemiesList = await Promise.all(specialEnemies.map(id => EnemiesModel.getByID({ id })))
        return {
            enemies: enemiesList.filter(Boolean),
            specialEnemies: specialEnemiesList.filter(Boolean),
            textSpecialEnemies,
            EStextSpecialEnemies
        }
    }

    static async getByID({ id }) {
        return mapsListJSON.find(m => m.idMap == id)
    }

    static async getAllVotesMap() {
        return await MapVotes.find({})
    }

    // --- LIKES / DISLIKES ---

    static async getLikeDislike(idMap) {
        const doc = await getOrCreateMapVotes(idMap)
        return {
            likes: doc.extraData.likes || 0,
            dislikes: doc.extraData.dislikes || 0,
            NVotesLikeDislike: doc.extraData.NVotesLikeDislike || 0
        }
    }

    static async postLikeDislike({ idMap, idUser, value }) {
        const doc = await getOrCreateMapVotes(idMap)

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

    // --- TIEMPO ESTIMADO ---

    static async getTimeEstimated(idMap) {
        const doc = await getOrCreateMapVotes(idMap)
        return {
            timeEstimated: doc.extraData.timeEstimated || 0,
            NVotestime: doc.extraData.NVotestime || 0
        }
    }

    static async postTimeEstimated({ idMap, idUser, value }) {
        const doc = await getOrCreateMapVotes(idMap)

        const prev = doc.votes.find(v => v.idUser == idUser && v.type === 'timeEstimated')
        if (prev) {
            if (prev.value === value) return doc
            prev.value = value
            prev.dateCreated = Date.now()
        } else {
            doc.votes.push({ idUser, type: 'timeEstimated', value, dateCreated: Date.now() })
        }

        const timeVotes = doc.votes.filter(v => v.type === 'timeEstimated').map(v => v.value)
        doc.extraData.timeEstimated = Math.round(timeVotes.reduce((a, b) => a + b, 0) / timeVotes.length)
        doc.extraData.NVotestime = timeVotes.length

        doc.markModified('extraData')
        doc.markModified('votes')
        await doc.save()
        return doc
    }

    // --- DIFICULTAD ---

    static async getDifficultyMap(idMap) {
        const doc = await getOrCreateMapVotes(idMap)
        return {
            difficulty: doc.extraData.difficulty || 0,
            NVotesDifficulty: doc.extraData.NVotesDifficulty || 0
        }
    }

    static async postDifficultyMap({ idMap, idUser, value }) {
        const doc = await getOrCreateMapVotes(idMap)

        const prev = doc.votes.find(v => v.idUser == idUser && v.type === 'difficulty')
        if (prev) {
            if (prev.value === value) return doc
            prev.value = value
            prev.dateCreated = Date.now()
        } else {
            doc.votes.push({ idUser, type: 'difficulty', value, dateCreated: Date.now() })
        }

        const diffVotes = doc.votes.filter(v => v.type === 'difficulty').map(v => v.value)
        doc.extraData.difficulty = Math.round(diffVotes.reduce((a, b) => a + b, 0) / diffVotes.length)
        doc.extraData.NVotesDifficulty = diffVotes.length

        doc.markModified('extraData')
        doc.markModified('votes')
        await doc.save()
        return doc
    }

    // --- INVESTIGADORES RECOMENDADOS ---

    static async getRecInv(idMap) {
        const doc = await getOrCreateMapVotes(idMap)
        return doc.invRec
    }

    static async postRecInv({ idMap, idUser, nameUser, idInv, nameInv, expansionInv, imgInv, comment }) {
        if (typeof idMap !== 'number' || typeof idUser !== 'string' || typeof nameUser !== 'string' ||
            typeof idInv !== 'number' || typeof nameInv !== 'string' || typeof expansionInv !== 'string' ||
            typeof imgInv !== 'string' || typeof comment !== 'string') {
            console.error('❌ postRecInv - tipos incorrectos')
            return false
        }

        const doc = await getOrCreateMapVotes(idMap)
        const existing = doc.invRec.find(v => v.idInv == idInv && v.idUser == idUser)

        if (existing) {
            existing.comment = comment
            existing.dateCreated = Date.now()
        } else {
            doc.invRec.push({ idUser, nameUser, idInv, nameInv, expansionInv, imgInv, comment, dateCreated: Date.now() })
        }

        doc.markModified('invRec')
        await doc.save()
        return existing || doc.invRec[doc.invRec.length - 1]
    }

    // --- COMENTARIOS ---

    static async getComments(idMap) {
        const doc = await getOrCreateMapVotes(idMap)
        return doc.comments
    }

    static async postComment({ idMap, idUser, nameUser, comment }) {
        if (typeof idMap !== 'number' || typeof idUser !== 'string' || typeof nameUser !== 'string' || typeof comment !== 'string') {
            console.error('❌ postComment - tipos incorrectos')
            return false
        }

        const doc = await getOrCreateMapVotes(idMap)
        const newComment = { idUser, nameUser, comment, dateCreated: Date.now() }
        doc.comments.push(newComment)

        doc.markModified('comments')
        await doc.save()
        return newComment
    }
}