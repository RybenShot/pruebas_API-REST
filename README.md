<p align="center">
  <a href="#introduccion">Introduccion</a> |
  <a href="#descripcion">Descripcion</a> |
  <a href="#arquitectura-de-llamadas">Arquitectura de llamadas</a> |
  <a href="#arquitectura-de-datos">Arquitectura de datos</a> |
  <a href="#endpoints">Endpoints</a> |
  <a href="#integracion-con-el-frontend">Integracion con el Frontend</a> |
  <a href="#especificaciones-tecnicas">Especificaciones tecnicas</a> |
  <a href="#changelog">Changelog</a> |
  <a href="#enlace-a-la-api">Enlace a la API</a>
</p>

<div align="center">
  <img src="/README_FILES/bannerAH.png">
  <h1>API de App Arkham Horror 3ª Edicion</h1>
</div>

---

# Introduccion

Bienvenido a la documentación oficial de la API de la App Arkham Horror 3ª Edición.

Esta API es el backend de una aplicación diseñada para complementar la experiencia del juego de mesa **Arkham Horror: Tercera Edición**. Gestiona personajes, mapas, enemigos, objetos, partidas activas e interacciones entre jugadores en tiempo real.

El propósito de esta documentación es servir de guía clara tanto para el desarrollo como para el mantenimiento del sistema.

---

# Descripcion

La App Arkham Horror 3ª Edición es una herramienta digital que asiste a los jugadores durante sus partidas físicas. La aplicación **complementa** el juego de mesa, no lo reemplaza: los enemigos, las cartas de encuentros y el avance del escenario se siguen gestionando físicamente sobre el tablero.

Lo que sí gestiona de forma digital:

- **Fichas de mapa y mitos**: reserva de fichas con revelado digital en tiempo real
- **Inventario de investigadores**: cada jugador guarda su personaje con objetos y estado
- **Tienda online centralizada**: todos los jugadores de la mesa ven y compran cartas en tiempo real
- **Encuentros entre jugadores**: sistema de combate, intercambio y resonancia entre investigadores en la misma zona del mapa
- **Base de datos de referencia**: investigadores, enemigos y objetos consultables durante la partida

Gracias a un sistema de sesiones basado en UUID, los jugadores se conectan desde distintos dispositivos y coordinan la partida de forma sincronizada.

---

# Arquitectura de llamadas

La API sigue el patron **MVC** (*Modelo - Vista - Controlador*):

```
routes/          → Definen los endpoints disponibles
controllers/     → Gestionan la logica de cada endpoint
models/          → Acceso y escritura de datos (JSON + MongoDB)
databaseJSON/    → Archivos JSON con datos estaticos del juego
```

### Flujo de una llamada tipica

```
Cliente HTTP
    │
    ▼
routes/maps_routes.js       → redirige al controlador
    │
    ▼
controllers/maps_controller.js  → valida, procesa
    │
    ▼
models/maps_model.js        → lee JSON o consulta MongoDB
    │
    ▼
Respuesta JSON al cliente
```

### Mapa de rutas

| Prefijo         | Modulo                                    |
|-----------------|-------------------------------------------|
| `/inv`          | Investigadores (datos y votaciones)       |
| `/maps`         | Mapas (datos, votaciones, comentarios)    |
| `/mapInPlay`    | Partidas activas en curso                 |
| `/invInPlay`    | Investigadores guardados online           |
| `/enemies`      | Enemigos del juego                        |
| `/objects`      | Objetos y cartas                          |
| `/losetasOnLine`| Presencia online por zonas del mapa       |
| `/interactions` | Encuentros entre jugadores (combate, intercambio, resonancia) |
| `/visits`       | Contador de visitas a la web              |

---

# Arquitectura de datos

La API utiliza **dos sistemas de persistencia** segun el tipo de dato:

### Archivos JSON (datos estaticos)

Almacenan el contenido del juego que no cambia: listas de investigadores, mapas, enemigos y objetos. Se leen directamente en memoria al arrancar el servidor.

