const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const jsPDF = require('jspdf');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Inicializar base de datos SQLite
const db = new sqlite3.Database('appsemillero.db');

// Crear tablas
db.serialize(() => {
  // Tabla de actividades
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    correct_answers TEXT,
    audio_file TEXT,
    image_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    student_link TEXT UNIQUE,
    admin_link TEXT UNIQUE
  )`);

  // Tabla de respuestas de estudiantes
  db.run(`CREATE TABLE IF NOT EXISTS student_responses (
    id TEXT PRIMARY KEY,
    activity_id TEXT,
    student_name TEXT NOT NULL,
    answers TEXT NOT NULL,
    score REAL,
    audio_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities (id)
  )`);
});

// Rutas de la API

// Crear nueva actividad
app.post('/api/activities', (req, res) => {
  const { title, type, content, correctAnswers } = req.body;
  const activityId = uuidv4();
  const studentLink = uuidv4();
  const adminLink = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO activities (id, title, type, content, correct_answers, student_link, admin_link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([activityId, title, type, JSON.stringify(content), JSON.stringify(correctAnswers), studentLink, adminLink], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      id: activityId,
      studentLink: studentLink,
      adminLink: adminLink,
      message: 'Actividad creada exitosamente'
    });
  });

  stmt.finalize();
});

// Subir archivo de audio para actividad de listening
app.post('/api/activities/:id/audio', upload.single('audio'), (req, res) => {
  const activityId = req.params.id;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: 'No se subió ningún archivo de audio' });
  }

  db.run(
    'UPDATE activities SET audio_file = ? WHERE id = ?',
    [audioFile.filename, activityId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Audio subido exitosamente', filename: audioFile.filename });
    }
  );
});

// Subir imagen para actividad de speaking
app.post('/api/activities/:id/image', upload.single('image'), (req, res) => {
  const activityId = req.params.id;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  db.run(
    'UPDATE activities SET image_file = ? WHERE id = ?',
    [imageFile.filename, activityId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Imagen subida exitosamente', filename: imageFile.filename });
    }
  );
});

// Obtener actividad por enlace de estudiante
app.get('/api/student/:link', (req, res) => {
  const studentLink = req.params.link;

  db.get(
    'SELECT * FROM activities WHERE student_link = ?',
    [studentLink],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      const activity = {
        id: row.id,
        title: row.title,
        type: row.type,
        content: JSON.parse(row.content),
        correctAnswers: JSON.parse(row.correct_answers),
        audioFile: row.audio_file,
        imageFile: row.image_file
      };

      res.json(activity);
    }
  );
});

// Obtener actividad por enlace de administrador
app.get('/api/admin/:link', (req, res) => {
  const adminLink = req.params.link;

  db.get(
    'SELECT * FROM activities WHERE admin_link = ?',
    [adminLink],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      const activity = {
        id: row.id,
        title: row.title,
        type: row.type,
        content: JSON.parse(row.content),
        correctAnswers: JSON.parse(row.correct_answers),
        audioFile: row.audio_file,
        imageFile: row.image_file
      };

      res.json(activity);
    }
  );
});

// Enviar respuestas del estudiante
app.post('/api/student/:link/submit', upload.single('audio'), (req, res) => {
  const studentLink = req.params.link;
  const { studentName, answers } = req.body;
  const audioFile = req.file;

  console.log('Recibiendo envío:', { studentLink, studentName, answers, audioFile });

  // Validar datos requeridos
  if (!studentName || !answers) {
    return res.status(400).json({ error: 'Nombre del estudiante y respuestas son requeridos' });
  }

  // Obtener la actividad
  db.get(
    'SELECT * FROM activities WHERE student_link = ?',
    [studentLink],
    (err, activity) => {
      if (err) {
        console.error('Error en base de datos:', err);
        return res.status(500).json({ error: err.message });
      }
      if (!activity) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      let parsedAnswers, correctAnswers;
      try {
        parsedAnswers = JSON.parse(answers);
        correctAnswers = JSON.parse(activity.correct_answers);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        return res.status(400).json({ error: 'Error en el formato de las respuestas' });
      }

      let score = 0;

      console.log('Respuestas recibidas:', parsedAnswers);
      console.log('Respuestas correctas:', correctAnswers);

      // Calcular puntuación para tipos que se califican automáticamente
      if (activity.type !== 'speaking') {
        if (activity.type === 'quiz') {
          Object.keys(parsedAnswers).forEach((questionIndex) => {
            const answer = parsedAnswers[questionIndex];
            const correctAnswer = correctAnswers[parseInt(questionIndex)];
            if (answer === correctAnswer) {
              score += 1;
            }
          });
        } else if (activity.type === 'fill_blanks') {
          Object.keys(parsedAnswers).forEach((questionIndex) => {
            const questionAnswers = parsedAnswers[questionIndex];
            const correctAnswersForQuestion = correctAnswers[parseInt(questionIndex)].split(',');
            
            Object.keys(questionAnswers).forEach((blankIndex) => {
              const answer = questionAnswers[blankIndex];
              const correctAnswer = correctAnswersForQuestion[parseInt(blankIndex)];
              if (answer && correctAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                score += 1;
              }
            });
          });
        } else if (activity.type === 'listening') {
          Object.keys(parsedAnswers).forEach((questionIndex) => {
            const answer = parsedAnswers[questionIndex];
            const correctAnswer = correctAnswers[parseInt(questionIndex)];
            if (answer === correctAnswer) {
              score += 1;
            }
          });
        }
        
        // Calcular el total de preguntas para el porcentaje
        const totalQuestions = activity.content ? JSON.parse(activity.content).length : 1;
        score = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
      }

      // Guardar respuesta
      const responseId = uuidv4();
      const stmt = db.prepare(`
        INSERT INTO student_responses (id, activity_id, student_name, answers, score, audio_response)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run([responseId, activity.id, studentName, answers, score, audioFile ? audioFile.filename : null], function(err) {
        if (err) {
          console.error('Error guardando respuesta:', err);
          return res.status(500).json({ error: err.message });
        }

        // Generar carta coleccionable
        try {
          generateTradingCard(activity, studentName, score, (cardData) => {
            res.json({
              message: 'Respuestas enviadas exitosamente',
              score: score,
              cardData: cardData
            });
          });
        } catch (cardError) {
          console.error('Error generando carta:', cardError);
          // Enviar respuesta sin carta si hay error
          res.json({
            message: 'Respuestas enviadas exitosamente',
            score: score,
            cardData: null,
            warning: 'No se pudo generar la carta coleccionable'
          });
        }
      });

      stmt.finalize();
    }
  );
});

