# < LosetasOnLine  >

sistema de seguimiento de zona de juego apra emparejar jugadores de forma remota para que interactuen entre ellos con eventos originales de esta aplicacion.

## 📋 Características

- **Gestión de zonas**: 11 zonas predefinidas del mapa de juego
- **Control de disponibilidad**: Los usuarios pueden marcarse como disponibles/no disponibles por si estos no quieren ser interrumpidos por otros jugadores
- **Selección aleatoria**: Sistema para encontrar investigadores disponibles aleatoriamente en una zona concreta del mapa
- **Limpieza automática**: Eliminación automática de usuarios inactivos (15 minutos)
- **Expansion con futuras mecanicas**: Dejamos todo lo mas documentado posible por si mas adelante se quiere hacer algo como eventos globales que imbuolucren a todos los investigadores

## 🗺️ Zonas Disponibles

| ID | Nombre |
|----|--------|
| 0 | Centro |
| 1 | Barrio Norte |
| 2 | Barrio Sur |
| 3 | Periferia |
| 4 | Distrito Comercial |
| 5 | Universidad Miskatonic |
| 6 | Barrio Fluvial |
| 7 | Barrio Este |
| 8 | Calle farola |
| 9 | Calle puente |
| 10 | Calle bosque |

## 🚀 Endpoints

### `GET losetasOnLine/` - Obtener información global

Obtiene todos los datos de todas las zonas

**Respuesta:**
```json
[
  {
    "idZone": "0",
    "nameZone": "Centro",
    "invOnLine": [...],
    "specialEvent": {}
  }
  {...},
  ...
]
```

#### `GET losetasOnLine/allUsersOnLine`
Obtiene el número total de usuarios conectados

**Respuesta:**
```json
{
  "totalUsersOnline": 5,
  "message": "Hay 5 investigadores conectados"
}
```

#### `GET losetasOnLine/zone/:id`
Obtiene información de usuarios en una zona específica

**Parámetros:**
- `id` (string): ID de la zona (0-10)

**Respuesta exitosa:**
```json
{
  "idZone": "2",
  "nameZone": "Barrio Sur",
  "userCount": 3,
  "users": [
    {
      "idUser": "user123",
      "invData": [...],
      "available": true,
      "lastEddited": 1754390929328
    }
  ],
  "specialEvent": {}
}
```

#### `GET losetasOnLine/randomInvInZone/:id`
Obtiene un investigador aleatorio disponible de una zona específica

**Parámetros:**
- `id` (string): ID de la zona (0-10)

**Respuesta exitosa:**
```json
{
  "user": {
    "idUser": "user123",
    "invData": [...],
    "available": true,
    "lastEddited": 1754390929328
  },
  "zone": {
    "idZone": "2",
    "nameZone": "Barrio Sur"
  },
  "totalUsersInZone": 5
}
```

**Respuesta sin usuarios disponibles:**
```json
{
    "user": null,
    "message": "No hay usuarios disponibles en esta zona"
}
```

### POST - Gestionar ubicación

#### `POST losetasOnLine/newInvZone`
Agrega o mueve un investigador a una zona específica

**Cuerpo de la petición:**
```json
{
  "idZone": "2",
  "idUser": "user123",
  "invData": [
    {
      "name": "Investigador",
      "level": 1
    }
  ],
  "available": true
}
```

**Parámetros obligatorios:**
- `idZone` (string): ID de la zona destino
- `idUser` (string): ID único del usuario

**Parámetros opcionales:**
- `invData` (array): Datos del investigador
- `available` (boolean): Disponibilidad para selección aleatoria (default: true)

**Respuesta exitosa:**
```json
{
  "message": "OK"
}
```

## 💡 Lógica de Funcionamiento

### Disponibilidad de Usuarios para interacciones entre pares
- **`available: true`**: El usuario puede ser seleccionado aleatoriamente
- **`available: false`**: El usuario NO puede ser seleccionado aleatoriamente

### Movimiento de una zona a otra
Cuando un usuario indica a la aplicacion que se mueve a una zona:
1. **Se busca** si ya está en alguna zona
2. **Se elimina** de su ubicación actual
3. **Se guarda** a la nueva zona
4. **Se actualiza** su cooldown de actividad

