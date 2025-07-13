import listObjects from '../databaseJSON/objects.json' with { type: "json" }

export class ObjectModel {
    // retornamos un objeto por su id
    static async getObjectByID({ id }) {
        const object = listObjects.find(object => object.id == id)
        if (!object) return null

        return object
    }

    // Filtro por nombre - retorna el primer objeto que coincida exactamente
    static filterByName(objects, name) {
        if (!name || name.trim() === '') return null
        
        const searchName = name.toLowerCase()
        
        const foundObject = objects.find(obj => {
            const nameEs = obj.translations?.es?.name?.toLowerCase() || ''
            const nameEn = obj.translations?.en?.name?.toLowerCase() || ''
            
            return nameEs === searchName || nameEn === searchName
        })
        
        return foundObject || null
    }

    // Filtro por expansión - retorna array de objetos filtrados
    static filterByExpansion(objects, expansion) {
        if (!expansion || expansion.trim() === '') return objects
        
        return objects.filter(obj => 
            obj.expansion?.toLowerCase() === expansion.toLowerCase()
        )
    }

    // Filtro por tipos - retorna array de objetos filtrados
    static filterByTypes(objects, types) {
        if (!types || !Array.isArray(types) || types.length === 0) return objects
        
        // Filtrar tipos vacíos
        const validTypes = types.filter(type => type && type.trim() !== '')
        if (validTypes.length === 0) return objects
        
        return objects.filter(obj => {
            if (!obj.types || !Array.isArray(obj.types)) return false

            return validTypes.every(type => 
                obj.types.some(objType => 
                    objType.toLowerCase() === type.toLowerCase()
                )
            )
        })
    }

    // retornamos lista de objetos filtrados
    static async searchObjects({ name, expansion, types }) {

        // Si se busca por nombre, si encuentra coincidencia, retornamos
        const foundByName = this.filterByName(listObjects, name)
        if (foundByName) {
            console.log("se ha encontrado el objeto buscado", foundByName)
            return [foundByName]
        }
        
        // Si se buscó por nombre pero no se encontró, retornamos array vacío
        if (name && name.trim() !== '') {
            return []
        }
        
        // preparamos el array que devolveremos
        let filteredObjects = listObjects

        // filtramos por expansion
        filteredObjects = this.filterByExpansion(filteredObjects, expansion)

        // filtramos por tipo de carta de objeto
        filteredObjects = this.filterByTypes(filteredObjects, types)

        // retornamos un array con los objetos filtrados
        return filteredObjects
    }

    // funcion para obtener un numero random con un numero maximo
    static getRandomNumber(maxNumber){
        return Math.floor(Math.random() * maxNumber)
    }

    // retorna SOLO un objeto aleatorio según los filtros
    static async getRandomObject({ expansion, types }) {
        // preparamos el array que devolveremos
        let filteredObjects = listObjects
        
        // Filtrar por expansión
        filteredObjects = this.filterByExpansion(filteredObjects, expansion)
        
        // Filtrar por tipos
        filteredObjects = this.filterByTypes(filteredObjects, types)
        
        // Si no hay objetos que coincidan, retornamos null
        if (filteredObjects.length === 0) {
            return null
        }
        
        // Seleccionamos un objeto aleatorio
        const randomIndex = this.getRandomNumber(filteredObjects.length)
        const randomObject = filteredObjects[randomIndex]
        
        console.log(`🎲 Objeto aleatorio seleccionado: ${randomObject.translations?.es?.name || randomObject.id}`)
        
        return randomObject
    }
}