// Register styles for Decap CMS preview iframe
CMS.registerPreviewStyle("/css/styles.css");
CMS.registerPreviewStyle("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap");

const h = window.h;

// Simple Markdown Renderer for Preview
function renderMd(text) {
  if (!text) return null;
  const lines = text.split('\n\n');
  return lines.map((paragraph, idx) => {
    let p = paragraph
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#0161bf] underline">$1</a>');
    return h('p', { key: idx, className: 'mb-4', dangerouslySetInnerHTML: { __html: p } });
  });
}

const PagePreview = createClass({
  render: function() {
    const entry = this.props.entry;
    const getAsset = this.props.getAsset;
    const data = entry.getIn(['data']) ? entry.getIn(['data']).toJS() : {};
    const title = data.title || '';
    const sections = data.sections || [];

    return h('div', { className: 'font-sans text-dark bg-white p-6 max-w-5xl mx-auto' },
      h('header', { className: 'border-b pb-4 mb-6' },
        h('h1', { className: 'text-3xl font-bold text-[#002f6c]' }, title)
      ),
      sections.map((section, index) => {
        const type = section.type;

        if (type === 'Hero') {
          return h('div', { key: index, className: 'bg-[#002f6c] text-white p-8 rounded-lg mb-8 text-center shadow-md' },
            h('h2', { className: 'text-3xl font-bold mb-2' }, section.title || ''),
            section.subtitle && h('p', { className: 'text-lg text-blue-100' }, section.subtitle)
          );
        }

        if (type === 'Section') {
          const bgClass = section.backgroundColor === 'blue' ? 'bg-[#0161bf] text-white' : section.backgroundColor === 'gray' ? 'bg-gray-50 text-gray-800' : 'bg-white text-gray-800';
          const imgUrl = section.image ? getAsset(section.image).toString() : null;
          
          return h('div', { key: index, className: `p-6 rounded-lg mb-8 ${bgClass}` },
            section.title && h('h2', { className: 'text-2xl font-bold mb-4' }, section.title),
            h('div', { className: 'flex flex-col md:flex-row gap-6 items-center' },
              imgUrl && h('div', { className: 'w-full md:w-1/3 flex-shrink-0' },
                h('img', { src: imgUrl, alt: section.imageCaption || '', className: 'rounded-lg shadow-md max-w-full' })
              ),
              h('div', { className: 'flex-1' }, renderMd(section.content || section.content_id))
            )
          );
        }

        if (type === 'EventGrid') {
          const events = section.events || [];
          return h('div', { key: index, className: 'mb-8' },
            section.title && h('h2', { className: 'text-2xl font-bold text-[#002f6c] mb-6' }, section.title),
            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
              events.map((ev, i) => {
                const img = ev.image ? getAsset(ev.image).toString() : null;
                return h('div', { key: i, className: 'bg-white border rounded-lg shadow-md p-4 flex flex-col' },
                  img && h('img', { src: img, className: 'h-48 w-full object-cover rounded mb-3' }),
                  h('div', { className: 'flex justify-between items-center mb-2' },
                    h('span', { className: 'bg-[#0161bf] text-white text-xs px-2.5 py-1 rounded-full font-semibold' }, ev.date || ''),
                    ev.tag && h('span', { className: 'bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full' }, ev.tag)
                  ),
                  h('h3', { className: 'font-bold text-lg text-[#002f6c] mb-1' }, ev.title || ''),
                  ev.location && h('p', { className: 'text-xs text-gray-500 mb-1' }, `📍 ${ev.location}`),
                  ev.time && h('p', { className: 'text-xs text-gray-500 mb-2' }, `🕒 ${ev.time}`),
                  h('div', { className: 'text-sm text-gray-600 flex-1 mb-3' }, renderMd(ev.description))
                );
              })
            )
          );
        }

        if (type === 'ExecutiveBoard') {
          return h('div', { key: index, className: 'bg-blue-50 border border-blue-100 p-6 rounded-lg mb-8 shadow-sm' },
            section.title && h('h2', { className: 'text-2xl font-bold text-[#002f6c] mb-4' }, section.title),
            h('p', { className: 'text-lg mb-2' }, h('strong', null, 'Ketua: '), section.chair || '-'),
            h('p', { className: 'text-lg' }, h('strong', null, 'Wakil Ketua: '), section.vice || '-')
          );
        }

        if (type === 'DepartmentList') {
          const depts = section.departments || [];
          return h('div', { key: index, className: 'mb-8' },
            depts.map((dept, i) =>
              h('div', { key: i, className: 'border p-5 rounded-lg mb-4 bg-gray-50 shadow-sm' },
                h('h3', { className: 'text-xl font-bold text-[#002f6c] mb-2' }, dept.name || ''),
                renderMd(dept.description),
                dept.members && dept.members.length > 0 && h('div', { className: 'mt-3 pt-3 border-t border-gray-200' },
                  h('strong', { className: 'text-sm text-gray-700' }, 'Anggota: '),
                  h('span', { className: 'text-sm text-gray-600' }, dept.members.map(m => typeof m === 'object' ? m.name : m).join(', '))
                )
              )
            )
          );
        }

        if (type === 'CommunityGrid') {
          const comms = section.communities || [];
          return h('div', { key: index, className: 'mb-8' },
            section.title && h('h2', { className: 'text-2xl font-bold text-[#002f6c] mb-6' }, section.title),
            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
              comms.map((c, i) => {
                const img = c.image ? getAsset(c.image).toString() : null;
                return h('div', { key: i, className: 'border rounded-lg p-4 bg-white shadow-sm' },
                  img && h('img', { src: img, className: 'h-40 w-full object-cover rounded mb-3' }),
                  h('h3', { className: 'font-bold text-lg text-[#002f6c]' }, c.name || ''),
                  c.category && h('span', { className: 'text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded' }, c.category),
                  h('div', { className: 'mt-2 text-sm text-gray-600' }, renderMd(c.description))
                );
              })
            )
          );
        }

        // Generic fallback for other section types
        return h('div', { key: index, className: 'border p-5 rounded-lg mb-6 bg-gray-50 shadow-sm' },
          h('h3', { className: 'font-bold text-lg text-[#002f6c] mb-2' }, `${type || 'Section'}: ${section.title || ''}`),
          section.subtitle && h('p', { className: 'text-sm text-gray-600 mb-2' }, section.subtitle),
          section.content && renderMd(section.content)
        );
      })
    );
  }
});

CMS.registerPreviewTemplate("active-pages", PagePreview);
CMS.registerPreviewTemplate("passive-pages", PagePreview);
