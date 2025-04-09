import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'
import { EnemiesModel } from "./enemies_model.js";


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
        return  
    }

    // retornamos todos los enemigos de un mapa
    static async getAllEnemies({id}){
        // buscamos el mapa por su id
        const map = mapsListJSON.find(map => map.idMap == id)
        // si no existe el mapa, devolvemos vacio
        if (!map) return []

        // destructuring, capturamos lo que haya en enemies, specialEnemies y texto, pero si no existiera estas partes le ponemos valores por defecto para prevenir errores
        const { enemies = [], specialEnemies = [], textSpecialEnemies = "" } = map
        let EStextSpecialEnemies = map.translations.es.textSpecialEnemies
        
        // es como escribir algo asi:
        /* 
            let enemies = map.enemies
            if (enemies === undefined) enemies = []

            let specialEnemies = map.specialEnemies
            if (specialEnemies === undefined) specialEnemies = []

            let textSpecialEnemies = map.textSpecialEnemies
            if (textSpecialEnemies === undefined) textSpecialEnemies = ""
        */


        // cogemos la lista de enemigos y la lista de enemigos especiales
        const enemiesList = await Promise.all(
            enemies.map(id => EnemiesModel.getByID({ id }))
        )
        const specialEnemiesList = await Promise.all(
            specialEnemies.map(id => EnemiesModel.getByID({ id }))
        )

        return {
            enemies: enemiesList.filter(Boolean), // por si algún ID no existe
            specialEnemies: specialEnemiesList.filter(Boolean),
            textSpecialEnemies,
            EStextSpecialEnemies
        }
    }

    // retornamos un mapa por su id
    static async getByID ({id}){
        const map = mapsListJSON.find(map => map.idMap == id);
        return map
    }

    // Desabilitamos por ahora estas opciones para evitar problemas
    /*
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
    */
}