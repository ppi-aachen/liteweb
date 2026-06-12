import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to resolve workspace paths
const contentDir = path.join(__dirname, 'content', 'pages');
const outputDir = __dirname; // Root directory

// Navigation items configuration matching React app (pointing to static files)
const navigationItems = [
    { label: 'Home', path: 'index.html' },
    { label: 'Lapor Diri', path: 'lapor-diri.html' },
    { label: 'Events', path: 'events.html' },
    { label: 'Communities', path: 'communities.html' },
    { label: 'Merchandise', path: 'merchandise.html' },
    {
        label: 'Organization',
        path: '#',
        children: [
            { label: 'Sejarah', path: 'sejarah.html' },
            { label: 'Kepengurusan', path: 'kepengurusan.html' },
            { label: 'AD/ART PPI Aachen', path: 'ad-art.html' },
            { label: 'SPA PPI Aachen', path: 'spa.html' },
            { label: 'Arsip LPJ', path: 'arsip-lpj.html' },
            { label: 'Arsip Pengurus', path: 'arsip-pengurus.html' },
            { label: 'Kontak Email', path: 'kontak-email.html' },
        ],
    },
    {
        label: 'Others',
        path: '#',
        children: [
            { label: 'Linktree', path: 'linktree.html' },
            { label: 'ACOP 2025', path: 'acop-2025.html' },
            { label: 'Wiki Aachen für Dummies', path: 'wiki-aachen.html' },
            { label: 'Press Kit', path: 'press-kit.html' },
        ],
    },
];

