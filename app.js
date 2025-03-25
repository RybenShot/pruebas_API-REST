import express, { json } from 'express'
import cors from 'cors'

import logVisit from './middlewares/logger.js'
import fs from 'fs'

import invRouter from './routes/inv_routes.js'
import mapsRouter from './routes/maps_routes.js'
import visitsRouter from './routes/visits_routes.js'

const app = express()
app.use(logVisit)
// middleware para la captura de parametros de POST
app.use(json())
app.use(cors())
app.disable('x-powered-by')

// rutas definidas
app.use('/inv', invRouter)
app.use('/maps', mapsRouter)
app.use('/visits', visitsRouter)

// Middlewares para manejar rutas no definidas o el de bienvenida
    // Wellcome y 404
app.get('/', (req, res) => { res.json({ message: 'Bienvenido, querido investigador' }) })

app.get('/logs', (req, res) => {
    fs.readFile('logs/visitas.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo leer el archivo de logs' });
        }
        res.json(JSON.parse(data));
    });
});
app.use((req, res) => { res.status(404).send('<h1>404, ruta no encontrada</h1>') })

// Levantar servidor
const PORT = process.env.PORT ?? 1234
app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://localhost:${PORT}`)
})
