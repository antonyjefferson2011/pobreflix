// LISTA DE FILMES - FÁCIL DE EDITAR
var FILMES = [
    {
        titulo: "Velozes e Furiosos 10",
        capa: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        categoria: "acao"
    },
    {
        titulo: "A Era do Gelo",
        capa: "https://image.tmdb.org/t/p/w500/gLEhJcMZgE5d5T8C6E5hK9vXv7U.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        categoria: "comedia"
    },
    {
        titulo: "Interestelar",
        capa: "https://image.tmdb.org/t/p/w500/rAiYTfCCqDpZcckGxWU5d5HkX8M.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4",
        categoria: "ficcao"
    },
    {
        titulo: "O Poderoso Chefão",
        capa: "https://image.tmdb.org/t/p/w500/rPdtLWN11ZgA3KvhO4T1w2v7X5V.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        categoria: "drama"
    },
    {
        titulo: "Vingadores: Ultimato",
        capa: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCwwi.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        categoria: "acao"
    },
    {
        titulo: "Meu Malvado Favorito",
        capa: "https://image.tmdb.org/t/p/w500/5K2ZpXh2P6L2wXq4x5mH6qJ8j7K.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        categoria: "comedia"
    }
];

// Variáveis globais
var filmesContainer = document.getElementById('filmesContainer');
var searchInput = document.getElementById('searchInput');
var playerModal = document.getElementById('playerModal');
var videoPlayer = document.getElementById('videoPlayer');
var videoTitle = document.getElementById('videoTitle');
var closePlayer = document.getElementById('closePlayer');
var loading = document.getElementById('loading');
var errorMsg = document.getElementById('errorMsg');
var retryBtn = document.getElementById('retryBtn');
var currentVideo = '';
var currentIndex = 0;
var allCards = [];

// Categorias
var categories = document.querySelectorAll('.category');
var currentCategory = 'all';
var searchTerm = '';

// LocalStorage para "continuar assistindo"
var continueWatching = null;

// Carregar dados salvos
function loadSavedData() {
    try {
        var saved = localStorage.getItem('pobreflix_continue');
        if (saved) {
            continueWatching = JSON.parse(saved);
        }
    } catch(e) {
        console.log('Erro ao carregar dados');
    }
}

// Salvar progresso
function saveProgress(filmeId, time) {
    try {
        var data = {
            filmeId: filmeId,
            time: time,
            titulo: FILMES[filmeId].titulo
        };
        localStorage.setItem('pobreflix_continue', JSON.stringify(data));
        continueWatching = data;
    } catch(e) {}
}

// Renderizar filmes com lazy loading
function renderFilmes() {
    var filtered = FILMES.filter(function(filme) {
        var matchCat = currentCategory === 'all' || filme.categoria === currentCategory;
        var matchSearch = searchTerm === '' || filme.titulo.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        return matchCat && matchSearch;
    });
    
    if (filtered.length === 0) {
        filmesContainer.innerHTML = '<div style="text-align:center;padding:50px;">Nenhum filme encontrado</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var f = filtered[i];
        html += '<div class="filme-card" data-id="' + i + '" data-titulo="' + escapeHtml(f.titulo) + '" data-video="' + escapeHtml(f.video) + '" data-capa="' + escapeHtml(f.capa) + '" tabindex="0">';
        html += '<img class="filme-capa" src="' + f.capa + '" alt="' + escapeHtml(f.titulo) + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/300x450?text=ERRO\'">';
        html += '<div class="filme-titulo">' + escapeHtml(f.titulo) + '</div>';
        html += '</div>';
    }
    
    filmesContainer.innerHTML = html;
    
    // Reaplicar eventos
    allCards = document.querySelectorAll('.filme-card');
    for (var j = 0; j < allCards.length; j++) {
        (function(card) {
            card.addEventListener('click', function(e) {
                var titulo = card.getAttribute('data-titulo');
                var video = card.getAttribute('data-video');
                openPlayer(titulo, video);
            });
        })(allCards[j]);
    }
    
    // Destacar continuar assistindo
    highlightContinueWatching();
}

// Função auxiliar para evitar XSS
function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Destacar filme para continuar assistindo
function highlightContinueWatching() {
    if (!continueWatching) return;
    
    var cards = document.querySelectorAll('.filme-card');
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var titulo = card.getAttribute('data-titulo');
        if (titulo === continueWatching.titulo) {
            card.style.border = '3px solid #e50914';
            var badge = document.createElement('div');
            badge.style.position = 'absolute';
            badge.style.background = '#e50914';
            badge.style.color = 'white';
            badge.style.padding = '2px 8px';
            badge.style.fontSize = '12px';
            badge.innerText = 'CONTINUAR';
            card.style.position = 'relative';
            card.appendChild(badge);
        }
    }
}

