// ═══════════════════════════════════════════
//  SEXTA-FEIRA · Sistema IA · script.js
// ═══════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, onValue }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── Firebase ──
const firebaseConfig = {
  apiKey: "AIzaSyBzqQmGpMz-7AYM7_Mpt2owpmf6BXjW1yk",
  authDomain: "nucisz.firebaseapp.com",
  databaseURL: "https://nucisz-default-rtdb.firebaseio.com",
  projectId: "nucisz",
  storageBucket: "nucisz.firebasestorage.app",
  messagingSenderId: "90824519141",
  appId: "1:90824519141:web:8ec5d6686c07cbbf94930c",
  measurementId: "G-BZ4S7Q3NM2"
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

// ── Gemini ──
const GEMINI_KEY = "AIzaSyCrsW6iJmm_qoGlg58hO5d45au8Fcim5x8";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// ── Meteoblue ──
const WEATHER_KEY = "xqj042lJFAHcsK1U";

// ── State ──
let map = null;
let userLat = null, userLon = null;
let memory = {}; // { key: { value, timestamp } }
let chatHistory = []; // [{ role, text, timestamp }]
let agenda = []; // [{ id, title, datetime, note }]
let isListening = false;
let recognition = null;
let autoSpeak = true;
let continuousListen = false;
let speechSynth = window.speechSynthesis;
let userName = "Jefferson";
let agendaCheckInterval = null;

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

  // Init everything
  await loadAllData();
  initClock();
  initSpeech();
  initMap();
  detectLocation();
  startAgendaChecker();
  renderMemory();
  renderAgenda();
  loadConfig();

  // Welcome message
  await sleep(600);
  const user = memory["nome_usuario"]?.value || userName;
  addAIMessage(`Sistema online, ${user}. Sou Sexta-Feira, sua assistente IA. Como posso ajudar?`);
}

