import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'

// Límites de la personalización de dados
export const MAX_DICE_IMAGES = 5
export const MAX_IMAGE_BYTES = 250 * 1024 // 250 KB por imagen (tamaño del archivo original, no del base64)

const DiceImages = mongoose.model('DiceImages', new mongoose.Schema({
    idUser: { type: String, required: true, unique: true },
    images: [{
        id:        { type: String, required: true },
        data:      { type: String, required: true }, // data URL en base64 (image/png, image/jpeg, image/webp)
        createdAt: { type: Number, required: true }
    }]
}))

// Estima el tamaño en bytes del archivo original a partir de un data URL en base64
function estimateBase64Bytes(dataUrl) {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const padding = (base64.endsWith('==')) ? 2 : (base64.endsWith('=') ? 1 : 0)
    return Math.floor((base64.length * 3) / 4) - padding
}

export class DiceImagesModel {

    static async getByUser({ idUser }) {
        const doc = await DiceImages.findOne({ idUser })
        return doc ? doc.images : []
    }

    static async addImage({ idUser, data }) {
        if (typeof idUser !== 'string' || !idUser) throw new Error('INVALID_USER')
        if (typeof data !== 'string' || !data.startsWith('data:image/')) throw new Error('INVALID_IMAGE')

        const size = estimateBase64Bytes(data)
        if (size > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE')

        let doc = await DiceImages.findOne({ idUser })
        if (!doc) {
            doc = await DiceImages.create({ idUser, images: [] })
        }

        if (doc.images.length >= MAX_DICE_IMAGES) throw new Error('LIMIT_EXCEEDED')

        const image = { id: randomUUID(), data, createdAt: Date.now() }
        doc.images.push(image)
        doc.markModified('images')
        await doc.save()
        return doc.images
    }

    static async deleteImage({ idUser, imageId }) {
        const doc = await DiceImages.findOne({ idUser })
        if (!doc) return null

        const index = doc.images.findIndex(img => img.id === imageId)
        if (index === -1) return null

        doc.images.splice(index, 1)
        doc.markModified('images')
        await doc.save()
        return doc.images
    }
}
