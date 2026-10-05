"use strict";

/* =========================================================
   FORGE — AI WEBSITE BUILDER
   Compatível com o index.html atual
   ========================================================= */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const STORAGE = {
    apiKey: "forge_groq_api_key",
    model: "forge_groq_model",
    project: "forge_project",
    history: "forge_history"
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/* =========================================================
   FONTES
   ========================================================= */

const FONT_LIBRARY = [
    "Inter",
    "Plus Jakarta Sans",
    "Poppins",
    "Montserrat",
    "DM Sans",
    "Manrope",
    "Space Grotesk",
    "Playfair Display",
    "Cormorant Garamond",
    "Roboto",
    "Outfit"
];

/* =========================================================
   IMAGENS
   ========================================================= */

const IMAGE_LIBRARY = [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=85"
];

/* =========================================================
   ELEMENTOS DO HTML
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
    newProjectBtn: $("#newProjectBtn"),
    projectName: $("#projectName"),
    projectStatus: $("#projectStatus"),

    undoBtn: $("#undoBtn"),
    redoBtn: $("#redoBtn"),
    improveBtn: $("#improveBtn"),

    connectionText: $("#connectionText"),
    connectionDot: $(".connection-dot"),
    settingsBtn: $("#settingsBtn"),

    topProjectName: $("#topProjectName"),
    saveBtn: $("#saveBtn"),
    downloadBtn: $("#downloadBtn"),

    chatMessages: $("#chatMessages"),
    promptInput: $("#promptInput"),
    sendBtn: $("#sendBtn"),

    browserFrame: $("#browserFrame"),
    preview: $("#preview"),
    refreshPreview: $("#refreshPreview"),
    openPreview: $("#openPreview"),

    copyCodeBtn: $("#copyCodeBtn"),
    codeEditor: $("#codeEditor"),
    codeTabs: $$(".code-tab"),

    settingsModal: $("#settingsModal"),
    closeSettings: $("#closeSettings"),
    apiKeyInput: $("#apiKeyInput"),
    modelInput: $("#modelInput"),
    saveSettings: $("#saveSettings"),

    toast: $("#toast")
};

/* =========================================================
   ESTADO
   ========================================================= */

function createEmptySpec() {
    return {
        projectName: "Meu site",

        theme: {
            primary: "#635BFF",
            secondary: "#8B5CF6",
            background: "#FFFFFF",
            surface: "#F7F7FA",
            text: "#111318",
            muted: "#6B7280",
            font: "Inter",
            radius: "20px",
            style: "modern"
        },

        nav: {
            brand: "Meu site",
            links: [
                { label: "Início", href: "#inicio" },
                { label: "Sobre", href: "#sobre" },
                { label: "Serviços", href: "#servicos" },
                { label: "Contato", href: "#contato" }
            ],
            cta: "Começar"
        },

        hero: {
            eyebrow: "SEJA BEM-VINDO",
            title: "Um site bonito para sua ideia.",
            description: "Uma experiência moderna, elegante e feita para apresentar seu negócio.",
            primaryButton: "Começar agora",
            secondaryButton: "Saiba mais",
            image: IMAGE_LIBRARY[0]
        },

        features: [
            {
                icon: "✦",
                title: "Design moderno",
                description: "Visual limpo, profissional e pensado para causar uma boa primeira impressão."
            },
            {
                icon: "⚡",
                title: "Rápido",
                description: "Estrutura leve e responsiva para funcionar bem em qualquer dispositivo."
            },
            {
                icon: "✓",
                title: "Experiência simples",
                description: "Tudo organizado para que seus visitantes encontrem o que precisam."
            }
        ],

        about: {
            title: "Feito para destacar o que realmente importa.",
            description: "Conte aqui a história da sua marca, empresa ou projeto de maneira clara e envolvente.",
            image: IMAGE_LIBRARY[1]
        },

        stats: [
            { number: "10+", label: "Anos de experiência" },
            { number: "500+", label: "Clientes" },
            { number: "98%", label: "Satisfação" },
            { number: "24h", label: "Suporte" }
        ],

        services: [
            {
                title: "Estratégia",
                description: "Planejamento pensado para transformar ideias em resultados.",
                icon: "◎"
            },
            {
                title: "Design",
                description: "Experiências visuais modernas e memoráveis.",
                icon: "◈"
            },
            {
                title: "Tecnologia",
                description: "Soluções digitais rápidas, funcionais e escaláveis.",
                icon: "⌘"
            }
        ],

        products: [
            {
                name: "Produto Premium",
                description: "Uma solução criada para quem busca qualidade.",
                price: "R$ 99",
                image: IMAGE_LIBRARY[2]
            },
            {
                name: "Produto Essencial",
                description: "Tudo o que você precisa para começar.",
                price: "R$ 59",
                image: IMAGE_LIBRARY[3]
            },
            {
                name: "Produto Pro",
                description: "Mais recursos para resultados ainda melhores.",
                price: "R$ 149",
                image: IMAGE_LIBRARY[4]
            }
        ],

        pricing: [
            {
                name: "Essencial",
                price: "R$ 49",
                description: "Para começar.",
                features: ["Recurso 1", "Recurso 2", "Suporte"]
            },
            {
                name: "Profissional",
                price: "R$ 99",
                description: "Para quem quer mais.",
                featured: true,
                features: ["Tudo do Essencial", "Recurso 3", "Recurso 4", "Suporte prioritário"]
            },
            {
                name: "Premium",
                price: "R$ 199",
                description: "Para resultados avançados.",
                features: ["Tudo do Profissional", "Recursos avançados", "Suporte VIP"]
            }
        ],

        testimonials: [
            {
                name: "Marina Silva",
                role: "Cliente",
                text: "O resultado ficou muito melhor do que eu imaginava. O site transmite exatamente a imagem que eu queria."
            },
            {
                name: "Lucas Almeida",
                role: "Empreendedor",
                text: "Design bonito, rápido e muito profissional. Foi exatamente o que eu precisava."
            },
            {
                name: "Ana Costa",
                role: "Cliente",
                text: "Uma experiência excelente. Tudo ficou simples, elegante e fácil de usar."
            }
        ],

        gallery: [
            IMAGE_LIBRARY[5],
            IMAGE_LIBRARY[6],
            IMAGE_LIBRARY[7],
            IMAGE_LIBRARY[8],
            IMAGE_LIBRARY[9],
            IMAGE_LIBRARY[10]
        ],

        faq: [
            {
                question: "Como funciona?",
                answer: "É simples. Você descreve o que precisa e nossa solução cuida do restante."
            },
            {
                question: "Posso entrar em contato?",
                answer: "Sim. Use os canais de contato disponíveis nesta página."
            },
            {
                question: "Funciona no celular?",
                answer: "Sim. O site é totalmente responsivo."
            }
        ],

        cta: {
            title: "Pronto para começar?",
            description: "Dê o próximo passo e transforme sua ideia em realidade.",
            button: "Começar agora"
        },

        contact: {
            title: "Entre em contato",
            description: "Tem alguma dúvida? Estamos aqui para ajudar.",
            email: "contato@exemplo.com",
            phone: "(11) 99999-9999",
            address: "São Paulo, SP"
        },

        footer: {
            text: "Uma marca criada para fazer a diferença.",
            copyright: "© 2026 Todos os direitos reservados."
        }
    };
}

let state = {
    spec: createEmptySpec(),

    files: {
        html: "",
        css: "",
        js: ""
    },

    history: [],
    historyIndex: -1,

    activeFile: "html",

    generating: false
};

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeURL(url, fallback = "") {
    if (!url) return fallback;

    try {
        const parsed = new URL(url, window.location.href);

        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:" ||
            parsed.protocol === "data:"
        ) {
            return parsed.href;
        }
    } catch (_) {}

    return fallback;
}

