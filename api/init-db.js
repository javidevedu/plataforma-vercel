const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
    });

    // Crear tabla de actividades
    await client.sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        correct_answers TEXT,
        audio_file TEXT,
        image_file TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        student_link TEXT UNIQUE,
        admin_link TEXT UNIQUE
      )
    `;

    // Crear tabla de respuestas de estudiantes
    await client.sql`
      CREATE TABLE IF NOT EXISTS student_responses (
        id TEXT PRIMARY KEY,
        activity_id TEXT,
        student_name TEXT NOT NULL,
        answers TEXT NOT NULL,
        score REAL,
        audio_response TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (activity_id) REFERENCES activities (id)
      )
    `;

    res.json({ message: 'Base de datos inicializada correctamente' });

  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: error.message });
  }
}
