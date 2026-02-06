// ========================================
// VARIABLES GLOBALES ET CONFIGURATION
// ========================================

// Configuration du mot de passe (à personnaliser)
const CORRECT_PASSWORD = "amoureuse"; // Remplace par ton mot de passe

// Configuration WhatsApp (à personnaliser avec ton numéro)
const WHATSAPP_NUMBER = "33612345678"; // Format: code pays + numéro sans le 0

// Configuration du nombre de musiques (de 1.mp3 à 20.mp3 dans le dossier "musiques")
const MUSIC_COUNT = 20; // Nombre total de musiques disponibles

// Nom du fichier de musique de fond (doit être dans le même dossier que index.html)
const BACKGROUND_MUSIC = "musique-fond.mp3"; // Change le nom si nécessaire

// Compteur d'erreurs pour les messages humoristiques
let errorCount = 0;

// Index actuel du carrousel (quelle carte est au centre)
let currentCarouselIndex = 0;

// État du lecteur audio
let currentTrack = null;
let audioPlayer = null;

// Lecteur de musique de fond
let backgroundAudio = null;

// ========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌸 Application chargée avec succès!');
    
    // Lance la musique de fond
    initBackgroundMusic();
    
    // Démarre l'animation de galaxie
    initGalaxy();
    
    // Génère les pétales qui tombent en arrière-plan
    createFallingPetals();
    
    // Configure tous les gestionnaires d'événements
    setupEventListeners();
    
    // Initialise le carrousel 3D
    updateCarousel();
    
    // Configure le lecteur audio
    audioPlayer = document.getElementById('audioPlayer');
    
    // Génère dynamiquement les pistes du jukebox
    generateJukeboxTracks();
});

// ========================================
// MUSIQUE DE FOND
// ========================================

function initBackgroundMusic() {
    backgroundAudio = new Audio(BACKGROUND_MUSIC);
    backgroundAudio.loop = true; // Joue en boucle
    backgroundAudio.volume = 0.3; // Volume à 30% pour ne pas couvrir les autres sons
    
    // Tente de lancer la musique automatiquement
    // Note: certains navigateurs bloquent l'autoplay, on gère donc l'échec
    const playPromise = backgroundAudio.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Autoplay bloqué par le navigateur. La musique se lancera au premier clic.');
            // Si l'autoplay est bloqué, on lance la musique au premier clic de l'utilisateur
            document.body.addEventListener('click', function startOnClick() {
                backgroundAudio.play();
                document.body.removeEventListener('click', startOnClick);
            }, { once: true });
        });
    }
}

// ========================================
// GÉNÉRATION DYNAMIQUE DES PISTES DU JUKEBOX
// ========================================

function generateJukeboxTracks() {
    const playlist = document.querySelector('.playlist');
    playlist.innerHTML = ''; // Vide la playlist existante
    
    // Génère une piste pour chaque musique (de 1 à MUSIC_COUNT)
    for (let i = 1; i <= MUSIC_COUNT; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track';
        trackDiv.setAttribute('data-src', `musiques/${i}.mp3`);
        
        trackDiv.innerHTML = `
            <span class="track-name">Musique ${i}</span>
            <button class="play-btn">▶</button>
        `;
        
        playlist.appendChild(trackDiv);
        
        // Ajoute l'événement de clic pour cette piste
        const playBtn = trackDiv.querySelector('.play-btn');
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const src = trackDiv.getAttribute('data-src');
            togglePlayTrack(trackDiv, src);
        });
    }
}

// ========================================
// ANIMATION DE GALAXIE (ÉCRAN D'INTRO)
// ========================================

function initGalaxy() {
    const canvas = document.getElementById('galaxyCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ajuste le canvas à la taille de la fenêtre
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Crée un tableau de particules (étoiles) avec positions et vitesses aléatoires
    const particles = [];
    const particleCount = 200;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random()
        });
    }
    
    // Fonction d'animation qui dessine et déplace les particules
    function animate() {
        // Efface le canvas avec un fond légèrement transparent pour effet de traînée
        ctx.fillStyle = 'rgba(26, 0, 51, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dessine et met à jour chaque particule
        particles.forEach(particle => {
            // Dessine la particule avec un dégradé radial rose/violet
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius
            );
            gradient.addColorStop(0, `rgba(255, 182, 217, ${particle.opacity})`);
            gradient.addColorStop(1, `rgba(186, 85, 211, ${particle.opacity * 0.3})`);
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Déplace la particule
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Si la particule sort de l'écran, la replace de l'autre côté
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Variation de l'opacité pour effet de scintillement
            particle.opacity += (Math.random() - 0.5) * 0.02;
            particle.opacity = Math.max(0.3, Math.min(1, particle.opacity));
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Après 4.5 secondes, transition automatique vers l'écran de login
    setTimeout(() => {
        switchScreen('introScreen', 'loginScreen');
    }, 4500);
}

// ========================================
// ANIMATION DES PÉTALES QUI TOMBENT
// ========================================

function createFallingPetals() {
    const container = document.getElementById('petalsContainer');
    const petalCount = 30; // Nombre de pétales à l'écran
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        // Position et timing aléatoires pour chaque pétale
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 5 + 8) + 's';
        petal.style.animationDelay = Math.random() * 5 + 's';
        petal.style.opacity = Math.random() * 0.5 + 0.3;
        
        container.appendChild(petal);
    }
}

