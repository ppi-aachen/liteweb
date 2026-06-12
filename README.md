# Website Statis PPI Aachen

Ini adalah website statis **PPI Aachen** yang dibuat dengan HTML murni, Tailwind CSS, dan Vanilla JavaScript, serta dikompilasi menggunakan generator situs statis berbasis Node.js yang ringan.

---

## 🚀 Memulai

### Pengembangan Lokal (Local Development)
Untuk menjalankan website di komputer lokal Anda:
1. Instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan server lokal dan compiler Tailwind dalam mode watch (pemantauan otomatis):
   ```bash
   npm run dev
   ```
3. Buka `http://localhost:3000` di peramban (browser) Anda.

### Kompilasi untuk Produksi (Build)
Untuk mengompilasi halaman statis dan memperkecil (minify) ukuran CSS:
```bash
npm run build
```
Halaman HTML hasil kompilasi (seperti `index.html`, `events.html`) akan langsung disimpan di direktori utama (root).

---

## 📝 Mengelola Konten

Ada dua cara untuk memperbarui dan mengelola konten (seperti acara, anggota kabinet, arsip ketua, dan tautan LPJ) di website ini:

### Opsi A: GUI yang Ramah Pengguna (Decap CMS) — *Direkomendasikan*
Anda dapat mengelola konten secara visual melalui antarmuka admin tanpa perlu menulis kode.

1. **Mengakses Halaman Admin:**
   - Buka domain produksi Anda: `https://cf.ppiaachen.de/admin/` (atau URL pratinjau Cloudflare Pages Anda + `/admin/`).
   - Klik **Login with GitHub** dan masuk menggunakan akun tim yang terdaftar.
2. **Mengedit Konten:**
   - Pilih menu koleksi di bilah samping (misalnya, **Events**, **Kepengurusan**, **Arsip LPJ**, **Arsip Pengurus**).
   - Ubah kolom yang tersedia, tambahkan item baru, atau unggah gambar langsung melalui GUI.
3. **Menerbitkan Konten:**
   - Klik **Save** (Simpan). Decap CMS akan secara otomatis melakukan commit perubahan kembali ke repositori GitHub Anda, yang kemudian akan memicu Cloudflare Pages untuk membangun (build) dan menyebarkan (deploy) website secara otomatis.

> 💡 **Menguji CMS Secara Lokal:** Anda dapat menguji antarmuka admin di komputer lokal tanpa perlu login.
> 1. Jalankan server proxy CMS lokal: `npx decap-cms-proxy-server`
> 2. Jalankan server pengembangan: `npm run dev`
> 3. Buka `http://localhost:3000/admin/`. Setiap perubahan yang Anda simpan di sini akan langsung ditulis ke file lokal Anda.

---

### Opsi B: Mengedit File Secara Langsung (Mode Developer)
Jika Anda lebih terbiasa dengan kode, Anda dapat mengedit file data mentah secara langsung.

1. **Cari File Data:**
   - Buka direktori `content/pages/`.
   - Buka file `.json` yang sesuai dengan halaman yang ingin Anda perbarui (misalnya, `content/pages/events.json`).
2. **Edit JSON:**
   - Ubah atau tambahkan data langsung di dalam file JSON tersebut. Pastikan format JSON tetap valid.
3. **Kompilasi & Sinkronisasi:**
   - Jalankan perintah build:
     ```bash
     npm run build
     ```
   - Perintah ini secara otomatis mengompilasi file HTML *dan* memperbarui/membuat ulang file skrip data `.js` (misalnya `content/pages/events.js`) yang digunakan oleh sisi klien agar tetap sinkron.
4. **Kirim ke Produksi:**
   - Lakukan commit dan push perubahan Anda ke GitHub:
     ```bash
     git add .
     git commit -m "update: modify events page content"
     git push origin main
     ```

---

## 🎠 Memperbarui Gambar Carousel di Halaman Utama

Slideshow di halaman utama secara otomatis memindai dan memuat gambar yang ada di folder assets.

1. **Tambahkan Gambar:**
   - Letakkan gambar slide baru Anda di direktori `assets/carousel/`.
   - **Penting:** Format gambar harus berupa `.png`.
2. **Urutan Slide:**
   - Slideshow memuat dan menampilkan gambar sesuai **urutan alfabetis/numerik** dari nama file.
   - Beri nama file Anda sesuai urutan yang diinginkan (misalnya, `1.png`, `2.png`, `3.png`, dst.).
3. **Kompilasi Ulang:**
   - Jalankan kembali perintah build untuk memperbarui kode slideshow halaman utama:
     ```bash
     npm run build
     ```
   - Push file yang telah diperbarui ke GitHub.