### Limpieza Automática
- Los usuarios inactivos por más de **15 minutos** son eliminados automáticamente
- La limpieza se ejecuta en cada operación del sistema
- Los usuarios eliminados liberan espacio en las zonas para agilizar las operaciones

### Conteo de Usuarios
- **Usuarios totales**: Incluye tanto disponibles como no disponibles

## 🔧 Ejemplos de Uso

### Conectar un investigador disponible
```
POST http://localhost:1234/losetasOnLine/newInvZone
Content-Type:application/json

{
  "idZone": "2",
  "idUser": "user666",
  "invData": [{"name": "Investigador", "level": 1}],
  "available": true
}
```

### Buscar investigador aleatorio
```
GET http://localhost:1234/losetasOnLine/randomInvInZone/7
```

### Ver usuarios en una zona
```
GET http://localhost:1234/losetasOnLine/zone/2
```

## 📝 Estructura de Datos

### Usuario Online
```json
{
  "idUser": "string",
  "invData": "array",
  "available": "boolean",
  "lastEddited": "timestamp"
}
```

### Zona
```json
{
  "idZone": "string",
  "nameZone": "string", 
  "invOnLine": "array",
  "specialEvent": "object"
}
```

## ⚠️ Consideraciones

- Los usuarios solo pueden estar en **una zona a la vez**
- Los usuarios con `available: false` **SÍ cuentan** en estadísticas totales
- Los usuarios con `available: false` **NO pueden** ser seleccionados aleatoriamente
- La inactividad se mide desde `lastEddited` (15 minutos)


# < Enemies 👹 >

Sistema de gestión de enemigos, permite consultar información detallada de criaturas, monstruos y entidades que los investigadores pueden encontrar durante sus aventuras. Principalmente son una ayuda para la creacion del mapa ya que en el juego real solo se indican los nombres y buscarlos entre tantos monstruos resulta ser una ardua tarea.

## 📋 Características

- **Consulta de enemigos**: Acceso a base de datos completa de criaturas (87 enemigos disponibles)
- **Filtrado por expansión**: Encuentra enemigos específicos de cada DLC/expansión
- **Filtrado por tipo**: Busca criaturas por categorías (Gul, Sectario, Profundo, etc.)
- **Información detallada**: Nombres, tipos, expansiones, imágenes y traducciones
- **Multiidioma**: Soporte para inglés y español
- **Solo lectura**: API de consulta sin modificación de datos para mantener integridad

## 🚀 Endpoints

### `GET enemies/` - Obtener enemigos

Obtiene lista completa de enemigos o filtrada por parámetros

**Parámetros de consulta (Query Parameters):**
- `expansion` (string, opcional): Código de la expansión
- `type` (string, opcional): Tipo de monstruo

**Respuesta exitosa (todos los enemigos):**
```json
[
  {
    "id": 0,
    "name": "Hooded marauder",
    "monsterType": ["Monstruo", "Humano", "Sectario"],
    "expansion": "AHBase",
    "quantity": 2,
    "img": "/img/4-enemigos/enemigo6.jpg",
    "translations": {
      "es": {
        "name": "Merodeador encapuchado",
        "monsterType": ["Monstruo", "Humano", "Sectario"]
      }
    }
  },
  ...
]
```

**Respuesta filtrada por expansión:**
```
GET enemies/?expansion=AHWaves
```

**Respuesta filtrada por tipo:**
```
GET enemies/?type=gul
```

**Respuesta cuando no se encuentran resultados:**
```json
{
  "message": "No se han encontrado enemigos para la expansión solicitada"
}
```

### `GET enemies/:id` - Obtener enemigo específico

Obtiene información detallada de un enemigo por su ID

**Parámetros:**
- `id` (number): ID único del enemigo (0-86)

**Respuesta exitosa:**
```json
{
  "id": 12,
  "name": "Gul Furtive",
  "monsterType": ["Monstruo", "Gul"],
  "expansion": "AHBase",
  "quantity": 1,
  "img": "/img/4-enemigos/enemigo1.jpg",
  "translations": {
    "es": {
      "name": "Gul Furtivo",
      "monsterType": ["Monstruo", "Gul"]
    }
  }
}
```