```
databaseJSON/
├── investigadores.json    # 21+ investigadores con atributos completos
├── previewInv.json        # Version resumida para listados rapidos
├── mapas.json             # 13 escenarios con reserva de mitos y enemigos
├── previewMaps.json       # Version resumida de mapas para listados
├── enemies.json           # 87 enemigos con tipos y expansiones
├── objects.json           # Cartas de objeto con precios, tipos y traducciones
├── losetasOnLine.json     # Definicion de las 11 zonas del mapa
└── codice.json            # (reservado)
```

### MongoDB (datos dinamicos)

Almacena todo lo que cambia en tiempo real: partidas activas, investigadores en juego, votaciones, comentarios e interacciones.

| Coleccion      | Que guarda                                              |
|----------------|---------------------------------------------------------|
| `MapInPlay`    | Partidas activas con reserva de mitos, variables y tienda |
| `InvInPlay`    | Investigadores de cada usuario con su estado actual     |
| `MapVotes`     | Votos, comentarios e investigadores recomendados por mapa |
| `InvVotes`     | Votos y comentarios por investigador                    |
| `UserOnline`   | Presencia online de jugadores por zona del mapa         |
| `Interaction`  | Encuentros entre jugadores (combate, trade, resonancia) |
| `Visits`       | Contador global de visitas                              |

---

# Endpoints

## `/inv` — Investigadores

Gestiona los investigadores disponibles en el juego. Los datos estaticos vienen del JSON y las votaciones/comentarios se persisten en MongoDB.

| Metodo | Ruta                    | Descripcion                                      |
|--------|-------------------------|--------------------------------------------------|
| `GET`  | `/inv`                  | Lista todos los investigadores. Filtro: `?archetype=Mistico` |
| `GET`  | `/inv/previewList`      | Lista resumida para seleccion. Filtro: `?rol=combate` |
| `GET`  | `/inv/:id`              | Datos completos de un investigador               |
| `GET`  | `/inv/:id/objects`      | Objetos iniciales (obligatorios y opcionales) de un investigador |
| `GET`  | `/inv/likeDislike/:id`  | Votos like/dislike de un investigador            |
| `POST` | `/inv/likeDislike`      | Votar like (`value: 1`) o dislike (`value: -1`) |
| `GET`  | `/inv/comments/:id`     | Comentarios sobre un investigador                |
| `POST` | `/inv/comments`         | Publicar o actualizar un comentario              |

**Estructura de investigador (JSON):**
```json
{
  "idInv": 1,
  "name": "Tommy Muldoon",
  "expansion": "base",
  "arquetipos": ["combate"],
  "rol": ["combate"],
  "isActive": true,
  "atributes": {
    "life": 10,
    "sanity": 6,
    "willpower": 2,
    "strenght": 4,
    "agility": 3,
    "observation": 2,
    "influence": 2,
    "lore": 1
  },
  "possessions": {
    "required": [101, 215],
    "optional": [220, 231],
    "optionalText": "Elige 1 de los siguientes objetos"
  }
}
```

**Body para `POST /inv/likeDislike`:**
```json
{ "idInv": 1, "idUser": "user_abc123", "value": 1 }
```

**Body para `POST /inv/comments`:**
```json
{ "idInv": 1, "idUser": "user_abc123", "nameUser": "Pedro", "comment": "Mi favorito" }
```

---

## `/maps` — Mapas

Gestiona los 13 escenarios del juego con su sistema de votaciones y comentarios comunitarios.

