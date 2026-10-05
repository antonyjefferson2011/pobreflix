/* =========================================================
   FORGEAI V1
   Construtor de sites por conversa
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const GROQ_API_URL =
    "https://api.groq.com/openai/v1/chat/completions";

let apiKey =
    localStorage.getItem("forgeai_groq_key") || "";

let selectedModel =
    localStorage.getItem("forgeai_model") ||
    "llama-3.3-70b-versatile";


/* =========================================================
   ESTADO
   ========================================================= */

const state = {

    projectName:
        localStorage.getItem("forgeai_project_name") ||
        "Meu site",

    files: {

        html:
            localStorage.getItem("forgeai_html") ||
            "",

        css:
            localStorage.getItem("forgeai_css") ||
            "",

        js:
            localStorage.getItem("forgeai_js") ||
            ""

    },

    activeFile: "html",

    messages: [],

    history: [],

    isGenerating: false

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const $ = id =>
    document.getElementById(id);

const messagesEl =
    $("messages");

const userInput =
    $("userInput");

const sendBtn =
    $("sendBtn");

const codeEditor =
    $("codeEditor");

const lineNumbers =
    $("lineNumbers");

const previewFrame =
    $("previewFrame");

const emptyPreview =
    $("emptyPreview");

const projectName =
    $("projectName");

const topProjectName =
    $("topProjectName");

const saveStatus =
    $("saveStatus");

const apiStatus =
    $("apiStatus");

const statusDot =
    document.querySelector(".status-dot");


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateProjectName();

    updateApiStatus();

    loadEditor();

    updateLineNumbers();

    if (
        state.files.html ||
        state.files.css ||
        state.files.js
    ) {
        updatePreview();
    }

    setupEvents();

});


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );


    userInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    userInput.addEventListener(
        "input",
        autoResizeTextarea
    );


    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    userInput.value =
                        button.textContent.trim();

                    autoResizeTextarea();

                    userInput.focus();

                }
            );

        });


    document
        .querySelectorAll(".code-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    saveCurrentEditor();

                    state.activeFile =
                        tab.dataset.file;

                    loadEditor();

                    document
                        .querySelectorAll(".code-tab")
                        .forEach(t =>
                            t.classList.remove("active")
                        );

                    tab.classList.add("active");

                }
            );

        });


    codeEditor.addEventListener(
        "input",
        () => {

            saveCurrentEditor();

            updateLineNumbers();

            updatePreviewDebounced();

        }
    );


    codeEditor.addEventListener(
        "scroll",
        () => {

            lineNumbers.scrollTop =
                codeEditor.scrollTop;

        }
    );


    $("saveBtn").addEventListener(
        "click",
        saveProject
    );


    $("downloadBtn").addEventListener(
        "click",
        downloadProject
    );


    $("newProjectBtn").addEventListener(
        "click",
        newProject
    );


    $("renameProjectBtn").addEventListener(
        "click",
        renameProject
    );


    $("refreshPreviewBtn").addEventListener(
        "click",
        updatePreview
    );


    $("openPreviewBtn").addEventListener(
        "click",
        openPreview
    );


    $("copyCodeBtn").addEventListener(
        "click",
        copyCode
    );


    $("formatCodeBtn").addEventListener(
        "click",
        formatCode
    );


    $("clearChatBtn").addEventListener(
        "click",
        clearChat
    );


    $("publishBtn").addEventListener(
        "click",
        () => {

            showToast(
                "Na V1, publicar significa baixar o projeto. Deploy automático entra na próxima versão."
            );

        }
    );


    document
        .querySelectorAll(".device-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".device-btn")
                        .forEach(b =>
                            b.classList.remove("active")
                        );

                    button.classList.add("active");

                    changeDevice(
                        button.dataset.device
                    );

                }
            );

        });


    $("apiModal")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    $("apiModal")
                ) {

                    closeApiModal();

                }

            }
        );


    $("closeApiModal")
        .addEventListener(
            "click",
            closeApiModal
        );


    $("saveApiBtn")
        .addEventListener(
            "click",
            saveApiConfig
        );

}


