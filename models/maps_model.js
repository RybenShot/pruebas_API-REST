import mapsListJSON from '../databaseJSON/mapas.json' with { type: "json" }
import mapVotesJSON from '../databaseJSON/map_votes.json' with { type: "json" }
import listPreviewMaps from '../databaseJSON/previewMaps.json' with { type: "json" }
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
        return mapsListJSON
    }

    // retornamos todos los previews de los mapas
    static getPreviewMap () {
        // devolvemos todos los previews de los mapas
        return listPreviewMaps
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

    // retornamos votacion de likes y dislikes de un mapa
    static async getLikeDislike (idMap){
        // buscamos el mapa por su id
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false


        //capturamos las votaciones de  likes y dislikes y el numero de votos
        const result = {
            likes : map.extraData.likes,
            dislikes: map.extraData.dislikes,
            NVotesLikeDislike: map.extraData.NVotesLikeDislike
        }

        console.log("resultados de la votacion de like y dislike: ", result)
        
        return result;
    }

    // votacion de like dislike
    static async postLikeDislike({idMap, idUser, value}){
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
        // buscamos si el mismo usuario ha votado anteriormente el mismo tipo de voto
        const prev = voteBlock.votes.find(vote => vote.idUser == idUser && vote.type == 'likeDislike')

        if (prev) {
            // Si repite mismo valor, salimos
            if (prev.value === value) return map

            // Si ha llegado aqui es porque ha mandado un valor distinto al que votó anteriormente 
            // Revertir contador anterior
            if (prev.value === 1) map.extraData.likes--

            else map.extraData.dislikes--

            // Actualizar voto
            prev.value = value
            prev.dateCreated = now
        } else {
            // Nuevo voto
            voteBlock.votes.push({ idUser: idUser, type: 'likeDislike', value, dateCreated: now })
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

    // retornamos tiempo estimado de un mapa
    static async getTimeEstimated (idMap){
        // buscamos el mapa por su id
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false

        //capturamos el tiempo estimado
        const result = {
            timeEstimated : map.extraData.timeEstimated,
            NVotestime: map.extraData.NVotestime,
        }
        
        return result;
    }

    // tiempo estimado de Usuario
    static async postTimeEstimated({idMap, idUser, value}){
        // buscamos y capturamos el mapa en la base de datos de mapas
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false

        // 2. Asegurar campos
        map.extraData = map.extraData || { timeEstimated: 0, NVotestime: 0 }
        map.extraData.timeEstimated    = map.extraData.timeEstimated    || 0
        map.extraData.NVotestime = map.extraData.NVotestime || 0

        // 3. Buscar o crear bloque de votos
        let voteBlock = mapVotesJSON.find(v => v.idMap == idMap)
        // si no existe el bloque lo creamos
        if (!voteBlock) {
            voteBlock = { idMap, votes: [] }
            mapVotesJSON.push(voteBlock)
        }

        // 4. Procesar voto
        const now = Date.now()
        // buscamos si el mismo usuario ha votado anteriormente el mismo tipo de voto
        const prev = voteBlock.votes.find(vote => vote.idUser == idUser && vote.type == 'timeEstimated')

        if (prev) {
            // Usuario ya votó antes: si es el mismo valor, no hacemos nada
            if (prev.value === value) {
                // retornamos el mapa sin cambios
                return map;
            }
            // Sino, simplemente actualizamos el valor y la fecha
            prev.value = value;
            prev.dateCreated = now;
        } else {
            // Nuevo voto
            voteBlock.votes.push({idUser, type: 'timeEstimated', value, dateCreated: now });
        }

        // 5. Calcular nueva media de todos los votos timeEstimated
        const timeVotes = voteBlock.votes.map(v => v.value);
        const totalVotos = timeVotes.length;
        const sumaTiempos = timeVotes.reduce((acc, t) => acc + t, 0);
        const media = totalVotos > 0 ? Math.round(sumaTiempos / totalVotos) : 0;

        // 6. Actualizar extraData en el mapa
        map.extraData.NVotestime += 1;           // sumamos +1 al número de votaciones
        map.extraData.timeEstimated = media;     // guardamos la media calculada

        // 7. Guardar el voto en el JSON de registro (mapVotesJSON ya contiene el voto actualizado)
        writeFileSync('databaseJSON/mapas.json',      JSON.stringify(mapsListJSON, null, 2))
        writeFileSync('databaseJSON/map_votes.json', JSON.stringify(mapVotesJSON, null, 2))
        
        return map;
    }

    // PEDIMOS media de dificultad de mapa
    static async getDifficultyMap (idMap){
        // buscamos el mapa por su id
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false

        //capturamos el tiempo estimado
        const result = {
            difficulty : map.extraData.difficulty,
            NVotesDifficulty: map.extraData.NVotesDifficulty,
        }
        
        return result;
    }

    // votacion de dificultad de mapa
    static async postDifficultyMap({idMap, idUser, value}){
        // buscamos y capturamos el mapa en la base de datos de mapas
        const map = mapsListJSON.find(m => m.idMap == idMap)
        if (!map) return false

        // 2. Asegurar campos
        map.extraData = map.extraData || { difficulty: 0, NVotesDifficulty: 0 }
        map.extraData.difficulty    = map.extraData.difficulty    || 0
        map.extraData.NVotesDifficulty = map.extraData.NVotesDifficulty || 0

        // 3. Buscar o crear bloque de votos
        let voteBlock = mapVotesJSON.find(v => v.idMap == idMap)
        // si no existe el bloque lo creamos
        if (!voteBlock) {
            voteBlock = { idMap, votes: [] }
            mapVotesJSON.push(voteBlock)
        }

        // 4. Procesar voto
        const now = Date.now()
        // buscamos si el mismo usuario ha votado anteriormente el mismo tipo de voto
        const prev = voteBlock.votes.find(vote => vote.idUser == idUser && vote.type == 'difficulty')

        if (prev) {
            // Usuario ya votó antes: si es el mismo valor, no hacemos nada
            if (prev.value === value) {
                // retornamos el mapa sin cambios
                return map;
            }
            // Sino, simplemente actualizamos el valor y la fecha
            prev.value = value;
            prev.dateCreated = now;
        } else {
            // Nuevo voto
            voteBlock.votes.push({idUser, type: 'difficulty', value, dateCreated: now });
        }

        // 5. Calcular nueva media de todos los votos timeEstimated
        const timeVotes = voteBlock.votes.filter(v => v.type === 'difficulty')  // filtramos sólo timeEstimated
        .map(v => v.value);

        const totalVotos = timeVotes.length;

        const sumaTiempos = timeVotes.reduce((acc, t) => acc + t, 0);
        const media = totalVotos > 0 ? Math.round(sumaTiempos / totalVotos) : 0;

        // 6. Actualizar extraData en el mapa
        map.extraData.NVotesDifficulty += 1;           // sumamos +1 al número de votaciones
        map.extraData.difficulty = media;     // guardamos la media calculada

        // 7. Guardar el voto en el JSON de registro (mapVotesJSON ya contiene el voto actualizado)
        writeFileSync('databaseJSON/mapas.json',      JSON.stringify(mapsListJSON, null, 2))
        writeFileSync('databaseJSON/map_votes.json', JSON.stringify(mapVotesJSON, null, 2))
        
        return map;
    }

    // PEDIMOS investigadores recomendados de un mapa
    static async getRecInv (idMap){
        // buscamos el mapa por su id
        const map = mapVotesJSON.find(map => map.idMap == idMap)

        console.log("hemos encontrado el mapa: ", map)
        
        if (!map) {
            console.error('❌ No se ha encontrado el mapa con id:', idMap);
            return false;
        }
        
        return map.invRec;
    }

    // votacion de investigadores recomendados de un mapa
    static async postRecInv({idMap, idUser, nameUser, idInv, nameInv, expansionInv, imgInv, comment}){
        console.log("hemos recivido los siguientes datos: ", idMap, idUser, nameUser, idInv, nameInv,expansionInv, imgInv, comment)

        // buscamos y capturamos el mapa en la base de datos de votaciones de mapas
        const map = mapVotesJSON.find(map => map.idMap == idMap)
        if (!map) return false

        // 2. Asegurar campos
        if (typeof idMap !== 'number' || 
            typeof idUser !== 'string' ||
            typeof nameUser !== 'string' ||
            typeof idInv !== 'number' ||
            typeof nameInv !== 'string' ||
            typeof expansionInv !== 'string' ||
            typeof imgInv !== 'string' ||
            typeof comment !== 'string'
            ) {
            console.error('❌ model - postRecInv. Tipos de datos incorrectos:', { idMap, idUser, nameUser, idInv, nameInv,expansionInv, imgInv, comment });
            return false;
        }

        // 3. Buscar o crear bloque de votos
        // buscamos si el mismo usuario ha ha votado anterioremente el mismo investigador
        let voteBlock = map.invRec.find(vote => vote.idInv == idInv && vote.idUser == idUser)
        // si no existe el bloque lo creamos

        console.log("hemos encontrado el bloque de votos: ", voteBlock)
        if (!voteBlock) {
            voteBlock = { idUser, nameUser, idInv, nameInv,expansionInv, imgInv, comment, dateCreated: Date.now() }
            map.invRec.push(voteBlock)
        } else {
            // Si ya existe, actualizamos el comentario y la fecha
            voteBlock.comment = comment;
            voteBlock.dateCreated = Date.now();
        }

        // 4. Guardar el voto en el JSON de registro (mapVotesJSON ya contiene el voto actualizado)
        writeFileSync('databaseJSON/map_votes.json', JSON.stringify(mapVotesJSON, null, 2))
        return voteBlock;
    }

    // get de los comentarios de un mapa
    static async getComments (idMap){
        // buscamos el mapa por su id
        const map = mapVotesJSON.find(map => map.idMap == idMap)

        console.log("hemos encontrado el mapa: ", map)
        
        if (!map) {
            console.error('❌ No se ha encontrado el mapa con id:', idMap);
            return false;
        }
        
        return map.comments;
    }

    // post para comentario sobre un mapa
    static async postComment({idMap, idUser, comment}){
        console.log("hemos recivido los siguientes datos: ", idMap, idUser, comment)

        // buscamos y capturamos el mapa en la base de datos de votaciones de mapas
        const map = mapVotesJSON.find(map => map.idMap == idMap)
        if (!map) return false

        // 2. Asegurar campos
        if (typeof idMap !== 'number' || typeof idUser !== 'string' || typeof comment !== 'string') {
            console.error('❌ model - postComment. Tipos de datos incorrectos:', { idMap, idUser, comment });
            return false;
        }

        // 3. Buscar o crear bloque de votos
        // buscamos si el mismo usuario ha ha votado anterioremente el mismo investigador
        let voteBlock = map.comments.find(vote => vote.idUser == idUser)
        // si no existe el bloque lo creamos

        console.log("hemos encontrado el bloque de comentarios: ", voteBlock)
        if (!voteBlock) {
            voteBlock = { idUser, comment, dateCreated: Date.now() }
            map.comments.push(voteBlock)
        } else {
            // Si ya existe, actualizamos el comentario y la fecha
            voteBlock.comment = comment;
            voteBlock.dateCreated = Date.now();
        }

        // 4. Guardar el voto en el JSON de registro (mapVotesJSON ya contiene el voto actualizado)
        writeFileSync('databaseJSON/map_votes.json', JSON.stringify(mapVotesJSON, null, 2))
        return voteBlock;
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