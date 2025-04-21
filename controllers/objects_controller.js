import { ObjectModel } from '../models/object_model.js';

export class ObjectsController {
    // retornamos un objeto por su id
    static async getById (req, res) {
        const { id } = req.params

        const findObject = await ObjectModel.getByID({ id })
        if (findObject) return res.json(findObject)
    
        res.status(404).json({ message: 'Objeto no encontrado' })
    }
}