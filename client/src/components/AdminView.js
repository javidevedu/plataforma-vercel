import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AdminView = () => {
  const { link } = useParams();
  const [activity, setActivity] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [link]);

  const fetchData = async () => {
    try {
      const [activityResponse, resultsResponse] = await Promise.all([
        axios.get(`/api/admin/${link}`),
        axios.get(`/api/admin/${link}/results`)
      ]);
      
      setActivity(activityResponse.data);
      setResults(resultsResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Actividad no encontrada o enlace inválido');
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`/api/admin/${link}/export/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activity.title}_resultados.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`/api/admin/${link}/export/excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activity.title}_resultados.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar Excel');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 50) return '#fd7e14';
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Necesita Mejorar';
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

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-center mb-4">📊 Panel de Administración</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="alert alert-info">
          <h4>📝 Información de la Actividad</h4>
          <p><strong>Título:</strong> {activity?.title}</p>
          <p><strong>Tipo:</strong> {activity?.type}</p>
          <p><strong>Total de Respuestas:</strong> {results.length}</p>
        </div>

        {results.length > 0 ? (
          <>
            <div className="export-buttons">
              <button className="export-btn" onClick={handleExportCSV}>
                📊 Exportar CSV
              </button>
              <button className="export-btn" onClick={handleExportExcel}>
                📈 Exportar Excel
              </button>
            </div>

            <div className="results-summary">
              <h3>📈 Resumen de Resultados</h3>
              <div className="grid">
                <div className="card">
                  <h4>Promedio General</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    {(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(1)}%
                  </p>
                </div>
                <div className="card">
                  <h4>Mejor Puntuación</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {Math.max(...results.map(r => r.score || 0)).toFixed(1)}%
                  </p>
                </div>
                <div className="card">
                  <h4>Estudiantes Completados</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                    {results.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>📋 Resultados Detallados</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Puntuación</th>
                      <th>Nivel</th>
                      <th>Respuestas</th>
                      <th>Audio</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id}>
                        <td>
                          <strong>{result.studentName}</strong>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              color: getScoreColor(result.score || 0),
                              fontWeight: 'bold'
                            }}
                          >
                            {result.score ? `${result.score.toFixed(1)}%` : 'Pendiente'}
                          </span>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              color: getScoreColor(result.score || 0),
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              backgroundColor: getScoreColor(result.score || 0) + '20'
                            }}
                          >
                            {result.score ? getScoreLabel(result.score) : 'Sin calificar'}
                          </span>
                        </td>
                        <td>
                          <details>
                            <summary style={{ cursor: 'pointer', color: '#667eea' }}>
                              Ver respuestas
                            </summary>
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                              {activity.type === 'quiz' && (
                                <div>
                                  {activity.content.map((question, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '10px' }}>
                                      <strong>Pregunta {qIndex + 1}:</strong> {question.question}
                                      <br />
                                      <span style={{ color: '#666' }}>
                                        Respuesta: {question.options[result.answers[qIndex]] || 'Sin respuesta'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {activity.type === 'fill_blanks' && (
                                <div>
                                  {activity.content.map((question, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '10px' }}>
                                      <strong>Pregunta {qIndex + 1}:</strong>
                                      <br />
                                      <span style={{ color: '#666' }}>
                                        Respuestas: {Object.values(result.answers[qIndex] || {}).join(', ') || 'Sin respuestas'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {activity.type === 'listening' && (
                                <div>
                                  {activity.content.map((question, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '10px' }}>
                                      <strong>Pregunta {qIndex + 1}:</strong> {question.question}
                                      <br />
                                      <span style={{ color: '#666' }}>
                                        Respuesta: {question.options[result.answers[qIndex]] || 'Sin respuesta'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {activity.type === 'speaking' && (
                                <div>
                                  {activity.content.map((question, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '10px' }}>
                                      <strong>Prompt {qIndex + 1}:</strong> {question.prompt}
                                      <br />
                                      <span style={{ color: '#666' }}>
                                        {question.instructions}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </details>
                        </td>
                        <td>
                          {result.audioResponse ? (
                            <audio controls style={{ width: '200px' }}>
                              <source src={`/uploads/${result.audioResponse}`} type="audio/webm" />
                              Tu navegador no soporta el elemento de audio.
                            </audio>
                          ) : (
                            <span style={{ color: '#6c757d' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(result.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="no-results">
            <div className="icon">📭</div>
            <h3>No hay resultados aún</h3>
            <p>Los resultados de los estudiantes aparecerán aquí una vez que completen la actividad.</p>
          </div>
        )}

        <div className="text-center mt-4">
          <button 
            className="btn btn-secondary"
            onClick={fetchData}
          >
            🔄 Actualizar Resultados
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
