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
        const openModal = () => {
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

    // 3. Shared markdown-to-HTML renderer (mirrors events.js version)
    const renderMarkdown = (content) => {
        if (!content) return '';
        const trimmed = content.trim();
        if (trimmed.startsWith('<')) return trimmed;
        let html = trimmed;
        html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
            `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/^###### (.+)$/gm, '<h6 class="font-bold text-sm mt-4 mb-1">$1</h6>');
        html = html.replace(/^##### (.+)$/gm, '<h5 class="font-bold text-base mt-4 mb-1">$1</h5>');
        html = html.replace(/^#### (.+)$/gm, '<h4 class="font-bold text-lg mt-4 mb-1">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 class="font-bold text-lg mt-4 mb-1">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 class="font-bold text-xl mt-6 mb-2">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 class="font-bold text-2xl mt-8 mb-2">$1</h1>');
        html = html.replace(/^(?:---| - - - |- - -|\*\*\*)$/gm, '<hr class="my-4 border-gray-200" />');
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');
        html = html.replace(/<((?:https?|mailto):[^>]+)>/g, (_, url) =>
            `<a href="${window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(url) : url}" class="text-[#0161bf] hover:underline" target="_blank" rel="noopener noreferrer">${url}</a>`);
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
            `<a href="${window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(url) : url}" class="text-[#0161bf] hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`);
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" class="rounded max-w-full h-auto my-2" />');
        html = html.replace(/((?:^[ \t]*[-*+] .+\n?)+)/gm, (block) => {
            const items = block.trim().split('\n').map(l =>
                `<li>${l.replace(/^[ \t]*[-*+] /, '').replace(/\\$/, '')}</li>`);
            return `<ul class="list-disc list-inside space-y-1 my-2">${items.join('')}</ul>`;
        });
        html = html.replace(/((?:^[ \t]*\d+\. .+\n?)+)/gm, (block) => {
            const items = block.trim().split('\n').map(l =>
                `<li>${l.replace(/^[ \t]*\d+\. /, '').replace(/\\$/, '')}</li>`);
            return `<ol class="list-decimal list-inside space-y-1 my-2">${items.join('')}</ol>`;
        });
        html = html.replace(/\\\r?\n/g, '<br />\n');
        html = html.replace(/\\$/gm, '');
        html = html.split(/\n{2,}/).map(block => {
            block = block.trim();
            if (!block) return '';
            if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div|p|hr|img|table)/.test(block)) return block;
            return `<p>${block.replace(/\n/g, '<br />')}</p>`;
        }).join('\n');
        return html;
    };

    // 4. Details Modal Logic for Event Cards
    const eventModal = document.getElementById('event-modal');
    const closeEventBtn = document.getElementById('close-event-btn');

    const modalImage = document.getElementById('modal-event-image');
    const modalImageContainer = document.getElementById('modal-event-image-container');
    const modalDate = document.getElementById('modal-event-date');
    const modalTag = document.getElementById('modal-event-tag');
    const modalTitle = document.getElementById('modal-event-title');
    const modalTime = document.getElementById('modal-event-time');
    const modalTimeContainer = document.getElementById('modal-event-time-container');
    const modalLoc = document.getElementById('modal-event-location');
    const modalDesc = document.getElementById('modal-event-desc');
    const modalLinkSection = document.getElementById('modal-event-link-section');
    const modalLink = document.getElementById('modal-event-link');

    if (eventModal && closeEventBtn) {
        const openModal = (card) => {
            const eventTitle = card.getAttribute('data-event-title');
            const eventGridData = window.eventsData ? window.eventsData.sections.find(s => s.type === 'EventGrid') : null;
            const event = eventGridData ? eventGridData.events.find(e => e.title === eventTitle) : null;
            if (!event) return;

            const makeRelativePath = (url) => {
                if (!url) return '';
                if (typeof url === 'string' && url.startsWith('/')) {
                    return url.substring(1);
                }
                return url;
            };

            const title = event.title || '';
            const date = event.date || '';
            const tag = event.tag || '';
            const location = event.location || '';
            const time = event.time || '';
            const description = event.longDescription || event.description || '';
            const image = makeRelativePath(event.image);
            const link = event.link || '';
            const linkText = event.linkText || 'Learn More';

            if (modalTitle) modalTitle.textContent = title;
            if (modalDate) modalDate.textContent = date;
            if (modalLoc) modalLoc.textContent = location;
            if (modalDesc) modalDesc.innerHTML = renderMarkdown(description);

            if (modalTag) {
                if (tag) {
                    modalTag.textContent = tag;
                    modalTag.classList.remove('hidden');
                } else {
                    modalTag.classList.add('hidden');
                }
            }

            if (modalTimeContainer && modalTime) {
                if (time) {
                    modalTime.textContent = time;
                    modalTimeContainer.classList.remove('hidden');
                } else {
                    modalTimeContainer.classList.add('hidden');
                }
            }

            if (modalImageContainer && modalImage) {
                if (image && image !== 'null' && image !== '') {
                    modalImage.src = image;
                    modalImage.alt = title;
                    modalImageContainer.classList.remove('hidden');
                } else {
                    modalImageContainer.classList.add('hidden');
                }
            }

            if (modalLinkSection && modalLink) {
                if (link) {
                    modalLink.href = window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(link) : link;
                    modalLink.innerHTML = `
                        ${linkText}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    `;
                    modalLinkSection.classList.remove('hidden');
                } else {
                    modalLinkSection.classList.add('hidden');
                }
            }

            eventModal.classList.remove('hidden');
            eventModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            eventModal.classList.remove('flex');
            eventModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        };

        // Event delegation to catch clicks on any element inside class="event-card"
        document.body.addEventListener('click', (e) => {
            const card = e.target.closest('.event-card');
            if (card) {
                if (e.target.closest('a')) {
                    return; // Let the anchor handle the event
                }
                openModal(card);
            }
        });

        closeEventBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });
    }
});
