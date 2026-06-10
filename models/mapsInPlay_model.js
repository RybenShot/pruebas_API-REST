import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'
import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }

const MapInPlay = mongoose.model('MapInPlay', new mongoose.Schema({
    id:                  { type: String, default: () => randomUUID() },
    idMap:               Number,
    title:               String,
    description:         String,
    initialSpace:        mongoose.Schema.Types.Mixed,
    retribution:         mongoose.Schema.Types.Mixed,
    mythosReserve:       mongoose.Schema.Types.Mixed,
    extraData:           mongoose.Schema.Types.Mixed,
    enemies:             mongoose.Schema.Types.Mixed,
    textSpecialEnemies:  String,
    specialEnemies:      mongoose.Schema.Types.Mixed,
    imgMap:              String,
    BGMap:               String,
    translations:        mongoose.Schema.Types.Mixed,
    fechaDeInicio:       Number,
    lastEddited:         Number,
    IDUserHost:          mongoose.Schema.Types.Mixed,
    mythosReserveInPlay: [mongoose.Schema.Types.Mixed],
    variables:           { dooms: { type: Number, default: 0 }, clues: { type: Number, default: 0 } },
    shop:                { soled: [mongoose.Schema.Types.Mixed], inShop: [mongoose.Schema.Types.Mixed] }
}))

export class MapInPlayModel {

    static async getByID({ id }) {
        return await MapInPlay.findOne({ id })
    }

    static async getToken({ id }) {
        const map = await MapInPlay.findOne({ id })
        if (!map) return null

        const availableTokens = map.mythosReserveInPlay.filter(t => !t.reveal)
        if (availableTokens.length === 0) return null

        const token = availableTokens[Math.floor(Math.random() * availableTokens.length)]
        token.reveal = true
        map.markModified('mythosReserveInPlay')
        await map.save()
        return token
    }

    static async ressetMithReserve({ id }) {
        const map = await MapInPlay.findOne({ id })
        if (!map) return null

        map.mythosReserveInPlay.forEach(token => { token.reveal = false })
        map.markModified('mythosReserveInPlay')
        await map.save()
        return true
    }

    static async createNewMap({ idMap, IDUserHost }) {
        const baseMap = mapsListJSON.find(map => map.idMap === idMap)
        if (!baseMap) return null

        const now = Date.now()
        const newMap = await MapInPlay.create({
            id: randomUUID(),
            idMap: baseMap.idMap,
            title: baseMap.title,
            description: baseMap.description,
            initialSpace: baseMap.initialSpace,
            retribution: baseMap.retribution,
            mythosReserve: { ...baseMap.mythosReserve },
            extraData: { ...baseMap.extraData },
            enemies: baseMap.enemies,
            textSpecialEnemies: baseMap.textSpecialEnemies,
            specialEnemies: baseMap.specialEnemies,
            imgMap: baseMap.imgMap,
            BGMap: baseMap.BGMap,
            translations: baseMap.translations,
            fechaDeInicio: now,
            lastEddited: now,
            IDUserHost,
            mythosReserveInPlay: Object.entries(baseMap.mythosReserve)
                .flatMap(([type, count]) =>
                    Array.from({ length: count }, () => ({ type, reveal: false }))
                ),
            variables: { dooms: 0, clues: 0 }
        })
        return newMap
    }

    static async deleteMap(body) {
        const map = await MapInPlay.findOne({ id: body.id })
        if (!map) return false
        if (body.IDUserHost !== map.IDUserHost) return false

        await MapInPlay.deleteOne({ id: body.id })
        return true
    }

    static async adjustVariable({ id, key, delta }) {
        const map = await MapInPlay.findOne({ id })
        if (!map) return null

        if (typeof map.variables[key] !== 'number') {
            throw new Error(`La variable "${key}" no existe o no es numérica.`)
        }

        const newValue = Math.max(0, map.variables[key] + delta)
        return await MapInPlay.findOneAndUpdate(
            { id },
            { $set: { [`variables.${key}`]: newValue, lastEddited: Date.now() } },
            { new: true }
        )
    }

    static async manageMythToken({ id, action, type }) {
        const map = await MapInPlay.findOne({ id })
        if (!map) return null

        switch (action) {
            case 'add':
                map.mythosReserveInPlay.push({ type, reveal: false })
                break
            case 'remove': {
                const idx = map.mythosReserveInPlay.findIndex(t => t.type === type)
                if (idx === -1) return null
                map.mythosReserveInPlay.splice(idx, 1)
                break
            }
            case 'reset': {
                const token = map.mythosReserveInPlay.find(t => t.type === type && t.reveal === true)
                if (!token) return null
                token.reveal = false
                break
            }
            default:
                throw new Error(`Invalid action: ${action}`)
        }

        map.markModified('mythosReserveInPlay')
        await map.save()
        return map
    }

    static async getAllMapsByUser({ id }) {
        return await MapInPlay.find({ IDUserHost: id })
    }

    static async manageShop({ action, idMapInPlay, idObject, expansion, types }) {
        const map = await MapInPlay.findOne({ id: idMapInPlay })
        if (!map) return null

        if (!map.shop) map.shop = { soled: [], inShop: [] }

        let finalObjectId = idObject
        let randomObject = null

        switch (action) {
            case 'soled':
                if (!map.shop.soled.includes(idObject)) map.shop.soled.push(idObject)
                const idx = map.shop.inShop.indexOf(idObject)
                if (idx !== -1) map.shop.inShop.splice(idx, 1)
                break

            case 'add': {
                const { ObjectModel } = await import('./object_model.js')
                let attempts = 0
                while (attempts < 50) {
                    randomObject = await ObjectModel.getRandomObject({ expansion, types })
                    if (!randomObject) return null
                    if (!map.shop.inShop.includes(randomObject.id) && !map.shop.soled.includes(randomObject.id)) {
                        finalObjectId = randomObject.id
                        break
                    }
                    attempts++
                }
                if (attempts >= 50) return null
                if (!map.shop.inShop.includes(finalObjectId)) map.shop.inShop.push(finalObjectId)
                break
            }

            default:
                throw new Error(`Acción no válida: ${action}`)
        }

        map.lastEddited = Date.now()
        map.markModified('shop')
        await map.save()
        return { randomObject }
    }

    static async getShopItems({ idMapInPlay }) {
        const map = await MapInPlay.findOne({ id: idMapInPlay })
        if (!map) return null
        if (!map.shop?.inShop?.length) return []

        const { ObjectModel } = await import('./object_model.js')
        const shopItems = []
        for (const objectId of map.shop.inShop) {
            const object = await ObjectModel.getObjectByID({ id: objectId })
            if (object) shopItems.push(object)
        }
        return shopItems
    }
}