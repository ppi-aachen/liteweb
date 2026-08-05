// Communities page specific functionality

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
    // 1. Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const communityCards = document.querySelectorAll('.community-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCategory = button.getAttribute('data-category');

            // Toggle active styling on buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-[#0161bf]', 'text-white', 'shadow-md');
                btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
            });
            button.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
            button.classList.add('bg-[#0161bf]', 'text-white', 'shadow-md');

            // Filter cards
            communityCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (selectedCategory === 'All' || cardCategory === selectedCategory) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // 2. Details Modal Logic
    const communityModal = document.getElementById('community-modal');
    const closeCommBtn = document.getElementById('close-comm-btn');
    
    // Modal elements
    const modalImage = document.getElementById('modal-comm-image');
    const modalName = document.getElementById('modal-comm-name');
    const modalCategory = document.getElementById('modal-comm-category');
    const modalDesc = document.getElementById('modal-comm-desc');
    const modalLinksSection = document.getElementById('modal-comm-links-section');
    const modalLinksContainer = document.getElementById('modal-comm-links');

    if (communityModal && closeCommBtn) {
        const openModal = (card) => {
            const name = card.getAttribute('data-name');
            const category = card.getAttribute('data-category');
            const image = card.getAttribute('data-image');
            const longDesc = card.getAttribute('data-long-description') || card.getAttribute('data-description');
            const linksJson = card.getAttribute('data-links');

            // Populate Modal Content
            if (modalImage) modalImage.src = image;
            if (modalImage) modalImage.alt = name;
            if (modalName) modalName.textContent = name;
            
            if (modalCategory) {
                if (category) {
                    modalCategory.textContent = category;
                    modalCategory.classList.remove('hidden');
                } else {
                    modalCategory.classList.add('hidden');
                }
            }

            if (modalDesc) {
                modalDesc.innerHTML = renderMarkdown(longDesc);
            }

            // Populate Links
            if (modalLinksContainer && modalLinksSection) {
                modalLinksContainer.innerHTML = '';
                if (linksJson) {
                    try {
                        const links = JSON.parse(linksJson);
                        if (links && links.length > 0) {
                            modalLinksSection.classList.remove('hidden');
                            links.forEach(link => {
                                const a = document.createElement('a');
                                a.href = window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(link.url) : link.url;
                                a.target = '_blank';
                                a.rel = 'noopener noreferrer';
                                a.className = 'inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-[#0161bf] font-semibold rounded-lg hover:bg-[#0161bf] hover:text-white transition-all border border-gray-200 hover:border-[#0161bf]';
                                a.innerHTML = `
                                    ${link.label}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                `;
                                modalLinksContainer.appendChild(a);
                            });
                        } else {
                            modalLinksSection.classList.add('hidden');
                        }
                    } catch (e) {
                        console.error('Error parsing links JSON', e);
                        modalLinksSection.classList.add('hidden');
                    }
                } else {
                    modalLinksSection.classList.add('hidden');
                }
            }

            communityModal.classList.remove('hidden');
            communityModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
        };

        const closeModal = () => {
            communityModal.classList.remove('flex');
            communityModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        };

        // Attach listeners to community cards
        communityCards.forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        closeCommBtn.addEventListener('click', closeModal);
        communityModal.addEventListener('click', (e) => {
            if (e.target === communityModal) {
                closeModal();
            }
        });
    }
});
