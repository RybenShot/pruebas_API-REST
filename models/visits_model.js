import mongoose from 'mongoose'

const visitsSchema = new mongoose.Schema({
    contadorVisitasTotales: { type: Number, default: 8000 }
})

const Visits = mongoose.model('Visits', visitsSchema)

export class VisitsModel {
    static async getAll() {
        let doc = await Visits.findOne()
        if (!doc) doc = await Visits.create({ contadorVisitasTotales: 0 })
        return doc
    }

    static async addVisit() {
        const doc = await Visits.findOneAndUpdate(
            {},
            { $inc: { contadorVisitasTotales: 1 } },
            { new: true, upsert: true }
        )
        return doc
    }
}