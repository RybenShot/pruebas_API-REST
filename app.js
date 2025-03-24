import express, { json } from 'express'
import cors from 'cors'

import invRouter from './routes/inv_routes.js'
import mapsRouter from './routes/maps_routes.js'

const app = express()
// middleware para la captura de parametros de POST
app.use(json())
app.use(cors())
app.disable('x-powered-by')

// rutas definidas
app.use('/inv', invRouter)
app.use('/maps', mapsRouter)

// Middlewares para manejar rutas no definidas o el de bienvenida
    // Wellcome y 404
app.get('/', (req, res) => { res.json({ message: 'Bienvenido, querido investigador' }) })
app.use((req, res) => { res.status(404).send('<h1>404, ruta no encontrada</h1>') })

// Levantar servidor
const PORT = process.env.PORT ?? 1234
app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://localhost:${PORT}`)
})