| Metodo | Ruta                          | Descripcion                                         |
|--------|-------------------------------|-----------------------------------------------------|
| `GET`  | `/maps`                       | Lista todos los mapas. Filtro: `?expansion=AHBase`  |
| `GET`  | `/maps/previewMap`            | Version resumida para listados y navegacion         |
| `GET`  | `/maps/:id`                   | Datos completos de un mapa                          |
| `GET`  | `/maps/enemies/:id`           | Enemigos normales y especiales de un mapa           |
| `GET`  | `/maps/getAllVotesMaps`        | Todas las votaciones de todos los mapas (admin)     |
| `GET`  | `/maps/likeDislike/:id`       | Votos like/dislike de un mapa                       |
| `POST` | `/maps/likeDislike`           | Votar like/dislike sobre un mapa                    |
| `GET`  | `/maps/timeEstimated/:id`     | Media de tiempo estimado de un mapa                 |
| `POST` | `/maps/timeEstimated`         | Enviar estimacion de tiempo en minutos              |
| `GET`  | `/maps/difficultyMap/:id`     | Media de dificultad de un mapa (escala 1-10)        |
| `POST` | `/maps/difficultyMap`         | Enviar votacion de dificultad                       |
| `GET`  | `/maps/invRecommended/:id`    | Investigadores recomendados por la comunidad        |
| `POST` | `/maps/invRecommended`        | Recomendar un investigador para un mapa             |
| `GET`  | `/maps/comments/:id`          | Comentarios sobre un mapa                           |
| `POST` | `/maps/comments`              | Publicar un comentario sobre un mapa                |

**Mapas disponibles:**

| ID | Titulo | Expansion | Enemigos |
|----|--------|-----------|----------|
| 0  | The Arrival of Azathoth | AHBase | 10 |
| 1  | Feast for Umordhoth | AHBase | 11 + 6 especiales |
| 2  | The Veil of the Twilight | AHBase | 7 + 4 especiales |
| 3  | Echoes of the Deep | AHBase | 10 |
| 4  | Tyrants of Desolation | AHWaves | 13 |
| 5  | The Mortecina Lamp | AHWaves | 11 + 1 especial |
| 6  | The Progeny of Ithaqua | AHWaves | 10 |
| 7  | Dreams of R'lyeh | AHWaves | 11 |
| 8  | The Silence of Tsathoggua | AHNigth | 10 |
| 9  | Shots in the Dark | AHNigth | 9 + 6 especiales |
| 10 | The Key and the Gate | AHSecrets | 15 |
| 11 | Forced to Serve | AHSecrets | 8 + 7 especiales |
| 12 | The Dead Scream | AHSecrets | 13 |

**Expansion codes:** `AHBase` · `AHWaves` · `AHNigth` · `AHSecrets`

**Estructura de un mapa:**
```json
{
  "idMap": 0,
  "title": "The Arrival of Azathoth",
  "expansion": "AHBase",
  "initialSpace": "Train Station",
  "retribution": "For each Cultist Monster, place a Doom token...",
  "mythosReserve": {
    "doom": 3, "enemies": 2, "clues": 2,
    "newspaper": 2, "explosion": 1, "retribution": 1, "empty": 3
  },
  "enemies": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  "specialEnemies": [],
  "imgMap": "/img/...",
  "BGMap": "/img/...",
  "translations": {
    "es": { "title": "La llegada de Azathoth", "initialSpace": "Estacion de trenes" }
  }
}
```

**Body para votar tiempo estimado:**
```json
{ "idMap": 0, "idUser": "user_abc123", "value": 90 }
```

**Body para recomendar investigador:**
```json
{
  "idMap": 0, "idUser": "user_abc123", "nameUser": "Pedro",
  "idInv": 5, "nameInv": "Harvey Walters", "expansionInv": "base",
  "imgInv": "/img/investigators/harvey.jpg", "comment": "Alta cordura, ideal para este mapa"
}
```

---

## `/mapInPlay` — Partidas Activas

Gestiona las partidas en curso. Cada partida es una instancia de un mapa base con estado dinamico: reserva de mitos, variables (perdicion/pistas) y tienda de objetos.

