import visitsJSON from '../databaseJSON/general.json' with {type: "json"};
import { writeFileSync } from 'fs';

export class VisitsModel {
    // retornamos el numero de visitas totales
    static async getAll(){
        return visitsJSON
    }

    // aumentamos 1 la visita
    static async addVisit(){
        // Suma 1 a ambos contadores
        visitsJSON.contadorVisitasTotales += 1;
        // console.log("se ha añadido una nueva visita")
        writeFileSync("databaseJSON/general.json", JSON.stringify(visitsJSON, null, 2))
        return visitsJSON
    }
}