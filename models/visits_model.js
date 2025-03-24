import visitsJSON from '../databaseJSON/general.json' with {type: "json"};
import { writeFileSync } from 'fs';

export class VisitsModel {
    // retornamos el numero de visitas totales
    static async getAll(){
        return visitsJSON
    }

    // aumentamos 1 la visita
    static async addVisit(){
        const ahora = new Date();
        const ultimoReset = new Date(visitsJSON.ultimaResetSemanales);

        // Calcula la diferencia en días
        const diferenciaDias = (ahora - ultimoReset) / (1000 * 60 * 60 * 24);

        // Si han pasado 7 días o más, reinicia el contador semanal
        if (diferenciaDias >= 7) {
        visitsJSON.contadorVisitasSemanales = 0;
        visitsJSON.ultimaResetSemanales = ahora.toISOString();
        }

        // Suma 1 a ambos contadores
        visitsJSON.contadorVisitasTotales += 1;
        visitsJSON.contadorVisitasSemanales += 1;
        console.log("se ha añadido una nueva visita")
        writeFileSync("databaseJSON/general.json", JSON.stringify(visitsJSON, null, 2))
        return visitsJSON
    }
}