**Respuesta cuando no se encuentra:**
```json
{
  "message": "Enemigo no encontrado"
}
```

## 🎭 Tipos de Monstruos

Los enemigos se clasifican en diferentes tipos que afectan las mecánicas de juego:

### Tipos Principales
- **Monstruo** - Categoría base de todas las criaturas
- **Humano** - Enemigos de origen humano
- **Sectario** - Cultistas y adoradores
- **Gul** - Criaturas necrófagas
- **Profundo** - Seres acuáticos de las profundidades
- **Aberración** - Criaturas antinaturales y deformes

### Tipos Específicos
- **Ángel descarnado** - Entidades angelicales corrompidas  
- **Byakhee** - Criaturas voladoras del espacio
- **Perro de Tíndalos** - Cazadores interdimensionales
- **Semilla estelar** - Engendros de entidades cósmicas
- **Logia** - Miembros de sociedades secretas
- **Subyugado** - Seres controlados mentalmente
- **Mi-go** - Hongos extraterrestres inteligentes
- **Semilla informe** - Criaturas amorfas
- **Bestia lunar** - Criaturas lunares
- **Soñador** - Seres que existen entre sueño y realidad
- **Shantak** - Aves gigantes de pesadilla
- **Servidor** - Sirvientes de entidades mayores
- **Espíritu** - Fantasmas y apariciones
- **Ghast** - Criaturas del mundo subterráneo

### Facciones
- **O'Bannion** - Familia mafiosa
- **Sheldon** - Banda criminal rival
- **Muchedumbre** - Turba descontrolada

## 🌍 Expansiones Disponibles

| Código | Nombre | Enemigos |
|--------|--------|----------|
| AHBase | Arkham Horror Base Game | 43 enemigos (ID: 0-42) |
| AHWaves | Waves Expansion | 16 enemigos (ID: 43-58) |
| AHNigth | Night Expansion | 15 enemigos (ID: 59-73) |
| AHSecrets | Secrets Expansion | 13 enemigos (ID: 74-86) |

## 🔧 Ejemplos de Uso

### Obtener todos los enemigos
```
GET http://localhost:1234/enemies/
```

### Buscar enemigos del juego base
```
GET http://localhost:1234/enemies/?expansion=AHBase
```

### Buscar todos los gules
```
GET http://localhost:1234/enemies/?type=gul
```

### Obtener información de un enemigo específico
```
GET http://localhost:1234/enemies/15
```

### Buscar sectarios de las expansiones
```
GET http://localhost:1234/enemies/?type=sectario
```

## 📊 Estructura de Datos

### Enemigo Completo
```json
{
  "id": "number",
  "name": "string",
  "monsterType": "array<string>",
  "expansion": "string",
  "quantity": "number",
  "img": "string",
  "translations": {
    "es": {
      "name": "string",
      "monsterType": "array<string>"
    }
  }
}
```

### Campos Explicados
- **id**: Identificador único numérico (0-86)
- **name**: Nombre en inglés del enemigo
- **monsterType**: Array de tipos que define las características del monstruo
- **expansion**: Código de la expansión de origen
- **quantity**: Número de copias de este enemigo en el juego físico
- **img**: Ruta de la imagen del enemigo
- **translations.es**: Traducción al español con nombre y tipos

## 🗺️ Integración con Mapas

Los enemigos están vinculados con los mapas a través de arrays de IDs:

### Ejemplo: Mapa "La llegada de Azathoth"
```json
{
  "idMap": 0,
  "title": "The Arrival of Azathoth",
  "enemies": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  "specialEnemies": []
}
```

### Endpoint Relacionado
```
GET maps/enemies/:id
```
Retorna todos los enemigos (normales y especiales) de un mapa específico.

## ⚠️ Consideraciones

- **Solo lectura**: Esta API no permite crear, modificar o eliminar enemigos
- **Filtros case-insensitive**: Las búsquedas no distinguen mayúsculas/minúsculas
- **Múltiples tipos**: Un enemigo puede pertenecer a varios tipos
- **Códigos de expansión**: Usar códigos exactos (AHBase, AHWaves, etc.)
- **IDs secuenciales**: Los IDs van del 0 al 86 de forma correlativa
- **Cantidad**: El campo quantity indica cuántas copias físicas existen del enemigo