/* =========================================================
   GROQ
   ========================================================= */

async function askGroq(userRequest) {

    if (!apiKey) {

        openApiModal();

        throw new Error(
            "API Key da Groq não configurada."
        );

    }


    const projectContext = {

        html: state.files.html,

        css: state.files.css,

        js: state.files.js

    };


    const systemPrompt = `
Você é o motor de um construtor de sites chamado ForgeAI.

Sua função é criar e modificar sites completos usando HTML, CSS e JavaScript puro.

REGRAS IMPORTANTES:

1. Sempre produza um site funcional.
2. O HTML deve ser compatível com navegador moderno.
3. CSS deve ficar separado do HTML.
4. JavaScript deve ficar separado do HTML.
5. Não use frameworks.
6. Não use Markdown.
7. Não use blocos de código.
8. Não explique seu código antes ou depois.
9. Quando o usuário pedir uma alteração, preserve o que já existe.
10. Não apague funcionalidades existentes sem motivo.
11. Pode usar imagens externas via URLs públicas quando necessário.
12. O resultado deve ser visualmente profissional.
13. O site deve ser responsivo.
14. Use JavaScript apenas quando necessário.
15. Retorne SEMPRE exatamente este formato:

<FORGE_RESPONSE>
<message>
Uma explicação curta para o usuário.
</message>

<html>
COLOQUE AQUI O INDEX.HTML COMPLETO
</html>

<css>
COLOQUE AQUI O STYLE.CSS COMPLETO
</css>

<js>
COLOQUE AQUI O SCRIPT.JS COMPLETO
</js>
</FORGE_RESPONSE>

PROJETO ATUAL:

INDEX.HTML:
${projectContext.html || "(vazio)"}

STYLE.CSS:
${projectContext.css || "(vazio)"}

SCRIPT.JS:
${projectContext.js || "(vazio)"}
`;


    const conversation = [

        {
            role: "system",
            content: systemPrompt
        }

    ];


    /*
       Mantemos algumas mensagens recentes
       para a IA entender a conversa.
    */

    const recentMessages =
        state.messages.slice(-8);

    recentMessages.forEach(message => {

        conversation.push({

            role:
                message.role === "user"
                    ? "user"
                    : "assistant",

            content:
                message.content

        });

    });


    conversation.push({

        role: "user",

        content: userRequest

    });


    const response =
        await fetch(
            GROQ_API_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`

                },

                body: JSON.stringify({

                    model:
                        selectedModel,

                    messages:
                        conversation,

                    temperature:
                        0.2,

                    max_completion_tokens:
                        16000

                })

            }
        );


    if (!response.ok) {

        let errorText = "";

        try {

            const errorData =
                await response.json();

            errorText =
                errorData?.error?.message ||
                JSON.stringify(errorData);

        } catch {

            errorText =
                await response.text();

        }

        throw new Error(
            `Groq retornou ${response.status}: ${errorText}`
        );

    }


    const data =
        await response.json();


    const result =
        data?.choices?.[0]?.message?.content;


    if (!result) {

        throw new Error(
            "A Groq não retornou conteúdo."
        );

    }


    return result;

}


/* =========================================================
   PARSER DA RESPOSTA
   ========================================================= */

function parseForgeResponse(text) {

    const messageMatch =
        text.match(
            /<message>([\s\S]*?)<\/message>/i
        );

    const htmlMatch =
        text.match(
            /<html>([\s\S]*?)<\/html>/i
        );

    const cssMatch =
        text.match(
            /<css>([\s\S]*?)<\/css>/i
        );

    const jsMatch =
        text.match(
            /<js>([\s\S]*?)<\/js>/i
        );


    let html =
        htmlMatch
            ? htmlMatch[1].trim()
            : null;

    let css =
        cssMatch
            ? cssMatch[1].trim()
            : null;

    let js =
        jsMatch
            ? jsMatch[1].trim()
            : null;


    /*
       Remove possíveis ```html etc.
    */

    html =
        cleanCode(html);

    css =
        cleanCode(css);

    js =
        cleanCode(js);


    return {

        message:
            messageMatch
                ? messageMatch[1].trim()
                : "Site atualizado.",

        html,

        css,

        js

    };

}


/* =========================================================
   LIMPAR CÓDIGO
   ========================================================= */

function cleanCode(code) {

    if (!code)
        return null;


    return code
        .replace(/^```[a-zA-Z0-9_-]*\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

}


/* =========================================================
   ENVIAR MENSAGEM
   ========================================================= */

async function sendMessage() {

    const text =
        userInput.value.trim();


    if (!text)
        return;


    if (state.isGenerating)
        return;


    addMessage(
        "user",
        text
    );


    userInput.value = "";

    autoResizeTextarea();


    state.messages.push({

        role: "user",

        content: text

    });


    setGenerating(true);


    const loadingId =
        addLoadingMessage();


    try {

        const response =
            await askGroq(text);


        removeMessage(
            loadingId
        );


        const parsed =
            parseForgeResponse(response);


        /*
           Guarda estado anterior
           para possibilitar undo.
        */

        state.history.push({

            html: state.files.html,

            css: state.files.css,

            js: state.files.js

        });


        /*
           Só substituímos arquivos que
           realmente vieram na resposta.
        */

        if (parsed.html)
            state.files.html =
                parsed.html;

        if (parsed.css)
            state.files.css =
                parsed.css;

        if (parsed.js)
            state.files.js =
                parsed.js;


        state.messages.push({

            role: "assistant",

            content:
                parsed.message

        });


        addMessage(
            "ai",
            parsed.message
        );


        saveProject(
            false
        );

        loadEditor();

        updatePreview();

        showToast(
            "Site atualizado!"
        );


    } catch (error) {

        removeMessage(
            loadingId
        );


        console.error(error);


        const message =
            error.message ||
            "Erro desconhecido.";


        addMessage(
            "ai",
            `Não consegui atualizar o projeto.\n\n${message}`
        );


    } finally {

        setGenerating(false);

    }

}


/* =========================================================
   MENSAGENS
   ========================================================= */

function addMessage(
    type,
    text
) {

    const welcome =
        messagesEl.querySelector(
            ".welcome"
        );

    if (welcome)
        welcome.remove();


    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${type}`;


    const label =
        document.createElement("div");

    label.className =
        "message-label";

    label.textContent =
        type === "user"
            ? "Você"
            : "ForgeAI";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    bubble.textContent =
        text;


    wrapper.appendChild(label);

    wrapper.appendChild(bubble);

    messagesEl.appendChild(wrapper);


    messagesEl.scrollTop =
        messagesEl.scrollHeight;

}


function addLoadingMessage() {

    const id =
        "loading-" +
        Date.now();


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai";

    wrapper.id =
        id;


    wrapper.innerHTML = `
        <div class="message-label">
            ForgeAI
        </div>

        <div class="message-bubble loading-dots">
            Construindo
        </div>
    `;


    messagesEl.appendChild(
        wrapper
    );


    messagesEl.scrollTop =
        messagesEl.scrollHeight;


    return id;

}


function removeMessage(id) {

    const element =
        document.getElementById(id);

    if (element)
        element.remove();

}


function clearChat() {

    state.messages = [];

    messagesEl.innerHTML = `
        <div class="welcome">

            <div class="welcome-icon">
                ✦
            </div>

            <h1>O que vamos construir?</h1>

            <p>
                Descreva o site que você quer e a IA vai criar
                o projeto para você.
            </p>

            <div class="suggestions">

                <button class="suggestion">
                    Crie uma landing page moderna para uma loja de tênis
                </button>

                <button class="suggestion">
                    Crie um site para uma hamburgueria com cardápio
                </button>

                <button class="suggestion">
                    Crie um portfólio profissional para um programador
                </button>

            </div>

        </div>
    `;


    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    userInput.value =
                        button.textContent.trim();

                    autoResizeTextarea();

                    userInput.focus();

                }
            );

        });

}


