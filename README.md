# Plataforma de Aprendizaje Gamificado

Una plataforma web completa para crear actividades de aprendizaje interactivas y gamificadas, diseñada para educadores y estudiantes.

## 🚀 Características

### Para Docentes
- **Creación de Actividades**: 4 tipos de actividades diferentes
  - 📚 **Quiz (Reading)**: Preguntas de opción múltiple con calificación automática
  - ✍️ **Fill in the Blanks (Writing)**: Texto con espacios en blanco para completar
  - 🎧 **Listening**: Actividades de comprensión auditiva con archivos de audio
  - 🎤 **Speaking**: Grabación de voz con diferentes tipos de prompts

- **Gestión de Resultados**: Panel de administración completo
  - Ver calificaciones y resultados de estudiantes
  - Revisar grabaciones de audio (Speaking)
  - Exportar datos a CSV/Excel
  - Filtros y búsqueda avanzada

- **Enlaces Únicos**: Generación automática de enlaces para estudiantes y administración

### Para Estudiantes
- **Interfaz Intuitiva**: Diseño moderno y responsive
- **Actividades Interactivas**: Diferentes tipos de ejercicios adaptados a cada habilidad
- **Cartas Coleccionables**: Sistema de recompensas digitales
  - Cartas personalizadas por actividad completada
  - Diferentes personajes según el tipo de habilidad
  - Descarga de cartas como imágenes PNG
  - Colección personal de logros

### Características Técnicas
- **Frontend**: HTML5, CSS3, JavaScript puro
- **Backend**: API Routes de Vercel con Node.js
- **Base de Datos**: Archivos JSON en memoria (preparado para migración a Supabase/SQLite)
- **Hosting**: Optimizado para Vercel (plan gratuito)
- **Responsive**: Compatible con dispositivos móviles y desktop

## 📁 Estructura del Proyecto

```
├── api/                          # API Routes de Vercel
│   ├── activities.js             # CRUD de actividades
│   ├── activities/[id].js        # Operaciones específicas por actividad
│   ├── results.js                # Gestión de resultados
│   ├── export.js                 # Exportación de datos
│   ├── upload-audio.js           # Subida de archivos de audio
│   ├── upload-image.js           # Subida de imágenes
│   ├── generate-card.js          # Generación de cartas coleccionables
│   ├── database.js               # Base de datos JSON
│   └── uploads/                  # Archivos subidos
│       ├── audio/[filename].js   # Servir archivos de audio
│       └── images/[filename].js  # Servir imágenes
├── public/                       # Frontend estático
│   ├── index.html                # Página principal (docente)
│   ├── styles.css                # Estilos principales
│   ├── script.js                 # JavaScript principal
│   ├── actividad/[id].html       # Vista de estudiantes
│   ├── student-styles.css        # Estilos para estudiantes
│   ├── student-script.js         # JavaScript para estudiantes
│   ├── admin/[id].html           # Vista de administración
│   ├── admin-styles.css          # Estilos para administración
│   ├── admin-script.js           # JavaScript para administración
│   ├── configure-quiz.html       # Configuración de quizzes
│   ├── configure-quiz-script.js  # JavaScript para quizzes
│   ├── configure-fill-blanks.html # Configuración de fill blanks
│   ├── configure-fill-blanks-script.js # JavaScript para fill blanks
│   ├── configure-listening.html  # Configuración de listening
│   ├── configure-listening-script.js # JavaScript para listening
│   ├── configure-speaking.html   # Configuración de speaking
│   ├── configure-speaking-script.js # JavaScript para speaking
│   ├── configure-styles.css      # Estilos para configuración
│   ├── collectible-cards.html    # Página de cartas coleccionables
│   ├── cards-styles.css          # Estilos para cartas
│   └── cards-script.js           # JavaScript para cartas
├── vercel.json                   # Configuración de Vercel
└── package.json                  # Dependencias del proyecto
```

## 🛠️ Instalación y Despliegue

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd gamified-learning-platform
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Desplegar en Vercel

#### Opción A: Desde la CLI de Vercel
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Iniciar sesión en Vercel
vercel login

# Desplegar el proyecto
vercel

# Para producción
vercel --prod
```

#### Opción B: Desde el Dashboard de Vercel
1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente la configuración
3. El despliegue se realizará automáticamente

### 4. Configuración de Variables de Entorno
No se requieren variables de entorno adicionales para el funcionamiento básico.

## 🎯 Uso de la Plataforma

### Para Docentes

1. **Crear Actividad**
   - Accede a la página principal
   - Completa el formulario de creación
   - Selecciona el tipo de actividad
   - Configura los detalles específicos

2. **Configurar Actividad**
   - Para Quiz: Agrega preguntas y opciones
   - Para Fill in the Blanks: Escribe el texto y marca los espacios
   - Para Listening: Sube archivo de audio y crea preguntas
   - Para Speaking: Configura prompt (texto/imagen/audio) y criterios

3. **Gestionar Resultados**
   - Usa el enlace de administración
   - Revisa calificaciones y respuestas
   - Para Speaking: Escucha grabaciones y asigna calificaciones
   - Exporta datos cuando necesites

### Para Estudiantes

1. **Acceder a Actividad**
   - Usa el enlace de estudiante proporcionado por el docente
   - Ingresa tu nombre
   - Completa la actividad

2. **Ver Cartas Coleccionables**
   - Visita `/collectible-cards.html`
   - Ingresa tu nombre para ver tu colección
   - Descarga o comparte tus cartas

## 🔧 Desarrollo Local

### Ejecutar en Modo Desarrollo
```bash
npm run dev
```

### Estructura de la Base de Datos

#### Actividades
```json
{
  "id": "string",
  "title": "string",
  "type": "quiz|fill-blanks|listening|speaking",
  "description": "string",
  "timeLimit": "number",
  "questions": "array",
  "text": "string (fill-blanks)",
  "blanks": "array (fill-blanks)",
  "audioFile": "string (listening/speaking)",
  "imageFile": "string (speaking)",
  "status": "draft|active",
  "studentLink": "string",
  "adminLink": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Resultados
```json
{
  "id": "string",
  "activityId": "string",
  "studentName": "string",
  "answers": "object",
  "score": "number|null",
  "timeSpent": "number",
  "audioFile": "string|null",
  "status": "completed|pending_review",
  "submittedAt": "string"
}
```

## 🎨 Personalización

### Temas y Colores
Los colores principales se definen en las variables CSS en `styles.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #f59e0b;
  --success-color: #10b981;
  /* ... más variables */
}
```

### Personajes de Cartas
Los personajes se definen en el JavaScript de las cartas:
```javascript
const characters = {
  'quiz': '📚',
  'fill-blanks': '✍️',
  'listening': '🎧',
  'speaking': '🎤'
};
```

## 📱 Compatibilidad

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositivos**: Desktop, tablet, móvil
- **Funcionalidades**: Grabación de audio, subida de archivos, generación de imágenes

## 🚀 Próximas Mejoras

- [ ] Integración con Supabase para base de datos persistente
- [ ] Sistema de autenticación de usuarios
- [ ] Más tipos de actividades (drag & drop, matching, etc.)
- [ ] Análisis avanzado de resultados
- [ ] Notificaciones en tiempo real
- [ ] Modo offline para estudiantes
- [ ] Integración con LMS existentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ para educadores y estudiantes**
