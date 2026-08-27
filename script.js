<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pobreflix - Vingadores</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: #0a0a0a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 12px;
            padding-bottom: 80px;
        }
        .logo {
            color: #e50914;
            font-size: 24px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
        }
        .search-box {
            margin-bottom: 15px;
        }
        .search-input {
            width: 100%;
            padding: 12px 16px;
            background: #1a1a1a;
            border: 2px solid #333;
            color: #fff;
            font-size: 16px;
            border-radius: 8px;
            outline: none;
        }
        .search-input:focus {
            border-color: #e50914;
        }
        .filmes-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
        }
        .filme-card {
            background: #111;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.15s;
            border: 2px solid transparent;
        }
        .filme-card:active {
            transform: scale(0.96);
        }
        .filme-card:hover {
            border-color: #e50914;
        }
        .filme-card .filme-capa {
            width: 100%;
            aspect-ratio: 2/3;
            object-fit: cover;
            display: block;
            background: #1a1a1a;
        }
        .filme-card .filme-titulo {
            padding: 10px 8px;
            font-size: 13px;
            text-align: center;
            color: #ddd;
            font-weight: 500;
        }
        .filme-card .badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #e50914;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }
        .filme-card {
            position: relative;
        }
        .no-movies {
            text-align: center;
            padding: 40px 20px;
            color: #666;
            font-size: 16px;
            grid-column: 1 / -1;
        }
        .info-box {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding: 10px;
            background: #111;
            border-radius: 8px;
        }
        .info-box a {
            color: #e50914;
            text-decoration: none;
        }
        @media (max-width: 480px) {
            .filmes-container {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
            }
            .logo {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>

    <div class="logo">🎬 POBREFLIX</div>
    <div class="subtitle">Clique no filme para assistir</div>

    <div class="search-box">
        <input type="text" id="searchInput" placeholder="🔍 Buscar filme..." class="search-input">
    </div>

    <div id="filmesContainer" class="filmes-container"></div>

    <div class="info-box">
        💡 Os vídeos abrirão no Google Drive em uma nova janela.<br>
        Clique em "Download" ou "Abrir" para assistir.
    </div>

    <script>
        // ================================================================
        // ===== LISTA DE FILMES (ATUALIZADA COM SEUS LINKS) =====
        // ================================================================
        var FILMES = [{
            titulo: "Vingadores: Ultimato",
            capa: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCwwi.jpg",
            video: "https://drive.google.com/file/d/1box_CvQwHKNBL-graVxCbY_vqrpmpawp/view?usp=sharing",
            categoria: "acao"
        }, {
            titulo: "Vingadores: Guerra Infinita",
            capa: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
            video: "https://drive.google.com/file/d/1f0PUyQO8b6DlnIF3QES5jD0WGkZqnpGk/view?usp=drive_link",
            categoria: "acao"
        }];

        // ================================================================
        // ===== CÓDIGO PRINCIPAL =====
        // ================================================================

        var filmesContainer = document.getElementById('filmesContainer');
        var searchInput = document.getElementById('searchInput');

        // ===== RENDERIZAR FILMES =====
        function renderFilmes() {
            var html = '';
            for (var i = 0; i < FILMES.length; i++) {
                var f = FILMES[i];
                html += '<div class="filme-card" data-titulo="' + f.titulo + '" data-video="' + f.video + '">';
                html += '<img class="filme-capa" src="' + f.capa + '" alt="' + f.titulo + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/300x450?text=Sem+Capa\'">';
                html += '<div class="filme-titulo">' + f.titulo + '</div>';
                html += '</div>';
            }
            filmesContainer.innerHTML = html;

            // Adicionar eventos de clique
            var cards = document.querySelectorAll('.filme-card');
            for (var j = 0; j < cards.length; j++) {
                (function(card) {
                    card.addEventListener('click', function() {
                        var video = card.getAttribute('data-video');
                        // Abre o link do Google Drive em nova janela
                        window.open(video, '_blank');
                    });
                })(cards[j]);
            }
        }

        // ===== BUSCA =====
        searchInput.addEventListener('input', function(e) {
            var term = e.target.value.toLowerCase();
            var cards = document.querySelectorAll('.filme-card');
            for (var i = 0; i < cards.length; i++) {
                var titulo = cards[i].getAttribute('data-titulo').toLowerCase();
                if (titulo.indexOf(term) !== -1) {
                    cards[i].style.display = 'block';
                } else {
                    cards[i].style.display = 'none';
                }
            }
        });

        // ===== INICIAR =====
        renderFilmes();
        console.log('🎬 Pobreflix carregado! (' + FILMES.length + ' filmes)');
        console.log('📽️ Clique em um filme para abrir no Google Drive');
    </script>

</body>
</html>
