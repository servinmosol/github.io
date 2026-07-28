const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://lanzaestudio.com'; 

// Definimos los idiomas para cada página
const langsFull = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];
const langsSoluciones = ['es', 'en']; // Como pediste, solo ES y EN para el catálogo
const defaultLang = 'es';

// Función maestra para construir cualquier plantilla
function buildPage(templateName, outputName, langsArray) {
    const templatePath = path.join(__dirname, templateName);

    if (!fs.existsSync(templatePath)) {
        console.error(`❌ ERROR: No existe la plantilla ${templateName} en la raíz.`);
        return;
    }

    const template = fs.readFileSync(templatePath, 'utf-8');

    // Generar etiquetas hreflang para SEO (adaptadas al archivo actual)
    const hreflangTags = langsArray.map(lang => {
        const fileUrl = outputName === 'index.html' ? '' : outputName;
        const url = lang === defaultLang ? `${DOMAIN}/${fileUrl}` : `${DOMAIN}/${lang}/${fileUrl}`;
        return `<link rel="alternate" hreflang="${lang}" href="${url}" />`;
    }).join('\n    ');

    langsArray.forEach(lang => {
        const jsonPath = path.join(__dirname, 'locales', `${lang}.json`);
        if (!fs.existsSync(jsonPath)) return;

        const translations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        let html = template;

        const isDefault = lang === defaultLang;
        const basePath = isDefault ? '.' : '..';

        html = html.replace('{{LANG}}', lang);
        html = html.replace('{{HREFLANG_TAGS}}', hreflangTags);
        html = html.replaceAll('{{BASE_PATH}}', basePath);

        // Configurar URLs del selector de idiomas para que no se rompan las rutas
        langsArray.forEach(l => {
            const selectedPlaceholder = `{{SELECTED_${l.toUpperCase()}}}`;
            html = html.replace(selectedPlaceholder, l === lang ? 'selected' : '');

            const optPlaceholder = `{{LANG_OPT_${l.toUpperCase()}}}`;
            const filePart = outputName === 'index.html' ? '' : outputName;
            
            let optUrl = '';
            if (isDefault) {
                optUrl = l === defaultLang ? `./${filePart}` : `./${l}/${filePart}`;
            } else {
                if (l === lang) optUrl = `./${filePart}`;
                else if (l === defaultLang) optUrl = `../${filePart}`;
                else optUrl = `../${l}/${filePart}`;
            }
            html = html.replace(optPlaceholder, optUrl);
        });

        // REEMPLAZO BLINDADO MULTILÍNEA
        Object.keys(translations).forEach(key => {
            const val = translations[key];

            // 1. Reemplazo de metas SEO (incluye meta_description y sol_meta_description)
            if (key.includes('meta_description')) {
                const metaRegex = new RegExp(`(data-i18n="${key}"[^>]*content=")[^"]*(")`);
                html = html.replace(metaRegex, `$1${val}$2`);
            } 
            // 2. Reemplazo de placeholders (para el buscador)
            else if (html.includes(`data-i18n-placeholder="${key}"`)) {
                const phRegex = new RegExp(`(data-i18n-placeholder="${key}"[^>]*placeholder=")[^"]*(")`);
                html = html.replace(phRegex, `$1${val}$2`);
            } 
            // 3. Reemplazo de texto normal entre etiquetas
            else {
                const tagRegex = new RegExp(`(data-i18n="${key}"[^>]*>)[\\s\\S]*?(?=<\\/)`, 'g');
                html = html.replace(tagRegex, `$1${val}`);
            }
        });

        // Guardar archivo traducido en su carpeta correspondiente
        if (isDefault) {
            fs.writeFileSync(path.join(__dirname, outputName), html);
        } else {
            const dir = path.join(__dirname, lang);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, outputName), html);
        }
    });
    
    console.log(`✅ Página [${outputName}] generada para: ${langsArray.join(', ')}`);
}

// EJECUCIÓN DEL CONSTRUCTOR
console.log('🚀 Iniciando compilación de Lanza Estudio...');

// 1. Construir la portada en los 7 idiomas
buildPage('template.html', 'index.html', langsFull);

// 2. Construir el catálogo de soluciones solo en ES y EN
buildPage('template-soluciones.html', 'soluciones.html', langsSoluciones);

console.log('✨ Compilación completada con éxito.');