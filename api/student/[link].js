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

  const { link } = req.query;

  if (req.method === 'GET') {
    try {
      const client = createClient({
        connectionString: process.env.POSTGRES_URL,
      });

      const { rows } = await client.sql`
        SELECT * FROM activities WHERE student_link = ${link}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      const activity = rows[0];
      const result = {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        content: JSON.parse(activity.content),
        correctAnswers: JSON.parse(activity.correct_answers),
        audioFile: activity.audio_file,
        imageFile: activity.image_file
      };

      res.json(result);

    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
