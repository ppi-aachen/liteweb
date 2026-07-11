import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to ensure links without protocol are treated as absolute/external if they look like domain names
const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;
    
    const trimmed = url.trim();
    // Exclude protocols, relative paths, hashes
    if (/^(https?|ftp|mailto|tel):/i.test(trimmed) || 
        trimmed.startsWith('/') || 
        trimmed.startsWith('#') || 
        trimmed.startsWith('./') || 
        trimmed.startsWith('../')) {
        return trimmed;
    }
    
    // Split by first slash to get the potential host name
    const slashIndex = trimmed.indexOf('/');
    const host = slashIndex === -1 ? trimmed : trimmed.substring(0, slashIndex);
    
    // Check if the host looks like a domain name
    if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host)) {
        // Ensure the TLD is not 'html' (which indicates a local page link)
        const parts = host.split('.');
        const tld = parts[parts.length - 1].toLowerCase();
        if (tld !== 'html') {
            return `https://${trimmed}`;
        }
    }
    
    return trimmed;
};

// Helper to calculate relative prefix for nested directories
const getRootPrefix = (filePath) => {
    const depth = filePath.split('/').length - 1;
    return depth > 0 ? '../'.repeat(depth) : '';
};

// Map of old flat paths to new nested/flat paths
const linkMap = {
    'index.html': 'index.html',
    'lapor-diri.html': 'lapor-diri.html',
    'events.html': 'events.html',
    'communities.html': 'communities.html',
    'merchandise.html': 'merchandise.html',
    'sejarah.html': 'organization/sejarah.html',
    'kepengurusan.html': 'organization/kepengurusan.html',
    'ad-art.html': 'organization/ad-art.html',
    'spa.html': 'organization/spa.html',
    'arsip-lpj.html': 'organization/arsip-lpj.html',
    'arsip-pengurus.html': 'organization/arsip-pengurus.html',
    'kontak-email.html': 'organization/kontak-email.html',
    'linktree.html': 'others/linktree.html',
    'acop-2025.html': 'others/acop-2025.html',
    'wiki-aachen.html': 'others/wiki-aachen.html',
    'press-kit.html': 'others/press-kit.html',
    'impressum.html': 'impressum.html'
};

// Map of paths to their unique meta descriptions
const metaDescriptions = {
    'index.html': 'Selamat datang di situs resmi PPI Aachen. Temukan informasi terbaru seputar kehidupan, kegiatan, dan komunitas pelajar Indonesia di Aachen, Jerman.',
    'lapor-diri.html': 'Panduan resmi dan sistem lapor diri untuk mahasiswa serta warga Indonesia yang tinggal di wilayah Aachen, Düren, dan Heinsberg.',
    'events.html': 'Ikuti berbagai kegiatan seru, diskusi ilmiah, acara olahraga, dan festival budaya menarik yang diselenggarakan oleh PPI Aachen.',
    'communities.html': 'Jelajahi berbagai komunitas minat bakat, olahraga (bulutangkis, basket, futsal), dan keagamaan pelajar Indonesia di Aachen.',
    'merchandise.html': 'Dapatkan merchandise resmi PPI Aachen, mulai dari jaket, kaos, hingga aksesoris menarik khas komunitas kami.',
    'organization/sejarah.html': 'Pelajari sejarah berdirinya PPI Aachen sejak tahun 1956, yang diawali oleh tokoh nasional seperti Peter Manusama hingga B.J. Habibie.',
    'organization/kepengurusan.html': 'Kenali jajaran badan pengurus harian dan divisi yang menjalankan roda organisasi PPI Aachen untuk periode aktif saat ini.',
    'organization/ad-art.html': 'Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) resmi Perhimpunan Pelajar Indonesia di Aachen sebagai landasan hukum organisasi.',
    'organization/spa.html': 'Informasi tentang Sidang Perwakilan Anggota (SPA) PPI Aachen, forum pengambilan keputusan tertinggi bagi seluruh anggota.',
    'organization/arsip-lpj.html': 'Arsip Laporan Pertanggungjawaban (LPJ) tahunan dari setiap kepengurusan PPI Aachen sebagai bentuk transparansi organisasi.',
    'organization/arsip-pengurus.html': 'Daftar nama dan dokumentasi sejarah badan pengurus PPI Aachen dari periode-periode kepengurusan sebelumnya.',
    'organization/kontak-email.html': 'Hubungi PPI Aachen melalui email resmi atau media sosial untuk kolaborasi, pertanyaan seputar studi, atau kemitraan.',
    'others/linktree.html': 'Kumpulan tautan penting PPI Aachen, termasuk pendaftaran kegiatan, sosial media, grup komunikasi, dan lainnya.',
    'others/acop-2025.html': 'Halaman resmi turnamen olahraga Aachen Open (ACOP) 2025. Tunjukkan bakatmu dan jalin sportivitas antar mahasiswa.',
    'others/wiki-aachen.html': 'Panduan lengkap "Wiki Aachen für Dummies" untuk mahasiswa baru Indonesia. Berisi info akomodasi, studi, transportasi, dan birokrasi di Aachen.',
    'others/press-kit.html': 'Press kit resmi PPI Aachen berisi logo, panduan identitas visual, dan materi promosi untuk media dan mitra kerja sama.',
    'impressum.html': 'Informasi hukum (Impressum) dan kebijakan privasi (Datenschutzerklärung) situs web resmi Perhimpunan Pelajar Indonesia di Aachen.'
};

