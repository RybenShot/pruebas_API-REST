import { Router } from "express";
import { InvController } from "../controllers/inv_controller.js";

const invRouter = Router()
// PEDIMOS todos los previerw de investigadores o filtramos por rol
invRouter.get('/previewList', InvController.getAllPreview)

// PEDIMOS todos los investigadores o filtramos por arquetipo
invRouter.get('/', InvController.getAll)
// PEDIMOS un investigador por la ID
invRouter.get('/:id',  InvController.getById)
// CREAMOS un nuevo investigador
invRouter.post('/', InvController.createInv )
// BORRAMOS un investigador
invRouter.delete('/:id', InvController.deleteInv )
// ACTUALIZAMOS un investigador
invRouter.patch('/:id', InvController.updateInv )

export default invRouter