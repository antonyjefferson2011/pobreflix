/*
  POBREFLIX - script.js
  JavaScript puro, sem frameworks, sem frescura.
  Compatível com navegadores antigos (LG webOS).
*/

/* ==============================
   LISTA DE FILMES
   Adicione seus filmes aqui.
   - arquivo: nome do arquivo sem extensão (ex: "titan")
   - titulo: nome exibido na tela
   - capa: true se tiver .jpg em /capas, false para ícone
============================== */
var FILMES = [
  { arquivo: "lula",        titulo: "transformes 4" },

  /* Adicione mais filmes aqui no mesmo formato */
];

/* ==============================
   VARIÁVEIS GLOBAIS
============================== */
var cards = [];          // lista de elementos DOM dos cards
var indiceAtual = 0;     // card com foco atual
var totalCards = 0;
var cardsPerRow = 0;

/* ==============================
   ELEMENTOS DO DOM
============================== */
var elCatalogo    = document.getElementById("catalogo");
var elTelaPlayer  = document.getElementById("tela-player");
var elTelaCat     = document.getElementById("tela-catalogo");
var elVideo       = document.getElementById("video");
var elTituloPlay  = document.getElementById("titulo-player");
var elBtnVoltar   = document.getElementById("btn-voltar");

/* ==============================
   INICIALIZAÇÃO
============================== */
function init() {
  renderCatalogo();
  cards = elCatalogo.querySelectorAll(".card");
  totalCards = cards.length;

  if (totalCards === 0) return;

  calcCardsPerRow();
  focarCard(0);

  document.addEventListener("keydown", onKeyDown);
  elBtnVoltar.addEventListener("click", fecharPlayer);
  elBtnVoltar.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) fecharPlayer(); // ENTER
  });

  // Recalcula colunas se a janela mudar (improvável na TV, mas seguro)
  window.onresize = calcCardsPerRow;
}

/* ==============================
   RENDERIZAR CATÁLOGO
============================== */
function renderCatalogo() {
  var html = "";
  for (var i = 0; i < FILMES.length; i++) {
    var f = FILMES[i];
    var capaHtml = '<img class="card-capa" src="capas/' + f.arquivo + '.jpg" alt="' + f.titulo + '" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'
                 + '<div class="card-sem-capa" style="display:none">&#9654;</div>';

    html += '<div class="card" tabindex="0" data-index="' + i + '" data-arquivo="' + f.arquivo + '" data-titulo="' + f.titulo + '">'
          +   capaHtml
          +   '<div class="card-titulo">' + f.titulo + '</div>'
          + '</div>';
  }
  elCatalogo.innerHTML = html;

  // Eventos de clique nos cards
  var cardEls = elCatalogo.querySelectorAll(".card");
  for (var j = 0; j < cardEls.length; j++) {
    (function(el) {
      el.addEventListener("click", function() {
        abrirFilme(el.getAttribute("data-arquivo"), el.getAttribute("data-titulo"));
      });
      el.addEventListener("focus", function() {
        var idx = parseInt(el.getAttribute("data-index"), 10);
        indiceAtual = idx;
        destacarCard(idx);
      });
    })(cardEls[j]);
  }
}

/* ==============================
   CALCULAR COLUNAS
============================== */
function calcCardsPerRow() {
  if (totalCards === 0) return;
  var primeiro = cards[0];
  var containerLeft = elCatalogo.getBoundingClientRect().left;
  var cardWidth = primeiro.getBoundingClientRect().width;
  var containerWidth = elCatalogo.clientWidth;

  // Estima colunas pela largura total / largura do card + gap
  cardsPerRow = Math.max(1, Math.floor(containerWidth / (cardWidth + 28)));
}

/* ==============================
   FOCO E NAVEGAÇÃO
============================== */
function focarCard(idx) {
  if (idx < 0 || idx >= totalCards) return;
  indiceAtual = idx;
  destacarCard(idx);
  cards[idx].focus();
  scrollParaCard(idx);
}

function destacarCard(idx) {
  for (var i = 0; i < totalCards; i++) {
    cards[i].classList.remove("ativo");
  }
  if (cards[idx]) cards[idx].classList.add("ativo");
}

function scrollParaCard(idx) {
  if (cards[idx]) {
    cards[idx].scrollIntoView({ block: "nearest", behavior: "auto" });
  }
}

/* ==============================
   TECLAS DO CONTROLE REMOTO
============================== */
function onKeyDown(e) {
  var key = e.keyCode;

  // Se player aberto
  if (!elTelaPlayer.classList.contains("oculto")) {
    if (key === 8 || key === 27 || key === 461) { // BACK / ESC / LG Back
      fecharPlayer();
      e.preventDefault();
    }
    return;
  }

  // Catálogo
  switch (key) {
    case 37: // Seta esquerda
      moverFoco(-1);
      e.preventDefault();
      break;
    case 39: // Seta direita
      moverFoco(1);
      e.preventDefault();
      break;
    case 38: // Seta cima
      moverFoco(-cardsPerRow);
      e.preventDefault();
      break;
    case 40: // Seta baixo
      moverFoco(cardsPerRow);
      e.preventDefault();
      break;
    case 13: // ENTER / OK
      abrirFilmeAtual();
      e.preventDefault();
      break;
    case 8:  // BACK (alguns navegadores)
    case 27: // ESC
    case 461:// LG webOS Back
      // No catálogo, não faz nada especial
      break;
  }
}

function moverFoco(delta) {
  var novo = indiceAtual + delta;
  if (novo < 0) novo = 0;
  if (novo >= totalCards) novo = totalCards - 1;
  focarCard(novo);
}

/* ==============================
   ABRIR FILME
============================== */
function abrirFilmeAtual() {
  if (!cards[indiceAtual]) return;
  var arquivo = cards[indiceAtual].getAttribute("data-arquivo");
  var titulo  = cards[indiceAtual].getAttribute("data-titulo");
  abrirFilme(arquivo, titulo);
}

function abrirFilme(arquivo, titulo) {
  elTituloPlay.textContent = titulo;
  elVideo.src = "filmes/" + arquivo + ".mp4";
  elVideo.load();

  elTelaPlayer.classList.remove("oculto");
  elTelaCat.style.display = "none";

  // Tenta tela cheia
  tentarTelaCheia();

  // Foca o vídeo para controle pelo controle remoto
  setTimeout(function() {
    elVideo.focus();
    elVideo.play();
  }, 100);
}

function fecharPlayer() {
  elVideo.pause();
  elVideo.src = "";

  elTelaPlayer.classList.add("oculto");
  elTelaCat.style.display = "";

  sairTelaCheia();

  // Retorna foco ao card que estava selecionado
  setTimeout(function() {
    focarCard(indiceAtual);
  }, 50);
}

/* ==============================
   TELA CHEIA (compatível)
============================== */
function tentarTelaCheia() {
  var el = document.documentElement;
  try {
    if (el.requestFullscreen)            el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
  } catch(e) { /* TV pode não suportar */ }
}

function sairTelaCheia() {
  try {
    if (document.exitFullscreen)            document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
    else if (document.msExitFullscreen)     document.msExitFullscreen();
  } catch(e) { /* ignora */ }
}

/* ==============================
   INICIA TUDO
============================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
