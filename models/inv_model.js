import invListJSON from '../databaseJSON/investigadores.json' with { type: "json" }
import previewInvListJSON from '../databaseJSON/previewInv.json' with { type: "json" }
import invVotesJSON from '../databaseJSON/inv_votes.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'
import { ObjectModel } from '../models/object_model.js';


export class InvModel{

    static async getAll({archetype}){
        if (archetype) {
            const filterArchetype = invListJSON.filter(
                // cuando ajuste la base de datos debo cambiar este "arquetipos" por "archetypes"
                inv => inv.arquetipos.some(
                    tipo => tipo.toLowerCase() === archetype.toLowerCase()
                )
            )

            return filterArchetype
        }
        // si no se ha pasado arquetipo, devolvemos todos los investigadores
        return invListJSON
    }

    static async getAllPreview({ rol }){
        const activos = previewInvListJSON.filter(inv => inv.isActive);
        if (rol) {
            const filterRol = activos.filter (
                
                previewInv => previewInv.rol.some(
                    tipo => tipo.toLowerCase() === rol.toLowerCase()
                )
            )
            return filterRol
        }
        return activos
    }

    static async getInvObjects({ id }) {
        const inv = invListJSON.find(inv => inv.idInv == id);
        if (!inv || !inv.possessions) {
          return {
            objects: [],
            optionalText: '',
            optionalObjects: []
          };
        }
      
        const { required = [], optional = [], optionalText = '' } = inv.possessions;
      
        const objects = await Promise.all(
          required.map(id => ObjectModel.getObjectByID({ id }))
        );
      
        const optionalObjects = await Promise.all(
          optional.map(id => ObjectModel.getObjectByID({ id }))
        );
      
        return {
          objects,
          optionalText,
          optionalObjects
        };
    }

    static async getByID ({id}){
        const inv = invListJSON.find(inv => inv.idInv == id)
        return inv
    }

    // retornamos votacion de likes y dislikes de un investigador
    static async getLikeDislike (idInv){
        // buscamos el investigador por su id
        const investigador = invListJSON.find(inv => inv.idInv == idInv)
        if (!investigador) return false

        //capturamos las votaciones de  likes y dislikes y el numero de votos
        const result = {
            likes : investigador.extraData.likes,
            dislikes: investigador.extraData.dislikes,
            NVotesLikeDislike: investigador.extraData.NVotesLikeDislike
        }
        
        return result;
    }

    // votacion de like dislike
    static async likeDislike({idInv, idUser, value}){
        // buscamos y capturamos el investigador en la base de datos de investigadores
        const investigator = invListJSON.find(inv => inv.idInv == idInv)
        if (!investigator) return false

        // 2. Asegurar campos
        investigator.extraData = investigator.extraData || { likes: 0, dislikes: 0, NVotesLikeDislike: 0 }
        investigator.extraData.likes    = investigator.extraData.likes    || 0
        investigator.extraData.dislikes = investigator.extraData.dislikes || 0
        investigator.extraData.NVotesLikeDislike = investigator.extraData.NVotesLikeDislike || 0

        // 3. Buscar o crear bloque de votos
        let voteBlock = invVotesJSON.find(vote => vote.idInv == idInv)
        if (!voteBlock) {
            voteBlock = { idInv, votes: [] }
            invVotesJSON.push(voteBlock)
        }

        // 4. Procesar voto
        const now = Date.now()
        // buscamos si el mismo usuario ha votado anteriormente el mismo tipo de voto
        const prev = voteBlock.votes.find(vote => vote.idUser == idUser && vote.type == 'likeDislike')

        if (prev) {
            // Si repite mismo valor, salimos
            if (prev.value === value) return investigator

            // Si ha llegado aqui es porque ha mandado un valor distinto al que votó anteriormente 
            // Revertir contador anterior
            if (prev.value === 1) investigator.extraData.likes--

            else investigator.extraData.dislikes--

            // Actualizar voto
            prev.value = value
            prev.dateCreated = now
        } else {
            // Nuevo voto
            voteBlock.votes.push({ idUser: idUser, type: 'likeDislike', value, dateCreated: now })
            investigator.extraData.NVotesLikeDislike++
        }

        // 5. Sumar al contador actual
        if (value === 1) investigator.extraData.likes++
        else if (value === -1) investigator.extraData.dislikes++

        // 6. Guardar cambios
        writeFileSync('databaseJSON/investigadores.json',      JSON.stringify(invListJSON, null, 2))
        writeFileSync('databaseJSON/inv_votes.json', JSON.stringify(invVotesJSON, null, 2))

        return map
    }

