# Esquema de Base de Datos MongoDB — Urban Moto Gleam 🏍️✨

> Documento de diseño base de datos para el proyecto *Urban Moto Gleam* (Computación al Cliente).
> Semestre: Computación al Cliente · Proyecto: `proyecto_lenguajeweb`

---

## 1. Análisis del proyecto

El proyecto original es una **landing page premium** para un lavadero ficticio de motos en Bogotá,
construida con **Next.js 16 (App Router) + TypeScript + Chakra UI + GSAP**. Toda la información de contenido
vivía en un único archivo `data.json`, y las interacciones del usuario (reserva de cita, formulario de
contacto, chatbot) **no persistían ningún dato** — solo mostraban mensajes visuales (*toasts*).

### 1.1 Contenido actual (`data.json` → colecciones)

> `data.json` sigue existiendo como **fuente de verdad para el seed** y como **respaldo**: si MongoDB no
> está disponible, la landing se renderiza con él en lugar de romperse.

| Sección | Descripción | ¿Estática o transaccional? | Colección |
| :--- | :--- | :--- | :--- |
| `company` | Datos de la empresa, contacto, redes | Contenido estático (config) | `company` ✅ |
| `packages` | 6 servicios/paquetes con precio | Contenido estático | `paquetes` ✅ |
| `processSteps` | Proceso de lavado en 6 pasos | Contenido estático | `proceso_lavado` ✅ |
| `benefits` | Beneficios / ventajas | Contenido estático | `company.beneficios` ✅ |
| `testimonials` | 6 opiniones de clientes | **Dinámica** | `testimonios` ✅ |
| `faq` | 5 preguntas frecuentes | Contenido estático | `faqs` ✅ |
| `images` | Rutas de imágenes/video | Contenido estático | `company.imagenes` ✅ |

### 1.2 Interacciones del usuario (hoy sin base de datos)

| Componente | Qué captura | Qué se hará con MongoDB |
| :--- | :--- | :--- |
| `BookingModal` | Nombre, cédula, celular, placa, marca, modelo, servicio, fecha, hora, observaciones | Colección **reservas** |
| `ContactSection` | Nombre, email, mensaje | Colección **mensajes** |
| `FaqChatbot` | Conversación usuario/bot | Colección **conversaciones** |

> **💬 Nota — el chatbot es requisito obligatorio del profe.** El proyecto ya incluye un chatbot
> (`FaqChatbot`), que hoy responde en el frontend con reglas. En el esquema de BD ese chatbot se modela
> con la colección **`conversaciones`** (sección 3.9): cada conversación guarda la sesión, y sus mensajes
> van **embebidos** en un arreglo `mensajes[]`. Así el esquema refleja y soporta el chatbot exigido por
> el profesor.

> **🧑‍🔧 Nota sobre `users` (decisión tomada).** El proyecto **no tiene módulo de login ni registro**,
> así que `users` se deja **fuera del flujo** de la landing. Los datos del cliente se **denormalizan**
> directamente en la reserva (`nombre`, `cedula`, `celular`), que es lo que realmente necesita el taller
> para atender la moto. Las colecciones que referenciaban `users` lo hacen de forma **opcional**
> (`testimonios.usuarioId`, `mensajes.atendidoPor`, `conversaciones.usuarioId`), de modo que el esquema
> queda listo para un futuro login sin romper nada hoy.

### 1.3 ¿Por qué MongoDB y no SQL?

- El proyecto ya modela su contenido como **documentos JSON** (`data.json`), lo que encaja de forma
  natural con el modelo de documentos de MongoDB.
- Los datos del lavadero son **flexibles** (cada paquete tiene su propia lista de características,
  cada moto su propia configuración): MongoDB permite variar la forma de cada documento sin esquema rígido.
- Las relaciones son **pocas y simples** (`1-N`), ideales para manejarse por **referencias (ObjectId)**
  en lugar de *JOINs* de SQL.

