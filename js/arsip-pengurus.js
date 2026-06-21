// Arsip Pengurus page dynamic rendering and interactive functionality
document.addEventListener('DOMContentLoaded', () => {
    const cabinetsContainer = document.getElementById('cabinets-list');
    if (cabinetsContainer) {
        const cabinetCards = cabinetsContainer.querySelectorAll('.cabinet-card');
        cabinetCards.forEach(card => {
            const header = card.querySelector('.cabinet-header');
            const body = card.querySelector('.cabinet-body');
            const note = card.querySelector('.cabinet-note');

            if (header && (body || note)) {
                header.addEventListener('click', () => {
                    const isOpen = card.classList.contains('ring-2');

                    if (isOpen) {
                        // Collapse
                        card.classList.remove('ring-2', 'ring-[#0161bf]');
                        if (body) {
                            body.classList.remove('max-h-[3000px]', 'opacity-100', 'p-6');
                            body.classList.add('max-h-0', 'opacity-0', 'p-0');
                        }
                        if (note) {
                            note.classList.remove('max-h-24', 'p-6');
                            note.classList.add('max-h-0', 'p-0', 'overflow-hidden');
                        }
                    } else {
                        // Expand
                        card.classList.add('ring-2', 'ring-[#0161bf]');
                        if (body) {
                            body.classList.remove('max-h-0', 'opacity-0', 'p-0');
                            body.classList.add('max-h-[3000px]', 'opacity-100');
                        }
                        if (note) {
                            note.classList.remove('max-h-0', 'p-0', 'overflow-hidden');
                            note.classList.add('max-h-24', 'p-6');
                        }
                    }
                });
            }
        });
    }
});
