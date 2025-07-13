import { Router } from "express";
import { ObjectsController } from "../controllers/objects_controller.js";

const objectsRouter = Router()

// BUSCAMOS el objeto por su ID
objectsRouter.get('/:id', ObjectsController.getObjectById)

// POST para buscar objetos con filtros
objectsRouter.post('/', ObjectsController.searchObjects)

// POST para obtener un objeto aleatorio con filtros
objectsRouter.post('/getRandomObject', ObjectsController.getRandomObject)

export default objectsRouter