import listMapsInPlay from '../databaseJSON/mapsInPlay.json' with { type: "json" }
import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }


import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'
import { EnemiesModel } from "./enemies_model.js";


export class MapInPlayModel{

    static _saveAll() {
        writeFileSync('./databaseJSON/mapsInPlay.json', JSON.stringify(listMapsInPlay, null, 2))
    }

    // retornamos un mapa por su id
    static async getByID ({id}){
        console.log('🔍 --- getByID --- recibid:', id);
        const map = listMapsInPlay.find(map => map.id == id);
        return map
    }

    // pedimos una ficha de mitos
    static async getToken ({id}){
        console.log('🔍 --- getToken --- recibid:', id);
        // Buscamos el mapa
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // filtramos entre las fichas NO REVELADAS del mapa
        const availableTokens = map.mythosReserveInPlay.filter(type => !type.reveal)
        if (availableTokens.length == 0) return null

        // sacar un tokern al azar
        const token = availableTokens[Math.floor(Math.random() * availableTokens.length)]
        console.log("se ha seleccionado la ficha: ", token)

        // marca el token seleccionado como revelado
        token.reveal = true

        // guarda los cambios
        this._saveAll()

        // devuelve solo la ficha seleccionada
        return token
    }

    // llamada para resetear todas las fichas de la reserva de mitos
    static async ressetMithReserve({id}){
        console.log('🔍 --- ressetMithReserve --- recibid:', id);
        // Buscamos el mapa
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // para cada ficha pasamos el valor de "reveal" a "false"
        map.mythosReserveInPlay.forEach(token => {
            token.reveal = false;
        });
      
        // guardar cambios en el JSON
        this._saveAll()
        return true
    }

    /**
   * Crea un nuevo mapa "in play" a partir del id del mapa base.
   * @param {{idMap: number, IDUserHost: number}} params
   * @returns {object|null} El mapa in play o null si no existe idMap
   */
  static async createNewMap({ idMap, IDUserHost }) {
    console.log('🔍 --- createNewMap --- recibid:', idMap, IDUserHost);
    // busca el mapa base
    const baseMap = mapsListJSON.find(map => map.idMap === idMap)
    if (!baseMap) return null

    // clona datos relevantes
    const now = Date.now()
    const newMap = {
      id: randomUUID(),
      idMap: baseMap.idMap,
      title: baseMap.title,
      description: baseMap.description,
      initialSpace: baseMap.initialSpace,
      retribution: baseMap.retribution,
      mythosReserve: { ...baseMap.mythosReserve },
      extraData: {...baseMap.extraData},
      enemies: baseMap.enemies,
      textSpecialEnemies: baseMap.textSpecialEnemies,
      specialEnemies: baseMap.specialEnemies,
      imgMap: baseMap.imgMap,
      BGMap: baseMap.BGMap,
      translations: baseMap.translations,

      fechaDeInicio: now,
      lastEddited: now,
      IDUserHost,

      // genera la reserva de mitos mythosReserveInPlay
      mythosReserveInPlay: Object.entries(baseMap.mythosReserve)
        .flatMap(([type, count]) =>
          Array.from({ length: count }, () => ({ type, reveal: false }))
        ),
      // inicializa variables con los mismos contadores (puedes ajustarlos si prefieres otros valores)
      variables: {
        dooms: 0,
        clues: 0
      }
    }

    // guarda el mapa
    listMapsInPlay.push(newMap)
    this._saveAll()

    return newMap
  }

    // borramos un mapa
    static async deleteMap(body){
        console.log('🔍 --- deleteMap --- recibid:', body);
        const mapIndex = listMapsInPlay.findIndex(map => map.id === body.id);

        if (mapIndex === -1) {
          console.warn('⚠️ id del mapa no encontrado:', body.id);
          return false;
        }

        const map = listMapsInPlay.find(map => map.id == body.id);

        if (body.IDUserHost !== map.IDUserHost) {
          console.warn('⚠️ contraseña incorrecta:', body.password);
          return false;
        }
      
        listMapsInPlay.splice(mapIndex, 1)
        this._saveAll()
        
        return true
    }

    /**
     * @param {string|number} params.id   — El id del mapa
     * @param {'dooms'|'clues'} params.key   — El nombre de la variable en el objeto `variables`
     * @param {number} params.delta      — Cuánto sumar (positivo) o restar (negativo)
     * @returns {Object|null} El mapa actualizado o `null` si no existe
    */
    static async adjustVariable({ id, key, delta }) {
        console.log('🔍 --- adjustVariable --- recibid:', id, key, delta);

        // buscamos el mapa por la id
        const map = listMapsInPlay.find(map => map.id == id);
        if(!map) return null

        // aseguramos de que la clave existe y es numérica
        if (typeof map.variables[key] !== 'number') {
        throw new Error(`❌ La variable "${key}" no existe o no es numérica.`);
        }

        // aplica el calculo de lo que venga en delta
        map.variables[key] = Math.max(0, map.variables[key] + delta);

        // guardamos los cambios
        this._saveAll()

        return map;
    }

    /**
     * Gestiona tokens de mitos: añade, elimina o resetea el reveal.
     * @param {Object} params
     * @param {string|number} params.id
     * @param {'add'|'remove'|'reset'} params.action
     * @param {string} params.type
     */
    static async manageMythToken({ id, action, type }) {
        const map = listMapsInPlay.find(map => map.id == id)
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

    static async getAllMapsByUser({ id }) {
        console.log('🔍 --- getAllMapsByUser --- recibid:', id);
        // buscamos todos los mapas por el id del usuario
        const maps = listMapsInPlay.filter(map => map.IDUserHost == id);
        if(!maps) return null

        // devuelve todos los mapas encontrados
        return maps
    }
}