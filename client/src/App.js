import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateActivity from './components/CreateActivity';
import StudentView from './components/StudentView';
import AdminView from './components/AdminView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateActivity />} />
          <Route path="/student/:link" element={<StudentView />} />
          <Route path="/admin/:link" element={<AdminView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
