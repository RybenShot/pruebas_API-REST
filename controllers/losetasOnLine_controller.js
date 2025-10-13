import {losetasOnLineModel} from '../models/losetasOnLine_model.js'

import listLosetasOnLine from '../databaseJSON/losetasOnLine.json' with { type: "json" }

export class losetasOnLineController {

    // GET todos los datos sobre losetasOnLine
    static async getAllDataLosetas(req, res){
        try {
            console.log('🔍 --- getAllUsersOnLine --- ');
            res.json(listLosetasOnLine)
            
        } catch (error) {
            console.error('❌ getAllUsersOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET Numero total de usuarios que hay OnLine
    static async getAllUsersOnLine(req, res){
        try {
            console.log('🔍 --- getAllUsersOnLine --- ');

            const totalUsers = losetasOnLineModel.getAllUsersOnLine()
            
            res.json({
                totalUsersOnline: totalUsers,
                message: `Hay ${totalUsers} investigadores conectados`
            })

        } catch (error) {
            console.error('❌ getAllUsersOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET numero de investigadores conectados en una zona concreta
    static async getAllUsers1ZoneOnLine(req, res){
        try {
            const { id } = req.params
            console.log('🔍 --- getAllUsers1ZoneOnLine --- zona:', id);

            const zoneData = losetasOnLineModel.getUsersInZone({ idZone: id })
            
            if (!zoneData) {
                return res.status(404).json({ 
                    message: `Zona con ID ${id} no encontrada` 
                })
            }

            res.json(zoneData)
            
        } catch (error) {
            console.error('❌ getAllUsers1ZoneOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET investigador random de una zona específica
    //TODO hay que tener en cuenta de no emparejar jugadores de la misma mesa
    static async getRandomUserInZone(req, res){
        try {
            const { id,  idUser} = req.params
            console.log('🎲 --- getRandomUserInZone --- zona:', id, idUser);

            const randomUserData = losetasOnLineModel.getRandomUserInZone({ idZone: id }, idUser)
            
            if (!randomUserData) {
                return res.status(200).json({ 
                    user: null,
                    message: "No hay usuarios disponibles en esta zona"
                })
            }

            res.json(randomUserData)
            
        } catch (error) {
            console.error('❌ getRandomUserInZone error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
    
    // POST de nuevo investigador a una zona concreta
    //TODO aqui hay que añadir la id del mapa online que esten jugando ya que no queremos que se empareje con otro de la misma mesa
    static async postUserInZone(req, res){
        try {
            const { idZone, idUser, invData, available } = req.body
            console.log('➕ --- postUserInZone --- recibido:', { idZone, idUser, invData: invData ? 'present' : 'empty' });

            // Validaciones básicas
            if (!idZone || !idUser) {
                return res.status(400).json({  message: 'Faltan datos requeridos: idZone e idUser son obligatorios' });
            }

            const result = losetasOnLineModel.addOrUpdateUserInZone({ idZone, idUser, invData, available })
            let message = 'OK'
            if (result == true) {

                res.status(201).json({ message: message })
            } else {
                message = "algo salido ido mal"
                res.status(500).json({ message: message })
            }
        } catch (error) {
            console.error('❌ postUserInZone error :', error);
            
            if (error.message === 'ZONE_NOT_FOUND') {
                return res.status(404).json({ 
                    message: 'Zona no encontrada' 
                });
            }
            
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}