function slugify(text) {
    return String(text || "site")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "site";
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function debounce(fn, delay = 250) {
    let timer;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

function getApiKey() {
    return localStorage.getItem(STORAGE.apiKey) || "";
}

function getModel() {
    return localStorage.getItem(STORAGE.model) || DEFAULT_MODEL;
}

function setStatus(text) {
    if (els.projectStatus) {
        els.projectStatus.textContent = text;
    }
}

function setConnection(connected) {
    if (els.connectionText) {
        els.connectionText.textContent = connected
            ? "API configurada"
            : "API não configurada";
    }

    if (els.connectionDot) {
        els.connectionDot.style.opacity = connected ? "1" : ".45";
    }
}

function showToast(message) {
    if (!els.toast) return;

    els.toast.textContent = message;
    els.toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        els.toast.classList.remove("show");
    }, 2600);
}

/* =========================================================
   INTENÇÃO DO USUÁRIO
   ========================================================= */

function detectIntent(prompt) {
    const text = String(prompt || "").toLowerCase().trim();

    const newSiteWords = [
        "novo site",
        "criar outro site",
        "começar outro",
        "começar do zero",
        "do zero",
        "apagar tudo",
        "apaga tudo",
        "apague tudo",
        "esquece o site",
        "esquecer o site",
        "refazer o site",
        "recomeçar",
        "recomecar",
        "novo projeto"
    ];

    if (newSiteWords.some(word => text.includes(word))) {
        return "new";
    }

    const improveWords = [
        "melhore",
        "melhorar",
        "deixe mais bonito",
        "deixa mais bonito",
        "mais profissional",
        "mais premium",
        "melhore o design",
        "melhorar design",
        "modernize",
        "modernizar"
    ];

    if (improveWords.some(word => text.includes(word))) {
        return "improve";
    }

    return "edit";
}

/* =========================================================
   PROMPT DA IA
   ========================================================= */

function buildSystemPrompt(mode = "edit") {
    const currentSpec = JSON.stringify(state.spec, null, 2);

    return `
Você é a inteligência artificial do Forge, um construtor de sites.

Sua tarefa é criar ou alterar um SITE COMPLETO.

MODO ATUAL: ${mode}

REGRAS IMPORTANTES:

1. Responda SOMENTE com JSON válido.
2. NÃO use markdown.
3. NÃO coloque \`\`\`json.
4. Não escreva explicações fora do JSON.
5. Preserve partes existentes quando o usuário pedir apenas uma alteração.
6. Se o usuário pedir um site novo, crie uma identidade completamente nova.
7. O resultado deve parecer um site profissional feito por um designer.
8. Use textos reais e específicos para o negócio, evitando "Lorem ipsum".
9. Escolha cores coerentes.
10. Escolha uma fonte da lista:
${FONT_LIBRARY.join(", ")}
11. Para imagens, use URLs de imagens do Unsplash.
12. Nunca invente URL de imagem. Use somente URLs do Unsplash ou URLs já presentes.
13. O site deve funcionar muito bem no celular.
14. Não crie código HTML, CSS ou JavaScript na resposta.
15. Você está alterando apenas o JSON da estrutura do site.

ESTRUTURA OBRIGATÓRIA:

{
  "projectName": "Nome do projeto",

  "theme": {
    "primary": "#635BFF",
    "secondary": "#8B5CF6",
    "background": "#FFFFFF",
    "surface": "#F7F7FA",
    "text": "#111318",
    "muted": "#6B7280",
    "font": "Inter",
    "radius": "20px",
    "style": "modern"
  },

  "nav": {
    "brand": "Marca",
    "links": [
      {"label": "Início", "href": "#inicio"},
      {"label": "Sobre", "href": "#sobre"},
      {"label": "Serviços", "href": "#servicos"},
      {"label": "Contato", "href": "#contato"}
    ],
    "cta": "Começar"
  },

  "hero": {
    "eyebrow": "",
    "title": "",
    "description": "",
    "primaryButton": "",
    "secondaryButton": "",
    "image": ""
  },

  "features": [],
  "about": {
    "title": "",
    "description": "",
    "image": ""
  },

  "stats": [],
  "services": [],
  "products": [],
  "pricing": [],
  "testimonials": [],
  "gallery": [],
  "faq": [],

  "cta": {
    "title": "",
    "description": "",
    "button": ""
  },

  "contact": {
    "title": "",
    "description": "",
    "email": "",
    "phone": "",
    "address": ""
  },

  "footer": {
    "text": "",
    "copyright": ""
  }
}

JSON ATUAL DO PROJETO:
${currentSpec}
`;
}

/* =========================================================
   NORMALIZAÇÃO DA RESPOSTA
   ========================================================= */

function normalizeSpec(input) {
    const base = createEmptySpec();

    if (!input || typeof input !== "object") {
        return base;
    }

    const output = {
        ...base,
        ...input,

        theme: {
            ...base.theme,
            ...(input.theme || {})
        },

        nav: {
            ...base.nav,
            ...(input.nav || {})
        },

        hero: {
            ...base.hero,
            ...(input.hero || {})
        },

        about: {
            ...base.about,
            ...(input.about || {})
        },

        cta: {
            ...base.cta,
            ...(input.cta || {})
        },

        contact: {
            ...base.contact,
            ...(input.contact || {})
        },

        footer: {
            ...base.footer,
            ...(input.footer || {})
        }
    };

    if (!Array.isArray(output.features) || !output.features.length) {
        output.features = base.features;
    }

    if (!Array.isArray(output.stats) || !output.stats.length) {
        output.stats = base.stats;
    }

    if (!Array.isArray(output.services) || !output.services.length) {
        output.services = base.services;
    }

    if (!Array.isArray(output.products) || !output.products.length) {
        output.products = [];
    }

    if (!Array.isArray(output.pricing) || !output.pricing.length) {
        output.pricing = [];
    }

    if (!Array.isArray(output.testimonials) || !output.testimonials.length) {
        output.testimonials = base.testimonials;
    }

    if (!Array.isArray(output.gallery)) {
        output.gallery = [];
    }

    if (!Array.isArray(output.faq) || !output.faq.length) {
        output.faq = base.faq;
    }

    if (!Array.isArray(output.nav.links) || !output.nav.links.length) {
        output.nav.links = base.nav.links;
    }

    output.theme.font = FONT_LIBRARY.includes(output.theme.font)
        ? output.theme.font
        : "Inter";

    return output;
}

