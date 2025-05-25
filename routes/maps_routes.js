import { Router } from "express";
import { MapsController } from "../controllers/maps_controller.js";

const mapsRouter = Router()
// PEDIMOS todos los mapas o filtramos por expansion
mapsRouter.get('/', MapsController.getAll)

// Listamos todos los previewMapas
mapsRouter.get('/previewMap', MapsController.getPreviewMap)

// BUSCAMOS los enemigos del mapa
mapsRouter.get('/enemies/:id',  MapsController.getAllEnemies)

// BUSCAMOS un mapa por la ID
mapsRouter.get('/:id',  MapsController.getById)

// Edicion de mapa para votacion de like y dislike
mapsRouter.post('/likeDislike', MapsController.likeDislike)

// Desabilitamos por ahora estas opciones para evitar problemas
// CREAMOS un nuevo mapa
//mapsRouter.post('/', MapsController.createNewMap )
// BORRAMOS un mapa
//mapsRouter.delete('/:id', MapsController.deleteMap )
// ACTUALIZAMOS un mapa
//mapsRouter.patch('/:id', MapsController.updateMap )

export default mapsRouter