// ════════════════════════════════
//  FIREBASE DATA
// ════════════════════════════════
async function loadAllData() {
  try {
    // Memory
    const memSnap = await get(ref(db, "memory"));
    if (memSnap.exists()) memory = memSnap.val() || {};

    // Chat history
    const chatSnap = await get(ref(db, "chatHistory"));
    if (chatSnap.exists()) {
      chatHistory = Object.values(chatSnap.val() || {});
      chatHistory.sort((a, b) => a.timestamp - b.timestamp);
      // Render last 30 messages
      chatHistory.slice(-30).forEach(m => {
        if (m.role === "user") addUserBubble(m.text, m.timestamp, false);
        else addAIBubble(m.text, m.timestamp, false);
      });
    }

    // Agenda
    const agendaSnap = await get(ref(db, "agenda"));
    if (agendaSnap.exists()) {
      agenda = Object.entries(agendaSnap.val() || {}).map(([id, v]) => ({ id, ...v }));
      agenda.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }

    // Config
    const cfgSnap = await get(ref(db, "config"));
    if (cfgSnap.exists()) {
      const cfg = cfgSnap.val();
      userName = cfg.userName || "Jefferson";
      autoSpeak = cfg.autoSpeak !== false;
      continuousListen = cfg.continuousListen || false;
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
  try {
    await push(ref(db, "chatHistory"), entry);
  } catch (e) {}
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
    await set(ref(db, "config"), { userName, autoSpeak, continuousListen });
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

    const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
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
//  CHAT
// ════════════════════════════════
function addUserBubble(text, ts, save = true) {
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
  if (save) saveChatToFB("user", text);
}

function addAIBubble(text, ts, save = true) {
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
  typeText(bubble, text, 18, () => {
    area.scrollTop = area.scrollHeight;
    if (save) saveChatToFB("ai", text);
  });
}

function addAIMessage(text) {
  addAIBubble(text, null, true);
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

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  autoResize(input);

  addUserBubble(text, null, true);

  // Check for memory commands first
  const memResult = detectMemoryCommand(text);
  if (memResult) {
    addAIMessage(memResult);
    return;
  }

  // Agenda commands
  const agendaResult = detectAgendaCommand(text);
  if (agendaResult) {
    addAIMessage(agendaResult);
    return;
  }

  // Send to Gemini
  showTypingIndicator();
  try {
    const reply = await askGemini(text);
    removeTypingIndicator();
    addAIMessage(reply);
  } catch (e) {
    removeTypingIndicator();
    addAIMessage("Erro ao conectar com o servidor. Verifique sua conexão.");
  }
}
window.sendMessage = sendMessage;

// ── Gemini API ──
async function askGemini(userText) {
  const memContext = buildMemoryContext();
  const recentHistory = chatHistory.slice(-20).map(m => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }]
  }));

  const systemPrompt = `Você é Sexta-Feira, uma assistente IA pessoal futurista, inteligente e sempre disponível. 
Você age como o JARVIS do Tony Stark — eficiente, direta, profissional, mas também calorosa e próxima.
Nome do usuário: ${memory["nome_usuario"]?.value || userName}.
Sempre responda em português do Brasil.
Seja concisa mas completa. Use linguagem natural.
Memória atual do usuário: ${memContext}
Data/hora atual: ${new Date().toLocaleString("pt-BR")}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...recentHistory.slice(-10),
      { role: "user", parts: [{ text: userText }] }
    ],
    generationConfig: { temperature: 0.8, maxOutputTokens: 800 }
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
  if (!entries.length) return "Nenhuma memória salva ainda.";
  return entries.map(([k, v]) => `${k}: ${v.value}`).join("; ");
}

// ── Memory detection ──
function detectMemoryCommand(text) {
  const low = text.toLowerCase();

  // Salvar nome: "meu nome é X" / "me chame de X"
  let m;
  if ((m = low.match(/meu nome (é|e) (.+)/)) || (m = low.match(/me chame de (.+)/))) {
    const name = m[2] || m[1];
    const cleaned = name.trim();
    saveMemory("nome_usuario", cleaned);
    userName = cleaned;
    return `Perfeito! Vou te chamar de ${cleaned} daqui em diante.`;
  }

  // "X agora se chama Y" / "X agora significa Y"
  if ((m = text.match(/(.+?) agora se chama (.+)/i)) || (m = text.match(/(.+?) agora significa (.+)/i))) {
    saveMemory(m[1].trim().toLowerCase(), m[2].trim());
    return `Entendido. Salvei que "${m[1].trim()}" agora é "${m[2].trim()}".`;
  }

  // "aqui é X" / "esse lugar é X"
  if ((m = text.match(/aqui (é|e) (.+)/i)) || (m = text.match(/esse lugar (é|e) (.+)/i))) {
    const place = (m[2] || "").trim();
    const loc = userLat ? `${place} (lat:${userLat.toFixed(4)},lon:${userLon.toFixed(4)})` : place;
    saveMemory("local_atual", loc);
    return `Anotei! Este lugar agora é "${place}" na minha memória.`;
  }

  // "lembre que X é Y" / "salve que X"
  if ((m = text.match(/lembre que (.+?) (é|e|=) (.+)/i))) {
    saveMemory(m[1].trim().toLowerCase(), m[3].trim());
    return `Memória salva: "${m[1].trim()}" = "${m[3].trim()}".`;
  }

  // "onde estamos?" / "qual o nome daqui?"
  if (/onde est(amos|ou)|qual o nome (daqui|deste lugar|do lugar)/i.test(text)) {
    const local = memory["local_atual"]?.value;
    if (local) return `De acordo com minha memória, estamos em: ${local}.`;
    return "Ainda não registrei o nome deste lugar. Pode me dizer com 'aqui é [nome]'.";
  }

  // "o que você sabe sobre mim?"
  if (/o que (você|vc) sabe (sobre mim|de mim)/i.test(text)) {
    const entries = Object.entries(memory);
    if (!entries.length) return "Ainda não tenho muita informação sobre você. Me conte mais!";
    const list = entries.map(([k, v]) => `• ${k}: ${v.value}`).join("\n");
    return `Aqui está o que sei sobre você:\n${list}`;
  }

  return null;
}

function detectAgendaCommand(text) {
  const low = text.toLowerCase();
  let m;

  // "me lembre de X às Y" / "agende X para Y"
  if ((m = text.match(/me lembre de (.+?) (às|as|para|em) (.+)/i)) ||
      (m = text.match(/agende (.+?) (às|as|para|em) (.+)/i))) {
    // Try to parse datetime from text
    notify("📅", `Evento detectado. Use a aba Agenda para confirmar.`, "cyan");
    switchTab("agenda");
    showAddEvent();
    document.getElementById("ev-title").value = m[1];
    return `Abri a agenda para você salvar "${m[1]}". Complete o horário e confirme!`;
  }

  // "quais meus compromissos?" / "minha agenda"
  if (/minha agenda|meus compromissos|próximos eventos|o que tenho/i.test(low)) {
    if (!agenda.length) return "Sua agenda está vazia. Posso adicionar um evento pra você!";
    const now = new Date();
    const upcoming = agenda.filter(e => new Date(e.datetime) >= now).slice(0, 5);
    if (!upcoming.length) return "Não há eventos futuros na agenda.";
    const list = upcoming.map(e => {
      const d = new Date(e.datetime);
      return `• ${e.title} — ${d.toLocaleString("pt-BR")}`;
    }).join("\n");
    return `Seus próximos eventos:\n${list}`;
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
  // Set default datetime to now + 1 hour
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
  list.innerHTML = agenda.map(e => {
    const d = new Date(e.datetime);
    const past = d < now;
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    const month = months[d.getMonth()];
    const hr = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    const cls = past ? "overdue" : "upcoming";

    return `<div class="agenda-item ${cls}">
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

