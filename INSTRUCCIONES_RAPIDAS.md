# 🚀 Instrucciones Rápidas - AppSemillero

## Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# En Windows
start.bat

# En Linux/Mac
./start.sh
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias
npm run install-all

# 2. Iniciar aplicación
npm run dev
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📝 Flujo de Uso

### Para Docentes:
1. Ve a http://localhost:3000
2. Haz clic en "Crear Actividad"
3. Completa el formulario y crea la actividad
4. Copia los enlaces generados:
   - **Enlace para estudiantes**: Compártelo con tus estudiantes
   - **Enlace para administrador**: Úsalo para ver resultados

### Para Estudiantes:
1. Usa el enlace proporcionado por el docente
2. Ingresa tu nombre
3. Resuelve la actividad
4. Recibe tu carta coleccionable

## 🔧 Solución de Problemas

### Error: "Error al enviar las respuestas"
- Verifica que el servidor esté corriendo en el puerto 5000
- Revisa la consola del navegador para más detalles
- Asegúrate de que todas las preguntas estén respondidas

### Error: "Actividad no encontrada"
- Verifica que el enlace sea correcto
- Asegúrate de que la actividad exista en la base de datos

### Error de compilación
- Ejecuta `npm run install-all` para reinstalar dependencias
- Verifica que Node.js esté instalado (versión 16+)

## 📊 Características Implementadas

✅ **4 Tipos de Actividades**:
- Quiz (Reading)
- Fill in the blanks (Writing)  
- Listening (con audio)
- Speaking (con grabación)

✅ **Sistema de Enlaces Únicos**
✅ **Calificación Automática**
✅ **Cartas Coleccionables**
✅ **Panel de Administración**
✅ **Exportación CSV/Excel**

## 🎮 Sistema de Gamificación

- **Principiante** (0-49%): 🐣
- **Intermedio** (50-69%): 📚
- **Avanzado** (70-89%): ⭐
- **Experto** (90-100%): 🏆

## 📁 Archivos Importantes

- `server/index.js` - Servidor backend
- `client/src/App.js` - Aplicación React principal
- `appsemillero.db` - Base de datos SQLite
- `uploads/` - Archivos de audio e imágenes
- `exports/` - Archivos exportados

¡Disfruta usando AppSemillero! 🎓✨
