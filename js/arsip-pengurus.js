// Arsip Pengurus page dynamic rendering and interactive functionality
document.addEventListener('DOMContentLoaded', () => {
    const data = window.cabinetData;
    if (!data) {
        console.error('window.cabinetData not found');
        return;
    }

    const cabinetArchive = data.sections.find(s => s.type === 'CabinetArchive');
    if (!cabinetArchive) {
        console.error('CabinetArchive section not found in data');
        return;
    }

    const pastChairs = cabinetArchive.pastChairs || [];
    const cabinets = cabinetArchive.cabinets || [];

    // Helper to strip leading slash from paths to make them relative (useful for direct file opening)
    const makeRelativePath = (url) => {
        if (!url) return '';
        if (typeof url === 'string' && url.startsWith('/')) {
            return url.substring(1);
        }
        return url;
    };

    // 1. Render Past Chairs
    const pastChairsContainer = document.getElementById('past-chairs-list');
    if (pastChairsContainer) {
        pastChairsContainer.innerHTML = pastChairs.map(item => `
            <div class="break-inside-avoid flex justify-between items-center h-14 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                <span class="font-medium text-gray-900 border-r border-gray-200 pr-4 flex-1 truncate group-hover:border-[#002f6c]/30 transition-colors" title="${item.name}">${item.name}</span>
                <span class="text-sm text-gray-500 font-mono pl-4 text-right min-w-[100px]">${item.period}</span>
            </div>
        `).join('');
    }

    // 2. Render Cabinets
    const cabinetsContainer = document.getElementById('cabinets-list');
    if (cabinetsContainer) {
        cabinetsContainer.innerHTML = cabinets.map((cab, idx) => {
            const hasDeps = cab.departments && cab.departments.length > 0;
            const isCaretaker = cab.vice === "Caretaker (Ketua, Sekretaris, Bendahara)";
            return `
                <div
                    id="cabinet-card-${idx}"
                    class="cabinet-card bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                    <!-- Header (Clickable) -->
                    <div class="cabinet-header bg-[#002F6C] text-white p-6 flex flex-col sm:flex-row justify-between items-center relative group">
                        <div class="z-10 text-center sm:text-left">
                            <h3 class="text-2xl font-bold mb-2 sm:mb-0 group-hover:underline decoration-white/50 underline-offset-4 transition-all">
                                ${cab.period}
                            </h3>
                        </div>
                        <div class="z-10 text-center sm:text-right flex flex-col items-center sm:items-end">
                            <p class="text-lg font-semibold">${cab.chair}</p>
                            ${cab.vice && cab.vice !== "-" ? `<p class="text-sm opacity-90">Vice: <span>${cab.vice}</span></p>` : ''}
                        </div>

                        <!-- Expand/Collapse Indicator -->
                        <div class="sm:hidden mt-3 text-white/70 text-xs">
                            Tap to expand/collapse
                        </div>
                    </div>

                    <!-- Body (Collapsible) -->
                    ${(hasDeps || cab.image) ? `
                        <div
                            id="cabinet-body-${idx}"
                            class="cabinet-body bg-gray-50 transition-all duration-500 ease-in-out overflow-hidden max-h-0 opacity-0 p-0"
                        >
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    ${(cab.departments || []).map(dept => `
                                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <h4 class="font-bold text-[#002F6C] mb-2 text-sm uppercase tracking-wide border-b pb-1 border-gray-100">${dept.name}</h4>
                                            <ul class="text-sm text-gray-700 space-y-1">
                                                ${(dept.members || []).map(member => `
                                                    <li>${member}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}

                                    <!-- Cabinet Image if available -->
                                    ${cab.image ? `
                                        <div class="md:col-span-2 lg:col-span-3 mt-4">
                                            <img
                                                src="${makeRelativePath(cab.image)}"
                                                alt="Kabinet ${cab.period}"
                                                class="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                            />
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Caretaker Note (Collapsible) -->
                    ${(!hasDeps && isCaretaker) ? `
                        <div
                            id="cabinet-note-${idx}"
                            class="cabinet-note bg-gray-50 text-center text-gray-500 italic transition-all duration-300 max-h-0 p-0 overflow-hidden"
                        >
                            Bertindak sebagai pelaksana tugas untuk memastikan keberlanjutannya PPI Aachen.
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Bind interactive toggles
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
