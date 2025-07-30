<p align = "center">
  <a href= "#introduccion">Introduccion</a> |
  <a href= "#descripcion">Descripcion</a> |
  <a href= "#Arquitectura de llamadas">Arquitectura de llamadas</a> |
  <a href= "#arquitectura-de-datos">Arquitectura de datos</a> |
  <a href= "#🎯-endpoints">Endpoints</a> |
  <a href= "#especificaciones-tecnicas">Especificaciones tecnicas</a> |
  <a href= "#changelog">Changelog</a> |
  <a href= "#enlace-a-la-api">Enlace a la API</a> 
</p>

<div align="center">
  <img src="/README_FILES/bannerAH.png" >
  <h1> API de App Arkham Horror 3ª Edicion</h1>
</div>

# Introduccion
Bienvenido a la documentación oficial de la API de la App Arkham Horror 3ª Edición.

Esta API forma parte del backend de una aplicación desarrollada para complementar la experiencia del juego de mesa Arkham Horror: Tercera Edición. Aquí encontrarás toda la información necesaria sobre la estructura del servidor, cómo se gestionan y exponen los datos, y de qué manera se comunican con el frontend de la aplicación.

El propósito de esta documentación es proporcionar una guía clara tanto para el desarrollo como para el mantenimiento del sistema, facilitando la comprensión y colaboración en el proyecto.

# Descripcion
La App Arkham Horror 3ª Edición es una herramienta digital diseñada para asistir a los jugadores durante sus partidas. Esta aplicación permite gestionar personajes, enemigos, mapas, fichas y eventos del juego, ofreciendo una experiencia más fluida e inmersiva.

El backend de esta aplicación se encarga de manejar la lógica del juego, almacenar los datos necesarios y ofrecer endpoints que permiten al frontend acceder y actualizar la información en tiempo real.

# ¿Por donde vamos?
En esta fase del desarrollo, la aplicación ya permite realizar de forma online la gestión compartida de algunos elementos clave del juego, en especial las fichas de mapa y las fichas de mitos, así como la resolución de encuentros de manera digital.

La funcionalidad está pensada para complementar la experiencia física del juego de mesa, no para reemplazarla. Los enemigos, las cartas de encuentros, y el avance del escenario se siguen gestionando físicamente sobre el tablero real.

Gracias a un sistema de creación y unión de partidas mediante IP, los jugadores pueden conectarse desde diferentes dispositivos y coordinar la partida de forma sincronizada. Cada jugador gestiona su propio personaje de manera individual, mientras que la gestión de los elementos digitales del mapa se realiza de forma colectiva y online.

Este sistema mejora la organización de la partida y reduce el tiempo de consulta de fichas o resolución de eventos, manteniendo la esencia cooperativa del juego de mesa.


## 🧭 Arquitectura de llamadas
La API del backend está estructurada siguiendo el patrón **MVC** (*Modelo - Vista - Controlador*), lo que permite una separación clara entre la lógica de negocio, el acceso a datos y la definición de rutas.

### 🗂️ Estructura general de las llamadas:

- **🛣️ Rutas (`routes/`)**: Definen los endpoints disponibles para el cliente. Cada archivo de rutas agrupa las llamadas relacionadas a una entidad del juego, como mapas, investigadores o enemigos.
- **🧠 Controladores (`controllers/`)**: Gestionan la lógica de cada endpoint. Reciben las peticiones desde las rutas, procesan los datos y devuelven la respuesta al cliente.
- **📦 Modelos (`models/`)**: Se encargan de la lectura y escritura de datos en los archivos JSON que actúan como base de datos. Cada entidad del juego tiene su propio modelo.
- **🗃️ Datos (`databaseJSON/`)**: Contienen los archivos JSON donde se almacena la información del juego (investigadores, mapas, enemigos, etc.), que es cargada y modificada por los modelos.

### 🔁 Flujo de una llamada típica:

1. El cliente hace una solicitud HTTP (por ejemplo, `GET /maps/preview`).
2. La ruta correspondiente en `routes/maps_routes.js` redirige la petición al controlador (`maps_controller.js`).
3. El controlador procesa la lógica necesaria y consulta o modifica los datos a través del modelo (`maps_model.js`).
4. Se obtiene una respuesta que es enviada de vuelta al cliente, ya sea en forma de datos JSON o confirmación de éxito/error.

### 📌 Ejemplo de rutas disponibles:

- `/maps` → Gestión de mapas y su estado en la partida.
- `/inv` → Información sobre los investigadores y su gestión individual.
- `/enemies` → Consulta de enemigos.
- `/visits` → Registro de visitas (para depuración o control de acceso).
- `/mapsInPlay` → Información del mapa activo en una partida.

Esta arquitectura modular permite escalar el proyecto fácilmente, mantener el código limpio y facilitar futuras actualizaciones o integraciones. 🚀

## 🗄️ Arquitectura de datos

La parte de **datos** de la API se basa en ficheros JSON que actúan como base de datos ligera. Cada tipo de entidad del juego dispone de su propio archivo, facilitando la organización y mantenimiento de la información.

### 📂 Estructura de carpetas:

```
databaseJSON/
├── investigadores.json        # Datos de los investigadores
├── mapas.json                 # Definición de todos los mapas del juego
├── previewMaps.json           # Vistas previas de mapas para carga rápida
├── mapsInPlay.json            # Estado del mapa activo en la partida
├── mitos.json                 # Fichas de mitos y encuentros
├── enemies.json               # Listado de enemigos
├── objects.json               # Objetos y recursos
├── previewInv.json            # Vistas previas de investigadores
├── users.json                 # Información de usuarios y sesiones
├── general.json               # Configuración general del juego
└── visits.json                # Registro de visitas/API usage
```