// ========================================
// GESTION DES TRANSITIONS D'ÉCRANS
// ========================================

function switchScreen(currentScreenId, nextScreenId) {
    const currentScreen = document.getElementById(currentScreenId);
    const nextScreen = document.getElementById(nextScreenId);
    
    // Fade out de l'écran actuel
    currentScreen.style.opacity = '0';
    
    setTimeout(() => {
        currentScreen.classList.remove('active');
        nextScreen.classList.add('active');
        
        // Fade in du nouvel écran
        setTimeout(() => {
            nextScreen.style.opacity = '1';
        }, 50);
    }, 600);
}

// ========================================
// CONFIGURATION DES ÉVÉNEMENTS
// ========================================

function setupEventListeners() {
    // ÉCRAN DE LOGIN
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');
    
    // Validation par clic sur le bouton
    loginBtn.addEventListener('click', checkPassword);
    
    // Validation par touche Entrée
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // CARROUSEL
    document.getElementById('prevBtn').addEventListener('click', () => rotateCarousel(-1));
    document.getElementById('nextBtn').addEventListener('click', () => rotateCarousel(1));
    
    // CARTES DU CARROUSEL
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const modalType = this.getAttribute('data-modal');
            openModal(modalType);
        });
    });
    
    // FERMETURE DES MODALS
    document.getElementById('closeModal').addEventListener('click', closeContentModal);
    document.getElementById('closeJukebox').addEventListener('click', closeJukeboxModal);
    document.getElementById('closeReponse').addEventListener('click', closeReponseModal);
    
    // Fermeture en cliquant sur le fond noir
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // BOUTON WHATSAPP
    document.getElementById('sendWhatsapp').addEventListener('click', sendToWhatsApp);
}

// ========================================
// SYSTÈME DE LOGIN AVEC MESSAGES D'ERREUR
// ========================================

