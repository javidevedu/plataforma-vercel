// Base de datos en memoria usando archivos JSON
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dataPath = path.join(__dirname, 'data');
    this.activitiesFile = path.join(this.dataPath, 'activities.json');
    this.resultsFile = path.join(this.dataPath, 'results.json');
    this.ensureDataDirectory();
    this.loadData();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  loadData() {
    try {
      this.activities = fs.existsSync(this.activitiesFile) 
        ? JSON.parse(fs.readFileSync(this.activitiesFile, 'utf8'))
        : [];
      this.results = fs.existsSync(this.resultsFile)
        ? JSON.parse(fs.readFileSync(this.resultsFile, 'utf8'))
        : [];
    } catch (error) {
      console.error('Error loading data:', error);
      this.activities = [];
      this.results = [];
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.activitiesFile, JSON.stringify(this.activities, null, 2));
      fs.writeFileSync(this.resultsFile, JSON.stringify(this.results, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Métodos para actividades
  createActivity(activity) {
    const newActivity = {
      id: this.generateId(),
      ...activity,
      createdAt: new Date().toISOString(),
      studentLink: this.generateStudentLink(),
      adminLink: this.generateAdminLink()
    };
    this.activities.push(newActivity);
    this.saveData();
    return newActivity;
  }

  getActivity(id) {
    return this.activities.find(activity => activity.id === id);
  }

  getActivityByStudentLink(studentLink) {
    return this.activities.find(activity => activity.studentLink === studentLink);
  }

  getActivityByAdminLink(adminLink) {
    return this.activities.find(activity => activity.adminLink === adminLink);
  }

  // Métodos para resultados
  saveResult(result) {
    const newResult = {
      id: this.generateId(),
      ...result,
      submittedAt: new Date().toISOString()
    };
    this.results.push(newResult);
    this.saveData();
    return newResult;
  }

  getResultsByActivity(activityId) {
    return this.results.filter(result => result.activityId === activityId);
  }

  getResult(id) {
    return this.results.find(result => result.id === id);
  }

  // Métodos auxiliares
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateStudentLink() {
    return `/actividad/${this.generateId()}`;
  }

  generateAdminLink() {
    return `/admin/${this.generateId()}`;
  }

  // Método para exportar datos
  exportToCSV(activityId) {
    const results = this.getResultsByActivity(activityId);
    const activity = this.getActivity(activityId);
    
    if (!activity || results.length === 0) {
      return null;
    }

    const headers = ['Estudiante', 'Actividad', 'Tipo', 'Calificación', 'Fecha', 'Tiempo (min)'];
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.studentName,
        activity.title,
        activity.type,
        result.score || 'Pendiente',
        new Date(result.submittedAt).toLocaleDateString(),
        result.timeSpent || 0
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

// Instancia singleton
const database = new Database();

module.exports = database;