| Metodo | Ruta                              | Descripcion                                          |
|--------|-----------------------------------|------------------------------------------------------|
| `GET`  | `/mapInPlay/:id`                  | Datos completos de una partida por su UUID           |
| `GET`  | `/mapInPlay/users/:id`            | Todas las partidas de un usuario                     |
| `POST` | `/mapInPlay`                      | Crear nueva partida                                  |
| `POST` | `/mapInPlay/deleteMapInPlay`      | Eliminar una partida (solo el creador puede borrarla)|
| `POST` | `/mapInPlay/:id/variable`         | Sumar o restar a `dooms` o `clues`                   |
| `GET`  | `/mapInPlay/:id/getMithToken`     | Sacar una ficha aleatoria de la reserva de mitos     |
| `GET`  | `/mapInPlay/:id/ressetMithReserve`| Reiniciar todas las fichas (reveal: false)           |
| `POST` | `/mapInPlay/:id/token`            | Gestionar fichas manualmente (add/remove/reset)      |
| `GET`  | `/mapInPlay/:id/shop`             | Ver objetos disponibles en la tienda                 |
| `POST` | `/mapInPlay/shop`                 | Gestionar tienda (anadir objeto aleatorio o vender)  |

**Crear partida:**
```json
{ "idMap": 0, "IDUserHost": "user_abc123" }
```

**Ajustar variable:**
```json
{ "key": "dooms", "delta": 2 }
```
`delta` puede ser negativo para restar. El valor minimo es 0.

**Gestionar ficha de mitos manualmente:**
```json
{ "action": "add", "type": "doom" }
```
Acciones disponibles: `add` (añadir ficha), `remove` (quitar ficha), `reset` (devolver ficha revelada a la reserva).

**Tipos de fichas de mitos:**
`doom` · `enemies` · `clues` · `newspaper` · `explosion` · `retribution` · `terror` · `empty`

**Gestionar tienda — añadir objeto aleatorio:**
```json
{
  "action": "add",
  "idMapInPlay": "uuid-partida",
  "expansion": "base",
  "types": ["arma", "comun"]
}
```

**Gestionar tienda — vender objeto:**
```json
{
  "action": "soled",
  "idMapInPlay": "uuid-partida",
  "idObject": 231
}
```

**Estructura de una partida activa:**
```json
{
  "id": "uuid",
  "idMap": 0,
  "title": "The Arrival of Azathoth",
  "IDUserHost": "user_abc123",
  "fechaDeInicio": 1753785326991,
  "lastEddited": 1753785326991,
  "variables": { "dooms": 2, "clues": 3 },
  "mythosReserveInPlay": [
    { "type": "doom", "reveal": false },
    { "type": "clues", "reveal": true }
  ],
  "shop": {
    "soled": [101],
    "inShop": [231]
  }
}
```

---

## `/invInPlay` — Investigadores Online

Permite a cada jugador guardar y recuperar el estado de sus investigadores entre sesiones. Cada usuario puede tener hasta 10 investigadores guardados.

| Metodo | Ruta                           | Descripcion                                      |
|--------|--------------------------------|--------------------------------------------------|
| `GET`  | `/invInPlay`                   | Todos los investigadores online (todos los usuarios) |
| `GET`  | `/invInPlay/:id`               | Un investigador concreto por su UUID             |
| `GET`  | `/invInPlay/users/:id`         | Todos los investigadores guardados de un usuario |
| `POST` | `/invInPlay`                   | Guardar o actualizar un investigador             |
| `POST` | `/invInPlay/deleteInvOnLine`   | Eliminar un investigador guardado                |

**Guardar investigador:**
```json
{
  "id": "uuid-o-null-para-nuevo",
  "idUser": "user_abc123",
  "idInv": 1,
  "name": "Tommy Muldoon",
  "atributes": { "life": 8, "sanity": 5 },
  "inventory": [231, 215]
}
```
Si `id` es `null` o no se incluye, se genera un UUID nuevo automaticamente.

**Eliminar investigador:**
```json
{ "id": "uuid-investigador", "idUser": "user_abc123" }
```

---

## `/enemies` — Enemigos

Consulta de los 87 enemigos del juego. Solo lectura.

