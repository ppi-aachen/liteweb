// Kepengurusan page specific functionality
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
                <p class="body-text text-gray-600 mb-6 italic border-l-4 border-[#0161bf] pl-4">
                  "${dept.description}"
                </p>
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
