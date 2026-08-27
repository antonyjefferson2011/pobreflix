// ==================== FILMES COM LINKS FUNCIONANDO ====================
var FILMES = [
    {
        titulo: "Vingadores: Ultimato",
        capa: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCwwi.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        categoria: "acao"
    },
    {
        titulo: "Vingadores: Guerra Infinita",
        capa: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        categoria: "acao"
    },
    {
        titulo: "Vingadores: Era de Ultron",
        capa: "https://image.tmdb.org/t/p/w500/4ssDuvEDkSArGdy5sUaXJk4M2x4.jpg",
        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4",
        categoria: "acao"
    }
];

// ==================== CÓDIGO PRINCIPAL ====================
var filmesContainer = document.getElementById('filmesContainer');
var searchInput = document.getElementById('searchInput');
var playerModal = document.getElementById('playerModal');
var videoPlayer = document.getElementById('videoPlayer');
var videoTitle = document.getElementById('videoTitle');
var closePlayer = document.getElementById('closePlayer');
var errorMsg = document.getElementById('errorMsg');
var retryBtn = document.getElementById('retryBtn');
var movieCount = document.getElementById('movieCount');

var currentCategory = 'all';
var searchTerm = '';
var allCards = [];
var continueWatching = null;

function loadSavedData() {
    try {
        var saved = localStorage.getItem('pobreflix_continue');
        if (saved) {
            continueWatching = JSON.parse(saved);
        }
    } catch(e) {}
}

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

function renderFilmes() {
    var filtered = [];
    for (var i = 0; i < FILMES.length; i++) {
        var filme = FILMES[i];
        var matchCat = currentCategory === 'all' || filme.categoria === currentCategory;
        var matchSearch = searchTerm === '' || filme.titulo.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        if (matchCat && matchSearch) {
            filtered.push(filme);
        }
    }
    
    movieCount.textContent = filtered.length + ' filmes';
    
    if (filtered.length === 0) {
        filmesContainer.innerHTML = '<div class="no-movies">🎬 Nenhum filme encontrado</div>';
        return;
    }
    
    var html = '';
    for (var j = 0; j < filtered.length; j++) {
        var f = filtered[j];
        var isContinue = continueWatching && continueWatching.titulo === f.titulo;
        
        html += '<div class="filme-card" data-titulo="' + f.titulo + '" data-video="' + f.video + '">';
        html += '<img class="filme-capa" src="' + f.capa + '" alt="' + f.titulo + '">';
        if (isContinue) {
            html += '<span class="badge-continue">▶ CONTINUAR</span>';
        }
        html += '<div class="filme-titulo">' + f.titulo + '</div>';
        html += '</div>';
    }
    
    filmesContainer.innerHTML = html;
    
    allCards = document.querySelectorAll('.filme-card');
    for (var k = 0; k < allCards.length; k++) {
        (function(card) {
            card.addEventListener('click', function() {
                var titulo = card.getAttribute('data-titulo');
                var video = card.getAttribute('data-video');
                openPlayer(titulo, video);
            });
        })(allCards[k]);
    }
}

function openPlayer(titulo, videoUrl) {
    videoTitle.textContent = titulo;
    videoPlayer.src = videoUrl;
    playerModal.style.display = 'flex';
    errorMsg.style.display = 'none';
    document.body.style.overflow = 'hidden';
    
    setTimeout(function() {
        videoPlayer.play().catch(function(e) {
            console.log('Clique no play para começar');
        });
    }, 300);
    
    videoPlayer.removeEventListener('timeupdate', saveTimeUpdate);
    videoPlayer.addEventListener('timeupdate', saveTimeUpdate);
}

function saveTimeUpdate() {
    if (videoPlayer.currentTime > 5) {
        var titulo = videoTitle.textContent;
        for (var i = 0; i < FILMES.length; i++) {
            if (FILMES[i].titulo === titulo) {
                saveProgress(i, videoPlayer.currentTime);
                break;
            }
        }
    }
}

function closePlayerModal() {
    videoPlayer.pause();
    videoPlayer.src = '';
    playerModal.style.display = 'none';
    errorMsg.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleVideoError() {
    errorMsg.style.display = 'block';
}

function retryVideo() {
    errorMsg.style.display = 'none';
    videoPlayer.load();
    setTimeout(function() {
        videoPlayer.play().catch(function(e) {
            errorMsg.style.display = 'block';
        });
    }, 300);
}

// Eventos
var searchTimeout;
searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        searchTerm = e.target.value;
        renderFilmes();
    }, 300);
});

var categories = document.querySelectorAll('.category');
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

closePlayer.addEventListener('click', closePlayerModal);

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && playerModal.style.display === 'flex') {
        closePlayerModal();
    }
});

videoPlayer.addEventListener('error', handleVideoError);
retryBtn.addEventListener('click', retryVideo);

function init() {
    loadSavedData();
    renderFilmes();
}

init();
