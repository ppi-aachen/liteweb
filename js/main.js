// Helper to ensure links without protocol are treated as absolute/external if they look like domain names
window.ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;
    
    const trimmed = url.trim();
    // Exclude protocols, relative paths, hashes
    if (/^(https?|ftp|mailto|tel):/i.test(trimmed) || 
        trimmed.startsWith('/') || 
        trimmed.startsWith('#') || 
        trimmed.startsWith('./') || 
        trimmed.startsWith('../')) {
        return trimmed;
    }
    
    // Split by first slash to get the potential host name
    const slashIndex = trimmed.indexOf('/');
    const host = slashIndex === -1 ? trimmed : trimmed.substring(0, slashIndex);
    
    // Check if the host looks like a domain name
    if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host)) {
        // Ensure the TLD is not 'html' (which indicates a local page link)
        const parts = host.split('.');
        const tld = parts[parts.length - 1].toLowerCase();
        if (tld !== 'html') {
            return `https://${trimmed}`;
        }
    }
    
    return trimmed;
};

// Global navigation drawer & UI interaction
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-overlay');

    // Toggle Mobile Navigation
    if (mobileMenuBtn && mobileNav && mobileOverlay) {
        const toggleMenu = () => {
            const isOpen = mobileNav.classList.contains('translate-x-0');
            if (isOpen) {
                mobileNav.classList.remove('translate-x-0');
                mobileNav.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                // Reset hamburger icon
                mobileMenuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                `;
            } else {
                mobileNav.classList.remove('-translate-x-full');
                mobileNav.classList.add('translate-x-0');
                mobileOverlay.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
                // Change to close icon
                mobileMenuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                `;
            }
        };

        mobileMenuBtn.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    // Active Navigation Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('data-path') || link.getAttribute('href');
        if (linkPath === currentPath) {
            // Desktop active state
            if (link.closest('nav:not(#mobile-nav)')) {
                link.classList.add('text-black', 'font-bold');
                link.classList.remove('font-light');
                
                // Highlight parent dropdown button if inside one
                const dropdownContainer = link.closest('.dropdown-container');
                if (dropdownContainer) {
                    const parentBtn = dropdownContainer.querySelector('.dropdown-btn');
                    if (parentBtn) {
                        parentBtn.classList.add('text-black', 'font-bold');
                        parentBtn.classList.remove('font-light');
                    }
                }
            }
            // Mobile active state
            if (link.closest('#mobile-nav')) {
                link.classList.add('text-primary-light');
                link.classList.remove('font-light');
                
                // Open and highlight mobile group
                const dropdownContainer = link.closest('.dropdown-container');
                if (dropdownContainer) {
                    const parentBtn = dropdownContainer.querySelector('.mobile-group-toggle');
                    const menu = dropdownContainer.querySelector('.dropdown-menu');
                    if (parentBtn && menu) {
                        parentBtn.classList.add('text-primary-light');
                        menu.classList.remove('max-h-0', 'opacity-0');
                        menu.classList.add('max-h-[500px]', 'opacity-100');
                        const chevron = parentBtn.querySelector('.chevron-icon');
                        if (chevron) chevron.classList.add('rotate-180');
                    }
                }
            }
        }
    });

    // Accessibility for dropdown menus (desktop and mobile)
    const dropdownContainers = document.querySelectorAll('.dropdown-container');

    dropdownContainers.forEach(container => {
        const btn = container.querySelector('.dropdown-btn') || container.querySelector('.mobile-group-toggle');
        const menu = container.querySelector('.dropdown-menu');
        if (!btn || !menu) return;

        const openDropdown = () => {
            container.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            // For mobile group toggles, also open the container using the height class
            if (btn.classList.contains('mobile-group-toggle')) {
                menu.classList.remove('max-h-0', 'opacity-0');
                menu.classList.add('max-h-[500px]', 'opacity-100');
                const chevron = btn.querySelector('.chevron-icon');
                if (chevron) chevron.classList.add('rotate-180');
            }
        };

        const closeDropdown = () => {
            container.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            // For mobile group toggles, also close the container
            if (btn.classList.contains('mobile-group-toggle')) {
                menu.classList.remove('max-h-[500px]', 'opacity-100');
                menu.classList.add('max-h-0', 'opacity-0');
                const chevron = btn.querySelector('.chevron-icon');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        };

        const toggleDropdown = () => {
            const isOpen = container.classList.contains('open');
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        // Mouse hover accessibility: Sync aria-expanded
        container.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('mobile-group-toggle')) {
                btn.setAttribute('aria-expanded', 'true');
            }
        });

        container.addEventListener('mouseleave', () => {
            if (!btn.classList.contains('mobile-group-toggle')) {
                closeDropdown();
            }
        });

        // Click handler (also triggers on Enter keypress on button)
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        // Keyboard handler
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
                btn.focus();
            }
        });

        // Close dropdown when pressing Escape anywhere inside the menu
        menu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
                btn.focus();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });
    });

    // Parallax Scroll Effect for Hero Header
    const heroBg = document.querySelector('.hero-header-bg');
    if (heroBg) {
        const updateParallax = () => {
            const offset = window.pageYOffset || document.documentElement.scrollTop;
            if (offset <= 600) {
                heroBg.style.transform = `translateY(${offset * 0.5}px)`;
            }
        };
        window.addEventListener('scroll', updateParallax);
        updateParallax(); // Initial check
    }
});
