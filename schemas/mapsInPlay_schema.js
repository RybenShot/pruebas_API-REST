import z from 'zod'

const mapSchema = z.object({
    title: z.string({
        invalid_type_error: 'El título del mapa debe ser un string',
        required_error: 'El título del mapa es requerido'
    }),
    fechaDeInicio: z.number({
        invalid_type_error: 'La fecha de creacion debe estar en formato_______',
        required_error: 'La fecha de creacion es requerido'
    }),
    lastEddited: z.number({
        invalid_type_error: 'La fecha de edicion debe estar en formato_______',
        required_error: 'La fecha de edicion es requerido'
    }),
    IDUserHost: z.number({
        invalid_type_error: 'la id del usuario debe estar en formato numerico',
        required_error: 'la id del usuario del mapa de juego es requerida'
    }),
    mythosReserve: z.object({
        doom: z.number().int().nonnegative(),
        enemies: z.number().int().nonnegative(),
        clues: z.number().int().nonnegative(),
        newspaper: z.number().int().nonnegative(),
        explosion: z.number().int().nonnegative(),
        retribution: z.number().int().nonnegative(),
        empty: z.number().int().nonnegative()
    }),
    variables: z.object({
        dooms: z.number().int().nonnegative(),
        clues: z.number().int().nonnegative(),
    }),

})

export function validateMapInPlay(map){
    return mapSchema.safeParse(map)
}
export function validatePartialMapInPlay(map){
    return mapSchema.partial().safeParse(map)
}