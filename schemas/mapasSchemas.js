const z = require('zod')

const mapaSchema = z.object({
    title: z.string({
        invalid_type_error: 'El título del mapa debe ser un string',
        required_error: 'El título del mapa es requerido'
    }),
    description: z.string({
        invalid_type_error: 'La descripción del mapa debe ser un string',
        required_error: 'La descripción del mapa es requerida'
    }),
    expansion: z.enum(['AHBase', 'AHMareas', 'AHNoche', 'AHSecretos'],
        {
            invalid_member_error: 'La expansión del mapa no es válida',
            required_error: 'La expansión del mapa es requerida'
        }
    ),
    initialSpace: z.string({
        invalid_type_error: 'El espacio inicial del mapa debe ser un string',
        required_error: 'El espacio inicial del mapa es requerido'
    }),
    reservaDeMitos: z.object({
        perdicion: z.number().int().nonnegative(),
        enemigos: z.number().int().nonnegative(),
        pistas: z.number().int().nonnegative(),
        periodico: z.number().int().nonnegative(),
        explosion: z.number().int().nonnegative(),
        retribucion: z.number().int().nonnegative(),
        vacias: z.number().int().nonnegative()
    }),
    retribution: z.string({
        invalid_type_error: 'La retribución del mapa debe ser un string',
        required_error: 'La retribución del mapa es requerida'
    }),
})

function validateMapa(mapa){
    return mapaSchema.safeParse(mapa)
}
function validatePartialMapa(mapa){
    return mapaSchema.partial().safeParse(mapa)
}

module.exports = {
    validateMapa,
    validatePartialMapa
}