// AD/ART page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const adartTrigger = document.getElementById('adart-trigger');
    const adartModal = document.getElementById('adart-modal');
    const closeAdartBtn = document.getElementById('close-adart-btn');
    const adartIframe = document.getElementById('adart-iframe');

    if (adartTrigger && adartModal && closeAdartBtn) {
        const docUrl = "https://docs.google.com/document/d/e/2PACX-1vS1P12969Vut22ytyBniEyIdopjk08xi5fk73IlC4ZA90_lp01PiB9L78Rz-86c7D7BUgVpnb1Q4Ito/pub?embedded=true";

        const openModal = () => {
            if (adartIframe && adartIframe.src === 'about:blank' || !adartIframe.src) {
                adartIframe.src = docUrl;
            }
            adartModal.classList.remove('hidden');
            adartModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            adartModal.classList.remove('flex');
            adartModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        };

        adartTrigger.addEventListener('click', openModal);
        closeAdartBtn.addEventListener('click', closeModal);
        adartModal.addEventListener('click', (e) => {
            if (e.target === adartModal) {
                closeModal();
            }
        });
    }
});