function extractJSON(text) {
    if (!text) {
        throw new Error("A IA não retornou nada.");
    }

    let clean = String(text).trim();

    clean = clean
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

    try {
        return JSON.parse(clean);
    } catch (_) {}

    const first = clean.indexOf("{");
    const last = clean.lastIndexOf("}");

    if (first !== -1 && last !== -1 && last > first) {
        const possible = clean.slice(first, last + 1);

        try {
            return JSON.parse(possible);
        } catch (_) {}
    }

    throw new Error("A resposta da IA não veio em JSON válido.");
}

/* =========================================================
   GROQ
   ========================================================= */

async function askGroq(userPrompt, mode = "edit") {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error("Configure sua Groq API Key primeiro.");
    }

    const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
            model: getModel(),

            temperature: 0.7,

            max_tokens: 8000,

            messages: [
                {
                    role: "system",
                    content: buildSystemPrompt(mode)
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        })
    });

    let data;

    try {
        data = await response.json();
    } catch (_) {
        throw new Error("A Groq retornou uma resposta inválida.");
    }

    if (!response.ok) {
        const message =
            data?.error?.message ||
            `Erro da Groq (${response.status}).`;

        throw new Error(message);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("A IA não retornou conteúdo.");
    }

    return extractJSON(content);
}

/* =========================================================
   HTML DO SITE GERADO
   ========================================================= */

function renderNav(spec) {
    const links = (spec.nav.links || [])
        .map(link => `
            <a href="${escapeHTML(link.href || "#")}">
                ${escapeHTML(link.label)}
            </a>
        `)
        .join("");

    return `
        <header class="site-nav">
            <div class="container nav-inner">
                <a class="brand" href="#inicio">
                    ${escapeHTML(spec.nav.brand)}
                </a>

                <nav class="nav-links">
                    ${links}
                </nav>

                <a class="nav-cta" href="#contato">
                    ${escapeHTML(spec.nav.cta)}
                </a>

                <button class="mobile-menu" aria-label="Abrir menu">
                    ☰
                </button>
            </div>
        </header>
    `;
}

function renderHero(spec) {
    const image = safeURL(
        spec.hero.image,
        IMAGE_LIBRARY[0]
    );

    return `
        <section class="hero" id="inicio">
            <div class="container hero-grid">

                <div class="hero-content">
                    <span class="eyebrow">
                        ${escapeHTML(spec.hero.eyebrow)}
                    </span>

                    <h1>
                        ${escapeHTML(spec.hero.title)}
                    </h1>

                    <p>
                        ${escapeHTML(spec.hero.description)}
                    </p>

                    <div class="hero-actions">
                        <a class="button button-primary" href="#contato">
                            ${escapeHTML(spec.hero.primaryButton)}
                        </a>

                        <a class="button button-secondary" href="#sobre">
                            ${escapeHTML(spec.hero.secondaryButton)}
                        </a>
                    </div>
                </div>

                <div class="hero-visual">
                    <div class="hero-glow"></div>

                    <img
                        src="${image}"
                        alt="${escapeHTML(spec.nav.brand)}"
                        loading="eager"
                    />
                </div>

            </div>
        </section>
    `;
}

function renderFeatures(spec) {
    if (!spec.features?.length) return "";

    return `
        <section class="section features-section">
            <div class="container">

                <div class="section-heading center">
                    <span class="eyebrow">POR QUE ESCOLHER</span>
                    <h2>Feito para entregar uma experiência melhor.</h2>
                </div>

                <div class="features-grid">
                    ${spec.features.map(item => `
                        <article class="feature-card">
                            <div class="feature-icon">
                                ${escapeHTML(item.icon || "✦")}
                            </div>

                            <h3>
                                ${escapeHTML(item.title)}
                            </h3>

                            <p>
                                ${escapeHTML(item.description)}
                            </p>
                        </article>
                    `).join("")}
                </div>

            </div>
        </section>
    `;
}

function renderAbout(spec) {
    const image = safeURL(
        spec.about.image,
        IMAGE_LIBRARY[1]
    );

    return `
        <section class="section about-section" id="sobre">
            <div class="container about-grid">

                <div class="about-image">
                    <img
                        src="${image}"
                        alt=""
                        loading="lazy"
                    />
                </div>

                <div class="about-content">
                    <span class="eyebrow">SOBRE NÓS</span>

                    <h2>
                        ${escapeHTML(spec.about.title)}
                    </h2>

                    <p>
                        ${escapeHTML(spec.about.description)}
                    </p>

                    <a class="text-link" href="#contato">
                        Conheça mais
                        <span>→</span>
                    </a>
                </div>

            </div>
        </section>
    `;
}

function renderStats(spec) {
    if (!spec.stats?.length) return "";

    return `
        <section class="stats-section">
            <div class="container stats-grid">

                ${spec.stats.map(item => `
                    <div class="stat">
                        <strong>
                            ${escapeHTML(item.number)}
                        </strong>

                        <span>
                            ${escapeHTML(item.label)}
                        </span>
                    </div>
                `).join("")}

            </div>
        </section>
    `;
}

function renderServices(spec) {
    if (!spec.services?.length) return "";

    return `
        <section class="section" id="servicos">
            <div class="container">

                <div class="section-heading">
                    <div>
                        <span class="eyebrow">SERVIÇOS</span>
                        <h2>Como podemos ajudar.</h2>
                    </div>

                    <p>
                        Soluções pensadas para transformar suas ideias em algo real.
                    </p>
                </div>

                <div class="services-grid">
                    ${spec.services.map(item => `
                        <article class="service-card">

                            <div class="service-icon">
                                ${escapeHTML(item.icon || "✦")}
                            </div>

                            <h3>
                                ${escapeHTML(item.title)}
                            </h3>

                            <p>
                                ${escapeHTML(item.description)}
                            </p>

                            <a href="#contato">
                                Saiba mais →
                            </a>

                        </article>
                    `).join("")}
                </div>

            </div>
        </section>
    `;
}

function renderProducts(spec) {
    if (!spec.products?.length) return "";

    return `
        <section class="section products-section">
            <div class="container">

                <div class="section-heading center">
                    <span class="eyebrow">PRODUTOS</span>
                    <h2>Escolha o que combina com você.</h2>
                </div>

                <div class="products-grid">

                    ${spec.products.map(item => {
                        const image = safeURL(
                            item.image,
                            IMAGE_LIBRARY[2]
                        );

                        return `
                            <article class="product-card">

                                <div class="product-image">
                                    <img
                                        src="${image}"
                                        alt="${escapeHTML(item.name)}"
                                        loading="lazy"
                                    />
                                </div>

                                <div class="product-body">
                                    <h3>
                                        ${escapeHTML(item.name)}
                                    </h3>

                                    <p>
                                        ${escapeHTML(item.description)}
                                    </p>

                                    <div class="product-bottom">
                                        <strong>
                                            ${escapeHTML(item.price)}
                                        </strong>

                                        <a href="#contato">
                                            Comprar
                                        </a>
                                    </div>
                                </div>

                            </article>
                        `;
                    }).join("")}

                </div>
            </div>
        </section>
    `;
}

