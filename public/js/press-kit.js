// Press Kit page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const logoCards = document.querySelectorAll('.logo-card');
    const logoModal = document.getElementById('logo-modal');
    const closeLogoBtn = document.getElementById('close-logo-btn');
    
    const modalImage = document.getElementById('modal-logo-image');
    const modalTitle = document.getElementById('modal-logo-title');
    const modalFilename = document.getElementById('modal-logo-filename');
    const modalDownload = document.getElementById('modal-logo-download');

    if (logoModal && closeLogoBtn) {
        const openModal = (card) => {
            const name = card.getAttribute('data-name');
            const image = card.getAttribute('data-image');
            const filename = image.split('/').pop();

            if (modalTitle) modalTitle.textContent = name;
            if (modalFilename) modalFilename.textContent = filename;
            if (modalImage) {
                modalImage.src = image;
                modalImage.alt = name;
            }
            if (modalDownload) {
                modalDownload.href = image;
                modalDownload.setAttribute('download', filename);
            }

            logoModal.classList.remove('hidden');
            logoModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            logoModal.classList.remove('flex');
            logoModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        };

        logoCards.forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        closeLogoBtn.addEventListener('click', closeModal);
        logoModal.addEventListener('click', (e) => {
            if (e.target === logoModal) {
                closeModal();
            }
        });
    }
});