# < Maps 🗺️ >

Sistema de gestión de mapas, proporciona acceso a la información de escenarios, sus enemigos asociados, y permite a la comunidad votar y comentar sobre cada mapa.

## 📋 Características

- **Consulta de mapas**: Acceso a 13 escenarios oficiales con información completa
- **Filtrado por expansión**: Encuentra mapas específicos de cada DLC
- **Sistema de votaciones**: Like/Dislike, tiempo estimado, dificultad
- **Recomendaciones**: Investigadores sugeridos por la comunidad
- **Comentarios**: Sistema de feedback comunitario
- **Información de enemigos**: Consulta enemigos normales y especiales para cada mapa
- **Multiidioma**: Soporte completo inglés/español

## 🗺️ Mapas Disponibles

| ID | Título | Expansión | Enemigos |
|----|--------|-----------|----------|
| 0 | The Arrival of Azathoth | AHBase | 10 |
| 1 | Feast for Umordhoth | AHBase | 11 + 6 especiales |
| 2 | The Veil of the Twilight | AHBase | 7 + 4 especiales |
| 3 | Echoes of the Deep | AHBase | 10 |
| 4 | Tyrants of Desolation | AHWaves | 13 |
| 5 | The Mortecina Lamp | AHWaves | 11 + 1 especial |
| 6 | The Progeny of Ithaqua | AHWaves | 10 |
| 7 | Dreams of R´lyeh | AHWaves | 11 |
| 8 | The Silence of Tsathoggua | AHNigth | 10 |
| 9 | Shots in the Dark | AHNigth | 9 + 6 especiales |
| 10 | The Key and the Gate | AHSecrets | 15 |
| 11 | Forced to Serve | AHSecrets | 8 + 7 especiales |
| 12 | The Dead Scream | AHSecrets | 13 |

## 🚀 Endpoints

### Consulta de Mapas

#### `GET maps/` - Obtener mapas
Obtiene lista completa de mapas o filtrada por expansión

**Parámetros de consulta:**
- `expansion` (string, opcional): Código de expansión (AHBase, AHWaves, etc.)

**Respuesta exitosa:**
```json
[
  {
    "idMap": 0,
    "title": "The Arrival of Azathoth",
    "description": "In the heart of infinity dwells the lethargic Azathoth...",
    "expansion": "AHBase",
    "initialSpace": "Train Station",
    "retribution": "For each Cultist Monster, place a Doom token in its space...",
    "mythosReserve": {
      "doom": 3,
      "enemies": 2,
      "clues": 2,
      "newspaper": 2,
      "explosion": 1,
      "retribution": 1,
      "empty": 3
    },
    "extraData": {
      "likes": 0,
      "dislikes": 0,
      "timeEstimated": 0,
      "difficulty": 0
    },
    "enemies": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    "specialEnemies": [],
    "translations": {
      "es": {
        "title": "La llegada de Azathoth",
        "description": "En el corazón del infinito mora el aletargado Azathoth...",
        "initialSpace": "Estación de trenes"
      }
    }
  }
]
```

#### `GET maps/:id` - Obtener mapa específico
**Parámetros:**
- `id` (number): ID del mapa (0-12)

#### `GET maps/previewMap` - Obtener previews
Obtiene versiones resumidas de todos los mapas para vistas previas donde no se necesite todo, como por ejemplo la lista de mapas

#### `GET maps/enemies/:id` - Obtener enemigos del mapa
Retorna todos los enemigos (normales y especiales) de un mapa específico y el texto que pueda tener

**Respuesta:**
```json
{
  "enemies": [
    {
      "id": 0,
      "name": "Hooded marauder",
      "monsterType": ["Monstruo", "Humano", "Sectario"],
      "expansion": "AHBase"
    }
  ],
  "specialEnemies": [],
  "textSpecialEnemies": null,
  "EStextSpecialEnemies": null
}
```

### Sistema de Votaciones

#### `GET maps/likeDislike/:id` - Obtener votaciones like/dislike
**Respuesta:**
```json
{
  "likes": 15,
  "dislikes": 3,
  "NVotesLikeDislike": 18
}
```