function renderPricing(spec) {
    if (!spec.pricing?.length) return "";

    return `
        <section class="section pricing-section">
            <div class="container">

                <div class="section-heading center">
                    <span class="eyebrow">PLANOS</span>
                    <h2>Escolha seu plano.</h2>
                </div>

                <div class="pricing-grid">

                    ${spec.pricing.map(item => `
                        <article class="pricing-card ${item.featured ? "featured" : ""}">

                            ${item.featured ? `
                                <div class="popular-badge">
                                    Mais escolhido
                                </div>
                            ` : ""}

                            <h3>
                                ${escapeHTML(item.name)}
                            </h3>

                            <p>
                                ${escapeHTML(item.description)}
                            </p>

                            <div class="price">
                                ${escapeHTML(item.price)}
                            </div>

                            <ul>
                                ${(item.features || []).map(feature => `
                                    <li>
                                        <span>✓</span>
                                        ${escapeHTML(feature)}
                                    </li>
                                `).join("")}
                            </ul>

                            <a class="button ${item.featured ? "button-primary" : "button-secondary"}" href="#contato">
                                Escolher plano
                            </a>

                        </article>
                    `).join("")}

                </div>
            </div>
        </section>
    `;
}

function renderTestimonials(spec) {
    if (!spec.testimonials?.length) return "";

    return `
        <section class="section testimonials-section">
            <div class="container">

                <div class="section-heading center">
                    <span class="eyebrow">DEPOIMENTOS</span>
                    <h2>Quem usa, recomenda.</h2>
                </div>

                <div class="testimonials-grid">

                    ${spec.testimonials.map(item => `
                        <article class="testimonial-card">

                            <div class="stars">
                                ★★★★★
                            </div>

                            <p>
                                “${escapeHTML(item.text)}”
                            </p>

                            <div class="testimonial-author">
                                <div class="avatar">
                                    ${escapeHTML(
                                        String(item.name || "A").charAt(0)
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        ${escapeHTML(item.name)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(item.role)}
                                    </span>
                                </div>
                            </div>

                        </article>
                    `).join("")}

                </div>
            </div>
        </section>
    `;
}

function renderGallery(spec) {
    if (!spec.gallery?.length) return "";

    return `
        <section class="section gallery-section">
            <div class="container">

                <div class="section-heading">
                    <div>
                        <span class="eyebrow">GALERIA</span>
                        <h2>Um pouco do nosso trabalho.</h2>
                    </div>
                </div>

                <div class="gallery-grid">

                    ${spec.gallery.map((image, index) => `
                        <div class="gallery-item gallery-${index + 1}">
                            <img
                                src="${safeURL(image, IMAGE_LIBRARY[index % IMAGE_LIBRARY.length])}"
                                alt="Imagem da galeria"
                                loading="lazy"
                            />
                        </div>
                    `).join("")}

                </div>

            </div>
        </section>
    `;
}

function renderFAQ(spec) {
    if (!spec.faq?.length) return "";

    return `
        <section class="section faq-section">
            <div class="container faq-container">

                <div class="section-heading center">
                    <span class="eyebrow">DÚVIDAS</span>
                    <h2>Perguntas frequentes.</h2>
                </div>

                <div class="faq-list">

                    ${spec.faq.map((item, index) => `
                        <details ${index === 0 ? "open" : ""}>
                            <summary>
                                ${escapeHTML(item.question)}
                                <span>＋</span>
                            </summary>

                            <p>
                                ${escapeHTML(item.answer)}
                            </p>
                        </details>
                    `).join("")}

                </div>

            </div>
        </section>
    `;
}

function renderCTA(spec) {
    return `
        <section class="cta-section">
            <div class="container">

                <div class="cta-box">

                    <div>
                        <span class="eyebrow">
                            VAMOS COMEÇAR?
                        </span>

                        <h2>
                            ${escapeHTML(spec.cta.title)}
                        </h2>

                        <p>
                            ${escapeHTML(spec.cta.description)}
                        </p>
                    </div>

                    <a class="button button-white" href="#contato">
                        ${escapeHTML(spec.cta.button)}
                    </a>

                </div>

            </div>
        </section>
    `;
}

function renderContact(spec) {
    return `
        <section class="section contact-section" id="contato">
            <div class="container contact-grid">

                <div>
                    <span class="eyebrow">CONTATO</span>

                    <h2>
                        ${escapeHTML(spec.contact.title)}
                    </h2>

                    <p>
                        ${escapeHTML(spec.contact.description)}
                    </p>
                </div>

                <div class="contact-info">

                    <a href="mailto:${escapeHTML(spec.contact.email)}">
                        <span>✉</span>
                        ${escapeHTML(spec.contact.email)}
                    </a>

                    <a href="tel:${escapeHTML(spec.contact.phone)}">
                        <span>⌕</span>
                        ${escapeHTML(spec.contact.phone)}
                    </a>

                    <div>
                        <span>⌖</span>
                        ${escapeHTML(spec.contact.address)}
                    </div>

                </div>

            </div>
        </section>
    `;
}

function renderFooter(spec) {
    return `
        <footer class="site-footer">
            <div class="container footer-inner">

                <div>
                    <strong>
                        ${escapeHTML(spec.nav.brand)}
                    </strong>

                    <p>
                        ${escapeHTML(spec.footer.text)}
                    </p>
                </div>

                <span>
                    ${escapeHTML(spec.footer.copyright)}
                </span>

            </div>
        </footer>
    `;
}

/* =========================================================
   CSS DO SITE GERADO
   ========================================================= */

function generateSiteCSS(spec) {
    const t = spec.theme;

    return `
@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        t.font
    ).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap');

:root {
    --primary: ${t.primary};
    --secondary: ${t.secondary};
    --background: ${t.background};
    --surface: ${t.surface};
    --text: ${t.text};
    --muted: ${t.muted};
    --radius: ${t.radius};
    --font: "${t.font}", sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font);
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

body,
button,
input,
textarea {
    font-family: var(--font);
}

img {
    max-width: 100%;
    display: block;
}

a {
    color: inherit;
    text-decoration: none;
}

button {
    border: 0;
    cursor: pointer;
}

.container {
    width: min(1160px, calc(100% - 40px));
    margin-inline: auto;
}

.section {
    padding: 110px 0;
}

.eyebrow {
    display: inline-block;
    margin-bottom: 18px;
    color: var(--primary);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .16em;
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 40px;
    margin-bottom: 55px;
}

.section-heading.center {
    display: block;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.section-heading h2,
.about-content h2,
.contact-section h2 {
    font-size: clamp(34px, 5vw, 58px);
    line-height: 1.05;
    letter-spacing: -.045em;
}

.section-heading p {
    max-width: 420px;
    color: var(--muted);
}

.site-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: color-mix(in srgb, var(--background) 88%, transparent);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(0,0,0,.06);
}

.nav-inner {
    min-height: 78px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
}

.brand {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -.04em;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 30px;
}

.nav-links a {
    color: var(--muted);
    font-size: 14px;
    font-weight: 600;
    transition: .2s ease;
}

.nav-links a:hover {
    color: var(--text);
}

.nav-cta {
    padding: 11px 18px;
    border-radius: 999px;
    background: var(--text);
    color: white;
    font-size: 13px;
    font-weight: 700;
}

.mobile-menu {
    display: none;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--surface);
    font-size: 20px;
}

.hero {
    position: relative;
    overflow: hidden;
    padding: 100px 0 120px;
}

.hero-grid {
    min-height: 620px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 70px;
}

.hero-content h1 {
    max-width: 720px;
    font-size: clamp(52px, 7vw, 88px);
    line-height: .98;
    letter-spacing: -.065em;
}

.hero-content > p {
    max-width: 610px;
    margin-top: 28px;
    color: var(--muted);
    font-size: 18px;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 36px;
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    padding: 0 24px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    transition: transform .2s ease, box-shadow .2s ease;
}

.button:hover {
    transform: translateY(-2px);
}

.button-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 15px 35px color-mix(in srgb, var(--primary) 30%, transparent);
}

.button-secondary {
    background: var(--surface);
    border: 1px solid rgba(0,0,0,.08);
}

.button-white {
    background: white;
    color: var(--text);
}

.hero-visual {
    position: relative;
}

.hero-visual img {
    position: relative;
    width: 100%;
    height: 580px;
    object-fit: cover;
    border-radius: 32px;
    box-shadow: 0 30px 80px rgba(0,0,0,.15);
}

.hero-glow {
    position: absolute;
    width: 260px;
    height: 260px;
    right: -80px;
    top: -80px;
    border-radius: 50%;
    background: var(--primary);
    opacity: .18;
    filter: blur(60px);
}

.features-grid,
.services-grid,
.products-grid,
.pricing-grid,
.testimonials-grid {
    display: grid;
    gap: 20px;
}

.features-grid {
    grid-template-columns: repeat(3, 1fr);
}

.feature-card,
.service-card,
.product-card,
.pricing-card,
.testimonial-card {
    background: var(--surface);
    border: 1px solid rgba(0,0,0,.07);
    border-radius: var(--radius);
}

.feature-card {
    padding: 34px;
}

.feature-icon,
.service-icon {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    background: color-mix(in srgb, var(--primary) 10%, white);
    color: var(--primary);
    font-size: 21px;
    margin-bottom: 25px;
}

.feature-card h3,
.service-card h3,
.product-card h3,
.pricing-card h3 {
    font-size: 20px;
    margin-bottom: 10px;
}

.feature-card p,
.service-card p,
.product-card p,
.pricing-card > p,
.testimonial-card p,
.about-content p,
.contact-section p {
    color: var(--muted);
}

.about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 80px;
}

.about-image img {
    width: 100%;
    height: 600px;
    object-fit: cover;
    border-radius: 30px;
}

.about-content p {
    max-width: 570px;
    margin-top: 25px;
    font-size: 18px;
}

.text-link {
    display: inline-flex;
    gap: 10px;
    margin-top: 30px;
    color: var(--primary);
    font-weight: 700;
}

.stats-section {
    padding: 70px 0;
    background: var(--text);
    color: white;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
}

.stat strong {
    display: block;
    font-size: clamp(34px, 5vw, 58px);
    line-height: 1;
}

.stat span {
    display: block;
    margin-top: 10px;
    color: rgba(255,255,255,.6);
}

.services-grid {
    grid-template-columns: repeat(3, 1fr);
}

.service-card {
    padding: 35px;
    transition: transform .2s ease, box-shadow .2s ease;
}

.service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0,0,0,.08);
}

.service-card a {
    display: inline-block;
    margin-top: 28px;
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
}

.products-grid {
    grid-template-columns: repeat(3, 1fr);
}

.product-card {
    overflow: hidden;
}

.product-image {
    aspect-ratio: 1 / .82;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .5s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

.product-body {
    padding: 25px;
}

.product-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-top: 25px;
}

.product-bottom strong {
    font-size: 21px;
}

.product-bottom a {
    color: var(--primary);
    font-weight: 700;
}

.pricing-grid {
    grid-template-columns: repeat(3, 1fr);
    align-items: stretch;
}

.pricing-card {
    position: relative;
    padding: 35px;
}

.pricing-card.featured {
    border: 2px solid var(--primary);
    box-shadow: 0 25px 60px color-mix(in srgb, var(--primary) 15%, transparent);
}

.popular-badge {
    position: absolute;
    top: 18px;
    right: 18px;
    padding: 7px 11px;
    border-radius: 999px;
    background: var(--primary);
    color: white;
    font-size: 10px;
    font-weight: 800;
}

.price {
    margin: 25px 0;
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -.05em;
}

.pricing-card ul {
    list-style: none;
    margin-bottom: 30px;
}

.pricing-card li {
    display: flex;
    gap: 10px;
    margin: 13px 0;
    color: var(--muted);
}

.pricing-card li span {
    color: var(--primary);
    font-weight: 800;
}

.pricing-card .button {
    width: 100%;
}

.testimonials-grid {
    grid-template-columns: repeat(3, 1fr);
}

.testimonial-card {
    padding: 32px;
}

.stars {
    color: #F59E0B;
    letter-spacing: 2px;
    margin-bottom: 22px;
}

.testimonial-card p {
    font-size: 16px;
}

.testimonial-author {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 30px;
}

.avatar {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--text);
    color: white;
    font-weight: 700;
}

.testimonial-author strong,
.testimonial-author span {
    display: block;
}

.testimonial-author span {
    color: var(--muted);
    font-size: 12px;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 230px;
    gap: 15px;
}

.gallery-item {
    overflow: hidden;
    border-radius: 20px;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-1 {
    grid-column: span 7;
}

.gallery-2 {
    grid-column: span 5;
}

.gallery-3,
.gallery-4,
.gallery-5,
.gallery-6 {
    grid-column: span 3;
}

.faq-container {
    max-width: 800px;
}

.faq-list {
    display: grid;
    gap: 10px;
}

.faq-list details {
    padding: 23px 25px;
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 17px;
    background: var(--surface);
}

.faq-list summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    cursor: pointer;
    font-weight: 700;
    list-style: none;
}

.faq-list summary::-webkit-details-marker {
    display: none;
}

.faq-list summary span {
    font-size: 22px;
    color: var(--primary);
}

.faq-list details p {
    margin-top: 15px;
    color: var(--muted);
}

.cta-section {
    padding: 60px 0 100px;
}

.cta-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding: 65px;
    border-radius: 32px;
    background: linear-gradient(
        135deg,
        var(--primary),
        var(--secondary)
    );
    color: white;
}

.cta-box .eyebrow {
    color: rgba(255,255,255,.75);
}

.cta-box h2 {
    max-width: 700px;
    font-size: clamp(36px, 5vw, 60px);
    line-height: 1;
    letter-spacing: -.05em;
}

.cta-box p {
    max-width: 600px;
    margin-top: 16px;
    color: rgba(255,255,255,.75);
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
}

.contact-section h2 {
    margin-bottom: 20px;
}

.contact-section p {
    max-width: 550px;
}

.contact-info {
    display: grid;
    gap: 14px;
}

.contact-info a,
.contact-info > div {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border-radius: 16px;
    background: var(--surface);
    border: 1px solid rgba(0,0,0,.07);
}

.contact-info span {
    color: var(--primary);
    font-size: 20px;
}

.site-footer {
    padding: 45px 0;
    border-top: 1px solid rgba(0,0,0,.08);
}

.footer-inner {
    display: flex;
    justify-content: space-between;
    gap: 30px;
}

.footer-inner strong {
    font-size: 20px;
}

.footer-inner p {
    margin-top: 5px;
    color: var(--muted);
}

.footer-inner > span {
    color: var(--muted);
    font-size: 13px;
}

/* RESPONSIVO */

@media (max-width: 900px) {

    .nav-links,
    .nav-cta {
        display: none;
    }

    .mobile-menu {
        display: block;
    }

    .hero-grid,
    .about-grid,
    .contact-grid {
        grid-template-columns: 1fr;
    }

    .hero {
        padding-top: 70px;
    }

    .hero-visual img {
        height: 430px;
    }

    .features-grid,
    .services-grid,
    .products-grid,
    .pricing-grid,
    .testimonials-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .gallery-1,
    .gallery-2 {
        grid-column: span 6;
    }

    .gallery-3,
    .gallery-4,
    .gallery-5,
    .gallery-6 {
        grid-column: span 6;
    }

    .cta-box {
        padding: 45px;
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (max-width: 600px) {

    .container {
        width: min(100% - 28px, 1160px);
    }

    .section {
        padding: 75px 0;
    }

    .hero-content h1 {
        font-size: 52px;
    }

    .hero-visual img {
        height: 350px;
        border-radius: 22px;
    }

    .features-grid,
    .services-grid,
    .products-grid,
    .pricing-grid,
    .testimonials-grid,
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .section-heading {
        display: block;
    }

    .section-heading p {
        margin-top: 18px;
    }

    .about-image img {
        height: 400px;
    }

    .gallery-grid {
        grid-template-columns: 1fr;
        grid-auto-rows: 250px;
    }

    .gallery-1,
    .gallery-2,
    .gallery-3,
    .gallery-4,
    .gallery-5,
    .gallery-6 {
        grid-column: span 1;
    }

    .cta-box {
        padding: 35px 25px;
        border-radius: 24px;
    }

    .footer-inner {
        flex-direction: column;
    }
}
`;
}

/* =========================================================
   JS DO SITE GERADO
   ========================================================= */

function generateSiteJS() {
    return `
document.addEventListener("DOMContentLoaded", () => {

    const menu = document.querySelector(".mobile-menu");
    const nav = document.querySelector(".nav-links");

    if (menu && nav) {
        menu.addEventListener("click", () => {
            nav.classList.toggle("mobile-open");
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const target = document.querySelector(link.getAttribute("href"));

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

});
`;
}

/* =========================================================
   GERAR SITE COMPLETO
   ========================================================= */

function generateSiteHTML(spec) {
    const font = encodeURIComponent(spec.theme.font)
        .replace(/%20/g, "+");

    const css = generateSiteCSS(spec);
    const js = generateSiteJS();

    return `<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>${escapeHTML(spec.projectName)}</title>

<meta
    name="description"
    content="${escapeHTML(spec.hero.description)}"
>

<link
    rel="preconnect"
    href="https://fonts.googleapis.com"
>

<link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
>

<link
    href="https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
>

<style>
${css}
</style>

</head>

<body>

${renderNav(spec)}

<main>

${renderHero(spec)}

${renderFeatures(spec)}

${renderAbout(spec)}

${renderStats(spec)}

${renderServices(spec)}

${renderProducts(spec)}

${renderPricing(spec)}

${renderTestimonials(spec)}

${renderGallery(spec)}

${renderFAQ(spec)}

${renderCTA(spec)}

${renderContact(spec)}

</main>

${renderFooter(spec)}

<script>
${js}
<\/script>

</body>

</html>`;
}

/* =========================================================
   ATUALIZAR ARQUIVOS
   ========================================================= */

function rebuildFiles() {
    state.files.html = generateSiteHTML(state.spec);
    state.files.css = generateSiteCSS(state.spec);
    state.files.js = generateSiteJS();

    updateEditor();
    updatePreview();
}

/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {
    if (!els.preview) return;

    els.preview.srcdoc = state.files.html;
}

function refreshPreview() {
    if (!els.preview) return;

    const current = state.files.html;

    els.preview.srcdoc = "";

    setTimeout(() => {
        els.preview.srcdoc = current;
    }, 30);
}

function openPreview() {
    const blob = new Blob(
        [state.files.html],
        { type: "text/html;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const tab = window.open(url, "_blank");

    if (!tab) {
        showToast("O navegador bloqueou a nova aba.");
    }

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 60000);
}

/* =========================================================
   EDITOR
   ========================================================= */

function updateEditor() {
    if (!els.codeEditor) return;

    els.codeEditor.value =
        state.files[state.activeFile] || "";

    els.codeTabs.forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.file === state.activeFile
        );
    });
}

