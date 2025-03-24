import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'


export class MapModel{

    // retornamos lista de mapas por expansion o todos los mapas
    static async getAll({expansion}){
        if (expansion) {
            const filterExpansion = mapsListJSON.filter(
                map => map.expansion.toLowerCase() === expansion.toLowerCase()
            )
            if (filterExpansion.length === 0) {
                return { message: 'No se han encontrado mapas para la expansión solicitada' }
            }
            return filterExpansion
        }
        // si no se ha pasado expansion, devolvemos todos los mapas
        return mapsListJSON
    }

    // retornamos un mapa por su id
    static async getByID ({id}){
        const map = mapsListJSON.find(map => map.id == id);
        return map
    }

    // creamos un nuevo mapa
    static async createNewMap({input}){
        const newMap = {
            id: randomUUID(),
            ...input
        }
    
        mapsListJSON.push(newMap)
    
        writeFileSync("databaseJSON/mapas.json", JSON.stringify(mapsListJSON, null, 2))

        return newMap
    }

    // borramos un mapa
    static async deleteMap({id}){
        const mapIndex = mapsListJSON.findIndex(map => map.id == id)

        if (mapIndex === -1) return false

        mapsListJSON.splice(mapIndex, 1)
        writeFileSync("databaseJSON/mapas.json", JSON.stringify(mapsListJSON, null, 2))
        
        return true
    }

    // actualizamos un mapa
    static async updateMap({id, input}){
        const mapIndex = mapsListJSON.findIndex(map => map.id == id)

        if (mapIndex === -1) return false

        const mapUpdated = {
            ...mapsListJSON[mapIndex],
            ...input
        }

        mapsListJSON[mapIndex] = mapUpdated
        writeFileSync('./listaInvestigadores.json', JSON.stringify(mapsListJSON, null, 2))
        
        return mapUpdated
    }
}