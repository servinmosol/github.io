const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://lanzaestudio.com'; 
const langs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];
const defaultLang = 'es';

const templatePath = path.join(__dirname, 'template.html');

// Comprobación de seguridad
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

    // Inyectar idioma y hreflang
    html = html.replace('{{LANG}}', lang);
    html = html.replace('{{HREFLANG_TAGS}}', hreflangTags);

    // Marcar la opción seleccionada en el selector
    langs.forEach(l => {
        const placeholder = `{{SELECTED_${l.toUpperCase()}}}`;
        html = html.replace(placeholder, l === lang ? 'selected' : '');
    });

    // Reemplazar textos estáticos para SEO
    Object.keys(translations).forEach(key => {
        const regex = new RegExp(`data-i18n="${key}">.*?<`, 'g');
        html = html.replace(regex, `data-i18n="${key}">${translations[key]}<`);
        
        if (key === 'meta_title') {
            html = html.replace(/<title.*?>.*?<\/title>/, `<title>${translations[key]}</title>`);
        }
        if (key === 'meta_description') {
            html = html.replace(/content=""/, `content="${translations[key]}"`);
        }
    });

    // Generar index.html principal y carpetas /en/, /fr/, etc.
    if (lang === defaultLang) {
        fs.writeFileSync(path.join(__dirname, 'index.html'), html);
    } else {
        const dir = path.join(__dirname, lang);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html);
    }
});

console.log('✅ ¡index.html y carpetas de idiomas regenerados con éxito!');