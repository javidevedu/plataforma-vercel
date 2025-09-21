# AppSemillero - Plataforma de Aprendizaje Gamificado

Una plataforma web completa para crear actividades educativas gamificadas con sistema de recompensas coleccionables.

## 🚀 Características Principales

### Tipos de Actividades
- **Quiz (Reading)**: Preguntas de selección múltiple para comprensión lectora
- **Fill in the blanks (Writing)**: Completar espacios en blanco para práctica de escritura
- **Listening**: Actividades de comprensión auditiva con archivos de audio
- **Speaking**: Práctica de expresión oral con grabación de voz

### Sistema de Enlaces Únicos
- Cada actividad genera automáticamente dos enlaces únicos:
  - Enlace para estudiantes
  - Enlace para administrador/docente

### Calificación Automática
- Quiz, Fill blanks y Listening se califican automáticamente
- Speaking queda pendiente para revisión manual

### Cartas Coleccionables
- Sistema de recompensas tipo trading card
- Cartas personalizadas con:
  - Nombre del estudiante
  - Nombre de la actividad
  - Personaje asociado a la habilidad
  - Nivel de desempeño
- Descarga en formato PNG o PDF

### Panel de Administración
- Visualización de resultados en tiempo real
- Exportación a CSV y Excel
- Reproducción de audios de Speaking
- Estadísticas detalladas

## 🛠️ Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd appsemillero
   ```

2. **Instalar dependencias**
   ```bash
   npm run install-all
   ```

3. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

   Esto iniciará tanto el servidor backend (puerto 5000) como el frontend (puerto 3000).

4. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Uso de la Plataforma

### Para Docentes

1. **Crear Actividad**
   - Ve a "Crear Actividad" desde la página principal
   - Selecciona el tipo de actividad
   - Completa el título y contenido
   - Para Listening: sube un archivo de audio
   - Para Speaking: opcionalmente sube una imagen de apoyo
   - Haz clic en "Crear Actividad"

2. **Obtener Enlaces**
   - Copia el enlace para estudiantes y compártelo
   - Usa el enlace de administrador para ver resultados

3. **Monitorear Resultados**
   - Accede al enlace de administrador
   - Ve resultados en tiempo real
   - Escucha audios de Speaking
   - Exporta datos a CSV o Excel

### Para Estudiantes

1. **Acceder a la Actividad**
   - Usa el enlace proporcionado por el docente
   - Ingresa tu nombre

2. **Resolver la Actividad**
   - **Quiz**: Selecciona la respuesta correcta
   - **Fill blanks**: Completa los espacios en blanco
   - **Listening**: Escucha el audio y responde
   - **Speaking**: Graba tu respuesta de voz

3. **Recibir Recompensa**
   - Recibe tu carta coleccionable
   - Descárgala en PNG o PDF
   - ¡Agrégala a tu colección!

## 🏗️ Arquitectura Técnica

### Backend (Node.js + Express)
- **Base de datos**: SQLite
- **API REST**: Endpoints para actividades, respuestas y resultados
- **Subida de archivos**: Multer para audio e imágenes
- **Generación de cartas**: Canvas para crear cartas coleccionables
- **Exportación**: CSV y Excel

### Frontend (React)
- **Routing**: React Router para navegación
- **Componentes**: Modulares y reutilizables
- **Grabación de audio**: react-audio-voice-recorder
- **Reproducción de audio**: react-audio-player
- **Estilos**: CSS moderno con gradientes y animaciones

### Base de Datos
- **Actividades**: Almacena contenido, enlaces y metadatos
- **Respuestas**: Guarda respuestas de estudiantes y puntuaciones
- **Archivos**: Referencias a archivos de audio e imágenes

## 🎮 Sistema de Gamificación

### Niveles de Desempeño
- **Principiante** (0-49%): 🐣
- **Intermedio** (50-69%): 📚
- **Avanzado** (70-89%): ⭐
- **Experto** (90-100%): 🏆

### Habilidades Desarrolladas
- **Quiz**: Comprensión Lectora
- **Fill blanks**: Escritura
- **Listening**: Comprensión Auditiva
- **Speaking**: Expresión Oral

## 📁 Estructura del Proyecto

```
appsemillero/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor principal
│   └── package.json
├── uploads/               # Archivos subidos
├── exports/              # Archivos exportados
├── appsemillero.db       # Base de datos SQLite
└── package.json          # Configuración principal
```

## 🔧 Scripts Disponibles

- `npm run dev`: Ejecuta frontend y backend en modo desarrollo
- `npm run server`: Solo backend
- `npm run client`: Solo frontend
- `npm run install-all`: Instala todas las dependencias
- `npm run build`: Construye el frontend para producción

## 🌟 Características Avanzadas

### Seguridad
- Enlaces únicos para cada actividad
- Validación de datos en frontend y backend
- Manejo seguro de archivos subidos

### Escalabilidad
- Base de datos SQLite para desarrollo
- Fácil migración a PostgreSQL o MySQL
- API REST bien estructurada

### Experiencia de Usuario
- Interfaz moderna y responsiva
- Feedback visual inmediato
- Animaciones suaves y transiciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**AppSemillero** - Transformando la educación a través de la gamificación 🎓✨