function setActiveFile(file) {
    if (!["html", "css", "js"].includes(file)) {
        return;
    }

    state.activeFile = file;

    updateEditor();
}

function saveEditorChanges() {
    if (!els.codeEditor) return;

    state.files[state.activeFile] =
        els.codeEditor.value;

    if (state.activeFile === "html") {
        updatePreview();
    }
}

/* =========================================================
   CHAT
   ========================================================= */

function addUserMessage(text) {
    if (!els.chatMessages) return;

    const message = document.createElement("div");

    message.className = "chat-message user-message";

    message.innerHTML = `
        <div class="message-content">
            ${escapeHTML(text).replace(/\n/g, "<br>")}
        </div>
    `;

    els.chatMessages.appendChild(message);

    scrollChat();
}

function addAIMessage(text) {
    if (!els.chatMessages) return;

    const message = document.createElement("div");

    message.className = "chat-message ai-message";

    message.innerHTML = `
        <div class="message-content">
            ${escapeHTML(text).replace(/\n/g, "<br>")}
        </div>
    `;

    els.chatMessages.appendChild(message);

    scrollChat();
}

function addLoadingMessage() {
    if (!els.chatMessages) return null;

    const message = document.createElement("div");

    message.className = "chat-message ai-message loading-message";

    message.innerHTML = `
        <div class="message-content">
            <span class="loading-dots">
                Pensando<span>.</span><span>.</span><span>.</span>
            </span>
        </div>
    `;

    els.chatMessages.appendChild(message);

    scrollChat();

    return message;
}

