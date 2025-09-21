const database = require('../database');

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
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ 
                error: 'ID de actividad requerido' 
            });
        }

        if (req.method === 'GET') {
            // Obtener actividad por ID
            const activity = database.getActivity(id);
            
            if (!activity) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            res.json(activity);

        } else if (req.method === 'PUT') {
            // Actualizar actividad (configurar preguntas, etc.)
            const activity = database.getActivity(id);
            
            if (!activity) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            const updates = req.body;
            
            // Actualizar la actividad
            Object.assign(activity, updates);
            activity.updatedAt = new Date().toISOString();
            
            // Si se están configurando preguntas, marcar como activa
            if (updates.questions && updates.questions.length > 0) {
                activity.status = 'active';
            }

            database.saveData();
            res.json(activity);

        } else if (req.method === 'DELETE') {
            // Eliminar actividad
            const activityIndex = database.activities.findIndex(a => a.id === id);
            
            if (activityIndex === -1) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            database.activities.splice(activityIndex, 1);
            database.saveData();
            
            res.json({ message: 'Actividad eliminada exitosamente' });

        } else {
            res.status(405).json({ 
                error: 'Método no permitido' 
            });
        }

    } catch (error) {
        console.error('Error en API de actividad individual:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
