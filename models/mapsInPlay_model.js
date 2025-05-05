import listMapsInPlay from '../databaseJSON/mapsInPlay.json' with { type: "json" }

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

    // creamos un nuevo mapa
    static async createNewMap({input}){
        const newMap = {
            id: randomUUID(),
            ...input
        }
    
        listMapsInPlay.push(newMap)
    
        writeFileSync("databaseJSON/mapsInPlay.json", JSON.stringify(listMapsInPlay, null, 2))

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