### 🧩 Modelado de datos:

- **Investigadores**:  
  Cada investigador tiene atributos como `id`, `nombre`, `salud`, `cordura`, `habilidades` y `pertenencias`.

- **Mapas**:  
  Los mapas definen su `id`, `nombre`, `tamaño`, y un array de `zonas` con coordenadas.

- **Mitos y encuentros**:  
  En `mitos.json` se almacenan los eventos de encuentros, con `id`, `descripcion` y `efecto` que se aplican al jugador.

- **Enemigos**:  
  Cada enemigo incluye `id`, `tipo`, `poder`, `resistencia` y `ubicacion` actual en el mapa.

- **Objetos**:  
  Listado de recursos y objetos con `id`, `nombre`, `descripcion` y `efectos`.

- **Estado de partida**:  
  `mapsInPlay.json` contiene el estado actual del mapa, con la posición de fichas de mitos y zonas exploradas.

### 💾 Acceso y persistencia:

- Los **modelos** (`models/*.js`) leen los archivos JSON al iniciar cada petición y escriben los cambios en disco tras operaciones de escritura.
- Se utiliza **lectura síncrona** para garantizar consistencia y **escritura atómica** mediante reescritura completa del fichero tras cada modificación.

Este diseño proporciona una solución sencilla y eficaz para una base de datos ligera, ideal para el prototipo de la App Arkham Horror. ⚙️

# 🎯 Endpoints

A continuación se detallan los principales endpoints disponibles en la API:

| Método   | Ruta                   | Descripción                                                    |
|----------|------------------------|----------------------------------------------------------------|
| `GET`    | `/maps`                | Obtiene la lista completa de mapas.                            |
| `GET`    | `/maps/:id`            | Obtiene los datos de un mapa específico por su `id`.           |
| `GET`    | `/maps/preview`        | Carga previa de mapas para una respuesta más rápida.           |
| `POST`   | `/mapsInPlay`          | Inicializa o actualiza el estado activo de un mapa en partida. |
| `GET`    | `/mapsInPlay`          | Obtiene el estado actual del mapa en juego.                    |
| `DELETE` | `/mapsInPlay/:id`      | Elimina el estado de un mapa en partida por su `id`.           |
| `GET`    | `/inv`                 | Lista todos los investigadores disponibles.                    |
| `GET`    | `/inv/:id`             | Obtiene datos de un investigador concreto por su `id`.         |
| `POST`   | `/inv`                 | Crea un nuevo investigador.                                    |
| `PUT`    | `/inv/:id`             | Actualiza los datos de un investigador existente.              |
| `DELETE` | `/inv/:id`             | Elimina un investigador por su `id`.                           |
| `GET`    | `/enemies`             | Lista todos los enemigos.                                      |
| `GET`    | `/enemies/:id`         | Obtiene datos de un enemigo concreto por su `id`.              |
| `GET`    | `/mitos`               | Lista todas las fichas de mitos y encuentros.                  |
| `GET`    | `/mitos/:id`           | Obtiene datos de un mito/encuentro concreto.                   |
| `GET`    | `/objects`             | Lista todos los objetos y recursos.                            |
| `GET`    | `/objects/:id`         | Obtiene datos de un objeto específico por su `id`.             |
| `GET`    | `/visits`              | Obtiene el registro de accesos y uso de la API.                |
| `POST`   | `/visits`              | Registra una nueva visita o evento de uso.                     |

> 🚀 **Tip**: Para rutas con parámetros (`:id`), asegúrate de enviar el identificador correcto en la URL.


## 🛠️ Especificaciones técnicas

- **Lenguaje y Framework**  
  - Node.js  
  - Express.js  

- **Base de datos**  
  - Ficheros JSON en `databaseJSON/` (lectura síncrona y escritura)

- **Entorno de ejecución**  
  - **Hosting:** Railway  
  - **Environments:**  
    - 🧪 **Development**: Proyecto en Railway para pruebas y prácticas continuas.  
    - 🚀 **Production**: Proyecto en Railway estable, desplegado cuando todas las funcionalidades están validadas.

- **Dependencias principales**  
- `express`  
- `cors`  
- `body-parser`  
- `nodemon` (solo en Development)

## 📜 Changelog

Toda modificación notable a esta API será documentada en este archivo.

### [Unreleased]
- 🚧 Trabajo en curso: votacion de mapas e investigadores recomendados

### [0.0.2] - 2025-05-18
#### Added
- 🔁 Flujo de peticiones HTTP documentado  
- 🎯 Nuevos Endpoints a :  `enemies` ,`objects`, `previewInv` , `previewMaps` y `mapsInPlay`
- 🗄️ Se han ajustado la creacion de los mapas in play debido a la integracion de gestion de usuario en front.

---

### [0.0.1] - 2025-04-25
#### Added
- ⚙️ primeros pasos de backend conectado con Frontend 
- 🛠️ Despliegue en Railway (entornos **Development** y **Production**)  
- 🗄️ Arquitectura de datos con ficheros JSON 
- 🗂️ Estructura MVC con rutas, controladores y modelos  
- 🚀 Integración inicial de `maps` `inv` y `general` 


## 🔗 Enlace a la API

- 🧪 **Development:**  
  https://api-arkhamhorror-dev.up.railway.app

- 🚀 **Production:**  
  https://api-arkhamhorror.up.railway.app


