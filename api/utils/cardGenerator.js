const { createCanvas, loadImage } = require('canvas');

export async function generateTradingCard(activity, studentName, score) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createCanvas(400, 600);
      const ctx = canvas.getContext('2d');

      // Fondo de la carta
      const gradient = ctx.createLinearGradient(0, 0, 400, 600);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      // Borde dorado
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 392, 592);

      // Título
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(activity.title, 200, 50);

      // Nombre del estudiante
      ctx.font = '18px Arial';
      ctx.fillText(studentName, 200, 100);

      // Tipo de actividad
      ctx.font = '16px Arial';
      ctx.fillText(`Tipo: ${activity.type}`, 200, 130);

      // Puntuación
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`Puntuación: ${score.toFixed(1)}%`, 200, 180);

      // Nivel de desempeño
      let level = 'Principiante';
      let character = '🐣';
      if (score >= 90) {
        level = 'Experto';
        character = '🏆';
      } else if (score >= 70) {
        level = 'Avanzado';
        character = '⭐';
      } else if (score >= 50) {
        level = 'Intermedio';
        character = '📚';
      }

      ctx.font = '18px Arial';
      ctx.fillText(`Nivel: ${level}`, 200, 220);
      ctx.font = '48px Arial';
      ctx.fillText(character, 200, 280);

      // Habilidad reforzada
      const skills = {
        'quiz': 'Comprensión Lectora',
        'fill_blanks': 'Escritura',
        'listening': 'Comprensión Auditiva',
        'speaking': 'Expresión Oral'
      };

      ctx.font = '16px Arial';
      ctx.fillText(`Habilidad: ${skills[activity.type]}`, 200, 350);

      // Fecha
      ctx.font = '14px Arial';
      ctx.fillText(new Date().toLocaleDateString(), 200, 400);

      // Convertir a base64
      const cardData = canvas.toDataURL('image/png');
      resolve(cardData);

    } catch (error) {
      reject(error);
    }
  });
}
