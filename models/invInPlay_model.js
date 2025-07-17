import listInvInPlay from '../databaseJSON/invInPlay.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'

export class InvInPlayModel{

    // método privado para guardar cambios en el JSON
    static _saveAll() {
        writeFileSync('./databaseJSON/invInPlay.json', JSON.stringify(listInvInPlay, null, 2))
    }

    // retornamos un investigador onLine por su id
    static async getInvOnLineById({id}){
        const invOnLine = listInvInPlay.find(investigador => investigador.id === id)
        if (!invOnLine) return null

        return invOnLine
    }

    // retornamos todos los investigadores que tenga guardado el usuario
    static async getAllInvOnLineByUser({id}){
        const invOnLineByUser = listInvInPlay.filter(investigador => investigador.idUser === id)
        if (!invOnLineByUser || invOnLineByUser.length === 0) return null

        console.warn('🔍 --- getAllInvOnLineByUser --- resultados encontrados desde el modelo:', invOnLineByUser);

        return invOnLineByUser
    }

    // crear o actualizar un investigador OnLine
    static async createOrUpdateInvOnLine({investigadorData}){
        let { id, idUser } = investigadorData

        // Si no viene id o es null/undefined, generar uno nuevo
        if (!id || id === null || id === undefined) {
            id = randomUUID()
            investigadorData.id = id
            console.log('🆔 --- ID generado automáticamente ---', id);
        }

        // buscar si ya existe el usuario
        let userIndex = listInvInPlay.findIndex(user => user.idUser === idUser)
        
        if (userIndex === -1) {
            // si no existe el usuario, crearlo
            const newUser = {
                idUser: idUser,
                investigadoresOnLine: []
            }
            listInvInPlay.push(newUser)
            userIndex = listInvInPlay.length - 1
            console.log('👤 --- Usuario creado ---', idUser);
        }

        // buscar si ya existe un investigador con el mismo id dentro de este usuario
        const existingInvIndex = listInvInPlay[userIndex].investigadoresOnLine.findIndex(inv => inv.id === id)
        const now = Date.now()
        investigadorData.lastUpdated = now // actualizar la fecha de modificación
        
        if (existingInvIndex !== -1) {
            // si existe, lo sobreescribimos
            listInvInPlay[userIndex].investigadoresOnLine[existingInvIndex] = investigadorData
            console.log('🔄 --- Investigador actualizado ---', id);
            this._saveAll()
            return investigadorData
        }

        // si no existe, verificamos el límite de 3 investigadores por usuario
        if (listInvInPlay[userIndex].investigadoresOnLine.length >= 3) {
            throw new Error('LIMIT_EXCEEDED')
        }

        // agregar el nuevo investigador al array del usuario
        listInvInPlay[userIndex].investigadoresOnLine.push(investigadorData)
        console.log('➕ --- Nuevo investigador creado ---', id);
        
        // guardar cambios en el JSON
        this._saveAll()
        
        return investigadorData
    }

    // borrar un investigador OnLine
    static async deleteInvOnLine({id, idUser}){
        console.log('🗑️ --- deleteInvOnLine --- recibido:', id, idUser);

        // buscar el usuario
        const userIndex = listInvInPlay.findIndex(user => user.idUser === idUser)
        if (userIndex === -1) {
            console.warn('⚠️ Usuario no encontrado:', idUser);
            return false
        }

        // buscar el investigador dentro del usuario
        const invIndex = listInvInPlay[userIndex].investigadoresOnLine.findIndex(inv => inv.id === id)
        if (invIndex === -1) {
            console.warn('⚠️ Investigador no encontrado:', id);
            return false
        }

        // eliminar el investigador del array
        listInvInPlay[userIndex].investigadoresOnLine.splice(invIndex, 1)
        console.log('✅ --- Investigador eliminado ---', id);

        // guardar cambios en el JSON
        this._saveAll()
        
        return true
    }

}