#### `POST maps/likeDislike` - Votar like/dislike
**Cuerpo:**
```json
{
  "idMap": 0,
  "idUser": "user123",
  "value": 1  // 1 = like, -1 = dislike
}
```

#### `GET maps/timeEstimated/:id` - Obtener tiempo estimado
**Respuesta:**
```json
{
  "timeEstimated": 120,  // minutos
  "NVotestime": 25
}
```

#### `POST maps/timeEstimated` - Votar tiempo estimado
**Cuerpo:**
```json
{
  "idMap": 0,
  "idUser": "user123",
  "value": 90  // minutos estimados
}
```

#### `GET maps/difficultyMap/:id` - Obtener dificultad
```json
{
  "difficulty": 7,  // escala 1-10
  "NVotesDifficulty": 42
}
```

#### `POST maps/difficultyMap` - Votar dificultad
**Cuerpo:**
```json
{
  "idMap": 0,
  "idUser": "user123",
  "value": 8  // dificultad 1-10
}
```

### Sistema de Recomendaciones y Comentarios

#### `GET maps/invRecommended/:id` - Obtener investigadores recomendados
```json
[
  {
    "idUser": "user123",
    "nameUser": "PlayerName",
    "idInv": 5,
    "nameInv": "Harvey Walters",
    "expansionInv": "base",
    "imgInv": "/img/investigators/harvey.jpg",
    "comment": "Perfecto para este escenario por su alta cordura",
    "dateCreated": 1753785326991
  }
]
```

#### `POST maps/invRecommended` - Recomendar investigador
**Cuerpo:**
```json
{
  "idMap": 0,
  "idUser": "user123",
  "nameUser": "PlayerName",
  "idInv": 5,
  "nameInv": "Harvey Walters",
  "expansionInv": "base",
  "imgInv": "/img/investigators/harvey.jpg",
  "comment": "Excelente para mapas con mucho horror"
}
```

#### `GET maps/comments/:id` - Obtener comentarios
```json
[
  {
    "idUser": "user456",
    "nameUser": "GameMaster",
    "comment": "Escenario muy equilibrado, ideal para principiantes",
    "dateCreated": 1753785326991
  }
]
```

#### `POST maps/comments` - Comentar mapa
**Cuerpo:**
```json
{
  "idMap": 0,
  "idUser": "user456",
  "nameUser": "GameMaster",
  "comment": "Uno de los mejores escenarios del juego base"
}
```

## 🏗️ Estructura de Datos

### Mapa Completo
```json
{
  "idMap": "number",
  "title": "string",
  "description": "string",
  "expansion": "string",
  "initialSpace": "string",
  "retribution": "string",
  "mythosReserve": {
    "doom": "number",
    "enemies": "number",
    "clues": "number",
    "newspaper": "number",
    "explosion": "number",
    "retribution": "number",
    "empty": "number",
    "terror": "number"
  },
  "extraData": {
    "likes": "number",
    "dislikes": "number",
    "NVotesLikeDislike": "number",
    "timeEstimated": "number",
    "NVotestime": "number",
    "difficulty": "number",
    "NVotesDifficulty": "number"
  },
  "enemies": "array<number>",
  "textSpecialEnemies": "string|null",
  "specialEnemies": "array<number>",
  "imgMap": "string",
  "BGMap": "string",
  "translations": {
    "es": {
      "title": "string",
      "description": "string",
      "initialSpace": "string",
      "retribution": "string",
      "textSpecialEnemies": "string|null"
    }
  }
}
```
## 🏗️ Plan de reestructuracion de mapa
Para mas adelante se tiene pensado reestructurar los datos de los mapas a la siguiente estructura:
```json
{
  "idMap": "number",
  "expansion": "string",
  "initialSpace": "string",
  "mythosReserve": {
    "doom": "number",
    "enemies": "number",
    "clues": "number",
    "newspaper": "number",
    "explosion": "number",
    "retribution": "number",
    "empty": "number",
    "terror": "number"
  },
  "extraData": {
    "likes": "number",
    "dislikes": "number",
    "NVotesLikeDislike": "number",
    "timeEstimated": "number",
    "NVotestime": "number",
    "difficulty": "number",
    "NVotesDifficulty": "number"
  },
  "enemies": {
    "normal": "array<number>",
    "specialEnemies": "array<number>",
  },
  "imgMap": "string",
  "BGMap": "string",
  "translations": {
    "es": {
      "title": "string",
      "description": "string",
      "initialSpace": "string",
      "retribution": "string",
      "textSpecialEnemies": "string|null"
    },
    "en": {
      "title": "string",
      "description": "string",
      "initialSpace": "string",
      "retribution": "string",
      "textSpecialEnemies": "string|null"
    }
  }
}
```

