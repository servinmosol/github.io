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

        html = html.replace(/\{\{LANG\}\}/g, () => lang);
        html = html.replace(/\{\{HREFLANG_TAGS\}\}/g, () => hreflangTags);
        html = html.replace(/\{\{BASE_PATH\}\}/g, () => basePath);
        html = html.replace(/\{\{HOME_URL\}\}/g, () => isDefault ? './' : `../${lang}/`);

        // Generar Canonical absoluto y Locale exacto para el <head>
        const filePart = outputName === 'index.html' ? '' : outputName;
        const canonicalUrl = isDefault ? `${DOMAIN}/${filePart}` : `${DOMAIN}/${lang}/${filePart}`;
        // Limpiamos la barra final si está vacío para evitar "lanzaestudio.com/"
        html = html.replace(/\{\{CANONICAL_URL\}\}/g, () => canonicalUrl.replace(/\/$/, ''));
        
        // Reemplazo de variables SEO directas para Redes Sociales y Schema
        html = html.replace(/\{\{META_TITLE\}\}/g, () => translations['meta_title'] || 'Lanza Estudio');
        html = html.replace(/\{\{META_DESC\}\}/g, () => translations['meta_description'] || '');

        // AÑADE ESTAS DOS LÍNEAS NUEVAS:
        html = html.replace(/\{\{SOL_META_TITLE\}\}/g, () => translations['sol_meta_title'] || 'Casos de Éxito - Lanza Estudio');
        html = html.replace(/\{\{SOL_META_DESC\}\}/g, () => translations['sol_meta_description'] || '');
        
        // Mapeo automático de región (og:locale)
        const locales = { es: 'es_ES', en: 'en_US', fr: 'fr_FR', de: 'de_DE', pt: 'pt_PT', nl: 'nl_NL', it: 'it_IT' };
        html = html.replace(/\{\{OG_LOCALE\}\}/g, () => locales[lang] || 'es_ES');

        // LÓGICA DE FALLBACK PARA EL CATÁLOGO DE SOLUCIONES
        let linkSoluciones = '';
        if (lang === 'es' || lang === 'en') {
            linkSoluciones = './soluciones.html';
        } else {
            // Si el idioma es FR, DE, PT, NL o IT, enviamos a la versión en inglés
            linkSoluciones = '../en/soluciones.html';
        }
        html = html.replace(/\{\{LINK_SOLUCIONES\}\}/g, () => linkSoluciones);

        langsArray.forEach(l => {
            const selectedPlaceholder = `{{SELECTED_${l.toUpperCase()}}}`;
            html = html.replace(new RegExp(selectedPlaceholder, 'g'), () => (l === lang ? 'selected' : ''));
            
            const filePart = outputName === 'index.html' ? '' : outputName;
            let optUrl = isDefault 
                ? (l === defaultLang ? `./${filePart}` : `./${l}/${filePart}`)
                : (l === lang ? `./${filePart}` : (l === defaultLang ? `../${filePart}` : `../${l}/${filePart}`));
            
            const optPlaceholder = `{{LANG_OPT_${l.toUpperCase()}}}`;
            html = html.replace(new RegExp(optPlaceholder, 'g'), () => optUrl);
        });

        // REEMPLAZO BLINDADO (Inmune a símbolos $ en el JSON)
        Object.keys(translations).forEach(key => {
            const val = translations[key];
            if (key.includes('meta_description')) {
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*content=")[^"]*(")`), (match, p1, p2) => p1 + val + p2);
            } else if (html.includes(`data-i18n-placeholder="${key}"`)) {
                html = html.replace(new RegExp(`(data-i18n-placeholder="${key}"[^>]*placeholder=")[^"]*(")`), (match, p1, p2) => p1 + val + p2);
            } else {
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*>)[\\s\\S]*?(?=<\\/)`, 'g'), (match, p1) => p1 + val);
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
        
        // Cargar diccionario general
        const localePath = path.join(__dirname, 'locales', `${lang}.json`);
        const translations = fs.existsSync(localePath) ? JSON.parse(fs.readFileSync(localePath, 'utf-8')) : {};

        const isDefault = lang === defaultLang;
        const outputBaseDir = isDefault ? path.join(__dirname, 'caso') : path.join(__dirname, lang, 'caso');
        if (!fs.existsSync(outputBaseDir)) fs.mkdirSync(outputBaseDir, { recursive: true });

        files.forEach(file => {
            const caseData = JSON.parse(fs.readFileSync(path.join(casosDir, file), 'utf-8'));
            let html = template;

            const basePath = isDefault ? '..' : '../..';
            
            // LÓGICA HREFLANG BLINDADA: Si no existe el campo _hreflang en el JSON, usa el tag actual
            const tagEs = isDefault ? caseData.service_tag : (caseData.service_tag_hreflang || caseData.service_tag);
            const tagEn = isDefault ? (caseData.service_tag_hreflang || caseData.service_tag) : caseData.service_tag;

            const urlEs = isDefault ? `./${tagEs}.html` : `../../caso/${tagEs}.html`;
            const urlEn = isDefault ? `../en/caso/${tagEn}.html` : `./${tagEn}.html`;
            
            const hreflangTags = `
    <link rel="alternate" hreflang="es" href="${DOMAIN}/caso/${tagEs}.html" />
    <link rel="alternate" hreflang="en" href="${DOMAIN}/en/caso/${tagEn}.html" />`;

            // Inyectar Rutas Base
            html = html.replace(/\{\{LANG\}\}/g, () => lang);
            html = html.replace(/\{\{BASE_PATH\}\}/g, () => basePath);
            html = html.replace(/\{\{HOME_URL\}\}/g, () => isDefault ? '../' : `../../${lang}/`);
            html = html.replace(/\{\{HREFLANG_TAGS\}\}/g, () => hreflangTags);
            html = html.replace(/\{\{URL_ES\}\}/g, () => urlEs);
            html = html.replace(/\{\{URL_EN\}\}/g, () => urlEn);
            html = html.replace(/\{\{SELECTED_ES\}\}/g, () => (isDefault ? 'selected' : ''));
            html = html.replace(/\{\{SELECTED_EN\}\}/g, () => (!isDefault ? 'selected' : ''));
            html = html.replace(/\{\{CURRENT_DATE\}\}/g, () => today);
            // Generar URL exacta para compartir (sin /es/ si es el idioma por defecto)
            const shareUrl = isDefault ? `${DOMAIN}/caso/${tagEs}.html` : `${DOMAIN}/${lang}/caso/${tagEn}.html`;
            html = html.replace(/\{\{SHARE_URL\}\}/g, () => shareUrl);

            // Inyectar el mapeo de región (og:locale) para los casos
            const locales = { es: 'es_ES', en: 'en_US', fr: 'fr_FR', de: 'de_DE', pt: 'pt_PT', nl: 'nl_NL', it: 'it_IT' };
            html = html.replace(/\{\{OG_LOCALE\}\}/g, () => locales[lang] || 'es_ES');

            // Inyectar Datos del JSON del Caso de forma segura
            const keysToReplace = ['SEO_TITLE', 'SEO_DESC', 'SERVICE_TAG', 'CATEGORY', 'TITLE', 'AUTHOR_NAME', 'AUTHOR_ROLE', 'AUTHOR_PITCH', 'AUTHOR_IMAGE', 'BODY'];
            keysToReplace.forEach(key => {
                const val = caseData[key.toLowerCase()] || '';
                html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), () => val);
            });
            
            // Generar URL de WhatsApp dinámica
            const waTemplate = translations['wa_case_msg'] || "Hola, vengo del caso: {TITLE}. Me gustaría hablar con un experto.";
            const waText = waTemplate.replace('{TITLE}', caseData.title);
            html = html.replace(/\{\{WA_CASE_URL\}\}/g, () => encodeURIComponent(waText));
            
            // Inyectar traducciones estáticas del template de forma segura
            Object.keys(translations).forEach(key => {
                const val = translations[key];
                html = html.replace(new RegExp(`(data-i18n="${key}"[^>]*>)[\\s\\S]*?(?=<\\/)`, 'g'), (match, p1) => p1 + val);
            });

            // Guardar HTML estático
            fs.writeFileSync(path.join(outputBaseDir, `${caseData.service_tag}.html`), html);

            // Alimentar el índice del catálogo
            indexData.push({
                service_tag: caseData.service_tag,
                category: caseData.category,
                title: caseData.title,
                author_name: caseData.author_name,
                author_role: caseData.author_role,
                author_image: caseData.author_image
            });
        });

        // Generar el archivo índice
        fs.writeFileSync(path.join(__dirname, `indice-soluciones-${lang}.json`), JSON.stringify(indexData));
        console.log(`✅ Procesados ${files.length} casos en [${lang.toUpperCase()}] y generado su índice.`);
    });
}

console.log('🚀 Iniciando compilación de Lanza Estudio...');
buildPage('template.html', 'index.html', langsFull);
buildPage('template-soluciones.html', 'soluciones.html', langsSoluciones);
buildCases();
console.log('✨ Compilación completada con éxito.');