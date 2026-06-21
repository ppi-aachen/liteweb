// Kepengurusan page specific functionality

// Shared markdown-to-HTML renderer (mirrors build-static.js version)
const renderMarkdown = (content) => {
    if (!content) return '';
    const trimmed = content.trim();
    if (trimmed.startsWith('<')) return trimmed;
    let html = trimmed;
    html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
        `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="font-bold text-lg mt-4 mb-1">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="font-bold text-xl mt-6 mb-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="font-bold text-2xl mt-8 mb-2">$1</h1>');
    html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-200" />');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
        `<a href="${window.ensureAbsoluteUrl ? window.ensureAbsoluteUrl(url) : url}" class="text-[#0161bf] hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`);
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="rounded max-w-full h-auto my-2" />');
    html = html.replace(/((?:^[ \t]*[-*+] .+\n?)+)/gm, (block) => {
        const items = block.trim().split('\n').map(l =>
            `<li>${l.replace(/^[ \t]*[-*+] /, '')}</li>`);
        return `<ul class="list-disc list-inside space-y-1 my-2">${items.join('')}</ul>`;
    });
    html = html.replace(/((?:^[ \t]*\d+\. .+\n?)+)/gm, (block) => {
        const items = block.trim().split('\n').map(l =>
            `<li>${l.replace(/^[ \t]*\d+\. /, '')}</li>`);
        return `<ol class="list-decimal list-inside space-y-1 my-2">${items.join('')}</ol>`;
    });
    html = html.split(/\n{2,}/).map(block => {
        block = block.trim();
        if (!block) return '';
        if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div|p|hr|img|table)/.test(block)) return block;
        return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');
    return html;
};

document.addEventListener('DOMContentLoaded', () => {
    if (!window.kepengurusanData) return;

    // 1. Render Executive Board
    const execSection = document.getElementById('executive-board-section');
    if (execSection) {
        const execData = window.kepengurusanData.sections.find(s => s.type === 'ExecutiveBoard');
        if (execData) {
            execSection.innerHTML = `
                <h2 class="heading-2 mb-8">${execData.title || 'Executive Board'}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div class="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    <h3 class="heading-3 mb-2 text-[#002f6c]">Ketua</h3>
                    <p class="text-xl font-medium">${execData.chair}</p>
                  </div>
                  <div class="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    <h3 class="heading-3 mb-2 text-[#002f6c]">Wakil Ketua</h3>
                    <p class="text-xl font-medium">${execData.vice || '-'}</p>
                  </div>
                </div>
            `;
        }
    }

    // 2. Render Departments
    const deptsGrid = document.getElementById('departments-grid');
    if (deptsGrid) {
        const deptsData = window.kepengurusanData.sections.find(s => s.type === 'DepartmentList');
        const departments = deptsData ? deptsData.departments : [];

        deptsGrid.innerHTML = departments.map(dept => `
            <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div class="bg-gray-50 p-6 border-b border-gray-100">
                <h3 class="text-2xl font-bold text-gray-900">${dept.name}</h3>
              </div>
              <div class="p-6">
                <div class="body-text text-gray-600 mb-6 italic border-l-4 border-[#0161bf] pl-4">
                  ${renderMarkdown(dept.description)}
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3 uppercase text-sm tracking-wider">Members</h4>
                  <ul class="space-y-2">
                    ${(dept.members || []).map(member => `
                      <li class="flex items-center gap-2 text-gray-700">
                        <span class="w-2 h-2 bg-[#0161bf] rounded-full"></span>
                        <span>${member}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              </div>
            </div>
        `).join('');
    }
});
