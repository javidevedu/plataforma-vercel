// Funcionalidad principal de la página de inicio
class ActivityCreator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('activityForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const activityData = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            timeLimit: parseInt(formData.get('timeLimit'))
        };

        try {
            this.showLoading(true);
            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData)
            });

            if (!response.ok) {
                throw new Error('Error al crear la actividad');
            }

            const result = await response.json();
            this.showActivityCreated(result);
            this.showToast('¡Actividad creada exitosamente!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error al crear la actividad. Inténtalo de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showActivityCreated(activity) {
        const activityCreated = document.getElementById('activityCreated');
        const studentLink = document.getElementById('studentLink');
        const adminLink = document.getElementById('adminLink');
        
        // Construir URLs completas
        const baseUrl = window.location.origin;
        studentLink.value = `${baseUrl}${activity.studentLink}`;
        adminLink.value = `${baseUrl}${activity.adminLink}`;
        
        // Mostrar la sección
        activityCreated.classList.remove('hidden');
        
        // Scroll suave hacia la sección
        activityCreated.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading(show) {
        const form = document.getElementById('activityForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (show) {
            form.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
        } else {
            form.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Crear Actividad';
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

// Funciones globales para los botones
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    input.setSelectionRange(0, 99999); // Para dispositivos móviles
    
    try {
        document.execCommand('copy');
        showToast('¡Enlace copiado al portapapeles!', 'success');
    } catch (err) {
        // Fallback para navegadores modernos
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('¡Enlace copiado al portapapeles!', 'success');
        }).catch(() => {
            showToast('Error al copiar el enlace', 'error');
        });
    }
}

function goToStudentView() {
    const studentLink = document.getElementById('studentLink').value;
    if (studentLink) {
        window.open(studentLink, '_blank');
    }
}

function goToAdminView() {
    const adminLink = document.getElementById('adminLink').value;
    if (adminLink) {
        window.open(adminLink, '_blank');
    }
}

function createNewActivity() {
    // Ocultar sección de actividad creada
    document.getElementById('activityCreated').classList.add('hidden');
    
    // Limpiar formulario
    document.getElementById('activityForm').reset();
    
    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función global para mostrar toast (usada por otras funciones)
function showToast(message, type = 'success') {
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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ActivityCreator();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
    showToast('Ha ocurrido un error inesperado', 'error');
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
    showToast('Error de conexión. Verifica tu internet.', 'error');
});
