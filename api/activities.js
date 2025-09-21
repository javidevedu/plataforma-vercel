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
            // Crear nueva actividad
            const { title, type, description, timeLimit } = req.body;

            if (!title || !type) {
                return res.status(400).json({ 
                    error: 'Título y tipo son requeridos' 
                });
            }

            const validTypes = ['quiz', 'fill-blanks', 'listening', 'speaking'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ 
                    error: 'Tipo de actividad no válido' 
                });
            }

            const activity = database.createActivity({
                title,
                type,
                description: description || '',
                timeLimit: timeLimit || 30,
                questions: [], // Se llenará cuando se configure la actividad
                status: 'draft' // Borrador hasta que se configure completamente
            });

            res.status(201).json(activity);

        } else if (req.method === 'GET') {
            // Obtener actividad por ID
            const { id } = req.query;
            
            if (!id) {
                return res.status(400).json({ 
                    error: 'ID de actividad requerido' 
                });
            }

            const activity = database.getActivity(id);
            
            if (!activity) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            res.json(activity);

        } else {
            res.status(405).json({ 
                error: 'Método no permitido' 
            });
        }

    } catch (error) {
        console.error('Error en API de actividades:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
