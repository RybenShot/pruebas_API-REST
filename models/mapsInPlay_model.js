import listMapsInPlay from '../databaseJSON/mapsInPlay.json' with { type: "json" }
import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }


import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'
import { EnemiesModel } from "./enemies_model.js";


export class MapInPlayModel{

    // retornamos un mapa por su id
    static async getByID ({id}){
        const map = listMapsInPlay.find(map => map.id == id);
        return map
    }

    static async getToken ({id}){
        // Buscamos el mapa
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // filtramos entre las fichas NO REVELADAS del mapa
        const availableTokens = map.mythosReserveInPlay.filter(type => !type.reveal)
        if (availableTokens.length == 0) return null

        // sacar un tokern al azar
        const token = availableTokens[Math.floor(Math.random() * availableTokens.length)]
        console.log(token)

        // marca el token seleccionado como revelado
        token.reveal = true

        // guarda los cambios
        writeFileSync('databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2));

        // devuelve solo la ficha seleccionada
        return token
    }

    static async ressetMithReserve({id}){
        // Buscamos el mapa
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // para cada ficha pasamos el valor de "reveal" a "false"
        map.mythosReserveInPlay.forEach(token => {
            token.reveal = false;
        });
      
        // guardar cambios en el JSON
        writeFileSync( 'databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2)        ); 
        return true
    }

    /**
   * Crea un nuevo mapa "in play" a partir del id del mapa base.
   * @param {{idMap: number, IDUserHost: number}} params
   * @returns {object|null} El mapa in play o null si no existe idMap
   */
  static async createNewMap({ idMap, IDUserHost }) {
    // 1. Busca el mapa base
    const base = mapsListJSON.find(m => m.idMap === idMap)
    if (!base) return null

    // 2. Clona datos relevantes
    const now = Date.now()
    const newMap = {
      id: randomUUID(),
      idMap: base.idMap,
      title: base.title,
      fechaDeInicio: now,
      lastEddited: now,
      IDUserHost,
      mythosReserve: { ...base.mythosReserve },
      // 3. Genera el array mythosReserveInPlay
      mythosReserveInPlay: Object.entries(base.mythosReserve)
        .flatMap(([type, count]) =>
          Array.from({ length: count }, () => ({ type, reveal: false }))
        ),
      // 4. Inicializa variables con los mismos contadores (puedes ajustarlos si prefieres otros valores)
      variables: {
        dooms: base.mythosReserve.doom || 0,
        clues: base.mythosReserve.clues || 0
      }
    }

    // 5. Persiste en mapsInPlay.json
    listMapsInPlay.push(newMap)
    writeFileSync('databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2))

    return newMap
  }

    // borramos un mapa
    static async deleteMap(body){
        console.log('🔍 --- deleteMap --- recibid:', body);

        if (body.password !== '666') {
          console.warn('⚠️ contraseña incorrecta:', body.password);
          return false;
        }
      
        const mapIndex = listMapsInPlay.findIndex(map => map.id === body.id);
        if (mapIndex === -1) {
          console.warn('⚠️ id no encontrado:', body.id);
          return false;
        }

        listMapsInPlay.splice(mapIndex, 1)
        writeFileSync("databaseJSON/mapsInPlay.json", JSON.stringify(listMapsInPlay, null, 2))
        
        return true
    }

    /**
     * @param {string|number} params.id   — El id del mapa
     * @param {'dooms'|'clues'} params.key   — El nombre de la variable en el objeto `variables`
     * @param {number} params.delta      — Cuánto sumar (positivo) o restar (negativo)
     * @returns {Object|null} El mapa actualizado o `null` si no existe
    */
    static async adjustVariable({ id, key, delta }) {
        // buscamos el mapa por la id
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // aseguramos de que la clave existe y es numérica
        if (typeof map.variables[key] !== 'number') {
        throw new Error(`La variable "${key}" no existe o no es numérica.`);
        }

        // aplica el calculo de lo que venga en delta
        map.variables[key] = Math.max(0, map.variables[key] + delta);

        // guardamos los cambios
        writeFileSync('./databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2));

        return map;
    }

    static _saveAll() {
        writeFileSync('./databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2))
    }

    /**
     * Gestiona tokens de mitos: añade, elimina o resetea el reveal.
     * @param {Object} params
     * @param {string|number} params.id
     * @param {'add'|'remove'|'reset'} params.action
     * @param {string} params.type
     */
    static async manageMythToken({ id, action, type }) {
        const map = listMapsInPlay.find(m => m.id == id)
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

        this._saveAll()
        return map
    }

    // actualizamos un mapa
    static async updateMap({id, input}){
        const mapIndex = listMapsInPlay.findIndex(map => map.id == id)

        if (mapIndex === -1) return false

        const mapUpdated = {
            ...listMapsInPlay[mapIndex],
            ...input
        }

        listMapsInPlay[mapIndex] = mapUpdated
        writeFileSync('./listaInvestigadores.json', JSON.stringify(listMapsInPlay, null, 2))
        
        return mapUpdated
    }
}