### Reserva de Mitos
Composición de fichas que se usan durante la partida:
- **doom**: Fichas de perdición
- **enemies**: Aparición de enemigos
- **clues**: Fichas de pistas
- **newspaper**: Eventos de periódico
- **explosion**: Eventos de explosión
- **retribution**: Eventos de castigo
- **terror**: Propagación del terror (solo algunas expansiones)
- **empty**: Fichas vacías (sin efecto)

## 🌍 Expansiones

| Código | Nombre | Mapas |
|--------|--------|-------|
| AHBase | Arkham Horror Base Game | 4 mapas (ID: 0-3) |
| AHWaves | Waves Expansion | 4 mapas (ID: 4-7) |
| AHNigth | Night Expansion | 2 mapas (ID: 8-9) |
| AHSecrets | Secrets Expansion | 3 mapas (ID: 10-12) |

## 🔧 Ejemplos de Uso

### Obtener todos los mapas del juego base
```
GET http://localhost:1234/maps/?expansion=AHBase
```

### Buscar enemigos de un mapa específico
```
GET http://localhost:1234/maps/enemies/1
```

### Votar dificultad de un mapa
```
POST http://localhost:1234/maps/difficultyMap
Content-Type: application/json

{
  "idMap": 3,
  "idUser": "user789",
  "value": 6
}
```

### Obtener estadísticas de un mapa
```
GET http://localhost:1234/maps/likeDislike/0
GET http://localhost:1234/maps/timeEstimated/0
GET http://localhost:1234/maps/difficultyMap/0
```

## 💡 Casos de Uso

### Para Jugadores
- Consultar información completa de escenarios
- Ayuda a la creacion del mapa de juego
- Leer recomendaciones de la comunidad
- Conocer dificultad y duración estimada

## ⚠️ Consideraciones

- **Solo lectura base**: La información core de los mapas no se puede modificar
- **Votaciones únicas**: Un usuario solo puede votar una vez por categoría por mapa
- **Cambio de voto**: Se permite cambiar votos existentes
- **Cálculo automático**: Las medias se recalculan automáticamente
- **Validaciones**: Tipos de datos estrictos en votaciones
- **Persistencia**: Todos los votos se guardan en map_votes.json

# < MapsInPlay 🎮 >

Sistema de gestión de partidas activas onLine permite a varios jugadores que esten en distinta localizacion crear, administrar y jugar mapas con estado dinámico, incluyendo reserva de mitos, variables de juego, y sistema de tienda integrado.

## 📋 Características

- **Gestión de partidas**: Crear mapas activos basados en templates base
- **Reserva de mitos**: Simulacion digital de sistema de revelado de fichas
- **Variables dinámicas**: Gestión de perdición (dooms) y pistas (clues)
- **Sistema de tienda**: Gestion y venta de objetos aleatorios
- **Control de usuario**: Solo los usuarios que se unan a la partida a través de la id de la misma podran modificar las variables
- **Estado persistente**: Todos los cambios se guardan automáticamente
- **Múltiples partidas**: Un usuario puede tener varias partidas simultáneas

## 🚀 Endpoints

### Gestión de Partidas

#### `GET mapsInPlay/` - Obtener todas las partidas
Retorna lista completa de mapas activos de todos los usuarios

#### `GET mapsInPlay/:id` - Obtener partida específica
**Parámetros:**
- `id` (string): UUID de la partida

