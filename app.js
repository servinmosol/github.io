// ==========================================
// 1. DICCIONARIO DE IDIOMAS (i18n)
// ==========================================
const translations = {
    es: {
        hero_badge: "Sistemas a medida",
        hero_title: "Automatización real para empresas que valoran su tiempo.",
        hero_subtitle: "Desarrollamos e integramos IA directamente en tu infraestructura. Sin cuotas mensuales por software, sin intermediarios."
    },
    en: {
        hero_badge: "Custom Systems",
        hero_title: "Real automation for companies that value their time.",
        hero_subtitle: "We develop and integrate AI directly into your infrastructure. No monthly software fees, no middlemen."
    },
    fr: {
        hero_badge: "Systèmes sur mesure",
        hero_title: "Une véritable automatisation pour les entreprises qui valorisent leur temps.",
        hero_subtitle: "Nous développons et intégrons l'IA directement dans votre infrastructure. Pas de frais mensuels, pas d'intermédiaires."
    },
    de: {
        hero_badge: "Maßgeschneiderte Systeme",
        hero_title: "Echte Automatisierung für Unternehmen, die ihre Zeit schätzen.",
        hero_subtitle: "Wir entwickeln und integrieren KI direkt in Ihre Infrastruktur. Keine monatlichen Softwaregebühren, keine Vermittler."
    },
    pt: {
        hero_badge: "Sistemas sob medida",
        hero_title: "Automação real para empresas que valorizam seu tempo.",
        hero_subtitle: "Desenvolvemos e integramos IA diretamente na sua infraestrutura. Sem taxas mensais de software, sem intermediários."
    }
};

const langSelector = document.getElementById('lang-selector');

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

if (langSelector) {
    langSelector.addEventListener('change', (e) => setLanguage(e.target.value));
}

// ==========================================
// 2. GESTOR DE MODO OSCURO / CLARO BLINDADO
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

// Funciones con try/catch para evitar bloqueos del navegador en local
function getSavedTheme() {
    try { return localStorage.getItem('theme'); } catch(e) { return null; }
}
function saveTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch(e) { console.warn("Modo local: no se puede guardar el tema"); }
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

initTheme();