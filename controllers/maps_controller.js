import { MapModel } from "../models/maps_model.js";
import { validateMap, validatePartialMap } from '../schemas/maps_schema.js'
import listPreviewMaps from '../databaseJSON/previewMaps.json' with { type: "json" }


export class MapsController {
    // retornamos lista de mapas por expansion o todos los mapas
    static async getAll(req, res) {
        const { expansion } = req.query
        const maps = await MapModel.getAll({ expansion })
        res.json(maps)
    }

    // retornamos un mapa por su id
    static async getById (req, res) {
        const { id } = req.params
        
        const findMap = await MapModel.getByID({ id })
        if (findMap) return res.json(findMap)
    
        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    static getPreviewMap (req, res) {
        res.json(listPreviewMaps)
    }

    // Desabilitamos por ahora estas opciones para evitar problemas
    /*
    // creamos un nuevo mapa
    static async createNewMap(req, res) {
        const result = validateMap(req.body)
        
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues })
        }
    
        const newMap = await MapModel.createNewMap({input: result.data})
    
        res.status(201).json(newMap)
    }

    // borramos un mapa
    static async deleteMap (req, res){
        const {id} = req.params

        const mapEliminate = await MapModel.deleteMap({id})

        if (!mapEliminate) return res.status(404).json({ message: 'Mapa no encontrado' })
        return res.json({ message: 'Mapa eliminado' })
    }

    // actualizamos un mapa
    static async updateMap (req, res) {
        const result = validatePartialMap(req.body)

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
        const { id } = req.params
    
        const updateMap = await MapModel.updateMap({ id, input: result.data })
    
        return res.json(updateMap)
    }
        */
}