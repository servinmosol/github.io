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
// CONFIGURACIÓN GLOBAL
// ==========================================
const PHONE_NUMBER = "34614956261"; // Tu número sin el +

// ==========================================
// LÓGICA CALCULADORA DE AHORRO Y WHATSAPP
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

        valEmp.textContent = emp;
        valHours.textContent = `${hours}h`;

        const totalHoursAnnual = emp * hours * 48;
        const totalCostAnnual = totalHoursAnnual * 25;

        resHours.textContent = `${totalHoursAnnual.toLocaleString('es-ES')} hrs`;
        resCost.textContent = `${totalCostAnnual.toLocaleString('es-ES')} €`;

        // Traducción dinámica de la calculadora
        if (btnWhatsapp) {
            const part1 = document.getElementById('wa-calc-1')?.textContent.trim() || 'Hola, somos';
            const part2 = document.getElementById('wa-calc-2')?.textContent.trim() || 'personas y perdemos unas';
            const part3 = document.getElementById('wa-calc-3')?.textContent.trim() || 'h a la semana.';
            
            // Forzamos los espacios de separación aquí para evitar problemas con el HTML
            const message = `${part1} ${emp} ${part2} ${hours}${part3}`;
            btnWhatsapp.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        }
    }

    sliderEmp.addEventListener('input', updateCalculator);
    sliderHours.addEventListener('input', updateCalculator);
    updateCalculator();
}

function initWhatsAppPricingLinks() {
    // Escanea todos los enlaces que tengan el atributo data-wa-msg
    document.querySelectorAll('a[data-wa-msg]').forEach(link => {
        const msgId = link.getAttribute('data-wa-msg');
        const textElement = document.getElementById(msgId);
        
        if (textElement) {
            const message = textElement.textContent.trim();
            // Actualiza el href automáticamente con el número y el texto en el idioma correcto
            link.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initWhatsAppPricingLinks();
});

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

// ==========================================
// LÓGICA MÓVIL HERO (NOTIFICACIONES PUSH)
// ==========================================
function initHeroPhone() {
    const cards = document.querySelectorAll('.notification-card');
    if (cards.length === 0) return;

    function animateNotifications() {
        // 1. Ocultar todas primero y bajarlas
        cards.forEach(card => {
            card.classList.remove('opacity-100', 'translate-y-0');
            card.classList.add('opacity-0', 'translate-y-8');
        });

        // 2. Hacerlas aparecer una a una con un pequeño retraso
        setTimeout(() => {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('opacity-0', 'translate-y-8');
                    card.classList.add('opacity-100', 'translate-y-0');
                }, index * 900); // 900ms de diferencia entre cada notificación
            });
        }, 500); // Retraso inicial antes de que salte la primera

        // 3. Reiniciar el bucle cada 7 segundos para que nunca esté parado
        setTimeout(animateNotifications, 7000);
    }

    // Arrancar la animación
    animateNotifications();
}

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initWhatsAppPricingLinks();
    initModals(); 
    initHeroPhone(); // <-- Arrancamos el móvil aquí
});