"use strict";

/*
========================================================
FORGE AI — SCRIPT.JS
Gerador de sites por conversa usando Groq
========================================================
*/

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const STORAGE_KEY = "forge_ai_v2_project";
const API_KEY_STORAGE = "forge_ai_groq_key";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* ======================================================
   ESTADO
====================================================== */

let state = {
    apiKey: localStorage.getItem(API_KEY_STORAGE) || "",
    model: DEFAULT_MODEL,

    spec: createEmptySpec(),

    files: {
        html: "",
        css: "",
        js: ""
    },

    activeCodeTab: "html",

    history: [],
    historyIndex: -1,

    loading: false
};


/* ======================================================
   BIBLIOTECA DE FONTES
====================================================== */

const FONT_LIBRARY = [
    "Inter",
    "Plus Jakarta Sans",
    "Poppins",
    "Manrope",
    "DM Sans",
    "Montserrat",
    "Space Grotesk",
    "Outfit",
    "Raleway",
    "Playfair Display",
    "Lora",
    "Merriweather",
    "Bebas Neue"
];


/* ======================================================
   IMAGENS
====================================================== */

const IMAGE_LIBRARY = {
    coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85",
    coffee2: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=85",

    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85",
    food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=85",
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=85",

    fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85",
    sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85",
    store: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",

    office: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
    technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
    meeting: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85",

    gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85",
    fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85",

    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85",
    woman: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85",

    nature: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",
    city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=85",
    architecture: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=85",

    laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=85",
    product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85",
    skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=85",

    travel: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85"
};


/* ======================================================
   UTILITÁRIOS
====================================================== */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function slugify(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


function randomId() {
    return Math.random().toString(36).slice(2, 10);
}


function pick(array, fallback = "") {
    if (!Array.isArray(array) || array.length === 0) {
        return fallback;
    }

    return array[Math.floor(Math.random() * array.length)];
}


function safeArray(value) {
    return Array.isArray(value) ? value : [];
}


/* ======================================================
   SPEC PADRÃO
====================================================== */

function createEmptySpec() {
    return {
        projectName: "Meu novo site",

        style: "modern",
        theme: {
            primary: "#635BFF",
            secondary: "#111827",
            background: "#FFFFFF",
            surface: "#F7F8FA",
            text: "#17191F",
            muted: "#6B7280",
            accent: "#8B5CF6"
        },

        font: "Inter",

        nav: {
            logo: "Minha Marca",
            links: [
                {
                    label: "Início",
                    href: "#inicio"
                },
                {
                    label: "Sobre",
                    href: "#sobre"
                },
                {
                    label: "Serviços",
                    href: "#servicos"
                },
                {
                    label: "Contato",
                    href: "#contato"
                }
            ],
            button: "Fale conosco"
        },

        hero: {
            eyebrow: "FEITO PARA VOCÊ",
            title: "Crie algo incrível.",
            description: "Uma experiência digital moderna, elegante e feita para destacar sua marca.",
            primaryButton: "Começar agora",
            secondaryButton: "Conhecer mais",
            image: IMAGE_LIBRARY.technology
        },

        sections: [
            {
                type: "features",
                title: "Tudo que você precisa",
                description: "Uma solução simples, bonita e eficiente.",
                items: [
                    {
                        icon: "✦",
                        title: "Design moderno",
                        text: "Uma interface pensada para impressionar."
                    },
                    {
                        icon: "⚡",
                        title: "Rápido",
                        text: "Experiência leve e rápida em qualquer dispositivo."
                    },
                    {
                        icon: "✓",
                        title: "Confiável",
                        text: "Construído com atenção em cada detalhe."
                    }
                ]
            },

            {
                type: "about",
                title: "Feito para crescer com você",
                description: "Apresente sua empresa, projeto ou ideia de uma maneira profissional.",
                image: IMAGE_LIBRARY.office
            },

            {
                type: "cta",
                title: "Pronto para começar?",
                description: "Vamos transformar sua ideia em algo incrível.",
                button: "Entrar em contato"
            }
        ],

        footer: {
            text: "© 2026 Minha Marca. Todos os direitos reservados."
        }
    };
}


/* ======================================================
   DETECÇÃO DE INTENÇÃO
====================================================== */

function detectIntent(text) {
    const normalized = normalizeText(text);

    const replaceWords = [
        "novo site",
        "novo projeto",
        "comeca do zero",
        "comece do zero",
        "comecar do zero",
        "começar do zero",
        "do zero",
        "apaga tudo",
        "apagar tudo",
        "apague tudo",
        "refaz tudo",
        "refazer tudo",
        "recomeca",
        "recomeça",
        "recria tudo",
        "muda tudo",
        "troca tudo",
        "quero outro site",
        "faz outro site",
        "cria outro site"
    ];

    for (const phrase of replaceWords) {
        if (normalized.includes(normalizeText(phrase))) {
            return "replace";
        }
    }

    return "update";
}


/* ======================================================
   PROMPT DA IA
====================================================== */

function buildSystemPrompt(mode) {
    const base = `
Você é um diretor de arte, designer UX/UI e desenvolvedor web especialista.

Sua função é criar e modificar especificações de sites profissionais.

Você NÃO deve retornar HTML.
Você NÃO deve retornar CSS.
Você NÃO deve retornar JavaScript.

Você deve retornar SOMENTE um objeto JSON válido.

O JSON precisa seguir exatamente esta estrutura:

{
  "projectName": "Nome do projeto",
  "style": "modern",
  "theme": {
    "primary": "#635BFF",
    "secondary": "#111827",
    "background": "#FFFFFF",
    "surface": "#F7F8FA",
    "text": "#17191F",
    "muted": "#6B7280",
    "accent": "#8B5CF6"
  },
  "font": "Inter",
  "nav": {
    "logo": "Nome",
    "links": [
      {
        "label": "Início",
        "href": "#inicio"
      }
    ],
    "button": "Contato"
  },
  "hero": {
    "eyebrow": "TEXTO",
    "title": "Título principal",
    "description": "Descrição",
    "primaryButton": "Botão",
    "secondaryButton": "Botão",
    "image": "URL"
  },
  "sections": [],
  "footer": {
    "text": "Texto"
  }
}

Os tipos de seção permitidos são:

features
about
stats
products
services
pricing
testimonials
gallery
faq
cta
contact

Cada seção deve ter os dados necessários para ser renderizada.

REGRAS DE DESIGN:

- O resultado deve parecer um site real de empresa.
- Use hierarquia visual forte.
- Use bastante espaço em branco.
- Não faça tudo com cards.
- Misture texto, imagens, números e áreas visuais.
- Use no máximo 6 itens por seção.
- Escolha uma fonte coerente.
- Use imagens reais quando fizer sentido.
- Prefira imagens do Unsplash.
- O site deve ser responsivo.
- Evite textos genéricos demais.
- Não use emojis excessivamente.
- Não use nomes como "Lorem ipsum".
- Não invente informações absurdas.
- Mantenha o conteúdo em português brasileiro.

Fontes permitidas:

Inter
Plus Jakarta Sans
Poppins
Manrope
DM Sans
Montserrat
Space Grotesk
Outfit
Raleway
Playfair Display
Lora
Merriweather
Bebas Neue

A propriedade "image" pode usar URLs do Unsplash.

IMPORTANTE:
Retorne APENAS JSON.
Não use markdown.
Não use \`\`\`.
Não escreva explicações antes ou depois.
`;

    if (mode === "replace") {
        return base + `
O usuário pediu um NOVO SITE ou para começar novamente.

Ignore completamente a estrutura anterior.
Crie um novo projeto do zero baseado exclusivamente no pedido atual.
`;
    }

    return base + `
O usuário quer MODIFICAR o site atual.

Preserve aquilo que ainda fizer sentido.
Altere somente o que o usuário pediu.
Se o pedido implicar uma mudança grande de identidade visual, você pode alterar cores, fontes e estrutura.
`;
}


/* ======================================================
   CHAMADA GROQ
====================================================== */

async function callGroq(userPrompt, currentSpec, mode) {
    if (!state.apiKey) {
        throw new Error("Você ainda não colocou sua API Key da Groq.");
    }

    const systemPrompt = buildSystemPrompt(mode);

    const payload = {
        model: state.model,

        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content:
                    "SITE ATUAL:\n" +
                    JSON.stringify(currentSpec, null, 2) +
                    "\n\nPEDIDO DO USUÁRIO:\n" +
                    userPrompt
            }
        ],

        temperature: 0.7,
        max_tokens: 7000
    };

    const response = await fetch(GROQ_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + state.apiKey
        },

        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorText = "";

        try {
            const errorData = await response.json();

            errorText =
                errorData?.error?.message ||
                JSON.stringify(errorData);
        } catch {
            errorText = await response.text();
        }

        throw new Error(
            "Erro da Groq: " +
            response.status +
            " — " +
            errorText
        );
    }

    const data = await response.json();

    const content =
        data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("A Groq não retornou uma resposta.");
    }

    return content;
}


