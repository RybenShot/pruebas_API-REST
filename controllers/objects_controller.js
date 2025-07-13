import { ObjectModel } from '../models/object_model.js';

export class ObjectsController {
    // retornamos un objeto por su id
    static async getObjectById (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getObjectById --- recibid:', id);

            const findObject = await ObjectModel.getObjectByID({ id })
            if (!findObject) return res.status(404).json({ message: 'Objeto no encontrado' }) 
        
            res.json(findObject)
        } catch (error) {
            console.error('❌ getObjectById error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos lista de objetos que coincidan con el filtro
    static async searchObjects(req, res) {
        try {
            const { name, expansion, types } = req.body
            console.log('🔍 --- searchObjects --- recibido:', { name, expansion, types });

            const filteredObjects = await ObjectModel.searchObjects({ name, expansion, types })
            
            res.json(filteredObjects)
        } catch (error) {
            console.error('❌ searchObjects error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos SOLO un objeto aleatorio según los filtros
    static async getRandomObject(req, res) {
        try {
            const { expansion, types } = req.body
            console.log('🎲 --- getRandomObject --- recibido:', { expansion, types });

            const randomObject = await ObjectModel.getRandomObject({ expansion, types })
            
            if (!randomObject) {
                return res.status(404).json({ message: 'No se encontraron objetos con los filtros especificados' })
            }
            
            res.json(randomObject)
        } catch (error) {
            console.error('❌ getRandomObject error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}