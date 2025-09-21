// Funcionalidad para configurar Speaking
class SpeakingConfigurator {
    constructor() {
        this.activityId = this.getActivityIdFromUrl();
        this.imageFile = null;
        this.imageUrl = null;
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
    }

    setupEventListeners() {
        // Botones principales
        document.getElementById('previewActivity').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('closePreview').addEventListener('click', () => {
            this.hidePreview();
        });

        document.getElementById('saveActivity').addEventListener('click', () => {
            this.saveActivity();
        });

        // Cambio de tipo de prompt
        document.querySelectorAll('input[name="promptType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePromptTypeChange(e.target.value);
            });
        });

        // Upload de imagen
        document.getElementById('imageFile').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        document.getElementById('removeImage').addEventListener('click', () => {
            this.removeImage();
        });

        // Upload de audio
        document.getElementById('audioFile').addEventListener('change', (e) => {
            this.handleAudioUpload(e.target.files[0]);
        });

        document.getElementById('removeAudio').addEventListener('click', () => {
            this.removeAudio();
        });
    }

    handlePromptTypeChange(type) {
        // Ocultar todas las configuraciones
        document.getElementById('textPrompt').classList.add('hidden');
        document.getElementById('imagePrompt').classList.add('hidden');
        document.getElementById('audioPrompt').classList.add('hidden');

        // Mostrar la configuración correspondiente
        switch (type) {
            case 'text':
                document.getElementById('textPrompt').classList.remove('hidden');
                break;
            case 'image':
                document.getElementById('imagePrompt').classList.remove('hidden');
                break;
            case 'audio':
                document.getElementById('audioPrompt').classList.remove('hidden');
                break;
        }
    }

    async handleImageUpload(file) {
        if (!file) return;

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Tipo de archivo no válido. Solo se permiten imágenes.', 'error');
            return;
        }

        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('La imagen es demasiado grande. Máximo 5MB.', 'error');
            return;
        }

        try {
            this.showLoading(true, 'Subiendo imagen...');

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const result = await response.json();
            this.imageFile = file;
            this.imageUrl = result.imageUrl;
            
            this.showImagePreview(file, result);
            this.showToast('Imagen subida exitosamente', 'success');

        } catch (error) {
            console.error('Error uploading image:', error);
            this.showToast('Error al subir la imagen', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showImagePreview(file, uploadResult) {
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const fileName = document.getElementById('imageFileName');
        const fileSize = document.getElementById('imageFileSize');

        // Configurar la imagen
        previewImage.src = this.imageUrl;
        previewImage.alt = file.name;

        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        preview.classList.remove('hidden');
    }

    removeImage() {
        this.imageFile = null;
        this.imageUrl = null;
        
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const fileInput = document.getElementById('imageFile');

        preview.classList.add('hidden');
        previewImage.src = '';
        fileInput.value = '';

        this.showToast('Imagen removida', 'success');
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
            this.showLoading(true, 'Subiendo audio...');

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

    showPreview() {
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
        const promptType = document.querySelector('input[name="promptType"]:checked').value;
        
        let html = `
            <div class="preview-activity">
                <h2>${title}</h2>
                <p>${description}</p>
                <p><strong>Tiempo límite:</strong> ${timeLimit} minutos</p>
                
                <div class="preview-prompt">
                    <h3>Instrucciones:</h3>
        `;

        switch (promptType) {
            case 'text':
                const instructions = document.getElementById('speakingInstructions').value;
                html += `<p>${instructions || 'Sin instrucciones específicas'}</p>`;
                break;
                
            case 'image':
                if (this.imageUrl) {
                    html += `
                        <div class="preview-image">
                            <img src="${this.imageUrl}" alt="Imagen de referencia" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        </div>
                    `;
                }
                const imageInstructions = document.getElementById('imageInstructions').value;
                if (imageInstructions) {
                    html += `<p>${imageInstructions}</p>`;
                }
                break;
                
            case 'audio':
                if (this.audioUrl) {
                    html += `
                        <div class="preview-audio">
                            <audio controls style="width: 100%; max-width: 500px;">
                                <source src="${this.audioUrl}" type="audio/mpeg">
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        </div>
                    `;
                }
                const audioInstructions = document.getElementById('audioInstructions').value;
                if (audioInstructions) {
                    html += `<p>${audioInstructions}</p>`;
                }
                break;
        }

        html += `
                </div>
                
                <div class="preview-recording">
                    <h3>Grabación:</h3>
                    <p>Los estudiantes grabarán su respuesta usando el micrófono de su dispositivo.</p>
                    <div class="recording-preview">
                        <button class="btn btn-primary" disabled>
                            <i class="fas fa-microphone"></i> Iniciar Grabación
                        </button>
                        <p><small>Esta es una vista previa. Los estudiantes podrán grabar su respuesta.</small></p>
                    </div>
                </div>
                
                <div class="preview-criteria">
                    <h3>Criterios de Evaluación:</h3>
                    <ul>
        `;

        // Mostrar criterios seleccionados
        const fluencyCriteria = Array.from(document.querySelectorAll('input[name="fluency"]:checked')).map(cb => cb.value);
        const contentCriteria = Array.from(document.querySelectorAll('input[name="content"]:checked')).map(cb => cb.value);
        const structureCriteria = Array.from(document.querySelectorAll('input[name="structure"]:checked')).map(cb => cb.value);

        if (fluencyCriteria.length > 0) {
            html += '<li><strong>Fluidez:</strong> ' + fluencyCriteria.join(', ') + '</li>';
        }
        if (contentCriteria.length > 0) {
            html += '<li><strong>Contenido:</strong> ' + contentCriteria.join(', ') + '</li>';
        }
        if (structureCriteria.length > 0) {
            html += '<li><strong>Estructura:</strong> ' + structureCriteria.join(', ') + '</li>';
        }

        const evaluationNotes = document.getElementById('evaluationNotes').value;
        if (evaluationNotes) {
            html += `<li><strong>Notas adicionales:</strong> ${evaluationNotes}</li>`;
        }

        html += `
                    </ul>
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

        const promptType = document.querySelector('input[name="promptType"]:checked').value;
        
        if (promptType === 'image' && !this.imageUrl) {
            this.showToast('Por favor, sube una imagen de referencia', 'error');
            return false;
        }
        
        if (promptType === 'audio' && !this.audioUrl) {
            this.showToast('Por favor, sube un archivo de audio de referencia', 'error');
            return false;
        }

        // Verificar que al menos un criterio esté seleccionado
        const selectedCriteria = document.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCriteria.length === 0) {
            this.showToast('Por favor, selecciona al menos un criterio de evaluación', 'error');
            return false;
        }

        return true;
    }

    async saveActivity() {
        if (!this.validateActivity()) {
            return;
        }
        
        try {
            this.showLoading(true, 'Guardando actividad...');
            
            const promptType = document.querySelector('input[name="promptType"]:checked').value;
            
            const activityData = {
                title: document.getElementById('activityTitle').value.trim(),
                description: document.getElementById('activityDescription').value.trim(),
                timeLimit: parseInt(document.getElementById('activityTimeLimit').value) || 30,
                type: 'speaking',
                promptType: promptType,
                instructions: document.getElementById('speakingInstructions').value.trim(),
                imageFile: this.imageUrl,
                audioFile: this.audioUrl,
                imageInstructions: document.getElementById('imageInstructions').value.trim(),
                audioInstructions: document.getElementById('audioInstructions').value.trim(),
                evaluationCriteria: {
                    fluency: Array.from(document.querySelectorAll('input[name="fluency"]:checked')).map(cb => cb.value),
                    content: Array.from(document.querySelectorAll('input[name="content"]:checked')).map(cb => cb.value),
                    structure: Array.from(document.querySelectorAll('input[name="structure"]:checked')).map(cb => cb.value)
                },
                evaluationNotes: document.getElementById('evaluationNotes').value.trim()
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
    new SpeakingConfigurator();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