> **Nota de terminología**: en MongoDB no hablamos de *tablas* sino de **colecciones**, y los registros
> son **documentos** (tipo JSON/BSON). Las *relaciones* se implementan de dos formas: **embebidas**
> (sub-documentos dentro de un documento) o por **referencia** (un campo que guarda el `ObjectId` de otro documento).

---

## 2. Colecciones propuestas

| # | Colección | Rol | Relación |
| :--: | :--- | :--- | :--- |
| 1 | `company` | Config de la empresa | — (único documento) |
| 2 | `paquetes` | Servicios/precios | → referencia desde reservas |
| 3 | `reservas` | **Citas agendadas (núcleo del sistema)** | → `paquetes` (opcional) |
| 4 | `testimonios` | Opiniones | → `users` (opcional) |
| 5 | `mensajes` | Formulario de contacto | → `users` (atendido por) |
| 6 | `conversaciones` | Chatbot (mensajes 📦 embebidos) | → `users` (opcional) |
| 7 | `faqs` | Preguntas frecuentes | — |
| 8 | `proceso_lavado` | Pasos del servicio | — |

> **Colecciones modeladas y listas para crecer** (sin flujo activo en la landing):
> `users`, `motos`, `suscripciones`. Se documentan abajo para dejar el modelo completo.
>
> **Colecciones implementadas y en uso:**
> `company`, `paquetes`, `reservas`, `testimonios`, `faqs`, `proceso_lavado` + `mensajes` y
> `conversaciones` (modeladas, pendientes de conectar a los formularios).

---

## 3. Estructura de documentos por colección

### 3.1 `company` — configuración de la empresa
Documento **único** (patrón de *config singleton*): se guarda la información institucional.

```js
{
  nombre: "Urban Moto Gleam",
  slogan: "Brillo Urbano, Cuidado Ecológico",
  descripcion: "...",
  mision: "...",
  vision: "...",
  certificaciones: ["Sello Verde Bogotá 2026 (simulado)", "..."],
  ubicacion: "Calle 100 #15-20, Bogotá, Colombia",
  whatsapp: "+57 300 123 4567",
  email: "info@urbanmotogleam.com",
  telefono: "+57 601 123 4567",
  horario: "Lunes a Sábado: 8:00-19:00 | Domingos: 9:00-16:00",
  redesSociales: [{ nombre: "Instagram", url: "..." }, { nombre: "Facebook", url: "..." }]
}
```

### 3.2 `users` — clientes y personal 🔜 *(modelada, sin flujo activo)*
Colección **núcleo** en el diseño original. **Decisión actual: el sitio no tiene login**, por lo que
`users` no participa en el flujo de reservas (los datos del cliente van denormalizados en `reservas`).
Se mantiene documentada para cuando se quiera agregar historial por cliente o cuentas de empleado.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `nombre` | string | — | — |
| `email` | string | **unique** | Login / contacto |
| `telefono` | string | — | — |
| `rol` | string | — | `cliente` / `empleado` / `admin` |
| `contrasenaHash` | string | — | Solo autenticación |
| `estado` | string | — | `activo` / `inactivo` |
| `fechaRegistro` | Date | — | — |
| `createdAt` / `updatedAt` | Date | — | Auditoría |

### 3.3 `motos` — vehículos de los clientes
Un cliente puede tener varias motos (relación **1:N** con `users`).

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `usuarioId` | ObjectId | **index** | → `users._id` |
| `marca` | string | — | ej. Yamaha |
| `modelo` | string | — | ej. R15 |
| `placa` | string | **unique** | — |
| `cilindraje` | number | — | cc |
| `color` | string | — | — |
| `anio` | number | — | — |

> *Alternativa NoSQL*: si un cliente tiene pocas motos, podrían **embeberse** en `users.motos[]`.
> Aquí las separamos por claridad y porque admiten consultas propias (historial por placa).

### 3.4 `paquetes` — servicios y precios
Corresponden a los 6 `packages` de `data.json`.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `titulo` | string | — | ej. "Lavado Premium" |
| `descripcion` | string | — | — |
| `precio` | number | — | **Numérico** para filtrar/ordenar (hoy es texto) |
| `moneda` | string | — | `COP` |
| `duracion` | string | — | ej. "60-75 minutos" |
| `categoria` | string | — | `lavado` / `detailing` / `motor` / `suscripcion` |
| `caracteristicas` | string[] | — | Lista embebida |
| `icono` | string | — | ruta SVG |
| `activo` | boolean | — | — |

