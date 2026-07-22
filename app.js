/// ==========================================
// 1. CARGA DE IDIOMAS CON RUTAS LIMPIAS (/es, /en, /nl...)
// ==========================================
const langSelector = document.getElementById('lang-selector');
let currentTranslations = {};
const validLangs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];

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

        // Actualizar la URL a ruta limpia (ej: /nl, /en) sin recargar
        const cleanPath = lang === 'es' ? '/' : `/${lang}`;
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

    // Extraer idioma de la URL (ej: /fr -> fr)
    const currentPath = redirectPath || window.location.pathname;
    const urlLang = currentPath.split('/').filter(Boolean).pop();

    // 2. Idioma guardado previamente por el usuario
    let savedLang;
    try { savedLang = localStorage.getItem('user_lang'); } catch(e) {}

    // 3. Detección automática del Idioma del Navegador / Sistema Operativo
    // navigator.language devuelve algo como "es-ES", "de-DE", "fr-FR". Cogemos los 2 primeros caracteres.
    const userBrowserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').slice(0, 2);

    // Determinar el idioma final por orden estricto de prioridad
    let initialLang = 'es'; // Fallback por defecto

    if (urlLang && validLangs.includes(urlLang)) {
        initialLang = urlLang;
    } else if (savedLang && validLangs.includes(savedLang)) {
        initialLang = savedLang;
    } else if (userBrowserLang && validLangs.includes(userBrowserLang)) {
        initialLang = userBrowserLang; // <--- Detecta el idioma de su SO/Navegador
    }

    // Aplicar al selector y cargar la traducción
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