// Helper to strip leading slash from paths to make them relative (useful for direct file opening)
const makeRelativePath = (url) => {
    if (!url) return '';
    if (typeof url === 'string' && url.startsWith('/')) {
        return url.substring(1);
    }
    return url;
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

// Global Layout template compiler
const renderLayout = (bodyContent, title, currentPath, pageScript = null, dataScript = null) => {
    const baseUrl = 'https://cf.ppiaachen.de';
    const isLinktree = currentPath === 'linktree.html';

    // Helper to check if a navigation item is active
    const isActive = (navItem) => {
        if (navItem.path === currentPath) return true;
        if (navItem.children) {
            return navItem.children.some(child => child.path === currentPath);
        }
        if (navItem.path === 'index.html' && currentPath === '') return true;
        return false;
    };

    const isChildActive = (childPath) => {
        return childPath === currentPath;
    };

    // Render Side Navigation
    const sideNavigationHtml = `
      <!-- Mobile Menu Button -->
      <button
        id="mobile-menu-btn"
        class="fixed top-4 left-4 z-50 desktop:hidden bg-dark text-white p-2 rounded"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Top Navigation Bar (Desktop) -->
      <nav
        class="hidden desktop:flex desktop:fixed desktop:top-0 desktop:left-0 desktop:right-0 desktop:bg-white desktop:z-40 desktop:shadow-md h-12"
        role="navigation"
      >
        <div class="w-full flex items-center justify-between px-8">
          <div class="flex items-center flex-shrink-0">
            <a href="index.html" class="flex items-center h-full py-2">
              <img
                src="logo.png"
                alt="PPI Aachen"
                class="h-10 object-contain"
                onerror="this.style.display='none'; const text=document.createElement('span'); text.className='logo-text text-dark text-xl font-light'; text.textContent='PPI Aachen'; this.parentElement.appendChild(text);"
              />
            </a>
          </div>
          <div class="flex items-center space-x-1 flex-shrink-0">
            ${navigationItems.map(item => {
                const itemActive = isActive(item);
                if (item.children) {
                    return `
                    <div class="relative group">
                      <button
                        class="px-2 py-2 text-dark text-[12pt] transition-colors duration-200 hover:text-primary-light flex items-center gap-1 ${itemActive ? 'text-black font-bold' : 'font-light'}"
                      >
                        ${item.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        class="absolute hidden group-hover:block top-full right-0 bg-white shadow-lg min-w-[200px] py-2 z-50 border border-gray-100"
                      >
                        ${item.children.map(child => `
                          <a
                            href="${child.path}"
                            class="block px-4 py-2 text-dark text-[11pt] transition-colors duration-200 hover:bg-primary/20 hover:text-primary-light ${isChildActive(child.path) ? 'text-black font-bold bg-primary/10' : 'font-light'}"
                          >
                            ${child.label}
                          </a>
                        `).join('')}
                      </div>
                    </div>
                    `;
                } else {
                    return `
                    <a
                      href="${item.path}"
                      class="px-2 py-2 text-dark text-[12pt] transition-colors duration-200 hover:text-primary-light ${itemActive ? 'text-black font-bold' : 'font-light'}"
                    >
                      ${item.label}
                    </a>
                    `;
                }
            }).join('')}
          </div>
        </div>
      </nav>

      <!-- Side Navigation (Mobile Drawer) -->
      <nav
        id="mobile-nav"
        class="fixed desktop:hidden w-sidebar bg-dark font-sans pt-12 h-screen z-40 transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden -translate-x-full"
        role="navigation"
      >
        <div class="px-2 pb-20">
          ${navigationItems.map((item, idx) => {
              const itemActive = isActive(item);
              if (item.children) {
                  const groupId = `mobile-group-${idx}`;
                  return `
                  <div>
                    <button
                      data-target="${groupId}"
                      class="mobile-group-toggle w-full text-left py-[11.5px] px-2 text-white text-[15pt] font-light transition-colors duration-200 hover:text-white flex items-center justify-between ${itemActive ? 'text-primary-light' : ''}"
                    >
                      ${item.label}
                      <span class="flex-shrink-0 ml-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="chevron-icon w-5 h-5 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div
                      id="${groupId}"
                      class="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0"
                    >
                      <div class="pl-4">
                        ${item.children.map(child => `
                          <a
                            href="${child.path}"
                            class="block py-[11.5px] px-2 text-white text-[12pt] font-light transition-colors duration-200 hover:text-white ${isChildActive(child.path) ? 'text-primary-light font-normal' : ''}"
                          >
                            ${child.label}
                          </a>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                  `;
              } else {
                  return `
                  <a
                    href="${item.path}"
                    class="block py-[11.5px] px-2 text-white text-[15pt] font-light transition-colors duration-200 hover:text-white ${itemActive ? 'text-primary-light' : ''}"
                  >
                    ${item.label}
                  </a>
                  `;
              }
          }).join('')}
        </div>
      </nav>

      <!-- Mobile Overlay -->
      <div
        id="mobile-overlay"
        class="fixed inset-0 bg-black/50 z-30 desktop:hidden hidden"
      ></div>
    `;

    // Render Footer
    const footerHtml = `
      <footer class="bg-dark text-white py-8 mt-12">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-12 md:px-[48px]">
            <div class="flex flex-col md:flex-row justify-between gap-8 mb-8">
              <div>
                <h3 class="heading-3 text-white mb-4">Contact</h3>
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
                <h3 class="heading-3 text-white mb-4">Follow Us</h3>
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
                  Mendukung dan membantu pelajar Indonesia di Aachen sejak 1956.<br />
                  <em>Supporting and helping Indonesian students in Aachen since 1956.</em>
                </p>
              </div>
            </div>

            <div class="border-t border-white/20 pt-6">
              <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="body-text text-white/70 text-center md:text-left">
                  © ${new Date().getFullYear()} Perhimpunan Pelajar Indonesia di Aachen
                </p>
                <div class="flex gap-4">
                  <a href="impressum.html" class="body-text text-white/70 hover:text-primary-light transition-colors">
                    Impressum & Datenschutzerklärung
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Perhimpunan Pelajar Indonesia di Aachen - Indonesian Students Association in Aachen" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}/${currentPath}" />
  <meta property="og:title" content="PPI Aachen - ${title}" />
  <meta property="og:description" content="Perhimpunan Pelajar Indonesia di Aachen - Indonesian Students Association in Aachen" />
  <meta property="og:image" content="${baseUrl}/og-image.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${baseUrl}/${currentPath}" />
  <meta property="twitter:title" content="PPI Aachen - ${title}" />
  <meta property="twitter:description" content="Perhimpunan Pelajar Indonesia di Aachen - Indonesian Students Association in Aachen" />
  <meta property="twitter:image" content="${baseUrl}/og-image.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css" />
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

  <script src="js/main.js"></script>
  ${dataScript ? `<script src="${dataScript}"></script>` : ''}
  ${pageScript ? `<script src="js/${pageScript}"></script>` : ''}
</body>
</html>`;
};

// Render HeroHeader component
const renderHeroHeader = (title, subtitle) => {
    return `
    <div class="hero-header relative overflow-hidden text-white flex flex-col justify-center items-center text-center">
      <!-- Parallax Background Layer -->
      <div class="hero-header-bg absolute inset-0 w-full" style="background-image: url('hero-bright.png'); height: 120%; top: -10%; z-index: 0;"></div>
    </div>
    `;
};

// Render HTML with break formatting helper
const renderContentWithBreaks = (content) => {
    if (!content) return '';
    return content.replace(/\n\n/g, '<br/><br/>');
};

// --- Page Compilers ---

// 1. Home Page Compiler
const compileHome = () => {
    const data = getJsonData('home.json');
    if (!data) return;

    // Scan carousel assets directory
    const carouselDir = path.join(__dirname, 'assets', 'carousel');
    let slides = [];
    if (fs.existsSync(carouselDir)) {
        slides = fs.readdirSync(carouselDir)
            .filter(f => f.toLowerCase().endsWith('.png'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'PPI Aachen', subtitle: 'Indonesian Students Association in Aachen' };
    const aboutSection = data.sections.find(s => s.title === 'About Us');
    const historySection = data.sections.find(s => s.title === 'Short History');
    const logoSection = data.sections.find(s => s.title === 'Our Logo');
    const petaSection = data.sections.find(s => s.title === 'Peta Wilayah Kerja');

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
                  <span>Visit our Linktree</span>
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
                  <h2 class="heading-2-home text-center">${aboutSection.title}</h2>
                  <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed text-justify">
                    ${renderContentWithBreaks(aboutSection.content)}
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
                  <div class="flex flex-col md:flex-row gap-8 items-center">
                    <div class="body-text space-y-6 text-lg leading-relaxed text-white flex-1 text-justify">
                      <h2 class="heading-2-home text-white text-center">${historySection.title}</h2>
                      <div>
                        ${renderContentWithBreaks(historySection.content)}
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
                      <h2 class="heading-2-home text-center">${logoSection.title}</h2>
                      <div>
                        ${renderContentWithBreaks(logoSection.content)}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Section 5: Aachen für Dummies -->
        <div class="bg-[#0161bf] text-white">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="px-4 md:px-[48px] pt-6 pb-12">
              <section class="max-w-none">
                <h2 class="heading-2-home text-white text-center">Aachen für Dummies</h2>

                <div class="my-8 flex justify-center">
                  <div
                    id="pdf-trigger"
                    class="relative w-full max-w-2xl h-[400px] md:h-[800px] rounded-lg shadow-lg border-0 overflow-hidden cursor-pointer group"
                  >
                    <iframe
                      src="https://drive.google.com/file/d/1JtwUe0FkGHvXqIJbFa0i6iVw79eA-Cu4/preview"
                      class="w-full h-full pointer-events-none"
                      allow="autoplay"
                      title="Aachen für Dummies Preview"
                    ></iframe>

                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div class="bg-white/90 text-[#0161bf] px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold shadow-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Click to Read
                      </div>
                    </div>
                  </div>
                </div>

                <div class="body-text space-y-6 text-lg leading-relaxed text-white text-center">
                  <p>
                    Buku panduan yang dibuat khusus untuk pelajar Indonesia yang baru saja tiba di Aachen<br />
                    A guide book specially made for Indonesian students that have just arrived in Aachen
                  </p>
                  <div class="mt-4 flex justify-center">
                    <a href="wiki-aachen.html" class="btn-primary bg-white text-[#002F6C] hover:bg-gray-100 rounded-xl px-6 py-2">
                      Buka wiki online
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <!-- Section 6: Peta Wilayah Kerja -->
        ${petaSection ? `
          <div class="bg-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="px-4 md:px-[48px] pt-6 pb-12">
                <section class="max-w-none">
                  <h2 class="heading-2-home text-center">${petaSection.title}</h2>
                  <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed">
                    <div class="mt-8 flex justify-center">
                      <img
                        src="${makeRelativePath(petaSection.image)}"
                        alt="${petaSection.title}"
                        class="rounded-lg shadow-md w-full max-w-lg h-auto"
                      />
                    </div>
                    <div class="body-text space-y-6 text-lg leading-relaxed text-gray-700 text-center">
                      ${renderContentWithBreaks(petaSection.content)}
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
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-hidden">
              <iframe
                src="https://drive.google.com/file/d/1JtwUe0FkGHvXqIJbFa0i6iVw79eA-Cu4/preview"
                class="w-full h-full rounded-lg bg-white border-0"
                allow="autoplay"
                title="Aachen für Dummies Fullscreen"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Home', 'index.html', 'home.js');
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    console.log('index.html compiled.');
};

