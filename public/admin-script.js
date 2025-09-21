// Funcionalidad principal para la vista de administrador
class AdminPanel {
    constructor() {
        this.activityId = this.getActivityIdFromUrl();
        this.activity = null;
        this.results = [];
        this.filteredResults = [];
        this.selectedResults = new Set();
        
        this.init();
    }

    getActivityIdFromUrl() {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1];
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.displayData();
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            this.showError('Error al cargar los datos de la actividad');
        }
    }

    async loadData() {
        try {
            // Cargar actividad
            const activityResponse = await fetch(`/api/activities/${this.activityId}`);
            if (!activityResponse.ok) {
                throw new Error('Actividad no encontrada');
            }
            this.activity = await activityResponse.json();

            // Cargar resultados
            const resultsResponse = await fetch(`/api/results?activityId=${this.activityId}`);
            if (!resultsResponse.ok) {
                throw new Error('Error al cargar resultados');
            }
            this.results = await resultsResponse.json();
            this.filteredResults = [...this.results];

        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    displayData() {
        this.displayActivityInfo();
        this.displayResults();
        this.updateStats();
        this.hideLoading();
    }

    displayActivityInfo() {
        document.getElementById('activityTitle').textContent = this.activity.title;
        document.getElementById('activityDescription').textContent = this.activity.description || 'Sin descripción';
        
        // Mostrar tipo de actividad
        const typeElement = document.getElementById('activityType');
        const typeIcons = {
            'quiz': 'fas fa-question-circle',
            'fill-blanks': 'fas fa-edit',
            'listening': 'fas fa-volume-up',
            'speaking': 'fas fa-microphone'
        };
        const typeLabels = {
            'quiz': 'Quiz (Reading)',
            'fill-blanks': 'Fill in the blanks (Writing)',
            'listening': 'Listening',
            'speaking': 'Speaking'
        };
        
        typeElement.innerHTML = `<i class="${typeIcons[this.activity.type]}"></i> ${typeLabels[this.activity.type]}`;
    }

    displayResults() {
        const tableBody = document.getElementById('resultsTableBody');
        tableBody.innerHTML = '';

        if (this.filteredResults.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p>No hay resultados que coincidan con los filtros aplicados.</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredResults.forEach(result => {
            const row = this.createResultRow(result);
            tableBody.appendChild(row);
        });

        // Mostrar sección de speaking si es necesario
        if (this.activity.type === 'speaking') {
            this.displaySpeakingReviews();
        }
    }

    createResultRow(result) {
        const row = document.createElement('tr');
        row.dataset.resultId = result.id;
        
        const status = this.getResultStatus(result);
        const score = this.getScoreDisplay(result.score);
        const timeSpent = result.timeSpent ? `${result.timeSpent} min` : 'N/A';
        const date = new Date(result.submittedAt).toLocaleDateString();
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="result-checkbox" data-result-id="${result.id}">
            </td>
            <td>
                <div class="student-name">${result.studentName}</div>
            </td>
            <td>
                <span class="status-badge ${status}">${this.getStatusLabel(status)}</span>
            </td>
            <td>
                <span class="score-display ${this.getScoreClass(result.score)}">${score}</span>
            </td>
            <td>${timeSpent}</td>
            <td>${date}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="adminPanel.viewResult('${result.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${this.activity.type === 'speaking' ? `
                        <button class="action-btn audio" onclick="adminPanel.playAudio('${result.id}')" title="Reproducir audio">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn edit" onclick="adminPanel.editResult('${result.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="adminPanel.deleteResult('${result.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    getResultStatus(result) {
        if (result.status === 'pending_review') return 'reviewing';
        if (result.score !== null) return 'completed';
        return 'pending';
    }

    getStatusLabel(status) {
        const labels = {
            'completed': 'Completada',
            'pending': 'Pendiente',
            'reviewing': 'En revisión'
        };
        return labels[status] || 'Desconocido';
    }

    getScoreDisplay(score) {
        if (score === null) return 'Pendiente';
        return `${score}%`;
    }

    getScoreClass(score) {
        if (score === null) return '';
        if (score >= 90) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 50) return 'score-fair';
        return 'score-poor';
    }

    displaySpeakingReviews() {
        const speakingSection = document.getElementById('speakingReviews');
        const reviewsContainer = document.getElementById('speakingReviewsContainer');
        
        speakingSection.classList.remove('hidden');
        reviewsContainer.innerHTML = '';

        const pendingResults = this.results.filter(r => r.status === 'pending_review');
        
        if (pendingResults.length === 0) {
            reviewsContainer.innerHTML = '<p>No hay grabaciones pendientes de revisión.</p>';
            return;
        }

        pendingResults.forEach(result => {
            const reviewCard = this.createReviewCard(result);
            reviewsContainer.appendChild(reviewCard);
        });
    }

    createReviewCard(result) {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.dataset.resultId = result.id;
        
        const date = new Date(result.submittedAt).toLocaleDateString();
        
        card.innerHTML = `
            <div class="review-header">
                <div class="review-student">${result.studentName}</div>
                <div class="review-date">${date}</div>
            </div>
            <div class="review-audio">
                <audio controls>
                    <source src="${result.audioFile || '#'}" type="audio/wav">
                    Tu navegador no soporta el elemento de audio.
                </audio>
            </div>
            <div class="review-grading">
                <input type="number" placeholder="Calificación (0-100)" min="0" max="100" 
                       class="grade-input" data-result-id="${result.id}">
                <button class="save-grade-btn" data-result-id="${result.id}">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
        `;

        // Event listener para guardar calificación
        const saveBtn = card.querySelector('.save-grade-btn');
        saveBtn.addEventListener('click', () => {
            this.saveGrade(result.id);
        });

        return card;
    }

    updateStats() {
        const totalStudents = this.results.length;
        const completedCount = this.results.filter(r => r.score !== null).length;
        const pendingCount = totalStudents - completedCount;
        const averageScore = this.calculateAverageScore();

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('averageScore').textContent = `${averageScore}%`;
    }

    calculateAverageScore() {
        const scoredResults = this.results.filter(r => r.score !== null);
        if (scoredResults.length === 0) return 0;
        
        const totalScore = scoredResults.reduce((sum, r) => sum + r.score, 0);
        return Math.round(totalScore / scoredResults.length);
    }

    setupEventListeners() {
        // Filtros y búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterResults();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterResults();
        });

        document.getElementById('scoreFilter').addEventListener('change', () => {
            this.filterResults();
        });

        // Selección de resultados
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('result-checkbox')) {
                this.updateSelection();
            }
        });

        // Botones de acción
        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.showExportModal();
        });

        // Modales
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Audio modal
        document.getElementById('closeAudioModal').addEventListener('click', () => {
            this.closeModal('audioModal');
        });

        // Export modal
        document.getElementById('closeExportModal').addEventListener('click', () => {
            this.closeModal('exportModal');
        });

        document.getElementById('confirmExport').addEventListener('click', () => {
            this.performExport();
        });

        document.getElementById('cancelExport').addEventListener('click', () => {
            this.closeModal('exportModal');
        });
    }

    filterResults() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const scoreFilter = document.getElementById('scoreFilter').value;

        this.filteredResults = this.results.filter(result => {
            // Filtro de búsqueda
            if (searchTerm && !result.studentName.toLowerCase().includes(searchTerm)) {
                return false;
            }

            // Filtro de estado
            if (statusFilter !== 'all') {
                const status = this.getResultStatus(result);
                if (statusFilter === 'completed' && status !== 'completed') return false;
                if (statusFilter === 'pending' && status === 'completed') return false;
            }

            // Filtro de puntuación
            if (scoreFilter !== 'all' && result.score !== null) {
                if (scoreFilter === 'excellent' && result.score < 90) return false;
                if (scoreFilter === 'good' && (result.score < 70 || result.score >= 90)) return false;
                if (scoreFilter === 'fair' && (result.score < 50 || result.score >= 70)) return false;
                if (scoreFilter === 'poor' && result.score >= 50) return false;
            }

            return true;
        });

        this.displayResults();
    }

    toggleSelectAll(selectAll) {
        const checkboxes = document.querySelectorAll('.result-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
            if (selectAll) {
                this.selectedResults.add(checkbox.dataset.resultId);
            } else {
                this.selectedResults.delete(checkbox.dataset.resultId);
            }
        });
        this.updateBulkActions();
    }

    updateSelection() {
        const checkboxes = document.querySelectorAll('.result-checkbox');
        this.selectedResults.clear();
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                this.selectedResults.add(checkbox.dataset.resultId);
            }
        });

        // Actualizar checkbox principal
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        selectAllCheckbox.checked = this.selectedResults.size === checkboxes.length;
        selectAllCheckbox.indeterminate = this.selectedResults.size > 0 && this.selectedResults.size < checkboxes.length;

        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedResults.size > 0) {
            bulkActions.classList.remove('hidden');
            selectedCount.textContent = `${this.selectedResults.size} elemento${this.selectedResults.size > 1 ? 's' : ''} seleccionado${this.selectedResults.size > 1 ? 's' : ''}`;
        } else {
            bulkActions.classList.add('hidden');
        }
    }

    async refreshData() {
        try {
            this.showLoading(true);
            await this.loadData();
            this.displayData();
            this.showToast('Datos actualizados correctamente', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showToast('Error al actualizar los datos', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    viewResult(resultId) {
        const result = this.results.find(r => r.id === resultId);
        if (!result) return;

        // Crear modal de detalles
        const modal = this.createDetailModal(result);
        document.body.appendChild(modal);
    }

    createDetailModal(result) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles del Resultado</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="result-details">
                        <p><strong>Estudiante:</strong> ${result.studentName}</p>
                        <p><strong>Actividad:</strong> ${this.activity.title}</p>
                        <p><strong>Puntuación:</strong> ${this.getScoreDisplay(result.score)}</p>
                        <p><strong>Tiempo utilizado:</strong> ${result.timeSpent || 0} minutos</p>
                        <p><strong>Fecha de envío:</strong> ${new Date(result.submittedAt).toLocaleString()}</p>
                        ${result.answers ? `
                            <div class="answers-section">
                                <h4>Respuestas:</h4>
                                <pre>${JSON.stringify(result.answers, null, 2)}</pre>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    playAudio(resultId) {
        const result = this.results.find(r => r.id === resultId);
        if (!result || !result.audioFile) {
            this.showToast('No hay archivo de audio disponible', 'error');
            return;
        }

        const modal = document.getElementById('audioModal');
        const audioPlayer = document.getElementById('modalAudioPlayer');
        const audioSource = document.getElementById('modalAudioSource');
        const studentName = document.getElementById('audioStudentName');
        const audioDate = document.getElementById('audioDate');
        const audioDuration = document.getElementById('audioDuration');

        audioSource.src = result.audioFile;
        audioPlayer.load();
        studentName.textContent = result.studentName;
        audioDate.textContent = new Date(result.submittedAt).toLocaleDateString();
        audioDuration.textContent = 'Calculando...';

        // Calcular duración cuando se cargue el audio
        audioPlayer.addEventListener('loadedmetadata', () => {
            const duration = Math.round(audioPlayer.duration);
            audioDuration.textContent = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
        });

        modal.classList.remove('hidden');
    }

    async saveGrade(resultId) {
        const gradeInput = document.querySelector(`[data-result-id="${resultId}"]`);
        const grade = parseInt(gradeInput.value);

        if (isNaN(grade) || grade < 0 || grade > 100) {
            this.showToast('Por favor, ingresa una calificación válida (0-100)', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/results/${resultId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: grade, status: 'completed' })
            });

            if (!response.ok) {
                throw new Error('Error al guardar la calificación');
            }

            // Actualizar resultado local
            const result = this.results.find(r => r.id === resultId);
            if (result) {
                result.score = grade;
                result.status = 'completed';
            }

            this.displayResults();
            this.updateStats();
            this.showToast('Calificación guardada correctamente', 'success');

        } catch (error) {
            console.error('Error saving grade:', error);
            this.showToast('Error al guardar la calificación', 'error');
        }
    }

    editResult(resultId) {
        // Implementar edición de resultado
        this.showToast('Funcionalidad de edición en desarrollo', 'info');
    }

    async deleteResult(resultId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este resultado?')) {
            return;
        }

        try {
            const response = await fetch(`/api/results/${resultId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el resultado');
            }

            // Remover resultado local
            this.results = this.results.filter(r => r.id !== resultId);
            this.filteredResults = this.filteredResults.filter(r => r.id !== resultId);
            this.selectedResults.delete(resultId);

            this.displayResults();
            this.updateStats();
            this.updateBulkActions();
            this.showToast('Resultado eliminado correctamente', 'success');

        } catch (error) {
            console.error('Error deleting result:', error);
            this.showToast('Error al eliminar el resultado', 'error');
        }
    }

    showExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.remove('hidden');
    }

    async performExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const includeCompleted = document.getElementById('exportCompleted').checked;
        const includePending = document.getElementById('exportPending').checked;

        try {
            let exportResults = this.results;
            
            // Aplicar filtros
            if (includeCompleted && !includePending) {
                exportResults = exportResults.filter(r => r.score !== null);
            } else if (!includeCompleted && includePending) {
                exportResults = exportResults.filter(r => r.score === null);
            }

            if (exportResults.length === 0) {
                this.showToast('No hay resultados para exportar con los filtros seleccionados', 'warning');
                return;
            }

            const response = await fetch(`/api/export?activityId=${this.activityId}&format=${format}`);
            
            if (!response.ok) {
                throw new Error('Error al exportar datos');
            }

            if (format === 'csv') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resultados_${this.activity.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resultados_${this.activity.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
            }

            this.closeModal('exportModal');
            this.showToast('Datos exportados correctamente', 'success');

        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error al exportar los datos', 'error');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const adminContent = document.getElementById('adminContent');
        
        if (show) {
            loadingState.classList.remove('hidden');
            adminContent.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            adminContent.classList.remove('hidden');
        }
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const adminContent = document.getElementById('adminContent');
        
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
        adminContent.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        // Remover toast existente
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Crear nuevo toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Ocultar toast después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
