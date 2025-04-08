import { Router } from "express";
import { EnemiesController } from "../controllers/enemies_controller.js";

const enemiesRouter = Router()

// PEDIMOS todas las visitas que haya en la web
enemiesRouter.get('/', EnemiesController.getAll)
// BUSCAMOS un enemigo por la id
enemiesRouter.get('/:id', EnemiesController.getById)

export default enemiesRouter;