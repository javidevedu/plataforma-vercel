// Funcionalidad para configurar Listening
class ListeningConfigurator {
    constructor() {
        this.questions = [];
        this.questionCounter = 0;
        this.activityId = this.getActivityIdFromUrl();
        this.audioFile = null;
        this.audioUrl = null;
        
        this.init();
    }

    getActivityIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('activityId');
    }

    init() {
        this.setupEventListeners();
        this.addQuestion(); // Agregar primera pregunta por defecto
    }

    setupEventListeners() {
        // Botones principales
        document.getElementById('addQuestion').addEventListener('click', () => {
            this.addQuestion();
        });

        document.getElementById('previewActivity').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('closePreview').addEventListener('click', () => {
            this.hidePreview();
        });

        document.getElementById('saveActivity').addEventListener('click', () => {
            this.saveActivity();
        });

        // Audio upload
        document.getElementById('audioFile').addEventListener('change', (e) => {
            this.handleAudioUpload(e.target.files[0]);
        });

        document.getElementById('removeAudio').addEventListener('click', () => {
            this.removeAudio();
        });

        // Event listeners delegados para elementos dinámicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-option')) {
                this.addOption(e.target.closest('.question-card'));
            } else if (e.target.closest('.remove-option')) {
                this.removeOption(e.target.closest('.option-item'));
            } else if (e.target.closest('.delete-question')) {
                this.deleteQuestion(e.target.closest('.question-card'));
            } else if (e.target.closest('.move-up')) {
                this.moveQuestion(e.target.closest('.question-card'), 'up');
            } else if (e.target.closest('.move-down')) {
                this.moveQuestion(e.target.closest('.question-card'), 'down');
            }
        });

        // Event listeners para cambios en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('question-text') || 
                e.target.classList.contains('question-points') ||
                e.target.classList.contains('option-text')) {
                this.updateQuestionData();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('correct-answer')) {
                this.updateQuestionData();
            }
        });
    }

    async handleAudioUpload(file) {
        if (!file) return;

        // Validar tipo de archivo
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Tipo de archivo no válido. Solo se permiten archivos de audio.', 'error');
            return;
        }

        // Validar tamaño (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('El archivo es demasiado grande. Máximo 10MB.', 'error');
            return;
        }

        try {
            this.showLoading(true, 'Subiendo archivo...');

            const formData = new FormData();
            formData.append('audio', file);

            const response = await fetch('/api/upload-audio', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir el archivo');
            }

            const result = await response.json();
            this.audioFile = file;
            this.audioUrl = result.audioUrl;
            
            this.showAudioPreview(file, result);
            this.showToast('Archivo de audio subido exitosamente', 'success');

        } catch (error) {
            console.error('Error uploading audio:', error);
            this.showToast('Error al subir el archivo de audio', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showAudioPreview(file, uploadResult) {
        const preview = document.getElementById('audioPreview');
        const audioPlayer = document.getElementById('audioPlayer');
        const audioSource = document.getElementById('audioSource');
        const fileName = document.getElementById('audioFileName');
        const fileSize = document.getElementById('audioFileSize');
        const duration = document.getElementById('audioDuration');

        // Configurar el reproductor de audio
        audioSource.src = this.audioUrl;
        audioPlayer.load();

        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        // Calcular duración cuando se cargue el audio
        audioPlayer.addEventListener('loadedmetadata', () => {
            const durationSeconds = Math.round(audioPlayer.duration);
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = durationSeconds % 60;
            duration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        });

        preview.classList.remove('hidden');
    }

    removeAudio() {
        this.audioFile = null;
        this.audioUrl = null;
        
        const preview = document.getElementById('audioPreview');
        const audioPlayer = document.getElementById('audioPlayer');
        const audioSource = document.getElementById('audioSource');
        const fileInput = document.getElementById('audioFile');

        preview.classList.add('hidden');
        audioSource.src = '';
        audioPlayer.load();
        fileInput.value = '';

        this.showToast('Audio removido', 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    addQuestion() {
        this.questionCounter++;
        const questionId = `question_${this.questionCounter}`;
        
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        
        const questionCard = questionElement.querySelector('.question-card');
        questionCard.dataset.questionId = questionId;
        questionCard.querySelector('.question-number').textContent = this.questions.length + 1;
        
        // Agregar al contenedor
        const container = document.getElementById('questionsContainer');
        container.appendChild(questionElement);
        
        // Agregar al array de preguntas
        this.questions.push({
            id: questionId,
            text: '',
            points: 1,
            options: [],
            correctAnswer: null
        });
        
        // Agregar opciones por defecto
        const questionCardElement = container.querySelector(`[data-question-id="${questionId}"]`);
        this.addOption(questionCardElement);
        this.addOption(questionCardElement);
        this.addOption(questionCardElement);
        
        this.updateQuestionNumbers();
        this.showToast('Pregunta agregada', 'success');
    }

    addOption(questionCard) {
        const optionsContainer = questionCard.querySelector('.options-container');
        const template = document.getElementById('optionTemplate');
        const optionElement = template.content.cloneNode(true);
        
        optionsContainer.appendChild(optionElement);
        this.updateCorrectAnswerOptions(questionCard);
        this.updateQuestionData();
    }

    removeOption(optionItem) {
        const questionCard = optionItem.closest('.question-card');
        const optionsContainer = questionCard.querySelector('.options-container');
        
        if (optionsContainer.children.length <= 2) {
            this.showToast('Debe haber al menos 2 opciones', 'warning');
            return;
        }
        
        optionItem.remove();
        this.updateCorrectAnswerOptions(questionCard);
        this.updateQuestionData();
    }

    updateCorrectAnswerOptions(questionCard) {
        const correctAnswerSelect = questionCard.querySelector('.correct-answer');
        const options = questionCard.querySelectorAll('.option-text');
        
        // Limpiar opciones existentes
        correctAnswerSelect.innerHTML = '<option value="">Selecciona la respuesta correcta</option>';
        
        // Agregar nuevas opciones
        options.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = index;
            optionElement.textContent = `Opción ${index + 1}`;
            correctAnswerSelect.appendChild(optionElement);
        });
    }

    deleteQuestion(questionCard) {
        if (this.questions.length <= 1) {
            this.showToast('Debe haber al menos una pregunta', 'warning');
            return;
        }
        
        const questionId = questionCard.dataset.questionId;
        this.questions = this.questions.filter(q => q.id !== questionId);
        questionCard.remove();
        
        this.updateQuestionNumbers();
        this.showToast('Pregunta eliminada', 'success');
    }

    moveQuestion(questionCard, direction) {
        const container = document.getElementById('questionsContainer');
        const questions = Array.from(container.children);
        const currentIndex = questions.indexOf(questionCard);
        
        let newIndex;
        if (direction === 'up') {
            newIndex = currentIndex - 1;
        } else {
            newIndex = currentIndex + 1;
        }
        
        if (newIndex < 0 || newIndex >= questions.length) {
            return;
        }
        
        // Mover en el DOM
        if (direction === 'up') {
            container.insertBefore(questionCard, questions[newIndex]);
        } else {
            container.insertBefore(questionCard, questions[newIndex].nextSibling);
        }
        
        // Mover en el array
        const question = this.questions[currentIndex];
        this.questions.splice(currentIndex, 1);
        this.questions.splice(newIndex, 0, question);
        
        this.updateQuestionNumbers();
    }

    updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-card');
        questions.forEach((question, index) => {
            question.querySelector('.question-number').textContent = index + 1;
        });
    }

    updateQuestionData() {
        const questions = document.querySelectorAll('.question-card');
        
        questions.forEach((questionCard, index) => {
            const questionId = questionCard.dataset.questionId;
            const questionData = this.questions.find(q => q.id === questionId);
            
            if (questionData) {
                // Actualizar texto de la pregunta
                const questionText = questionCard.querySelector('.question-text').value;
                questionData.text = questionText;
                
                // Actualizar puntos
                const points = parseInt(questionCard.querySelector('.question-points').value) || 1;
                questionData.points = points;
                
                // Actualizar opciones
                const optionInputs = questionCard.querySelectorAll('.option-text');
                questionData.options = Array.from(optionInputs).map(input => input.value);
                
                // Actualizar respuesta correcta
                const correctAnswer = questionCard.querySelector('.correct-answer').value;
                questionData.correctAnswer = correctAnswer ? parseInt(correctAnswer) : null;
            }
        });
    }

    showPreview() {
        this.updateQuestionData();
        
        if (!this.validateActivity()) {
            return;
        }
        
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = this.generatePreviewHTML();
        
        const previewSection = document.getElementById('previewSection');
        previewSection.classList.remove('hidden');
        
        // Scroll a la vista previa
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }

    hidePreview() {
        const previewSection = document.getElementById('previewSection');
        previewSection.classList.add('hidden');
    }

    generatePreviewHTML() {
        const title = document.getElementById('activityTitle').value || 'Actividad sin título';
        const description = document.getElementById('activityDescription').value || 'Sin descripción';
        const timeLimit = document.getElementById('activityTimeLimit').value || 30;
        
        let html = `
            <div class="preview-activity">
                <h2>${title}</h2>
                <p>${description}</p>
                <p><strong>Tiempo límite:</strong> ${timeLimit} minutos</p>
                
                <div class="preview-audio">
                    <h3>Audio para escuchar:</h3>
                    <div class="audio-player-container">
                        <audio controls>
                            <source src="${this.audioUrl || '#'}" type="audio/mpeg">
                            Tu navegador no soporta el elemento de audio.
                        </audio>
                    </div>
                </div>
                
                <div class="preview-questions">
                    <h3>Preguntas de comprensión:</h3>
        `;
        
        this.questions.forEach((question, index) => {
            if (question.text && question.options.length >= 2) {
                html += `
                    <div class="preview-question">
                        <h4>Pregunta ${index + 1} (${question.points} punto${question.points > 1 ? 's' : ''})</h4>
                        <p>${question.text}</p>
                        <div class="preview-options">
                `;
                
                question.options.forEach((option, optionIndex) => {
                    if (option.trim()) {
                        html += `
                            <div class="preview-option">
                                <input type="radio" name="preview_question_${index}" value="${optionIndex}" disabled>
                                <label>${option}</label>
                            </div>
                        `;
                    }
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    validateActivity() {
        const title = document.getElementById('activityTitle').value.trim();
        if (!title) {
            this.showToast('Por favor, ingresa un título para la actividad', 'error');
            return false;
        }
        
        if (!this.audioUrl) {
            this.showToast('Por favor, sube un archivo de audio', 'error');
            return false;
        }
        
        if (this.questions.length === 0) {
            this.showToast('Debe haber al menos una pregunta', 'error');
            return false;
        }
        
        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i];
            
            if (!question.text.trim()) {
                this.showToast(`La pregunta ${i + 1} no tiene texto`, 'error');
                return false;
            }
            
            const validOptions = question.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                this.showToast(`La pregunta ${i + 1} debe tener al menos 2 opciones`, 'error');
                return false;
            }
            
            if (question.correctAnswer === null || question.correctAnswer === '') {
                this.showToast(`La pregunta ${i + 1} no tiene respuesta correcta seleccionada`, 'error');
                return false;
            }
        }
        
        return true;
    }

    async saveActivity() {
        this.updateQuestionData();
        
        if (!this.validateActivity()) {
            return;
        }
        
        try {
            this.showLoading(true, 'Guardando actividad...');
            
            const activityData = {
                title: document.getElementById('activityTitle').value.trim(),
                description: document.getElementById('activityDescription').value.trim(),
                timeLimit: parseInt(document.getElementById('activityTimeLimit').value) || 30,
                type: 'listening',
                audioFile: this.audioUrl,
                questions: this.questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    points: q.points,
                    options: q.options.filter(opt => opt.trim()),
                    correctAnswer: parseInt(q.correctAnswer)
                }))
            };
            
            const response = await fetch(`/api/activities/${this.activityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData)
            });
            
            if (!response.ok) {
                throw new Error('Error al guardar la actividad');
            }
            
            const result = await response.json();
            this.showToast('Actividad guardada exitosamente', 'success');
            
            // Redirigir a la página principal después de un breve delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving activity:', error);
            this.showToast('Error al guardar la actividad. Inténtalo de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show, message = 'Cargando...') {
        const saveBtn = document.getElementById('saveActivity');
        
        if (show) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        } else {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Actividad';
        }
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
document.addEventListener('DOMContentLoaded', () => {
    new ListeningConfigurator();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