> En base de datos el **precio se guarda como número** (`55000`) y aparte la moneda, para poder hacer
> consultas del tipo "servicios entre $50.000 y $100.000" o cálculos de facturación.

### 3.5 `reservas` — citas agendadas ⭐ (implementada)
Es la colección **transaccional clave** (sustituye al modal de reserva que hoy no guarda nada).
Sin login, los datos personales se **denormalizan** para que el taller tenga todo en un solo documento.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `codigo` | string | **unique** | Código que se comparte al cliente, ej. `UMG-S98N2` |
| **— Datos del cliente —** | | | |
| `nombre` | string | — | — |
| `cedula` | string | — | Cédula de ciudadanía (solo dígitos) |
| `celular` | string | — | Formato internacional sin `+`, ej. `573001234567` (WhatsApp) |
| `email` | string | — | Opcional |
| **— Datos de la moto —** | | | |
| `placa` | string | **index** | Se guarda en mayúsculas, ej. `ABC12D` |
| `marca` | string | — | ej. Yamaha |
| `modelo` | string | — | ej. R15 |
| **— Cita —** | | | |
| `servicio` | string | — | Título del paquete elegido |
| `paqueteId` | ObjectId | — | → `paquetes._id` (opcional, si existe en catálogo) |
| `fecha` | Date | **compound** | Medianoche **UTC** del día reservado |
| `hora` | string | **compound** | Bloque horario, ej. `"08:00"` |
| `observaciones` | string | — | Opcional (ej. "rayón en el tanque, evitar esa zona") |
| **— Gestión —** | | | |
| `estado` | string | **index** | `pendiente`/`confirmada`/`en_proceso`/`completada`/`cancelada` |
| `activa` | boolean | **compound** | Campo técnico: `false` cuando la reserva se cancela |
| `whatsappEnviado` | boolean | — | Si el envío automático por WhatsApp Web tuvo éxito |
| `whatsappError` | string | — | Detalle del fallo (si lo hubo) |
| `createdAt` / `updatedAt` | Date | — | Auditoría |

> **🔒 Índice único parcial — control de sobrecupos.** Un mismo día y hora solo admite **una reserva
> activa**:
>
> ```js
> db.reservas.createIndex(
>   { fecha: 1, hora: 1 },
>   { unique: true, partialFilterExpression: { activa: true }, name: "cupo_unico_activo" }
> )
> ```
>
> Se usa `partialFilterExpression` en vez de un único plano para que cancelar una reserva **libere el
> cupo**. Si dos personas confirman el mismo bloque en simultáneo, MongoDB rechaza la segunda (error
> `11000`) y la API responde **409 Conflict**.

> **💡 Índices de apoyo:** `{ estado: 1, fecha: 1 }` para filtrar la agenda del panel y
> `{ createdAt: -1 }` para listar por las más recientes.

### 3.6 `suscripciones` — membresía *Prime*
Modela el paquete "Suscripción Mensual Prime" (4 lavados premium/mes, descuentos, prioridad).

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `usuarioId` | ObjectId | **index** | → `users._id` |
| `paqueteId` | ObjectId | — | → `paquetes._id` (el paquete Prime) |
| `fechaInicio` | Date | — | — |
| `fechaFin` | Date | — | — |
| `estado` | string | — | `activa`/`pausada`/`cancelada`/`vencida` |
| `renovacionAutomatica` | boolean | — | — |
| `usosRestantes` | number | — | lavados disponibles del mes (4) |

### 3.7 `testimonios` — opiniones
Colección **dinámica** (ya existía en `data.json`, pero debe crecer con cada cliente).

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `usuarioId` | ObjectId | — | → `users._id` |
| `texto` | string | — | — |
| `rating` | number | — | 1–5 |
| `aprobado` | boolean | — | moderación (mostrar solo aprobados) |
| `creadoEn` | Date | — | — |