**Respuesta:**
```json
{
  "id": "58d07cf8-1efe-49ca-b61c-073945dd7688",
  "idMap": 0,
  "title": "The Arrival of Azathoth",
  "description": "In the heart of infinity dwells the lethargic Azathoth...",
  "IDUserHost": "user_2xGvzHhMUgrrNnaQgJdPD8FRxoF",
  "fechaDeInicio": 1747577525934,
  "lastEddited": 1753642128578,
  "variables": {
    "dooms": 0,
    "clues": 3
  },
  "mythosReserveInPlay": [
    {
      "type": "doom",
      "reveal": false
    },
    {
      "type": "clues",
      "reveal": true
    }
  ],
  "shop": {
    "soled": [],
    "inShop": [231]
  }
}
```

#### `POST mapsInPlay/` - Crear nueva partida
**Cuerpo:**
```json
{
  "idMap": 0,
  "IDUserHost": "user123"
}
```

**Respuesta:**
```json
{
  "id": "uuid-generado",
  "idMap": 0,
  "title": "The Arrival of Azathoth",
  "IDUserHost": "user123",
  "fechaDeInicio": 1753785326991,
  "variables": {
    "dooms": 0,
    "clues": 0
  },
  "mythosReserveInPlay": [...]
}
```

#### `POST mapsInPlay/deleteMapInPlay` - Eliminar partida
**Cuerpo:**
```json
{
  "id": "uuid-de-la-partida",
  "IDUserHost": "user123"
}
```

#### `GET mapsInPlay/users/:id` - Obtener partidas de usuario
Retorna todas las partidas creadas por un usuario específico

### Sistema de Reserva de Mitos

#### `GET mapsInPlay/:id/getMithToken` - Obtener ficha aleatoria
Saca una ficha aleatoria de la reserva y la marca como revelada

**Respuesta:**
```json
{
  "type": "doom",
  "reveal": true
}
```

#### `GET mapsInPlay/:id/ressetMithReserve` - Resetear reserva
Marca todas las fichas como no reveladas (reveal: false)

#### `POST mapsInPlay/:id/token` - Gestionar fichas manualmente
**Cuerpo:**
```json
{
  "action": "add",     // "add", "remove", "reset"
  "type": "doom"       // tipo de ficha
}
```

### Gestión de Variables

#### `POST mapsInPlay/:id/variable` - Ajustar variables
**Parámetros de URL:**
- `id`: UUID de la partida

**Cuerpo:**
```json
{
  "key": "dooms",     // "dooms" o "clues"
  "delta": 2          // cantidad a sumar/restar
}
```

**Respuesta:**
```json
{
  "message": "Variable 'dooms' actualizada.",
  "variables": {
    "dooms": 2,
    "clues": 0
  }
}
```

### Sistema de Tienda

#### `GET mapsInPlay/:id/shop` - Obtener objetos de la tienda
**Respuesta:**
```json
[
  {
    "id": 231,
    "img": "/img/2-obj/automaticaDel45.jpg",
    "expansion": "base",
    "price": 4,
    "types": ["tienda", "objeto", "común", "arma"],
    "hands": 1,
    "translations": {
      "es": {
        "name": "Automática del 45",
        "description": "Recibes Fuerza +3 cuando estés realizando una acción de ataque."
      }
    }
  }
]
```

#### `POST mapsInPlay/shop` - Gestionar tienda
**Agregar objeto aleatorio:**
```json
{
  "action": "add",
  "idMapInPlay": "uuid-partida",
  "expansion": "base",
  "types": ["arma", "común"]
}
```

**Vender objeto:**
```json
{
  "action": "soled",
  "idMapInPlay": "uuid-partida",
  "idObject": 231
}
```

**Respuesta al agregar:**
```json
{
  "id": 215,
  "img": "/img/2-obj/derringer.jpg",
  "expansion": "base",
  "price": 2,
  "types": ["tienda", "objeto", "extraordinario", "arma"],
  "translations": {
    "es": {
      "name": "Derringer del 41",
      "description": "Puedes sumar uno al resultado de un dado..."
    }
  }
}
```

## 🏗️ Estructura de Datos

