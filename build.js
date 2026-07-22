const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://lanzaestudio.com'; 
const langs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];
const defaultLang = 'es';

const templatePath = path.join(__dirname, 'template.html');

if (!fs.existsSync(templatePath)) {
    console.error('❌ ERROR: No existe el archivo template.html en la raíz.');
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

// Generar etiquetas hreflang para SEO
const hreflangTags = langs.map(lang => {
    const url = lang === defaultLang ? `${DOMAIN}/` : `${DOMAIN}/${lang}/`;
    return `<link rel="alternate" hreflang="${lang}" href="${url}" />`;
}).join('\n    ');

langs.forEach(lang => {
    const jsonPath = path.join(__dirname, 'locales', `${lang}.json`);
    if (!fs.existsSync(jsonPath)) return;

    const translations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    let html = template;

    const isDefault = lang === defaultLang;
    const basePath = isDefault ? '.' : '..';

    html = html.replace('{{LANG}}', lang);
    html = html.replace('{{HREFLANG_TAGS}}', hreflangTags);
    html = html.replaceAll('{{BASE_PATH}}', basePath);

    // Configurar URLs del selector de idiomas
    langs.forEach(l => {
        const selectedPlaceholder = `{{SELECTED_${l.toUpperCase()}}}`;
        html = html.replace(selectedPlaceholder, l === lang ? 'selected' : '');

        const optPlaceholder = `{{LANG_OPT_${l.toUpperCase()}}}`;
        let optUrl = '';
        if (isDefault) {
            optUrl = l === defaultLang ? './' : `./${l}/`;
        } else {
            if (l === lang) optUrl = './';
            else if (l === defaultLang) optUrl = '../';
            else optUrl = `../${l}/`;
        }
        html = html.replace(optPlaceholder, optUrl);
    });

    // INYECCIÓN REAL DE TRADUCCIONES (Soporta clases y atributos en medio)
    Object.keys(translations).forEach(key => {
        const val = translations[key];

        if (key === 'meta_description') {
            // Reemplazo especial para la meta descripción en content=""
            const metaRegex = new RegExp(`(data-i18n="${key}"[^>]*content=")[^"]*(")`);
            html = html.replace(metaRegex, `$1${val}$2`);
        } else {
            // Reemplazo universal para cualquier etiqueta con data-i18n
            const tagRegex = new RegExp(`(data-i18n="${key}"[^>]*>)[^<]*`, 'g');
            html = html.replace(tagRegex, `$1${val}`);
        }
    });

    // Guardar archivo traducido en la ubicación correspondiente
    if (isDefault) {
        fs.writeFileSync(path.join(__dirname, 'index.html'), html);
    } else {
        const dir = path.join(__dirname, lang);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html);
    }
});

console.log('✅ ¡Traducciones inyectadas correctamente en cada idioma!');