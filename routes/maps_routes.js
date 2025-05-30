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

// PEDIMOS votacion de mapa de like y dislike
mapsRouter.get('/likeDislike/:id', MapsController.getLikeDislike)

// Edicion de mapa para votacion de like y dislike
mapsRouter.post('/likeDislike', MapsController.postLikeDislike)

// PEDIMOS media de tiempo estimado de mapa
mapsRouter.get('/timeEstimated/:id', MapsController.getTimeEstimated)

// votacion de tiempo estimadod e mapa
mapsRouter.post('/timeEstimated', MapsController.postTimeEstimated)

// PEDIMOS media de dificultad de mapa
mapsRouter.get('/difficultyMap/:id', MapsController.getDifficultyMap)

// votacion de dificultad de mapa
mapsRouter.post('/difficultyMap', MapsController.postDifficultyMap)

// PEDIMOS investigadores recomendados de un mapa
mapsRouter.get('/invRecommended/:id', MapsController.getRecInv)

// votacion de investigadores recomendados de un mapa
mapsRouter.post('/invRecommended', MapsController.postRecInv)

// get de los comentarios de un mapa
mapsRouter.get('/comments/:id', MapsController.getComments)

// post para comentario sobre un mapa
mapsRouter.post('/comments', MapsController.postComment)


// Desabilitamos por ahora estas opciones para evitar problemas
// CREAMOS un nuevo mapa
//mapsRouter.post('/', MapsController.createNewMap )
// BORRAMOS un mapa
//mapsRouter.delete('/:id', MapsController.deleteMap )
// ACTUALIZAMOS un mapa
//mapsRouter.patch('/:id', MapsController.updateMap )

export default mapsRouter