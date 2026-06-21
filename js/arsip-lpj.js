// Arsip LPJ page specific functionality
document.addEventListener('DOMContentLoaded', () => {

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
            const rawUrl = card.getAttribute('data-url');
            const url = window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(rawUrl) : rawUrl;
            
            const previewUrl = url.replace('/view', '/preview');

            if (modalTitle) modalTitle.textContent = `LPJ ${year}`;
            
            const mobileBtn = document.getElementById('modal-lpj-mobile-btn');
            if (mobileBtn) mobileBtn.href = url;

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