// 2. Simple Iframe Page Compiler (Lapor Diri, Wiki Aachen, Merchandise, ACOP 2025)
const compileIframePage = (jsonFilename, outputFilename, pageTitle) => {
    const data = getJsonData(jsonFilename);
    if (!data) return;

    const iframeSection = data.sections.find(s => s.type === 'IframeSection');
    if (!iframeSection) return;

    const body = `
      <div class="w-full h-[calc(100vh-64px)] desktop:mt-[0px]">
        <div class="h-full">
          <iframe
            src="${iframeSection.src}"
            class="w-full h-full border-0"
            title="${iframeSection.title || pageTitle}"
            allow="fullscreen"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    `;

    const html = renderLayout(body, pageTitle, outputFilename);
    fs.writeFileSync(path.join(outputDir, outputFilename), html);
    console.log(`${outputFilename} compiled.`);
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
                            href="${link.url}"
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

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Events', subtitle: 'Kegiatan PPI Aachen' };
    const eventGrid = data.sections.find(s => s.type === 'EventGrid');

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
                <!-- Dynamically populated by js/events.js -->
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

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Sejarah', subtitle: 'History of PPI Aachen' };
    const contentSections = data.sections.filter(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}

        ${contentSections.map((section, index) => {
            const isAlternate = index % 2 !== 0;
            return `
            <section class="py-3 md:py-6 ${isAlternate ? 'bg-[#e5e5e5]' : 'bg-white'}">
              <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="px-4 md:px-[48px]">
                  ${section.title ? `<h2 class="heading-2 mb-8 md:mb-12">${section.title}</h2>` : ''}
                  <div class="body-text space-y-6 text-lg text-gray-700 leading-relaxed text-justify">
                    <div class="flex flex-col ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center">
                      <!-- Content Side -->
                      <div class="flex-1 space-y-6">
                        ${(section.content || '').replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}
                      </div>
                      
                      <!-- Image Side -->
                      ${section.image ? `
                        <div class="w-full md:w-1/3 flex-shrink-0">
                          <img
                            src="${makeRelativePath(section.image)}"
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

    const html = renderLayout(body, 'Sejarah', 'sejarah.html');
    fs.writeFileSync(path.join(outputDir, 'sejarah.html'), html);
    console.log('sejarah.html compiled.');
};

// 6. Kepengurusan Page Compiler
const compileKepengurusan = () => {
    const data = getJsonData('kepengurusan.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Kepengurusan', subtitle: 'Susunan Kepengurusan PPI Aachen 2025/2026' };

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">

            <!-- Core Leadership -->
            <section id="executive-board-section" class="mb-16 text-center">
              <!-- Dynamically populated -->
            </section>

            <!-- Departments -->
            <div id="departments-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <!-- Dynamically populated -->
            </div>

          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Kepengurusan', 'kepengurusan.html', 'kepengurusan.js', 'content/pages/kepengurusan.js');
    fs.writeFileSync(path.join(outputDir, 'kepengurusan.html'), html);
    console.log('kepengurusan.html compiled.');
};

// 7. AD/ART Page Compiler
const compileAdArt = () => {
    const data = getJsonData('ad-art.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'AD/ART PPI Aachen', subtitle: 'Anggaran Dasar & Anggaran Rumah Tangga' };
    const contentSections = data.sections.filter(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            
            <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-700">
              ${contentSections.map((section, index) => {
                  const isLastSection = index === contentSections.length - 1;
                  return `
                  <div>
                    ${section.title ? `<h1 class="heading-2 mb-8">${section.title}</h1>` : ''}
                    <div>
                      ${section.content || ''}
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
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-hidden">
              <iframe
                id="adart-iframe"
                src="about:blank"
                class="w-full h-full rounded-lg bg-white"
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

    const html = renderLayout(body, 'AD/ART', 'ad-art.html', 'ad-art.js');
    fs.writeFileSync(path.join(outputDir, 'ad-art.html'), html);
    console.log('ad-art.html compiled.');
};

// 8. SPA Page Compiler
const compileSpa = () => {
    const data = getJsonData('spa.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'SPA', subtitle: 'Sidang Perwakilan Anggota PPI Aachen' };
    const contentSection = data.sections.find(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            ${contentSection ? `
              <h2 class="heading-2 mb-8">Sidang Perwakilan Anggota PPI Aachen</h2>
              <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-700">
                <div>${contentSection.content}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'SPA', 'spa.html');
    fs.writeFileSync(path.join(outputDir, 'spa.html'), html);
    console.log('spa.html compiled.');
};

// 9. Arsip LPJ Compiler
const compileArsipLpj = () => {
    const data = getJsonData('arsip-lpj.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Arsip LPJ', subtitle: 'Laporan Pertanggungjawaban' };

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            <h2 class="heading-2 mb-8">Arsip LPJ</h2>
            <div id="lpj-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Dynamically populated by js/arsip-lpj.js -->
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
            <div class="flex-grow bg-gray-100 p-2 rounded-b-xl overflow-hidden">
              <iframe
                id="modal-lpj-iframe"
                src="about:blank"
                class="w-full h-full rounded-lg bg-white"
                allow="autoplay"
                title="LPJ Document"
              ></iframe>
            </div>
          </div>
        </div>

      </div>
    `;

    const html = renderLayout(body, 'Arsip LPJ', 'arsip-lpj.html', 'arsip-lpj.js', 'content/pages/arsip-lpj.js');
    fs.writeFileSync(path.join(outputDir, 'arsip-lpj.html'), html);
    console.log('arsip-lpj.html compiled.');
};

// 10. Arsip Pengurus Compiler
const compileArsipPengurus = () => {
    const data = getJsonData('arsip-pengurus.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Arsip Pengurus', subtitle: 'Past Cabinet Archive' };
    const cabinetArchive = data.sections.find(s => s.type === 'CabinetArchive');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="px-4 md:px-[48px] py-12">
            
            <!-- Daftar Ketua Section -->
            <section class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
              <h2 class="heading-2 mb-8 text-center">Daftar Ketua PPI Aachen</h2>
              <div id="past-chairs-list" class="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-1 [column-rule:1px_solid_#e5e7eb]">
                <!-- Dynamically populated by js/arsip-pengurus.js -->
              </div>
            </section>

            <!-- Detailed Cabinets Section -->
            <section class="mb-12">
              <h2 class="heading-2 mb-12 text-center">${cabinetArchive?.title || 'Arsip Pengurus Kabinet'}</h2>

              <div id="cabinets-list" class="grid grid-cols-1 gap-6">
                <!-- Dynamically populated by js/arsip-pengurus.js -->
              </div>
            </section>

          </div>
        </div>
      </div>
    `;

    const html = renderLayout(body, 'Arsip Pengurus', 'arsip-pengurus.html', 'arsip-pengurus.js', 'content/pages/arsip-pengurus.js');
    fs.writeFileSync(path.join(outputDir, 'arsip-pengurus.html'), html);
    console.log('arsip-pengurus.html compiled.');
};

// 11. Kontak Email Page Compiler
const compileKontakEmail = () => {
    const data = getJsonData('kontak-email.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Kontak Email', subtitle: 'Get in Touch' };
    const contactListSection = data.sections.find(s => s.type === 'ContactList');
    const contacts = contactListSection?.contacts || [];

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
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
                            src="${makeRelativePath(contact.image)}"
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

    const html = renderLayout(body, 'Kontak Email', 'kontak-email.html');
    fs.writeFileSync(path.join(outputDir, 'kontak-email.html'), html);
    console.log('kontak-email.html compiled.');
};

// 12. Linktree Page Compiler
const compileLinktree = () => {
    const data = getJsonData('linktree.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Linktree', subtitle: 'PPI Aachen Links' };
    const contentSection = data.sections.find(s => s.type === 'Section');

    const body = `
      <div>
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
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

    const html = renderLayout(body, 'Linktree', 'linktree.html');
    fs.writeFileSync(path.join(outputDir, 'linktree.html'), html);
    console.log('linktree.html compiled.');
};

// 13. Press Kit Page Compiler
const compilePressKit = () => {
    const data = getJsonData('press-kit.json');
    if (!data) return;

    const heroSection = data.sections.find(s => s.type === 'Hero') || { title: 'Press Kit', subtitle: 'Resources & Assets' };
    const headerSection = data.sections.find(s => s.type === 'PressKitHeader');
    const logoGrid = data.sections.find(s => s.type === 'LogoGrid');
    const logos = logoGrid?.logos || [];

    const body = `
      <div class="mb-24">
        ${renderHeroHeader(heroSection.title, heroSection.subtitle)}
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
                    href="${headerSection.downloadLink}"
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
                  data-image="${makeRelativePath(logo.image)}"
                >
                  <div class="aspect-square bg-gray-300 flex items-center justify-center p-8 border-b border-gray-100 relative">
                    <div class="w-full h-full flex items-center justify-center text-gray-300 relative z-10">
                      <img
                        src="${makeRelativePath(logo.image)}"
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
                      href="${makeRelativePath(logo.image)}"
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

    const html = renderLayout(body, 'Press Kit', 'press-kit.html', 'press-kit.js');
    fs.writeFileSync(path.join(outputDir, 'press-kit.html'), html);
    console.log('press-kit.html compiled.');
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
                    ${section.content || ''}
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
    try {
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
    } catch (error) {
        console.error('Build compilation failed:', error);
    }
};

if (process.argv.includes('--watch')) {
    build();
    console.log(`Watching for changes in ${contentDir}...`);
    let timeoutId = null;
    fs.watch(contentDir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.json') || filename.endsWith('.js'))) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log(`File ${filename} changed. Rebuilding...`);
                build();
            }, 100);
        }
    });
} else {
    build();
}
