// ==================== FILMES (JÁ COM SEUS LINKS) ====================
var FILMES = [
    {
        titulo: "Vingadores: Ultimato",
        capa: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCwwi.jpg",
        video: "https://drive.google.com/uc?export=download&id=1Cvvm54sMf_kjHDxemJwWVaHiHQ7c2Z_m",
        categoria: "acao"
    },
    {
        titulo: "Vingadores: Guerra Infinita",
        capa: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        video: "https://drive.google.com/uc?export=download&id=1wm0s1BavDUyGyS1YV20d67_8erC_h_WN",
        categoria: "acao"
    },
    {
        titulo: "Vingadores: Era de Ultron",
        capa: "https://image.tmdb.org/t/p/w500/4ssDuvEDkSArGdy5sUaXJk4M2x4.jpg",
        video: "https://drive.google.com/uc?export=download&id=1kP93UrE46X-AZvWBkBmutopudmKPJ7JY",
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
var loading = document.getElementById('loading');
var errorMsg = document.getElementById('errorMsg');
var retryBtn = document.getElementById('retryBtn');
var movieCount = document.getElementById('movieCount');
var addMovieBtn = document.getElementById('addMovieBtn');
var addMovieModal = document.getElementById('addMovieModal');
var closeAddMovie = document.getElementById('closeAddMovie');
var addMovieForm = document.getElementById('addMovieForm');

var currentCategory = 'all';
var searchTerm = '';
var allCards = [];
var currentIndex = 0;
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

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function renderFilmes() {
    var filtered = FILMES.filter(function(filme) {
        var matchCat = currentCategory === 'all' || filme.categoria === currentCategory;
        var matchSearch = searchTerm === '' || filme.titulo.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        return matchCat && matchSearch;
    });
    
    movieCount.textContent = filtered.length + ' filmes';
    
    if (filtered.length === 0) {
        filmesContainer.innerHTML = '<div class="no-movies">🎬 Nenhum filme encontrado</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var f = filtered[i];
        var isContinue = continueWatching && continueWatching.titulo === f.titulo;
        
        html += '<div class="filme-card" data-id="' + i + '" data-titulo="' + escapeHtml(f.titulo) + '" data-video="' + escapeHtml(f.video) + '" data-capa="' + escapeHtml(f.capa) + '">';
        html += '<img class="filme-capa" src="' + f.capa + '" alt="' + escapeHtml(f.titulo) + '" loading="lazy" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'450\'%3E%3Crect width=\'300\' height=\'450\' fill=\'%231a1a1a\'/%3E%3Ctext x=\'150\' y=\'225\' text-anchor=\'middle\' fill=\'%23666\' font-size=\'20\' font-family=\'Arial\'%3ESem capa%3C/text%3E%3C/svg%3E\'">';
        
        if (isContinue) {
            html += '<span class="badge-continue">▶ CONTINUAR</span>';
        }
        
        html += '<div class="filme-titulo">' + escapeHtml(f.titulo) + '</div>';
        html += '</div>';
    }
    
    filmesContainer.innerHTML = html;
    
    allCards = document.querySelectorAll('.filme-card');
    for (var j = 0; j < allCards.length; j++) {
        (function(card) {
            card.addEventListener('click', function(e) {
                var titulo = card.getAttribute('data-titulo');
                var video = card.getAttribute('data-video');
                openPlayer(titulo, video);
            });
            
            card.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.96)';
            });
            
            card.addEventListener('touchend', function(e) {
                this.style.transform = 'scale(1)';
            });
        })(allCards[j]);
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
            console.log('Autoplay bloqueado');
        });
    }, 200);
    
    videoPlayer.removeEventListener('timeupdate', saveTimeUpdate);
    videoPlayer.addEventListener('timeupdate', saveTimeUpdate);
    
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
    videoPlayer.play().catch(function(e) {
        errorMsg.style.display = 'block';
    });
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

addMovieBtn.addEventListener('click', function() {
    addMovieModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

closeAddMovie.addEventListener('click', function() {
    addMovieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

addMovieModal.addEventListener('click', function(e) {
    if (e.target === this) {
        addMovieModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

addMovieForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    var titulo = document.getElementById('movieTitle').value.trim();
    var capa = document.getElementById('movieCapa').value.trim();
    var video = document.getElementById('movieVideo').value.trim();
    var categoria = document.getElementById('movieCategory').value;
    
    if (!titulo || !video) {
        alert('Preencha pelo menos o título e o link do vídeo!');
        return;
    }
    
    FILMES.push({
        titulo: titulo,
        capa: capa || 'https://via.placeholder.com/300x450?text=Sem+Capa',
        video: video,
        categoria: categoria
    });
    
    addMovieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    addMovieForm.reset();
    renderFilmes();
    alert('✅ Filme "' + titulo + '" adicionado com sucesso!');
});

function init() {
    loadSavedData();
    renderFilmes();
}

init();

function saveMoviesToStorage() {
    try {
        localStorage.setItem('pobreflix_filmes', JSON.stringify(FILMES));
    } catch(e) {}
}

function loadMoviesFromStorage() {
    try {
        var saved = localStorage.getItem('pobreflix_filmes');
        if (saved) {
            FILMES = JSON.parse(saved);
            renderFilmes();
        }
    } catch(e) {}
}

var originalPush = Array.prototype.push;
Array.prototype.push = function() {
    var result = originalPush.apply(this, arguments);
    saveMoviesToStorage();
    return result;
};
