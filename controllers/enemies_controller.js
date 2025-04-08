import { EnemiesModel } from "../models/enemies_model.js";

export class EnemiesController {
    // retornamos el numero de visitas totales
    static async getAll(req, res) {
        const { expansion, type } = req.query
        const enemies = await EnemiesModel.getAll({ expansion, type })
        res.json(enemies)
    }

    static async getById(req, res){
        const { id } = req.params

        // buscamos el mapa por su id
        const findEnemy = await EnemiesModel.getByID({id})
        // si encontramos el enemigo, lo devolvemos
        if(findEnemy){
            return res.json(findEnemy)
        }
        // si no encontramos el enemigo, devolvemos un error 404
        res.status(404).json({ message: 'Enemigo no encontrado' })
    }
}