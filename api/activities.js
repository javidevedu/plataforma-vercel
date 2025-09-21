const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@vercel/postgres');

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
    const { title, type, content, correctAnswers } = req.body;
    const activityId = uuidv4();
    const studentLink = uuidv4();
    const adminLink = uuidv4();

    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.sql`
      INSERT INTO activities (id, title, type, content, correct_answers, student_link, admin_link, created_at)
      VALUES (${activityId}, ${title}, ${type}, ${JSON.stringify(content)}, ${JSON.stringify(correctAnswers)}, ${studentLink}, ${adminLink}, NOW())
    `;

    res.json({
      id: activityId,
      studentLink: studentLink,
      adminLink: adminLink,
      message: 'Actividad creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: error.message });
  }
}