// ── Agenda Checker ──
function startAgendaChecker() {
  if (agendaCheckInterval) clearInterval(agendaCheckInterval);
  agendaCheckInterval = setInterval(() => {
    const now = new Date();
    agenda.forEach(e => {
      const d = new Date(e.datetime);
      const diff = d - now;
      // Notify 5 min before
      if (diff > 0 && diff < 5 * 60 * 1000) {
        const key = `notified_${e.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          notify("📅", `Em 5 min: ${e.title}`, "warn");
          addAIMessage(`⏰ Atenção! Seu evento "${e.title}" começa em 5 minutos!`);
        }
      }
      // Notify at time
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
  if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
    console.warn("SpeechRecognition not supported");
    return;
  }

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
      setTimeout(() => { try { recognition.start(); } catch(e){} }, 500);
    }
  };

  recognition.onerror = (e) => {
    console.error("Speech error:", e.error);
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
  if (isListening) {
    recognition.stop();
  } else {
    try { recognition.start(); } catch(e) {}
  }
}
window.toggleListen = toggleListen;

function speak(text) {
  if (!speechSynth) return;
  speechSynth.cancel();
  const clean = text.replace(/[*_#`~]/g, "").substring(0, 300);
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = "pt-BR";
  utt.rate = parseFloat(document.getElementById("cfg-speed")?.value || 1);
  utt.volume = parseFloat(document.getElementById("cfg-volume")?.value || 0.9);

  // Try to pick a Portuguese voice
  const voices = speechSynth.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith("pt")) ||
                  voices.find(v => v.lang.startsWith("en"));
  if (ptVoice) utt.voice = ptVoice;

  speechSynth.speak(utt);
}
window.speak = speak;

// ════════════════════════════════
//  MAP
// ════════════════════════════════
function initMap() {
  if (map) return;
  map = L.map("map", { zoomControl: true }).setView([-10.9, -37.0], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19
  }).addTo(map);
}

function locateUser() {
  if (!navigator.geolocation) { notify("⚠️", "Geolocalização não suportada", "warn"); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
    switchTab("map");
    if (map) {
      map.setView([userLat, userLon], 15);
      L.marker([userLat, userLon])
        .addTo(map)
        .bindPopup("📍 Você está aqui")
        .openPopup();
    }
    document.getElementById("map-info").textContent =
      `📍 Lat: ${userLat.toFixed(5)} · Lon: ${userLon.toFixed(5)}`;
  }, err => {
    notify("⚠️", "Não foi possível obter localização", "warn");
  });
}
window.locateUser = locateUser;

function detectLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
    if (map) {
      map.setView([userLat, userLon], 13);
      L.marker([userLat, userLon]).addTo(map).bindPopup("📍 Você");
    }
    document.getElementById("map-info").textContent =
      `📍 Lat: ${userLat.toFixed(5)} · Lon: ${userLon.toFixed(5)}`;
    fetchWeather();
  }, () => {
    // silent fail
  });
}

