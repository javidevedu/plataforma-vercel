// Funcionalidad para las cartas coleccionables
class CollectibleCards {
    constructor() {
        this.cards = [];
        this.filteredCards = [];
        this.studentName = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón para cargar cartas
        document.getElementById('loadCards').addEventListener('click', () => {
            this.loadCards();
        });

        // Enter en el input de nombre
        document.getElementById('studentName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadCards();
            }
        });

        // Filtros
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('scoreFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('downloadCard').addEventListener('click', () => {
            this.downloadCard();
        });

        document.getElementById('shareCard').addEventListener('click', () => {
            this.shareCard();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('cardModal').addEventListener('click', (e) => {
            if (e.target.id === 'cardModal') {
                this.closeModal();
            }
        });
    }

    async loadCards() {
        const studentName = document.getElementById('studentName').value.trim();
        
        if (!studentName) {
            this.showToast('Por favor, ingresa tu nombre', 'error');
            return;
        }

        this.studentName = studentName;

        try {
            this.showLoading(true);
            
            // Simular carga de cartas (en una implementación real, esto vendría de una API)
            await this.fetchStudentCards(studentName);
            
            if (this.cards.length === 0) {
                this.showNoCards();
            } else {
                this.displayCards();
                this.updateStats();
            }

        } catch (error) {
            console.error('Error loading cards:', error);
            this.showToast('Error al cargar las cartas', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchStudentCards(studentName) {
        // En una implementación real, esto haría una llamada a la API
        // Por ahora, simularemos datos de ejemplo
        const mockCards = [
            {
                id: '1',
                studentName: studentName,
                activityTitle: 'Quiz de Historia Antigua',
                activityType: 'quiz',
                score: 85,
                date: '2024-01-15',
                submittedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: '2',
                studentName: studentName,
                activityTitle: 'Completar el texto sobre el clima',
                activityType: 'fill-blanks',
                score: 92,
                date: '2024-01-16',
                submittedAt: '2024-01-16T14:20:00Z'
            },
            {
                id: '3',
                studentName: studentName,
                activityTitle: 'Listening sobre el medio ambiente',
                activityType: 'listening',
                score: 78,
                date: '2024-01-17',
                submittedAt: '2024-01-17T09:15:00Z'
            },
            {
                id: '4',
                studentName: studentName,
                activityTitle: 'Describe la imagen',
                activityType: 'speaking',
                score: null, // Pendiente de revisión
                date: '2024-01-18',
                submittedAt: '2024-01-18T16:45:00Z'
            }
        ];

        // Filtrar solo las cartas del estudiante
        this.cards = mockCards.filter(card => 
            card.studentName.toLowerCase() === studentName.toLowerCase()
        );
        
        this.filteredCards = [...this.cards];
    }

    displayCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        cardsGrid.innerHTML = '';

        if (this.filteredCards.length === 0) {
            cardsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron cartas</h3>
                    <p>No hay cartas que coincidan con los filtros aplicados.</p>
                </div>
            `;
            return;
        }

        this.filteredCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardsGrid.appendChild(cardElement);
        });

        // Mostrar el contenido de cartas
        document.getElementById('cardsContent').classList.remove('hidden');
        document.getElementById('noCardsState').classList.add('hidden');
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card-item ${card.activityType}`;
        cardDiv.dataset.cardId = card.id;
        
        const characters = {
            'quiz': '📚',
            'fill-blanks': '✍️',
            'listening': '🎧',
            'speaking': '🎤'
        };
        
        const skillNames = {
            'quiz': 'Reading Master',
            'fill-blanks': 'Writing Expert',
            'listening': 'Audio Detective',
            'speaking': 'Voice Champion'
        };

        const scoreDisplay = card.score !== null ? `${card.score}%` : 'Pendiente';
        const scoreClass = this.getScoreClass(card.score);
        
        cardDiv.innerHTML = `
            <div class="card-badge">${this.getTypeLabel(card.activityType)}</div>
            <div class="card-header">
                <span class="card-character">${characters[card.activityType]}</span>
                <div class="card-skill">${skillNames[card.activityType]}</div>
                <p class="card-title">${card.activityTitle}</p>
            </div>
            <div class="card-body">
                <div class="card-student">${card.studentName}</div>
                <div class="card-activity">${card.activityTitle}</div>
                <div class="card-score ${scoreClass}">${scoreDisplay}</div>
                <p class="card-date">${new Date(card.date).toLocaleDateString()}</p>
            </div>
        `;

        // Event listener para mostrar detalle
        cardDiv.addEventListener('click', () => {
            this.showCardDetail(card);
        });

        return cardDiv;
    }

    getTypeLabel(type) {
        const labels = {
            'quiz': 'Reading',
            'fill-blanks': 'Writing',
            'listening': 'Listening',
            'speaking': 'Speaking'
        };
        return labels[type] || 'Activity';
    }

    getScoreClass(score) {
        if (score === null) return 'score-pending';
        if (score >= 90) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 50) return 'score-fair';
        return 'score-poor';
    }

    showCardDetail(card) {
        const modal = document.getElementById('cardModal');
        const cardDetail = document.getElementById('cardDetail');
        
        const characters = {
            'quiz': '📚',
            'fill-blanks': '✍️',
            'listening': '🎧',
            'speaking': '🎤'
        };
        
        const skillNames = {
            'quiz': 'Reading Master',
            'fill-blanks': 'Writing Expert',
            'listening': 'Audio Detective',
            'speaking': 'Voice Champion'
        };

        const scoreDisplay = card.score !== null ? `${card.score}%` : 'Pendiente de revisión';
        
        cardDetail.innerHTML = `
            <div class="card-preview ${card.activityType}">
                <div class="card-character">${characters[card.activityType]}</div>
                <div class="card-skill">${skillNames[card.activityType]}</div>
                <div class="card-score">${scoreDisplay}</div>
            </div>
            
            <div class="card-info">
                <h4>Información de la Carta</h4>
                <p><strong>Estudiante:</strong> ${card.studentName}</p>
                <p><strong>Actividad:</strong> ${card.activityTitle}</p>
                <p><strong>Tipo:</strong> ${this.getTypeLabel(card.activityType)}</p>
                <p><strong>Puntuación:</strong> ${scoreDisplay}</p>
                <p><strong>Fecha:</strong> ${new Date(card.date).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> ${new Date(card.submittedAt).toLocaleTimeString()}</p>
            </div>
        `;
        
        // Guardar referencia a la carta actual
        this.currentCard = card;
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('cardModal');
        modal.classList.add('hidden');
        this.currentCard = null;
    }

    async downloadCard() {
        if (!this.currentCard) return;

        try {
            const response = await fetch('/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentName: this.currentCard.studentName,
                    activityTitle: this.currentCard.activityTitle,
                    activityType: this.currentCard.activityType,
                    score: this.currentCard.score,
                    date: this.currentCard.date
                })
            });

            if (!response.ok) {
                throw new Error('Error al generar la carta');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carta_${this.currentCard.studentName}_${this.currentCard.activityTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showToast('Carta descargada exitosamente', 'success');

        } catch (error) {
            console.error('Error downloading card:', error);
            this.showToast('Error al descargar la carta', 'error');
        }
    }

    shareCard() {
        if (!this.currentCard) return;

        const shareText = `¡Mira mi carta coleccionable! 🎓\n\n` +
            `Actividad: ${this.currentCard.activityTitle}\n` +
            `Tipo: ${this.getTypeLabel(this.currentCard.activityType)}\n` +
            `Puntuación: ${this.currentCard.score !== null ? this.currentCard.score + '%' : 'Pendiente'}\n\n` +
            `¡Completa actividades para obtener más cartas!`;

        if (navigator.share) {
            navigator.share({
                title: 'Mi Carta Coleccionable',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('Texto copiado al portapapeles', 'success');
            }).catch(() => {
                this.showToast('Error al compartir', 'error');
            });
        }
    }

    applyFilters() {
        const typeFilter = document.getElementById('typeFilter').value;
        const scoreFilter = document.getElementById('scoreFilter').value;

        this.filteredCards = this.cards.filter(card => {
            // Filtro por tipo
            if (typeFilter !== 'all' && card.activityType !== typeFilter) {
                return false;
            }

            // Filtro por puntuación
            if (scoreFilter !== 'all') {
                if (scoreFilter === 'excellent' && (card.score === null || card.score < 90)) return false;
                if (scoreFilter === 'good' && (card.score === null || card.score < 70 || card.score >= 90)) return false;
                if (scoreFilter === 'fair' && (card.score === null || card.score < 50 || card.score >= 70)) return false;
                if (scoreFilter === 'poor' && (card.score === null || card.score >= 50)) return false;
            }

            return true;
        });

        this.displayCards();
    }

    updateStats() {
        const totalCards = this.cards.length;
        const scoredCards = this.cards.filter(card => card.score !== null);
        const averageScore = scoredCards.length > 0 
            ? Math.round(scoredCards.reduce((sum, card) => sum + card.score, 0) / scoredCards.length)
            : 0;
        const excellentCards = this.cards.filter(card => card.score !== null && card.score >= 90).length;

        document.getElementById('totalCards').textContent = totalCards;
        document.getElementById('averageScore').textContent = `${averageScore}%`;
        document.getElementById('excellentCards').textContent = excellentCards;
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const cardsContent = document.getElementById('cardsContent');
        const noCardsState = document.getElementById('noCardsState');
        
        if (show) {
            loadingState.classList.remove('hidden');
            cardsContent.classList.add('hidden');
            noCardsState.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
        }
    }

    showNoCards() {
        const noCardsState = document.getElementById('noCardsState');
        const cardsContent = document.getElementById('cardsContent');
        
        noCardsState.classList.remove('hidden');
        cardsContent.classList.add('hidden');
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
    new CollectibleCards();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});
