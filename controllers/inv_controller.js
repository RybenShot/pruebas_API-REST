import { InvModel } from "../models/inv_model.js";
import { validateInv, validatePartialInv } from '../schemas/inv_schema.js'

export class InvController {
    static async getAll(req, res) {
        // capturamos el arquetipo pasado por query
        const { archetype } = req.query

        // llamamos al modelo para que nos devuelva los investigadores
        const inv = await InvModel.getAll({ archetype })

        // devolvemos los investigadores
        res.json(inv)
    }

    static async getAllPreview(req, res){
        // capturamos el rol por la url
        const { rol } = req.query

        //llamamos al modelo para que nos devuelva el preview de los investigadores segun el rol pasado
        const previewInv = await InvModel.getAllPreview({ rol })

        res.json(previewInv)
    }

    static async getById (req, res) {
        // capturamos la id pasada por URL
        const { id } = req.params

        // llamamos al modelo para que nos devuelva el investigador concreto
        const inv = await InvModel.getByID({ id })

        // si se ha encontrado exitosamente el investigador, lo devolvemos
        if (inv) return res.json(inv)
    
        // aqui llegara si no ha encontrado el investigador
        res.status(404).json({ message: 'Investigador no encontrado' })
    }

    static async createInv(req, res) {
        const result = validateInv(req.body)
        
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues })
        }
    
        const newInv = await InvModel.createInv({input: result.data})
    
        res.status(201).json(newInv)
    }

    static async deleteInv (req, res){
        // capturamos la id pasada por URL
        const {id} = req.params

        // llamamos al modelo para que borre el investigador
        const invEliminate = await InvModel.deleteInv({id})

        // si no se ha encontrado el investigador, devolvemos un 404
        if (!invEliminate) return res.status(404).json({ message: 'Investigador no encontrado' })
        
        // si se ha eliminado correctamente, devolvemos un 200
        return res.json({ message: 'Investigador eliminado' })
    }

    static async updateInv (req, res) {
        // validamos los datos del body
        const result = validatePartialInv(req.body)

        // si hay errores, devolvemos un 400 con los errores
        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        // capturamos la id pasada por URL
        const { id } = req.params
    
        const updateInv = await InvModel.updateInv({ id, input: result.data })
    
        return res.json(updateInv)
    }
}