| Metodo | Ruta           | Descripcion                                              |
|--------|----------------|----------------------------------------------------------|
| `GET`  | `/enemies`     | Lista todos los enemigos. Filtros: `?expansion=AHBase` o `?type=gul` |
| `GET`  | `/enemies/:id` | Datos de un enemigo por ID (0-86)                        |

**Expansion codes:** `AHBase` (43 enemigos) · `AHWaves` (16) · `AHNigth` (15) · `AHSecrets` (13)

**Estructura de un enemigo:**
```json
{
  "id": 0,
  "name": "Hooded marauder",
  "monsterType": ["Monstruo", "Humano", "Sectario"],
  "expansion": "AHBase",
  "quantity": 2,
  "img": "/img/4-enemigos/enemigo6.jpg",
  "translations": {
    "es": { "name": "Merodeador encapuchado", "monsterType": ["Monstruo", "Humano", "Sectario"] }
  }
}
```

---

## `/objects` — Objetos y Cartas

Consulta y filtrado del catalogo de objetos del juego.

| Metodo | Ruta                      | Descripcion                                           |
|--------|---------------------------|-------------------------------------------------------|
| `GET`  | `/objects/:id`            | Un objeto por su ID                                   |
| `POST` | `/objects`                | Buscar objetos con filtros (nombre, expansion, tipos) |
| `POST` | `/objects/getRandomObject`| Obtener un objeto aleatorio con filtros               |

**Body para buscar objetos:**
```json
{
  "name": "Automática del 45",
  "expansion": "base",
  "types": ["arma", "comun"]
}
```
Si `name` tiene coincidencia exacta, devuelve ese objeto directamente. Si no, aplica los demas filtros. Los filtros de `types` son acumulativos (AND).

**Estructura de un objeto:**
```json
{
  "id": 231,
  "img": "/img/2-obj/automaticaDel45.jpg",
  "expansion": "base",
  "price": 4,
  "hands": 1,
  "types": ["tienda", "objeto", "comun", "arma"],
  "translations": {
    "es": { "name": "Automatica del 45", "description": "Recibes Fuerza +3 cuando ataques." },
    "en": { "name": ".45 Automatic", "description": "You gain +3 strength when attacking." }
  }
}
```

---

## `/losetasOnLine` — Presencia Online por Zonas

Sistema de seguimiento de zona que empareja jugadores en la misma ubicacion del mapa para encuentros. Los usuarios inactivos mas de **15 minutos** se eliminan automaticamente.

| Metodo | Ruta                                    | Descripcion                                              |
|--------|-----------------------------------------|----------------------------------------------------------|
| `GET`  | `/losetasOnLine`                        | Datos de todas las zonas con sus usuarios                |
| `GET`  | `/losetasOnLine/allUsersOnLine`         | Numero total de investigadores conectados                |
| `GET`  | `/losetasOnLine/zone/:id`               | Usuarios conectados en una zona especifica               |
| `GET`  | `/losetasOnLine/randomInvInZone/:id/:idUser` | Investigador aleatorio disponible en una zona (excluye al propio usuario) |
| `POST` | `/losetasOnLine/newInvZone`             | Registrar o mover un investigador a una zona             |

**Zonas disponibles del mapa de Arkham:**

| ID | Nombre |
|----|--------|
| 0  | Centro |
| 1  | Barrio Norte |
| 2  | Barrio Sur |
| 3  | Periferia |
| 4  | Distrito Comercial |
| 5  | Universidad Miskatonic |
| 6  | Barrio Fluvial |
| 7  | Barrio Este |
| 8  | Calle Farola |
| 9  | Calle Puente |
| 10 | Calle Bosque |

**Body para registrar presencia:**
```json
{
  "idZone": "5",
  "idUser": "user_abc123",
  "invData": { "idInv": 1, "name": "Tommy Muldoon" },
  "available": true
}
```
`available: false` permite estar registrado en una zona sin poder ser seleccionado para encuentros.

