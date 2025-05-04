import { Router } from "express";
import { MapsInPlayController } from "../controllers/mapsInPlay_controller.js";

const mapsInPlayRouter = Router()
// PEDIMOS todos los mapas o filtramos por expansion
mapsInPlayRouter.get('/', MapsInPlayController.getAll)

// BUSCAMOS un mapa por la ID
mapsInPlayRouter.get('/:id',  MapsInPlayController.getById)

// CREAMOS un nuevo mapa
mapsInPlayRouter.post('/', MapsInPlayController.createNewMap )
// BORRAMOS un mapa
mapsInPlayRouter.post('/deleteMapInPlay', MapsInPlayController.deleteMap )
// ACTUALIZAMOS un mapa
//mapsInPlayRouter.patch('/:id', MapsInPlayController.updateMap )

export default mapsInPlayRouter