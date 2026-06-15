import { InvInPlayModel } from '../models/invInPlay_model.js'

export class InvInPlayController {

    static async getAllInvOnLine(req, res){
        try {
            const all = await InvInPlay.find({})
            res.json(all)
        } catch (error) {
            console.error('❌ getAllInvOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getInvOnLineById(req, res){
        try {
            const { id } = req.params
            const findInvOnLine = await InvInPlayModel.getInvOnLineById({ id })
            if (!findInvOnLine) return res.status(404).json({ message: 'investigador On-Line no encontrado' })
            res.json(findInvOnLine)
        } catch (error) {
            console.error('❌ getInvOnLineById error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getAllInvOnLineByUser(req, res){
        try {
            const { id } = req.params
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

    static async createNewInvOnLine(req, res){
        try {
            const investigadorData = req.body
            console.log('➕ --- createNewInvOnLine --- recibido:', investigadorData.id || 'sin ID');

            if (!investigadorData.idUser) {
                return res.status(400).json({ message: 'Faltan datos requeridos: idUser es obligatorio' });
            }

            const newInvestigador = await InvInPlayModel.createOrUpdateInvOnLine({ investigadorData })
            res.status(201).json({ message: 'Investigador guardado exitosamente', investigador: newInvestigador })

        } catch (error) {
            console.error('❌ createNewInvOnLine error :', error);
            if (error.message === 'LIMIT_EXCEEDED') {
                return res.status(400).json({ message: 'No puedes tener más de 10 investigadores guardados' });
            }
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async deleteInvOnLine(req, res){
        try {
            const { id, idUser } = req.body
            if (!id || !idUser) {
                return res.status(400).json({ message: 'Faltan datos requeridos: id e idUser son obligatorios' });
            }

            const deleted = await InvInPlayModel.deleteInvOnLine({ id, idUser })
            if (!deleted) {
                return res.status(404).json({ message: 'Investigador no encontrado o no pertenece al usuario especificado' })
            }

            res.json({ message: 'Investigador eliminado exitosamente', id })
        } catch (error) {
            console.error('❌ deleteInvOnLine error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}