import { Router } from "express";
import { losetasOnLineController } from "../controllers/losetasOnLine_controller.js";

const losetasOnLineRouter = Router()

// GET Numero de usuarios que hay OnLine
losetasOnLineRouter.get('/', losetasOnLineController.getAllDataLosetas)

// GET Numero de usuarios que hay OnLine
losetasOnLineRouter.get('/allUsersOnLine', losetasOnLineController.getAllUsersOnLine)

// GET usuarios conectados en una zona específica
losetasOnLineRouter.get('/zone/:id', losetasOnLineController.getAllUsers1ZoneOnLine)

// GET Obtener 1 investigador random actualmente conectado de una zona concreta
losetasOnLineRouter.get('/randomInvInZone/:id/:idUser', losetasOnLineController.getRandomUserInZone)

// POST de nuevo investigador a una zona concreta
losetasOnLineRouter.post('/newInvZone', losetasOnLineController.postUserInZone)

export default losetasOnLineRouter;