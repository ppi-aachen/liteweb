import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');

// Clear and recreate dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

const itemsToCopy = [
    'admin',
    'assets',
    'content',
    'css',
    'images',
    'js',
    'organization',
    'others',
    'logo.png',
    'favicon.png',
    'hero.png',
    'hero-dark.png',
    'hero-bright.png',
    'og-image.png'
];

for (const item of itemsToCopy) {
    if (fs.existsSync(item)) {
        fs.cpSync(item, path.join(distDir, item), { recursive: true });
    }
}

// Copy all root HTML files
const rootFiles = fs.readdirSync('.');
for (const file of rootFiles) {
    if (file.endsWith('.html')) {
        fs.copyFileSync(file, path.join(distDir, file));
    }
}

console.log('Build output successfully populated into dist/');
