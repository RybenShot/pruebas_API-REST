import { Router } from "express";
import { MapsController } from "../controllers/maps_controller.js";

const mapsRouter = Router()

// PEDIMOS todos los mapas o filtramos por expansion
mapsRouter.get('/', MapsController.getAll)
// PEDIMOS un mapa por la ID
mapsRouter.get('/:id',  MapsController.getById)
// CREAMOS un nuevo mapa
mapsRouter.post('/', MapsController.createNewMap )
// BORRAMOS un mapa
mapsRouter.delete('/:id', MapsController.deleteMap )
// ACTUALIZAMOS un mapa
mapsRouter.patch('/:id', MapsController.updateMap )

export default mapsRouter