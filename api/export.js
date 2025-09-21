const database = require('./database');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const { activityId, format = 'csv' } = req.query;
            
            if (!activityId) {
                return res.status(400).json({ 
                    error: 'ID de actividad requerido' 
                });
            }

            const activity = database.getActivity(activityId);
            if (!activity) {
                return res.status(404).json({ 
                    error: 'Actividad no encontrada' 
                });
            }

            if (format === 'csv') {
                const csvContent = database.exportToCSV(activityId);
                
                if (!csvContent) {
                    return res.status(404).json({ 
                        error: 'No hay resultados para exportar' 
                    });
                }

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="resultados_${activity.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
                res.send(csvContent);

            } else if (format === 'json') {
                const results = database.getResultsByActivity(activityId);
                res.json({
                    activity,
                    results,
                    exportedAt: new Date().toISOString()
                });

            } else {
                res.status(400).json({ 
                    error: 'Formato no soportado. Use csv o json' 
                });
            }

        } else {
            res.status(405).json({ 
                error: 'Método no permitido' 
            });
        }

    } catch (error) {
        console.error('Error en API de exportación:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
