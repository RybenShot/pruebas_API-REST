import { Router } from "express";
import { DiceImagesController } from "../controllers/diceImages_controller.js";

const diceImagesRouter = Router()

// GET de las imágenes de dados guardadas por un usuario
diceImagesRouter.get('/:idUser', DiceImagesController.getByUser)

// POST para añadir una imagen de dado (máx. 5 por usuario)
diceImagesRouter.post('/', DiceImagesController.addImage)

// POST para borrar una imagen de dado
diceImagesRouter.post('/delete', DiceImagesController.deleteImage)

export default diceImagesRouter;