// Abrir player
function openPlayer(titulo, videoUrl) {
    currentVideo = videoUrl;
    videoTitle.innerText = titulo;
    videoPlayer.src = videoUrl;
    playerModal.style.display = 'flex';
    errorMsg.style.display = 'none';
    
    // Tentar dar play automaticamente
    setTimeout(function() {
        videoPlayer.play().catch(function(e) {
            console.log('Autoplay bloqueado:', e);
            // Mostrar controles para usuário iniciar manualmente
        });
    }, 100);
    
    // Adicionar evento de timeupdate para salvar progresso
    videoPlayer.removeEventListener('timeupdate', saveTimeUpdate);
    videoPlayer.addEventListener('timeupdate', saveTimeUpdate);
    
    // Encontrar índice do filme
    for (var i = 0; i < FILMES.length; i++) {
        if (FILMES[i].video === videoUrl) {
            currentIndex = i;
            break;
        }
    }
}

function saveTimeUpdate() {
    if (videoPlayer.currentTime > 5) {
        saveProgress(currentIndex, videoPlayer.currentTime);
    }
}

// Fechar player
function closePlayerModal() {
    videoPlayer.pause();
    videoPlayer.src = '';
    playerModal.style.display = 'none';
    errorMsg.style.display = 'none';
}

// Tratar erro de vídeo
function handleVideoError() {
    errorMsg.style.display = 'block';
}

function retryVideo() {
    errorMsg.style.display = 'none';
    videoPlayer.load();
    videoPlayer.play().catch(function(e) {
        errorMsg.style.display = 'block';
    });
}

// Pesquisa com debounce simples
var searchTimeout;
searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        searchTerm = e.target.value;
        renderFilmes();
    }, 300);
});

// Categorias
for (var i = 0; i < categories.length; i++) {
    (function(cat) {
        cat.addEventListener('click', function() {
            var selected = this.getAttribute('data-cat');
            for (var j = 0; j < categories.length; j++) {
                categories[j].classList.remove('active');
            }
            this.classList.add('active');
            currentCategory = selected;
            renderFilmes();
        });
    })(categories[i]);
}

// Navegação por teclado (controle remoto)
document.addEventListener('keydown', function(e) {
    var key = e.key;
    var activeElement = document.activeElement;
    
    // Fechar modal com ESC
    if (key === 'Escape' && playerModal.style.display === 'flex') {
        closePlayerModal();
        return;
    }
    
    // Fechar modal com Backspace em TVs
    if (key === 'Backspace' && playerModal.style.display === 'flex') {
        e.preventDefault();
        closePlayerModal();
        return;
    }
    
    // Navegação nos cards
    if (playerModal.style.display !== 'flex' && allCards.length > 0) {
        if (key === 'ArrowRight') {
            e.preventDefault();
            var next = getNextFocusable(activeElement, allCards, 1);
            if (next) next.focus();
        } else if (key === 'ArrowLeft') {
            e.preventDefault();
            var prev = getNextFocusable(activeElement, allCards, -1);
            if (prev) prev.focus();
        } else if (key === 'ArrowDown') {
            e.preventDefault();
            var down = getVerticalFocus(activeElement, allCards, 1);
            if (down) down.focus();
        } else if (key === 'ArrowUp') {
            e.preventDefault();
            var up = getVerticalFocus(activeElement, allCards, -1);
            if (up) up.focus();
        } else if (key === 'Enter') {
            e.preventDefault();
            if (activeElement && activeElement.classList && activeElement.classList.contains('filme-card')) {
                var titulo = activeElement.getAttribute('data-titulo');
                var video = activeElement.getAttribute('data-video');
                openPlayer(titulo, video);
            }
        }
    }
});

// Funções auxiliares de navegação
function getNextFocusable(current, items, direction) {
    if (!current || !current.classList || !current.classList.contains('filme-card')) {
        return items[0];
    }
    var currentIndex = -1;
    for (var i = 0; i < items.length; i++) {
        if (items[i] === current) {
            currentIndex = i;
            break;
        }
    }
    var newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;
    return items[newIndex];
}

function getVerticalFocus(current, items, direction) {
    if (!current) return items[0];
    
    var currentRect = current.getBoundingClientRect();
    var bestMatch = null;
    var bestDistance = Infinity;
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemRect = item.getBoundingClientRect();
        var horizontalOverlap = (currentRect.left < itemRect.right && currentRect.right > itemRect.left);
        
        if (horizontalOverlap) {
            var verticalDiff = direction === 1 ? itemRect.top - currentRect.top : currentRect.top - itemRect.top;
            if (verticalDiff > 0 && verticalDiff < bestDistance) {
                bestDistance = verticalDiff;
                bestMatch = item;
            }
        }
    }
    
    return bestMatch || items[0];
}

// Eventos do player
closePlayer.addEventListener('click', closePlayerModal);
videoPlayer.addEventListener('error', handleVideoError);
retryBtn.addEventListener('click', retryVideo);

// Inicializar
function init() {
    loadSavedData();
    renderFilmes();
    
    // Focar no primeiro card
    setTimeout(function() {
        if (allCards.length > 0) {
            allCards[0].focus();
        }
    }, 100);
}

// Iniciar aplicação
init();
