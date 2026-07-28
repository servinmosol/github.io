const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://lanzaestudio.com'; 

// Idiomas de la web
const langsFull = ['es', 'en', 'fr', 'de', 'pt', 'nl', 'it'];
const langsSoluciones = ['es', 'en']; 
const defaultLang = 'es';

// Función para páginas normales (Portada y Catálogo)
function buildPage(templateName, outputName, langsArray) {
    const templatePath = path.join(__dirname, templateName);
    if (!fs.existsSync(templatePath)) return;

    const template = fs.readFileSync(templatePath, 'utf-8');

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

        html = html.replace(/\{\{LANG\}\}/g, lang);
        html = html.replace(/\{\{HREFLANG_TAGS\}\}/g, hreflangTags);
        html = html.replace(/\{\{BASE_PATH\}\}/g, basePath);

        // LÓGICA DE FALLBACK PARA EL CATÁLOGO DE SOLUCIONES
        let linkSoluciones = '';
        if (lang === 'es') {
            linkSoluciones = './soluciones.html';
        } else if (lang === 'en') {
            linkSoluciones = './soluciones.html';
        } else {
            // Si el idioma es FR, DE, PT, NL o IT, los enviamos a la versión en inglés
            linkSoluciones = '../en/soluciones.html';
        }
        html = html.replace(/\{\{LINK_SOLUCIONES\}\}/g, linkSoluciones);

        langsArray.forEach(l => {
            const selectedPlaceholder = `{{SELECTED_${l.toUpperCase()}}}`;
            html = html.replace(selectedPlaceholder, l === lang ? 'selected' : '');
            
            const filePart = outputName === 'index.html' ? '' : outputName;
            let optUrl = isDefault 
                ? (l === defaultLang ? `./${filePart}` : `./${l}/${filePart}`)
                : (l === lang ? `./${filePart}` : (l === defaultLang ? `../${filePart}` : `../${l}/${filePart}`));
            
            const optPlaceholder = `{{LANG_OPT_${l.toUpperCase()}}}`;
            html = html.replace(optPlaceholder, optUrl);
        });

        Object.keys(translations).forEach(key => {
            const val = translations[key];
            if (key.includes('meta_description')) {
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*content=")[^"]*(")`), `$1${val}$2`);
            } else if (html.includes(`data-i18n-placeholder="${key}"`)) {
                html = html.replace(new RegExp(`(data-i18n-placeholder="${key}"[^>]*placeholder=")[^"]*(")`), `$1${val}$2`);
            } else {
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*>)[\\s\\S]*?(?=<\\/)`, 'g'), `$1${val}`);
            }
        });

        const outputDir = isDefault ? __dirname : path.join(__dirname, lang);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, outputName), html);
    });
    console.log(`✅ Página [${outputName}] generada.`);
}

// Función para generar los Casos de Éxito y el Índice
function buildCases() {
    const templateCasoPath = path.join(__dirname, 'template-caso.html');
    if (!fs.existsSync(templateCasoPath)) {
        console.warn('⚠️ No se encontró template-caso.html, omitiendo casos.');
        return;
    }
    const template = fs.readFileSync(templateCasoPath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];

    langsSoluciones.forEach(lang => {
        const casosDir = path.join(__dirname, 'datos-casos', lang);
        if (!fs.existsSync(casosDir)) {
            fs.mkdirSync(casosDir, { recursive: true });
            return;
        }

        const files = fs.readdirSync(casosDir).filter(f => f.endsWith('.json'));
        const indexData = [];
        
        // Cargar diccionario general (para botones del footer/header del caso)
        const localePath = path.join(__dirname, 'locales', `${lang}.json`);
        const translations = fs.existsSync(localePath) ? JSON.parse(fs.readFileSync(localePath, 'utf-8')) : {};

        const isDefault = lang === defaultLang;
        // La ruta final será /caso/ (para ES) o /en/caso/ (para EN)
        const outputBaseDir = isDefault ? path.join(__dirname, 'caso') : path.join(__dirname, lang, 'caso');
        if (!fs.existsSync(outputBaseDir)) fs.mkdirSync(outputBaseDir, { recursive: true });

        files.forEach(file => {
            const caseData = JSON.parse(fs.readFileSync(path.join(casosDir, file), 'utf-8'));
            let html = template;

            // Variables de SEO y Rutas
            const basePath = isDefault ? '..' : '../..';
            const urlEs = isDefault ? `./${caseData.service_tag}.html` : `../../caso/${caseData.service_tag_hreflang}.html`;
            const urlEn = isDefault ? `../en/caso/${caseData.service_tag_hreflang}.html` : `./${caseData.service_tag}.html`;
            
            const hreflangTags = `
    <link rel="alternate" hreflang="es" href="${DOMAIN}/caso/${isDefault ? caseData.service_tag : caseData.service_tag_hreflang}.html" />
    <link rel="alternate" hreflang="en" href="${DOMAIN}/en/caso/${isDefault ? caseData.service_tag_hreflang : caseData.service_tag}.html" />`;

            // Inyectar Rutas Base
            html = html.replace(/\{\{LANG\}\}/g, lang);
            html = html.replace(/\{\{BASE_PATH\}\}/g, basePath);
            html = html.replace(/\{\{HREFLANG_TAGS\}\}/g, hreflangTags);
            html = html.replace(/\{\{URL_ES\}\}/g, urlEs);
            html = html.replace(/\{\{URL_EN\}\}/g, urlEn);
            html = html.replace(/\{\{SELECTED_ES\}\}/g, isDefault ? 'selected' : '');
            html = html.replace(/\{\{SELECTED_EN\}\}/g, !isDefault ? 'selected' : '');
            html = html.replace(/\{\{CURRENT_DATE\}\}/g, today);

            // Inyectar Datos del JSON del Caso
            const keysToReplace = ['SEO_TITLE', 'SEO_DESC', 'SERVICE_TAG', 'CATEGORY', 'TITLE', 'AUTHOR_NAME', 'AUTHOR_ROLE', 'AUTHOR_PITCH', 'AUTHOR_IMAGE', 'BODY'];
            keysToReplace.forEach(key => {
                const val = caseData[key.toLowerCase()] || '';
                html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
            });

            // Inyectar traducciones estáticas del template (Botones, Footer)
            Object.keys(translations).forEach(key => {
                const val = translations[key];
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*>)[\\s\\S]*?(?=<\\/)`, 'g'), `$1${val}`);
            });

            // Guardar HTML estático
            fs.writeFileSync(path.join(outputBaseDir, `${caseData.service_tag}.html`), html);

            // Alimentar el índice
            indexData.push({
                service_tag: caseData.service_tag,
                category: caseData.category,
                title: caseData.title,
                author_name: caseData.author_name,
                author_role: caseData.author_role,
                author_image: caseData.author_image
            });
        });

        // Generar el archivo índice para el buscador en este idioma
        fs.writeFileSync(path.join(__dirname, `indice-soluciones-${lang}.json`), JSON.stringify(indexData));
        console.log(`✅ Procesados ${files.length} casos en [${lang.toUpperCase()}] y generado su índice.`);
    });
}

console.log('🚀 Iniciando compilación de Lanza Estudio...');
buildPage('template.html', 'index.html', langsFull);
buildPage('template-soluciones.html', 'soluciones.html', langsSoluciones);
buildCases();
console.log('✨ Compilación completada con éxito.');