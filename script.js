// État global
let currentStyle = 'simple';
let currentResult = '';
let isProcessing = false;

// Sélection du style avec animation
function selectStyle(style) {
    currentStyle = style;
    
    document.querySelectorAll('.style-chip').forEach(chip => {
        chip.classList.remove('active');
        chip.classList.add('bg-white/10');
    });
    
    const activeChip = document.querySelector(`[data-style="${style}"]`);
    activeChip.classList.add('active');
    activeChip.classList.remove('bg-white/10');
    
    activeChip.style.transform = 'scale(0.95)';
    setTimeout(() => {
        activeChip.style.transform = '';
    }, 150);
}

// Compteur de mots avec animation
function updateWordCount() {
    const text = document.getElementById('originalText').value;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const wordSpan = document.getElementById('originalWordCount');
    
    wordSpan.style.transform = 'scale(1.1)';
    wordSpan.innerText = wordCount;
    setTimeout(() => {
        wordSpan.style.transform = '';
    }, 200);
}

// Écouteur pour le compteur
document.getElementById('originalText').addEventListener('input', updateWordCount);

// Effacer le texte
function clearText() {
    document.getElementById('originalText').value = '';
    updateWordCount();
    
    const textarea = document.getElementById('originalText');
    textarea.style.transform = 'scale(0.99)';
    setTimeout(() => {
        textarea.style.transform = '';
    }, 200);
}

// Fonction principale de reformulation
async function reformatText() {
    if (isProcessing) return;
    
    const originalText = document.getElementById('originalText').value;
    
    if (!originalText.trim()) {
        showNotification('Veuillez entrer un texte à reformuler', 'error');
        return;
    }
    
    isProcessing = true;
    showLoading();
    
    try {
        const response = await fetch('/.netlify/functions/reformulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText, style: currentStyle })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentResult = data.result;
            displayResult(data.result, data.corrections);
            showNotification('Texte transformé avec succès ! ✨', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion à l\'IA', 'error');
        // Fallback en mode démo
        simulateReformat(originalText);
    } finally {
        hideLoading();
        isProcessing = false;
    }
}

// Affichage du résultat avec animation
function displayResult(text, corrections) {
    const resultArea = document.getElementById('resultArea');
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    resultArea.style.opacity = '0';
    resultArea.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        resultArea.innerHTML = `
            <div class="result-card">
                <div class="prose max-w-none text-gray-300 leading-relaxed">
                    ${text.split('\n').map(para => `<p class="mb-3">${escapeHtml(para)}</p>`).join('')}
                </div>
            </div>
        `;
        
        resultArea.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        resultArea.style.opacity = '1';
        resultArea.style.transform = 'translateY(0)';
    }, 50);
    
    const resultWordSpan = document.getElementById('resultWordCount');
    resultWordSpan.innerText = wordCount;
    resultWordSpan.style.transform = 'scale(1.1)';
    setTimeout(() => {
        resultWordSpan.style.transform = '';
    }, 200);
    
    displayCorrections(corrections);
}

// Affichage des corrections
function displayCorrections(corrections) {
    const correctionsDiv = document.getElementById('corrections');
    
    if (corrections && corrections.length > 0) {
        correctionsDiv.innerHTML = `
            <div class="text-xs">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-check-circle text-green-400 text-xs"></i>
                    <span class="font-medium text-gray-300">Corrections effectuées :</span>
                </div>
                ${corrections.slice(0, 2).map(c => `
                    <div class="correction-badge px-3 py-2 rounded-lg text-xs">
                        <i class="fas fa-edit mr-2"></i>
                        ${escapeHtml(c)}
                    </div>
                `).join('')}
                ${corrections.length > 2 ? `<div class="text-gray-500 text-xs mt-1">+ ${corrections.length - 2} autres corrections</div>` : ''}
            </div>
        `;
    } else {
        correctionsDiv.innerHTML = `
            <div class="flex items-center gap-2 text-xs text-green-400">
                <i class="fas fa-check-circle"></i>
                <span>Texte impeccable - aucune faute détectée</span>
            </div>
        `;
    }
}

// Simulation pour développement (fallback)
function simulateReformat(originalText) {
    const styles = {
        academic: {
            prefix: "Selon notre analyse approfondie, ",
            suffix: " Cette observation s'inscrit dans une perspective académique rigoureuse."
        },
        simple: {
            prefix: "Voici en mots simples : ",
            suffix: " C'est plus facile à comprendre ainsi."
        },
        pro: {
            prefix: "En termes professionnels, ",
            suffix: " Cette formulation optimise l'impact business."
        }
    };
    
    const style = styles[currentStyle];
    const result = style.prefix + originalText.toLowerCase() + style.suffix;
    const corrections = [
        `Adaptation au style ${currentStyle}`,
        `Amélioration de la fluidité et de la syntaxe`
    ];
    
    displayResult(result, corrections);
}

// Copier le résultat
async function copyResult() {
    if (!currentResult) {
        showNotification('Aucun texte à copier', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentResult);
        showNotification('Texte copié dans le presse-papier !', 'success');
        
        const copyBtn = document.getElementById('copyBtn');
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copié !';
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
        }, 2000);
    } catch (err) {
        showNotification('Erreur lors de la copie', 'error');
    }
}

// Traduction
async function translateText() {
    if (!currentResult) {
        showNotification('Aucun texte à traduire', 'error');
        return;
    }
    
    showNotification('Traduction en cours...', 'info');
    
    try {
        const response = await fetch('/.netlify/functions/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: currentResult, targetLang: 'en' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Traduction disponible !', 'success');
            alert(`Traduction anglaise :\n\n${data.translated}`);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        // Fallback
        const translated = `[English Translation]\n\n${currentResult.substring(0, 300)}...`;
        alert(translated);
        showNotification('Mode démo traduction', 'info');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-500 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
}

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    selectStyle('simple');
    updateWordCount();
    
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});