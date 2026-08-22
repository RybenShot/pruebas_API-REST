import { Router } from "express";
import { AchievementsController } from "../controllers/achievements_controller.js";

const achievementsRouter = Router()

// GET de los logros desbloqueados por un usuario
achievementsRouter.get('/:idUser', AchievementsController.getByUser)

// POST para desbloquear un logro (idempotente)
achievementsRouter.post('/', AchievementsController.unlock)

// POST para reclamar la recompensa en monedas de un logro ya desbloqueado
achievementsRouter.post('/claim', AchievementsController.claim)

export default achievementsRouter;