function checkPassword() {
    const input = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('errorMessage');
    const password = input.value.trim();
    
    if (password === CORRECT_PASSWORD) {
        // Mot de passe correct : accès au menu principal
        errorMsg.textContent = '✨ Bienvenue mon amour ! ✨';
        errorMsg.style.color = '#00cc00';
        
        setTimeout(() => {
            switchScreen('loginScreen', 'menuScreen');
        }, 1000);
    } else {
        // Mot de passe incorrect : incrémente le compteur et affiche un message
        errorCount++;
        input.value = '';
        
        // Messages progressifs qui révèlent petit à petit le mot de passe
        const progressiveMessages = [
            '❌ Essai 1/10 : Mauvais mot de passe. Réfléchis bien...',
            '🤔 Essai 2/10 : Encore raté ! Pense à ce qu\'on se dit souvent...',
            '😅 Essai 3/10 : Toujours pas ! Indice : ça commence par "' + CORRECT_PASSWORD.charAt(0).toUpperCase() + '"',
            '💭 Essai 4/10 : Hmm... Les deux premières lettres sont "' + CORRECT_PASSWORD.substring(0, 2).toUpperCase() + '"',
            '🎯 Essai 5/10 : Tu progresses ! Voici : "' + CORRECT_PASSWORD.substring(0, 3).toUpperCase() + '..."',
            '😊 Essai 6/10 : Continue ! "' + CORRECT_PASSWORD.substring(0, 4).toUpperCase() + '..."',
            '🌟 Essai 7/10 : Presque ! "' + CORRECT_PASSWORD.substring(0, 5).toUpperCase() + '..."',
            '💕 Essai 8/10 : Tu y es presque : "' + CORRECT_PASSWORD.substring(0, 6).toUpperCase() + '..."',
            '✨ Essai 9/10 : Encore un peu : "' + CORRECT_PASSWORD.substring(0, Math.min(7, CORRECT_PASSWORD.length)).toUpperCase() + '..."',
            '🎁 Essai 10/10 : Le mot de passe est : "' + CORRECT_PASSWORD.toUpperCase() + '" ! Entre-le maintenant 😊'
        ];
        
        // Affiche le message correspondant à l'essai actuel
        if (errorCount <= 10) {
            errorMsg.textContent = progressiveMessages[errorCount - 1];
            errorMsg.style.color = errorCount < 10 ? '#ff4444' : '#ff8800';
        } else {
            // Au-delà de 10 essais, on rappelle le mot de passe
            errorMsg.textContent = '💝 Le mot de passe est toujours : "' + CORRECT_PASSWORD.toUpperCase() + '"';
            errorMsg.style.color = '#ff8800';
        }
        
        // Animation de secousse sur le champ de saisie
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

// ========================================
// CARROUSEL 3D CIRCULAIRE
// ========================================

function rotateCarousel(direction) {
    // Change l'index de la carte centrale
    currentCarouselIndex += direction;
    
    // Assure que l'index reste dans les limites (0 à 4)
    if (currentCarouselIndex < 0) currentCarouselIndex = 4;
    if (currentCarouselIndex > 4) currentCarouselIndex = 0;
    
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const cards = document.querySelectorAll('.card');
    const radius = 350; // Rayon du cercle sur lequel sont disposées les cartes
    const angleStep = 360 / cards.length; // 72° entre chaque carte
    
    cards.forEach((card, index) => {
        // Calcule l'angle de la carte en fonction de sa position relative
        const angle = (index - currentCarouselIndex) * angleStep;
        const angleRad = (angle * Math.PI) / 180;
        
        // Calcule les positions X et Z dans l'espace 3D
        const x = Math.sin(angleRad) * radius;
        const z = Math.cos(angleRad) * radius;
        
        // Applique la transformation 3D à la carte
        card.style.transform = `
            translateX(${x}px) 
            translateZ(${z}px) 
            rotateY(${-angle}deg)
        `;
        
        // Ajuste l'opacité et l'échelle selon la distance
        if (index === currentCarouselIndex) {
            // Carte centrale : pleine opacité et légèrement plus grande
            card.style.opacity = '1';
            card.style.zIndex = '10';
        } else {
            // Cartes latérales : plus transparentes
            card.style.opacity = '0.6';
            card.style.zIndex = '5';
        }
    });
}

// ========================================
// SYSTÈME DE MODALS (FENÊTRES POPUP)
// ========================================

function openModal(modalType) {
    switch(modalType) {
        case 'histoire':
            openContentModal('Notre Histoire 📖', `
                <h3>Le début de notre aventure</h3>
                <p>Tout a commencé un jour où nos regards se sont croisés. Ce moment magique où le temps s'est arrêté et où j'ai su que tu étais spéciale.</p>
                
                <h3>Les moments inoubliables</h3>
                <p>Chaque instant passé avec toi est gravé dans mon cœur. Nos rires, nos conversations qui durent des heures, nos silences complices... Tout est précieux.</p>
                
                <h3>Notre aujourd'hui et notre demain</h3>
                <p>Chaque jour avec toi est une nouvelle page de notre belle histoire. Et je ne peux pas attendre de découvrir tous les chapitres qui nous attendent encore.</p>
                
                <p style="text-align: center; margin-top: 30px; font-style: italic; color: #ff69b4;">
                    "Avec toi, chaque moment ordinaire devient extraordinaire. ❤️"
                </p>
            `);
            break;
            
        case 'cadeaux':
            openContentModal('Tes Cadeaux 🎁', `
                <h3>Des surprises rien que pour toi</h3>
                <p>Parce que tu mérites ce qu'il y a de mieux, j'ai préparé quelques petites attentions qui, je l'espère, te feront sourire.</p>
                
                <h3>🌹 Premier cadeau</h3>
                <p>Un bouquet de tes fleurs préférées t'attend. Chaque pétale représente un moment où tu as illuminé ma vie.</p>
                
                <h3>💝 Deuxième cadeau</h3>
                <p>Une journée entière rien qu'à nous deux, pour faire tout ce dont tu rêves. C'est toi qui décides de tout !</p>
                
                <h3>✨ Troisième cadeau</h3>
                <p>Mon temps, mon attention, mon écoute... Et surtout, mon amour inconditionnel, aujourd'hui et pour toujours.</p>
                
                <p style="text-align: center; margin-top: 30px; font-style: italic; color: #ff69b4;">
                    "Le plus beau cadeau, c'est d'avoir quelqu'un comme toi dans ma vie. 💖"
                </p>
            `);
            break;
            
        case 'mots':
            openContentModal('Mots Doux 💌', `
                <h3>Ce que je veux te dire</h3>
                <p>Il y a des choses que je ne dis pas assez souvent, alors aujourd'hui je prends le temps de te les écrire.</p>
                
                <h3>Tu es exceptionnelle</h3>
                <p>Ta gentillesse, ton sourire, ta force, ta douceur... Tout en toi me fascine. Tu es cette personne rare qui rend le monde meilleur simplement en y étant.</p>
                
                <h3>Tu me rends meilleur</h3>
                <p>Grâce à toi, je veux être la meilleure version de moi-même. Tu m'inspires chaque jour à donner le meilleur de moi.</p>
                
                <h3>Tu es aimée</h3>
                <p>Plus que les mots ne peuvent l'exprimer. Plus que les gestes ne peuvent le montrer. Tu es aimée d'un amour sincère, profond et véritable.</p>
                
                <p style="text-align: center; margin-top: 30px; font-style: italic; color: #ff69b4;">
                    "Dans un monde plein de possibilités, c'est toi que j'ai choisi. Chaque jour. ❤️"
                </p>
            `);
            break;
            
        case 'jukebox':
            openJukeboxModal();
            break;
            
        case 'reponse':
            openReponseModal();
            break;
    }
}

// Modal générique avec contenu texte
function openContentModal(title, content) {
    const modal = document.getElementById('contentModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `<h2 class="modal-title">${title}</h2>${content}`;
    modal.classList.add('show');
}

function closeContentModal() {
    document.getElementById('contentModal').classList.remove('show');
}

// Modal du Juke-box
function openJukeboxModal() {
    document.getElementById('jukeboxModal').classList.add('show');
}

function closeJukeboxModal() {
    document.getElementById('jukeboxModal').classList.remove('show');
    // Arrête la musique si elle joue
    if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        updatePlayButtons();
    }
}

// Modal de réponse
function openReponseModal() {
    document.getElementById('reponseModal').classList.add('show');
}

function closeReponseModal() {
    document.getElementById('reponseModal').classList.remove('show');
}

// ========================================
// LECTEUR AUDIO (JUKE-BOX)
// ========================================

function togglePlayTrack(trackElement, src) {
    const allTracks = document.querySelectorAll('.track');
    const playBtn = trackElement.querySelector('.play-btn');
    
    // Si on clique sur la piste déjà en cours de lecture
    if (currentTrack === src && !audioPlayer.paused) {
        // Met en pause
        audioPlayer.pause();
        playBtn.textContent = '▶';
        trackElement.classList.remove('playing');
        return;
    }
    
    // Arrête toute autre piste en cours
    if (currentTrack !== src) {
        allTracks.forEach(t => {
            t.classList.remove('playing');
            t.querySelector('.play-btn').textContent = '▶';
        });
    }
    
    // Lance la nouvelle piste
    currentTrack = src;
    audioPlayer.src = src;
    audioPlayer.play();
    
    // Met à jour l'interface
    playBtn.textContent = '⏸';
    trackElement.classList.add('playing');
    
    // Quand la musique se termine, réinitialise l'interface
    audioPlayer.onended = function() {
        playBtn.textContent = '▶';
        trackElement.classList.remove('playing');
    };
}

function updatePlayButtons() {
    const allTracks = document.querySelectorAll('.track');
    allTracks.forEach(track => {
        track.classList.remove('playing');
        track.querySelector('.play-btn').textContent = '▶';
    });
}

// ========================================
// ENVOI SUR WHATSAPP
// ========================================

function sendToWhatsApp() {
    const message = document.getElementById('responseText').value;
    
    if (!message.trim()) {
        alert('Écris-moi quelque chose d\'abord ! 😊');
        return;
    }
    
    // Encode le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crée le lien WhatsApp avec le numéro et le message pré-rempli
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Ouvre WhatsApp dans un nouvel onglet
    window.open(whatsappURL, '_blank');
}

// ========================================
// GESTION DU REDIMENSIONNEMENT
// ========================================

window.addEventListener('resize', function() {
    // Réajuste le canvas de la galaxie si on redimensionne la fenêtre
    const canvas = document.getElementById('galaxyCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Animation CSS de secousse pour les erreurs de login (définie via JS pour éviter conflits)
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
