import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }
import mapVotesJSON from '../databaseJSON/map_votes.json' with { type: "json" }
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

    // editamos un mapa para votacion de like dislike
    static async likeDislike({idMap, idUserHost, value}){
        // buscamos y capturamos el mapa en la base de datos de mapas
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false

        // 2. Asegurar campos
        map.extraData = map.extraData || { likes: 0, dislikes: 0, NVotesLikeDislike: 0 }
        map.extraData.likes    = map.extraData.likes    || 0
        map.extraData.dislikes = map.extraData.dislikes || 0
        map.extraData.NVotesLikeDislike = map.extraData.NVotesLikeDislike || 0

        // 3. Buscar o crear bloque de votos
        let voteBlock = mapVotesJSON.find(v => v.idMap == idMap)
        if (!voteBlock) {
            voteBlock = { idMap, votes: [] }
            mapVotesJSON.push(voteBlock)
        }

         // 4. Procesar voto
        const now = Date.now()
        const prev = voteBlock.votes.find(v => v.idUser == idUserHost && v.type == 'likeDislike')

        if (prev) {
            // Si repite mismo valor, salimos
            if (prev.value === value) return map

            // Revertir contador anterior
            if (prev.value === 1) map.extraData.likes--

            else map.extraData.dislikes--

            // Actualizar voto
            prev.value = value
            prev.dateCreated = now
        } else {
            // Nuevo voto
            voteBlock.votes.push({ idUser: idUserHost, type: 'likeDislike', value, dateCreated: now })
            map.extraData.NVotesLikeDislike++
        }

        // 5. Sumar al contador actual
        if (value === 1) map.extraData.likes++
        else if (value === -1) map.extraData.dislikes++

        // 6. Guardar cambios
        writeFileSync('databaseJSON/mapas.json',      JSON.stringify(mapsListJSON, null, 2))
        writeFileSync('databaseJSON/map_votes.json', JSON.stringify(mapVotesJSON, null, 2))

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