import z from 'zod'

// cambiar los nombres cuand se ajuste la base de datos

const invSchema = z.object({
    nombrePJ: z.string({
        invalid_type_error: 'El nombre del investigador debe ser un string',
        required_error: 'El nombre del investigador es requerido'
    }),
    posicion: z.string({
        incalid_type_error: 'La posición del investigador debe ser un string',
        required_error: 'La posición del investigador es requerida'
    }),
    ENposicion: z.string(),
    vida: z.number().int().positive().max(10).default(6),
    arquetipos:z.array(
        z.enum(['Guardian', 'Mistico', 'Explorador', 'Buscador', 'Defensor', 'Superviviente']), 
        {
            invalid_type_error: 'El arquetipo del investigador debe ser un string',
            required_error: 'El arquetipo del investigador es requerido',
            invalid_member_error: 'El arquetipo del investigador no es válido'
        }
    )

})

export function validateInv(inv) {
    return invSchema.safeParse(inv)
}

export function validatePartialInv(inv) {
    return invSchema.partial().safeParse(inv)
}