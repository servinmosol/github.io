// ==========================================
// 1. CARGA DE IDIOMAS (Compatible con subcarpetas y dominio propio)
// ==========================================
const langSelector = document.getElementById('lang-selector');
let currentTranslations = {};
const validLangs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];

// Detecta automáticamente si hay una subcarpeta (ej: /github.io) o si es dominio propio
function getBasePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    // Si la primera parte de la URL NO es un idioma, es el nombre del repositorio
    if (parts.length > 0 && !validLangs.includes(parts[0])) {
        return '/' + parts[0];
    }
    return '';
}

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) throw new Error(`No se pudo cargar locales/${lang}.json`);
        
        currentTranslations = await response.json();
        document.documentElement.lang = lang;
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (currentTranslations[key]) {
                element.textContent = currentTranslations[key];
            }
        });

        // Guardar preferencia
        try { localStorage.setItem('user_lang', lang); } catch(e) {}

        // Construir la URL respetando la subcarpeta si existe
        const basePath = getBasePath();
        const cleanPath = lang === 'es' ? (basePath || '/') : `${basePath}/${lang}`;
        
        if (window.location.pathname !== cleanPath) {
            window.history.pushState({}, '', cleanPath);
        }

    } catch (error) {
        console.error("Error cargando el idioma:", error);
    }
}

if (langSelector) {
    langSelector.addEventListener('change', (e) => {
        loadLanguage(e.target.value);
    });
}

function initLanguage() {
    // 1. Comprobar si venimos de la redirección 404
    let redirectPath = null;
    try {
        redirectPath = sessionStorage.getItem('redirect_path');
        if (redirectPath) sessionStorage.removeItem('redirect_path');
    } catch(e) {}

    // Extraer el idioma de la URL actual
    const currentPath = redirectPath || window.location.pathname;
    const parts = currentPath.split('/').filter(Boolean);
    const urlLang = parts.find(part => validLangs.includes(part));

    // Idioma guardado o del navegador
    let savedLang;
    try { savedLang = localStorage.getItem('user_lang'); } catch(e) {}
    const userBrowserLang = (navigator.language || '').slice(0, 2);

    // Prioridad: URL > LocalStorage > Navegador > 'es'
    let initialLang = 'es';
    if (urlLang && validLangs.includes(urlLang)) {
        initialLang = urlLang;
    } else if (savedLang && validLangs.includes(savedLang)) {
        initialLang = savedLang;
    } else if (userBrowserLang && validLangs.includes(userBrowserLang)) {
        initialLang = userBrowserLang;
    }

    if (langSelector) langSelector.value = initialLang;
    loadLanguage(initialLang);
}

// ==========================================
// 2. GESTOR DE MODO OSCURO / CLARO
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

function getSavedTheme() {
    try { return localStorage.getItem('theme'); } catch(e) { return null; }
}
function saveTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch(e) { }
}

function initTheme() {
    const saved = getSavedTheme();
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
        if(themeIcon) themeIcon.textContent = '☀️';
    } else {
        htmlElement.classList.remove('dark');
        if(themeIcon) themeIcon.textContent = '🌙';
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            saveTheme('dark');
            if(themeIcon) themeIcon.textContent = '☀️';
        } else {
            saveTheme('light');
            if(themeIcon) themeIcon.textContent = '🌙';
        }
    });
}

// Inicialización general
initTheme();
initLanguage();