/* ======================================================
   PARSER JSON
====================================================== */

function parseJSON(text) {
    if (!text) {
        throw new Error("A IA retornou uma resposta vazia.");
    }

    let cleaned = String(text).trim();

    cleaned = cleaned
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1) {
            const possibleJSON =
                cleaned.slice(firstBrace, lastBrace + 1);

            try {
                return JSON.parse(possibleJSON);
            } catch {
                throw new Error(
                    "A IA retornou um JSON inválido. Tente enviar o pedido novamente."
                );
            }
        }

        throw new Error(
            "Não consegui encontrar um JSON válido na resposta da IA."
        );
    }
}


/* ======================================================
   NORMALIZAÇÃO
====================================================== */

function normalizeSpec(input) {
    const base = createEmptySpec();

    if (!input || typeof input !== "object") {
        return base;
    }

    const result = {
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

        footer: {
            ...base.footer,
            ...(input.footer || {})
        }
    };

    if (!FONT_LIBRARY.includes(result.font)) {
        result.font = "Inter";
    }

    if (!Array.isArray(result.nav.links)) {
        result.nav.links = base.nav.links;
    }

    if (!Array.isArray(result.sections)) {
        result.sections = [];
    }

    result.sections = result.sections
        .filter(section => section && typeof section === "object")
        .map(section => ({
            ...section
        }));

    return result;
}


/* ======================================================
   HTML — NAV
====================================================== */

function renderNav(spec) {
    const links = safeArray(spec.nav.links);

    return `
<header class="site-nav">
    <div class="container nav-inner">

        <a href="#inicio" class="logo">
            ${escapeHTML(spec.nav.logo)}
        </a>

        <nav class="desktop-nav">
            ${links.map(link => `
                <a href="${escapeHTML(link.href || "#")}">
                    ${escapeHTML(link.label || "Link")}
                </a>
            `).join("")}
        </nav>

        <div class="nav-actions">

            <a
                class="nav-button"
                href="#contato"
            >
                ${escapeHTML(spec.nav.button || "Contato")}
            </a>

            <button
                class="mobile-menu-button"
                type="button"
                aria-label="Abrir menu"
                onclick="toggleMenu()"
            >
                ☰
            </button>

        </div>

    </div>

    <div class="mobile-menu" id="mobileMenu">

        ${links.map(link => `
            <a href="${escapeHTML(link.href || "#")}" onclick="closeMenu()">
                ${escapeHTML(link.label || "Link")}
            </a>
        `).join("")}

        <a href="#contato" onclick="closeMenu()">
            ${escapeHTML(spec.nav.button || "Contato")}
        </a>

    </div>
</header>
`;
}


/* ======================================================
   HERO
====================================================== */

function renderHero(spec) {
    const hero = spec.hero || {};

    return `
<section class="hero" id="inicio">

    <div class="container hero-grid">

        <div class="hero-content">

            ${
                hero.eyebrow
                    ? `
                    <div class="eyebrow">
                        ${escapeHTML(hero.eyebrow)}
                    </div>
                    `
                    : ""
            }

            <h1>
                ${escapeHTML(hero.title)}
            </h1>

            <p>
                ${escapeHTML(hero.description)}
            </p>

            <div class="hero-actions">

                <a
                    href="#contato"
                    class="button button-primary"
                >
                    ${escapeHTML(hero.primaryButton)}
                </a>

                ${
                    hero.secondaryButton
                        ? `
                        <a
                            href="#sobre"
                            class="button button-secondary"
                        >
                            ${escapeHTML(hero.secondaryButton)}
                        </a>
                        `
                        : ""
                }

            </div>

        </div>

        <div class="hero-visual">

            <div class="hero-image-wrap">

                <img
                    src="${escapeHTML(hero.image || IMAGE_LIBRARY.technology)}"
                    alt="${escapeHTML(spec.projectName)}"
                >

            </div>

            <div class="floating-card">
                <span class="floating-dot"></span>
                <div>
                    <strong>Experiência moderna</strong>
                    <small>Feita para impressionar</small>
                </div>
            </div>

        </div>

    </div>

</section>
`;
}


/* ======================================================
   FEATURES
====================================================== */

