// Arsip LPJ page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    if (!window.lpjData) return;

    // 1. Render LPJ grid cards
    const lpjGrid = document.getElementById('lpj-grid');
    if (lpjGrid) {
        const lpjListSection = window.lpjData.sections.find(s => s.type === 'LpjList');
        const lpjList = lpjListSection ? lpjListSection.items : [];

        lpjGrid.innerHTML = lpjList.map((lpj) => `
            <div
              class="lpj-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0161bf] transition-all group flex items-center justify-between cursor-pointer"
              data-year="${lpj.year}"
              data-url="${lpj.url}"
            >
              <div>
                <h3 class="heading-3 mt-0 mb-1 group-hover:text-[#0161bf] transition-colors">LPJ ${lpj.year}</h3>
                <p class="body-text text-sm text-gray-500 mt-0">View Document</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
        `).join('');
    }

    // 2. Modal interactions
    const lpjCards = document.querySelectorAll('.lpj-card');
    const lpjModal = document.getElementById('lpj-modal');
    const closeLpjBtn = document.getElementById('close-lpj-btn');
    
    const modalTitle = document.getElementById('modal-lpj-title');
    const modalIframe = document.getElementById('modal-lpj-iframe');
    const modalNewtab = document.getElementById('modal-lpj-newtab');

    if (lpjModal && closeLpjBtn) {
        const openModal = (card) => {
            const year = card.getAttribute('data-year');
            const url = card.getAttribute('data-url');
            
            const previewUrl = url.replace('/view', '/preview');

            if (modalTitle) modalTitle.textContent = `LPJ ${year}`;
            if (modalIframe) modalIframe.src = previewUrl;
            if (modalNewtab) modalNewtab.href = url;

            lpjModal.classList.remove('hidden');
            lpjModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            lpjModal.classList.remove('flex');
            lpjModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            if (modalIframe) modalIframe.src = 'about:blank'; // Reset iframe source
        };

        lpjCards.forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        closeLpjBtn.addEventListener('click', closeModal);
        lpjModal.addEventListener('click', (e) => {
            if (e.target === lpjModal) {
                closeModal();
            }
        });
    }
});
