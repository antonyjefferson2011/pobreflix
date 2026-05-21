// ═══════════════════════════════════════════
//  SEXTA-FEIRA · Sistema IA · script.js
// ═══════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, push }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── Firebase ──
const firebaseConfig = {
  apiKey: "AIzaSyBzqQmGpMz-7AYM7_Mpt2owpmf6BXjW1yk",
  authDomain: "nucisz.firebaseapp.com",
  databaseURL: "https://nucisz-default-rtdb.firebaseio.com",
  projectId: "nucisz",
  storageBucket: "nucisz.firebasestorage.app",
  messagingSenderId: "90824519141",
  appId: "1:90824519141:web:8ec5d6686c07cbbf94930c"
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

// ── Gemini ──
const GEMINI_KEY = "AIzaSyCrsW6iJmm_qoGlg58hO5d45au8Fcim5x8";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// ── Coordenadas fixas — Água Branca, PI, Brasil ──
// (GPS do navegador pega torre de celular próxima, não endereço exato)
const DEFAULT_LAT = -6.6842;
const DEFAULT_LON = -42.3878;

// ── State ──
let map = null;
let userLat = DEFAULT_LAT;
let userLon = DEFAULT_LON;
let memory = {};
let chatHistory = [];
let agenda = [];
let isListening = false;
let recognition = null;
let autoSpeak = true;
let continuousListen = false;
let speechSynth = window.speechSynthesis;
let userName = "Jefferson";
let agendaCheckInterval = null;
let mapMarker = null;

// ════════════════════════════════
//  FIX LEAFLET MARKER ICONS
//  (unpkg storage blocked pelo Edge/Firefox tracking prevention)
// ════════════════════════════════
function fixLeafletIcons() {
  // SVG inline — sem dependência de CDN externo
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path fill="#00d4ff" stroke="#007a99" stroke-width="1.5"
      d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white" opacity="0.9"/>
  </svg>`;

  const iconUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(iconSvg);

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: iconUrl,
    iconRetinaUrl: iconUrl,
    shadowUrl: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [0, 0]
  });
}

// ════════════════════════════════
//  BOOT
// ════════════════════════════════
const bootMessages = [
  "Inicializando núcleo...",
  "Conectando ao Firebase...",
  "Carregando memórias...",
  "Calibrando síntese de voz...",
  "Ativando reconhecimento de voz...",
  "Sistema pronto."
];

async function boot() {
  const fill = document.querySelector(".boot-fill");
  const status = document.getElementById("boot-status");

  for (let i = 0; i < bootMessages.length; i++) {
    status.textContent = bootMessages[i];
    fill.style.width = `${((i + 1) / bootMessages.length) * 100}%`;
    await sleep(350 + Math.random() * 200);
  }

  await sleep(400);
  document.getElementById("boot-screen").classList.add("fade-out");
  await sleep(800);
  document.getElementById("app").classList.remove("hidden");

  await loadAllData();
  initClock();
  initSpeech();
  fixLeafletIcons();
  initMap();
  detectLocation();
  startAgendaChecker();
  renderMemory();
  renderAgenda();
  loadConfig();

  await sleep(600);
  const user = memory["nome_usuario"]?.value || userName;
  addAIMessage(`Sistema online, ${user}. Sou Sexta-Feira, sua assistente IA pessoal. Como posso ajudar?`);
}

// ════════════════════════════════
//  FIREBASE DATA
// ════════════════════════════════
async function loadAllData() {
  try {
    const memSnap = await get(ref(db, "memory"));
    if (memSnap.exists()) memory = memSnap.val() || {};

    const chatSnap = await get(ref(db, "chatHistory"));
    if (chatSnap.exists()) {
      chatHistory = Object.values(chatSnap.val() || {});
      chatHistory.sort((a, b) => a.timestamp - b.timestamp);
      chatHistory.slice(-30).forEach(m => {
        if (m.role === "user") renderUserBubble(m.text, m.timestamp);
        else renderAIBubble(m.text, m.timestamp);
      });
    }

    const agendaSnap = await get(ref(db, "agenda"));
    if (agendaSnap.exists()) {
      agenda = Object.entries(agendaSnap.val() || {}).map(([id, v]) => ({ id, ...v }));
      agenda.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }

    const cfgSnap = await get(ref(db, "config"));
    if (cfgSnap.exists()) {
      const cfg = cfgSnap.val();
      userName = cfg.userName || "Jefferson";
      autoSpeak = cfg.autoSpeak !== false;
      continuousListen = cfg.continuousListen || false;
      if (cfg.userLat) userLat = cfg.userLat;
      if (cfg.userLon) userLon = cfg.userLon;
    }

    notify("✅", "Memória carregada", "cyan");
  } catch (e) {
    console.error("Firebase load error:", e);
    notify("⚠️", "Usando dados locais", "warn");
    loadLocalFallback();
  }
}

function loadLocalFallback() {
  try {
    const m = localStorage.getItem("sf_memory");
    if (m) memory = JSON.parse(m);
    const a = localStorage.getItem("sf_agenda");
    if (a) agenda = JSON.parse(a);
  } catch (e) {}
}

async function saveMemoryToFB() {
  try {
    await set(ref(db, "memory"), memory);
    localStorage.setItem("sf_memory", JSON.stringify(memory));
  } catch (e) {
    localStorage.setItem("sf_memory", JSON.stringify(memory));
  }
}

async function saveChatToFB(role, text) {
  const entry = { role, text, timestamp: Date.now() };
  chatHistory.push(entry);
  try { await push(ref(db, "chatHistory"), entry); } catch (e) {}
}

async function saveAgendaToFB() {
  const obj = {};
  agenda.forEach(e => { obj[e.id] = { title: e.title, datetime: e.datetime, note: e.note }; });
  try {
    await set(ref(db, "agenda"), obj);
    localStorage.setItem("sf_agenda", JSON.stringify(agenda));
  } catch (e) {
    localStorage.setItem("sf_agenda", JSON.stringify(agenda));
  }
}

async function saveConfigToFB() {
  try {
    await set(ref(db, "config"), {
      userName, autoSpeak, continuousListen,
      userLat, userLon
    });
  } catch (e) {}
}

// ════════════════════════════════
//  CLOCK
// ════════════════════════════════
function initClock() {
  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    document.getElementById("clock-time").textContent = `${h}:${m}:${s}`;
    const days = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
    const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    document.getElementById("clock-date").textContent =
      `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  update();
  setInterval(update, 1000);
}

// ════════════════════════════════
//  TABS
// ════════════════════════════════
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.add("active");
  document.querySelector(`[data-tab="${name}"]`).classList.add("active");
  if (name === "map" && map) setTimeout(() => map.invalidateSize(), 100);
  if (name === "weather") fetchWeather();
  if (name === "memory") renderMemory();
  if (name === "agenda") renderAgenda();
}
window.switchTab = switchTab;

