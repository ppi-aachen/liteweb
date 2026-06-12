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

    // Mobile Navigation Group Dropdown Toggles
    const groupToggles = document.querySelectorAll('.mobile-group-toggle');
    groupToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetContainer = document.getElementById(targetId);
            const chevron = btn.querySelector('.chevron-icon');

            if (targetContainer && chevron) {
                const isExpanded = targetContainer.classList.contains('max-h-[500px]');
                if (isExpanded) {
                    targetContainer.classList.remove('max-h-[500px]', 'opacity-100');
                    targetContainer.classList.add('max-h-0', 'opacity-0');
                    chevron.classList.remove('rotate-180');
                } else {
                    targetContainer.classList.remove('max-h-0', 'opacity-0');
                    targetContainer.classList.add('max-h-[500px]', 'opacity-100');
                    chevron.classList.add('rotate-180');
                }
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
