import { DiceImagesModel, MAX_DICE_IMAGES, MAX_IMAGE_BYTES } from '../models/diceImages_model.js'

export class DiceImagesController {

    static async getByUser(req, res) {
        try {
            const { idUser } = req.params
            const images = await DiceImagesModel.getByUser({ idUser })
            res.json({ images })
        } catch (error) {
            console.error('❌ getByUser (diceImages) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async addImage(req, res) {
        try {
            const { idUser, data } = req.body
            if (!idUser || !data) {
                return res.status(400).json({ message: 'Faltan datos requeridos: idUser y data son obligatorios' })
            }

            const images = await DiceImagesModel.addImage({ idUser, data })
            res.status(201).json({ message: 'Imagen guardada exitosamente', images })

        } catch (error) {
            if (error.message === 'LIMIT_EXCEEDED') {
                return res.status(400).json({ message: `No puedes tener más de ${MAX_DICE_IMAGES} imágenes de dados guardadas` })
            }
            if (error.message === 'IMAGE_TOO_LARGE') {
                return res.status(400).json({ message: `La imagen supera el tamaño máximo permitido (${Math.round(MAX_IMAGE_BYTES / 1024)} KB)` })
            }
            if (error.message === 'INVALID_IMAGE' || error.message === 'INVALID_USER') {
                return res.status(400).json({ message: 'Datos de imagen inválidos' })
            }
            console.error('❌ addImage (diceImages) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }

    static async deleteImage(req, res) {
        try {
            const { idUser, imageId } = req.body
            if (!idUser || !imageId) {
                return res.status(400).json({ message: 'Faltan datos requeridos: idUser e imageId son obligatorios' })
            }

            const images = await DiceImagesModel.deleteImage({ idUser, imageId })
            if (!images) {
                return res.status(404).json({ message: 'Imagen no encontrada' })
            }

            res.json({ message: 'Imagen eliminada exitosamente', images })
        } catch (error) {
            console.error('❌ deleteImage (diceImages) error :', error)
            return res.status(500).json({ message: 'Error interno' })
        }
    }
}