// ════════════════════════════════
//  WEATHER (Meteoblue)
// ════════════════════════════════
async function fetchWeather() {
  const panel = document.getElementById("weather-panel");

  if (!userLat || !userLon) {
    panel.innerHTML = `<div class="weather-loading">Aguardando localização GPS para buscar clima...</div>`;
    detectLocation();
    return;
  }

  panel.innerHTML = `<div class="weather-loading">🌐 Buscando clima...</div>`;

  try {
    const url = `https://my.meteoblue.com/packages/basic-1h?apikey=${WEATHER_KEY}&lat=${userLat}&lon=${userLon}&format=json&temperature=C&windspeed=ms&forecast_days=3`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    const h = data.data_1h;
    const now = new Date();
    const idx = 0; // current hour approx

    const temp = Math.round(h.temperature[idx]);
    const wind = Math.round(h.windspeed[idx]);
    const humidity = h.relativehumidity ? Math.round(h.relativehumidity[idx]) : "--";
    const precipitation = h.precipitation ? h.precipitation[idx].toFixed(1) : "0";
    const pictocode = h.pictocode ? h.pictocode[idx] : 1;

    const icon = getWeatherIcon(pictocode);
    const desc = getWeatherDesc(pictocode);

    const city = memory["cidade"]?.value || `Lat ${userLat.toFixed(2)}, Lon ${userLon.toFixed(2)}`;

    panel.innerHTML = `
      <div class="weather-card">
        <div class="weather-icon">${icon}</div>
        <div class="weather-main">
          <h3>${city.toUpperCase()}</h3>
          <div class="weather-temp">${temp}°C</div>
          <div class="weather-desc">${desc}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="w-detail">
          <div class="w-detail-label">Vento</div>
          <div class="w-detail-val">${wind} m/s</div>
        </div>
        <div class="w-detail">
          <div class="w-detail-label">Umidade</div>
          <div class="w-detail-val">${humidity}%</div>
        </div>
        <div class="w-detail">
          <div class="w-detail-label">Chuva</div>
          <div class="w-detail-val">${precipitation} mm</div>
        </div>
      </div>`;

    // Save city to memory if not set
    if (!memory["cidade"]) {
      await reverseGeocode(userLat, userLon);
    }

  } catch (e) {
    panel.innerHTML = `<div class="weather-loading">⚠️ Não foi possível carregar o clima. Tente novamente.</div>`;
    console.error("Weather error:", e);
  }
}
window.fetchWeather = fetchWeather;

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
    if (city) await saveMemory("cidade", city);
  } catch (e) {}
}

function getWeatherIcon(code) {
  if (code <= 2) return "☀️";
  if (code <= 4) return "🌤️";
  if (code <= 6) return "⛅";
  if (code <= 8) return "☁️";
  if (code <= 11) return "🌧️";
  if (code <= 13) return "⛈️";
  if (code <= 16) return "🌨️";
  if (code <= 17) return "🌩️";
  return "🌫️";
}

function getWeatherDesc(code) {
  if (code <= 2) return "Céu limpo";
  if (code <= 4) return "Poucas nuvens";
  if (code <= 6) return "Parcialmente nublado";
  if (code <= 8) return "Nublado";
  if (code <= 11) return "Chuvoso";
  if (code <= 13) return "Tempestade";
  if (code <= 16) return "Neve";
  if (code <= 17) return "Trovoada";
  return "Neblina";
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
      <p>Chat limpo. Pronto para conversar!</p>
    </div>`;
  chatHistory = [];
  try { await set(ref(db, "chatHistory"), null); } catch(e){}
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

  // Browser notification if permitted
  if (Notification?.permission === "granted") {
    new Notification("Sexta-Feira", { body: msg, icon: "/favicon.ico" });
  }

  setTimeout(() => {
    el.classList.add("removing");
    setTimeout(() => el.remove(), 350);
  }, duration);
}
window.notify = notify;

// Request notification permission
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
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function typeText(el, text, speed = 18, onDone) {
  // Process markdown-like formatting
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  // Strip tags for typing effect, then set full HTML
  let i = 0;
  el.textContent = "";
  const plain = text.replace(/\*\*?(.+?)\*\*?/g, "$1");
  const chars = [...plain];

  function type() {
    if (i < chars.length) {
      el.textContent += chars[i++];
      setTimeout(type, speed + Math.random() * 10);
    } else {
      el.innerHTML = html;
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