// ════════════════════════════════
//  CHAT — RENDER
// ════════════════════════════════
function renderUserBubble(text, ts) {
  const area = document.getElementById("chat-area");
  const welcome = area.querySelector(".chat-welcome");
  if (welcome) welcome.remove();
  const time = ts ? new Date(ts) : new Date();
  const timeStr = `${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time" style="text-align:right">${timeStr}</div>
    </div>`;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
}

function renderAIBubble(text, ts, animate = false) {
  const area = document.getElementById("chat-area");
  const time = ts ? new Date(ts) : new Date();
  const timeStr = `${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.innerHTML = `
    <div class="msg-avatar">SF</div>
    <div>
      <div class="msg-bubble"></div>
      <div class="msg-time">${timeStr}</div>
    </div>`;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  const bubble = msg.querySelector(".msg-bubble");
  if (animate) {
    typeText(bubble, text, 16, () => { area.scrollTop = area.scrollHeight; });
  } else {
    bubble.innerHTML = formatText(text);
  }
}

function addUserMessage(text) {
  renderUserBubble(text, null);
  saveChatToFB("user", text);
}

function addAIMessage(text) {
  renderAIBubble(text, null, true);
  saveChatToFB("ai", text);
  if (autoSpeak) speak(text);
}

function showTypingIndicator() {
  const area = document.getElementById("chat-area");
  const el = document.createElement("div");
  el.className = "msg ai";
  el.id = "typing-indicator-msg";
  el.innerHTML = `
    <div class="msg-avatar">SF</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
  document.getElementById("ind-thinking").style.display = "flex";
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator-msg");
  if (el) el.remove();
  document.getElementById("ind-thinking").style.display = "none";
}