function scrollChat() {
    if (!els.chatMessages) return;

    els.chatMessages.scrollTop =
        els.chatMessages.scrollHeight;
}

/* =========================================================
   HISTÓRICO
   ========================================================= */

function saveHistoryState() {
    const snapshot = {
        spec: clone(state.spec),
        files: clone(state.files)
    };

    state.history =
        state.history.slice(0, state.historyIndex + 1);

    state.history.push(snapshot);

    if (state.history.length > 30) {
        state.history.shift();
    }

    state.historyIndex =
        state.history.length - 1;

    updateHistoryButtons();

    persistProject();
}

function restoreHistory(index) {
    if (
        index < 0 ||
        index >= state.history.length
    ) {
        return;
    }

    const snapshot = state.history[index];

    state.spec = clone(snapshot.spec);
    state.files = clone(snapshot.files);

    state.historyIndex = index;

    updateProjectName();
    updateEditor();
    updatePreview();
    updateHistoryButtons();

    persistProject();
}

function undo() {
    if (state.historyIndex <= 0) {
        showToast("Nada para desfazer.");
        return;
    }

    restoreHistory(state.historyIndex - 1);
    showToast("Alteração desfeita.");
}

function redo() {
    if (
        state.historyIndex >=
        state.history.length - 1
    ) {
        showToast("Nada para refazer.");
        return;
    }

    restoreHistory(state.historyIndex + 1);
    showToast("Alteração refeita.");
}

