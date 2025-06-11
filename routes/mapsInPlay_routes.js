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

// PEDIMOS una ficha de mitos de la reserva de mitos y editamos la misma
mapsInPlayRouter.post('/:id/token', MapsInPlayController.manageMythToken)

// BUSCAMOS todos los mapas creados por un usuario
mapsInPlayRouter.get('/users/:id', MapsInPlayController.getAllMapsByUser)

export default mapsInPlayRouter