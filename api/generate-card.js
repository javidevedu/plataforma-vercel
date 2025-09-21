const { createCanvas, loadImage } = require('canvas');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { studentName, activityTitle, activityType, score, date } = req.body;

        if (!studentName || !activityTitle || !activityType) {
            return res.status(400).json({ 
                error: 'Datos requeridos: studentName, activityTitle, activityType' 
            });
        }

        // Crear canvas para la carta
        const canvas = createCanvas(400, 600);
        const ctx = canvas.getContext('2d');

        // Configurar gradiente de fondo
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 600);

        // Dibujar borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 396, 596);

        // Configurar fuentes
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        // Título de la carta
        ctx.font = 'bold 24px Arial';
        ctx.fillText('CARTA COleccionable', 200, 50);

        // Personaje según el tipo de actividad
        const characters = {
            'quiz': '📚',
            'fill-blanks': '✍️',
            'listening': '🎧',
            'speaking': '🎤'
        };
        const character = characters[activityType] || '🎓';

        ctx.font = '80px Arial';
        ctx.fillText(character, 200, 150);

        // Nombre de la habilidad
        const skillNames = {
            'quiz': 'Reading Master',
            'fill-blanks': 'Writing Expert',
            'listening': 'Audio Detective',
            'speaking': 'Voice Champion'
        };
        const skillName = skillNames[activityType] || 'Learning Hero';

        ctx.font = 'bold 20px Arial';
        ctx.fillText(skillName, 200, 200);

        // Información del estudiante
        ctx.font = '16px Arial';
        ctx.fillText(`Estudiante: ${studentName}`, 200, 250);
        ctx.fillText(`Actividad: ${activityTitle}`, 200, 280);

        // Puntuación o estado
        if (score !== null && score !== undefined) {
            ctx.fillText(`Puntuación: ${score}%`, 200, 310);
        } else {
            ctx.fillText(`Estado: Pendiente`, 200, 310);
        }

        // Fecha
        const cardDate = date || new Date().toLocaleDateString();
        ctx.fillText(`Fecha: ${cardDate}`, 200, 340);

        // Decoración adicional
        ctx.font = '14px Arial';
        ctx.fillText('¡Excelente trabajo!', 200, 380);

        // Código QR simulado (placeholder)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(150, 420, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('QR Code', 200, 470);

        // Información adicional
        ctx.font = '12px Arial';
        ctx.fillText('Plataforma de Aprendizaje Gamificado', 200, 550);

        // Convertir canvas a buffer
        const buffer = canvas.toBuffer('image/png');

        // Configurar headers para la imagen
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="carta_${studentName}_${activityTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Enviar la imagen
        res.send(buffer);

    } catch (error) {
        console.error('Error generating card:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al generar la carta' 
        });
    }
};
