import { Router } from "express";
import { MapsInPlayController } from "../controllers/mapsInPlay_controller.js";

const mapsInPlayRouter = Router()
// PEDIMOS todos los mapas o filtramos por expansion
mapsInPlayRouter.get('/', MapsInPlayController.getAll)
// BUSCAMOS un mapa por la ID
mapsInPlayRouter.get('/:id',  MapsInPlayController.getById)
// BUSCAMOS un mapa por la ID
mapsInPlayRouter.get('/:id/getMithToken',  MapsInPlayController.getMithToken)
// RESETEAMOS la reserva de mitos
mapsInPlayRouter.get('/:id/ressetMithReserve',  MapsInPlayController.ressetMithReserve)
// CREAMOS un nuevo mapa
mapsInPlayRouter.post('/', MapsInPlayController.createNewMap )
// BORRAMOS un mapa
mapsInPlayRouter.post('/deleteMapInPlay', MapsInPlayController.deleteMap )

// SUMAMOS O RESTAMOS a las variables de pistas y perdicion del mapa
mapsInPlayRouter.post('/:id/variable',  MapsInPlayController.adjustVariable)

mapsInPlayRouter.post('/:id/token', MapsInPlayController.manageToken)

// ACTUALIZAMOS un mapa
//mapsInPlayRouter.patch('/:id', MapsInPlayController.updateMap )

export default mapsInPlayRouter