// Resolve all internal links in the rendered navigation and footer HTML
const resolvePathsInHtml = (htmlContent, prefix) => {
    let resolved = htmlContent;
    for (const [oldLink, newPath] of Object.entries(linkMap)) {
        const regex = new RegExp(`href=["']${oldLink}["']`, 'g');
        resolved = resolved.replace(regex, `href="${prefix}${newPath}"`);
        const dpRegex = new RegExp(`data-path=["']${oldLink}["']`, 'g');
        resolved = resolved.replace(dpRegex, `data-path="${prefix}${newPath}"`);
    }
    resolved = resolved.replace(/src=["']logo\.png["']/g, `src="${prefix}logo.png"`);
    return resolved;
};

// Helper to resolve workspace paths
const contentDir = path.join(__dirname, 'content', 'pages');
const outputDir = __dirname; // Root directory

// Helper to parse date strings for event sorting
const parseDateLocal = (dateStr) => {
    if (!dateStr) return new Date(0);
    const cleanDateStr = dateStr.replace(/deadline:\s*/i, '');
    const monthRangeMatch = cleanDateStr.match(/^([A-Za-z]+)\s*-\s*([A-Za-z]+)\s+(\d{4})$/);
    if (monthRangeMatch) {
        const monthName = monthRangeMatch[1];
        const year = monthRangeMatch[3];
        return parseDateLocal(`1 ${monthName} ${year}`);
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

// Global Event Card Renderer helper
const renderEventCard = (event, responsiveClass = '') => {
    const makeRelativePath = (url) => {
        if (!url) return '';
        if (typeof url === 'string' && url.startsWith('/')) {
            return url.substring(1);
        }
        return url;
    };
    
    return `
    <div
      class="${responsiveClass} event-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 bg-[#fdfdfd] flex flex-col cursor-pointer group"
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
          <h3 class="heading-3 mb-1 group-hover:text-primary transition-colors text-[#002f6c] !mt-3 font-bold">
            ${event.title}
          </h3>
          
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
            href="${ensureAbsoluteUrl(event.link)}"
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
};

// Helper to strip leading slash from paths to make them relative (useful for direct file opening)
const makeRelativePath = (url, prefix = '') => {
    if (!url) return '';
    if (typeof url === 'string' && url.startsWith('/')) {
        return prefix + url.substring(1);
    }
    return prefix + url;
};

// Read JSON data helpers
const getJsonData = (filename) => {
    const filePath = path.join(contentDir, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Write JS data helper
const saveJsData = (filename, varName, data) => {
    const filePath = path.join(contentDir, filename);
    const content = `window.${varName} = ${JSON.stringify(data, null, 4)};\n`;
    fs.writeFileSync(filePath, content, 'utf-8');
};

// Global Layout template compiler
const renderLayout = (bodyContent, title, currentPath, pageScript = null, dataScript = null) => {
    const baseUrl = 'https://ppiaachen.de';
    const isLinktree = currentPath === 'others/linktree.html';
    const prefix = getRootPrefix(currentPath);
    const defaultDesc = 'Perhimpunan Pelajar Indonesia di Aachen - Indonesian Students Association in Aachen';
    const metaDesc = metaDescriptions[currentPath] || defaultDesc;

    // Render Side Navigation
    let sideNavigationHtml = fs.readFileSync(path.join(__dirname, 'src', 'partials', 'nav.html'), 'utf-8');

    // Render Footer
    let footerHtml = `
      <footer class="bg-dark text-white py-8">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-12 md:px-[48px]">
            <div class="flex flex-col md:flex-row justify-between gap-8 mb-8">
              <div>
                <h3 class="heading-3 text-white mb-4" data-lang-id="Kontak" data-lang-en="Contact" data-lang-de="Kontakt">Kontak</h3>
                <div class="body-text space-y-2 text-white/90">
                  <p>
                    <a href="mailto:info@ppiaachen.de" class="hover:text-primary-light transition-colors">
                      info@ppiaachen.de
                    </a>
                  </p>
                  <p>
                    <a href="tel:+4915679027862" class="hover:text-primary-light transition-colors">
                      +49 15679 027862 (TEL/WhatsApp)
                    </a>
                  </p>
                  <p>
                    An der Schanz 1, 52064 Aachen, Germany
                  </p>
                </div>
              </div>

              <div>
                <h3 class="heading-3 text-white mb-4" data-lang-id="Ikuti Kami" data-lang-en="Follow Us" data-lang-de="Folge Uns">Ikuti Kami</h3>
                <div class="flex flex-wrap gap-4">
                  <a href="https://www.instagram.com/ppiaachen" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="Instagram">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/ppiaachen" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="Facebook">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/ppiaachen" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="LinkedIn">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@ppiaachen" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="YouTube">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@ppiaachen" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="TikTok">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                  <a href="https://wa.me/message/U7EYCVZDKP7WG1" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white" aria-label="WhatsApp">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 class="heading-3 text-white mb-4">PPI Aachen</h3>
                <p class="body-text text-white/90">
                  <span class="lang-block" lang="id">Mendukung dan membantu pelajar Indonesia di Aachen sejak 1956.</span>
                  <span class="lang-block" lang="en" style="display:none">Supporting and helping Indonesian students in Aachen since 1956.</span>
                  <span class="lang-block" lang="de" style="display:none">Unterstützung und Hilfe für indonesische Studierende in Aachen seit 1956.</span>
                </p>
              </div>
            </div>

            <div class="border-t border-white/20 pt-6">
              <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="body-text text-white/70 text-center md:text-left">
                  © ${new Date().getFullYear()} Perhimpunan Pelajar Indonesia di Aachen
                </p>
                <div class="flex gap-4">
                  <a href="impressum.html" class="body-text text-white/70 hover:text-primary-light transition-colors" data-lang-id="Impressum & Datenschutzerklärung" data-lang-en="Impressum & Privacy Policy" data-lang-de="Impressum & Datenschutzerklärung">Impressum & Datenschutzerklärung</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    const layoutHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="${prefix}favicon.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${metaDesc}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}/${currentPath}" />
  <meta property="og:title" content="PPI Aachen - ${title}" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:image" content="${baseUrl}/og-image.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${baseUrl}/${currentPath}" />
  <meta property="twitter:title" content="PPI Aachen - ${title}" />
  <meta property="twitter:description" content="${metaDesc}" />
  <meta property="twitter:image" content="${baseUrl}/og-image.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}css/styles.css" />
  <title>PPI Aachen - ${title}</title>
</head>
<body class="font-sans text-dark bg-white">
  <div class="flex flex-col min-h-screen">
    ${sideNavigationHtml}
    
    <main class="flex-1 w-full min-w-0 ${isLinktree ? '' : 'desktop:mt-[48px]'}">
      ${bodyContent}
    </main>
    
    ${footerHtml}
  </div>

  <script src="${prefix}js/i18n.js"></script>
  <script src="${prefix}js/main.js"></script>
  ${dataScript ? `<script src="${prefix}${dataScript}"></script>` : ''}
  ${pageScript ? `<script src="${prefix}js/${pageScript}"></script>` : ''}
</body>
</html>`;

    return resolvePathsInHtml(layoutHtml, prefix);
};

const renderHeroHeader = (title, subtitle, prefix = '') => {
    return `
    <div class="hero-header relative overflow-hidden text-white flex flex-col justify-center items-center text-center">
      <!-- Parallax Background Layer -->
      <div class="hero-header-bg absolute inset-0 w-full" style="background-image: url('${prefix}hero-bright.png'); height: 120%; top: -10%; z-index: 0;"></div>
    </div>
    `;
};

// Render HTML with break formatting helper (legacy)
const renderContentWithBreaks = (content) => {
    if (!content) return '';
    return content.replace(/\n\n/g, '<br/><br/>');
};

// Markdown-to-HTML renderer
// Handles markdown output from Decap's markdown widget, and also passes through
// existing raw HTML content unchanged (backward compatible).
const renderMarkdown = (content) => {
    if (!content) return '';

    // If the content looks like it's already raw HTML (starts with an HTML tag),
    // pass it through directly to preserve existing page content.
    const trimmed = content.trim();
    if (trimmed.startsWith('<')) {
        return trimmed;
    }

    let html = trimmed;

    // Fenced code blocks (```)
    html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
        `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings (### h3, ## h2, # h1)
    html = html.replace(/^### (.+)$/gm, '<h3 class="heading-3 mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="heading-2 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="heading-1 mt-10 mb-4">$1</h1>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-200" />');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
        `<a href="${ensureAbsoluteUrl(url)}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`);

    // Images ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="rounded-lg shadow-md max-w-full h-auto my-4" />');

    // Unordered lists
    html = html.replace(/((?:^[ \t]*[-*+] .+\n?)+)/gm, (block) => {
        const items = block.trim().split('\n').map(line =>
            `<li>${line.replace(/^[ \t]*[-*+] /, '')}</li>`);
        return `<ul class="list-disc list-inside space-y-1 my-3">${items.join('')}</ul>`;
    });

    // Ordered lists
    html = html.replace(/((?:^[ \t]*\d+\. .+\n?)+)/gm, (block) => {
        const items = block.trim().split('\n').map(line =>
            `<li>${line.replace(/^[ \t]*\d+\. /, '')}</li>`);
        return `<ol class="list-decimal list-inside space-y-1 my-3">${items.join('')}</ol>`;
    });

    // Paragraphs: wrap consecutive non-empty, non-tag lines in <p> tags
    // Split by double newline (paragraph breaks)
    html = html.split(/\n{2,}/).map(block => {
        block = block.trim();
        if (!block) return '';
        // Don't wrap if already a block-level HTML element or heading
        if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div|p|hr|img|table)/.test(block)) {
            return block;
        }
        // Convert single newlines within a paragraph to <br>
        return `<p class="mb-4 last:mb-0">${block.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');

    return html;
};

// Render content with multi-language support
// If the section has content_en or content_de, renders lang-block spans.
// Otherwise falls back to plain renderMarkdown(section.content).
const renderLangContent = (section) => {
    const hasEN = !!(section.content_en);
    const hasDE = !!(section.content_de);
    if (hasEN || hasDE) {
        return [
            `<span class="lang-block" lang="id">${renderMarkdown(section.content || '')}</span>`,
            `<span class="lang-block" lang="en" style="display:none">${renderMarkdown(section.content_en || section.content || '')}</span>`,
            `<span class="lang-block" lang="de" style="display:none">${renderMarkdown(section.content_de || section.content_en || section.content || '')}</span>`,
        ].join('\n');
    }
    return renderMarkdown(section.content || '');
};

// Build data-lang-* attribute string for a section title
const sectionTitleAttrs = (section) => {
    if (section.title_en || section.title_de) {
        const id = section.title_id || section.title || '';
        const en = section.title_en || section.title || '';
        const de = section.title_de || section.title_en || section.title || '';
        return `data-lang-id="${id}" data-lang-en="${en}" data-lang-de="${de}"`;
    }
    return '';
};

// --- Page Compilers ---

// 1. Home Page Compiler
const compileHome = () => {
    const data = getJsonData('home.json');
    if (!data) return;

    // Scan carousel assets directory
    // Supports .webp, .png, and .jpg/.jpeg images.
    // When multiple files share the same base name (e.g. 1.webp, 1.png, 1.jpg),
    // only the highest-priority format is kept: webp > png > jpg/jpeg.
    const carouselDir = path.join(__dirname, 'assets', 'carousel');
    let slides = [];
    if (fs.existsSync(carouselDir)) {
        const supportedExts = ['.webp', '.png', '.jpg', '.jpeg'];
        const extPriority = { '.webp': 0, '.png': 1, '.jpg': 2, '.jpeg': 2 };
        const allFiles = fs.readdirSync(carouselDir)
            .filter(f => supportedExts.includes(path.extname(f).toLowerCase()));

        // Deduplicate: keep only the highest-priority format per base name
        const bestByBase = new Map();
        for (const file of allFiles) {
            const ext = path.extname(file).toLowerCase();
            const base = path.basename(file, path.extname(file));
            const priority = extPriority[ext];
            if (!bestByBase.has(base) || priority < bestByBase.get(base).priority) {
                bestByBase.set(base, { file, priority });
            }
        }

        slides = Array.from(bestByBase.values())
            .map(v => v.file)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'PPI Aachen', subtitle: 'Indonesian Students Association in Aachen' };
    const aboutSection = data.sections.find(s => s.title === 'About Us');
    const historySection = data.sections.find(s => s.title === 'Short History');
    const logoSection = data.sections.find(s => s.title === 'Our Logo');
    const petaSection = data.sections.find(s => s.title === 'Peta Wilayah Kerja');

    // Fetch and sort events for Latest/Upcoming Events section
    const eventsData = getJsonData('events.json');
    let latestEventsHtml = '';
    if (eventsData) {
        const eventGrid = eventsData.sections.find(s => s.type === 'EventGrid');
        if (eventGrid && eventGrid.events) {
            // Always show the 3 most recent events sorted by date descending
            const displayEvents = [...eventGrid.events].sort((a, b) => {
                return parseDateLocal(b.date).getTime() - parseDateLocal(a.date).getTime();
            }).slice(0, 3);

            latestEventsHtml = `
            <!-- Section 2.5: Latest Events -->
            <div class="bg-[#0161bf] text-white border-t border-b border-white/10">
              <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="px-4 md:px-[48px] py-16">
                  <section class="max-w-none">
                    <h2 class="heading-2-home text-white text-center mb-10" data-lang-id="Kegiatan Terbaru" data-lang-en="Latest Events" data-lang-de="Neueste Veranstaltungen">Kegiatan Terbaru</h2>
                    
                    <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10">
                      ${displayEvents.map((event, index) => {
                        let responsiveClass = '';
                        if (index === 1) {
                            responsiveClass = 'hidden md:flex';
                        } else if (index === 2) {
                            responsiveClass = 'hidden lg:flex';
                        } else {
                            responsiveClass = 'flex';
                        }
                        return renderEventCard(event, responsiveClass);
                      }).join('')}
                    </div>

                    <div class="flex justify-center">
                      <a
                        href="events.html"
                        class="bg-white hover:bg-gray-100 text-[#002f6c] font-bold py-3 px-8 rounded-lg shadow-md transition-all transform hover:scale-102 flex items-center gap-2"
                      >
                        <span data-lang-id="Lihat Semua Kegiatan" data-lang-en="View All Events" data-lang-de="Alle Veranstaltungen">Lihat Semua Kegiatan</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <!-- Event Details Modal -->
            <div
              id="event-modal"
              class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity hidden text-dark"
            >
              <div
                class="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative flex flex-col md:flex-row"
              >
                <!-- Close Button -->
                <button
                  id="close-event-btn"
                  class="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-800 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <!-- Modal Image - Left Side -->
                <div id="modal-event-image-container" class="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
                  <img
                    id="modal-event-image"
                    src=""
                    alt=""
                    class="w-full h-full object-cover"
                  />
                </div>

                <!-- Modal Content - Right Side -->
                <div class="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh] bg-white">
                  <div class="mb-6">
                    <div class="flex flex-wrap items-center gap-3 mb-3 pr-8">
                      <span id="modal-event-date" class="bg-[#0161bf] text-white px-3 py-1 rounded-full text-sm font-medium"></span>
                      <span id="modal-event-tag" class="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium"></span>
                    </div>

                    <h2 id="modal-event-title" class="heading-2 mb-4 pr-8 text-2xl font-bold text-gray-900"></h2>

                    <div class="flex flex-col gap-2 text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
                      <div id="modal-event-time-container" class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span id="modal-event-time" class="font-medium"></span>
                      </div>
                      <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span id="modal-event-location" class="font-medium"></span>
                      </div>
                    </div>

                    <div class="prose max-w-none text-gray-700 leading-relaxed body-text text-lg">
                      <p id="modal-event-desc" class="whitespace-pre-line"></p>
                    </div>
                  </div>

                  <div id="modal-event-link-section" class="pt-6 border-t border-gray-100 flex justify-end mt-auto">
                    <a
                      id="modal-event-link"
                      href=""
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn-primary inline-flex items-center gap-2"
                    >
                    </a>
                  </div>
                </div>
              </div>
            </div>
            `;
        }
    }

    const body = `
      <div>
        <!-- Hero Section -->
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}

        <!-- Section 1: Carousel + Linktree -->
        <div class="bg-[#0161bf]">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="px-0 md:px-[48px] py-6 md:py-12">
              
              <!-- Carousel -->
              <div class="overflow-hidden relative group w-full aspect-[16/9] rounded-lg shadow-md">
                <div id="carousel-track" class="flex transition-transform ease-out duration-500 h-full">
                  ${slides.map((slide, i) => `
                    <img src="assets/carousel/${slide}" alt="Slide ${i + 1}" class="w-full h-full object-cover flex-shrink-0" />
                  `).join('')}
                </div>
                <div class="absolute inset-0 flex items-center justify-between p-2 md:p-4">
                  <button id="carousel-prev" class="text-white hover:text-white/80 transition-colors md:p-2 md:rounded-full md:shadow md:bg-white/30 md:hover:bg-white/50 md:backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button id="carousel-next" class="text-white hover:text-white/80 transition-colors md:p-2 md:rounded-full md:shadow md:bg-white/30 md:hover:bg-white/50 md:backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
                <div class="absolute bottom-4 right-0 left-0">
                  <div class="flex items-center justify-center gap-2">
                    ${slides.map(() => `
                      <div class="carousel-dot transition-all bg-white rounded-full w-3 h-3 bg-opacity-50"></div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Linktree Button -->
              <div class="flex justify-center mt-12 mb-4">
                <a
                  href="https://linktr.ee/aachenppi"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bg-white hover:bg-gray-100 text-[#002F6C] font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <span data-lang-id="Kunjungi Linktree Kami" data-lang-en="Visit our Linktree" data-lang-de="Unser Linktree">Kunjungi Linktree Kami</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>

            </div>
          </div>
        </div>

        <!-- Section 2: About Us -->
        ${aboutSection ? `
          <div class="bg-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="px-4 md:px-[48px] pt-6 pb-12">
                <section class="max-w-none">
                  <h2 class="heading-2-home text-center" ${sectionTitleAttrs(aboutSection)}>${aboutSection.title_id || aboutSection.title}</h2>
                  <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed text-justify">
                    ${renderLangContent(aboutSection)}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Section 3: Short History -->
        ${historySection ? `
          <div class="bg-[#0161bf] text-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="px-4 md:px-[48px] pt-6 pb-12">
                <section class="max-w-none">
                  <div class="flex flex-col-reverse md:flex-row gap-8 items-center">
                    <div class="body-text space-y-6 text-lg leading-relaxed text-white flex-1 text-justify">
                      <h2 class="heading-2-home text-white text-center" ${sectionTitleAttrs(historySection)}>${historySection.title_id || historySection.title}</h2>
                      <div>
                        ${renderLangContent(historySection)}
                      </div>
                    </div>
                    <div class="w-full md:w-1/3 flex-shrink-0">
                      <img
                        src="${makeRelativePath(historySection.image)}"
                        alt="${historySection.title}"
                        class="rounded-lg shadow-lg w-full h-auto object-cover border-4 border-white/20"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Section 4: Our Logo -->
        ${logoSection ? `
          <div class="bg-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="px-4 md:px-[48px] pt-6 pb-12">
                <section class="max-w-none">
                  <div class="flex flex-col md:flex-row gap-8 items-center">
                    <div class="w-full md:w-1/3 flex-shrink-0">
                      <img
                        src="${makeRelativePath(logoSection.image)}"
                        alt="${logoSection.title}"
                        class="rounded-lg shadow-lg w-full h-auto object-cover"
                      />
                    </div>
                    <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed flex-1 text-justify">
                      <h2 class="heading-2-home text-center" ${sectionTitleAttrs(logoSection)}>${logoSection.title_id || logoSection.title}</h2>
                      <div>
                        ${renderLangContent(logoSection)}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ` : ''}

        ${latestEventsHtml}

        <!-- Section 5: Aachen für Dummies -->
        <div class="bg-white">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="px-4 md:px-[48px] pt-6 pb-12">
              <section class="max-w-none">
                <h2 class="heading-2-home text-center" data-lang-id="Aachen für Dummies" data-lang-en="Aachen für Dummies" data-lang-de="Aachen für Dummies">Aachen für Dummies</h2>

                <div class="my-8 flex justify-center">
                  <div
                    id="pdf-trigger"
                    class="relative w-full max-w-md rounded-lg shadow-lg border-0 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src="images/home/aachen_dummies.png"
                      alt="Aachen für Dummies Cover"
                      class="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div class="bg-white/90 text-[#0161bf] px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold shadow-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span data-lang-id="Klik untuk Baca" data-lang-en="Click to Read" data-lang-de="Zum Lesen klicken">Klik untuk Baca</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="body-text space-y-6 text-lg leading-relaxed text-gray-700 text-center">
                  <p>
                    <span class="lang-block" lang="id">Buku panduan yang dibuat khusus untuk pelajar Indonesia yang baru saja tiba di Aachen</span>
                    <span class="lang-block" lang="en" style="display:none">A guide book specially made for Indonesian students that have just arrived in Aachen</span>
                    <span class="lang-block" lang="de" style="display:none">Ein Leitfaden speziell für indonesische Studierende, die gerade in Aachen angekommen sind</span>
                  </p>
                  <div class="mt-4 flex justify-center">
                    <a
                      href="wiki-aachen.html"
                      class="bg-[#0161bf] hover:bg-[#004a9e] text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all transform hover:scale-102 flex items-center gap-2"
                    >
                      <span data-lang-id="Buka Wiki Online" data-lang-en="Open Online Wiki" data-lang-de="Online-Wiki öffnen">Buka Wiki Online</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <!-- Section 6: Peta Wilayah Kerja -->
        ${petaSection ? `
          <div class="bg-[#0161bf] text-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="px-4 md:px-[48px] pt-6 pb-12">
                <section class="max-w-none">
                  <h2 class="heading-2-home text-white text-center" ${sectionTitleAttrs(petaSection)}>${petaSection.title_id || petaSection.title}</h2>
                  <div class="body-text space-y-6 text-lg leading-relaxed">
                    <div class="mt-8 flex justify-center">
                      <img
                        src="${makeRelativePath(petaSection.image)}"
                        alt="${petaSection.title}"
                        class="rounded-lg shadow-md w-full max-w-lg h-auto border-4 border-white/20"
                      />
                    </div>
                    <div class="body-text space-y-6 text-lg leading-relaxed text-white text-center">
                      ${renderLangContent(petaSection)}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- PDF Modal (Aachen für Dummies) -->
        <div
          id="pdf-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity hidden"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] relative flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-lg">Aachen für Dummies</h3>
              <div class="flex items-center gap-2">
                <a
                  href="https://drive.google.com/file/d/1JtwUe0FkGHvXqIJbFa0i6iVw79eA-Cu4/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 text-gray-500 hover:text-[#0161bf] hover:bg-blue-50 rounded-full transition-colors"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  id="close-pdf-btn"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-y-auto -webkit-overflow-scrolling-touch flex flex-col">
              <iframe
                src="https://drive.google.com/file/d/1JtwUe0FkGHvXqIJbFa0i6iVw79eA-Cu4/preview"
                class="w-full h-full rounded-lg bg-white border-0"
                style="color-scheme: light;"
                allow="autoplay"
                title="Aachen für Dummies Fullscreen"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Home', 'index.html', 'home.js', 'content/pages/events.js');
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    console.log('index.html compiled.');
};

// 2. Simple Iframe Page Compiler (Lapor Diri, Wiki Aachen, Merchandise, ACOP 2025)
const compileIframePage = (jsonFilename, outputFilename, pageTitle) => {
    const data = getJsonData(jsonFilename);
    if (!data) return;

    const iframeSection = data.sections.find(s => s.type === 'IframeSection');
    if (!iframeSection) return;

    const currentPath = linkMap[outputFilename] || outputFilename;
    const prefix = getRootPrefix(currentPath);

    const body = `
      <div class="w-full h-[calc(100vh-64px)] desktop:mt-[0px] flex flex-col overflow-hidden">
        <!-- Banner bantuan akses untuk perangkat seluler -->
        <div class="desktop:hidden bg-[#0161bf] text-white text-xs px-4 py-3 flex justify-between items-center border-b border-white/10 shrink-0">
          <span>Mengalami kendala scrolling di HP?</span>
          <a href="${iframeSection.src}" target="_blank" rel="noopener noreferrer" class="font-semibold underline flex items-center gap-1">
            Buka Halaman Langsung ↗
          </a>
        </div>
        <!-- Wadah iframe dengan fix scrolling untuk mobile -->
        <div class="flex-grow w-full overflow-y-auto -webkit-overflow-scrolling-touch">
          <iframe
            src="${iframeSection.src}"
            class="w-full h-full border-0"
            style="display: block; overflow: auto; -webkit-overflow-scrolling: touch; color-scheme: light;"
            title="${iframeSection.title || pageTitle}"
            allow="fullscreen"
            loading="lazy"
            scrolling="yes"
          ></iframe>
        </div>
      </div>
    `;

    const html = renderLayout(body, pageTitle, currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log(`${currentPath} compiled.`);
};

// 3. Communities Compiler
const compileCommunities = () => {
    const data = getJsonData('communities.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Communities', subtitle: 'Komunitas Indonesia di Aachen' };
    const spotlightSection = data.sections.find(s => s.type === 'CommunitySpotlight');
    const gridSection = data.sections.find(s => s.type === 'CommunityGrid');

    const spotlightCommunity = spotlightSection?.community;
    const communities = gridSection?.communities || [];

    // Extract unique categories for filter bar
    const categories = Array.from(new Set(communities.map(c => c.category).filter(Boolean)));

    const body = `
      <div class="bg-gray-50 min-h-screen mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">

            <!-- Spotlight Section -->
            ${spotlightCommunity ? `
              <section class="mb-16">
                <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transform transition-transform hover:scale-[1.01] duration-300">
                  <div class="md:w-3/5 h-64 md:h-auto relative bg-gray-200">
                    <img
                      src="${makeRelativePath(spotlightCommunity.image)}"
                      alt="${spotlightCommunity.name}"
                      class="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-500"
                    />
                    <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-end p-8">
                      <h2 class="text-4xl font-bold text-white mb-2 drop-shadow-md">${spotlightCommunity.name}</h2>
                    </div>
                  </div>

                  <div class="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
                    <h3 class="heading-2 mb-4">${spotlightSection.title || 'Community Spotlight'}</h3>
                    <p class="body-text text-gray-700 mb-8 text-lg">
                      ${spotlightCommunity.description}
                    </p>

                    <div class="flex flex-col gap-3">
                      <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Connect with us</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-3">
                        ${(spotlightCommunity.links || []).map(link => `
                          <a
                            href="${ensureAbsoluteUrl(link.url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-[#0161bf] text-white rounded-lg hover:bg-[#004a9e] transition-all shadow-md hover:shadow-lg text-sm font-medium w-full h-full text-center"
                          >
                            <span>${link.label}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ` : ''}

            <!-- Grid Section -->
            <section>
              <div class="flex items-center justify-between mb-8">
                <h2 class="heading-2">${gridSection?.title || 'Komunitas Indonesia di Aachen'}</h2>
                <div class="h-1 bg-gray-200 flex-grow ml-8 rounded-full"></div>
              </div>

              <!-- Filter Buttons -->
              <div class="flex flex-wrap gap-2 mb-8">
                <button
                  data-category="All"
                  class="filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[#0161bf] text-white shadow-md"
                >
                  All
                </button>
                ${categories.map(category => `
                  <button
                    data-category="${category}"
                    class="filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  >
                    ${category}
                  </button>
                `).join('')}
              </div>

              <!-- Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${communities.map((comm) => {
                    // Prepare links JSON safely for custom data attribute
                    const linksStr = JSON.stringify(comm.links || []).replace(/'/g, "&apos;");
                    return `
                    <div
                      class="community-card bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer animate-in fade-in zoom-in duration-200"
                      data-category="${comm.category || ''}"
                      data-name="${comm.name || ''}"
                      data-image="${makeRelativePath(comm.image)}"
                      data-description="${comm.description || ''}"
                      data-long-description="${(comm.longDescription || comm.description || '').replace(/"/g, '&quot;')}"
                      data-links='${linksStr}'
                    >
                      <div class="h-48 relative overflow-hidden bg-gray-200">
                        <div class="absolute top-4 right-4 z-10">
                          <span class="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            ${comm.category}
                          </span>
                        </div>
                        <img
                          src="${makeRelativePath(comm.image)}"
                          alt="${comm.name}"
                          class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div class="p-6 flex flex-col flex-grow">
                        <h3 class="heading-3 mb-3 text-gray-800 group-hover:text-[#0161bf] transition-colors">${comm.name}</h3>
                        <p class="body-text text-sm text-gray-600 mb-6 line-clamp-4 flex-grow">
                          ${comm.description}
                        </p>

                        <div class="mt-auto pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                          <span class="text-sm font-medium text-[#0161bf] flex items-center gap-1">
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    `;
                }).join('')}
              </div>
            </section>

          </div>
        </div>

        <!-- Community Details Modal -->
        <div
          id="community-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity hidden"
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative flex flex-col md:flex-row"
          >
            <!-- Close Button -->
            <button
              id="close-comm-btn"
              class="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-800 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Modal Image - Left Side -->
            <div class="w-full md:w-1/2 h-64 md:h-auto relative shrink-0 bg-gray-100">
              <img
                id="modal-comm-image"
                src=""
                alt=""
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Modal Content - Right Side -->
            <div class="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh] bg-white">
              <div class="mb-6">
                <div class="flex flex-wrap items-center gap-3 mb-3 pr-8">
                  <span id="modal-comm-category" class="bg-[#0161bf] text-white px-3 py-1 rounded-full text-sm font-medium"></span>
                </div>

                <h2 id="modal-comm-name" class="heading-2 mb-4 pr-8 text-3xl font-bold text-gray-900"></h2>

                <div class="prose max-w-none text-gray-700 leading-relaxed body-text text-lg">
                  <p id="modal-comm-desc" class="whitespace-pre-line"></p>
                </div>
              </div>

              <div id="modal-comm-links-section" class="mt-8 pt-6 border-t border-gray-100 hidden">
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Connect with us</h4>
                <div id="modal-comm-links" class="flex flex-wrap gap-3"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'Communities', 'communities.html', 'communities.js');
    fs.writeFileSync(path.join(outputDir, 'communities.html'), html);
    console.log('communities.html compiled.');
};

// 4. Events Compiler
const compileEvents = () => {
    const data = getJsonData('events.json');
    if (!data) return;

    // Generate events.js dynamically
    saveJsData('events.js', 'eventsData', data);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Events', subtitle: 'Kegiatan PPI Aachen' };
    const eventGrid = data.sections.find(s => s.type === 'EventGrid');
    const events = eventGrid ? eventGrid.events : [];
    
    // Sort events initially newest first
    const sortedEvents = [...events].sort((a, b) => parseDateLocal(b.date).getTime() - parseDateLocal(a.date).getTime());

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">

            <section class="mb-12">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                <h2 class="heading-2 !mt-0 !mb-0">${eventGrid?.title || 'Kegiatan Kami'}</h2>
                
                <!-- Search and Filter Controls -->
                <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <!-- Search Input -->
                  <div class="relative flex-grow sm:flex-grow-0 sm:w-80">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="search-input"
                      placeholder="Search events by title..."
                      class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-[#fcfcfc] transition-all"
                    />
                  </div>
                  
                  <!-- Sort Selector -->
                  <div class="relative shrink-0">
                    <select
                      id="sort-select"
                      class="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-[#fcfcfc] appearance-none cursor-pointer transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div id="events-grid" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                ${sortedEvents.map(event => renderEventCard(event)).join('')}
              </div>
            </section>

            <!-- Instagram CTA -->
            <section class="bg-light-gray p-8 rounded-lg text-center">
              <h3 class="heading-3 mb-4">Want to see more?</h3>
              <p class="body-text mb-6">
                Follow our Instagram to get the latest updates on our upcoming events and activities!
              </p>
              <a
                href="https://www.instagram.com/ppiaachen"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary inline-flex items-center gap-2"
              >
                <span>@ppiaachen</span>
              </a>
            </section>

          </div>
        </div>

        <!-- Event Details Modal -->
        <div
          id="event-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity hidden"
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative flex flex-col md:flex-row"
          >
            <!-- Close Button -->
            <button
              id="close-event-btn"
              class="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-800 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Modal Image - Left Side -->
            <div id="modal-event-image-container" class="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
              <img
                id="modal-event-image"
                src=""
                alt=""
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Modal Content - Right Side -->
            <div class="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh] bg-white">
              <div class="mb-6">
                <div class="flex flex-wrap items-center gap-3 mb-3 pr-8">
                  <span id="modal-event-date" class="bg-[#0161bf] text-white px-3 py-1 rounded-full text-sm font-medium"></span>
                  <span id="modal-event-tag" class="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium"></span>
                </div>

                <h2 id="modal-event-title" class="heading-2 mb-4 pr-8 text-2xl font-bold text-gray-900"></h2>

                <div class="flex flex-col gap-2 text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
                  <div id="modal-event-time-container" class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span id="modal-event-time" class="font-medium"></span>
                  </div>
                  <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span id="modal-event-location" class="font-medium"></span>
                  </div>
                </div>

                <div class="prose max-w-none text-gray-700 leading-relaxed body-text text-lg">
                  <p id="modal-event-desc" class="whitespace-pre-line"></p>
                </div>
              </div>

              <div id="modal-event-link-section" class="pt-6 border-t border-gray-100 flex justify-end mt-auto">
                <a
                  id="modal-event-link"
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-primary inline-flex items-center gap-2"
                >
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'Events', 'events.html', 'events.js', 'content/pages/events.js');
    fs.writeFileSync(path.join(outputDir, 'events.html'), html);
    console.log('events.html compiled.');
};

// 5. Sejarah Page Compiler
const compileSejarah = () => {
    const data = getJsonData('sejarah.json');
    if (!data) return;

    const currentPath = 'organization/sejarah.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Sejarah', subtitle: 'History of PPI Aachen' };
    const contentSections = data.sections.filter(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}

        ${contentSections.map((section, index) => {
            const isAlternate = index % 2 !== 0;
            const titleId = section.title_id || section.title;
            const titleEn = section.title_en || section.title;
            const titleDe = section.title_de || section.title_en || section.title;
            return `
            <section class="py-3 md:py-6 ${isAlternate ? 'bg-[#e5e5e5]' : 'bg-white'}">
              <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="px-4 md:px-[48px]">
                  ${section.title ? `<h2 class="heading-2 mb-8 md:mb-12" data-lang-id="${titleId}" data-lang-en="${titleEn}" data-lang-de="${titleDe}">${titleId}</h2>` : ''}
                  <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed text-justify">
                    <div class="flex flex-col ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center">
                      <!-- Content Side -->
                      <div class="flex-1 space-y-6">
                        ${renderLangContent(section)}
                      </div>
                      
                      <!-- Image Side -->
                      ${section.image ? `
                        <div class="w-full md:w-1/3 flex-shrink-0">
                          <img
                            src="${makeRelativePath(section.image, prefix)}"
                            alt="${section.imageCaption || 'Sejarah Image'}"
                            class="rounded-lg shadow-lg w-full h-auto object-cover"
                          />
                          ${section.imageCaption ? `
                            <p class="text-sm text-gray-500 mt-2 text-center italic">
                              ${section.imageCaption}
                            </p>
                          ` : ''}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            `;
        }).join('')}

        <!-- Colored Bottom Margin/Spacer -->
        <div class="h-24 bg-[#e5e5e5]"></div>
      </div>
    `;

    const html = renderLayout(body, 'Sejarah', currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/sejarah.html compiled.');
};

// 6. Kepengurusan Page Compiler
const compileKepengurusan = () => {
    const data = getJsonData('kepengurusan.json');
    if (!data) return;

    // Generate kepengurusan.js dynamically
    saveJsData('kepengurusan.js', 'kepengurusanData', data);

    const currentPath = 'organization/kepengurusan.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Kepengurusan', subtitle: 'Susunan Kepengurusan PPI Aachen 2025/2026' };

    const execData = data.sections.find(s => s.type === 'ExecutiveBoard');
    let executiveBoardHtml = '';
    if (execData) {
        executiveBoardHtml = `
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

    const deptsData = data.sections.find(s => s.type === 'DepartmentList');
    const departments = deptsData ? deptsData.departments : [];
    let departmentsHtml = departments.map(dept => `
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

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">

            <!-- Core Leadership -->
            <section id="executive-board-section" class="mb-16 text-center">
              ${executiveBoardHtml}
            </section>

            <!-- Departments -->
            <div id="departments-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              ${departmentsHtml}
            </div>

          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Kepengurusan', currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/kepengurusan.html compiled.');
};

// 7. AD/ART Page Compiler
const compileAdArt = () => {
    const data = getJsonData('ad-art.json');
    if (!data) return;

    const currentPath = 'organization/ad-art.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'AD/ART PPI Aachen', subtitle: 'Anggaran Dasar & Anggaran Rumah Tangga' };
    const contentSections = data.sections.filter(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            
            <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-700">
              ${contentSections.map((section, index) => {
                  const isLastSection = index === contentSections.length - 1;
                  return `
                  <div>
                    ${section.title ? `<h1 class="heading-2 mb-8">${section.title}</h1>` : ''}
                    <div>
                      ${renderMarkdown(section.content)}
                    </div>

                    <!-- Divider between sections -->
                    ${!isLastSection ? '<div class="my-12 border-t border-gray-200"></div>' : ''}
                  </div>
                  `;
              }).join('')}
            </div>

            <div class="my-12 border-t border-gray-200"></div>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p class="body-text mb-4 font-medium">
                Hanya file ini (dokumen yang di-embed di bawah) yang dianggap sah sebagai referensi utama.
              </p>
              <button
                id="adart-trigger"
                class="inline-flex items-center gap-2 px-6 py-3 bg-[#002F6C] text-white font-bold rounded-lg hover:bg-[#001D43] transition-colors shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Buka Dokumen Resmi AD/ART
              </button>
            </div>

          </div>
        </div>

        <!-- Official Doc Modal -->
        <div
          id="adart-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity hidden"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] relative flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-lg">Dokumen Resmi AD/ART PPI Aachen</h3>
              <div class="flex items-center gap-2">
                <a
                  href="https://docs.google.com/document/d/e/2PACX-1vS1P12969Vut22ytyBniEyIdopjk08xi5fk73IlC4ZA90_lp01PiB9L78Rz-86c7D7BUgVpnb1Q4Ito/pub"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 text-gray-500 hover:text-[#0161bf] hover:bg-blue-50 rounded-full transition-colors"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  id="close-adart-btn"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-y-auto -webkit-overflow-scrolling-touch flex flex-col">
              <iframe
                id="adart-iframe"
                src="about:blank"
                class="w-full h-full rounded-lg bg-white border-0"
                style="color-scheme: light;"
                allow="autoplay"
                title="Official AD/ART Document"
              ></iframe>
            </div>
            <!-- Footer Disclaimer -->
            <div class="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
              Hanya file ini yang dianggap sah.
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'AD/ART', currentPath, 'ad-art.js');
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/ad-art.html compiled.');
};

// 8. SPA Page Compiler
const compileSpa = () => {
    const data = getJsonData('spa.json');
    if (!data) return;

    const currentPath = 'organization/spa.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'SPA', subtitle: 'Sidang Perwakilan Anggota PPI Aachen' };
    const contentSection = data.sections.find(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            ${contentSection ? `
              <h2 class="heading-2 mb-8">Sidang Perwakilan Anggota PPI Aachen</h2>
              <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-700">
                <div>${renderMarkdown(contentSection.content)}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'SPA', currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/spa.html compiled.');
};

// 9. Arsip LPJ Compiler
const compileArsipLpj = () => {
    const data = getJsonData('arsip-lpj.json');
    if (!data) return;

    // Generate arsip-lpj.js dynamically
    saveJsData('arsip-lpj.js', 'lpjData', data);

    const currentPath = 'organization/arsip-lpj.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Arsip LPJ', subtitle: 'Laporan Pertanggungjawaban' };

    const lpjListSection = data.sections.find(s => s.type === 'LpjList');
    const lpjList = lpjListSection ? [...lpjListSection.items] : [];
    lpjList.sort((a, b) => b.year.localeCompare(a.year, undefined, { numeric: true }));

    const lpjCardsHtml = lpjList.map((lpj) => `
        <div
          class="lpj-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0161bf] transition-all group flex items-center justify-between cursor-pointer"
          data-year="${lpj.year}"
          data-url="${lpj.url}"
        >
          <div>
            <h3 class="heading-3 mt-0 mb-1 group-hover:text-[#0161bf] transition-colors">LPJ ${lpj.year}</h3>
            <p class="body-text text-sm text-gray-500 mt-0">View Document</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-[#0161bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
    `).join('');

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            <h2 class="heading-2 mb-8">Arsip LPJ</h2>
            <div id="lpj-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${lpjCardsHtml}
            </div>
          </div>
        </div>

        <!-- PDF Viewer Modal -->
        <div
          id="lpj-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity hidden"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] relative flex flex-col animate-in fade-in zoom-in duration-200">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 id="modal-lpj-title" class="font-bold text-gray-900 text-lg"></h3>
              <div class="flex items-center gap-2">
                <!-- Mobile Directly Open Button (helpful for phone layout scrolling issues) -->
                <a
                  id="modal-lpj-mobile-btn"
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  class="desktop:hidden px-3 py-1.5 bg-[#0161bf] hover:bg-[#004a9e] text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1"
                >
                  Buka Dokumen Langsung ↗
                </a>
                <a
                  id="modal-lpj-newtab"
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 text-gray-500 hover:text-[#0161bf] hover:bg-blue-50 rounded-full transition-colors"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  id="close-lpj-btn"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-y-auto -webkit-overflow-scrolling-touch flex flex-col">
              <iframe
                id="modal-lpj-iframe"
                src="about:blank"
                class="w-full h-full rounded-lg bg-white border-0"
                style="color-scheme: light;"
                allow="autoplay"
                title="LPJ Document"
              ></iframe>
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'Arsip LPJ', currentPath, 'arsip-lpj.js');
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/arsip-lpj.html compiled.');
};

// 10. Arsip Pengurus Compiler
const compileArsipPengurus = () => {
    const data = getJsonData('arsip-pengurus.json');
    if (!data) return;

    // Generate arsip-pengurus.js dynamically
    saveJsData('arsip-pengurus.js', 'cabinetData', data);

    const currentPath = 'organization/arsip-pengurus.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Arsip Pengurus', subtitle: 'Past Cabinet Archive' };
    const cabinetArchive = data.sections.find(s => s.type === 'CabinetArchive');

    const pastChairs = cabinetArchive ? cabinetArchive.pastChairs || [] : [];
    const cabinets = cabinetArchive ? cabinetArchive.cabinets || [] : [];

    const pastChairsHtml = pastChairs.map(item => `
        <div class="break-inside-avoid flex justify-between items-center h-14 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
            <span class="font-medium text-gray-900 border-r border-gray-200 pr-4 flex-1 truncate group-hover:border-[#002f6c]/30 transition-colors" title="${item.name}">${item.name}</span>
            <span class="text-sm text-gray-500 font-mono pl-4 text-right min-w-[100px]">${item.period}</span>
        </div>
    `).join('');

    const cabinetsHtml = cabinets.map((cab, idx) => {
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
                                            src="${makeRelativePath(cab.image, prefix)}"
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

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            
            <!-- Daftar Ketua Section -->
            <section class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
              <h2 class="heading-2 mb-8 text-center">Daftar Ketua PPI Aachen</h2>
              <div id="past-chairs-list" class="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-1 [column-rule:1px_solid_#e5e7eb]">
                ${pastChairsHtml}
              </div>
            </section>

            <!-- Detailed Cabinets Section -->
            <section class="mb-12">
              <h2 class="heading-2 mb-12 text-center">${cabinetArchive?.title || 'Arsip Pengurus Kabinet'}</h2>

              <div id="cabinets-list" class="grid grid-cols-1 gap-6">
                ${cabinetsHtml}
              </div>
            </section>

          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Arsip Pengurus', currentPath, 'arsip-pengurus.js');
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/arsip-pengurus.html compiled.');
};

// 11. Kontak Email Page Compiler
const compileKontakEmail = () => {
    const data = getJsonData('kontak-email.json');
    if (!data) return;

    const currentPath = 'organization/kontak-email.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Kontak Email', subtitle: 'Get in Touch' };
    const contactListSection = data.sections.find(s => s.type === 'ContactList');
    const contacts = contactListSection?.contacts || [];

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="p-8 md:p-12">
                <h2 class="heading-2 mb-8 text-center">${contactListSection?.title || 'Department Contacts'}</h2>
                <div class="grid grid-cols-1 gap-y-8">
                  ${contacts.map((contact) => `
                    <div class="flex flex-col md:flex-row items-center gap-6 border-b border-gray-100 pb-6 last:border-0">
                      <!-- Logo Image -->
                      ${contact.image ? `
                        <div class="flex-shrink-0 p-2">
                          <img
                            src="${makeRelativePath(contact.image, prefix)}"
                            alt="${contact.role}"
                            class="w-64 h-auto object-contain"
                          />
                        </div>
                      ` : `
                        <div class="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      `}
                      <div class="flex flex-col items-center md:items-start text-center md:text-left w-full">
                        <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">${contact.role}</span>
                        ${(contact.email || '').split(' ').map(email => `
                          <a
                            href="mailto:${email.trim()}"
                            class="text-xl font-medium text-[#0161bf] hover:text-[#004a9e] transition-colors break-all block mb-1 last:mb-0"
                          >
                            ${email.trim()}
                          </a>
                        `).join('')}
                        
                        ${contact.whatsapp ? `
                          ${contact.whatsappLink ? `
                            <a href="${contact.whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-[#0161bf] font-medium mt-1 hover:text-[#004a9e] transition-colors block">
                              ${contact.whatsapp}
                            </a>
                          ` : `
                            <p class="text-[#0161bf] font-medium mt-1">${contact.whatsapp}</p>
                          `}
                        ` : ''}

                        ${contact.address ? `
                          ${contact.addressLink ? `
                            <a href="${contact.addressLink}" target="_blank" rel="noopener noreferrer" class="text-gray-600 mt-2 hover:text-[#0161bf] transition-colors block">
                              ${contact.address}
                            </a>
                          ` : `
                            <p class="text-gray-600 mt-2">${contact.address}</p>
                          `}
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Kontak Email', currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('organization/kontak-email.html compiled.');
};

// 12. Linktree Page Compiler
const compileLinktree = () => {
    const data = getJsonData('linktree.json');
    if (!data) return;

    const currentPath = 'others/linktree.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Linktree', subtitle: 'PPI Aachen Links' };
    const contentSection = data.sections.find(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            ${contentSection ? `
              <h2 class="heading-2">${contentSection.title || ''}</h2>
              <div>${contentSection.content}</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Linktree', currentPath);
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('others/linktree.html compiled.');
};

// 13. Press Kit Page Compiler
const compilePressKit = () => {
    const data = getJsonData('press-kit.json');
    if (!data) return;

    const currentPath = 'others/press-kit.html';
    const prefix = getRootPrefix(currentPath);

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Press Kit', subtitle: 'Resources & Assets' };
    const headerSection = data.sections.find(s => s.type === 'PressKitHeader');
    const logoGrid = data.sections.find(s => s.type === 'LogoGrid');
    const logos = logoGrid?.logos || [];

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle, prefix)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            <h2 class="heading-2 mb-8">Press Kit</h2>

            <!-- Header Section -->
            ${headerSection ? `
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 class="heading-3 mb-2 text-[#002f6c]">${headerSection.title}</h2>
                  <p class="body-text text-gray-600 mt-0">${headerSection.subtitle}</p>
                </div>
                ${headerSection.downloadLink ? `
                  <a
                    href="${ensureAbsoluteUrl(headerSection.downloadLink)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-[#0161bf] text-white font-bold rounded-lg hover:bg-[#004e9a] transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      ${headerSection.downloadText || 'Download'}
                    </span>
                  </a>
                ` : ''}
              </div>
            ` : ''}

            <!-- Logo Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              ${logos.map((logo) => `
                <div
                  class="logo-card group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  data-name="${logo.name}"
                  data-image="${makeRelativePath(logo.image, prefix)}"
                >
                  <div class="aspect-square bg-gray-300 flex items-center justify-center p-8 border-b border-gray-100 relative">
                    <div class="w-full h-full flex items-center justify-center text-gray-300 relative z-10">
                      <img
                        src="${makeRelativePath(logo.image, prefix)}"
                        alt="${logo.name}"
                        class="max-w-full max-h-full object-contain"
                        onerror="this.src='https://placehold.co/400x400/f3f4f6/a1a1aa?text=Logo+Placeholder';"
                      />
                    </div>
                    <!-- Overlay on hover -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                      <span class="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm pointer-events-none">Preview</span>
                    </div>
                  </div>
                  <div class="p-4 flex items-center justify-between gap-3">
                    <h3 class="text-sm font-medium text-gray-900 group-hover:text-[#0161bf] transition-colors line-clamp-2" title="${logo.name}">
                      ${logo.name}
                    </h3>
                    <a
                      href="${makeRelativePath(logo.image, prefix)}"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 text-gray-400 hover:text-[#0161bf] bg-gray-50 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                      title="Download ${logo.name}"
                      onclick="event.stopPropagation();"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- Preview Modal -->
        <div
          id="logo-modal"
          class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity hidden"
        >
          <div class="max-w-4xl w-full max-h-[90vh] relative flex flex-col items-center">
            <div class="bg-white p-2 rounded-xl shadow-2xl relative w-full h-auto">
              <button
                id="close-logo-btn"
                class="absolute -top-12 right-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center p-4 sm:p-12 min-h-[300px]">
                <img
                  id="modal-logo-image"
                  src=""
                  alt=""
                  class="max-w-full max-h-[70vh] object-contain shadow-lg"
                  onerror="this.src='https://placehold.co/800x600/f3f4f6/a1a1aa?text=Logo+Placeholder';"
                />
              </div>
              <div class="mt-4 px-4 pb-6 text-center flex flex-col items-center gap-4 w-full">
                <div>
                  <h3 id="modal-logo-title" class="font-bold text-gray-900 text-lg"></h3>
                  <p id="modal-logo-filename" class="text-sm text-gray-500 mt-1"></p>
                </div>

                <a
                  id="modal-logo-download"
                  href=""
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0161bf] text-white font-medium rounded-lg hover:bg-[#004e9a] transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Asset
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'Press Kit', currentPath, 'press-kit.js');
    const destPath = path.join(outputDir, currentPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, html);
    console.log('others/press-kit.html compiled.');
};

// 14. Impressum Page Compiler
const compileImpressum = () => {
    const data = getJsonData('impressum.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Impressum', subtitle: 'Impressum & Datenschutzerklärung' };
    const contentSections = data.sections.filter(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            <div class="space-y-12">
              ${contentSections.map((section, index) => `
                <section class="space-y-6 ${index > 0 ? 'pt-12 border-t border-gray-200' : ''}">
                  ${section.title ? `<h2 class="heading-2">${section.title}</h2>` : ''}
                  <div class="body-text">
                    ${renderMarkdown(section.content)}
                  </div>
                </section>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Impressum', 'impressum.html');
    fs.writeFileSync(path.join(outputDir, 'impressum.html'), html);
    console.log('impressum.html compiled.');
};

// --- Build execution ---
const build = () => {
    console.log('Starting static site compilation...');
    
    compileHome();
    compileIframePage('lapor-diri.json', 'lapor-diri.html', 'Lapor Diri');
    compileEvents();
    compileCommunities();
    compileIframePage('merchandise.json', 'merchandise.html', 'Merchandise');
    compileSejarah();
    compileKepengurusan();
    compileAdArt();
    compileSpa();
    compileArsipLpj();
    compileArsipPengurus();
    compileKontakEmail();
    compileLinktree();
    compileIframePage('acop2025.json', 'acop-2025.html', 'ACOP 2025');
    compileIframePage('wiki-aachen.json', 'wiki-aachen.html', 'Wiki Aachen');
    compilePressKit();
    compileImpressum();

    console.log('Static site compilation complete!');
};

build();
