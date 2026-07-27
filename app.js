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

// ==========================================
// LÓGICA DEL CATÁLOGO DE SOLUCIONES (FILTROS)
// ==========================================
function initSolutionsCatalog() {
    const grid = document.getElementById('solutions-grid');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!grid) return; // Si no estamos en la página del catálogo, abortamos

    // DUMMY DATA: Simulamos el índice JSON que generará tu script build.js
    const solutions = [
        {
            service_tag: "abismo-checkout-dinamico",
            category: "SEO y Posicionamiento",
            title: "El Abismo del Checkout Dinámico: Cuando tu SEO Atrae Clientes pero tu Código Bloquea la Venta",
            author_name: "Jacinto",
            author_role: "CEO & Fundador",
            author_image: "./img/avatar-jac.webp" // Cambiarás esto a tu ruta real
        },
        {
            service_tag: "automatizacion-facturas",
            category: "IA & Bots",
            title: "Extracción automática de datos en facturas PDF con LLMs",
            author_name: "Laura",
            author_role: "Lead Developer",
            author_image: ""
        },
        {
            service_tag: "migracion-aws-zero-downtime",
            category: "APIs & Cloud",
            title: "Sincronización masiva de inventarios B2B sin tiempos de caída",
            author_name: "Jacinto",
            author_role: "CEO & Fundador",
            author_image: "./img/avatar-jac.webp"
        },
        {
            service_tag: "dashboard-operativo",
            category: "Sistemas a Medida",
            title: "Desarrollo de panel de control unificado para gestión logística en tiempo real",
            author_name: "Carlos",
            author_role: "Arquitecto de Software",
            author_image: ""
        }
    ];

    let currentFilter = 'all';
    let currentSearch = '';

    function renderCards() {
        grid.innerHTML = '';
        
        // 1. Filtrar por categoría y texto
        const filtered = solutions.filter(item => {
            const matchCategory = currentFilter === 'all' || item.category === currentFilter;
            const matchSearch = item.title.toLowerCase().includes(currentSearch.toLowerCase());
            return matchCategory && matchSearch;
        });

        // 2. Mostrar estado vacío si no hay resultados
        if (filtered.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
        }

        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');

        // 3. Renderizar las tarjetas
        filtered.forEach(item => {
            // Asignar colores según categoría (estilo premium)
            let badgeColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
            if(item.category === 'APIs & Cloud') badgeColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
            if(item.category === 'IA & Bots') badgeColor = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50";
            if(item.category === 'Sistemas a Medida') badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";

            // Fallback para imágenes vacías (crea un avatar de colores con la inicial)
            const imgHtml = item.author_image 
                ? `<img src="${item.author_image}" alt="${item.author_name}" class="w-full h-full object-cover">`
                : `<img src="https://ui-avatars.com/api/?name=${item.author_name}&background=10b981&color=fff" class="w-full h-full object-cover">`;

            const cardHTML = `
                <a href="./soluciones/${item.service_tag}.html" class="group flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300">
                    <div>
                        <span class="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border mb-5 ${badgeColor}">
                            ${item.category}
                        </span>
                        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-3">
                            ${item.title}
                        </h3>
                    </div>
                    <div class="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            ${imgHtml}
                        </div>
                        <div>
                            <p class="text-sm font-bold text-gray-900 dark:text-gray-100">${item.author_name}</p>
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${item.author_role}</p>
                        </div>
                    </div>
                </a>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // 4. Listeners para los botones de categoría
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Reiniciar estilos de los botones
            filterButtons.forEach(b => {
                b.classList.remove('bg-gray-900', 'text-white', 'dark:bg-white', 'dark:text-gray-900', 'active', 'shadow-md');
                b.classList.add('bg-white/60', 'dark:bg-gray-900/60', 'text-gray-600', 'dark:text-gray-300');
            });
            
            // Activar el botón clicado
            const target = e.currentTarget;
            target.classList.add('bg-gray-900', 'text-white', 'dark:bg-white', 'dark:text-gray-900', 'active', 'shadow-md');
            target.classList.remove('bg-white/60', 'dark:bg-gray-900/60', 'text-gray-600', 'dark:text-gray-300');

            currentFilter = target.getAttribute('data-filter');
            renderCards();
        });
    });

    // 5. Listener para el cuadro de búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderCards();
        });
    }

    // Arrancar la función pintando todo la primera vez
    renderCards();
}

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initWhatsAppPricingLinks();
    initModals(); 
    initHeroPhone(); 
    initSolutionsCatalog(); // <-- Arrancamos el catálogo aquí
});