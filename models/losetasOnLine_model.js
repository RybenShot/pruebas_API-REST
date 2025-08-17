import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'fs'

export class losetasOnLineModel{
    // método privado para guardar cambios en el JSON
    static _saveAll() {
        writeFileSync('./databaseJSON/losetasOnLine.json', JSON.stringify(listLosetasOnLine, null, 2))
    }

    // eliminar usuarios inactivos (más de 15 minutos sin actividad)
    static removeInactiveUsers(){
        const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000) // 15 minutos en millisegundos
        let hasChanges = false

        listLosetasOnLine.forEach(zone => {
            // filtrar usuarios activos en cada zona
            const activeUsers = zone.invOnLine.filter(user => {
                // mantener objetos vacíos {} y usuarios activos
                if (Object.keys(user).length === 0) return true
                return user.lastEddited && user.lastEddited > fifteenMinutesAgo
            })

            // si hay cambios, actualizar la zona
            if (activeUsers.length !== zone.invOnLine.length) {
                zone.invOnLine = activeUsers
                hasChanges = true
                console.log(`🧹 Usuarios inactivos eliminados de zona ${zone.nameZone}`)
            }
        })

        // guardar solo si hay cambios
        if (hasChanges) {
            this._saveAll()
        }

        return hasChanges
    }

    // obtener número total de usuarios online
    static getAllUsersOnLine(){
        // primero ejecuta la función de quitar los investigadores inactivos
        this.removeInactiveUsers()

        // contar usuarios activos en todas las zonas
        let totalUsers = 0
        listLosetasOnLine.forEach(zone => {
            const activeUsers = zone.invOnLine.filter(user => 
                Object.keys(user).length > 0 && user.idUser
            )
            totalUsers += activeUsers.length
        })

        console.log(`📊 Total usuarios online: ${totalUsers}`)
        return totalUsers
    }

    // obtener usuarios online en una zona específica
    static getUsersInZone({idZone}){
        this.removeInactiveUsers()

        const zone = listLosetasOnLine.find(zone => zone.idZone === idZone)
        if (!zone) return null

        const activeUsers = zone.invOnLine.filter(user => 
            Object.keys(user).length > 0 && user.idUser
        )

        return {
            idZone: zone.idZone,
            nameZone: zone.nameZone,
            userCount: activeUsers.length,
            users: activeUsers,
            specialEvent: zone.specialEvent
        }
    }

    // obtener un investigador random de una zona específica
    static getRandomUserInZone({idZone}, idUser){
        this.removeInactiveUsers()

        console.log(idZone, idUser)
 
        const zone = listLosetasOnLine.find(zone => zone.idZone == idZone)
        if (!zone) return null

        // filtrar usuarios activos (no vacíos)
        const activeUsers = zone.invOnLine.filter(user => 
            Object.keys(user).length > 0 && user.idUser
        )

        // filtrar solo usuarios DISPONIBLES para selección random
        const availableUsers = activeUsers.filter(user => 
            user.available !== false // incluye undefined, true, y excluye false
        )

        const finalUsers = availableUsers.filter(user =>
            user.idUser != idUser // excluir al usuario que hace la petición
        )

        // si no hay usuarios disponibles ...
        if (finalUsers.length == 0) return null

        // seleccionar usuario random
        const randomIndex = Math.floor(Math.random() * finalUsers.length)
        const randomUser = finalUsers[randomIndex]

        console.log(`🎲 Usuario random seleccionado: ${randomUser.idUser} de zona ${zone.nameZone}`)
        
        return {
            user: randomUser,
            zone: {
                idZone: zone.idZone,
                nameZone: zone.nameZone
            },
            totalUsersInZone: finalUsers.length
        }
    }

    // agregar o actualizar investigador en una zona
    static addOrUpdateUserInZone({idZone, idUser, invData, available = true}){
        this.removeInactiveUsers()

        const targetZone = listLosetasOnLine.find(zone => zone.idZone === idZone)
        if (!targetZone) throw new Error('ZONE_NOT_FOUND')

        // PASO 1: borrar usuario de cualquier zona donde esté actualmente
        listLosetasOnLine.forEach(zone => {
            const userIndex = zone.invOnLine.findIndex(user => user.idUser === idUser)
            // si hemos encontrado el usuario, lo borramos
            if (userIndex !== -1) {
                zone.invOnLine.splice(userIndex, 1) // Eliminar completamente, no dejar slot vacío
                console.log(`🗑️ Usuario ${idUser} removido de zona ${zone.nameZone}`)
            }
        })

        // PASO 2: Agregar usuario a la nueva zona
        const userData = {
            idUser,
            invData: invData || [],
            available: available,
            lastEddited: Date.now()
        }

        targetZone.invOnLine.push(userData)
        console.log(`➕ Usuario ${idUser} agregado a zona ${targetZone.nameZone}`)

        this._saveAll()
        
        // Retorna true si todo salió bien
        return true
    }
}