function renderFeatures(section) {
    const items = safeArray(section.items);

    return `
<section class="section features-section" id="servicos">

    <div class="container">

        <div class="section-heading">

            <div>
                <span class="section-kicker">DIFERENCIAIS</span>

                <h2>
                    ${escapeHTML(section.title || "Tudo que você precisa")}
                </h2>
            </div>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

        </div>

        <div class="feature-grid">

            ${items.map((item, index) => `
                <article class="feature-item">

                    <div class="feature-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                    <div class="feature-icon">
                        ${escapeHTML(item.icon || "✦")}
                    </div>

                    <h3>
                        ${escapeHTML(item.title || "Recurso")}
                    </h3>

                    <p>
                        ${escapeHTML(item.text || "")}
                    </p>

                </article>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   ABOUT
====================================================== */

function renderAbout(section) {
    return `
<section class="section about-section" id="sobre">

    <div class="container about-grid">

        <div class="about-image">

            <img
                src="${escapeHTML(section.image || IMAGE_LIBRARY.office)}"
                alt="${escapeHTML(section.title || "Sobre")}"
            >

        </div>

        <div class="about-content">

            <span class="section-kicker">SOBRE</span>

            <h2>
                ${escapeHTML(section.title || "Feito para crescer com você")}
            </h2>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

            <a
                href="#contato"
                class="text-link"
            >
                Saiba mais <span>→</span>
            </a>

        </div>

    </div>

</section>
`;
}


/* ======================================================
   STATS
====================================================== */

function renderStats(section) {
    const items = safeArray(section.items);

    return `
<section class="section stats-section">

    <div class="container">

        <div class="stats-grid">

            ${items.map(item => `
                <div class="stat-item">

                    <strong>
                        ${escapeHTML(item.value || "0")}
                    </strong>

                    <span>
                        ${escapeHTML(item.label || "")}
                    </span>

                </div>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   SERVICES
====================================================== */

function renderServices(section) {
    const items = safeArray(section.items);

    return `
<section class="section" id="servicos">

    <div class="container">

        <div class="section-heading centered">

            <span class="section-kicker">SERVIÇOS</span>

            <h2>
                ${escapeHTML(section.title || "O que fazemos")}
            </h2>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

        </div>

        <div class="service-grid">

            ${items.map((item, index) => `
                <article class="service-card">

                    <div class="service-top">
                        <span>0${index + 1}</span>
                        <span>↗</span>
                    </div>

                    <h3>
                        ${escapeHTML(item.title || "Serviço")}
                    </h3>

                    <p>
                        ${escapeHTML(item.text || "")}
                    </p>

                </article>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   PRODUCTS
====================================================== */

function renderProducts(section) {
    const items = safeArray(section.items);

    return `
<section class="section">

    <div class="container">

        <div class="section-heading">

            <div>

                <span class="section-kicker">PRODUTOS</span>

                <h2>
                    ${escapeHTML(section.title || "Mais vendidos")}
                </h2>

            </div>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

        </div>

        <div class="product-grid">

            ${items.map(item => `
                <article class="product-card">

                    ${
                        item.image
                            ? `
                            <div class="product-image">
                                <img
                                    src="${escapeHTML(item.image)}"
                                    alt="${escapeHTML(item.title || "Produto")}"
                                >
                            </div>
                            `
                            : ""
                    }

                    <div class="product-content">

                        <h3>
                            ${escapeHTML(item.title || "Produto")}
                        </h3>

                        <p>
                            ${escapeHTML(item.text || "")}
                        </p>

                        ${
                            item.price
                                ? `
                                <strong class="product-price">
                                    ${escapeHTML(item.price)}
                                </strong>
                                `
                                : ""
                        }

                    </div>

                </article>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   PRICING
====================================================== */

function renderPricing(section) {
    const items = safeArray(section.items);

    return `
<section class="section pricing-section">

    <div class="container">

        <div class="section-heading centered">

            <span class="section-kicker">PLANOS</span>

            <h2>
                ${escapeHTML(section.title || "Escolha seu plano")}
            </h2>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

        </div>

        <div class="pricing-grid">

            ${items.map((item, index) => `
                <article class="pricing-card ${index === 1 ? "featured" : ""}">

                    ${
                        index === 1
                            ? `<div class="popular-badge">MAIS POPULAR</div>`
                            : ""
                    }

                    <h3>
                        ${escapeHTML(item.title || "Plano")}
                    </h3>

                    <div class="price">
                        ${escapeHTML(item.price || "R$ 0")}
                    </div>

                    <p>
                        ${escapeHTML(item.text || "")}
                    </p>

                    <a
                        href="#contato"
                        class="button ${index === 1 ? "button-primary" : "button-secondary"}"
                    >
                        Escolher plano
                    </a>

                </article>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   TESTIMONIALS
====================================================== */

function renderTestimonials(section) {
    const items = safeArray(section.items);

    return `
<section class="section testimonial-section">

    <div class="container">

        <div class="section-heading centered">

            <span class="section-kicker">CLIENTES</span>

            <h2>
                ${escapeHTML(section.title || "Quem já confia")}
            </h2>

        </div>

        <div class="testimonial-grid">

            ${items.map(item => `
                <article class="testimonial-card">

                    <div class="stars">
                        ★★★★★
                    </div>

                    <p>
                        “${escapeHTML(item.text || "")}”
                    </p>

                    <div class="testimonial-author">

                        ${
                            item.image
                                ? `
                                <img
                                    src="${escapeHTML(item.image)}"
                                    alt="${escapeHTML(item.name || "Cliente")}"
                                >
                                `
                                : `<div class="avatar">${escapeHTML((item.name || "C").charAt(0))}</div>`
                        }

                        <div>

                            <strong>
                                ${escapeHTML(item.name || "Cliente")}
                            </strong>

                            <span>
                                ${escapeHTML(item.role || "")}
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


/* ======================================================
   GALLERY
====================================================== */

function renderGallery(section) {
    const items = safeArray(section.items);

    return `
<section class="section">

    <div class="container">

        <div class="section-heading">

            <div>

                <span class="section-kicker">GALERIA</span>

                <h2>
                    ${escapeHTML(section.title || "Conheça nosso trabalho")}
                </h2>

            </div>

            <p>
                ${escapeHTML(section.description || "")}
            </p>

        </div>

        <div class="gallery-grid">

            ${items.map(item => `
                <div class="gallery-item">

                    <img
                        src="${escapeHTML(item.image || IMAGE_LIBRARY.city)}"
                        alt="${escapeHTML(item.title || "Imagem")}"
                    >

                    ${
                        item.title
                            ? `
                            <div class="gallery-caption">
                                ${escapeHTML(item.title)}
                            </div>
                            `
                            : ""
                    }

                </div>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   FAQ
====================================================== */

function renderFAQ(section) {
    const items = safeArray(section.items);

    return `
<section class="section faq-section">

    <div class="container faq-grid">

        <div class="faq-intro">

            <span class="section-kicker">DÚVIDAS</span>

            <h2>
                ${escapeHTML(section.title || "Perguntas frequentes")}
            </h2>

            <p>
                ${escapeHTML(section.description || "Encontre respostas para as perguntas mais comuns.")}
            </p>

        </div>

        <div class="faq-list">

            ${items.map((item, index) => `
                <div class="faq-item">

                    <button
                        type="button"
                        onclick="toggleFAQ(${index})"
                    >
                        <span>
                            ${escapeHTML(item.question || "Pergunta")}
                        </span>

                        <b id="faq-icon-${index}">
                            +
                        </b>
                    </button>

                    <div
                        class="faq-answer"
                        id="faq-answer-${index}"
                    >
                        ${escapeHTML(item.answer || "")}
                    </div>

                </div>
            `).join("")}

        </div>

    </div>

</section>
`;
}


/* ======================================================
   CTA
====================================================== */

function renderCTA(section) {
    return `
<section class="section cta-section">

    <div class="container">

        <div class="cta-box">

            <div>

                <span class="section-kicker">
                    VAMOS COMEÇAR
                </span>

                <h2>
                    ${escapeHTML(section.title || "Pronto para começar?")}
                </h2>

                <p>
                    ${escapeHTML(section.description || "")}
                </p>

            </div>

            <a
                href="#contato"
                class="button button-light"
            >
                ${escapeHTML(section.button || "Entrar em contato")}
            </a>

        </div>

    </div>

</section>
`;
}


/* ======================================================
   CONTACT
====================================================== */

function renderContact(section) {
    return `
<section class="section contact-section" id="contato">

    <div class="container contact-grid">

        <div>

            <span class="section-kicker">
                CONTATO
            </span>

            <h2>
                ${escapeHTML(section.title || "Vamos conversar?")}
            </h2>

            <p>
                ${escapeHTML(section.description || "Envie uma mensagem e entraremos em contato.")}
            </p>

        </div>

        <form
            class="contact-form"
            onsubmit="submitContact(event)"
        >

            <div class="form-row">

                <input
                    type="text"
                    placeholder="Seu nome"
                    required
                >

                <input
                    type="email"
                    placeholder="Seu e-mail"
                    required
                >

            </div>

            <textarea
                placeholder="Como podemos ajudar?"
                required
            ></textarea>

            <button
                class="button button-primary"
                type="submit"
            >
                Enviar mensagem
            </button>

        </form>

    </div>

</section>
`;
}


/* ======================================================
   RENDER DE SEÇÕES
====================================================== */

function renderSection(section) {
    switch (section.type) {

        case "features":
            return renderFeatures(section);

        case "about":
            return renderAbout(section);

        case "stats":
            return renderStats(section);

        case "products":
            return renderProducts(section);

        case "services":
            return renderServices(section);

        case "pricing":
            return renderPricing(section);

        case "testimonials":
            return renderTestimonials(section);

        case "gallery":
            return renderGallery(section);

        case "faq":
            return renderFAQ(section);

        case "cta":
            return renderCTA(section);

        case "contact":
            return renderContact(section);

        default:
            return "";
    }
}


/* ======================================================
   FOOTER
====================================================== */

function renderFooter(spec) {
    return `
<footer class="site-footer">

    <div class="container footer-inner">

        <strong>
            ${escapeHTML(spec.nav.logo)}
        </strong>

        <span>
            ${escapeHTML(spec.footer.text)}
        </span>

        <a href="#inicio">
            ↑ Voltar ao topo
        </a>

    </div>

</footer>
`;
}


/* ======================================================
   CSS DO SITE GERADO
====================================================== */

function renderCSS(spec) {
    const theme = spec.theme || {};
    const font = FONT_LIBRARY.includes(spec.font)
        ? spec.font
        : "Inter";

    return `
:root {
    --primary: ${theme.primary || "#635BFF"};
    --secondary: ${theme.secondary || "#111827"};
    --background: ${theme.background || "#FFFFFF"};
    --surface: ${theme.surface || "#F7F8FA"};
    --text: ${theme.text || "#17191F"};
    --muted: ${theme.muted || "#6B7280"};
    --accent: ${theme.accent || "#8B5CF6"};

    --container: 1180px;
    --radius: 20px;
}

* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    margin: 0;
    color: var(--text);
    background: var(--background);
    font-family: "${font}", Arial, sans-serif;
    line-height: 1.6;
}

body,
button,
input,
textarea {
    font-family: "${font}", Arial, sans-serif;
}

a {
    color: inherit;
    text-decoration: none;
}

img {
    display: block;
    width: 100%;
}

button,
input,
textarea {
    font: inherit;
}

button {
    cursor: pointer;
}

.container {
    width: min(var(--container), calc(100% - 40px));
    margin: 0 auto;
}


/* NAV */

.site-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255,255,255,.88);
    border-bottom: 1px solid rgba(0,0,0,.06);
    backdrop-filter: blur(18px);
}

.nav-inner {
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
}

.logo {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -.6px;
}

.desktop-nav {
    display: flex;
    align-items: center;
    gap: 30px;
}

.desktop-nav a {
    color: var(--muted);
    font-size: 14px;
    transition: .2s;
}

.desktop-nav a:hover {
    color: var(--text);
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-button {
    padding: 11px 17px;
    color: white;
    background: var(--primary);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
}

.mobile-menu-button {
    display: none;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 10px;
    background: var(--surface);
}

.mobile-menu {
    display: none;
}


/* HERO */

.hero {
    position: relative;
    overflow: hidden;
    padding: 100px 0 110px;
    background:
        radial-gradient(
            circle at 85% 20%,
            color-mix(in srgb, var(--primary) 14%, transparent),
            transparent 35%
        ),
        var(--background);
}

.hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 70px;
}

.eyebrow,
.section-kicker {
    display: inline-block;
    color: var(--primary);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
}

.hero h1 {
    max-width: 700px;
    margin: 15px 0 20px;
    font-size: clamp(48px, 6vw, 82px);
    line-height: .98;
    letter-spacing: -4px;
}

.hero-content > p {
    max-width: 590px;
    color: var(--muted);
    font-size: 18px;
    line-height: 1.7;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 11px;
    margin-top: 30px;
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 20px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 750;
    border: 1px solid transparent;
    transition: .2s;
}

.button:hover {
    transform: translateY(-2px);
}

.button-primary {
    color: white;
    background: var(--primary);
    box-shadow: 0 10px 25px color-mix(in srgb, var(--primary) 25%, transparent);
}

.button-secondary {
    color: var(--text);
    background: white;
    border-color: #e5e7eb;
}

.button-light {
    color: var(--text);
    background: white;
}

.hero-visual {
    position: relative;
}

.hero-image-wrap {
    overflow: hidden;
    aspect-ratio: 4 / 4.5;
    border-radius: 28px;
    box-shadow: 0 30px 80px rgba(0,0,0,.13);
}

.hero-image-wrap img {
    height: 100%;
    object-fit: cover;
}

.floating-card {
    position: absolute;
    left: -35px;
    bottom: 35px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px 17px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 50px rgba(0,0,0,.13);
}

.floating-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #28c76f;
}

.floating-card strong,
.floating-card small {
    display: block;
}

.floating-card strong {
    font-size: 12px;
}

.floating-card small {
    margin-top: 2px;
    color: var(--muted);
    font-size: 10px;
}


/* SECTIONS */

.section {
    padding: 105px 0;
}

.section:nth-child(even) {
    background: var(--surface);
}

.section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 40px;
    margin-bottom: 55px;
}

.section-heading.centered {
    display: block;
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
}

.section-heading h2,
.about-content h2,
.faq-intro h2,
.contact-grid h2,
.cta-box h2 {
    margin: 10px 0 0;
    font-size: clamp(34px, 4vw, 52px);
    line-height: 1.05;
    letter-spacing: -2px;
}

.section-heading p {
    max-width: 480px;
    margin: 0;
    color: var(--muted);
}


/* FEATURES */

.feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid #e5e7eb;
}

.feature-item {
    position: relative;
    min-height: 250px;
    padding: 30px;
    border-right: 1px solid #e5e7eb;
}

.feature-item:last-child {
    border-right: 0;
}

.feature-number {
    color: #b7bbc3;
    font-size: 11px;
    font-weight: 800;
}

.feature-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin: 40px 0 25px;
    border-radius: 13px;
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 9%, white);
    font-size: 20px;
}

.feature-item h3 {
    margin: 0 0 9px;
    font-size: 18px;
}

.feature-item p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
}


/* ABOUT */

.about-grid {
    display: grid;
    grid-template-columns: 1.05fr .95fr;
    align-items: center;
    gap: 80px;
}

.about-image {
    overflow: hidden;
    border-radius: 24px;
    aspect-ratio: 1.15;
}

.about-image img {
    height: 100%;
    object-fit: cover;
}

.about-content p {
    max-width: 530px;
    color: var(--muted);
    font-size: 17px;
    line-height: 1.8;
    margin: 25px 0;
}

.text-link {
    display: inline-flex;
    gap: 9px;
    align-items: center;
    color: var(--primary);
    font-size: 14px;
    font-weight: 800;
}


/* STATS */

.stats-section {
    padding: 70px 0;
    background: var(--secondary) !important;
    color: white;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.stat-item {
    padding: 10px 30px;
    border-right: 1px solid rgba(255,255,255,.14);
}

.stat-item:last-child {
    border-right: 0;
}

.stat-item strong {
    display: block;
    font-size: 45px;
    letter-spacing: -2px;
}

.stat-item span {
    color: rgba(255,255,255,.6);
    font-size: 13px;
}


/* SERVICES */

.service-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.service-card {
    min-height: 280px;
    padding: 27px;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    transition: .25s;
}

.service-card:hover {
    transform: translateY(-5px);
    border-color: color-mix(in srgb, var(--primary) 40%, #e5e7eb);
    box-shadow: 0 20px 50px rgba(0,0,0,.07);
}

.service-top {
    display: flex;
    justify-content: space-between;
    color: #a3a7af;
    font-size: 11px;
}

.service-card h3 {
    margin: 80px 0 10px;
    font-size: 23px;
}

.service-card p {
    margin: 0;
    color: var(--muted);
}


/* PRODUCTS */

.product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.product-card {
    overflow: hidden;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
}

.product-image {
    aspect-ratio: 1.2;
    overflow: hidden;
}

.product-image img {
    height: 100%;
    object-fit: cover;
    transition: .4s;
}

.product-card:hover .product-image img {
    transform: scale(1.04);
}

.product-content {
    padding: 20px;
}

.product-content h3 {
    margin: 0 0 6px;
}

.product-content p {
    margin: 0 0 15px;
    color: var(--muted);
    font-size: 13px;
}

.product-price {
    font-size: 18px;
}


/* PRICING */

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
}

.pricing-card {
    position: relative;
    padding: 35px;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    background: white;
}

.pricing-card.featured {
    color: white;
    background: var(--secondary);
    transform: translateY(-8px);
    box-shadow: 0 25px 60px rgba(0,0,0,.18);
}

.pricing-card h3 {
    margin: 0;
    font-size: 20px;
}

.price {
    margin: 22px 0 12px;
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -2px;
}

.pricing-card p {
    min-height: 65px;
    color: var(--muted);
}

.pricing-card.featured p {
    color: rgba(255,255,255,.6);
}

.popular-badge {
    position: absolute;
    right: 18px;
    top: 18px;
    padding: 5px 8px;
    border-radius: 20px;
    color: var(--secondary);
    background: white;
    font-size: 8px;
    font-weight: 900;
}


/* TESTIMONIALS */

.testimonial-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
}

.testimonial-card {
    padding: 27px;
    border-radius: 20px;
    background: white;
    border: 1px solid #e5e7eb;
}

.stars {
    color: #f5b93d;
    letter-spacing: 2px;
}

.testimonial-card > p {
    min-height: 120px;
    color: #4d535d;
    line-height: 1.7;
}

.testimonial-author {
    display: flex;
    align-items: center;
    gap: 10px;
}

.testimonial-author img,
.avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar {
    display: grid;
    place-items: center;
    color: white;
    background: var(--primary);
    font-weight: 800;
}

.testimonial-author strong,
.testimonial-author span {
    display: block;
}

.testimonial-author strong {
    font-size: 12px;
}

.testimonial-author span {
    color: var(--muted);
    font-size: 10px;
}


/* GALLERY */

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    min-height: 260px;
    border-radius: 18px;
}

.gallery-item img {
    height: 100%;
    min-height: 260px;
    object-fit: cover;
    transition: .4s;
}

.gallery-item:hover img {
    transform: scale(1.05);
}

.gallery-caption {
    position: absolute;
    left: 15px;
    right: 15px;
    bottom: 15px;
    padding: 12px;
    color: white;
    background: rgba(0,0,0,.55);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    font-size: 12px;
}


/* FAQ */

.faq-grid {
    display: grid;
    grid-template-columns: .75fr 1.25fr;
    gap: 80px;
}

.faq-intro p {
    max-width: 420px;
    color: var(--muted);
}

.faq-list {
    border-top: 1px solid #e5e7eb;
}

.faq-item {
    border-bottom: 1px solid #e5e7eb;
}

.faq-item button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 22px 0;
    border: 0;
    background: transparent;
    text-align: left;
}

.faq-item button span {
    font-size: 15px;
    font-weight: 700;
}

.faq-item button b {
    font-size: 20px;
    font-weight: 400;
}

.faq-answer {
    display: none;
    padding: 0 30px 22px 0;
    color: var(--muted);
    font-size: 14px;
}

.faq-answer.open {
    display: block;
}


/* CTA */

.cta-section {
    background: var(--surface) !important;
}

.cta-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding: 65px;
    border-radius: 28px;
    color: white;
    background: var(--secondary);
}

.cta-box p {
    color: rgba(255,255,255,.6);
}


/* CONTACT */

.contact-grid {
    display: grid;
    grid-template-columns: .8fr 1.2fr;
    gap: 80px;
    align-items: start;
}

.contact-grid > div > p {
    color: var(--muted);
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.contact-form input,
.contact-form textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 11px;
    outline: 0;
    background: white;
}

.contact-form textarea {
    min-height: 150px;
    resize: vertical;
}

.contact-form input:focus,
.contact-form textarea:focus {
    border-color: var(--primary);
}


/* FOOTER */

.site-footer {
    padding: 30px 0;
    border-top: 1px solid #e5e7eb;
    background: white;
}

.footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.footer-inner strong {
    font-size: 15px;
}

.footer-inner span,
.footer-inner a {
    color: var(--muted);
    font-size: 11px;
}


/* MOBILE */

@media (max-width: 900px) {

    .desktop-nav,
    .nav-button {
        display: none;
    }

    .mobile-menu-button {
        display: block;
    }

    .mobile-menu {
        padding: 10px 20px 20px;
        border-top: 1px solid #eee;
    }

    .mobile-menu.open {
        display: flex;
        flex-direction: column;
    }

    .mobile-menu a {
        padding: 13px 0;
        font-size: 14px;
    }

    .hero-grid,
    .about-grid,
    .faq-grid,
    .contact-grid {
        grid-template-columns: 1fr;
    }

    .hero {
        padding: 70px 0;
    }

    .hero h1 {
        font-size: 52px;
    }

    .floating-card {
        left: 15px;
    }

    .feature-grid,
    .service-grid,
    .product-grid,
    .pricing-grid,
    .testimonial-grid {
        grid-template-columns: 1fr;
    }

    .feature-item {
        border-right: 0;
        border-bottom: 1px solid #e5e7eb;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
    }

    .stat-item {
        border-right: 0;
    }

    .gallery-grid {
        grid-template-columns: 1fr 1fr;
    }

    .cta-box {
        flex-direction: column;
        align-items: flex-start;
        padding: 40px;
    }
}


@media (max-width: 600px) {

    .container {
        width: min(100% - 28px, var(--container));
    }

    .hero h1 {
        font-size: 43px;
        letter-spacing: -2.5px;
    }

    .hero-content > p {
        font-size: 16px;
    }

    .section {
        padding: 70px 0;
    }

    .section-heading {
        display: block;
    }

    .section-heading p {
        margin-top: 15px;
    }

    .gallery-grid {
        grid-template-columns: 1fr;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .footer-inner {
        flex-direction: column;
        align-items: flex-start;
    }

    .cta-box h2 {
        font-size: 35px;
    }
}
`;
}


/* ======================================================
   JAVASCRIPT DO SITE GERADO
====================================================== */

function renderJS() {
    return `
function toggleMenu() {
    const menu = document.getElementById("mobileMenu");

    if (!menu) {
        return;
    }

    menu.classList.toggle("open");
}


function closeMenu() {
    const menu = document.getElementById("mobileMenu");

    if (!menu) {
        return;
    }

    menu.classList.remove("open");
}


function toggleFAQ(index) {
    const answer = document.getElementById(
        "faq-answer-" + index
    );

    const icon = document.getElementById(
        "faq-icon-" + index
    );

    if (!answer) {
        return;
    }

    const isOpen = answer.classList.toggle("open");

    if (icon) {
        icon.textContent = isOpen ? "−" : "+";
    }
}


function submitContact(event) {
    event.preventDefault();

    const form = event.target;

    const button = form.querySelector("button");

    if (!button) {
        return;
    }

    const originalText = button.textContent;

    button.textContent = "Mensagem enviada ✓";

    button.disabled = true;

    setTimeout(function() {
        form.reset();

        button.textContent = originalText;

        button.disabled = false;
    }, 2200);
}
`;
}


/* ======================================================
   HTML COMPLETO
====================================================== */

function renderHTML(spec) {
    const sections = safeArray(spec.sections)
        .map(renderSection)
        .join("\n");

    const css = renderCSS(spec);
    const js = renderJS();

    return `<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="description"
        content="${escapeHTML(spec.hero.description || "")}"
    >

    <title>
        ${escapeHTML(spec.projectName)}
    </title>

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
        href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            spec.font || "Inter"
        ).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap"
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

        ${sections}

    </main>

    ${renderFooter(spec)}

    <script>
${js}
    </script>

</body>

</html>`;
}


/* ======================================================
   ARQUIVOS
====================================================== */

function generateFiles(spec) {
    return {
        html: renderHTML(spec),
        css: renderCSS(spec),
        js: renderJS()
    };
}


/* ======================================================
   PREVIEW
====================================================== */

function updatePreview() {
    const preview = $("#preview");

    if (!preview) {
        return;
    }

    preview.srcdoc = state.files.html;
}


/* ======================================================
   CÓDIGO
====================================================== */

function updateCodeEditor() {
    const editor = $("#codeEditor");

    if (!editor) {
        return;
    }

    editor.value = state.files[state.activeCodeTab] || "";
}


function setActiveCodeTab(tab) {
    if (!["html", "css", "js"].includes(tab)) {
        return;
    }

    state.activeCodeTab = tab;

    $$(".code-tab").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.tab === tab
        );
    });

    updateCodeEditor();
}


/* ======================================================
   UI
====================================================== */

function refreshUI() {
    updatePreview();
    updateCodeEditor();

    const projectName = $("#projectName");

    if (projectName) {
        projectName.textContent =
            state.spec.projectName || "Meu novo site";
    }

    const breadcrumb = $("#breadcrumbProject");

    if (breadcrumb) {
        breadcrumb.textContent =
            state.spec.projectName || "Meu novo site";
    }
}


/* ======================================================
   MENSAGENS
====================================================== */

function addMessage(type, text) {
    const container = $("#chatMessages");

    if (!container) {
        return;
    }

    const welcome = container.querySelector(".welcome-card");

    if (welcome) {
        welcome.remove();
    }

    const message = document.createElement("div");

    message.className =
        "message " +
        (type === "user" ? "user" : "ai");

    const avatar =
        type === "user"
            ? "EU"
            : "✦";

    message.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-bubble">
            ${escapeHTML(text)}
        </div>
    `;

    container.appendChild(message);

    container.scrollTop = container.scrollHeight;
}


function addLoadingMessage() {
    const container = $("#chatMessages");

    if (!container) {
        return null;
    }

    const message = document.createElement("div");

    message.className = "message ai loading-message";

    message.innerHTML = `
        <div class="message-avatar">
            ✦
        </div>

        <div class="message-bubble">
            Criando seu site...
        </div>
    `;

    container.appendChild(message);

    container.scrollTop = container.scrollHeight;

    return message;
}


/* ======================================================
   TOAST
====================================================== */

let toastTimer = null;

function showToast(text) {
    const toast = $("#toast");

    if (!toast) {
        return;
    }

    toast.textContent = text;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* ======================================================
   HISTÓRICO
====================================================== */

function createSnapshot() {
    return JSON.stringify({
        spec: state.spec,
        files: state.files
    });
}


function restoreSnapshot(snapshot) {
    try {
        const parsed = JSON.parse(snapshot);

        state.spec = normalizeSpec(parsed.spec);

        state.files = {
            html: parsed.files?.html || "",
            css: parsed.files?.css || "",
            js: parsed.files?.js || ""
        };

        refreshUI();

        saveLocal();
    } catch {
        showToast("Não foi possível restaurar este estado.");
    }
}


function saveHistory() {
    const snapshot = createSnapshot();

    if (
        state.historyIndex >= 0 &&
        state.history[state.historyIndex] === snapshot
    ) {
        return;
    }

    state.history =
        state.history.slice(0, state.historyIndex + 1);

    state.history.push(snapshot);

    if (state.history.length > 30) {
        state.history.shift();
    }

    state.historyIndex =
        state.history.length - 1;
}


function undo() {
    if (state.historyIndex <= 0) {
        showToast("Nada para desfazer.");
        return;
    }

    state.historyIndex--;

    restoreSnapshot(
        state.history[state.historyIndex]
    );
}


function redo() {
    if (
        state.historyIndex >=
        state.history.length - 1
    ) {
        showToast("Nada para refazer.");
        return;
    }

    state.historyIndex++;

    restoreSnapshot(
        state.history[state.historyIndex]
    );
}


/* ======================================================
   NOVO PROJETO
====================================================== */

function newProject() {
    const confirmed = confirm(
        "Criar um novo site? O projeto atual será substituído."
    );

    if (!confirmed) {
        return;
    }

    state.spec = createEmptySpec();

    state.files = generateFiles(state.spec);

    state.history = [];

    state.historyIndex = -1;

    saveHistory();

    saveLocal();

    const chat = $("#chatMessages");

    if (chat) {
        chat.innerHTML = `
            <div class="welcome-card">

                <div class="welcome-icon">
                    ✦
                </div>

                <h2>
                    Vamos criar algo incrível.
                </h2>

                <p>
                    Descreva o site que você quer e a IA vai montar o design para você.
                </p>

            </div>
        `;
    }

    refreshUI();

    showToast("Novo projeto criado.");
}


/* ======================================================
   SALVAR LOCALMENTE
====================================================== */

function saveLocal() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                spec: state.spec,
                files: state.files
            })
        );
    } catch {
        console.warn("Não foi possível salvar o projeto.");
    }
}


function loadLocal() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            state.spec = createEmptySpec();
            state.files = generateFiles(state.spec);

            return;
        }

        const parsed = JSON.parse(saved);

        state.spec = normalizeSpec(parsed.spec);

        if (
            parsed.files &&
            parsed.files.html
        ) {
            state.files = parsed.files;
        } else {
            state.files = generateFiles(state.spec);
        }

    } catch {
        state.spec = createEmptySpec();
        state.files = generateFiles(state.spec);
    }

    saveHistory();
}


/* ======================================================
   API KEY
====================================================== */

function openSettings() {
    const modal = $("#settingsModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");

    const input = $("#apiKeyInput");

    if (input) {
        input.value = state.apiKey;
        input.focus();
    }
}


function closeSettings() {
    const modal = $("#settingsModal");

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
}


function saveApiKey() {
    const input = $("#apiKeyInput");

    if (!input) {
        return;
    }

    const value = input.value.trim();

    if (!value) {
        showToast("Digite sua API Key.");
        return;
    }

    state.apiKey = value;

    localStorage.setItem(
        API_KEY_STORAGE,
        value
    );

    closeSettings();

    updateConnectionStatus();

    showToast("API Key salva.");
}


function updateConnectionStatus() {
    const dot = $(".connection-dot");

    const text = $(".connection-text");

    if (dot) {
        dot.style.background =
            state.apiKey
                ? "#32c77b"
                : "#f0ad36";
    }

    if (text) {
        text.textContent =
            state.apiKey
                ? "Groq conectada"
                : "API não configurada";
    }
}


/* ======================================================
   ENVIAR PEDIDO
====================================================== */

async function sendPrompt() {
    const textarea = $("#prompt");

    if (!textarea) {
        return;
    }

    const prompt = textarea.value.trim();

    if (!prompt) {
        return;
    }

    if (!state.apiKey) {
        openSettings();

        showToast("Configure sua API Key primeiro.");

        return;
    }

    if (state.loading) {
        return;
    }

    state.loading = true;

    const sendButton = $("#sendButton");

    if (sendButton) {
        sendButton.disabled = true;
    }

    textarea.value = "";

    addMessage("user", prompt);

    const loadingMessage = addLoadingMessage();

    const mode = detectIntent(prompt);

    try {
        const rawResponse = await callGroq(
            prompt,
            state.spec,
            mode
        );

        const newSpec =
            normalizeSpec(
                parseJSON(rawResponse)
            );

        state.spec = newSpec;

        state.files =
            generateFiles(newSpec);

        saveHistory();

        saveLocal();

        refreshUI();

        if (loadingMessage) {
            loadingMessage.remove();
        }

        addMessage(
            "ai",
            mode === "replace"
                ? "Pronto. Criei um novo site do zero."
                : "Pronto. Atualizei o site de acordo com seu pedido."
        );

        showToast("Site atualizado.");

    } catch (error) {

        if (loadingMessage) {
            loadingMessage.remove();
        }

        console.error(error);

        addMessage(
            "ai",
            "Não consegui gerar o site: " +
            error.message
        );

        showToast("Erro ao gerar o site.");

    } finally {

        state.loading = false;

        if (sendButton) {
            sendButton.disabled = false;
        }

        textarea.focus();
    }
}


/* ======================================================
   MELHORAR DESIGN
====================================================== */

async function improveDesign() {
    if (!state.apiKey) {
        openSettings();
        showToast("Configure sua API Key primeiro.");
        return;
    }

    if (state.loading) {
        return;
    }

    state.loading = true;

    const loadingMessage = addLoadingMessage();

    try {
        const response = await callGroq(
            `
Melhore muito o design atual.

Deixe o site mais profissional, moderno, bonito e equilibrado.

Melhore:
- tipografia
- espaçamento
- hierarquia visual
- cores
- composição
- seções
- imagens
- experiência mobile

Não mude o objetivo principal do site.
`,
            state.spec,
            "update"
        );

        state.spec =
            normalizeSpec(
                parseJSON(response)
            );

        state.files =
            generateFiles(state.spec);

        saveHistory();
        saveLocal();
        refreshUI();

        if (loadingMessage) {
            loadingMessage.remove();
        }

        addMessage(
            "ai",
            "Melhorei o design e deixei a interface mais profissional."
        );

        showToast("Design melhorado.");

    } catch (error) {

        if (loadingMessage) {
            loadingMessage.remove();
        }

        console.error(error);

        addMessage(
            "ai",
            "Não consegui melhorar o design: " +
            error.message
        );

    } finally {
        state.loading = false;
    }
}


/* ======================================================
   DOWNLOAD
====================================================== */

function downloadFile(filename, content) {
    const blob = new Blob(
        [content],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


function downloadProject() {
    downloadFile(
        "index.html",
        state.files.html
    );

    setTimeout(() => {
        downloadFile(
            "style.css",
            state.files.css
        );
    }, 200);

    setTimeout(() => {
        downloadFile(
            "script.js",
            state.files.js
        );
    }, 400);

    showToast("Arquivos baixados.");
}


/* ======================================================
   COPIAR CÓDIGO
====================================================== */

async function copyCode() {
    const code =
        state.files[state.activeCodeTab] || "";

    if (!code) {
        return;
    }

    try {
        await navigator.clipboard.writeText(code);

        showToast("Código copiado.");
    } catch {
        const editor = $("#codeEditor");

        if (editor) {
            editor.select();

            document.execCommand("copy");

            showToast("Código copiado.");
        }
    }
}


/* ======================================================
   EDITOR MANUAL
====================================================== */

function saveEditorChanges() {
    const editor = $("#codeEditor");

    if (!editor) {
        return;
    }

    state.files[state.activeCodeTab] =
        editor.value;

    if (state.activeCodeTab === "html") {
        updatePreview();
    }

    saveLocal();
}


/* ======================================================
   DEVICE PREVIEW
====================================================== */

function setDevice(device) {
    const frame = $(".browser-frame");

    if (!frame) {
        return;
    }

    frame.classList.remove(
        "tablet",
        "mobile"
    );

    if (device === "tablet") {
        frame.classList.add("tablet");
    }

    if (device === "mobile") {
        frame.classList.add("mobile");
    }

    $$(".device-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.device === device
        );
    });
}


/* ======================================================
   FULLSCREEN
====================================================== */

function toggleFullscreen() {
    const frame = $(".browser-frame");

    if (!frame) {
        return;
    }

    if (!document.fullscreenElement) {
        frame.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}


/* ======================================================
   SUGESTÕES
====================================================== */

function useSuggestion(text) {
    const textarea = $("#prompt");

    if (!textarea) {
        return;
    }

    textarea.value = text;

    textarea.focus();

    textarea.dispatchEvent(
        new Event("input")
    );
}


/* ======================================================
   EVENTOS
====================================================== */

function setupEvents() {

    /* ENVIAR */

    const sendButton = $("#sendButton");

    if (sendButton) {
        sendButton.addEventListener(
            "click",
            sendPrompt
        );
    }


    /* ENTER */

    const prompt = $("#prompt");

    if (prompt) {
        prompt.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {
                    event.preventDefault();

                    sendPrompt();
                }

            }
        );

        prompt.addEventListener(
            "input",
            () => {

                prompt.style.height = "auto";

                prompt.style.height =
                    Math.min(
                        prompt.scrollHeight,
                        120
                    ) + "px";

            }
        );
    }


    /* NOVO PROJETO */

    const newButton = $("#newProject");

    if (newButton) {
        newButton.addEventListener(
            "click",
            newProject
        );
    }


    /* DESFAZER */

    const undoButton = $("#undoBtn");

    if (undoButton) {
        undoButton.addEventListener(
            "click",
            undo
        );
    }


    /* REFAZER */

    const redoButton = $("#redoBtn");

    if (redoButton) {
        redoButton.addEventListener(
            "click",
            redo
        );
    }


    /* MELHORAR */

    const improveButton = $("#improveBtn");

    if (improveButton) {
        improveButton.addEventListener(
            "click",
            improveDesign
        );
    }


    /* CONFIGURAÇÕES */

    const settingsButton = $("#settingsBtn");

    if (settingsButton) {
        settingsButton.addEventListener(
            "click",
            openSettings
        );
    }


    /* FECHAR MODAL */

    const closeModal = $("#closeModal");

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeSettings
        );
    }


    const saveKey = $("#saveApiKey");

    if (saveKey) {
        saveKey.addEventListener(
            "click",
            saveApiKey
        );
    }


    const backdrop = $(".modal-backdrop");

    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeSettings
        );
    }


    /* DOWNLOAD */

    const downloadButton = $("#downloadBtn");

    if (downloadButton) {
        downloadButton.addEventListener(
            "click",
            downloadProject
        );
    }


    /* COPIAR */

    const copyButton = $("#copyCodeBtn");

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            copyCode
        );
    }


    /* EDITOR */

    const editor = $("#codeEditor");

    if (editor) {
        editor.addEventListener(
            "input",
            saveEditorChanges
        );
    }


    /* TABS */

    $$(".code-tab").forEach(button => {

        button.addEventListener(
            "click",
            () => {
                setActiveCodeTab(
                    button.dataset.tab
                );
            }
        );

    });


    /* DEVICES */

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


    /* FULLSCREEN */

    const fullscreenButton =
        $("#fullscreenBtn");

    if (fullscreenButton) {
        fullscreenButton.addEventListener(
            "click",
            toggleFullscreen
        );
    }


    /* SUGESTÕES */

    $$(".suggestion").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const text =
                    button.dataset.prompt ||
                    button.querySelector("strong")?.textContent ||
                    "";

                useSuggestion(text);
            }
        );

    });


    /* ESC FECHA MODAL */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeSettings();
            }

        }
    );

}


/* ======================================================
   EXPOR FUNÇÕES PARA O SITE GERADO
====================================================== */

window.toggleFAQ = function(index) {

    const answer =
        document.getElementById(
            "faq-answer-" + index
        );

    const icon =
        document.getElementById(
            "faq-icon-" + index
        );

    if (!answer) {
        return;
    }

    const open =
        answer.classList.toggle("open");

    if (icon) {
        icon.textContent =
            open ? "−" : "+";
    }
};


window.toggleMenu = function() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    if (menu) {
        menu.classList.toggle("open");
    }
};


window.closeMenu = function() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    if (menu) {
        menu.classList.remove("open");
    }
};


window.submitContact = function(event) {

    event.preventDefault();

    const form = event.target;

    const button =
        form.querySelector("button");

    if (!button) {
        return;
    }

    const original =
        button.textContent;

    button.textContent =
        "Mensagem enviada ✓";

    button.disabled = true;

    setTimeout(() => {

        form.reset();

        button.textContent =
            original;

        button.disabled = false;

    }, 2200);
};


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

function init() {

    loadLocal();

    setupEvents();

    updateConnectionStatus();

    refreshUI();

    setDevice("desktop");

    console.log(
        "Forge AI carregado corretamente."
    );
}


/* ======================================================
   START
====================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();

}
