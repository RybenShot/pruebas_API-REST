import { MapModel } from "../models/maps_model.js";
import { validateMap, validatePartialMap } from '../schemas/maps_schema.js'
// por limpieza de codigo, esta importacion de kscoon deberiamos hacerla en el model pero lo dejamos asi pr ahora para atender otros asuntos
import listPreviewMaps from '../databaseJSON/previewMaps.json' with { type: "json" }


export class MapsController {
    // retornamos lista de mapas por expansion o todos los mapas
    static async getAll(req, res) {
        const { expansion } = req.query
        const maps = await MapModel.getAll({ expansion })
        res.json(maps)
    }

    static getPreviewMap (req, res) {
        res.json(listPreviewMaps)
    }

    static async getAllEnemies (req, res){
        // capturamos la id
        const { id } = req.params
        let listEnemies = await MapModel.getAllEnemies({ id })
        // si no hay enemigos, devolvemos un mensaje
        if (listEnemies.length === 0) {
            return res.status(404).json({ message: 'No se han encontrado enemigos para el mapa solicitado' })
        }

        res.json(listEnemies)
    }

    // retornamos un mapa por su id
    static async getById (req, res) {
        const { id } = req.params
        
        const findMap = await MapModel.getByID({ id })
        if (findMap) return res.json(findMap)
    
        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    // retornamos likes dislikes de un mapa
    static async getLikeDislike (req, res) {
        const { id } = req.params

        const findMap = await MapModel.getLikeDislike( id )
        if (findMap) return res.json(findMap)

        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    // votacion de like dislike de Usuario
    static async likeDislike (req, res) {
        const { idMap, idUser, value} = req.body

        // console.log('idMap', idMap, 'idUser', idUser, 'value', value)

        const mapEdited = await MapModel.likeDislike({ idMap, idUser, value })

        if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
        
        return res.json(mapEdited)
    }

    static async getTimeEstimated (req, res) {
        const { id } = req.params

        const findMap = await MapModel.getTimeEstimated( id )
        if (findMap) return res.json(findMap)

        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    // tiempo estimado de Usuario
    static async timeEstimated (req, res){
        const { idMap, idUser, value} = req.body

        const mapEdited = await MapModel.timeEstimated({idMap, idUser, value})

        if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
        
        return res.json(mapEdited)

    }

     // PEDIMOS media de dificultad de mapa
    static async getDifficultyMap (req, res) {
        const { id } = req.params

        const findMap = await MapModel.getDifficultyMap( id )
        if (findMap) return res.json(findMap)

        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    // votacion de dificultad de mapa
    static async postDifficultyMap (req, res){
        const { idMap, idUser, value} = req.body

        const mapEdited = await MapModel.postDifficultyMap({idMap, idUser, value})

        if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
        
        return res.json(mapEdited)

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