### 3.8 `mensajes` — formulario de contacto
Captura lo que hoy ingresa el usuario en `ContactSection` sin guardarse.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `nombre` | string | — | — |
| `email` | string | — | — |
| `telefono` | string | — | opcional |
| `mensaje` | string | — | — |
| `leido` | boolean | — | bandeja de contacto |
| `atendidoPor` | ObjectId | — | → `users._id` (empleado) |
| `creadoEn` | Date | — | — |

### 3.9 `conversaciones` — chatbot
Guarda las conversaciones del `FaqChatbot`. Los mensajes van **embebidos** (patrón 1-few).

```js
{
  sesionId: "uuid-1234",          // identifica la sesión del navegador
  usuarioId: ObjectId (→ users),  // opcional, si hay usuario logueado
  mensajes: [                     // 📦 EMBEBIDO (sub-documentos)
    { rol: "usuario", texto: "¿Cuánto vale el Premium?", fecha: ISODate(...) },
    { rol: "bot",     texto: "El Lavado Premium cuesta $105.000...", fecha: ISODate(...) }
  ],
  tema: "precios",                // clasificación opcional
  creadoEn: ISODate(...),
  ultimoMensajeEn: ISODate(...)
}
```

### 3.10 `faqs` — preguntas frecuentes
Contenido estático estructurado.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `pregunta` | string | — | — |
| `respuesta` | string | — | — |
| `categoria` | string | — | opcional |
| `orden` | number | — | para ordenar UI |
| `activo` | boolean | — | — |

### 3.11 `proceso_lavado` — pasos del servicio
Los 6 pasos de `processSteps`.

| Campo | Tipo | Índice | Notas |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK auto | — |
| `paso` | number | **unique** | 1–6 |
| `titulo` | string | — | — |
| `descripcion` | string | — | — |

---

## 4. Relaciones (resumen)

> Con la decisión de **no usar login**, `users` sale del flujo principal y las relaciones de la landing
> se reducen a las que aparecen marcadas ✅.

| Desde | Hacia | Tipo | Campo de referencia | Estado |
| :--- | :--- | :--- | :--- | :--: |
| `paquetes` | `reservas` | 1 : N | `reservas.paqueteId` | ✅ |
| `users` | `motos` | 1 : N | `motos.usuarioId` | 🔜 |
| `users` | `reservas` | 1 : N | *(denormalizado: `reservas.nombre`)* | — |
| `users` | `suscripciones` | 1 : N | `suscripciones.usuarioId` | 🔜 |
| `users` | `testimonios` | 1 : N | `testimonios.usuarioId` (opcional) | 🔜 |
| `users` | `mensajes` | 1 : N (atendido por) | `mensajes.atendidoPor` | 🔜 |
| `users` | `conversaciones` | 1 : N | `conversaciones.usuarioId` (opcional) | 🔜 |
| `paquetes` | `suscripciones` | 1 : N | `suscripciones.paqueteId` | 🔜 |

**Diagrama de lo implementado:**

```
        ┌───────────────┐
        │    company    │   (config singleton)
        └───────────────┘

        ┌───────────────┐
        │   paquetes    │   (6 servicios con precio numérico)
        └───────┬───────┘
                │ 1:N (paqueteId, opcional)
                ▼
        ┌───────────────┐        ┌──────────────┐
        │   reservas    │  N:1   │   faqs       │
        │  (cliente +   │        ├──────────────┤
        │   moto + cita)│        │proceso_lavado│
        └───────────────┘        └──────────────┘
                │
                └── WhatsApp Web (automático) ──▶ 📱 cliente
```

---

## 5. Decisiones de diseño MongoDB

1. **Referencias (ObjectId) para relaciones 1:N** — `paqueteId` apunta a `paquetes`, lo que facilita
   consultas y evita duplicar datos.
2. **Denormalización en `reservas`** — al no haber login, los datos del cliente viajan dentro de la
   reserva. Es el compromiso correcto: una reserva siempre se lee con su cliente.