**Respuesta de zona:**
```json
{
  "idZone": "5",
  "nameZone": "Universidad Miskatonic",
  "userCount": 3,
  "users": [...],
  "specialEvent": {}
}
```

---

## `/interactions` — Encuentros entre Jugadores

Sistema central de interacciones entre dos jugadores. Soporta tres tipos de encuentro: **combate**, **intercambio de objetos** y **resonancia dimensional**. El flujo siempre involucra un **HOST** (quien inicia) y un **GUEST** (quien recibe la invitacion).

### Estados de una interaccion

```
pending → accepted → playing → finished
       → rejected
       → timeout
       → abandoned
       → finished (Espejo Dimensional, resolucion automatica)
```

### Endpoints generales

| Metodo | Ruta                                  | Descripcion                                              |
|--------|---------------------------------------|----------------------------------------------------------|
| `GET`  | `/interactions`                       | Todas las interacciones (debug/admin)                    |
| `POST` | `/interactions`                       | Crear nueva interaccion (HOST envia invitacion al GUEST) |
| `GET`  | `/interactions/pending/:id`           | Invitaciones pendientes para un usuario (GUEST)          |
| `GET`  | `/interactions/poll/:id`              | Polling del estado de la interaccion (HOST y GUEST)      |
| `PUT`  | `/interactions/respond/:id`           | Responder a invitacion: `accepted`, `rejected`, `timeout`|
| `GET`  | `/interactions/gameState/:id`         | Estado completo del juego                                |
| `GET`  | `/interactions/abandon/:id`           | Abandonar el encuentro (con recompensa al rival)         |

**Crear interaccion (HOST):**
```json
{
  "idUserHost": "user_abc123",
  "nameUserHost": "Pedro",
  "idUserGuest": "user_xyz456",
  "invData": { "idInv": 1, "name": "Tommy Muldoon", "atributes": { "life": 8 } },
  "type": "fight",
  "idLocationMap": "5"
}
```
Tipos disponibles: `fight`, `trade`, `resonance`

**Si ambos investigadores tienen el mismo `idInv`**, el backend resuelve automaticamente el evento "Espejo Dimensional" y termina la interaccion sin juego.

---

### Tipo `fight` — Combate

Combate por turnos. Se tiran dados (1d6) para determinar quien empieza; el jugador con mayor resultado ataca primero. Se van restando puntos de vida hasta que uno llega a 0. El perdedor recibe una recompensa aleatoria (`clue`, `remnant` o `money`).

| Metodo | Ruta                               | Descripcion                                          |
|--------|------------------------------------|------------------------------------------------------|
| `PUT`  | `/interactions/initialRoll/:id`    | Enviar resultado de tirada inicial (1d6)             |
| `GET`  | `/interactions/checkMyTurn/:id`    | Consultar si es mi turno. Query: `?idUser=user_abc123` |
| `PUT`  | `/interactions/sendHits/:id`       | Enviar daño del turno actual                         |

**Tirada inicial:**
```json
{ "idUser": "user_abc123", "diceResult": 4 }
```

**Enviar daño:**
```json
{ "idUser": "user_abc123", "hits": 3 }
```

**Respuesta de `checkMyTurn` cuando termina:**
```json
{ "status": "you won", "reward": { "type": "clue", "amount": 1, "description": "1 pista ganada" } }
```

---

### Tipo `trade` — Intercambio de Objetos

Permite intercambiar objetos entre dos investigadores en la misma zona. El HOST propone, el GUEST acepta o contraoferta, y el HOST resuelve la contraoferta.

| Metodo | Ruta                                    | Descripcion                                     |
|--------|-----------------------------------------|-------------------------------------------------|
| `PUT`  | `/interactions/trade/offer/:id`         | HOST envia oferta de intercambio                |
| `PUT`  | `/interactions/trade/guestRespond/:id`  | GUEST acepta o envia contraoferta               |
| `PUT`  | `/interactions/trade/hostResolve/:id`   | HOST acepta o rechaza la contraoferta           |
| `PUT`  | `/interactions/trade/cancel/:id`        | Cualquiera de los dos cancela el intercambio    |