### Partida Activa
```json
{
  "id": "string (UUID)",
  "idMap": "number",
  "title": "string",
  "description": "string",
  "initialSpace": "string",
  "retribution": "string",
  "mythosReserve": "object",
  "enemies": "array<number>",
  "specialEnemies": "array<number>",
  "translations": "object",
  "fechaDeInicio": "timestamp",
  "lastEddited": "timestamp",
  "IDUserHost": "string",
  "mythosReserveInPlay": [
    {
      "type": "string",
      "reveal": "boolean"
    }
  ],
  "variables": {
    "dooms": "number",
    "clues": "number"
  },
  "shop": {
    "soled": "array<number>",
    "inShop": "array<number>"
  }
}
```

### Sistema de Tienda
- **soled**: Array de IDs de objetos vendidos (ya no disponibles)
- **inShop**: Array de IDs de objetos disponibles para comprar
- **Lógica**: Un objeto no puede estar simultáneamente en ambos arrays
- **Generación**: Se evitan duplicados al generar objetos aleatorios

### Fichas de Mitos
Los tipos de fichas disponibles:
- **doom**: Fichas de perdición
- **enemies**: Aparición de enemigos  
- **clues**: Fichas de pistas
- **newspaper**: Eventos de periódico
- **explosion**: Eventos de explosión
- **retribution**: Eventos de castigo divino
- **terror**: Propagación del terror
- **empty**: Fichas sin efecto

## 🔧 Ejemplos de Uso

### Crear y gestionar partida
```
# Crear nueva partida
POST http://localhost:1234/mapsInPlay/
{
  "idMap": 3,
  "IDUserHost": "user789"
}

# Obtener estado actual
GET http://localhost:1234/mapsInPlay/uuid-partida

# Ajustar perdición +2
POST http://localhost:1234/mapsInPlay/uuid-partida/variable
{
  "key": "dooms",
  "delta": 2
}
```

### Gestionar reserva de mitos
```
# Sacar ficha aleatoria
GET http://localhost:1234/mapsInPlay/uuid-partida/getMithToken

# Resetear todas las fichas
GET http://localhost:1234/mapsInPlay/uuid-partida/ressetMithReserve

# Agregar ficha manualmente
POST http://localhost:1234/mapsInPlay/uuid-partida/token
{
  "action": "add",
  "type": "doom"
}
```

### Gestionar tienda
```
# Ver objetos disponibles
GET http://localhost:1234/mapsInPlay/uuid-partida/shop

# Agregar arma aleatoria
POST http://localhost:1234/mapsInPlay/shop
{
  "action": "add",
  "idMapInPlay": "uuid-partida",
  "types": ["arma"]
}

# Vender objeto
POST http://localhost:1234/mapsInPlay/shop
{
  "action": "soled",
  "idMapInPlay": "uuid-partida",
  "idObject": 231
}
```

## 💡 Casos de Uso

### Para Game Masters
- Crear partidas para grupos de jugadores
- Gestionar estado de la reserva de mitos en tiempo real
- Controlar variables de perdición y pistas
- Administrar tienda con objetos dinámicos

### Para Jugadores
- Consultar estado actual de la partida
- Ver objetos disponibles en la tienda
- Seguir progreso de pistas y perdición

### Para Aplicaciones
- Sincronizar estado entre múltiples dispositivos
- Automatizar mecánicas de juego
- Persistir progreso de partidas largas
- Integrar sistemas de inventario

## ⚠️ Consideraciones

- **Control de acceso**: Solo el IDUserHost puede modificar la partida
- **UUIDs únicos**: Cada partida tiene un identificador único
- **Estado persistente**: Todos los cambios se guardan inmediatamente
- **Generación inteligente**: La tienda evita objetos duplicados
- **Límite de intentos**: Máximo 50 intentos para encontrar objetos únicos
- **Variables protegidas**: Las variables no pueden ser negativas
- **Import dinámico**: El modelo de objetos se importa dinámicamente

## 🔄 Flujo de Juego Típico

1. **Crear partida** basada en un mapa base
2. **Inicializar** reserva de mitos y variables en 0
3. **Durante el juego:**
   - Sacar fichas de mitos cuando sea necesario
   - Ajustar perdición/pistas según eventos
   - Generar objetos para la tienda
   - Vender objetos cuando los jugadores los compren
4. **Resetear** reserva cuando se agote
5. **Eliminar partida** al finalizar