/* =========================================================
   EDITOR
   ========================================================= */

function loadEditor() {

    codeEditor.value =
        state.files[state.activeFile] || "";

    updateLineNumbers();

}


function saveCurrentEditor() {

    state.files[
        state.activeFile
    ] = codeEditor.value;

}


function updateLineNumbers() {

    const lines =
        codeEditor.value.split("\n").length;


    let html = "";

    for (
        let i = 1;
        i <= lines;
        i++
    ) {

        html +=
            `${i}<br>`;

    }


    lineNumbers.innerHTML =
        html;

}


function formatCode() {

    saveCurrentEditor();


    let code =
        state.files[state.activeFile];


    if (!code)
        return;


    /*
       Formatação simples.
       Não tenta ser um formatter completo.
    */

    if (
        state.activeFile === "html"
    ) {

        code =
            code
                .replace(/>\s*</g, ">\n<")
                .replace(
                    /\n\s*\n/g,
                    "\n"
                );

    }


    if (
        state.activeFile === "css"
    ) {

        code =
            code
                .replace(/\{/g, "{\n")
                .replace(/;/g, ";\n")
                .replace(/\}/g, "\n}\n");

    }


    state.files[
        state.activeFile
    ] = code.trim();


    loadEditor();

    updatePreview();

}


