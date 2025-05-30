import { Router } from "express";
import { InvController } from "../controllers/inv_controller.js";

const invRouter = Router()
// PEDIMOS todos los previerw de investigadores o filtramos por rol
invRouter.get('/previewList', InvController.getAllPreview)

// PEDIMOS todos los investigadores o filtramos por arquetipo
invRouter.get('/', InvController.getAll)
// OBTENER los objetos iniciales de un investigador
invRouter.get('/:id/objects', InvController.getInvObjects)
// PEDIMOS un investigador por la ID
invRouter.get('/:id',  InvController.getById)
// CREAMOS un nuevo investigador
invRouter.post('/', InvController.createInv )

// PEDIMOS votacion de investigador de like y dislike
invRouter.get('/likeDislike/:id', InvController.getLikeDislike)

// Edicion de investigador para votacion de like y dislike
invRouter.post('/likeDislike', InvController.likeDislike)

// get de los comentarios de un mapa
invRouter.get('/comments/:id', InvController.getComments)

// post para comentario sobre un mapa
invRouter.post('/comments', InvController.postComment)

// BORRAMOS un investigador
// invRouter.delete('/:id', InvController.deleteInv )
// ACTUALIZAMOS un investigador
// invRouter.patch('/:id', InvController.updateInv )

export default invRouter