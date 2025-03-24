import { VisitsModel } from "../models/visits_model.js";

export class VisitsController {
    // retornamos el numero de visitas totales
    static async getAll(req, res) {
        const visits = await VisitsModel.getAll()
        res.json(visits)
    }

    // aumentamos 1 la visita
    static async addVisit(req, res) {
        const newVisit = await VisitsModel.addVisit()
        res.json(newVisit)
    }
}