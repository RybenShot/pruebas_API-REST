import { MapModel } from "../models/maps_model.js";
import { validateMap, validatePartialMap } from '../schemas/maps_schema.js'
// por limpieza de codigo, esta importacion de kscoon deberiamos hacerla en el model pero lo dejamos asi pr ahora para atender otros asuntos



export class MapsController {
    // retornamos lista de mapas por expansion o todos los mapas
    static async getAll(req, res) {
        try {
            const { expansion } = req.query
            console.log('🔍 --- getAll --- recibid:', expansion);

            // si no hay expansion, devolvemos todos los mapas
            const maps = await MapModel.getAll({ expansion })
            if (!maps) {
                return res.status(404).json({ message: 'No se han encontrado mapas' })
            }
            res.status(202).json(maps)
        } catch (error) {
            console.error('❌ getAll error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos todos los previews de los mapas
    static async getPreviewMap (req, res) {
        try {
            console.log('🔍 --- getPreviewMap --- ');

            const previewMaps = await MapModel.getPreviewMap()
            if (!previewMaps) {
                return res.status(404).json({ message: 'No se han encontrado los previews de los mapas' })
            }

            res.json(previewMaps)
        } catch (error) {
            console.error('❌ getPreviewMap error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos todos los enemigos de un mapa
    static async getAllEnemies (req, res){
        try {
            // capturamos la id
            const { id } = req.params
            console.log('🔍 --- getAllEnemies --- recibid:', id);

            let listEnemies = await MapModel.getAllEnemies({ id })
            // si no hay enemigos, devolvemos un mensaje
            if (!listEnemies || listEnemies.length === 0) {
                return res.status(404).json({ message: 'No se han encontrado enemigos para el mapa solicitado' })
            }

            res.status(202).json(listEnemies)
        } catch (error) {
            console.error('❌ getAllEnemies error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos un mapa por su id
    static async getById (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getById --- recibid:', id);
            
            const findMap = await MapModel.getByID({ id })
            if (!findMap) return res.status(404).json({ message: 'Mapa no encontrado' })
        
            res.status(202).json(findMap)
        } catch (error) {
            console.error('❌ getById error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // retornamos likes dislikes de un mapa
    static async getLikeDislike (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getLikeDislike --- recibid:', id);

            const findMap = await MapModel.getLikeDislike( id )
            if (findMap) return res.status(404).json({ message: 'Mapa no encontrado' }) 
            
            res.status(202).json(findMap)
        } catch (error) {
            console.error('❌ getLikeDislike error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // votacion de like dislike de Usuario
    static async postLikeDislike (req, res) {
        try {
            const { idMap, idUser, value} = req.body
            console.log('🔍 --- postLikeDislike --- recibid:', { idMap, idUser, value });

            const mapVoted = await MapModel.postLikeDislike({ idMap, idUser, value })
            if (!mapVoted){
                return res.status(404).json({ message: 'Mapa no encontrado' })
            }
            
            res.status(202).json(mapVoted)
        } catch (error) {
            console.error('❌ postLikeDislike error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getTimeEstimated (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getTimeEstimated --- recibid:', id);

            const findMap = await MapModel.getTimeEstimated( id )
            if (!findMap) {
                return res.status(404).json({ message: 'Mapa no encontrado' })
            } 

            res.status(202).json(findMap)
        } catch (error) {
            console.error('❌ getTimeEstimated error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // tiempo estimado de Usuario
    static async postTimeEstimated (req, res){
        try {
            const { idMap, idUser, value} = req.body
            console.log('🔍 --- postTimeEstimated --- recibid:', { idMap, idUser, value });

            const mapEdited = await MapModel.postTimeEstimated({idMap, idUser, value})
            if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
            
            res.status(202).json(mapEdited)
        } catch (error) {
            console.error('❌ postTimeEstimated error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // PEDIMOS media de dificultad de mapa
    static async getDifficultyMap (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getDifficultyMap --- recibid:', id);

            const findMap = await MapModel.getDifficultyMap( id )
            if (!findMap) return res.status(404).json({ message: 'Mapa no encontrado' }) 

            res.json(findMap)
        } catch (error) {
            console.error('❌ getDifficultyMap error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // votacion de dificultad de mapa
    static async postDifficultyMap (req, res){
        try {
            const { idMap, idUser, value} = req.body
            console.log('🔍 --- postDifficultyMap --- recibid:', { idMap, idUser, value });

            const mapEdited = await MapModel.postDifficultyMap({idMap, idUser, value})

            if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
            
            res.status(202).json(mapEdited)
        } catch (error) {
            console.error('❌ postDifficultyMap error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // PEDIMOS investigadores recomendados de un mapa
    static async getRecInv (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getRecInv --- recibid:', id);

            const findMap = await MapModel.getRecInv( id )
            if (!findMap || findMap.length === 0) {
                return res.status(404).json({ message: 'Mapa no encontrado' })
            } 

            res.status(202).json(findMap)
        } catch (error) {
            console.error('❌ getRecInv error :', error);
            return res.status(500).json({ message: 'Error interno' }); 
        }
    }

    // votacion de investigadores recomendados de un mapa
    static async postRecInv (req, res){
        try {
            const { idMap, idUser, idInv, comment} = req.body
            console.log('🔍 --- postRecInv --- recibid:', { idMap, idUser, idInv, comment });

            const mapEdited = await MapModel.postRecInv({idMap, idUser, idInv, comment})

            if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
            
            res.status(202).json(mapEdited)
        } catch (error) {
            console.error('❌ postRecInv error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
        

    }

    // get de los comentarios de un mapa
    static async getComments (req, res) {
        try {
            const { id } = req.params
            console.log('🔍 --- getComments --- recibid:', id);

            const findMap = await MapModel.getComments( id )
            if (!findMap) {
                return res.status(404).json({ message: 'Mapa no encontrado' })
            } 

            res.status(202).json(findMap)
        } catch (error) {
            console.error('❌ getComments error :', error);
            return res.status(500).json({ message: 'Error interno' }); 
        }
    }

    // post para comentario sobre un mapa
    static async postComment (req, res){
        try {
            const { idMap, idUser, comment} = req.body
            console.log('🔍 --- postComment --- recibid:', { idMap, idUser, comment });

            const mapEdited = await MapModel.postComment({idMap, idUser, comment})

            if (!mapEdited) return res.status(404).json({ message: 'Mapa no encontrado' })
            
            res.status(202).json(mapEdited)
        } catch (error) {
            console.error('❌ postComment error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
        

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