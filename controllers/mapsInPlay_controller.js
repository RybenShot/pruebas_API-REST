import { MapInPlayModel } from "../models/mapsInPlay_model.js";
import { validateMapInPlay, validatePartialMapInPlay } from '../schemas/mapsInPlay_schema.js'
// por limpieza de codigo, esta importacion de kscoon deberiamos hacerla en el model pero lo dejamos asi pr ahora para atender otros asuntos
import listMapsInPlay from '../databaseJSON/mapsInPlay.json' with { type: "json" }


export class MapsInPlayController {
    // retornamos lista de mapas por expansion o todos los mapas
    static async getAll(req, res) {
        res.json(listMapsInPlay)
    }

    // retornamos un mapa por su id
    static async getById (req, res) {
        const { id } = req.params
        
        const findMap = await MapInPlayModel.getByID({ id })
        if (findMap) return res.json(findMap)
    
        res.status(404).json({ message: 'Mapa no encontrado' })
    }

    static async getMithToken(req, res){
        const { id } = req.params
        
        const getToken = await MapInPlayModel.getToken({id})
        if (!getToken) return res.status(404).json({ message: "No hay mas tokens disponibles, por favor reinicia la reserva de mitos"})
        
        res.json(getToken)
    }

    static async ressetMithReserve(req, res){
        const { id } = req.params
        const confirmation = await MapInPlayModel.ressetMithReserve({id})
        if(!confirmation){
            return res.status(404).json({ message: "Mapa no encontrado o error interno"})
        }

        return res.status(200).json({message: "Reserva de mitos reseteada!"})
    }

    // creamos un nuevo mapa
    static async createNewMap(req, res) {
        const result = validateMapInPlay(req.body)
        
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues })
        }
    
        const newMap = await MapInPlayModel.createNewMap({input: result.data})
    
        res.status(201).json(newMap)
    }

    // borramos un mapa
    static async deleteMap (req, res){
        try {
            const success = await MapInPlayModel.deleteMap(req.body)
            if (!success) {
                // o bien contraseña incorrecta, o id no existe
                return res
                .status(404)
                .json({ message: 'Mapa in Play no encontrado o contraseña incorrecta' });
            }
            // si llega hasta aqui, esque se ha eliminado correctamente el mapa in play
            return res.json({ message: 'Mapa in Play eliminado' });
        } catch (error) {
            console.error('❌ deleteMap error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // actualizamos un mapa
    static async updateMap (req, res) {
        const result = validatePartialMapInPlay(req.body)

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
        const { id } = req.params
    
        const updateMap = await MapInPlayModel.updateMap({ id, input: result.data })
    
        return res.json(updateMap)
    }
}