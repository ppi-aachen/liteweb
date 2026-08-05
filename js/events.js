// Events page specific functionality

// Shared markdown-to-HTML renderer (mirrors build-static.js version)
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

    // 1. Dynamic Grid Populating, Filtering & Sorting
    const eventsGrid = document.getElementById('events-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    if (eventsGrid && window.eventsData) {
        const eventGridData = window.eventsData.sections.find(s => s.type === 'EventGrid');
        const eventsList = eventGridData ? eventGridData.events : [];

        const renderEvents = (list) => {
            if (list.length === 0) {
                eventsGrid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-1">No Events Found</h3>
                  <p class="text-sm text-gray-500">We couldn't find any events matching your search criteria. Try a different query!</p>
                </div>
                `;
                return;
            }

            eventsGrid.innerHTML = list.map((event) => {
                return `
                <div
                  class="event-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 bg-[#fdfdfd] flex flex-col cursor-pointer group"
                  data-event-title="${event.title || ''}"
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

                  <div class="p-6 flex flex-col flex-grow text-left">
                    <div class="mb-4">
                      <span class="inline-block bg-[#0161bf] text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                        ${event.date}
                      </span>
                      ${event.tag ? `
                        <span class="inline-block bg-gray-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold ml-2">
                          ${event.tag}
                        </span>
                      ` : ''}
                      <h3 class="heading-3 mb-1 group-hover:text-primary transition-colors text-[#002f6c] !mt-3 font-bold">${event.title}</h3>
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
                          <span class="truncate">${event.location}</span>
                        </div>
                      </div>
                    </div>

                    <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                      ${event.description || ''}
                    </p>
                  </div>

                  <!-- Card Footer Actions -->
                  <div class="border-t border-gray-100 flex divide-x divide-gray-100 bg-gray-50/50 mt-auto">
                    ${event.link ? `
                      <a
                        href="${window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(event.link) : event.link}"
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
        };

        const updateGrid = () => {
            const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const sortBy = sortSelect ? sortSelect.value : 'newest';

            // Filter events by title match
            let filtered = eventsList.filter(event => 
                (event.title || '').toLowerCase().includes(query)
            );

            // Sort events by date
            filtered.sort((a, b) => {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                if (sortBy === 'newest') {
                    return dateB.getTime() - dateA.getTime();
                } else {
                    return dateA.getTime() - dateB.getTime();
                }
            });

            renderEvents(filtered);
        };

        // Initialize grid rendering (default newest sorted events)
        updateGrid();

        // Bind input listeners
        if (searchInput) {
            searchInput.addEventListener('input', updateGrid);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', updateGrid);
        }
    }

    // 2. Details Modal Logic (with Event Delegation)
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

        // Use event delegation on eventsGrid
        if (eventsGrid) {
            eventsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.event-card');
                if (card) {
                    // Check if an anchor/link or anything inside an anchor was clicked
                    if (e.target.closest('a')) {
                        return; // Let the anchor handle the event
                    }
                    openModal(card);
                }
            });
        }

        closeEventBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });
    }
});
