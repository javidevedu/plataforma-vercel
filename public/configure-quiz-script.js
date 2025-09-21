// Funcionalidad para configurar quizzes
class QuizConfigurator {
    constructor() {
        this.questions = [];
        this.questionCounter = 0;
        this.activityId = this.getActivityIdFromUrl();
        
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

        document.getElementById('previewQuiz').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('closePreview').addEventListener('click', () => {
            this.hidePreview();
        });

        document.getElementById('saveQuiz').addEventListener('click', () => {
            this.saveQuiz();
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
        
        if (!this.validateQuiz()) {
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
        const title = document.getElementById('quizTitle').value || 'Quiz sin título';
        const description = document.getElementById('quizDescription').value || 'Sin descripción';
        const timeLimit = document.getElementById('quizTimeLimit').value || 30;
        
        let html = `
            <div class="preview-quiz">
                <h2>${title}</h2>
                <p>${description}</p>
                <p><strong>Tiempo límite:</strong> ${timeLimit} minutos</p>
                <div class="preview-questions">
        `;
        
        this.questions.forEach((question, index) => {
            if (question.text && question.options.length >= 2) {
                html += `
                    <div class="preview-question">
                        <h3>Pregunta ${index + 1} (${question.points} punto${question.points > 1 ? 's' : ''})</h3>
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

    validateQuiz() {
        const title = document.getElementById('quizTitle').value.trim();
        if (!title) {
            this.showToast('Por favor, ingresa un título para el quiz', 'error');
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

    async saveQuiz() {
        this.updateQuestionData();
        
        if (!this.validateQuiz()) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const quizData = {
                title: document.getElementById('quizTitle').value.trim(),
                description: document.getElementById('quizDescription').value.trim(),
                timeLimit: parseInt(document.getElementById('quizTimeLimit').value) || 30,
                type: 'quiz',
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
                body: JSON.stringify(quizData)
            });
            
            if (!response.ok) {
                throw new Error('Error al guardar el quiz');
            }
            
            const result = await response.json();
            this.showToast('Quiz guardado exitosamente', 'success');
            
            // Redirigir a la página principal después de un breve delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving quiz:', error);
            this.showToast('Error al guardar el quiz. Inténtalo de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const saveBtn = document.getElementById('saveQuiz');
        
        if (show) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Quiz';
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
    new QuizConfigurator();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
