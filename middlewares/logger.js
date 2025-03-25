// middlewares/logger.js
import fs from 'fs';
import path from 'path';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';

const logVisit = (req, res, next) => {
    const url = req.originalUrl;
    if (url === '/logs' || url === '/favicon.ico') {
        next();
        return;
    }
    // Obtener la IP del cliente
    const clientIp = requestIp.getClientIp(req);
    // Obtener el país basado en la IP
    const geo = geoip.lookup(clientIp);
    const country = geo ? geo.country : 'Unknown';

    // Crear el log
    const log = {
        date: new Date().toLocaleDateString('es-ES'), // Formato 'DD/MM/YYYY'
        rawDate: new Date(),
        url: url,
        ip: clientIp,
        country: country
    };

    // Determinar la ruta al archivo de logs usando path.resolve
    const logFilePath = path.resolve('logs/visitas.json');

    // Leer el archivo de logs y agregar el nuevo log
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            // Si no existe el archivo, crearlo
            const logs = [log];
            fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
                if (err) throw err;
            });
        } else {
            const logs = JSON.parse(data);
            logs.push(log);
            fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
                if (err) throw err;
            });
        }
    });

    next(); // Llamamos al siguiente middleware o ruta
};

export default logVisit;