/* =========================================================
   PREVIEW
   ========================================================= */

let previewTimer;


function updatePreviewDebounced() {

    clearTimeout(
        previewTimer
    );

    previewTimer =
        setTimeout(
            updatePreview,
            400
        );

}


function updatePreview() {

    saveCurrentEditor();


    if (
        !state.files.html &&
        !state.files.css &&
        !state.files.js
    ) {

        previewFrame.style.display =
            "none";

        emptyPreview.style.display =
            "flex";

        return;

    }


    let html =
        state.files.html ||
        "<!DOCTYPE html><html><body></body></html>";


    /*
       Injeta CSS se o HTML não
       estiver usando style.css.
    */

    const styleTag = `
<style>
${state.files.css || ""}
</style>
`;


    const scriptTag = `
<script>
${state.files.js || ""}
<\/script>
`;


    if (
        /<\/head>/i.test(html)
    ) {

        html =
            html.replace(
                /<\/head>/i,
                `${styleTag}</head>`
            );

    } else {

        html =
            styleTag +
            html;

    }


    if (
        /<\/body>/i.test(html)
    ) {

        html =
            html.replace(
                /<\/body>/i,
                `${scriptTag}</body>`
            );

    } else {

        html += scriptTag;

    }


    previewFrame.style.display =
        "block";

    emptyPreview.style.display =
        "none";


    previewFrame.srcdoc =
        html;

}


/* =========================================================
   DISPOSITIVOS
   ========================================================= */

function changeDevice(device) {

    const browser =
        document.querySelector(
            ".browser"
        );


    if (device === "desktop") {

        browser.style.width =
            "100%";

        browser.style.maxWidth =
            "1100px";

    }


    if (device === "tablet") {

        browser.style.width =
            "768px";

        browser.style.maxWidth =
            "90%";

    }


    if (device === "mobile") {

        browser.style.width =
            "390px";

        browser.style.maxWidth =
            "90%";

    }

}


function openPreview() {

    if (!state.files.html) {

        showToast(
            "Ainda não existe um site para abrir."
        );

        return;

    }


    saveCurrentEditor();


    let html =
        state.files.html;


    const style =
        `<style>${state.files.css}</style>`;


    const script =
        `<script>${state.files.js}<\/script>`;


    html =
        html.replace(
            /<\/head>/i,
            `${style}</head>`
        );


    html =
        html.replace(
            /<\/body>/i,
            `${script}</body>`
        );


    const blob =
        new Blob(
            [html],
            {
                type: "text/html"
            }
        );


    const url =
        URL.createObjectURL(blob);


    window.open(
        url,
        "_blank"
    );


    setTimeout(
        () => URL.revokeObjectURL(url),
        10000
    );

}


/* =========================================================
   PROJETO
   ========================================================= */

