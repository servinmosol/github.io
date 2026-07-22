// ==========================================
// 1. CARGA DINÁMICA DE IDIOMAS (i18n Asíncrono)
// ==========================================
const langSelector = document.getElementById('lang-selector');
let currentTranslations = {};

// Función para cargar el archivo JSON del idioma seleccionado
async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) throw new Error(`No se pudo cargar el archivo locales/${lang}.json`);
        
        currentTranslations = await response.json();
        
        // Actualizar el atributo HTML
        document.documentElement.lang = lang;
        
        // Reemplazar textos en el HTML
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (currentTranslations[key]) {
                element.textContent = currentTranslations[key];
            }
        });

        // Guardar preferencia
        try { localStorage.setItem('user_lang', lang); } catch(e) {}

    } catch (error) {
        console.error("Error cargando el idioma:", error);
    }
}

// Escuchar cambios en el desplegable
if (langSelector) {
    langSelector.addEventListener('change', (e) => {
        loadLanguage(e.target.value);
    });
}

// Detectar idioma inicial (Guardado > Navegador > Español por defecto)
function initLanguage() {
    let savedLang;
    try { savedLang = localStorage.getItem('user_lang'); } catch(e) {}
    
    const browserLang = navigator.language.slice(0, 2);
   // Cambia esta línea en initLanguage():
const initialLang = savedLang || (['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'].includes(browserLang) ? browserLang : 'es');

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