3. **Embedding para los mensajes del chatbot** — los mensajes de una conversación siempre se leen/guardan
   juntos y en cantidad pequeña, así que se incrustan dentro de `conversaciones.mensajes[]`.
4. **Precios numéricos** — `precio` se guarda como `number` + `moneda` + `notaPrecio` para permitir
   ordenar y filtrar (hoy el precio es texto como `"COP $55.000"`).
5. **Índice único parcial para los cupos** — `{ fecha, hora }` único solo sobre `activa: true`. Es la
   forma idiomática en MongoDB de imponer una regla de negocio condicional (cancelar libera el cupo).
6. **Fechas en UTC** — `fecha` se guarda a medianoche UTC para evitar corrimientos por zona horaria
   (Bogotá es UTC-5); la hora va aparte como string `"HH:MM"`.
7. **Índices** para las consultas frecuentes: `reservas.{fecha,hora}` (compound, cupos),
   `reservas.estado + fecha` (panel), `reservas.placa`, `paquetes.activo`, `faqs.activo`.
8. **Campos de auditoría** — `createdAt` / `updatedAt` automáticos (timestamps de Mongoose).
9. **`company` como configuración singleton** — un solo documento, ya que la información de la empresa es única.

---

## 6. Ejemplos de consultas

```js
// Cupos ocupados de un mes (para pintar el calendario del modal)
db.reservas.find(
  { fecha: { $gte: ISODate("2026-10-01"), $lt: ISODate("2026-11-01") }, activa: true },
  { fecha: 1, hora: 1 }
)

// Horas tomadas de un día concreto
db.reservas.find({ fecha: ISODate("2026-10-05"), activa: true }, { hora: 1 })

// Agenda del panel: próximas citas confirmadas
db.reservas.find({ estado: "confirmada", fecha: { $gte: new Date() } }).sort({ fecha: 1, hora: 1 })

// Buscar por placa o por código de reserva
db.reservas.find({ $or: [{ placa: "ABC12D" }, { codigo: "UMG-S98N2" }] })

// Paquetes entre $50.000 y $120.000
db.paquetes.find({ precio: { $gte: 50000, $lte: 120000 }, activo: true })

// Testimonios aprobados ordenados por fecha
db.testimonios.find({ aprobado: true }).sort({ createdAt: -1 })

// Unir una reserva con su paquete (aggregation lookup)
db.reservas.aggregate([
  { $match: { codigo: "UMG-S98N2" } },
  { $lookup: { from: "paquetes", localField: "paqueteId", foreignField: "_id", as: "paquete" } }
])

// Historial del chatbot de una sesión
db.conversaciones.findOne({ sesionId: "uuid-1234" }, { mensajes: 1 })
```

---

## 7. Arquitectura implementada

```mermaid
flowchart LR
  UI["Componentes cliente<br/>BookingModal · FaqChatbot"] -->|fetch| API["Route Handlers<br/>/api/reservas · /api/disponibilidad"]
  RSC["Server Component<br/>app/page.tsx"] -->|lee directo| DAL["Capa de datos<br/>src/lib/*"]
  ADMIN["/admin (panel interno)"] -->|fetch| API
  API --> DAL
  DAL --> DB[(MongoDB local<br/>urban_moto_gleam)]
  DAL --> WA["whatsapp-web.js<br/>(Chromium + sesión vinculada)"]
  WA --> 📱["📱 WhatsApp del cliente"]
```

### 7.1 Estructura de archivos

| Archivo | Rol |
| :--- | :--- |
| `src/lib/mongodb.ts` | Conexión cacheada (reutiliza la conexión entre recargas en dev) |
| `src/lib/models/*.ts` | Modelos Mongoose (uno por colección) |
| `src/lib/reservas.ts` | Constantes y utilidades compartidas cliente/servidor |
| `src/lib/whatsapp.ts` | Cliente de WhatsApp Web: arranca la sesión, muestra el QR y envía los mensajes |
| `src/lib/seed.ts` | Carga `data.json` en las colecciones (idempotente) |
| `src/lib/contenido.ts` | Lee la BD y la adapta al contrato `LandingData` |
| `instrumentation.ts` | Arranca el cliente de WhatsApp al iniciar el servidor |
| `app/api/reservas/route.ts` | `GET` listado · `POST` crear reserva |
| `app/api/reservas/[id]/route.ts` | `PATCH` cambiar estado · `DELETE` eliminar |
| `app/api/disponibilidad/route.ts` | Ocupación real por mes y por día |
| `app/api/admin/seed/route.ts` | `POST` sembrar contenido |
| `app/admin/` | Panel de reservas |