**Flujo de estados del trade:**
```
waitingOffer → offerPending → accepted/counterofferPending → finished/cancelled
```

**HOST envia oferta:**
```json
{
  "idUser": "user_abc123",
  "fromHost": [231, 215],
  "fromGuest": [101]
}
```

**GUEST responde:**
```json
{
  "idUser": "user_xyz456",
  "response": "counteroffer",
  "counterFromHost": [231],
  "counterFromGuest": [101, 220]
}
```
`response` puede ser `"accepted"` o `"counteroffer"`.

**HOST resuelve contraoferta:**
```json
{ "idUser": "user_abc123", "response": "accepted" }
```
`response` puede ser `"accepted"` o `"rejected"`.

---

### Tipo `resonance` — Resonancia Dimensional

Los dos investigadores realizan simultaneamente un ritual de resonancia. Cada uno apuesta turnos de portal y tira dados. Si ambos consiguen al menos 1 exito, el ritual funciona y los turnos de portal se multiplican.

| Metodo | Ruta                               | Descripcion                                         |
|--------|------------------------------------|-----------------------------------------------------|
| `PUT`  | `/interactions/resonance/submit/:id`| Enviar resultado del ritual (apuesta + dados)       |

**Enviar resonancia:**
```json
{
  "idUser": "user_abc123",
  "bet": 3,
  "successes": 2,
  "dice": [5, 6, 3, 1, 4]
}
```

**Resultado cuando ambos han enviado:**
```json
{
  "success": true,
  "resonanceData": {
    "status": "finished",
    "result": "success",
    "portalTurns": 12,
    "host": { "bet": 3, "roll": { "successes": 2, "dice": [5,6,3] }, "ready": true },
    "guest": { "bet": 3, "roll": { "successes": 1, "dice": [6,2,1] }, "ready": true }
  }
}
```
`portalTurns = (bet_host + bet_guest) * 2` si ambos tienen exito. `0` si alguno falla.

---

## `/visits` — Contador de Visitas

| Metodo | Ruta       | Descripcion                        |
|--------|------------|------------------------------------|
| `GET`  | `/visits`  | Obtener el total de visitas        |
| `POST` | `/visits`  | Incrementar el contador en 1       |

---

# Integracion con el Frontend

El frontend es una **Progressive Web App (PWA)** desarrollada con **Vue 3** ubicada en `App_Arkham_Horror_3/multigames/`.

### Stack del frontend

| Tecnologia | Uso |
|------------|-----|
| Vue 3 + Vuex + Vue Router | Framework, estado global y navegacion |
| Axios | Cliente HTTP para llamadas a la API |
| Clerk (`@clerk/vue`) | Autenticacion de usuarios |
| Buefy / Bulma | Componentes UI y estilos |
| Howler | Gestion de audio |
| GSAP | Animaciones |

### Configuracion de entornos en el frontend

El archivo `src/services/api.js` gestiona la URL base con variables de entorno:

```js
// src/services/api.js
const API_URL = process.env.VUE_APP_API_URL_DEV;   // activo en desarrollo
// const API_URL = process.env.VUE_APP_API_URL_PROD;  // para produccion
// const API_URL = process.env.VUE_APP_API_URL_LOCAL;  // para localhost
```

### Servicios del frontend

| Archivo | Funcion |
|---------|---------|
| `src/services/api.js` | Todos los metodos de llamada a la API (apiService) |
| `src/services/invitationService.js` | Polling cada 60s para detectar invitaciones pendientes (GUEST) |
| `src/services/hostPollingService.js` | Polling cada 5s para monitorizar el estado de la interaccion (HOST) |

### Flujo de un encuentro online completo

