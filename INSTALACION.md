# Guía de instalación y puesta en marcha

> **Urban Moto Gleam** · Landing de lavadero premium de motos con reservas, panel de
> administración y notificaciones por WhatsApp.
>
> Stack: **Next.js 16** (App Router) · **React 19** · **Chakra UI** · **GSAP** ·
> **MongoDB 8 + Mongoose 9** · **whatsapp-web.js**

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Clonar e instalar dependencias](#2-clonar-e-instalar-dependencias)
3. [Base de datos](#3-base-de-datos)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Sembrar el contenido inicial](#5-sembrar-el-contenido-inicial)
6. [Ejecutar la aplicación](#6-ejecutar-la-aplicación)
7. [Vincular WhatsApp](#7-vincular-whatsapp)
8. [Acceso al panel de administración](#8-acceso-al-panel-de-administración)
9. [Verificación de que todo funciona](#9-verificación-de-que-todo-funciona)
10. [Solución de problemas](#10-solución-de-problemas)
11. [Comandos útiles](#11-comandos-útiles)
12. [Estructura del proyecto](#12-estructura-del-proyecto)
13. [Notas de seguridad](#13-notas-de-seguridad)

---

## 1. Requisitos

| Herramienta | Versión mínima | Cómo verificar |
| :--- | :--- | :--- |
| Node.js | 20 LTS o superior | `node -v` |
| pnpm | 9 o superior | `pnpm -v` |
| MongoDB Community Server | 7.x u 8.x | ver sección [3](#3-base-de-datos) |
| MongoDB Compass | cualquiera reciente | opcional, para inspeccionar datos |
| Google Chrome | última | lo descarga Puppeteer automáticamente |

### Instalar Node.js y pnpm

```bash
# Node.js: descargar el LTS desde https://nodejs.org
# Luego habilitar pnpm (viene con corepack, incluido en Node)
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

> Si prefieres no usar `corepack`:
> `npm install -g pnpm`

---

## 2. Clonar e instalar dependencias

```bash
git clone https://github.com/Menethil0503/proyecto_lenguajeweb.git
cd proyecto_lenguajeweb
pnpm install
```

> **Importante:** el proyecto usa `pnpm` (hay `pnpm-lock.yaml`). No mezcles con
> `npm install` porque generaría un `package-lock.json` y versiones distintas.

La primera instalación descarga **Chromium** para `whatsapp-web.js` (unos 190 MB) y
tarda un poco. Es normal.

---

## 3. Base de datos

### 3.1 Instalar MongoDB Community Server

1. Descargar desde <https://www.mongodb.com/try/download/community>
2. Instalar con la opción **"Run MongoDB as a Service"** marcada.
3. Verificar que el servicio esté corriendo:

```powershell
Get-Service MongoDB
# Status debe decir: Running
```

4. Comprobar que escucha en el puerto por defecto:

```powershell
Test-NetConnection -ComputerName localhost -Port 27017
# TcpTestSucceeded : True
```

> En macOS: `brew install mongodb-community && brew services start mongodb-community`
> En Linux: `sudo systemctl start mongod`

### 3.2 Conectar con MongoDB Compass (opcional pero recomendado)

1. Abrir **MongoDB Compass** → *New Connection*.
2. Pegar la cadena:

```
mongodb://localhost:27017/urban_moto_gleam
```

3. Pulsar **Connect**.

La base `urban_moto_gleam` **no existe hasta la primera ejecución**: se crea sola al
guardar el primer documento. Es normal no verla al principio.

### 3.3 Colecciones

El proyecto usa **8 colecciones**. Las 5 de contenido se llenan con el *seed*
(paso [5](#5-sembrar-el-contenido-inicial)); las 3 restantes se llenan con el uso normal:

| Colección | Origen | Contenido esperado tras el seed |
| :--- | :--- | :--- |
| `company` | seed | 1 documento |
| `paquetes` | seed | 6 documentos |
| `faqs` | seed | 5 documentos |
| `proceso_lavado` | seed | 6 documentos |
| `testimonios` | seed | 6 documentos |
| `reservas` | uso | crece con cada cita |
| `mensajes` | uso | formulario de contacto (aún sin conectar) |
| `conversaciones` | uso | chatbot (aún sin conectar) |

> Las colecciones `users`, `motos` y `suscripciones` están **diseñadas pero no
> implementadas** (el sitio no tiene login de clientes). Aparecen documentadas en
> `db-schema/esquema-mongodb.md`.

### 3.4 Reiniciar la base desde cero

Si necesitas limpiar todo y volver a empezar, en Compass:

1. Seleccionar la base `urban_moto_gleam`.
2. Menú **⋮ → Drop Database**.
3. Volver a ejecutar el seed del paso [5](#5-sembrar-el-contenido-inicial).

---

## 4. Variables de entorno

El proyecto **no funciona sin `.env.local`**. Créalo copiando la plantilla:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

Luego completa los valores:

```env
# ── Base de datos ─────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/urban_moto_gleam

# ── Panel de administración ───────────────────────────────────
ADMIN_USUARIO=urbanadmin
ADMIN_PASSWORD_HASH=<hash generado con el comando de abajo>
AUTH_SECRET=<cadena aleatoria de al menos 32 caracteres>
AUTH_COOKIE_SECURE=true
```

### 4.1 Generar el hash de la contraseña

La contraseña **nunca se guarda en texto plano**, solo su hash `scrypt` con sal.
Ejecuta esto y pega el resultado en `ADMIN_PASSWORD_HASH`:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16);console.log('scrypt:'+s.toString('hex')+':'+c.scryptSync('TU_CLAVE_AQUI',s,64).toString('hex'))"
```

### 4.2 Generar el `AUTH_SECRET`

Es la clave con la que se firma la cookie de sesión:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.3 Sobre `AUTH_COOKIE_SECURE`

| Escenario | Valor |
| :--- | :--- |
| `localhost` (desarrollo) | `true` o `false`, funciona igual |
| Demo en red local por HTTP (`192.168.x.x:3000`) | **`false`** obligatorio |
| Producción con HTTPS | `true` |

Con `true` sobre HTTP el navegador **no envía la cookie** y el panel te devuelve al
login en bucle.

---

## 5. Sembrar el contenido inicial

Con el servidor en marcha (paso [6](#6-ejecutar-la-aplicación)), siembra el contenido
**una sola vez**. La forma más sencilla es desde el panel:

1. Entra a <http://localhost:3000/admin>
2. Inicia sesión.
3. Pulsa el botón **«Sembrar contenido»**.

Respuesta esperada:

```json
{
  "mensaje": "Contenido sembrado en MongoDB.",
  "company": 1,
  "paquetes": 6,
  "faqs": 5,
  "proceso": 6,
  "testimonios": 6
}
```

El proceso es **idempotente**: puedes ejecutarlo varias veces sin duplicar documentos.

> La landing funciona aunque MongoDB esté apagado o sin sembrar: usa `data.json` como
> respaldo. Pero **el panel y las reservas sí requieren la base**.

---

## 6. Ejecutar la aplicación

```bash
pnpm dev
```

Abre <http://localhost:3000>.

Para probar el build de producción:

```bash
pnpm build
pnpm start
```

Al arrancar, en la terminal aparecerá el mensaje de WhatsApp (y el QR si no está
vinculado):

```
[WhatsApp] Escanea este código QR (WhatsApp → Dispositivos vinculados):
```

---

## 7. Vincular WhatsApp

El envío automático usa **`whatsapp-web.js`**, que controla una sesión real de
WhatsApp Web mediante Chromium.

### Pasos

1. Con el servidor corriendo, mira la terminal: aparece un **código QR** en ASCII.
2. En el teléfono del taller: **WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo**.
3. Escanea el QR de la terminal.
4. Cuando veas `[WhatsApp] Conectado`, ya funciona.

La sesión queda guardada en `.wwebjs_auth/` (ignorada por Git), así que **solo se
escanea una vez**. En arranques posteriores se reconecta sola.

### Resultado

Al crear una reserva, el cliente recibe automáticamente un mensaje con:

- Código de reserva
- Nombre y cédula
- Moto (marca, modelo y placa)
- Servicio
- Fecha y hora
- Observaciones (si las hay)

El resultado del envío se guarda en `reservas.whatsappEnviado` y, si falla,
el motivo en `reservas.whatsappError`.

> ⚠️ `whatsapp-web.js` es **no oficial**. Sirve para demo y uso interno, pero no se
> recomienda para producción (riesgo de bloqueo del número).

---

## 8. Acceso al panel de administración

| | |
| :--- | :--- |
| **URL** | <http://localhost:3000/admin> |
| **Usuario** | el valor de `ADMIN_USUARIO` en `.env.local` |
| **Contraseña** | la que usaste para generar `ADMIN_PASSWORD_HASH` |

> Las credenciales concretas de este proyecto **se comparten por fuera del repositorio**
> (mensaje directo al compañero). No se escriben aquí a propósito.

### Funciones del panel

- Agenda **agrupada por día** (etiquetas *Hoy*, *Mañana*, *Pasado*).
- Filtros rápidos: *Todas · Hoy · Mañana · 7 días · Este mes*.
- Rango personalizado `Desde` / `Hasta`.
- Búsqueda por código, nombre, placa, cédula o celular.
- Filtro por estado y cambio de estado en línea.
- Enlace directo al WhatsApp del cliente.
- Borrado de reservas.
- Botón **«Sembrar contenido»**.
- Refresco automático cada 30 segundos.

### Seguridad incluida

- Contraseña con hash `scrypt` y comparación en tiempo constante.
- Sesión en cookie `HttpOnly` firmada con HMAC-SHA256, válida 8 horas.
- Protección de rutas con `proxy.ts` (Next 16) **y** validación en cada endpoint.
- Bloqueo de 15 minutos tras 5 intentos fallidos.

---

## 9. Verificación de que todo funciona

Marca cada casilla:

- [ ] `pnpm install` terminó sin errores.
- [ ] El servicio **MongoDB** está `Running`.
- [ ] `.env.local` existe y tiene `MONGODB_URI`, `ADMIN_PASSWORD_HASH` y `AUTH_SECRET`.
- [ ] `pnpm dev` arranca y <http://localhost:3000> carga la landing con paquetes y testimonios.
- [ ] En Compass aparecen las 5 colecciones de contenido con datos.
- [ ] `http://localhost:3000/admin` redirige a `/admin/login`.
- [ ] El login con las credenciales correctas entra al panel.
- [ ] Una reserva de prueba desde la web aparece en el panel.
- [ ] Repetir la misma fecha y hora devuelve error («horario ya reservado»).
- [ ] La terminal muestra `[WhatsApp] Conectado` y el cliente recibe el mensaje.
- [ ] `pnpm lint` y `pnpm build` terminan sin errores.

### Prueba rápida por consola

```powershell
# Sin sesión debe responder 401
Invoke-RestMethod -Uri http://localhost:3000/api/reservas

# La disponibilidad es pública
Invoke-RestMethod -Uri "http://localhost:3000/api/disponibilidad?mes=2026-11"
```

---

## 10. Solución de problemas

### «Unable to acquire lock at .next/dev/lock»

Ya hay otro `next dev` corriendo con ese proyecto. Ciérralo o mata el proceso:

```powershell
Get-Process node | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### «Port 3000 is in use»

Next.js cambiará a 3001 automáticamente, pero conviene liberar el puerto:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
```

### El login se queda en bucle

La cookie `Secure` no viaja por HTTP. En `.env.local`:

```env
AUTH_COOKIE_SECURE=false
```

Reinicia el servidor y borra las cookies del sitio en el navegador.

### «No autorizado» al sembrar el contenido

`/api/admin/seed` ahora exige sesión. Hazlo desde el panel, con sesión iniciada.

### «Could not find Chrome» / error de Puppeteer

Chromium no se descargó. Con pnpm, `puppeteer` queda dentro de `.pnpm`, así que hay que
localizarlo y ejecutar su instalador:

```powershell
$pptr = Get-ChildItem node_modules\.pnpm -Directory -Filter "puppeteer@*" | Select-Object -First 1
node "$($pptr.FullName)\node_modules\puppeteer\install.mjs"
```

Si se queda a medias (extrae solo 3-4 archivos de 308), extrae el ZIP a mano:

```powershell
$cache = "$env:USERPROFILE\.cache\puppeteer"
$zip = Get-ChildItem "$cache\chrome" -Filter "*-chrome-win64.zip" | Select-Object -First 1
$version = ($zip.Name -split '-')[0]
$dest = "$cache\chrome\win64-$version"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip.FullName, $dest, $true)
Test-Path "$dest\chrome-win64\chrome.exe"   # debe devolver True
```

### «The browser is already running for .wwebjs_auth\session»

Hay otro proceso usando la misma sesión de WhatsApp. Cierra el otro servidor o elimina
la carpeta:

```powershell
Remove-Item -Recurse -Force .wwebjs_auth
```

Tendrás que escanear el QR otra vez.

### «No se pudieron consultar las reservas. ¿Está MongoDB encendido?»

```powershell
Get-Service MongoDB | Start-Service
```

Y verifica `MONGODB_URI` en `.env.local`.

### El diagrama de `db-schema/esquema-mongodb.html` no aparece

El diagrama usa **Mermaid desde CDN**: la primera vez necesita internet. Sin conexión
se muestran igual las tarjetas y todas las tablas del esquema.

---

## 11. Comandos útiles

```bash
pnpm dev      # Desarrollo con recarga en caliente
pnpm build    # Build de producción
pnpm start    # Ejecutar el build
pnpm lint     # ESLint
```

### Base de datos

```powershell
Get-Service MongoDB              # Estado del servicio
Start-Service MongoDB            # Iniciar
Stop-Service MongoDB             # Detener
```

### Generar credenciales nuevas

```bash
# Hash de contraseña
node -e "const c=require('crypto');const s=c.randomBytes(16);console.log('scrypt:'+s.toString('hex')+':'+c.scryptSync('NUEVA_CLAVE',s,64).toString('hex'))"

# Secreto de sesión
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Al cambiar el hash o el `AUTH_SECRET`, **reinicia el servidor** y vuelve a iniciar sesión.

---

## 12. Estructura del proyecto

```
app/
  page.tsx                    Landing (Server Component: lee MongoDB)
  HomeClient.tsx              Capa cliente (Chakra + GSAP)
  admin/
    page.tsx                  Panel (protegido)
    AdminPanel.tsx            Agenda agrupada por día
    login/                    Formulario de acceso
  api/
    reservas/                 GET listado · POST crear · PATCH/DELETE por id
    disponibilidad/           Ocupación real por mes y por día
    auth/                     login · logout
    admin/seed/               Sembrado del contenido

src/lib/
  mongodb.ts                  Conexión cacheada a MongoDB
  models/                     Modelos Mongoose (8 colecciones)
  reservas.ts                 Constantes y utilidades compartidas
  reservas-json.ts            Serialización para la API
  contenido.ts                Lee la BD y la adapta a la landing
  seed.ts                     Carga data.json en las colecciones
  whatsapp.ts                 Cliente de WhatsApp Web
  codigos-pais.ts             Indicativos con bandera
  auth-*.ts                   Sesión firmada y verificación de contraseña
  rate-limit.ts               Límite de intentos de login

proxy.ts                      Protección de rutas (antiguo middleware)
instrumentation.ts            Arranca WhatsApp al iniciar el servidor

data.json                     Contenido original (seed y respaldo)
db-schema/                    Documento y diagramas del esquema
```

---

## 13. Notas de seguridad

- `.env.local` **nunca** se sube al repositorio (está en `.gitignore`).
- `.env.example` sí se versiona: **no debe contener credenciales reales**.
- Si el repositorio es público y compartiste la contraseña por chat, **cámbiala**:
  genera un hash nuevo, actualiza `ADMIN_PASSWORD_HASH`, reinicia y avisa a tu compañero
  por un canal privado.
- El panel está pensado para **uso interno**. Si se publica en internet, conviene:
  - servirlo solo por HTTPS (`AUTH_COOKIE_SECURE=true`),
  - mover el límite de intentos a un almacén compartido (Redis) si hay varias instancias,
  - considerar autenticación por roles en lugar de una sola cuenta.
