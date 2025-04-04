import { Router } from "express";
import { MapsController } from "../controllers/maps_controller.js";

const mapsRouter = Router()

// Listamos todos los previewMapas
mapsRouter.get('/previewMap', MapsController.getPreviewMap)

// PEDIMOS todos los mapas o filtramos por expansion
mapsRouter.get('/', MapsController.getAll)
// PEDIMOS un mapa por la ID
mapsRouter.get('/:id',  MapsController.getById)

// Desabilitamos por ahora estas opciones para evitar problemas
// CREAMOS un nuevo mapa
//mapsRouter.post('/', MapsController.createNewMap )
// BORRAMOS un mapa
//mapsRouter.delete('/:id', MapsController.deleteMap )
// ACTUALIZAMOS un mapa
//mapsRouter.patch('/:id', MapsController.updateMap )

export default mapsRouter