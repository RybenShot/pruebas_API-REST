import { Router } from "express";
import { VisitsController } from "../controllers/visits_controller.js";

const visitsRouter = Router()

// PEDIMOS todas las visitas que haya en la web
visitsRouter.get('/', VisitsController.getAll)
// aumentamos 1 la visita
visitsRouter.post('/', VisitsController.addVisit)

export default visitsRouter;