// ════════════════════════════════
//  SEND MESSAGE
// ════════════════════════════════
async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  autoResize(input);

  addUserMessage(text);

  // Local command detection first (memory / agenda)
  const memResult = detectMemoryCommand(text);
  if (memResult) { addAIMessage(memResult); return; }

  const agendaResult = detectAgendaCommand(text);
  if (agendaResult) { addAIMessage(agendaResult); return; }

  // Gemini with retry on 429
  showTypingIndicator();
  try {
    const reply = await askGeminiWithRetry(text);
    removeTypingIndicator();
    addAIMessage(reply);
  } catch (e) {
    removeTypingIndicator();
    addAIMessage("Não consegui me conectar agora. Tente novamente em instantes.");
  }
}
window.sendMessage = sendMessage;

// ── Gemini with retry ──
async function askGeminiWithRetry(text, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await askGemini(text);
    } catch (e) {
      const is429 = e.message.includes("429");
      if (is429 && attempt < retries - 1) {
        // Wait 2s, 4s, 8s before retry
        await sleep(2000 * Math.pow(2, attempt));
        continue;
      }
      throw e;
    }
  }
}

async function askGemini(userText) {
  const memContext = buildMemoryContext();
  const recentHistory = chatHistory.slice(-16).map(m => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }]
  }));

  // Remove last entry (current message not saved yet) to avoid duplication
  const historyForApi = recentHistory.slice(0, -1);

  const systemPrompt = `Você é Sexta-Feira, assistente IA pessoal futurista e inteligente.
Age como JARVIS — eficiente, direta, calorosa e próxima.
Usuário: ${memory["nome_usuario"]?.value || userName}.
Responda sempre em português do Brasil. Seja concisa e natural.
Localização do usuário: Água Branca, Piauí, Brasil (Centro, R. Morais 146).
Memória: ${memContext}
Data/hora: ${new Date().toLocaleString("pt-BR")}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...historyForApi,
      { role: "user", parts: [{ text: userText }] }
    ],
    generationConfig: { temperature: 0.8, maxOutputTokens: 600 }
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não entendi. Pode repetir?";
}

function buildMemoryContext() {
  const entries = Object.entries(memory);
  if (!entries.length) return "Nenhuma.";
  return entries.map(([k, v]) => `${k}: ${v.value}`).join("; ");
}

// ════════════════════════════════
//  MEMORY DETECTION
// ════════════════════════════════
function detectMemoryCommand(text) {
  const low = text.toLowerCase().trim();
  let m;

  // "meu nome é X" / "me chame de X"
  if ((m = low.match(/meu nome (?:é|e) (.+)/)) || (m = low.match(/me chame de (.+)/))) {
    const name = (m[1] || "").trim();
    saveMemory("nome_usuario", name);
    userName = name;
    return `Perfeito! Vou te chamar de ${name} daqui em diante.`;
  }

  // "X agora se chama Y" / "X agora significa Y"
  if ((m = text.match(/(.+?) agora se chama (.+)/i)) || (m = text.match(/(.+?) agora significa (.+)/i))) {
    saveMemory(m[1].trim().toLowerCase(), m[2].trim());
    return `Entendido. Salvei que "${m[1].trim()}" agora é "${m[2].trim()}".`;
  }

  // "aqui é X" / "esse lugar é X"
  if ((m = text.match(/aqui (?:é|e) (.+)/i)) || (m = text.match(/esse lugar (?:é|e) (.+)/i))) {
    const place = (m[1] || "").trim();
    saveMemory("local_atual", place);
    return `Anotei! Este lugar agora é "${place}" na minha memória.`;
  }

  // "lembre que X é Y"
  if ((m = text.match(/lembre que (.+?) (?:é|e|=) (.+)/i))) {
    saveMemory(m[1].trim().toLowerCase(), m[3]?.trim() || m[2]?.trim());
    return `Memória salva: "${m[1].trim()}" → "${m[2]?.trim()}".`;
  }

  // "onde estamos?" / "qual o nome daqui?"
  if (/onde est(?:amos|ou)|qual o nome (?:daqui|deste lugar|do lugar)/i.test(text)) {
    const local = memory["local_atual"]?.value;
    if (local) return `De acordo com minha memória, estamos em: ${local}.`;
    return "Ainda não registrei este lugar. Me diga com 'aqui é [nome]'.";
  }

  // "o que você sabe sobre mim?"
  if (/o que (?:você|vc) sabe (?:sobre|de) mim/i.test(text)) {
    const entries = Object.entries(memory);
    if (!entries.length) return "Ainda não tenho muita informação sobre você. Me conte mais!";
    return `O que sei sobre você:\n${entries.map(([k,v]) => `• ${k}: ${v.value}`).join("\n")}`;
  }

  return null;
}

// ════════════════════════════════
//  AGENDA DETECTION
// ════════════════════════════════
function detectAgendaCommand(text) {
  let m;

  if ((m = text.match(/me lembre de (.+?) (?:às|as|para|em) (.+)/i)) ||
      (m = text.match(/agende (.+?) (?:às|as|para|em) (.+)/i))) {
    switchTab("agenda");
    showAddEvent();
    document.getElementById("ev-title").value = m[1];
    return `Abri a agenda. Complete o horário e confirme o evento "${m[1]}".`;
  }

  if (/minha agenda|meus compromissos|próximos eventos|o que tenho/i.test(text)) {
    if (!agenda.length) return "Sua agenda está vazia. Quer adicionar um evento?";
    const now = new Date();
    const upcoming = agenda.filter(e => new Date(e.datetime) >= now).slice(0, 5);
    if (!upcoming.length) return "Não há eventos futuros agendados.";
    return `Seus próximos eventos:\n${upcoming.map(e => {
      const d = new Date(e.datetime);
      return `• ${e.title} — ${d.toLocaleString("pt-BR")}`;
    }).join("\n")}`;
  }

  return null;
}

// ── Memory CRUD ──
async function saveMemory(key, value) {
  memory[key] = { value, timestamp: Date.now() };
  await saveMemoryToFB();
  renderMemory();
}
window.saveMemory = saveMemory;

async function deleteMemory(key) {
  delete memory[key];
  await saveMemoryToFB();
  renderMemory();
}
window.deleteMemory = deleteMemory;

async function addMemoryManual() {
  const key = document.getElementById("mem-key").value.trim().toLowerCase();
  const val = document.getElementById("mem-val").value.trim();
  if (!key || !val) { notify("⚠️", "Preencha chave e valor", "warn"); return; }
  await saveMemory(key, val);
  document.getElementById("mem-key").value = "";
  document.getElementById("mem-val").value = "";
  notify("🧠", `Memória salva: ${key}`, "cyan");
}
window.addMemoryManual = addMemoryManual;

function renderMemory(filter = "") {
  const list = document.getElementById("memory-list");
  const entries = Object.entries(memory).filter(([k, v]) =>
    !filter || k.includes(filter.toLowerCase()) || v.value.toLowerCase().includes(filter.toLowerCase())
  );
  if (!entries.length) {
    list.innerHTML = `<p class="empty-state">Nenhuma memória encontrada.</p>`;
    return;
  }
  list.innerHTML = entries.map(([k, v]) => {
    const time = v.timestamp ? new Date(v.timestamp).toLocaleDateString("pt-BR") : "";
    return `<div class="memory-item">
      <span class="mem-key">${escapeHtml(k)}</span>
      <span class="mem-sep">→</span>
      <span class="mem-val">${escapeHtml(v.value)}</span>
      <span class="mem-time">${time}</span>
      <button class="mem-del" onclick="deleteMemory('${escapeHtml(k)}')">✕</button>
    </div>`;
  }).join("");
}
window.renderMemory = renderMemory;

function filterMemory(val) { renderMemory(val); }
window.filterMemory = filterMemory;

async function clearMemory() {
  if (!confirm("Limpar toda a memória?")) return;
  memory = {};
  await saveMemoryToFB();
  renderMemory();
  notify("🗑️", "Memória limpa", "warn");
}
window.clearMemory = clearMemory;

// ════════════════════════════════
//  AGENDA
// ════════════════════════════════
function showAddEvent() {
  document.getElementById("agenda-form").style.display = "flex";
  const d = new Date(Date.now() + 3600000);
  const local = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById("ev-datetime").value = local;
}
function hideAddEvent() { document.getElementById("agenda-form").style.display = "none"; }
window.showAddEvent = showAddEvent;
window.hideAddEvent = hideAddEvent;

async function saveEvent() {
  const title = document.getElementById("ev-title").value.trim();
  const datetime = document.getElementById("ev-datetime").value;
  const note = document.getElementById("ev-note").value.trim();
  if (!title || !datetime) { notify("⚠️", "Título e horário obrigatórios", "warn"); return; }
  const id = `ev_${Date.now()}`;
  agenda.push({ id, title, datetime, note });
  agenda.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  await saveAgendaToFB();
  document.getElementById("ev-title").value = "";
  document.getElementById("ev-note").value = "";
  hideAddEvent();
  renderAgenda();
  notify("📅", `Evento salvo: ${title}`, "green");
}
window.saveEvent = saveEvent;

async function deleteEvent(id) {
  agenda = agenda.filter(e => e.id !== id);
  await saveAgendaToFB();
  renderAgenda();
}
window.deleteEvent = deleteEvent;

function renderAgenda() {
  const list = document.getElementById("agenda-list");
  if (!agenda.length) {
    list.innerHTML = `<p class="empty-state">Nenhum evento agendado.</p>`;
    return;
  }
  const now = new Date();
  const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  list.innerHTML = agenda.map(e => {
    const d = new Date(e.datetime);
    const past = d < now;
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const hr = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    return `<div class="agenda-item ${past ? "overdue" : "upcoming"}">
      <div class="agenda-time-block">
        <div class="agenda-day">${day}</div>
        <div class="agenda-month">${month}</div>
        <div class="agenda-hr">${hr}</div>
      </div>
      <div class="agenda-info">
        <div class="agenda-title">${escapeHtml(e.title)}</div>
        ${e.note ? `<div class="agenda-note">${escapeHtml(e.note)}</div>` : ""}
      </div>
      <button class="agenda-del" onclick="deleteEvent('${e.id}')">🗑️</button>
    </div>`;
  }).join("");
}
window.renderAgenda = renderAgenda;

function startAgendaChecker() {
  if (agendaCheckInterval) clearInterval(agendaCheckInterval);
  agendaCheckInterval = setInterval(() => {
    const now = new Date();
    agenda.forEach(e => {
      const d = new Date(e.datetime);
      const diff = d - now;
      if (diff > 0 && diff < 5 * 60 * 1000) {
        const key = `notified_${e.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          notify("📅", `Em 5 min: ${e.title}`, "warn");
          addAIMessage(`⏰ Atenção! Seu evento "${e.title}" começa em 5 minutos!`);
        }
      }
      if (diff > -60000 && diff <= 0) {
        const key = `fired_${e.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          notify("🔔", `Agora: ${e.title}`, "green");
          addAIMessage(`🔔 É hora! Seu evento "${e.title}" está começando agora!`);
        }
      }
    });
  }, 30000);
}

// ════════════════════════════════
//  VOICE
// ════════════════════════════════
function initSpeech() {
  if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById("mic-btn").classList.add("listening");
    document.getElementById("ind-listening").style.display = "flex";
  };
  recognition.onend = () => {
    isListening = false;
    document.getElementById("mic-btn").classList.remove("listening");
    document.getElementById("ind-listening").style.display = "none";
    if (continuousListen && document.getElementById("toggle-listen").classList.contains("on")) {
      setTimeout(() => { try { recognition.start(); } catch(e){} }, 800);
    }
  };
  recognition.onerror = () => {
    isListening = false;
    document.getElementById("mic-btn").classList.remove("listening");
    document.getElementById("ind-listening").style.display = "none";
  };
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    setTimeout(sendMessage, 300);
  };
}

function toggleListen() {
  if (!recognition) { notify("⚠️", "Voz não suportada neste navegador", "warn"); return; }
  if (isListening) { recognition.stop(); }
  else { try { recognition.start(); } catch(e) {} }
}
window.toggleListen = toggleListen;

function speak(text) {
  if (!speechSynth) return;
  speechSynth.cancel();
  const clean = text.replace(/[*_#`~•→]/g, "").substring(0, 280);
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = "pt-BR";
  utt.rate = parseFloat(document.getElementById("cfg-speed")?.value || 1);
  utt.volume = parseFloat(document.getElementById("cfg-volume")?.value || 0.9);
  const voices = speechSynth.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith("pt")) || voices.find(v => v.lang.startsWith("en"));
  if (ptVoice) utt.voice = ptVoice;
  speechSynth.speak(utt);
}
window.speak = speak;