```
1. GUEST se registra en una zona: POST /losetasOnLine/newInvZone
2. HOST busca investigador en la zona: GET /losetasOnLine/randomInvInZone/:idZone/:idUser
3. HOST crea la interaccion: POST /interactions
4. GUEST detecta la invitacion via polling cada 60s: GET /interactions/pending/:id
5. GUEST acepta o rechaza: PUT /interactions/respond/:id
6. HOST detecta la respuesta via polling cada 5s: GET /interactions/poll/:id
   └─ Si 'fight': ambos tiran dado inicial, luego turnos de combate
   └─ Si 'trade': HOST propone, GUEST responde, HOST resuelve contraoferta
   └─ Si 'resonance': ambos envian su ritual simultaneamente
7. Al finalizar: interaction.status = 'finished'
```

---

# Especificaciones Tecnicas

**Lenguaje y Framework**
- Node.js (ES Modules — `"type": "module"`)
- Express 4.21

**Base de datos**
- MongoDB via Mongoose 8 (partidas activas, votaciones, interacciones)
- JSON estaticos en `databaseJSON/` (catalogo del juego)

**Validacion**
- Zod 3 (schemas en `schemas/`)

**Dependencias principales**

| Paquete | Version | Uso |
|---------|---------|-----|
| express | 4.21.2 | Servidor HTTP |
| mongoose | 8.19.1 | ODM para MongoDB |
| cors | 2.8.5 | Politica de CORS abierta |
| zod | 3.24.2 | Validacion de schemas |
| axios | 1.8.4 | Llamadas HTTP desde modelos |
| nodemon | 3.1.9 | Hot reload en desarrollo |

**Scripts**
```json
"start": "node app.js",
"dev": "nodemon app.js"
```

**Puerto por defecto:** `1234` (o `process.env.PORT`)

**Conexion MongoDB:**
```
mongodb://mongo:****@acela.proxy.rlwy.net:10965
```

**Hosting:** Railway
- Development: `https://api-arkhamhorror-dev.up.railway.app`
- Production: `https://api-arkhamhorror.up.railway.app`

---

# Changelog

### [0.0.4] — 2026-06
#### Added
- Sistema completo de **Resonancia Dimensional** (`/interactions/resonance`)
- Soporte multiidioma en modelos de datos (campos `translations.es` / `translations.en`)
- Documentacion completa de todos los modulos en este README

### [0.0.3] — 2025-10
#### Added
- Sistema completo de **Interacciones Online** (`/interactions`)
  - Flujo HOST/GUEST con polling
  - Tipo `fight`: combate por turnos con tirada inicial y daño
  - Tipo `trade`: intercambio de objetos con contraoferta
  - Espejo Dimensional: resolucion automatica cuando ambos jugadores tienen el mismo investigador
- Sistema de **Presencia Online** por zonas (`/losetasOnLine`)
  - 11 zonas del mapa de Arkham
  - Limpieza automatica de usuarios inactivos (15 min)
  - Seleccion aleatoria de investigador disponible en una zona
- Sistema de **Investigadores Online** (`/invInPlay`) para persistencia del estado del personaje
- Sistema de **Tienda** integrado en partidas (`/mapInPlay/shop`)
- Votaciones y comentarios para **investigadores** (`/inv/likeDislike`, `/inv/comments`)

### [0.0.2] — 2025-05-18
#### Added
- Votaciones comunitarias de mapas: like/dislike, tiempo estimado, dificultad, investigadores recomendados y comentarios
- Endpoints `/enemies`, `/objects`, `/inv/previewList`, `/maps/previewMap`, `/mapInPlay`
- Persistencia de datos dinamicos migrada a MongoDB (partidas, votos)

### [0.0.1] — 2025-04-25
#### Added
- Primer backend conectado con el frontend
- Despliegue en Railway (entornos Development y Production)
- Arquitectura MVC con rutas, controladores y modelos
- Integracion inicial de `maps`, `inv` y datos generales del juego

---

# Enlace a la API

- **Development:** https://api-arkhamhorror-dev.up.railway.app
- **Production:** https://api-arkhamhorror.up.railway.app
- **Local:** `http://localhost:1234`
