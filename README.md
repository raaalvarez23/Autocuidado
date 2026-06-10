# AutoCuidado 🔧

App para registrar y controlar mantenciones de autos.  
Stack idéntico a StatClass: **React + Vite + Supabase + Vercel**

---

## Setup en 5 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Copia tus keys desde **Project Settings → API**

### 3. Variables de entorno
Crea un archivo `.env.local` (copia `.env.local.example`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Correr en local
```bash
npm run dev
```

### 5. Deploy en Vercel
1. Sube el proyecto a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno en Vercel → Settings → Environment Variables
4. Deploy ✓

---

## Primer uso
- El **primer usuario registrado** queda automáticamente aprobado y con rol **admin**
- Los usuarios siguientes quedan pendientes hasta que el admin los apruebe en `/admin`

## Páginas
| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/login` | Login |
| `/register` | Registro |
| `/cars` | Mis Autos |
| `/cars/new` | Agregar auto |
| `/cars/:id` | Detalle del auto |
| `/cars/:id/edit` | Editar auto |
| `/registrar` | Registrar mantención |
| `/admin` | Panel admin |