// Obtener resultados para administrador
app.get('/api/admin/:link/results', (req, res) => {
  const adminLink = req.params.link;

  db.get(
    'SELECT id FROM activities WHERE admin_link = ?',
    [adminLink],
    (err, activity) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!activity) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      db.all(
        'SELECT * FROM student_responses WHERE activity_id = ? ORDER BY created_at DESC',
        [activity.id],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const results = rows.map(row => ({
            id: row.id,
            studentName: row.student_name,
            answers: JSON.parse(row.answers),
            score: row.score,
            audioResponse: row.audio_response,
            createdAt: row.created_at
          }));

          res.json(results);
        }
      );
    }
  );
});

// Exportar resultados a CSV
app.get('/api/admin/:link/export/csv', (req, res) => {
  const adminLink = req.params.link;

  db.get(
    'SELECT id, title FROM activities WHERE admin_link = ?',
    [adminLink],
    (err, activity) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!activity) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      db.all(
        'SELECT * FROM student_responses WHERE activity_id = ? ORDER BY created_at DESC',
        [activity.id],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const csvData = rows.map(row => ({
            'Nombre del Estudiante': row.student_name,
            'Puntuación': row.score,
            'Respuestas': row.answers,
            'Audio de Respuesta': row.audio_response || 'N/A',
            'Fecha': row.created_at
          }));

          const csvWriter = createCsvWriter({
            path: `exports/${activity.title}_results.csv`,
            header: [
              { id: 'Nombre del Estudiante', title: 'Nombre del Estudiante' },
              { id: 'Puntuación', title: 'Puntuación' },
              { id: 'Respuestas', title: 'Respuestas' },
              { id: 'Audio de Respuesta', title: 'Audio de Respuesta' },
              { id: 'Fecha', title: 'Fecha' }
            ]
          });

          if (!fs.existsSync('exports')) {
            fs.mkdirSync('exports', { recursive: true });
          }

          csvWriter.writeRecords(csvData)
            .then(() => {
              res.download(`exports/${activity.title}_results.csv`);
            })
            .catch(err => {
              res.status(500).json({ error: err.message });
            });
        }
      );
    }
  );
});

