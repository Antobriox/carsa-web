# CARSA Web

Sitio web y panel de administración para **CARSA** — llantas, baterías y servicios de taller en Portoviejo, Ecuador.

Incluye catálogo público, carrito de cotización, cuentas de cliente, área de administración y notificaciones internas para nuevos pedidos.

📖 **Manual de usuario (clientes y administradores):** [MANUAL-USUARIO.md](./MANUAL-USUARIO.md)

---

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, Tailwind CSS 4, Base UI / shadcn |
| Animaciones | Motion |
| Datos y autenticación | [Supabase](https://supabase.com) |
| Formularios | React Hook Form + Zod |
| Carrito | Zustand |
| Notificaciones push (opcional) | Web Push + `web-push` |

---

## Funcionalidades

### Sitio público

- Catálogo en inicio con llantas, baterías y servicios
- Páginas `/llantas` y `/baterias` con filtros
- Búsqueda en el catálogo principal
- Detalle de producto (modal), carrito y envío de pedido
- Registro, inicio de sesión, recuperación de contraseña
- Área **Mi cuenta** para el cliente
- Botón flotante de WhatsApp
- Pop-ups de promociones activas
- Horario de atención y contacto

### Panel administrador (`/admin`)

- Dashboard (inventario, pedidos pendientes, ventas e ingresos)
- Gestión de llantas, baterías, servicios y marcas
- Pedidos en línea (ver detalle, cambiar estado)
- Registro de ventas desde pedidos confirmados
- Promociones con imagen y popup en la web
- Campana de notificaciones en tiempo real
- Suscripción a notificaciones push en el navegador (opcional)
- **Visitas al sitio** en el dashboard (visitantes únicos y clientes registrados; ver `scripts/site-visits.sql`)

### Seguridad

- Sesión con middleware en rutas protegidas
- Roles `admin` y `customer` en perfiles de usuario
- Variables sensibles solo en el servidor (`.env.local`)

---

## Requisitos

- **Node.js** 20 o superior
- **npm** (o pnpm / yarn)
- Proyecto Supabase con Auth, base de datos, Storage y políticas configuradas

---

## Instalación rápida

```bash
git clone <url-del-repositorio>
cd carsa-web
npm install
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales y arranca:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública (publishable / anon) |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Sí | Teléfono con código de país, solo dígitos |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push | Clave pública VAPID |
| `VAPID_PRIVATE_KEY` | Push | Clave privada VAPID (solo servidor) |
| `VAPID_SUBJECT` | Push | Ej. `mailto:admin@carsa.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | Push en servidor | Envío push y lectura de suscripciones |
| `NEXT_PUBLIC_SITE_URL` | Producción | URL pública del sitio |

**Importante:** no subas `.env.local` a Git. Tras cambiar variables `NEXT_PUBLIC_*`, reinicia `npm run dev` o vuelve a desplegar.

### Generar claves VAPID

```bash
npx web-push generate-vapid-keys
```

Copia **ambas** claves completas en `.env.local`. La pública suele tener ~87 caracteres. Reinicia el servidor de desarrollo después.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

---

## Estructura del proyecto

```
carsa-web/
├── middleware.ts           # Sesión y protección de rutas
├── public/
│   └── sw.js               # Service Worker (push)
├── src/
│   ├── app/                # Rutas (público, admin, API)
│   ├── components/         # UI, admin, auth, catálogo
│   ├── lib/                # Supabase, auth, push, utilidades
│   ├── hooks/
│   ├── stores/             # Carrito
│   └── types/
├── README.md               # Este archivo (técnico)
├── MANUAL-USUARIO.md       # Guía para clientes y staff
└── .env.example
```

---

## Rutas principales

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Catálogo general |
| `/llantas`, `/baterias` | Público | Catálogos por categoría |
| `/carrito` | Cliente | Carrito y pedido |
| `/cuenta` | Cliente | Perfil |
| `/iniciar-sesion`, `/registro` | Público | Autenticación |
| `/admin` | Admin | Panel de control |

---

## Despliegue (Vercel u otro hosting Next.js)

1. Conecta el repositorio y configura las mismas variables que en `.env.local`.
2. En Supabase → **Authentication** → **URL Configuration**, añade la URL de producción y  
   `https://tu-dominio.com/auth/callback`.
3. Ejecuta `npm run build` localmente antes del primer deploy para validar la compilación.

---

## Notas de desarrollo

- El card **“Alineación y balanceo”** puede generarse en frontend al fusionar dos servicios; el precio mostrado es la suma de ambos si están separados en catálogo.
- Convenciones Next.js del proyecto: ver `AGENTS.md`.

---

## Licencia

Proyecto privado — uso exclusivo de CARSA.
