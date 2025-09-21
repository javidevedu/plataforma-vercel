const database = require('./database');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            // Guardar resultado de actividad
            const { activityId, studentName, answers, score, timeSpent, audioFile } = req.body;

            if (!activityId || !studentName) {
                return res.status(400).json({ 
                    error: 'ID de actividad y nombre del estudiante son requeridos' 
                });
            }

            // Verificar que la actividad existe
            const activity = database.getActivity(activityId);
            if (!activity) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            const result = database.saveResult({
                activityId,
                studentName,
                answers: answers || [],
                score: score || null,
                timeSpent: timeSpent || 0,
                audioFile: audioFile || null,
                status: activity.type === 'speaking' ? 'pending_review' : 'completed'
            });

            res.status(201).json(result);

        } else if (req.method === 'GET') {
            // Obtener resultados por actividad
            const { activityId } = req.query;
            
            if (!activityId) {
                return res.status(400).json({ 
                    error: 'ID de actividad requerido' 
                });
            }

            const results = database.getResultsByActivity(activityId);
            res.json(results);

        } else {
            res.status(405).json({ 
                error: 'Método no permitido' 
            });
        }

    } catch (error) {
        console.error('Error en API de resultados:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
