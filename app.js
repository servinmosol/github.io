// ==========================================
// 1. CARGA DE IDIOMAS (Rutas absolutas anti-bloqueo)
// ==========================================
const langSelector = document.getElementById('lang-selector');
let currentTranslations = {};
const validLangs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];

// Detecta el nombre de la subcarpeta del repo (ej: /github.io) o vacío si es dominio propio
function getRepoBase() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length > 0 && !validLangs.includes(parts[0])) {
        return '/' + parts[0];
    }
    return '';
}

async function loadLanguage(lang) {
    const repoBase = getRepoBase();
    // Petición absoluta para que nunca falle el fetch sin importar la URL actual
    const fetchUrl = `${repoBase}/locales/${lang}.json`;

    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`No se pudo cargar ${fetchUrl}`);
        
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

        // Construir la URL limpia respetando la barra final en la raíz
        const cleanPath = lang === 'es' ? (repoBase ? `${repoBase}/` : '/') : `${repoBase}/${lang}`;
        
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
    let redirectPath = null;
    try {
        redirectPath = sessionStorage.getItem('redirect_path');
        if (redirectPath) sessionStorage.removeItem('redirect_path');
    } catch(e) {}

    const currentPath = redirectPath || window.location.pathname;
    const parts = currentPath.split('/').filter(Boolean);
    const urlLang = parts.find(part => validLangs.includes(part));

    let savedLang;
    try { savedLang = localStorage.getItem('user_lang'); } catch(e) {}
    const userBrowserLang = (navigator.language || '').slice(0, 2);

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