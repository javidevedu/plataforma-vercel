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

      // Obtener la actividad
      const { rows: activityRows } = await client.sql`
        SELECT id FROM activities WHERE admin_link = ${link}
      `;

      if (activityRows.length === 0) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      const activityId = activityRows[0].id;

      // Obtener resultados
      const { rows } = await client.sql`
        SELECT * FROM student_responses WHERE activity_id = ${activityId} ORDER BY created_at DESC
      `;

      const results = rows.map(row => ({
        id: row.id,
        studentName: row.student_name,
        answers: JSON.parse(row.answers),
        score: row.score,
        audioResponse: row.audio_response,
        createdAt: row.created_at
      }));

      res.json(results);

    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