function updateHistoryButtons() {
    if (els.undoBtn) {
        els.undoBtn.disabled =
            state.historyIndex <= 0;
    }

    if (els.redoBtn) {
        els.redoBtn.disabled =
            state.historyIndex >= state.history.length - 1;
    }
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function persistProject() {
    try {
        localStorage.setItem(
            STORAGE.project,
            JSON.stringify({
                spec: state.spec,
                files: state.files,
                history: state.history,
                historyIndex: state.historyIndex
            })
        );
    } catch (error) {
        console.warn(
            "Não foi possível salvar o projeto.",
            error
        );
    }
}

function loadProject() {
    try {
        const raw =
            localStorage.getItem(STORAGE.project);

        if (!raw) {
            return false;
        }

        const saved = JSON.parse(raw);

        if (saved.spec) {
            state.spec =
                normalizeSpec(saved.spec);
        }

        if (saved.files) {
            state.files = {
                html: saved.files.html || "",
                css: saved.files.css || "",
                js: saved.files.js || ""
            };
        }

        if (
            Array.isArray(saved.history) &&
            saved.history.length
        ) {
            state.history = saved.history;
            state.historyIndex =
                Number.isInteger(saved.historyIndex)
                    ? saved.historyIndex
                    : saved.history.length - 1;
        }

        return true;

    } catch (error) {
        console.warn(
            "Projeto salvo inválido.",
            error
        );

        return false;
    }
}

/* =========================================================
   PROJETO
   ========================================================= */

function updateProjectName() {
    const name =
        state.spec.projectName || "Meu site";

    if (els.projectName) {
        els.projectName.textContent = name;
    }

    if (els.topProjectName) {
        els.topProjectName.textContent = name;
    }
}

function resetProject() {
    state.spec = createEmptySpec();

    state.files = {
        html: "",
        css: "",
        js: ""
    };

    state.history = [];
    state.historyIndex = -1;

    rebuildFiles();

    saveHistoryState();

    updateProjectName();

    if (els.chatMessages) {
        els.chatMessages.innerHTML = `
            <div class="welcome-card">

                <div class="welcome-icon">✦</div>

                <h2>Que site vamos criar?</h2>

                <p>
                    Fale normalmente. Você pode começar do zero,
                    pedir alterações ou melhorar o design.
                </p>

            </div>
        `;
    }

    setStatus("Pronto para criar");

    persistProject();

    showToast("Novo site criado.");
}

/* =========================================================
   MELHORAR DESIGN
   ========================================================= */

async function improveDesign() {
    if (state.generating) return;

    const apiKey = getApiKey();

    if (!apiKey) {
        openSettings();

        showToast("Configure sua Groq API Key primeiro.");

        return;
    }

    const loading = addLoadingMessage();

    state.generating = true;

    setStatus("Melhorando design...");

    try {
        const result = await askGroq(
            `
Melhore significativamente o design visual do site atual.

Não troque o negócio principal.
Não remova conteúdo importante.

Melhore:
- hierarquia visual
- cores
- tipografia
- espaçamento
- textos
- aparência premium
- organização das seções
- experiência mobile
- imagens

Retorne o JSON completo atualizado.
            `,
            "improve"
        );

        const normalized =
            normalizeSpec(result);

        state.spec = normalized;

        rebuildFiles();

        saveHistoryState();

        updateProjectName();

        setStatus("Design melhorado");

        addAIMessage(
            "Pronto. Melhorei o visual e reorganizei o design do site."
        );

        showToast("Design melhorado.");

    } catch (error) {
        console.error(error);

        addAIMessage(
            `Não consegui melhorar o site: ${error.message}`
        );

        setStatus("Erro");

        showToast(error.message);

    } finally {
        state.generating = false;

        if (loading) {
            loading.remove();
        }
    }
}

/* =========================================================
   GERAR / ALTERAR SITE
   ========================================================= */

async function generateFromPrompt() {
    if (state.generating) return;

    const prompt =
        els.promptInput?.value.trim() || "";

    if (!prompt) {
        showToast("Digite o que você quer criar.");

        els.promptInput?.focus();

        return;
    }

    const apiKey = getApiKey();

    if (!apiKey) {
        openSettings();

        showToast("Configure sua Groq API Key primeiro.");

        return;
    }

    const mode = detectIntent(prompt);

    addUserMessage(prompt);

    if (els.promptInput) {
        els.promptInput.value = "";
        autoResizeTextarea();
    }

    const loading = addLoadingMessage();

    state.generating = true;

    setStatus(
        mode === "new"
            ? "Criando novo site..."
            : "Gerando alterações..."
    );

    if (els.sendBtn) {
        els.sendBtn.disabled = true;
    }

    try {
        if (mode === "new") {
            state.spec = createEmptySpec();
        }

        const result =
            await askGroq(prompt, mode);

        state.spec =
            normalizeSpec(result);

        rebuildFiles();

        saveHistoryState();

        updateProjectName();

        setStatus("Site atualizado");

        addAIMessage(
            mode === "new"
                ? "Site criado! Você pode pedir alterações pelo chat."
                : "Alteração aplicada! Pode continuar pedindo mudanças."
        );

        showToast("Site atualizado com sucesso.");

    } catch (error) {
        console.error(
            "Erro ao gerar site:",
            error
        );

        addAIMessage(
            `Erro: ${error.message}`
        );

        setStatus("Erro ao gerar");

        showToast(error.message);

    } finally {
        state.generating = false;

        if (els.sendBtn) {
            els.sendBtn.disabled = false;
        }

        if (loading) {
            loading.remove();
        }

        updateConnectionStatus();
    }
}

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function openSettings() {
    if (!els.settingsModal) return;

    if (els.apiKeyInput) {
        els.apiKeyInput.value = getApiKey();
    }

    if (els.modelInput) {
        els.modelInput.value = getModel();
    }

    els.settingsModal.classList.remove("hidden");
}

function closeSettings() {
    if (!els.settingsModal) return;

    els.settingsModal.classList.add("hidden");
}

function saveSettings() {
    const key =
        els.apiKeyInput?.value.trim() || "";

    const model =
        els.modelInput?.value.trim() ||
        DEFAULT_MODEL;

    if (key) {
        localStorage.setItem(
            STORAGE.apiKey,
            key
        );
    } else {
        localStorage.removeItem(
            STORAGE.apiKey
        );
    }

    localStorage.setItem(
        STORAGE.model,
        model
    );

    setConnectionStatus();

    closeSettings();

    showToast(
        key
            ? "Configurações salvas."
            : "API Key removida."
    );
}

function updateConnectionStatus() {
    setConnection(
        Boolean(getApiKey())
    );
}

/* =========================================================
   EXPORTAR
   ========================================================= */

function downloadFile(filename, content, type) {
    const blob = new Blob(
        [content],
        { type }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function downloadProject() {
    const name =
        slugify(state.spec.projectName);

    downloadFile(
        `${name}.html`,
        state.files.html,
        "text/html;charset=utf-8"
    );

    setTimeout(() => {
        downloadFile(
            `${name}-style.css`,
            state.files.css,
            "text/css;charset=utf-8"
        );
    }, 150);

    setTimeout(() => {
        downloadFile(
            `${name}-script.js`,
            state.files.js,
            "text/javascript;charset=utf-8"
        );
    }, 300);

    showToast("Arquivos exportados.");
}

/* =========================================================
   COPIAR CÓDIGO
   ========================================================= */

async function copyCode() {
    const text =
        els.codeEditor?.value || "";

    if (!text) {
        showToast("Não há código para copiar.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);

        showToast("Código copiado.");

    } catch (_) {
        if (els.codeEditor) {
            els.codeEditor.select();

            document.execCommand("copy");

            els.codeEditor.setSelectionRange(0, 0);
        }

        showToast("Código copiado.");
    }
}

/* =========================================================
   DISPOSITIVOS
   ========================================================= */

function setDevice(device) {
    if (!els.browserFrame) return;

    els.browserFrame.classList.remove(
        "desktop",
        "tablet",
        "mobile"
    );

    els.browserFrame.classList.add(
        device
    );

    $$(".device-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.device === device
        );
    });
}

/* =========================================================
   TEXTAREA
   ========================================================= */

function autoResizeTextarea() {
    if (!els.promptInput) return;

    els.promptInput.style.height = "auto";

    els.promptInput.style.height =
        Math.min(
            els.promptInput.scrollHeight,
            180
        ) + "px";
}

/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    /* Novo projeto */

    els.newProjectBtn?.addEventListener(
        "click",
        resetProject
    );

    /* Undo */

    els.undoBtn?.addEventListener(
        "click",
        undo
    );

    /* Redo */

    els.redoBtn?.addEventListener(
        "click",
        redo
    );

    /* Melhorar */

    els.improveBtn?.addEventListener(
        "click",
        improveDesign
    );

    /* Configurações */

    els.settingsBtn?.addEventListener(
        "click",
        openSettings
    );

    els.closeSettings?.addEventListener(
        "click",
        closeSettings
    );

    els.saveSettings?.addEventListener(
        "click",
        saveSettings
    );

    els.settingsModal
        ?.querySelector(".modal-backdrop")
        ?.addEventListener(
            "click",
            closeSettings
        );

    /* Salvar */

    els.saveBtn?.addEventListener(
        "click",
        () => {
            saveEditorChanges();

            persistProject();

            showToast("Projeto salvo.");
        }
    );

    /* Exportar */

    els.downloadBtn?.addEventListener(
        "click",
        downloadProject
    );

    /* Gerar */

    els.sendBtn?.addEventListener(
        "click",
        generateFromPrompt
    );

    /* Enter */

    els.promptInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                generateFromPrompt();
            }
        }
    );

    els.promptInput?.addEventListener(
        "input",
        autoResizeTextarea
    );

    /* Sugestões */

    $$(".suggestion").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt || "";

                if (els.promptInput) {
                    els.promptInput.value =
                        prompt;

                    autoResizeTextarea();

                    els.promptInput.focus();
                }
            }
        );

    });

    /* Preview */

    els.refreshPreview?.addEventListener(
        "click",
        refreshPreview
    );

    els.openPreview?.addEventListener(
        "click",
        openPreview
    );

    /* Dispositivos */

    $$(".device-button").forEach(button => {

        button.addEventListener(
            "click",
            () => {
                setDevice(
                    button.dataset.device
                );
            }
        );

    });

    /* Tabs de código */

    els.codeTabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {
                saveEditorChanges();

                setActiveFile(
                    tab.dataset.file
                );
            }
        );

    });

    /* Editor */

    els.codeEditor?.addEventListener(
        "input",
        debounce(() => {
            saveEditorChanges();
        }, 200)
    );

    /* Copiar */

    els.copyCodeBtn?.addEventListener(
        "click",
        copyCode
    );

    /* Teclas */

    document.addEventListener(
        "keydown",
        event => {

            const ctrl =
                event.ctrlKey ||
                event.metaKey;

            if (!ctrl) return;

            if (
                event.key.toLowerCase() === "z" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                undo();
            }

            if (
                event.key.toLowerCase() === "y" ||
                (
                    event.key.toLowerCase() === "z" &&
                    event.shiftKey
                )
            ) {
                event.preventDefault();

                redo();
            }
        }
    );

    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeSettings();
            }

        }
    );
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function init() {

    const loaded =
        loadProject();

    if (!loaded) {
        rebuildFiles();

        saveHistoryState();
    } else {

        /*
         * Se o projeto antigo não tiver
         * arquivos válidos, reconstrói.
         */
        if (
            !state.files.html ||
            !state.files.css
        ) {
            rebuildFiles();
        }
    }

    updateProjectName();

    updateEditor();

    updatePreview();

    updateHistoryButtons();

    updateConnectionStatus();

    setDevice("desktop");

    setupEvents();

    autoResizeTextarea();

    setStatus(
        loaded
            ? "Projeto carregado"
            : "Pronto para criar"
    );

    console.log(
        "Forge inicializado corretamente."
    );
}

init();
