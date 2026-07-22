const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://lanzaestudio.com'; // Cambiarás esto al poner el dominio
const langs = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];
const defaultLang = 'es';

// Leer plantilla
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8');

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

    // Marcar la opción seleccionada en el <select>
    langs.forEach(l => {
        const placeholder = `{{SELECTED_${l.toUpperCase()}}}`;
        html = html.replace(placeholder, l === lang ? 'selected' : '');
    });

    // Reemplazar los textos data-i18n directamente en el HTML estático
    Object.keys(translations).forEach(key => {
        const regex = new RegExp(`data-i18n="${key}">.*?<`, 'g');
        html = html.replace(regex, `data-i18n="${key}">${translations[key]}<`);
        
        // Reemplazar metas si coinciden
        if (key === 'meta_title') {
            html = html.replace(/<title.*?>.*?<\/title>/, `<title>${translations[key]}</title>`);
        }
        if (key === 'meta_description') {
            html = html.replace(/content=""/, `content="${translations[key]}"`);
        }
    });

    // Guardar en la carpeta correspondiente
    if (lang === defaultLang) {
        fs.writeFileSync(path.join(__dirname, 'index.html'), html);
    } else {
        const dir = path.join(__dirname, lang);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir, 'index.html'), html);
    }
});

console.log('✅ Páginas HTML estáticas generadas correctamente para todos los idiomas.');