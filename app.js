const express = require('express')
const crypto = require('node:crypto')
const fs = require('fs')
const cors = require('cors')

const listaInvestigadoresJSON = require('./listaInvestigadores.json')
const { validateInvestigador, validatePartialInvestigador } = require('./schemas/investigadoresSchemas')

const app = express()
// middleware para la captura de parametros de POST
app.use(express.json())
app.use(cors())
app.disable('x-powered-by')

// Wellcome
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido, querido investigador' })
})

// Recuperamos todos los investigadores o filtramos por arquetipo
app.get('/investigadores', (req, res) => {
    const { arquetipo } = req.query

    if (arquetipo) {
        const filtroArquetipo = listaInvestigadoresJSON.filter(
            investigador => investigador.arquetipos.some(
                tipo => tipo.toLowerCase() === arquetipo.toLowerCase()
            )
        )

        return res.json(filtroArquetipo)
    }

    res.json(listaInvestigadoresJSON)
})

// Recuperamos un investigador por la ID
app.get('/investigadores/:id', (req, res) => {
    const { id } = req.params
    const investigador = listaInvestigadoresJSON.find(investigador => investigador.id == id)

    if (investigador) return res.json(investigador)
    // aqui llegara si no ha encontrado el investigador
    res.status(404).json({ message: 'Investigador no encontrado' })
})

app.post('/investigadores', (req, res) => {
    const resultado = validateInvestigador(req.body)

    if (!resultado.success) {
        return res.status(400).json({ error: resultado.error.issues })
    }

    const nuevoInvestigador = {
        id: crypto.randomUUID(),
        ...resultado.data
    }

    listaInvestigadoresJSON.push(nuevoInvestigador)

    fs.writeFileSync('./listaInvestigadores.json', JSON.stringify(listaInvestigadoresJSON, null, 2))

    res.status(201).json(nuevoInvestigador)
})

app.delete('/investigadores/:id', (req, res) =>{
    // capturamos la id pasada por URL
    const {id} = req.params
    // buscamos el investigador por la id
    const investigadorIndex = listaInvestigadoresJSON.findIndex(investigador => investigador.id == id)

    if (investigadorIndex === -1) {
        return res.status(404).json({ message: 'Investigador no encontrado' })
    }

    // Eliminamos el investigador de la lista
    listaInvestigadoresJSON.splice(investigadorIndex, 1)
    // Guardamos la lista actualizada en el archivo
    fs.writeFileSync('./listaInvestigadores.json', JSON.stringify(listaInvestigadoresJSON, null, 2))

    return res.json({ message: 'Investigador eliminado' })
})

app.patch('/investigadores/:id', (req, res) => {
    const resultado = validatePartialInvestigador(req.body)

    if (!resultado.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    // capturamos la id pasada por URL
    const { id } = req.params
    // buscamos el investigador por la id
    const investigadorIndex = listaInvestigadoresJSON.findIndex(investigador => investigador.id == id)
    if (investigadorIndex === -1) {
        return res.status(404).json({ message: 'Investigador no encontrado' })
    }

    // cogemos el investigaor de la lista y lo actualizamos con los datos del body
    const investigadorActualizado = {
        ...listaInvestigadoresJSON[investigadorIndex],
        ...resultado.data
    }

    // metemos al investigador actualizado de nuevo en la lista, machacando el anterior que habia
    listaInvestigadoresJSON[investigadorIndex] = investigadorActualizado

    // Guardamos la lista actualizada en el archivo
    fs.writeFileSync('./listaInvestigadores.json', JSON.stringify(listaInvestigadoresJSON, null, 2))

    return res.json(investigadorActualizado)

})

// Middleware para manejar rutas no definidas
app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})
const PORT = process.env.PORT ?? 1234
// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://localhost:${PORT}`)
})
