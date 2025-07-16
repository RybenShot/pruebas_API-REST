import { Router } from "express";
import { InvInPlayController } from "../controllers/invInPlay_controller.js";

const invInPlayRouter = Router()

// GET todos los investigadores on_Line
invInPlayRouter.get('/', InvInPlayController.getAllInvOnLine)

// GET de un investigador por la ID
invInPlayRouter.get('/:id', InvInPlayController.getInvOnLineById)

// GET de todos los investigadores on_Line de un usuario concreto
invInPlayRouter.get('/users/:id', InvInPlayController.getAllInvOnLineByUser)

// POST para guardar un investigador on-line
invInPlayRouter.post('/', InvInPlayController.createNewInvOnLine)

// POST para borrar un investigador on-line
invInPlayRouter.post('/deleteInvOnLine', InvInPlayController.deleteInvOnLine)

export default invInPlayRouter;