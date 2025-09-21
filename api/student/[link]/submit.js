const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@vercel/postgres');
const { generateTradingCard } = require('../../utils/cardGenerator');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { link } = req.query;
    const { studentName, answers } = req.body;

    if (!studentName || !answers) {
      return res.status(400).json({ error: 'Nombre del estudiante y respuestas son requeridos' });
    }

    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
    });

    // Obtener la actividad
    const { rows: activityRows } = await client.sql`
      SELECT * FROM activities WHERE student_link = ${link}
    `;

    if (activityRows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    const activity = activityRows[0];
    const parsedAnswers = JSON.parse(answers);
    const correctAnswers = JSON.parse(activity.correct_answers);
    let score = 0;

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
    await client.sql`
      INSERT INTO student_responses (id, activity_id, student_name, answers, score, audio_response, created_at)
      VALUES (${responseId}, ${activity.id}, ${studentName}, ${answers}, ${score}, ${null}, NOW())
    `;

    // Generar carta coleccionable
    try {
      const cardData = await generateTradingCard(activity, studentName, score);
      res.json({
        message: 'Respuestas enviadas exitosamente',
        score: score,
        cardData: cardData
      });
    } catch (cardError) {
      console.error('Error generando carta:', cardError);
      res.json({
        message: 'Respuestas enviadas exitosamente',
        score: score,
        cardData: null,
        warning: 'No se pudo generar la carta coleccionable'
      });
    }

  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: error.message });
  }
}
