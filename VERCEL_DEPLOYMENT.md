# 🚀 Despliegue en Vercel - AppSemillero

## 📋 Prerrequisitos

1. **Cuenta de Vercel**: [vercel.com](https://vercel.com)
2. **Base de datos PostgreSQL**: Vercel Postgres o cualquier PostgreSQL
3. **Node.js 18+**: Para desarrollo local

## 🗄️ Configuración de Base de Datos

### Opción 1: Vercel Postgres (Recomendado)
1. En tu dashboard de Vercel, ve a **Storage**
2. Crea una nueva base de datos **Postgres**
3. Copia la **Connection String**

### Opción 2: Base de datos externa
- Usa cualquier proveedor de PostgreSQL (Supabase, Railway, etc.)
- Obtén la connection string

## 🔧 Variables de Entorno

En tu proyecto de Vercel, configura estas variables:

```bash
POSTGRES_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## 📦 Estructura del Proyecto

```
appsemillero/
├── api/                    # API Routes de Vercel
│   ├── activities.js
│   ├── student/[link].js
│   ├── admin/[link].js
│   └── utils/
├── client/                 # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json            # Configuración de Vercel
└── package.json
```

## 🚀 Pasos de Despliegue

### 1. Preparar el Repositorio
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd appsemillero

# Instalar dependencias
npm run install-all
```

### 2. Conectar con Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel
```

### 3. Configurar Variables de Entorno
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   - `POSTGRES_URL`: Tu connection string de PostgreSQL
   - `NODE_ENV`: `production`

### 4. Inicializar Base de Datos
Después del primer despliegue, visita:
```
https://tu-dominio.vercel.app/api/init-db
```

Esto creará las tablas necesarias.

## 🔄 Comandos de Despliegue

### Despliegue Manual
```bash
vercel --prod
```

### Despliegue Automático
- Conecta tu repositorio de GitHub con Vercel
- Cada push a `main` desplegará automáticamente

## 🧪 Pruebas Post-Despliegue

1. **Crear Actividad**:
   - Ve a tu dominio
   - Crea una actividad de prueba
   - Verifica que se generen los enlaces

2. **Probar Estudiante**:
   - Usa el enlace de estudiante
   - Completa la actividad
   - Verifica que se genere la carta

3. **Probar Administrador**:
   - Usa el enlace de administrador
   - Verifica que aparezcan los resultados

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm run install-all
vercel --prod
```

### Error de Base de Datos
- Verifica que `POSTGRES_URL` esté configurada
- Ejecuta `/api/init-db` para crear tablas

### Error de CORS
- Las rutas API ya tienen CORS configurado
- Verifica que las rutas estén en `/api/`

### Error de Canvas
- Canvas está incluido en las dependencias de la API
- Si hay problemas, verifica la versión de Node.js

## 📊 Monitoreo

### Logs de Vercel
```bash
vercel logs
```

### Dashboard de Vercel
- Ve a **Functions** para ver logs de API
- **Analytics** para métricas de uso

## 🔒 Seguridad

- Las variables de entorno están protegidas
- CORS configurado para producción
- Validación de datos en todas las rutas

## 📈 Optimizaciones

### Performance
- Build optimizado de React
- API Routes serverless
- Base de datos PostgreSQL optimizada

### Escalabilidad
- Serverless functions escalan automáticamente
- Base de datos PostgreSQL para alta disponibilidad

## 🌐 Dominio Personalizado

1. En Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

## 📱 Funcionalidades Verificadas

✅ **Creación de Actividades**
✅ **Enlaces Únicos**
✅ **Resolución de Actividades**
✅ **Calificación Automática**
✅ **Cartas Coleccionables**
✅ **Panel de Administración**
✅ **Exportación de Datos**

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté inicializada
4. Consulta la documentación de Vercel

---

**¡Tu AppSemillero está lista para producción en Vercel!** 🎉
