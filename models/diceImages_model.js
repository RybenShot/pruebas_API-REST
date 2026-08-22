import mongoose from 'mongoose'
import sharp from 'sharp'
import { randomUUID } from 'node:crypto'

// Límites de la personalización de dados
export const MAX_DICE_IMAGES  = 5
export const MAX_IMAGE_BYTES  = 150 * 1024 // 150 KB garantizados tras comprimir (no del archivo original)
export const DICE_IMAGE_SIDE  = 256        // lado del cuadrado final, en píxeles

const DiceImages = mongoose.model('DiceImages', new mongoose.Schema({
    idUser: { type: String, required: true, unique: true },
    images: [{
        id:        { type: String, required: true },
        data:      { type: String, required: true }, // data URL en base64 (siempre image/webp tras comprimir)
        createdAt: { type: Number, required: true }
    }]
}))

// Recorta a cuadrado y comprime hasta que quepa en MAX_IMAGE_BYTES.
// El recorte a cuadrado ya lo hace el cliente (canvas) antes de subir; aquí lo
// repetimos igualmente por si acaso, para no depender de que el cliente lo cumpla.
async function compressToSquare(dataUrl) {
    const base64Input = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const inputBuffer = Buffer.from(base64Input, 'base64')

    let side = DICE_IMAGE_SIDE
    for (let intento = 0; intento < 4; intento++) {
        for (const quality of [80, 65, 50, 35, 20]) {
            const outputBuffer = await sharp(inputBuffer)
                .resize(side, side, { fit: 'cover' })
                .webp({ quality })
                .toBuffer()

            if (outputBuffer.length <= MAX_IMAGE_BYTES) {
                return `data:image/webp;base64,${outputBuffer.toString('base64')}`
            }
        }
        // Si ni con la calidad más baja entra, reducimos también el lado y reintentamos
        side = Math.round(side * 0.75)
    }

    throw new Error('IMAGE_TOO_LARGE')
}

export class DiceImagesModel {

    static async getByUser({ idUser }) {
        const doc = await DiceImages.findOne({ idUser })
        return doc ? doc.images : []
    }

    static async addImage({ idUser, data }) {
        if (typeof idUser !== 'string' || !idUser) throw new Error('INVALID_USER')
        if (typeof data !== 'string' || !data.startsWith('data:image/')) throw new Error('INVALID_IMAGE')

        let compressedData
        try {
            compressedData = await compressToSquare(data)
        } catch (error) {
            if (error.message === 'IMAGE_TOO_LARGE') throw error
            console.error('❌ Error al procesar la imagen con sharp:', error)
            throw new Error('INVALID_IMAGE')
        }

        let doc = await DiceImages.findOne({ idUser })
        if (!doc) {
            doc = await DiceImages.create({ idUser, images: [] })
        }

        if (doc.images.length >= MAX_DICE_IMAGES) throw new Error('LIMIT_EXCEEDED')

        const image = { id: randomUUID(), data: compressedData, createdAt: Date.now() }
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