// ════════════════════════════════
//  MAP
// ════════════════════════════════
function initMap() {
  if (map) return;
  map = L.map("map", { zoomControl: true }).setView([userLat, userLon], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19
  }).addTo(map);

  // Place marker at saved/default location
  mapMarker = L.marker([userLat, userLon]).addTo(map)
    .bindPopup(`📍 ${memory["cidade"]?.value || "Água Branca, PI"}`)
    .openPopup();

  document.getElementById("map-info").textContent =
    `📍 ${memory["cidade"]?.value || "Água Branca, PI, Brasil"} · Lat ${userLat.toFixed(4)} · Lon ${userLon.toFixed(4)}`;
}

function updateMapMarker(lat, lon, label) {
  if (!map) return;
  if (mapMarker) map.removeLayer(mapMarker);
  mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
  map.setView([lat, lon], 15);
  document.getElementById("map-info").textContent = `📍 ${label} · Lat ${lat.toFixed(4)} · Lon ${lon.toFixed(4)}`;
}

function locateUser() {
  if (!navigator.geolocation) { notify("⚠️", "Geolocalização não suportada", "warn"); return; }
  notify("📡", "Buscando GPS...", "cyan", 3000);
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
    switchTab("map");
    updateMapMarker(userLat, userLon, "📍 Você está aqui");
    saveConfigToFB();
    fetchWeather();
  }, err => {
    notify("⚠️", "GPS indisponível — usando localização salva", "warn");
  }, { timeout: 8000 });
}
window.locateUser = locateUser;

