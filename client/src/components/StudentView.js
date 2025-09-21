import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AudioRecorder } from 'react-audio-voice-recorder';
import ReactAudioPlayer from 'react-audio-player';

const StudentView = () => {
  const { link } = useParams();
  const [activity, setActivity] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState({});
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivity();
  }, [link]);

  const fetchActivity = async () => {
    try {
      const response = await axios.get(`/api/student/${link}`);
      setActivity(response.data);
      setLoading(false);
    } catch (err) {
      setError('Actividad no encontrada o enlace inválido');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({
      ...answers,
      [questionIndex]: value
    });
  };

  const handleBlankChange = (questionIndex, blankIndex, value) => {
    const questionAnswers = answers[questionIndex] || {};
    setAnswers({
      ...answers,
      [questionIndex]: {
        ...questionAnswers,
        [blankIndex]: value
      }
    });
  };

  const addAudioElement = (blob) => {
    setAudioBlob(blob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    // Validar que se hayan respondido las preguntas (excepto para speaking)
    if (activity.type !== 'speaking') {
      const hasAnswers = Object.keys(answers).length > 0;
      if (!hasAnswers) {
        setError('Por favor responde al menos una pregunta');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('studentName', studentName);
      formData.append('answers', JSON.stringify(answers));
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      }

      console.log('Enviando datos:', {
        studentName,
        answers,
        hasAudio: !!audioBlob
      });

      const response = await axios.post(`/api/student/${link}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Respuesta del servidor:', response.data);
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      console.error('Error al enviar:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al enviar las respuestas';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCard = (format) => {
    if (!result?.cardData) return;

    const link = document.createElement('a');
    link.href = result.cardData;
    link.download = `carta_${studentName}_${activity.title}.${format === 'pdf' ? 'pdf' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="container">
        <div className="card">
          <div className="alert alert-danger">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="text-center mb-4">¡Actividad Completada! 🎉</h2>
          
          <div className="results-summary">
            <h3>Resultados</h3>
            <p><strong>Estudiante:</strong> {studentName}</p>
            <p><strong>Actividad:</strong> {activity.title}</p>
            <p><strong>Puntuación:</strong> {result.score?.toFixed(1) || 'Pendiente de revisión'}%</p>
          </div>

          {result.cardData && (
            <div className="trading-card">
              <h3>🏆 Tu Carta Coleccionable</h3>
              <img 
                src={result.cardData} 
                alt="Carta coleccionable" 
                style={{ maxWidth: '100%', borderRadius: '8px', margin: '20px 0' }}
              />
              <div className="text-center">
                <button 
                  className="btn"
                  onClick={() => downloadCard('png')}
                  style={{ marginRight: '10px' }}
                >
                  📥 Descargar PNG
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => downloadCard('pdf')}
                >
                  📄 Descargar PDF
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <p>¡Excelente trabajo! Tu carta ha sido agregada a tu colección.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-center mb-4">{activity?.title}</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="student-info">
            <div className="form-group">
              <label className="form-label">Tu Nombre</label>
              <input
                type="text"
                className="form-control"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Escribe tu nombre completo"
                required
              />
            </div>
          </div>

          {activity?.type === 'listening' && activity.audioFile && (
            <div className="form-group">
              <label className="form-label">🎧 Audio para Escuchar</label>
              <ReactAudioPlayer
                src={`/uploads/${activity.audioFile}`}
                controls
                className="audio-player"
              />
            </div>
          )}

          {activity?.type === 'speaking' && activity.imageFile && (
            <div className="form-group">
              <label className="form-label">🖼️ Imagen de Referencia</label>
              <img 
                src={`/uploads/${activity.imageFile}`} 
                alt="Referencia para speaking"
                className="image-preview"
              />
            </div>
          )}

          <div className="form-group">
            <h3>Preguntas</h3>
            {activity?.content.map((item, questionIndex) => (
              <div key={questionIndex} className="question-item">
                <h4>Pregunta {questionIndex + 1}</h4>

                {activity.type === 'quiz' && (
                  <>
                    <p style={{ marginBottom: '15px', fontSize: '16px' }}>{item.question}</p>
                    <div>
                      {item.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                            checked={answers[questionIndex] === optionIndex.toString()}
                          />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activity.type === 'fill_blanks' && (
                  <div>
                    <p style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.6' }}>
                      {item.text.split('[___]').map((part, partIndex, array) => (
                        <span key={partIndex}>
                          {part}
                          {partIndex < array.length - 1 && (
                            <input
                              type="text"
                              className="blank-input"
                              placeholder="____"
                              value={answers[questionIndex]?.[partIndex] || ''}
                              onChange={(e) => handleBlankChange(questionIndex, partIndex, e.target.value)}
                            />
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                {activity.type === 'listening' && (
                  <>
                    <p style={{ marginBottom: '15px', fontSize: '16px' }}>{item.question}</p>
                    <div>
                      {item.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                            checked={answers[questionIndex] === optionIndex.toString()}
                          />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activity.type === 'speaking' && (
                  <div>
                    <p style={{ marginBottom: '15px', fontSize: '16px' }}>{item.prompt}</p>
                    {item.instructions && (
                      <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                        <strong>Instrucciones:</strong> {item.instructions}
                      </p>
                    )}
                    <div className="recording-controls">
                      <AudioRecorder
                        onRecordingComplete={addAudioElement}
                        audioType="audio/webm"
                        showUIAudio
                      />
                      {audioBlob && (
                        <div className="recording-indicator">
                          <div className="recording-dot"></div>
                          <span>Grabación completada</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn"
              disabled={submitting || !studentName.trim()}
            >
              {submitting ? '⏳ Enviando...' : '📤 Enviar Respuestas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentView;
