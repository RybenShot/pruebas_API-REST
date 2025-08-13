import { Router } from "express";
import { InteractionsController } from "../controllers/interactions_controller.js";

const interactionsRouter = Router()

// GET todas las interacciones (admin/debug)
interactionsRouter.get('/', InteractionsController.getAllInteractions)

// GET invitaciones pendientes para el GUEST
interactionsRouter.get('/pending/:id', InteractionsController.getPendingInvitations)

// GET para polling del HOST - espera respuesta del guest
interactionsRouter.get('/poll/:id', InteractionsController.pollHostInteraction)

// PUT responder a una invitación (aceptar/denegar) - NUEVO
interactionsRouter.put('/respond/:id', InteractionsController.respondToInvitation)

// POST crear nueva interacción
interactionsRouter.post('/', InteractionsController.createInteraction)

export default interactionsRouter;