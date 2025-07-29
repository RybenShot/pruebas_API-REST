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

  /**
     * Maneja las operaciones de la tienda del mapa: añadir objetos aleatorios o marcarlos como vendidos
     * @param {Object} params
     * @param {'soled'|'add'} params.action - Acción a realizar
     * @param {string} params.idMapInPlay - ID del mapa
     * @param {number} params.idObject - ID del objeto (solo para action "soled")
     * @param {string} params.expansion - Filtro de expansión para carta aleatoria (solo para action "add")
     * @param {Array} params.types - Filtro de tipos para carta aleatoria (solo para action "add")
     * @returns {Object|null} El mapa actualizado con información adicional o null si no existe
     */
    static async manageShop({ action, idMapInPlay, idObject, expansion, types }) {
        console.log('🛒 --- manageShop --- recibido:', { action, idMapInPlay, idObject, expansion, types });
        
        // buscamos el mapa por su id
        const map = listMapsInPlay.find(map => map.id == idMapInPlay)
        if (!map) return null

        // inicializamos la tienda si no existe
        if (!map.shop) {
            map.shop = {
                soled: [],
                inShop: []
            }
        }

        let finalObjectId = idObject
        let randomObject = null

        switch (action) {
            case 'soled':
                // convertimos idObject a número para consistencia
                finalObjectId = idObject

                // añadimos el objeto a la lista de vendidos si no está ya
                if (!map.shop.soled.includes(finalObjectId)) {
                    map.shop.soled.push(finalObjectId)
                }
                
                // removemos el objeto de la tienda si estaba ahí
                const indexInShop = map.shop.inShop.indexOf(finalObjectId)
                if (indexInShop !== -1) {
                    map.shop.inShop.splice(indexInShop, 1)
                }
                
                console.log(`✅ Objeto ${finalObjectId} marcado como vendido`)
                break

            case 'add':
                // importamos dinámicamente el ObjectModel para evitar dependencias circulares
                const { ObjectModel } = await import('./object_model.js')
                
                // intentamos hasta 50 veces encontrar una carta que no esté en la tienda
                let attempts = 0
                const maxAttempts = 50
                
                while (attempts < maxAttempts) {
                    randomObject = await ObjectModel.getRandomObject({ expansion, types })
                    
                    if (!randomObject) {
                        console.log('❌ No se encontraron objetos con los filtros especificados')
                        return null
                    }
                    
                    // verificamos que no esté ya en la tienda o vendida
                    const isInShop = map.shop.inShop.includes(randomObject.id)
                    const isSoled = map.shop.soled.includes(randomObject.id)
                    
                    if (!isInShop && !isSoled) {
                        finalObjectId = randomObject.id
                        console.log(`🎲 Carta aleatoria válida encontrada en intento ${attempts + 1}: ${randomObject.translations?.es?.name || randomObject.id}`)
                        break
                    }
                    
                    console.log(`🔄 Intento ${attempts + 1}: Carta ${randomObject.id} ya está en tienda o vendida, reintentando...`)
                    attempts++
                }
                
                // si después de todos los intentos no encontramos una carta válida
                if (attempts >= maxAttempts) {
                    console.log('❌ No se pudo encontrar una carta válida después de', maxAttempts, 'intentos')
                    return null
                }

                // añadimos el objeto a la tienda
                if (!map.shop.inShop.includes(finalObjectId)) {
                    map.shop.inShop.push(finalObjectId)
                }
                
                // removemos el objeto de la lista de vendidos si estaba ahí (por si acaso)
                const indexSoled = map.shop.soled.indexOf(finalObjectId)
                if (indexSoled !== -1) {
                    map.shop.soled.splice(indexSoled, 1)
                }
                
                console.log(`✅ Objeto aleatorio ${finalObjectId} añadido a la tienda`)
                break

            default: throw new Error(`❌ Acción no válida: ${action}`)
        }

        // actualizamos la fecha de última edición
        map.lastEddited = Date.now()

        // guardamos los cambios
        this._saveAll()

        // retornamos el objeto completo para acción "add"
        return { randomObject: randomObject }
    }

    /**
     * Obtiene todos los objetos que están en la tienda del mapa
     * @param {Object} params
     * @param {string} params.idMapInPlay - ID del mapa
     * @returns {Array|null} Array de objetos de la tienda o null si no existe el mapa
     */
    static async getShopItems({ idMapInPlay }) {
        console.log('🏪 --- getShopItems --- recibido:', idMapInPlay);
        
        // buscamos el mapa por su id
        const map = listMapsInPlay.find(map => map.id == idMapInPlay)
        if (!map) return null

        // si no existe la tienda o está vacía, retornamos array vacío
        if (!map.shop || !map.shop.inShop || map.shop.inShop.length === 0) {
            console.log('🏪 Tienda vacía o no existe');
            return []
        }

        // importamos dinámicamente el ObjectModel para evitar dependencias circulares
        const { ObjectModel } = await import('./object_model.js')
        
        // obtenemos todos los objetos de la tienda
        const shopItems = []
        
        for (const objectId of map.shop.inShop) {
            const object = await ObjectModel.getObjectByID({ id: objectId })
            if (object) {
                shopItems.push(object)
            } else {
                console.warn(`⚠️ Objeto con ID ${objectId} no encontrado en la base de datos`)
            }
        }
        
        console.log(`🏪 Se encontraron ${shopItems.length} objetos en la tienda`);
        return shopItems
    }
}