    static async createInv({input}){
        const newInv = {
            id: randomUUID(),
            ...input
        }
    
        invListJSON.push(newInv)
    
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))

        return newInv
    }

        // get de los comentarios de un investigador
    static async getComments (idInv){
        // buscamos el mapa por su id
        const inv = invVotesJSON.find(inv => inv.idInv == idInv)

        console.log("hemos encontrado el investigador: ", inv)
        
        if (!inv) {
            console.error('❌ No se ha encontrado el investigador con id:', idInv);
            return false;
        }
        
        return inv.comments;
    }

    // post para comentario sobre un investigador
    static async postComment({idInv, idUser, comment}){
        console.log("hemos recivido los siguientes datos: ", idInv, idUser, comment)

        // buscamos y capturamos el investigador en la base de datos de votaciones de investigadores
        const inv = invVotesJSON.find(inv => inv.idInv == idInv)
        if (!inv) return false

        // 2. Asegurar campos
        if (typeof idInv !== 'number' || typeof idUser !== 'string' || typeof comment !== 'string') {
            console.error('❌ model - postComment. Tipos de datos incorrectos:', { idInv, idUser, comment });
            return false;
        }

        // 3. Buscar o crear bloque de votos
        // buscamos si el mismo usuario ha ha votado anterioremente el mismo investigador
        let voteBlock = inv.comments.find(vote => vote.idUser == idUser)
        // si no existe el bloque lo creamos

        console.log("hemos encontrado el bloque de comentarios: ", voteBlock)
        if (!voteBlock) {
            voteBlock = { idUser, comment, dateCreated: Date.now() }
            inv.comments.push(voteBlock)
        } else {
            // Si ya existe, actualizamos el comentario y la fecha
            voteBlock.comment = comment;
            voteBlock.dateCreated = Date.now();
        }

        // 4. Guardar el voto en el JSON de registro (invVotesJSON ya contiene el voto actualizado)
        writeFileSync('databaseJSON/inv_votes.json', JSON.stringify(invVotesJSON, null, 2))
        return voteBlock;
    }

    static async deleteInv({id}){
        const invIndex = invListJSON.findIndex(inv => inv.id == id)

        // Si no se ha encontrado el investigador, devolvemos false
        if (invIndex === -1) return false

        // Eliminamos el investigador de la lista
        invListJSON.splice(invIndex, 1)

        // Guardamos la lista actualizada en el archivo
        writeFileSync('./listaInvestigadores.json', JSON.stringify(invListJSON, null, 2))
        
        //retornamos true para indicar que se ha eliminado correctamente
        return true
    }

    static async updateInv({id, input}){
        // buscamos el investigador por la id
        const invIndex = invListJSON.findIndex(inv => inv.id == id)

        // si no se ha encontrado el investigador, devolvemos false
        if (invIndex === -1) return false

        // cogemos el investigaor de la lista y lo actualizamos con los datos del body
        const invUpdated = {
            ...invListJSON[invIndex],
            ...input
        }

        // metemos al investigador actualizado de nuevo en la lista, machacando el anterior que habia
        invListJSON[invIndex] = invUpdated

        // Guardamos la lista actualizada en el archivo
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))
        return invUpdated
    }
}