### 7.2 Endpoints

| Método | Ruta | Descripción |
| :-- | :--- | :--- |
| `GET` | `/api/reservas?estado=&q=` | Lista reservas filtradas (panel) |
| `POST` | `/api/reservas` | Crea la reserva, valida el cupo y envía el WhatsApp al cliente |
| `PATCH` | `/api/reservas/:id` | Cambia el estado (`pendiente` → `confirmada` → …) |
| `DELETE` | `/api/reservas/:id` | Elimina una reserva |
| `GET` | `/api/disponibilidad?mes=YYYY-MM&fecha=YYYY-MM-DD` | Ocupación del calendario en tiempo real |
| `POST` | `/api/admin/seed` | Siembra `data.json` en MongoDB |

### 7.3 Notificación por WhatsApp (whatsapp-web.js)

El envío es **automático**: al crearse la reserva, el servidor manda al cliente el mensaje con día, hora,
nombre, moto, placa, servicio y observaciones.

Se usa **`whatsapp-web.js`**, que controla una sesión real de WhatsApp Web con Chromium. Por eso:

1. Al arrancar el servidor (`instrumentation.ts`) se imprime un **código QR en la terminal**.
2. Se escanea **una sola vez** (WhatsApp → *Dispositivos vinculados*). La sesión queda guardada en
   `.wwebjs_auth/`, así que no hay que repetirlo.
3. A partir de ahí, cada reserva dispara el mensaje sin intervención humana.

Al ser una librería no oficial y pensada para **demo local**, se debe tener el servidor corriendo; no es
adecuada para producción (riesgo de bloqueo del número).

### 7.4 Variables de entorno

```bash
MONGODB_URI=mongodb://localhost:27017/urban_moto_gleam

# WhatsApp vía whatsapp-web.js: no requiere ninguna variable.
# La vinculación se hace escaneando el QR que aparece en la terminal.
```

### 7.5 Panel de administración

Ruta **`/admin`** (sin autenticación, modo demo). Muestra tarjetas de resumen, buscador por
código/nombre/placa/cédula/celular, filtro por estado, cambio de estado en línea, botón para abrir el
WhatsApp del cliente y borrado de reservas. Se **autorrefresca cada 30 segundos** para ver las reservas
llegar en vivo. También incluye el botón **«Sembrar contenido»**.

### 7.6 Cómo ejecutarlo

```bash
# 1) Enciende MongoDB local (o ábrelo con Compass)
# 2) Configura .env.local (copia de .env.example)
# 3) Instala y corre
pnpm install
pnpm dev
# 4) Vincula WhatsApp: escanea el QR que aparece en la terminal
#    (WhatsApp → Dispositivos vinculados). Solo la primera vez.
# 5) Siembra el contenido (una vez)
curl -X POST http://localhost:3000/api/admin/seed
# o pulsa «Sembrar contenido» en http://localhost:3000/admin
```
Puedes inspeccionar la base en **MongoDB Compass** conectándote a
`mongodb://localhost:27017` y abriendo la base **`urban_moto_gleam`**.

---

## 8. Pendientes / mejoras futuras

- Conectar `ContactSection` → `mensajes` y `FaqChatbot` → `conversaciones` (los modelos ya existen).
- Autenticación del panel (clave en variable de entorno) si se publica en internet.
- `users` + `motos` + `suscripciones` cuando se quiera historial por placa y membresía Prime.
- Notificaciones internas al taller (correo o WhatsApp del negocio) cuando entre una reserva.
```
