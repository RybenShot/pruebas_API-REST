import enemiesListJSON from '../databaseJSON/enemies.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'


export class EnemiesModel{

    // retornamos lista de enemigos por expansion, tipo o todos los enemigos
    static async getAll({expansion, type}){
        // por defecto vamos a poner como resultado la lista de enemigos
        let result = enemiesListJSON
        if (expansion || type) {
            if (expansion) {
                result = result.filter(
                    enemy => enemy.expansion.toLowerCase() === expansion.toLowerCase()
                )
            } else if (type) {
                // cogemos el filtro pasado y lo convertimos en lowercase
                const typeFilterToLower = type.toLowerCase()

                // aqui filtramos por el array de todos los enemigos
                result = result.filter( 
                    // aqui filtramos por cada uno de los enemigos en el array de los tipos
                    enemy => enemy.monsterType.some(
                        enemyType => enemyType.toLowerCase() === typeFilterToLower
                    )
                )
            }
            
            if (result.length === 0) {
                return { message: 'No se han encontrado enemigos para la expansión solicitada' }
            }
            // si llega aqui devolvemos el resultado filtrado
            return result
        }
        // si no se ha pasado expansion ni tipo, devolvemos todos los enemigos
        return result
    }

    // retornamos un enemigo por su id
    static async getByID ({id}){
        const enemy = enemiesListJSON.find(enemy => enemy.id == id);
        return enemy
    }

    // Desabilitamos por ahora estas opciones para evitar problemas
    /*
    // creamos un nuevo mapa
    static async createNewMap({input}){
        const newMap = {
            id: randomUUID(),
            ...input
        }
    
        enemiesListJSON.push(newMap)
    
        writeFileSync("databaseJSON/mapas.json", JSON.stringify(enemiesListJSON, null, 2))

        return newMap
    }

    // borramos un mapa
    static async deleteMap({id}){
        const mapIndex = enemiesListJSON.findIndex(map => map.id == id)

        if (mapIndex === -1) return false

        enemiesListJSON.splice(mapIndex, 1)
        writeFileSync("databaseJSON/mapas.json", JSON.stringify(enemiesListJSON, null, 2))
        
        return true
    }

    // actualizamos un mapa
    static async updateMap({id, input}){
        const mapIndex = enemiesListJSON.findIndex(map => map.id == id)

        if (mapIndex === -1) return false

        const mapUpdated = {
            ...enemiesListJSON[mapIndex],
            ...input
        }

        enemiesListJSON[mapIndex] = mapUpdated
        writeFileSync('./listaInvestigadores.json', JSON.stringify(enemiesListJSON, null, 2))
        
        return mapUpdated
    }
    */
}