function saveProject(
    showMessage = true
) {

    saveCurrentEditor();


    localStorage.setItem(
        "forgeai_project_name",
        state.projectName
    );


    localStorage.setItem(
        "forgeai_html",
        state.files.html
    );


    localStorage.setItem(
        "forgeai_css",
        state.files.css
    );


    localStorage.setItem(
        "forgeai_js",
        state.files.js
    );


    saveStatus.textContent =
        "Salvo agora";


    if (showMessage) {

        showToast(
            "Projeto salvo."
        );

    }

}


function newProject() {

    const confirmed =
        confirm(
            "Criar um novo projeto? O projeto atual continuará salvo no navegador."
        );


    if (!confirmed)
        return;


    state.files = {

        html: "",

        css: "",

        js: ""

    };


    state.messages = [];

    state.history = [];

    state.projectName =
        "Novo projeto";


    updateProjectName();

    clearChat();

    loadEditor();

    updatePreview();

    showToast(
        "Novo projeto criado."
    );

}


function renameProject() {

    const name =
        prompt(
            "Nome do projeto:",
            state.projectName
        );


    if (!name)
        return;


    state.projectName =
        name.trim();


    updateProjectName();

    saveProject(false);

}


function updateProjectName() {

    projectName.textContent =
        state.projectName;

    topProjectName.textContent =
        state.projectName;

}


/* =========================================================
   DOWNLOAD
   ========================================================= */

function downloadProject() {

    saveCurrentEditor();


    downloadFile(
        "index.html",
        state.files.html
    );


    setTimeout(
        () => {

            downloadFile(
                "style.css",
                state.files.css
            );

        },
        200
    );


    setTimeout(
        () => {

            downloadFile(
                "script.js",
                state.files.js
            );

        },
        400
    );


    showToast(
        "Arquivos baixados."
    );

}


function downloadFile(
    filename,
    content
) {

    const blob =
        new Blob(
            [content || ""],
            {
                type: "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(link);

    link.click();

    link.remove();


    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );

}


/* =========================================================
   COPIAR
   ========================================================= */

async function copyCode() {

    saveCurrentEditor();


    try {

        await navigator.clipboard.writeText(
            state.files[state.activeFile] || ""
        );


        showToast(
            "Código copiado."
        );


    } catch {

        codeEditor.select();

        document.execCommand(
            "copy"
        );

        showToast(
            "Código copiado."
        );

    }

}


/* =========================================================
   API CONFIG
   ========================================================= */

function openApiModal() {

    $("apiModal")
        .classList.add("show");


    $("apiKeyInput").value =
        apiKey;


    $("modelInput").value =
        selectedModel;

}


function closeApiModal() {

    $("apiModal")
        .classList.remove("show");

}


function saveApiConfig() {

    const key =
        $("apiKeyInput")
            .value
            .trim();


    const model =
        $("modelInput")
            .value;


    if (!key) {

        showToast(
            "Digite uma API Key."
        );

        return;

    }


    apiKey =
        key;

    selectedModel =
        model;


    localStorage.setItem(
        "forgeai_groq_key",
        apiKey
    );


    localStorage.setItem(
        "forgeai_model",
        selectedModel
    );


    updateApiStatus();

    closeApiModal();

    showToast(
        "Groq conectada."
    );

}


function updateApiStatus() {

    if (apiKey) {

        apiStatus.textContent =
            selectedModel;

        statusDot.style.background =
            "#22c55e";

    } else {

        apiStatus.textContent =
            "Clique para configurar";

        statusDot.style.background =
            "#f59e0b";

    }

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function setGenerating(value) {

    state.isGenerating =
        value;

    sendBtn.disabled =
        value;

    userInput.disabled =
        value;


    if (value) {

        sendBtn.textContent =
            "…";

    } else {

        sendBtn.textContent =
            "↑";

    }

}


function autoResizeTextarea() {

    userInput.style.height =
        "auto";


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            130
        ) + "px";

}


let toastTimer;

function showToast(message) {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   ATALHOS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           Ctrl + S
        */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            saveProject();

        }


        /*
           Ctrl + Enter
        */

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   CLIQUE NO STATUS DA API
   ========================================================= */

document
    .querySelector(".api-status")
    .addEventListener(
        "click",
        openApiModal
    );


/* =========================================================
   FIM
   ========================================================= */
