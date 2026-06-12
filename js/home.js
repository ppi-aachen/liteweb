// Home page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carousel Logic
    const carouselTrack = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (carouselTrack && prevBtn && nextBtn && dots.length > 0) {
        let currentSlide = 0;
        const totalSlides = dots.length;
        const autoSlideInterval = 5000;
        let slideTimer;

        const updateCarousel = (index) => {
            currentSlide = (index + totalSlides) % totalSlides;
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots styling (support infinite/large number of dots pagination styling)
            dots.forEach((dot, idx) => {
                if (idx === currentSlide) {
                    dot.classList.add('bg-opacity-100', 'p-2');
                    dot.classList.remove('bg-opacity-50');
                } else {
                    dot.classList.add('bg-opacity-50');
                    dot.classList.remove('bg-opacity-100', 'p-2');
                }

                // Mimic the React dots shrinking at edges if more than 7 slides
                if (totalSlides > 7) {
                    const maxDots = 7;
                    const half = Math.floor(maxDots / 2);
                    let startDot = Math.max(0, Math.min(currentSlide - half, totalSlides - maxDots));
                    const endDot = startDot + maxDots - 1;
                    
                    if (idx < startDot || idx > endDot) {
                        dot.classList.add('hidden');
                    } else {
                        dot.classList.remove('hidden');
                        const isLeftEdge = idx === startDot && startDot > 0;
                        const isRightEdge = idx === endDot && idx < totalSlides - 1;
                        if (isLeftEdge || isRightEdge) {
                            dot.classList.add('w-1.5', 'h-1.5', 'opacity-40');
                            dot.classList.remove('w-3', 'h-3');
                        } else {
                            dot.classList.add('w-3', 'h-3');
                            dot.classList.remove('w-1.5', 'h-1.5', 'opacity-40');
                        }
                    }
                }
            });
        };

        const nextSlide = () => updateCarousel(currentSlide + 1);
        const prevSlide = () => updateCarousel(currentSlide - 1);

        const startAutoSlide = () => {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, autoSlideInterval);
        };

        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });

        // Initialize dots pagination
        updateCarousel(0);
        startAutoSlide();
    }

    // 2. PDF Modal Logic (Aachen für Dummies)
    const pdfTrigger = document.getElementById('pdf-trigger');
    const pdfModal = document.getElementById('pdf-modal');
    const closePdfBtn = document.getElementById('close-pdf-btn');

    if (pdfTrigger && pdfModal && closePdfBtn) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const pdfUrl = "https://drive.google.com/file/d/1JtwUe0FkGHvXqIJbFa0i6iVw79eA-Cu4/view?usp=sharing";

        const openModal = () => {
            if (isMobile) {
                window.open(pdfUrl, '_blank');
                return;
            }
            pdfModal.classList.remove('hidden');
            pdfModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            pdfModal.classList.remove('flex');
            pdfModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        };

        pdfTrigger.addEventListener('click', openModal);
        closePdfBtn.addEventListener('click', closeModal);
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                closeModal();
            }
        });
    }
});
