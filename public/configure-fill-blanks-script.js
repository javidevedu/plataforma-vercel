// Funcionalidad para configurar Fill in the Blanks
class FillBlanksConfigurator {
    constructor() {
        this.blanks = [];
        this.blankCounter = 0;
        this.activityId = this.getActivityIdFromUrl();
        
        this.init();
    }

    getActivityIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('activityId');
    }

    init() {
        this.setupEventListeners();
        this.addBlank(); // Agregar primer espacio por defecto
    }

    setupEventListeners() {
        // Botones principales
        document.getElementById('addBlank').addEventListener('click', () => {
            this.addBlank();
        });

        document.getElementById('clearBlanks').addEventListener('click', () => {
            this.clearBlanks();
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

        // Event listeners delegados para elementos dinámicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-blank')) {
                this.removeBlank(e.target.closest('.blank-item'));
            }
        });

        // Event listeners para cambios en inputs
        document.addEventListener('input', (e) => {
            if (e.target.id === 'activityText') {
                this.updateBlanksFromText();
            } else if (e.target.classList.contains('correct-answer') ||
                       e.target.classList.contains('blank-hint') ||
                       e.target.classList.contains('blank-points')) {
                this.updateBlankData();
            }
        });
    }

    addBlank() {
        this.blankCounter++;
        const blankIndex = this.blankCounter;
        
        const template = document.getElementById('blankTemplate');
        const blankElement = template.content.cloneNode(true);
        
        const blankItem = blankElement.querySelector('.blank-item');
        blankItem.dataset.blankIndex = blankIndex;
        blankItem.querySelector('.blank-number').textContent = this.blanks.length + 1;
        
        // Agregar al contenedor
        const container = document.getElementById('blanksContainer');
        container.appendChild(blankElement);
        
        // Agregar al array de espacios
        this.blanks.push({
            index: blankIndex,
            correctAnswer: '',
            hint: '',
            points: 1
        });
        
        this.updateBlankNumbers();
        this.showToast('Espacio agregado', 'success');
    }

    removeBlank(blankItem) {
        if (this.blanks.length <= 1) {
            this.showToast('Debe haber al menos un espacio en blanco', 'warning');
            return;
        }
        
        const blankIndex = parseInt(blankItem.dataset.blankIndex);
        this.blanks = this.blanks.filter(b => b.index !== blankIndex);
        blankItem.remove();
        
        this.updateBlankNumbers();
        this.updateTextBlanks();
        this.showToast('Espacio eliminado', 'success');
    }

    clearBlanks() {
        if (this.blanks.length === 0) {
            this.showToast('No hay espacios para limpiar', 'info');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres eliminar todos los espacios en blanco?')) {
            return;
        }
        
        this.blanks = [];
        this.blankCounter = 0;
        
        const container = document.getElementById('blanksContainer');
        container.innerHTML = '';
        
        this.updateTextBlanks();
        this.showToast('Espacios eliminados', 'success');
    }

    updateBlankNumbers() {
        const blankItems = document.querySelectorAll('.blank-item');
        blankItems.forEach((item, index) => {
            item.querySelector('.blank-number').textContent = index + 1;
        });
    }

    updateBlanksFromText() {
        const text = document.getElementById('activityText').value;
        const blankMatches = text.match(/\[(\d+)\]/g);
        
        if (!blankMatches) {
            return;
        }
        
        const blankNumbers = blankMatches.map(match => parseInt(match.replace(/[\[\]]/g, '')));
        const maxBlankNumber = Math.max(...blankNumbers);
        
        // Agregar espacios faltantes
        while (this.blanks.length < maxBlankNumber) {
            this.addBlank();
        }
        
        // Remover espacios sobrantes
        while (this.blanks.length > maxBlankNumber) {
            const lastBlank = document.querySelector('.blank-item:last-child');
            if (lastBlank) {
                this.removeBlank(lastBlank);
            }
        }
    }

    updateTextBlanks() {
        const text = document.getElementById('activityText').value;
        const blankNumbers = this.blanks.map((blank, index) => index + 1);
        
        // Reemplazar todos los [número] con [1], [2], [3], etc.
        let newText = text;
        const existingBlanks = text.match(/\[(\d+)\]/g);
        
        if (existingBlanks) {
            existingBlanks.forEach((blank, index) => {
                if (index < blankNumbers.length) {
                    newText = newText.replace(blank, `[${blankNumbers[index]}]`);
                }
            });
        }
        
        document.getElementById('activityText').value = newText;
    }

    updateBlankData() {
        const blankItems = document.querySelectorAll('.blank-item');
        
        blankItems.forEach((blankItem, index) => {
            const blankIndex = parseInt(blankItem.dataset.blankIndex);
            const blankData = this.blanks.find(b => b.index === blankIndex);
            
            if (blankData) {
                blankData.correctAnswer = blankItem.querySelector('.correct-answer').value;
                blankData.hint = blankItem.querySelector('.blank-hint').value;
                blankData.points = parseInt(blankItem.querySelector('.blank-points').value) || 1;
            }
        });
    }

    showPreview() {
        this.updateBlankData();
        
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
        const text = document.getElementById('activityText').value;
        
        let previewText = text;
        
        // Reemplazar [número] con inputs de vista previa
        this.blanks.forEach((blank, index) => {
            const placeholder = `[${index + 1}]`;
            const input = `<input type="text" class="preview-blank-input" placeholder="Escribe aquí" disabled>`;
            previewText = previewText.replace(placeholder, input);
        });
        
        return `
            <div class="preview-activity">
                <h2>${title}</h2>
                <p>${description}</p>
                <p><strong>Tiempo límite:</strong> ${timeLimit} minutos</p>
                <div class="preview-text">
                    <h3>Instrucciones:</h3>
                    <p>Completa los espacios en blanco con las palabras correctas.</p>
                    <div class="text-content">
                        ${previewText}
                    </div>
                </div>
                <div class="preview-blanks-info">
                    <h3>Espacios en blanco:</h3>
                    <ul>
                        ${this.blanks.map((blank, index) => `
                            <li>
                                <strong>Espacio ${index + 1}:</strong> 
                                ${blank.hint ? `Pista: ${blank.hint}` : 'Sin pista'} 
                                (${blank.points} punto${blank.points > 1 ? 's' : ''})
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    validateActivity() {
        const title = document.getElementById('activityTitle').value.trim();
        if (!title) {
            this.showToast('Por favor, ingresa un título para la actividad', 'error');
            return false;
        }
        
        const text = document.getElementById('activityText').value.trim();
        if (!text) {
            this.showToast('Por favor, ingresa el texto de la actividad', 'error');
            return false;
        }
        
        if (this.blanks.length === 0) {
            this.showToast('Debe haber al menos un espacio en blanco', 'error');
            return false;
        }
        
        for (let i = 0; i < this.blanks.length; i++) {
            const blank = this.blanks[i];
            
            if (!blank.correctAnswer.trim()) {
                this.showToast(`El espacio ${i + 1} no tiene respuesta correcta`, 'error');
                return false;
            }
        }
        
        // Verificar que el texto contenga los marcadores de espacios
        const textBlanks = text.match(/\[(\d+)\]/g);
        if (!textBlanks || textBlanks.length !== this.blanks.length) {
            this.showToast('El número de espacios en el texto no coincide con los espacios configurados', 'error');
            return false;
        }
        
        return true;
    }

    async saveActivity() {
        this.updateBlankData();
        
        if (!this.validateActivity()) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const activityData = {
                title: document.getElementById('activityTitle').value.trim(),
                description: document.getElementById('activityDescription').value.trim(),
                timeLimit: parseInt(document.getElementById('activityTimeLimit').value) || 30,
                type: 'fill-blanks',
                text: document.getElementById('activityText').value.trim(),
                blanks: this.blanks.map((blank, index) => ({
                    index: index + 1,
                    correctAnswer: blank.correctAnswer.trim(),
                    hint: blank.hint.trim(),
                    points: blank.points
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

    showLoading(show) {
        const saveBtn = document.getElementById('saveActivity');
        
        if (show) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
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
    new FillBlanksConfigurator();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
