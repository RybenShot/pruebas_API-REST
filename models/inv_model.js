import invListJSON from '../databaseJSON/investigadores.json' with { type: "json" }
import previewInvListJSON from '../databaseJSON/previewInv.json' with { type: "json" }
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
          required.map(id => ObjectModel.getByID({ id }))
        );
      
        const optionalObjects = await Promise.all(
          optional.map(id => ObjectModel.getByID({ id }))
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

    static async createInv({input}){
        const newInv = {
            id: randomUUID(),
            ...input
        }
    
        invListJSON.push(newInv)
    
        writeFileSync("databaseJSON/investigadores.json", JSON.stringify(invListJSON, null, 2))

        return newInv
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