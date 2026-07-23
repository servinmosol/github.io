// ==========================================
// GESTOR DE MODO OSCURO / CLARO
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

function getSavedTheme() {
    try { return localStorage.getItem('theme'); } catch(e) { return null; }
}
function saveTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch(e) {}
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

// ==========================================
// LÓGICA CALCULADORA DE AHORRO
// ==========================================
function initCalculator() {
    const sliderEmp = document.getElementById('slider-employees');
    const sliderHours = document.getElementById('slider-hours');
    
    const valEmp = document.getElementById('val-employees');
    const valHours = document.getElementById('val-hours');
    
    const resHours = document.getElementById('res-annual-hours');
    const resCost = document.getElementById('res-annual-cost');
    const btnWhatsapp = document.getElementById('btn-calc-whatsapp');

    if (!sliderEmp || !sliderHours) return;

    function updateCalculator() {
        const emp = parseInt(sliderEmp.value);
        const hours = parseInt(sliderHours.value);

        // Actualizar labels de los sliders
        valEmp.textContent = emp;
        valHours.textContent = `${hours}h`;

        // Cálculo anual (48 semanas laborables aprox.)
        const totalHoursAnnual = emp * hours * 48;
        const totalCostAnnual = totalHoursAnnual * 25; // 25€/h coste medio estimado

        // Formatear números
        resHours.textContent = `${totalHoursAnnual.toLocaleString('es-ES')} hrs`;
        resCost.textContent = `${totalCostAnnual.toLocaleString('es-ES')} €`;

        // Enlace WhatsApp con mensaje pre-rellenado
        const phoneNumber = "34600000000"; // Pon aquí tu número real cuando lo tengas
        const message = `Hola, he probado la calculadora de la web. Somos ${emp} persona(s) y perdemos unas ${hours}h a la semana cada uno en tareas repetitivas. Me gustaría evaluar opciones de automatización.`;
        
        if (btnWhatsapp) {
            btnWhatsapp.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        }
    }

    sliderEmp.addEventListener('input', updateCalculator);
    sliderHours.addEventListener('input', updateCalculator);

    // Ejecución inicial
    updateCalculator();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initCalculator);

// ==========================================
// GESTOR DE MODAL LEGAL Y PRIVACIDAD
// ==========================================
function initModals() {
    const modal = document.getElementById('legal-modal');
    const modalContainer = document.getElementById('modal-container');
    const btnClose = document.getElementById('close-modal');
    const linkLegal = document.getElementById('link-legal');
    const linkPrivacy = document.getElementById('link-privacy');
    const contentLegal = document.getElementById('content-legal');
    const contentPrivacy = document.getElementById('content-privacy');
    const modalTitle = document.getElementById('modal-title');

    if (!modal) return;

    function openModal(type) {
        modal.classList.remove('hidden');
        // Pequeño timeout para que la transición de opacidad/escala funcione en Tailwind
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContainer.classList.remove('scale-95');
        }, 10);
        
        if (type === 'legal') {
            modalTitle.textContent = "Aviso Legal";
            contentLegal.classList.remove('hidden');
            contentPrivacy.classList.add('hidden');
        } else {
            modalTitle.textContent = "Política de Privacidad";
            contentPrivacy.classList.remove('hidden');
            contentLegal.classList.add('hidden');
        }
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalContainer.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // Espera a que termine la animación
    }

    if (linkLegal) linkLegal.addEventListener('click', (e) => { e.preventDefault(); openModal('legal'); });
    if (linkPrivacy) linkPrivacy.addEventListener('click', (e) => { e.preventDefault(); openModal('privacy'); });
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
}

document.addEventListener('DOMContentLoaded', initModals);