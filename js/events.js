// Events page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const makeRelativePath = (url) => {
        if (!url) return '';
        if (typeof url === 'string' && url.startsWith('/')) {
            return url.substring(1);
        }
        return url;
    };

    const parseDate = (dateStr) => {
        const cleanDateStr = dateStr.replace(/deadline:\s*/i, '');
        const monthRangeMatch = cleanDateStr.match(/^([A-Za-z]+)\s*-\s*([A-Za-z]+)\s+(\d{4})$/);
        if (monthRangeMatch) {
            const monthName = monthRangeMatch[1];
            const year = monthRangeMatch[3];
            return parseDate(`1 ${monthName} ${year}`);
        }

        const parts = cleanDateStr.match(/(\d+)(?:-\d+)?\s+([A-Za-z]+)\s+(\d{4})/);
        if (parts) {
            const day = parseInt(parts[1], 10);
            const monthName = parts[2].toLowerCase();
            const year = parseInt(parts[3], 10);

            const monthMap = {
                'januari': 0, 'january': 0, 'jan': 0,
                'februari': 1, 'february': 1, 'feb': 1,
                'maret': 2, 'march': 2, 'mar': 2,
                'april': 3, 'apr': 3,
                'mei': 4, 'may': 4,
                'juni': 5, 'june': 5, 'jun': 5,
                'juli': 6, 'july': 6, 'jul': 6,
                'agustus': 7, 'august': 7, 'aug': 7,
                'september': 8, 'sep': 8,
                'oktober': 9, 'october': 9, 'okt': 9, 'oct': 9,
                'november': 10, 'nov': 10,
                'desember': 11, 'december': 11, 'des': 11, 'dec': 11
            };

            if (monthMap.hasOwnProperty(monthName)) {
                return new Date(year, monthMap[monthName], day);
            }
        }
        return new Date(dateStr);
    };

    // 1. Dynamic Grid Populating
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid && window.eventsData) {
        const eventGridData = window.eventsData.sections.find(s => s.type === 'EventGrid');
        const eventsList = eventGridData ? eventGridData.events : [];
        
        const sorted = [...eventsList].sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB.getTime() - dateA.getTime();
        });

        eventsGrid.innerHTML = sorted.map((event) => {
            const longDescEscaped = (event.longDescription || event.description || '').replace(/"/g, '&quot;');
            return `
            <div
              class="event-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 bg-[#fdfdfd] flex flex-col cursor-pointer group"
              data-title="${event.title || ''}"
              data-date="${event.date || ''}"
              data-tag="${event.tag || ''}"
              data-location="${event.location || ''}"
              data-time="${event.time || ''}"
              data-description="${event.description || ''}"
              data-long-description="${longDescEscaped}"
              data-image="${makeRelativePath(event.image)}"
              data-link="${event.link || ''}"
              data-link-text="${event.linkText || ''}"
            >
              <!-- Image Section -->
              ${event.image ? `
                <div class="h-48 w-full overflow-hidden relative">
                  <img
                    src="${makeRelativePath(event.image)}"
                    alt="${event.title}"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ` : ''}

              <div class="p-6 flex flex-col flex-grow">
                <div class="mb-4">
                  <span class="inline-block bg-[#0161bf] text-white text-xs px-2 py-1 rounded-full mb-2">
                    ${event.date}
                  </span>
                  ${event.tag ? `
                    <span class="inline-block bg-gray-500 text-white text-xs px-2 py-1 rounded-full mb-2 ml-2">
                      ${event.tag}
                    </span>
                  ` : ''}
                  <h3 class="heading-3 mb-1 group-hover:text-primary transition-colors text-[#002f6c]">${event.title}</h3>
                  <div class="text-sm text-gray-500 flex flex-col gap-1 mt-2">
                    ${event.time ? `
                      <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${event.time}</span>
                      </div>
                    ` : ''}
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>${event.location}</span>
                    </div>
                  </div>
                </div>

                <p class="body-text text-sm text-gray-600 mb-6 flex-grow line-clamp-3">
                  ${event.description}
                </p>
              </div>

              <!-- Card Footer Actions -->
              <div class="border-t border-gray-100 flex divide-x divide-gray-100 bg-gray-50/50">
                ${event.link ? `
                  <a
                    href="${event.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 py-3 flex items-center justify-center gap-2 text-[#0161bf] font-semibold text-sm hover:bg-white transition-colors"
                    onclick="event.stopPropagation();"
                  >
                    <span>${event.linkText || 'Open Link'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ` : ''}
                <div class="flex-1 py-3 flex items-center justify-center gap-2 text-[#0161bf] font-semibold text-sm hover:bg-white transition-colors">
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            `;
        }).join('');
    }

    // 2. Details Modal Logic
    const eventCards = document.querySelectorAll('.event-card');
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
            const title = card.getAttribute('data-title');
            const date = card.getAttribute('data-date');
            const tag = card.getAttribute('data-tag');
            const location = card.getAttribute('data-location');
            const time = card.getAttribute('data-time');
            const description = card.getAttribute('data-long-description') || card.getAttribute('data-description');
            const image = card.getAttribute('data-image');
            const link = card.getAttribute('data-link');
            const linkText = card.getAttribute('data-link-text') || 'Learn More';

            if (modalTitle) modalTitle.textContent = title;
            if (modalDate) modalDate.textContent = date;
            if (modalLoc) modalLoc.textContent = location;
            if (modalDesc) modalDesc.innerHTML = description ? description.replace(/\n/g, '<br/>') : '';

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
                    modalLink.href = link;
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

        eventCards.forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        closeEventBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });
    }
});
