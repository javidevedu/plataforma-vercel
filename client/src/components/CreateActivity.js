import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CreateActivity = () => {
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [links, setLinks] = useState(null);
  const [error, setError] = useState('');

  const activityTypes = [
    {
      id: 'quiz',
      name: 'Quiz (Reading)',
      icon: '📖',
      description: 'Preguntas de selección múltiple para comprensión lectora'
    },
    {
      id: 'fill_blanks',
      name: 'Fill in the blanks (Writing)',
      icon: '✍️',
      description: 'Completar espacios en blanco para práctica de escritura'
    },
    {
      id: 'listening',
      name: 'Listening',
      icon: '🎧',
      description: 'Actividades de comprensión auditiva con archivos de audio'
    },
    {
      id: 'speaking',
      name: 'Speaking',
      icon: '🎤',
      description: 'Práctica de expresión oral con grabación de voz'
    }
  ];

  const handleTypeSelect = (type) => {
    setActivityType(type);
    setContent([]);
    setCorrectAnswers([]);
    setError('');
  };

  const addQuestion = () => {
    if (activityType === 'quiz') {
      const newQuestion = {
        question: '',
        options: ['', '', '', '']
      };
      setContent([...content, newQuestion]);
      setCorrectAnswers([...correctAnswers, '']);
    } else if (activityType === 'fill_blanks') {
      const newQuestion = {
        text: '',
        blanks: []
      };
      setContent([...content, newQuestion]);
      setCorrectAnswers([...correctAnswers, '']);
    } else if (activityType === 'listening') {
      const newQuestion = {
        question: '',
        options: ['', '', '', '']
      };
      setContent([...content, newQuestion]);
      setCorrectAnswers([...correctAnswers, '']);
    } else if (activityType === 'speaking') {
      const newQuestion = {
        prompt: '',
        instructions: ''
      };
      setContent([...content, newQuestion]);
      setCorrectAnswers([...correctAnswers, '']);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newContent = [...content];
    newContent[index][field] = value;
    setContent(newContent);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newContent = [...content];
    newContent[questionIndex].options[optionIndex] = value;
    setContent(newContent);
  };

  const updateCorrectAnswer = (index, value) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = value;
    setCorrectAnswers(newCorrectAnswers);
  };

  const removeQuestion = (index) => {
    const newContent = content.filter((_, i) => i !== index);
    const newCorrectAnswers = correctAnswers.filter((_, i) => i !== index);
    setContent(newContent);
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      setError('Por favor selecciona un archivo de audio válido');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      setError('Por favor selecciona un archivo de imagen válido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Crear la actividad
      const response = await axios.post('/api/activities', {
        title,
        type: activityType,
        content,
        correctAnswers
      });

      const { id, studentLink, adminLink } = response.data;

      // Subir archivos si existen
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('audio', audioFile);
        await axios.post(`/api/activities/${id}/audio`, audioFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        await axios.post(`/api/activities/${id}/image`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setLinks({ studentLink, adminLink });
      setCreated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la actividad');
    } finally {
      setLoading(false);
    }
  };

  if (created && links) {
    return (
      <div className="container">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo">
              🎓 AppSemillero
            </Link>
            <nav className="nav">
              <Link to="/">Inicio</Link>
              <Link to="/create">Crear Actividad</Link>
            </nav>
          </div>
        </header>

        <div className="card">
          <h2 className="text-center mb-4">¡Actividad Creada Exitosamente! 🎉</h2>
          <p className="text-center mb-4">
            Tu actividad <strong>"{title}"</strong> ha sido creada. 
            Aquí tienes los enlaces únicos:
          </p>

          <div className="links-container">
            <div className="link-item">
              <h4>🔗 Enlace para Estudiantes</h4>
              <p>Comparte este enlace con tus estudiantes para que puedan resolver la actividad:</p>
              <div className="link-url">
                {window.location.origin}/student/{links.studentLink}
              </div>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/student/${links.studentLink}`)}
              >
                📋 Copiar
              </button>
            </div>

            <div className="link-item">
              <h4>👨‍🏫 Enlace para Administrador</h4>
              <p>Usa este enlace para ver los resultados y gestionar la actividad:</p>
              <div className="link-url">
                {window.location.origin}/admin/{links.adminLink}
              </div>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/admin/${links.adminLink}`)}
              >
                📋 Copiar
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/create" className="btn">
              ➕ Crear Otra Actividad
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ marginLeft: '10px' }}>
              🏠 Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            🎓 AppSemillero
          </Link>
          <nav className="nav">
            <Link to="/">Inicio</Link>
            <Link to="/create">Crear Actividad</Link>
          </nav>
        </div>
      </header>

      <div className="card">
        <h2 className="text-center mb-4">Crear Nueva Actividad</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título de la Actividad</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Comprensión de Lectura - El Medio Ambiente"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Actividad</label>
            <div className="activity-type-selector">
              {activityTypes.map((type) => (
                <div
                  key={type.id}
                  className={`activity-type-card ${activityType === type.id ? 'selected' : ''}`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div className="icon">{type.icon}</div>
                  <h4>{type.name}</h4>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {activityType && (
            <>
              {activityType === 'listening' && (
                <div className="form-group">
                  <label className="form-label">Archivo de Audio (MP3)</label>
                  <div className="audio-upload" onClick={() => document.getElementById('audio-upload').click()}>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                    />
                    <div className="upload-icon">🎵</div>
                    <p>Haz clic para subir un archivo de audio</p>
                    {audioFile && <p><strong>Archivo seleccionado:</strong> {audioFile.name}</p>}
                  </div>
                </div>
              )}

              {activityType === 'speaking' && (
                <div className="form-group">
                  <label className="form-label">Imagen de Apoyo (Opcional)</label>
                  <div className="image-upload" onClick={() => document.getElementById('image-upload').click()}>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="upload-icon">🖼️</div>
                    <p>Haz clic para subir una imagen</p>
                    {imageFile && <p><strong>Archivo seleccionado:</strong> {imageFile.name}</p>}
                  </div>
                </div>
              )}

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Contenido de la Actividad</label>
                  <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                    ➕ Agregar Pregunta
                  </button>
                </div>

                {content.map((item, index) => (
                  <div key={index} className="question-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4>Pregunta {index + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeQuestion(index)}
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    {activityType === 'quiz' && (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escribe la pregunta aquí..."
                          value={item.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          required
                        />
                        <div style={{ marginTop: '15px' }}>
                          <label className="form-label">Opciones de Respuesta:</label>
                          {item.options.map((option, optionIndex) => (
                            <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                value={optionIndex}
                                onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                                style={{ marginRight: '10px' }}
                              />
                              <input
                                type="text"
                                className="form-control"
                                placeholder={`Opción ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activityType === 'fill_blanks' && (
                      <>
                        <textarea
                          className="form-control"
                          placeholder="Escribe el texto con espacios en blanco. Usa [___] para marcar los espacios que deben completar los estudiantes."
                          value={item.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          rows="4"
                          required
                        />
                        <div style={{ marginTop: '15px' }}>
                          <label className="form-label">Respuestas Correctas (separadas por comas):</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="respuesta1, respuesta2, respuesta3..."
                            value={correctAnswers[index] || ''}
                            onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}

                    {activityType === 'listening' && (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escribe la pregunta relacionada con el audio..."
                          value={item.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          required
                        />
                        <div style={{ marginTop: '15px' }}>
                          <label className="form-label">Opciones de Respuesta:</label>
                          {item.options.map((option, optionIndex) => (
                            <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                value={optionIndex}
                                onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                                style={{ marginRight: '10px' }}
                              />
                              <input
                                type="text"
                                className="form-control"
                                placeholder={`Opción ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activityType === 'speaking' && (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escribe el prompt o pregunta para el estudiante..."
                          value={item.prompt}
                          onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
                          required
                        />
                        <textarea
                          className="form-control"
                          placeholder="Instrucciones adicionales para el estudiante..."
                          value={item.instructions}
                          onChange={(e) => updateQuestion(index, 'instructions', e.target.value)}
                          rows="3"
                          style={{ marginTop: '15px' }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn"
              disabled={loading || !activityType || content.length === 0}
            >
              {loading ? '⏳ Creando...' : '🚀 Crear Actividad'}
            </button>
            <Link to="/" className="btn btn-secondary" style={{ marginLeft: '10px' }}>
              🏠 Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;
