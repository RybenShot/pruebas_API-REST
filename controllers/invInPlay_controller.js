import {InvInPlayModel} from '../models/invInPlay_model.js'

import listInvInPlay from '../databaseJSON/invInPlay.json' with { type: "json" }

export class InvInPlayController {
    // GET todos los investigadores On-Line
    static async getAllInvOnLine(req, res){
        try {
            console.log('🔍 --- getAllInvOnLine --- ');
            res.json(listInvInPlay)
        } catch (error) {
            console.error('❌ getAllInvOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET de un investigador On-Line por la ID
    static async getInvOnLineById(req, res){
        try {
            const { id } = req.params
            console.log('🔍 --- getAllInvOnLine --- recibid:', id);

            const findInvOnLine = await InvInPlayModel.getInvOnLineById({ id })
            if (!findInvOnLine) return res.status(404).json({ message: 'investigador On-Line no encontrado' })

            res.json(findInvOnLine)

        } catch (error) {
            console.error('❌ getInvOnLineById error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // GET de todos los investigadores On-Line de un usuario concreto
    static async getAllInvOnLineByUser(req, res){
        try {
            const { id } = req.params
            console.log('🔍 --- getAllInvOnLineByUser --- recibid:', id);

            const findListInvByUser = await InvInPlayModel.getAllInvOnLineByUser({ id })
            if (!findListInvByUser || findListInvByUser.length === 0) {
                return res.status(404).json({ message: 'No se encontraron investigadores On-Line para este usuario' })
            }

            res.json(findListInvByUser)
        } catch (error) {
            console.error('❌ getAllInvOnLineByUser error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // POST de un nuevo investigador On_line
    static async createNewInvOnLine(req, res){
        try {
            const investigadorData = req.body
            console.log('➕ --- createNewInvOnLine --- recibido:', investigadorData.id || 'sin ID');

            // Validaciones básicas
            if (!investigadorData.idUser) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: idUser es obligatorio' 
                });
            }

            const newInvestigador = await InvInPlayModel.createOrUpdateInvOnLine({ investigadorData })
            
            res.status(201).json({
                message: 'Investigador guardado exitosamente',
                investigador: newInvestigador
            })

        } catch (error) {
            console.error('❌ createNewInvOnLine error :', error);
            
            if (error.message === 'LIMIT_EXCEEDED') {
                return res.status(400).json({ 
                    message: 'No puedes tener más de 10 investigadores guardados' 
                });
            }
            
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // DELETE de un investigador On_line
    static async deleteInvOnLine(req, res){
        try {
            const { id, idUser } = req.body
            console.log('🗑️ --- deleteInvOnLine --- recibido:', id, idUser);

            // Validaciones básicas
            if (!id || !idUser) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: id e idUser son obligatorios' 
                });
            }

            const deleted = await InvInPlayModel.deleteInvOnLine({ id, idUser })
            
            if (!deleted) {
                return res.status(404).json({
                    message: 'Investigador no encontrado o no pertenece al usuario especificado'
                })
            }

            res.json({
                message: 'Investigador eliminado exitosamente',
                id: id
            })

        } catch (error) {
            console.error('❌ deleteInvOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}