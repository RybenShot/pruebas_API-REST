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


// ===========================================
// FASE 1 - JUEGO: TIRADA INICIAL
// ===========================================

// PUT - Tirada inicial de dados (1d6)
interactionsRouter.put('/initialRoll/:id', InteractionsController.initialRoll)

// GET - Consultar si es mi turno
interactionsRouter.get('/myTurn/:id', InteractionsController.checkMyTurn)

// FASE 2  
//interactionsRouter.put('/sendHits/:id', InteractionsController.sendHits)

// FASE X
//interactionsRouter.put('/abandon/:id', InteractionsController.abandonGame)
//interactionsRouter.put('/timeout/:id', InteractionsController.timeoutGame)

export default interactionsRouter;