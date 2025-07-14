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
        try {
            const { id } = req.params
        
            const findMap = await MapInPlayModel.getByID({ id })
            if (!findMap) return res.status(404).json({ message: 'Mapa no encontrado' })

            res.json(findMap)  
          
        } catch (error) {
            console.error('❌ getById error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // pedimos una ficha de mitos y actualizamos la reserva de mitos
    static async getMithToken(req, res){
        try {
            const { id } = req.params
        
            const getToken = await MapInPlayModel.getToken({id})
            if (!getToken) {
                console.error('❌ No hay mas fichas de mitos en la reserva de mitos');
                return res.status(404).json({ message: "No hay mas tokens disponibles, por favor reinicia la reserva de mitos"})
            }
            
            res.json(getToken) 
        } catch (error) {
            console.error('❌ getMithToken error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // reseteamos reserva de mitos
    static async ressetMithReserve(req, res){
        try {
            const { id } = req.params
            const confirmation = await MapInPlayModel.ressetMithReserve({id})
            if(!confirmation){
                return res.status(404).json({ message: "Mapa no encontrado o error interno"})
            }

            res.status(200).json({message: "Reserva de mitos reseteada!"})
        } catch (error) {
            console.error('❌ ressetMithReserve error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
        
    }

    // creamos un nuevo mapa in play
    static async createNewMap(req, res) {
        const { idMap, IDUserHost } = req.body
        if (typeof idMap !== 'number' || typeof IDUserHost !== 'string') {
          return res.status(400).json({ error: 'idMap and IDUserHost must be numbers' })
        }
    
        try {
          const map = await MapInPlayModel.createNewMap({ idMap, IDUserHost })
          if (!map) {
            return res.status(404).json({ message: 'Base map not found' })
          }
          return res.status(201).json(map)
        } catch (error) {
            console.error('❌ createNewMap error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // borramos un mapa
    static async deleteMap (req, res){
        try {
            const success = await MapInPlayModel.deleteMap(req.body)
            if (!success) {
                // o bien contraseña incorrecta, o id no existe
                return res
                .status(404)
                .json({ message: 'Mapa in Play no encontrado o no tienes permiso para borrar el mapa.' });
            }
            // si llega hasta aqui, esque se ha eliminado correctamente el mapa in play
            return res.json({ message: 'Mapa in Play eliminado' });
        } catch (error) {
            console.error('❌ deleteMap error:', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    /**
     * POST /mapsInPlay/:id/variable
     * Body esperado: { key: 'dooms'|'clues', delta: number }
     */
    // editor de variables de pista y perdicion del mapa
    static async adjustVariable(req, res){
        const { id } = req.params
        const { key, delta } = req.body;

        try {
            const updatedMap = await MapInPlayModel.adjustVariable({ id, key, delta });
            if (!updatedMap) {
                return res.status(404).json({ message: 'Mapa no encontrado' });
            }
            return res.json({message: `Variable "${key}" actualizada.`, variables: updatedMap.variables });
        } catch (error) {
            console.error('❌ adjustVariable error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    // editor de reserva de mitos
    static async manageMythToken(req, res) {
        const { id } = req.params
        const { action, type } = req.body

        if (!['add','remove','reset'].includes(action)) {
            return res.status(400).json({ error: 'Action must be one of: add, remove, reset' })
        }

        try {
            const map = await MapInPlayModel.manageMythToken({ id, action, type })
            if (!map) {
            return res.status(404).json({ message: 'Map or token not found' })
            }
            return res.json({ message: `Token ${action}ed`, map })
        } catch (error) {
            console.error('❌ manageMythToken error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    static async getAllMapsByUser(req, res){
        try {
            const { id } = req.params
            console.log('🔍 --- getAllMapsByUser --- recibid:', id);

            const findMaps = await MapInPlayModel.getAllMapsByUser({ id })
            if (!findMaps) return res.status(404).json({ message: 'No hay mapas creados por este usuario' })
            
            res.json(findMaps)
        } catch (error) {
            console.error('❌ getAllMapsByUser error :', error);
            return res.status(500).json({ message: 'Error interno' });  
            
        }
    }

    // manejamos la tienda del mapa (añadir objetos aleatorios a la tienda o marcar como vendidos)
    static async manageShop(req, res) {
        try {
            const { action, idMapInPlay, idObject, expansion, types } = req.body
            console.log('🛒 --- manageShop --- recibido:', { action, idMapInPlay, idObject, expansion, types });

            // validamos que los parámetros sean correctos
            if (!['soled', 'add'].includes(action)) {
                return res.status(400).json({ error: 'Action debe ser "soled" o "add"' })
            }

            if (!idMapInPlay) {
                return res.status(400).json({ error: 'idMapInPlay es requerido' })
            }

            // para acción "soled" necesitamos idObject
            if (action === 'soled' && idObject === undefined) {
                return res.status(400).json({ error: 'idObject es requerido para la acción "soled"' })
            }

            // para acción "add" necesitamos filtros (expansion y/o types)
            if (action === 'add' && !expansion && !types) {
                return res.status(400).json({ error: 'Para la acción "add" se requieren filtros (expansion y/o types)' })
            }

            // llamamos al modelo para que maneje la operación de la tienda
            const result = await MapInPlayModel.manageShop({ action, idMapInPlay, idObject, expansion, types })
            
            if (!result) {
                return res.status(404).json({ message: 'Mapa no encontrado o no se pudo generar carta aleatoria' })
            }
            
            if (action === 'soled') {
                res.json({ message: 'Objeto vendido exitosamente' })
            } else {
                res.json(result.randomObject)
            }
            
        } catch (error) {
            console.error('❌ manageShop error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }


    // obtenemos todos los objetos que están en la tienda del mapa
    static async getShopItems(req, res) {
        try {
            const { id } = req.params
            console.log('🏪 --- getShopItems --- recibido:', id);

            const shopItems = await MapInPlayModel.getShopItems({ idMapInPlay: id })
            
            if (shopItems === null) {
                return res.status(404).json({ message: 'Mapa no encontrado' })
            }
            
            res.json(shopItems)
            
        } catch (error) {
            console.error('❌ getShopItems error :', error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}