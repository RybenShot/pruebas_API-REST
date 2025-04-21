import { Router } from "express";
import { ObjectsController } from "../controllers/objects_controller.js";

const objectsRouter = Router()

// BUSCAMOS el objeto por su ID
objectsRouter.get('/:id', ObjectsController.getById)

export default objectsRouter