// Exportar resultados a Excel
app.get('/api/admin/:link/export/excel', (req, res) => {
  const adminLink = req.params.link;

  db.get(
    'SELECT id, title FROM activities WHERE admin_link = ?',
    [adminLink],
    (err, activity) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!activity) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      db.all(
        'SELECT * FROM student_responses WHERE activity_id = ? ORDER BY created_at DESC',
        [activity.id],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const excelData = rows.map(row => ({
            'Nombre del Estudiante': row.student_name,
            'Puntuación': row.score,
            'Respuestas': row.answers,
            'Audio de Respuesta': row.audio_response || 'N/A',
            'Fecha': row.created_at
          }));

          const worksheet = XLSX.utils.json_to_sheet(excelData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

          if (!fs.existsSync('exports')) {
            fs.mkdirSync('exports', { recursive: true });
          }

          const filename = `exports/${activity.title}_results.xlsx`;
          XLSX.writeFile(workbook, filename);

          res.download(filename);
        }
      );
    }
  );
});

// Función para generar carta coleccionable
function generateTradingCard(activity, studentName, score, callback) {
  const canvas = createCanvas(400, 600);
  const ctx = canvas.getContext('2d');

  // Fondo de la carta
  const gradient = ctx.createLinearGradient(0, 0, 400, 600);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 600);

  // Borde dorado
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 392, 592);

  // Título
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(activity.title, 200, 50);

  // Nombre del estudiante
  ctx.font = '18px Arial';
  ctx.fillText(studentName, 200, 100);

  // Tipo de actividad
  ctx.font = '16px Arial';
  ctx.fillText(`Tipo: ${activity.type}`, 200, 130);

  // Puntuación
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Puntuación: ${score.toFixed(1)}%`, 200, 180);

  // Nivel de desempeño
  let level = 'Principiante';
  let character = '🐣';
  if (score >= 90) {
    level = 'Experto';
    character = '🏆';
  } else if (score >= 70) {
    level = 'Avanzado';
    character = '⭐';
  } else if (score >= 50) {
    level = 'Intermedio';
    character = '📚';
  }

  ctx.font = '18px Arial';
  ctx.fillText(`Nivel: ${level}`, 200, 220);
  ctx.font = '48px Arial';
  ctx.fillText(character, 200, 280);

  // Habilidad reforzada
  const skills = {
    'quiz': 'Comprensión Lectora',
    'fill_blanks': 'Escritura',
    'listening': 'Comprensión Auditiva',
    'speaking': 'Expresión Oral'
  };

  ctx.font = '16px Arial';
  ctx.fillText(`Habilidad: ${skills[activity.type]}`, 200, 350);

  // Fecha
  ctx.font = '14px Arial';
  ctx.fillText(new Date().toLocaleDateString(), 200, 400);

  // Convertir a base64
  const cardData = canvas.toDataURL('image/png');
  callback(cardData);
}

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
