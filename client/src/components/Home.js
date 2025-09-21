import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
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

      <section className="hero">
        <div className="container">
          <h1>Plataforma de Aprendizaje Gamificado</h1>
          <p>
            Crea actividades educativas interactivas y motiva a tus estudiantes 
            con un sistema de recompensas coleccionables
          </p>
          <div className="hero-buttons">
            <Link to="/create" className="btn">
              🚀 Crear Nueva Actividad
            </Link>
            <a href="#features" className="btn btn-secondary">
              📚 Ver Características
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2>Características Principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>4 Tipos de Actividades</h3>
              <p>
                Quiz, Fill in the blanks, Listening y Speaking. 
                Cada tipo está diseñado para desarrollar habilidades específicas.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Enlaces Únicos</h3>
              <p>
                Cada actividad genera automáticamente enlaces únicos 
                para estudiantes y administradores.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Calificación Automática</h3>
              <p>
                Sistema de calificación automática para la mayoría de actividades, 
                con revisión manual para Speaking.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🃏</div>
              <h3>Cartas Coleccionables</h3>
              <p>
                Los estudiantes reciben cartas digitales tipo trading card 
                como recompensa por su desempeño.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Reportes y Exportación</h3>
              <p>
                Los docentes pueden ver resultados detallados y exportar 
                datos a CSV o Excel.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Gamificación</h3>
              <p>
                Sistema de niveles y personajes que motiva a los estudiantes 
                a mejorar su desempeño.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '30px' }}>¿Cómo Funciona?</h2>
        <div className="grid">
          <div className="card">
            <h3>1. Crear Actividad</h3>
            <p>El docente crea una actividad eligiendo el tipo y configurando el contenido.</p>
          </div>
          <div className="card">
            <h3>2. Obtener Enlaces</h3>
            <p>El sistema genera automáticamente enlaces únicos para estudiantes y administrador.</p>
          </div>
          <div className="card">
            <h3>3. Resolver Actividad</h3>
            <p>Los estudiantes acceden a su enlace y resuelven la actividad.</p>
          </div>
          <div className="card">
            <h3>4. Recibir Recompensa</h3>
            <p>Los estudiantes reciben una carta coleccionable basada en su desempeño.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