function detectLocation() {
  // Try GPS but don't block — use default coords if it fails/takes too long
  if (!navigator.geolocation) { fetchWeather(); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
    if (map) updateMapMarker(userLat, userLon, "📍 Você");
    fetchWeather();
    saveConfigToFB();
  }, () => {
    // GPS failed — use saved/default location silently
    fetchWeather();
  }, { timeout: 6000 });
}

// ════════════════════════════════
//  WEATHER — Open-Meteo (gratuito, sem API key, sem CORS)
//  Substitui Meteoblue que retornava 400 com essa URL
// ════════════════════════════════
async function fetchWeather() {
  const panel = document.getElementById("weather-panel");
  panel.innerHTML = `<div class="weather-loading">🌐 Buscando clima...</div>`;

  try {
    // Open-Meteo: free, no key, no CORS issues
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${userLat}&longitude=${userLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&timezone=America%2FSao_Paulo&wind_speed_unit=ms`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather fetch failed");
    const data = await res.json();
    const c = data.current;

    const temp = Math.round(c.temperature_2m);
    const humidity = Math.round(c.relative_humidity_2m);
    const wind = Math.round(c.wind_speed_10m);
    const precip = (c.precipitation || 0).toFixed(1);
    const code = c.weather_code || 0;

    const icon = getWeatherIcon(code);
    const desc = getWeatherDesc(code);
    const city = memory["cidade"]?.value || "Água Branca, PI";

    panel.innerHTML = `
      <div class="weather-card">
        <div class="weather-icon">${icon}</div>
        <div class="weather-main">
          <h3>${escapeHtml(city.toUpperCase())}</h3>
          <div class="weather-temp">${temp}°C</div>
          <div class="weather-desc">${desc}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="w-detail">
          <div class="w-detail-label">Umidade</div>
          <div class="w-detail-val">${humidity}%</div>
        </div>
        <div class="w-detail">
          <div class="w-detail-label">Vento</div>
          <div class="w-detail-val">${wind} m/s</div>
        </div>
        <div class="w-detail">
          <div class="w-detail-label">Chuva</div>
          <div class="w-detail-val">${precip} mm</div>
        </div>
      </div>`;

    // Save city if not set
    if (!memory["cidade"]) {
      memory["cidade"] = { value: "Água Branca, PI", timestamp: Date.now() };
      await saveMemoryToFB();
    }

  } catch (e) {
    panel.innerHTML = `<div class="weather-loading">⚠️ Não foi possível carregar o clima.</div>`;
    console.error("Weather error:", e);
  }
}
window.fetchWeather = fetchWeather;

// WMO Weather Codes (Open-Meteo uses WMO standard)
function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

function getWeatherDesc(code) {
  if (code === 0) return "Céu limpo";
  if (code <= 2) return "Poucas nuvens";
  if (code <= 3) return "Nublado";
  if (code <= 49) return "Neblina/névoa";
  if (code <= 57) return "Garoa";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  if (code <= 82) return "Pancadas de chuva";
  if (code <= 86) return "Neve forte";
  if (code <= 99) return "Tempestade";
  return "Indisponível";
}

// ════════════════════════════════
//  CONFIG
// ════════════════════════════════
function loadConfig() {
  const u = document.getElementById("cfg-username");
  if (u) u.value = userName;
  updateToggleUI();
}

async function saveConfig() {
  userName = document.getElementById("cfg-username").value.trim() || "Jefferson";
  await saveMemory("nome_usuario", userName);

  // Save manual location if filled
  const latIn = document.getElementById("cfg-lat")?.value.trim();
  const lonIn = document.getElementById("cfg-lon")?.value.trim();
  if (latIn && lonIn) {
    const lat = parseFloat(latIn);
    const lon = parseFloat(lonIn);
    if (!isNaN(lat) && !isNaN(lon)) {
      userLat = lat;
      userLon = lon;
      if (map) updateMapMarker(lat, lon, memory["cidade"]?.value || "Minha localização");
    }
  }

  await saveConfigToFB();
  notify("✅", "Configurações salvas", "green");
}
window.saveConfig = saveConfig;

function toggleSpeakMode() {
  autoSpeak = !autoSpeak;
  document.getElementById("toggle-speak").classList.toggle("on", autoSpeak);
  saveConfigToFB();
  notify(autoSpeak ? "🔊" : "🔇", autoSpeak ? "Fala ativada" : "Fala desativada", "cyan");
}
window.toggleSpeakMode = toggleSpeakMode;

function toggleContinuousListen() {
  continuousListen = !continuousListen;
  document.getElementById("toggle-listen").classList.toggle("on", continuousListen);
  saveConfigToFB();
  if (continuousListen) {
    notify("🎤", "Escuta contínua ativada", "cyan");
    try { recognition?.start(); } catch(e){}
  } else {
    notify("🎤", "Escuta contínua desativada", "warn");
    try { recognition?.stop(); } catch(e){}
  }
}
window.toggleContinuousListen = toggleContinuousListen;

function updateToggleUI() {
  document.getElementById("toggle-speak")?.classList.toggle("on", autoSpeak);
  document.getElementById("toggle-listen")?.classList.toggle("on", continuousListen);
}

// ════════════════════════════════
//  CHAT UTILS
// ════════════════════════════════
async function clearChat() {
  if (!confirm("Limpar histórico do chat?")) return;
  document.getElementById("chat-area").innerHTML = `
    <div class="chat-welcome">
      <div class="welcome-orb"></div>
      <p>Chat limpo. Pronta para conversar!</p>
    </div>`;
  chatHistory = [];
  try { await set(ref(db, "chatHistory"), null); } catch(e) {}
  notify("🗑️", "Chat limpo", "warn");
}
window.clearChat = clearChat;

function exportChat() {
  const lines = chatHistory.map(m => {
    const d = new Date(m.timestamp).toLocaleString("pt-BR");
    const who = m.role === "ai" ? "SEXTA-FEIRA" : "VOCÊ";
    return `[${d}] ${who}: ${m.text}`;
  }).join("\n\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sexta-feira-chat-${Date.now()}.txt`;
  a.click();
  notify("💾", "Chat exportado", "green");
}
window.exportChat = exportChat;

async function clearAll() {
  if (!confirm("Apagar TUDO? Memória, agenda e histórico serão deletados.")) return;
  memory = {}; agenda = []; chatHistory = [];
  try {
    await set(ref(db, "memory"), null);
    await set(ref(db, "chatHistory"), null);
    await set(ref(db, "agenda"), null);
  } catch(e) {}
  localStorage.clear();
  sessionStorage.clear();
  notify("🗑️", "Tudo limpo", "danger");
  location.reload();
}
window.clearAll = clearAll;

// ════════════════════════════════
//  NOTIFICATIONS
// ════════════════════════════════
function notify(icon, msg, type = "cyan", duration = 4000) {
  const area = document.getElementById("notif-area");
  const el = document.createElement("div");
  el.className = `notif ${type}`;
  el.innerHTML = `
    <span class="notif-icon">${icon}</span>
    <div class="notif-body">
      <div class="notif-title">Sexta-Feira</div>
      <div class="notif-msg">${escapeHtml(msg)}</div>
    </div>
    <button class="notif-close" onclick="this.closest('.notif').remove()">✕</button>`;
  area.appendChild(el);

  if (Notification?.permission === "granted") {
    try { new Notification("Sexta-Feira", { body: msg }); } catch(e) {}
  }

  setTimeout(() => {
    el.classList.add("removing");
    setTimeout(() => el.remove(), 350);
  }, duration);
}
window.notify = notify;

async function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

// ════════════════════════════════
//  HELPERS
// ════════════════════════════════
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>")
    .replace(/•/g, "•");
}

function typeText(el, text, speed = 16, onDone) {
  const plain = text.replace(/\*\*?(.+?)\*\*?/g, "$1").replace(/\n/g, " ");
  const chars = [...plain];
  let i = 0;
  el.textContent = "";

  function type() {
    if (i < chars.length) {
      el.textContent += chars[i++];
      setTimeout(type, speed + Math.random() * 8);
    } else {
      el.innerHTML = formatText(text);
      if (onDone) onDone();
    }
  }
  type();
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}
window.autoResize = autoResize;

// ════════════════════════════════
//  START
// ════════════════════════════════
requestNotifPermission();
boot();
