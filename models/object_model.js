import listObjects from '../databaseJSON/objects.json' with { type: "json" }

export class ObjectModel {
    // retornamos un objeto por su id
    static async getByID({ id }) {
        const object = listObjects.find(object => object.id == id)
        if (!object) return null

        return object
    }
}