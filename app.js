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
// LÓGICA SIMULACIÓN HERO (DASHBOARD)
// ==========================================
function initHeroInteractive() {
    const btn = document.getElementById('hero-btn');
    if (!btn) return;

    const progress = document.getElementById('hero-progress');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const aura = document.getElementById('hero-aura');

    let isRunning = false;

    function markDone(stepEl) {
        stepEl.classList.add('border-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/20');
        const icon = stepEl.querySelector('.status-icon');
        icon.textContent = '✓';
        icon.classList.remove('text-gray-300', 'dark:text-gray-600');
        icon.classList.add('text-emerald-500', 'dark:text-emerald-400', 'font-black');
    }

    function resetUI() {
        isRunning = false;
        progress.style.width = '0%';
        btn.innerHTML = '▶ Ejecutar Simulación';
        btn.classList.remove('bg-emerald-500', 'text-white', 'dark:bg-emerald-500', 'dark:text-white', 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', 'cursor-not-allowed', 'opacity-80');
        btn.classList.add('bg-gray-900', 'dark:bg-white', 'text-white', 'dark:text-gray-900', 'hover:bg-emerald-500', 'dark:hover:bg-emerald-400');
        
        aura.classList.remove('bg-emerald-500/40', 'bg-amber-500/20');
        aura.classList.add('bg-emerald-500/20');

        const steps = [step1, step2, step3];
        steps.forEach(s => {
            const icon = s.querySelector('.status-icon');
            icon.textContent = '⏳';
            icon.className = 'status-icon text-gray-300 dark:text-gray-600 text-sm';
            s.classList.remove('border-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/20');
        });
    }

    btn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;

        // 1. Estado "Procesando"
        btn.innerHTML = 'Procesando Flujo...';
        btn.classList.remove('hover:bg-emerald-500', 'dark:hover:bg-emerald-400');
        btn.classList.add('opacity-80', 'cursor-not-allowed');
        
        aura.classList.remove('bg-emerald-500/20');
        aura.classList.add('bg-amber-500/20'); // Luz de proceso (naranja)

        // 2. Ejecutar Paso 1 (WhatsApp)
        setTimeout(() => {
            progress.style.width = '33%';
            markDone(step1);
        }, 800);

        // 3. Ejecutar Paso 2 (IA)
        setTimeout(() => {
            progress.style.width = '66%';
            markDone(step2);
        }, 1800);

        // 4. Ejecutar Paso 3 (CRM) y Finalizar
        setTimeout(() => {
            progress.style.width = '100%';
            markDone(step3);
            
            // Botón verde de éxito
            btn.innerHTML = '✨ ¡Automatización Completada!';
            btn.classList.remove('bg-gray-900', 'dark:bg-white', 'opacity-80', 'cursor-not-allowed');
            btn.classList.add('bg-emerald-500', 'text-white', 'dark:bg-emerald-500', 'dark:text-white', 'shadow-[0_0_20px_rgba(16,185,129,0.4)]');
            
            aura.classList.remove('bg-amber-500/20');
            aura.classList.add('bg-emerald-500/40'); // Luz de éxito intensa

            // 5. Reiniciar después de 4 segundos
            setTimeout(() => {
                resetUI();
            }, 4000);
        }, 2800);
    });
}

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initWhatsAppPricingLinks();
    initModals(); // Aseguramos que los modales también se inician aquí
    initHeroInteractive(); // <-- NUESTRA NUEVA FUNCIÓN
});