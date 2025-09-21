// Funcionalidad principal para la vista de estudiantes
class StudentActivity {
    constructor() {
        this.activityId = this.getActivityIdFromUrl();
        this.activity = null;
        this.answers = {};
        this.startTime = null;
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordedAudio = null;
        
        this.init();
    }

    getActivityIdFromUrl() {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1];
    }

    async init() {
        try {
            await this.loadActivity();
            this.setupEventListeners();
            this.startTimer();
        } catch (error) {
            console.error('Error initializing activity:', error);
            this.showError('Error al cargar la actividad');
        }
    }

    async loadActivity() {
        try {
            const response = await fetch(`/api/activities/${this.activityId}`);
            
            if (!response.ok) {
                throw new Error('Actividad no encontrada');
            }

            this.activity = await response.json();
            this.timeRemaining = this.activity.timeLimit * 60; // Convertir a segundos
            
            this.displayActivity();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading activity:', error);
            throw error;
        }
    }

    displayActivity() {
        // Mostrar información de la actividad
        document.getElementById('activityTitle').textContent = this.activity.title;
        document.getElementById('activityDescription').textContent = this.activity.description || 'Sin descripción';
        document.getElementById('timeLimit').textContent = this.activity.timeLimit;
        
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

        // Mostrar sección correspondiente al tipo de actividad
        this.showActivitySection(this.activity.type);
    }

    showActivitySection(type) {
        // Ocultar todas las secciones
        const sections = ['quizActivity', 'fillBlanksActivity', 'listeningActivity', 'speakingActivity'];
        sections.forEach(section => {
            document.getElementById(section).classList.add('hidden');
        });

        // Mostrar la sección correspondiente
        const sectionMap = {
            'quiz': 'quizActivity',
            'fill-blanks': 'fillBlanksActivity',
            'listening': 'listeningActivity',
            'speaking': 'speakingActivity'
        };

        const sectionId = sectionMap[type];
        if (sectionId) {
            document.getElementById(sectionId).classList.remove('hidden');
            this.setupActivityType(type);
        }
    }

    setupActivityType(type) {
        switch (type) {
            case 'quiz':
                this.setupQuizActivity();
                break;
            case 'fill-blanks':
                this.setupFillBlanksActivity();
                break;
            case 'listening':
                this.setupListeningActivity();
                break;
            case 'speaking':
                this.setupSpeakingActivity();
                break;
        }
    }

    setupQuizActivity() {
        const questionsContainer = document.getElementById('quizQuestions');
        questionsContainer.innerHTML = '';

        if (!this.activity.questions || this.activity.questions.length === 0) {
            questionsContainer.innerHTML = '<p>No hay preguntas disponibles para esta actividad.</p>';
            return;
        }

        this.activity.questions.forEach((question, index) => {
            const questionElement = this.createQuizQuestion(question, index + 1);
            questionsContainer.appendChild(questionElement);
        });
    }

    createQuizQuestion(question, questionNumber) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.innerHTML = `
            <div class="question-header">
                <span class="question-number">Pregunta ${questionNumber}</span>
                <span class="question-points">${question.points || 1} punto${(question.points || 1) > 1 ? 's' : ''}</span>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="options-container" data-question-id="${question.id}">
                ${question.options.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="question_${question.id}" value="${index}" data-question-id="${question.id}">
                        <span class="option-label">${option}</span>
                    </label>
                `).join('')}
            </div>
        `;

        return questionDiv;
    }

    setupFillBlanksActivity() {
        const textContainer = document.getElementById('fillBlanksText');
        
        if (!this.activity.text || !this.activity.blanks) {
            textContainer.innerHTML = '<p>No hay texto disponible para esta actividad.</p>';
            return;
        }

        let text = this.activity.text;
        this.activity.blanks.forEach((blank, index) => {
            const placeholder = `[${index + 1}]`;
            const inputId = `blank_${index}`;
            const input = `<input type="text" class="blank-input" id="${inputId}" data-blank-index="${index}" placeholder="Escribe aquí">`;
            text = text.replace(placeholder, input);
        });

        textContainer.innerHTML = text;
    }

    setupListeningActivity() {
        const audioContainer = document.getElementById('audioPlayer');
        const questionsContainer = document.getElementById('listeningQuestions');
        
        if (this.activity.audioFile) {
            const audioSource = document.getElementById('audioSource');
            audioSource.src = this.activity.audioFile;
            audioContainer.load();
        } else {
            audioContainer.style.display = 'none';
        }

        questionsContainer.innerHTML = '';

        if (!this.activity.questions || this.activity.questions.length === 0) {
            questionsContainer.innerHTML = '<p>No hay preguntas disponibles para esta actividad.</p>';
            return;
        }

        this.activity.questions.forEach((question, index) => {
            const questionElement = this.createQuizQuestion(question, index + 1);
            questionsContainer.appendChild(questionElement);
        });
    }

    setupSpeakingActivity() {
        const instructionsElement = document.getElementById('speakingInstructions');
        const imageElement = document.getElementById('speakingImage');
        const audioElement = document.getElementById('speakingAudio');

        if (this.activity.instructions) {
            instructionsElement.textContent = this.activity.instructions;
        }

        if (this.activity.imageFile) {
            const img = document.getElementById('speakingImageSrc');
            img.src = this.activity.imageFile;
            imageElement.classList.remove('hidden');
        }

        if (this.activity.audioFile) {
            const audioSource = document.getElementById('speakingAudioSource');
            audioSource.src = this.activity.audioFile;
            audioElement.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Event listener para el nombre del estudiante
        const studentNameInput = document.getElementById('studentName');
        studentNameInput.addEventListener('input', () => {
            this.updateSubmitButton();
        });

        // Event listeners para respuestas
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' || e.target.type === 'checkbox') {
                this.handleAnswerChange(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('blank-input')) {
                this.handleAnswerChange(e.target);
            }
        });

        // Event listener para el botón de envío
        const submitButton = document.getElementById('submitButton');
        submitButton.addEventListener('click', () => {
            this.submitActivity();
        });

        // Event listeners para grabación de audio
        this.setupRecordingEventListeners();
    }

    setupRecordingEventListeners() {
        const recordButton = document.getElementById('recordButton');
        const playRecording = document.getElementById('playRecording');
        const stopRecording = document.getElementById('stopRecording');
        const saveRecording = document.getElementById('saveRecording');

        if (recordButton) {
            recordButton.addEventListener('click', () => {
                this.toggleRecording();
            });
        }

        if (playRecording) {
            playRecording.addEventListener('click', () => {
                this.playRecordedAudio();
            });
        }

        if (stopRecording) {
            stopRecording.addEventListener('click', () => {
                this.stopRecording();
            });
        }

        if (saveRecording) {
            saveRecording.addEventListener('click', () => {
                this.saveRecording();
            });
        }
    }

    handleAnswerChange(element) {
        const questionId = element.dataset.questionId || element.dataset.blankIndex;
        const value = element.type === 'radio' ? element.value : element.value;
        
        this.answers[questionId] = value;
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const studentName = document.getElementById('studentName').value.trim();
        const hasAnswers = Object.keys(this.answers).length > 0;
        const submitButton = document.getElementById('submitButton');
        
        submitButton.disabled = !studentName || !hasAnswers;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeDisplay = document.getElementById('timeDisplay');
        const timer = document.getElementById('timer');
        
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambiar color según el tiempo restante
        timer.classList.remove('warning', 'danger');
        if (this.timeRemaining <= 300) { // 5 minutos
            timer.classList.add('danger');
        } else if (this.timeRemaining <= 600) { // 10 minutos
            timer.classList.add('warning');
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        this.showToast('¡Tiempo agotado! Enviando respuestas automáticamente...', 'warning');
        setTimeout(() => {
            this.submitActivity();
        }, 2000);
    }

    async submitActivity() {
        const studentName = document.getElementById('studentName').value.trim();
        
        if (!studentName) {
            this.showToast('Por favor, ingresa tu nombre', 'error');
            return;
        }

        if (Object.keys(this.answers).length === 0) {
            this.showToast('Por favor, responde al menos una pregunta', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Calcular puntuación
            const score = this.calculateScore();
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000 / 60); // en minutos

            const result = {
                activityId: this.activityId,
                studentName,
                answers: this.answers,
                score,
                timeSpent,
                audioFile: this.recordedAudio ? await this.uploadAudio() : null
            };

            const response = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });

            if (!response.ok) {
                throw new Error('Error al enviar respuestas');
            }

            const savedResult = await response.json();
            this.showResults(savedResult);
            
        } catch (error) {
            console.error('Error submitting activity:', error);
            this.showToast('Error al enviar las respuestas. Inténtalo de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    calculateScore() {
        if (this.activity.type === 'speaking') {
            return null; // Speaking requiere revisión manual
        }

        let totalScore = 0;
        let maxScore = 0;

        if (this.activity.questions) {
            this.activity.questions.forEach(question => {
                maxScore += question.points || 1;
                const userAnswer = this.answers[question.id];
                const correctAnswer = question.correctAnswer;
                
                if (userAnswer == correctAnswer) {
                    totalScore += question.points || 1;
                }
            });
        }

        return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    }

    showResults(result) {
        const modal = document.getElementById('resultsModal');
        const resultsContent = document.getElementById('resultsContent');
        
        const score = result.score !== null ? result.score : 'Pendiente de revisión';
        const scoreLabel = result.score !== null ? 'Puntuación' : 'Estado';
        
        resultsContent.innerHTML = `
            <div class="results-summary">
                <div class="score-display">${score}${result.score !== null ? '%' : ''}</div>
                <div class="score-label">${scoreLabel}</div>
            </div>
            
            <div class="results-details">
                <h4>Detalles de la Actividad</h4>
                <p><strong>Estudiante:</strong> ${result.studentName}</p>
                <p><strong>Actividad:</strong> ${this.activity.title}</p>
                <p><strong>Tipo:</strong> ${this.activity.type}</p>
                <p><strong>Tiempo utilizado:</strong> ${result.timeSpent} minutos</p>
            </div>
            
            <div class="card-preview">
                <h4>¡Carta Coleccionable Desbloqueada!</h4>
                <div class="character">${this.getSkillCharacter(this.activity.type)}</div>
                <div class="skill">${this.getSkillName(this.activity.type)}</div>
                <div class="score">${score}${result.score !== null ? '%' : ''}</div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        // Configurar botones del modal
        this.setupModalButtons(result);
    }

    getSkillCharacter(type) {
        const characters = {
            'quiz': '📚',
            'fill-blanks': '✍️',
            'listening': '🎧',
            'speaking': '🎤'
        };
        return characters[type] || '🎓';
    }

    getSkillName(type) {
        const names = {
            'quiz': 'Reading Master',
            'fill-blanks': 'Writing Expert',
            'listening': 'Audio Detective',
            'speaking': 'Voice Champion'
        };
        return names[type] || 'Learning Hero';
    }

    setupModalButtons(result) {
        const downloadCard = document.getElementById('downloadCard');
        const closeModal = document.getElementById('closeModal');
        
        downloadCard.addEventListener('click', () => {
            this.downloadCollectibleCard(result);
        });
        
        closeModal.addEventListener('click', () => {
            this.closeModal();
        });
    }

    downloadCollectibleCard(result) {
        // Crear y descargar la carta coleccionable
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 600;
        
        // Dibujar fondo
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 600);
        
        // Dibujar borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 396, 596);
        
        // Dibujar título
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CARTA COleccionable', 200, 50);
        
        // Dibujar personaje
        ctx.font = '80px Arial';
        ctx.fillText(this.getSkillCharacter(this.activity.type), 200, 150);
        
        // Dibujar nombre de habilidad
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillText(this.getSkillName(this.activity.type), 200, 200);
        
        // Dibujar información del estudiante
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(`Estudiante: ${result.studentName}`, 200, 250);
        ctx.fillText(`Actividad: ${this.activity.title}`, 200, 280);
        ctx.fillText(`Puntuación: ${result.score !== null ? result.score + '%' : 'Pendiente'}`, 200, 310);
        
        // Dibujar fecha
        const date = new Date().toLocaleDateString();
        ctx.fillText(`Fecha: ${date}`, 200, 350);
        
        // Descargar imagen
        const link = document.createElement('a');
        link.download = `carta_${result.studentName}_${this.activity.title}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        this.showToast('¡Carta descargada exitosamente!', 'success');
    }

    closeModal() {
        const modal = document.getElementById('resultsModal');
        modal.classList.add('hidden');
    }

    // Funciones para grabación de audio
    async toggleRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.recordedAudio = audioBlob;
                this.showRecordingControls();
            };
            
            this.mediaRecorder.start();
            this.showRecordingStatus();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast('Error al acceder al micrófono', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.hideRecordingStatus();
        }
    }

    showRecordingStatus() {
        const recordButton = document.getElementById('recordButton');
        const recordingStatus = document.getElementById('recordingStatus');
        
        recordButton.classList.add('recording');
        recordButton.innerHTML = '<i class="fas fa-stop"></i><span>Detener Grabación</span>';
        recordingStatus.classList.remove('hidden');
    }

    hideRecordingStatus() {
        const recordButton = document.getElementById('recordButton');
        const recordingStatus = document.getElementById('recordingStatus');
        
        recordButton.classList.remove('recording');
        recordButton.innerHTML = '<i class="fas fa-microphone"></i><span>Iniciar Grabación</span>';
        recordingStatus.classList.add('hidden');
    }

    showRecordingControls() {
        const controls = document.getElementById('recordingControls');
        controls.classList.remove('hidden');
    }

    playRecordedAudio() {
        if (this.recordedAudio) {
            const audio = new Audio(URL.createObjectURL(this.recordedAudio));
            audio.play();
        }
    }

    async saveRecording() {
        if (this.recordedAudio) {
            this.answers.audio = 'recorded';
            this.updateSubmitButton();
            this.showToast('Grabación guardada', 'success');
        }
    }

    async uploadAudio() {
        if (!this.recordedAudio) return null;
        
        const formData = new FormData();
        formData.append('audio', this.recordedAudio, 'recording.wav');
        
        try {
            const response = await fetch('/api/upload-audio', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.audioUrl;
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
        }
        
        return null;
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const activityContent = document.getElementById('activityContent');
        
        if (show) {
            loadingState.classList.remove('hidden');
            activityContent.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            activityContent.classList.remove('hidden');
        }
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const activityContent = document.getElementById('activityContent');
        
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
        activityContent.classList.add('hidden');
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        const activityContent = document.getElementById('activityContent');
        
        loadingState.classList.add('hidden');
        activityContent.classList.remove('hidden');
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
    new StudentActivity();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
