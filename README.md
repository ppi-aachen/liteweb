# Panduan IT Admin — Website PPI Aachen

> **PENTING UNTUK ADMIN BERIKUTNYA:** Dokumen ini adalah panduan teknis utama untuk siapa saja yang mengelola website PPI Aachen. Siapapun Anda, baik yang baru belajar pemrograman maupun yang sudah berpengalaman, panduan ini dirancang agar mudah dipahami. Website ini dirancang agar dapat diperbarui dengan mudah tanpa harus menyentuh kode pemrograman, tetapi juga menyediakan akses penuh jika Anda ingin memodifikasinya secara manual.

---

## Daftar Isi

1. [Gambaran Umum & Cara Kerja Sistem](#1-gambaran-umum--cara-kerja-sistem)
2. [Struktur Folder Repositori](#2-struktur-folder-repositori)
3. [Metode 1: Mengedit Konten lewat Decap CMS (Direkomendasikan)](#3-metode-1-mengedit-konten-lewat-decap-cms-direkomendasikan)
4. [Metode 2: Mengedit Konten secara Manual (Mode Developer)](#4-metode-2-mengedit-konten-secara-manual-mode-developer)
5. [Menjalankan Website di Komputer Lokal (Development)](#5-menjalankan-website-di-komputer-lokal-development)
6. [Panduan Khusus: Gambar & Slideshow (Carousel)](#6-panduan-khusus-gambar--slideshow-carousel)
7. [Cara Kerja Sistem Kompilasi (Build Pipeline)](#7-cara-kerja-sistem-kompilasi-build-pipeline)
8. [Infrastruktur Hosting & Deployment](#8-infrastruktur-hosting--deployment)
9. [Panduan Menambahkan Halaman Baru](#9-panduan-menambahkan-halaman-baru)
10. [Pemecahan Masalah (Troubleshooting)](#10-pemecahan-masalah-troubleshooting)
11. [Checklist Akses & Akun untuk Serah Terima (Handover)](#11-checklist-akses--akun-untuk-serah-terima-handover)

---

## 1. Gambaran Umum & Cara Kerja Sistem

Website PPI Aachen adalah **website HTML statis**. Ini berarti tidak ada server database (seperti MySQL) atau bahasa pemrograman aktif (seperti PHP/Node.js) yang berjalan saat pengunjung membuka website. Semua halaman dikompilasi menjadi file HTML biasa yang sangat cepat dibuka dan aman dari serangan hacker.

### Skema Alur Kerja Sistem

```
┌────────────────────────────────────────────────────────┐
│                    Editor Konten                       │
│  (Mengedit lewat Decap CMS ATAU edit file JSON manual) │
└───────────────────────────┬────────────────────────────┘
                            │ Menyimpan & kirim data
                            ▼
┌────────────────────────────────────────────────────────┐
│                  GitHub Repository                     │
│         Tempat menyimpan kode & data konten            │
└───────────────────────────┬────────────────────────────┘
                            │ Memicu build otomatis
                            ▼
┌────────────────────────────────────────────────────────┐
│                Cloudflare Pages (Build)                │
│       Menjalankan perintah: npm run build              │
│  Mengubah data JSON & template menjadi file HTML jadi  │
└───────────────────────────┬────────────────────────────┘
                            │ Mempublikasikan file
                            ▼
┌────────────────────────────────────────────────────────┐
│           Website Live (cf.ppiaachen.de)               │
│         Diakses oleh pengunjung dengan cepat           │
└────────────────────────────────────────────────────────┘
```

**Aturan Emas:** Anda tidak pernah mengedit file HTML jadi (seperti `index.html` atau `events.html`) secara langsung di server. Anda hanya mengubah data kontennya (format JSON), lalu sistem Cloudflare akan otomatis membuat ulang file HTML-nya dalam waktu 1-2 menit.

---

## 2. Struktur Folder Repositori

Berikut adalah folder dan file penting yang perlu Anda ketahui:

```
liteweb/
│
├── admin/                      # Pengaturan Decap CMS
│   ├── index.html              # Halaman masuk panel admin
│   └── config.yml              # Konfigurasi kolom input CMS
│
├── assets/
│   └── carousel/               # Gambar slideshow halaman utama (Harus format .png)
│
├── content/
│   └── pages/                  # ⭐ TEMPAT DATA TEKS & KONTEN WEBSITE
│       ├── home.json           # Data halaman utama
│       ├── events.json         # Data acara (events)
│       ├── kepengurusan.json   # Struktur & anggota kabinet aktif
│       └── ... (file .json lainnya untuk setiap halaman)
│
├── images/                     # Folder gambar konten website (terbagi per halaman)
│   ├── home/                   # Gambar khusus halaman utama
│   ├── events/                 # Gambar untuk pamflet acara
│   └── ... (folder gambar lainnya)
│
├── functions/
│   └── api/                    # Kode serverless untuk login CMS via GitHub
│
├── css/
│   └── styles.css              # ⚠️ DIBUAT OTOMATIS — Jangan diedit manual!
│
├── src/
│   └── index.css               # Desain utama Tailwind CSS (Edit di sini jika ingin mengubah style)
│
├── build-static.js             # ⭐ Mesin kompilator — mengubah JSON menjadi HTML
├── package.json                # Daftar dependensi & perintah build
│
│   # ---- File HTML Jadi (Dibuat otomatis oleh build-static.js) ----
├── index.html
├── events.html
└── ... (file .html lainnya)
```

---

## 3. Metode 1: Mengedit Konten lewat Decap CMS (Direkomendasikan)

Decap CMS adalah aplikasi admin visual. Ini adalah cara termudah untuk mengubah konten teks dan gambar tanpa perlu menyentuh kode komputer.

### Cara Mengakses Panel Admin
1. Buka tautan: **https://cf.ppiaachen.de/admin/**
2. Klik tombol **"Login with GitHub"**.
3. Masuk dengan akun GitHub Anda. Akun GitHub Anda **harus terdaftar** sebagai kolaborator dengan hak akses tulis (write access) pada repositori `ppi-aachen/liteweb`.

### Struktur Konten di CMS
Di menu sebelah kiri, konten dibagi menjadi dua kelompok:
*   **Active Pages (Halaman Aktif)**: Halaman yang sering berubah (seperti daftar acara, anggota kepengurusan, arsip LPJ, arsip pengurus terdahulu).
*   **Passive Pages (Halaman Pasif)**: Halaman yang jarang berubah (seperti Halaman Utama, Sejarah, AD/ART, Kontak, Merchandise, dll).

### Cara Mengedit & Mengunggah Gambar
1. Pilih halaman yang ingin diubah dari menu kiri.
2. Edit kolom teks yang disediakan. Untuk kolom teks panjang, Anda bisa menggunakan format **Markdown** (tebal, miring, daftar poin, link) lewat editor visual yang tersedia.
3. Untuk mengubah gambar, klik area gambar untuk membuka **Media Library**.
    *   **Catatan Penting:** Media Library di CMS ini dikonfigurasi secara pintar untuk membuka folder yang relevan secara otomatis. Jika Anda mengedit halaman *Events*, Anda hanya akan melihat gambar-gambar pamflet acara. Jika mengedit *Kepengurusan*, Anda hanya melihat foto pengurus. Ini bertujuan agar folder gambar tetap rapi.
4. Jika sudah selesai, klik tombol **Save** di bagian atas.

### Apa yang Terjadi setelah Klik Save?
1. Decap CMS akan otomatis membuat *commit* (perubahan) ke repositori GitHub secara instan di latar belakang.
2. Cloudflare Pages akan mendeteksi perubahan tersebut dan langsung memulai proses *build* (kompilasi).
3. Dalam waktu kurang lebih 2 menit, perubahan Anda akan langsung muncul di website live. Anda tidak perlu melakukan apa-apa lagi!

---

## 4. Metode 2: Mengedit Konten secara Manual (Mode Developer)

Jika Anda ingin memperbarui data dalam jumlah banyak secara cepat atau ingin memodifikasi struktur data yang tidak didukung oleh tampilan CMS, Anda bisa mengedit file JSON secara langsung.

### Langkah-langkah Mengedit Manual:

1.  **Temukan file data:**
    Semua konten teks tersimpan di folder `content/pages/` dalam format `.json`. Buka file sesuai dengan halaman yang ingin Anda ubah, misalnya:
    *   `content/pages/events.json` (Halaman Acara)
    *   `content/pages/home.json` (Halaman Utama)
2.  **Edit File JSON:**
    Pastikan format JSON tetap valid (tidak ada koma yang hilang, kurung kurawal tertutup dengan benar).
    *   Untuk teks biasa, ubah teks di dalam tanda kutip.
    *   Untuk kolom bertipe markdown/HTML, Anda bisa menulis teks biasa, sintaks Markdown standar (seperti `**tebal**` atau `[Teks Link](https://link.com)`), atau kode HTML langsung. Sistem akan mendeteksinya secara otomatis.
    *   Untuk gambar, tulis alamat gambar relatif dari root proyek, contoh: `/images/events/pamflet-acara.jpg`.
3.  **Lakukan Kompilasi (Build) Lokal:**
    Setelah file JSON disimpan, jalankan perintah ini di terminal komputer Anda untuk membuat file HTML baru:
    ```bash
    npm run build
    ```
4.  **Kirim Perubahan ke GitHub:**
    ```bash
    git add .
    git commit -m "update: memperbarui konten halaman acara"
    git push origin main
    ```
    Setelah di-push, Cloudflare akan otomatis meng-update website online dalam 1-2 menit.

---

## 5. Menjalankan Website di Komputer Lokal (Development)

Untuk menguji perubahan kode atau melihat tampilan website di komputer Anda sendiri sebelum dipublikasikan:

### Persiapan Pertama Kali:
1.  Unduh dan instal **Node.js** (versi 18 ke atas) di komputer Anda.
2.  Buka terminal/command prompt di dalam folder proyek ini, lalu jalankan:
    ```bash
    npm install
    ```

### Menjalankan Server Lokal:
Jalankan perintah berikut:
```bash
npm run dev
```
Perintah ini akan:
*   Membangun file HTML & CSS versi lokal.
*   Memantau perubahan CSS (Tailwind) secara otomatis.
*   Membuka server lokal. Buka browser Anda dan kunjungi: **`http://localhost:3000`**

### Menjalankan Decap CMS secara Lokal:
Jika Anda ingin menguji panel admin CMS di komputer lokal tanpa harus terhubung ke internet:
1.  Buka terminal baru, jalankan:
    ```bash
    npx decap-cms-proxy-server
    ```
2.  Di terminal utama, tetap jalankan `npm run dev`.
3.  Buka browser ke alamat: **`http://localhost:3000/admin/`**
4.  Setiap data yang Anda simpan di CMS lokal ini akan langsung mengubah file JSON di komputer Anda secara otomatis.

---

## 6. Panduan Khusus: Gambar & Slideshow (Carousel)

### Mengelola Slideshow / Carousel di Halaman Utama
Slideshow besar di halaman utama bekerja secara otomatis dengan membaca folder `assets/carousel/`.

*   **Format File:** Semua foto slideshow **wajib** menggunakan format `.png`. File dengan format lain (seperti `.jpg` atau `.webp`) akan diabaikan oleh sistem.
*   **Urutan Gambar:** Slideshow menampilkan gambar berdasarkan urutan nama file (alfabet/angka). Contoh penamaan terbaik:
    *   `1.png` (Slide pertama)
    *   `2.png` (Slide kedua)
    *   `3.png` (Slide ketiga)
*   **Cara Memperbarui:** Cukup hapus atau tambah file baru di folder `assets/carousel/`, lalu jalankan `npm run build` dan push perubahan ke GitHub.

### Folder Penyimpanan Gambar Konten
Untuk menjaga kerapian, pastikan gambar diletakkan di subfolder yang tepat di dalam folder `images/`:

| Nama Folder | Digunakan Untuk |
|---|---|
| `images/home/` | Gambar di halaman utama (About Us, Sejarah Singkat, Peta Wilayah) |
| `images/events/` | Pamflet acara di halaman Events |
| `images/communities/` | Foto profil komunitas di halaman Communities |
| `images/pengurus/` | Foto kabinet di halaman Arsip Pengurus |
| `images/kontak-email/` | Foto profil staf di halaman Kontak |
| `images/press-kit/` | Gambar logo PPI Aachen di halaman Press Kit |

---

## 7. Cara Kerja Sistem Kompilasi (Build Pipeline)

Sistem kompilasi website ini sangat ringan dan tidak bergantung pada framework besar seperti Next.js atau React. Semuanya dijalankan oleh sebuah skrip Node.js sederhana bernama **`build-static.js`**.

### Proses yang terjadi saat perintah `npm run build` dijalankan:
1.  **Membaca Data:** Skrip membaca setiap file JSON dari `content/pages/`.
2.  **Kompilasi Markdown ke HTML:** Skrip memiliki fungsi parser internal (`renderMarkdown`) yang mendeteksi teks bergaya markdown dan menerjemahkannya menjadi elemen HTML. Jika teks tersebut sudah berupa HTML, skrip akan melewatkannya tanpa mengubahnya (kompatibilitas mundur).
3.  **Penyusunan Halaman (Template Layout):** Skrip menggabungkan konten halaman tersebut dengan struktur layout utama (navigasi atas, menu mobile, header, dan footer) yang seragam untuk seluruh website.
4.  **Menulis File HTML:** Skrip menghasilkan file HTML mentah di folder root (seperti `index.html`, `events.html`, dsb).
5.  **Kompilasi CSS:** Compiler Tailwind CSS dijalankan untuk memindai seluruh file HTML yang baru dibuat, mendeteksi class CSS yang digunakan, dan mengompilasinya menjadi satu file CSS yang sangat kecil dan optimal di `css/styles.css`.

---

## 8. Infrastruktur Hosting & Deployment

Website ini menggunakan arsitektur modern berbasis cloud yang sangat andal dan gratis:

1.  **GitHub (Penyimpanan Utama):** Semua kode sumber, data JSON, dan gambar disimpan dengan aman di repositori GitHub `ppi-aachen/liteweb`.
2.  **Cloudflare Pages (Hosting & Serverless):** Cloudflare memantau repositori GitHub. Setiap kali ada perubahan di branch `main` (baik karena Anda push manual atau karena disimpan lewat Decap CMS), Cloudflare akan otomatis menjalankan server build-nya untuk merakit ulang website.
3.  **Cloudflare Functions (Login CMS):** Folder `functions/api/` berisi kode serverless yang berjalan di jaringan cloud Cloudflare. Kode ini digunakan untuk memproses proses login aman (OAuth) dari Decap CMS ke GitHub agar admin tidak perlu memasukkan password repositori secara langsung.
4.  **DNS & Domain:** Domain `ppiaachen.de` diarahkan melalui Cloudflare DNS. Subdomain `cf.ppiaachen.de` dikonfigurasikan khusus untuk mengarah ke Cloudflare Pages ini.

---

## 9. Panduan Menambahkan Halaman Baru

Jika suatu saat PPI Aachen membutuhkan halaman baru (misalnya halaman khusus pemilu atau divisi baru), berikut adalah langkah-langkah teknisnya:

1.  **Buat File Data Baru:**
    Buat file JSON baru di `content/pages/nama-halaman.json`. Anda bisa menyalin struktur data dari file JSON yang sudah ada.
2.  **Daftarkan di Skrip Build (`build-static.js`):**
    Buka `build-static.js`. Di bagian bawah file, buat fungsi compiler baru untuk halaman Anda (contoh menggunakan fungsi `compileIframePage` jika hanya menampilkan iframe, atau buat fungsi kustom). Panggil fungsi tersebut di bagian paling akhir skrip tempat halaman lain dikompilasi.
3.  **Tambahkan ke Menu Navigasi:**
    Buka `build-static.js`, temukan array `navigationItems` di bagian paling atas. Tambahkan link halaman baru Anda di sana agar muncul di menu navigasi atas dan menu mobile.
4.  **Daftarkan ke Decap CMS:**
    Buka `admin/config.yml`. Tambahkan konfigurasi halaman baru Anda di bawah bagian `collections` agar halaman tersebut bisa diedit secara visual oleh admin non-teknis.
5.  **Uji dan Publikasikan:**
    Jalankan `npm run build` secara lokal untuk memastikan tidak ada error, periksa tampilannya, lalu commit dan push ke GitHub.

---

## 10. Pemecahan Masalah (Troubleshooting)

### Perubahan Konten Tidak Muncul di Website Online
*   **Tunggu 2 menit:** Proses build otomatis Cloudflare membutuhkan waktu sekitar 1-2 menit setelah Anda menekan tombol Save di CMS.
*   **Periksa Dashboard Cloudflare:** Masuk ke akun Cloudflare Pages PPI Aachen, lihat menu "Deployments". Jika statusnya "Failed" (Gagal), periksa log error-nya. Biasanya disebabkan karena penulisan format JSON yang salah saat diedit manual.

### Error "JSON Parse Error" Saat Build Lokal
*   Ada kesalahan pengetikan pada salah satu file JSON di `content/pages/`. Biasanya karena koma yang hilang, koma berlebih di akhir baris, atau tanda kutip/kurung yang tidak ditutup. Buka folder proyek di VS Code, folder tersebut akan menandai file yang error dengan garis bawah merah.

### Tombol Login CMS Tidak Berfungsi / Error Auth
*   Periksa apakah nilai `GITHUB_CLIENT_ID` dan `GITHUB_CLIENT_SECRET` sudah terpasang dengan benar di pengaturan Environment Variables pada dashboard Cloudflare Pages.
*   Pastikan aplikasi OAuth di GitHub Developer Settings memiliki Callback URL yang tepat, yaitu: `https://cf.ppiaachen.de/api/callback`.

---

## 11. Checklist Akses & Akun untuk Serah Terima (Handover)

Saat masa jabatan Anda berakhir dan Anda harus menyerahkan tanggung jawab kepada IT Admin berikutnya, pastikan Anda menyerahkan akses ke akun-akun berikut:

*   [ ] **Akses Repositori GitHub:** Masuk ke pengaturan repositori `ppi-aachen/liteweb` -> Collaborators, lalu undang akun GitHub admin baru sebagai kolaborator dengan akses Write/Admin.
*   [ ] **Akun Cloudflare PPI Aachen:** Berikan kredensial login akun Cloudflare organisasi yang mengelola Pages, DNS Domain `ppiaachen.de`, dan OAuth Functions.
*   [ ] **Akses Pengelola Domain (Domain Registrar):** Jika domain dibeli di luar Cloudflare (misalnya di Niagahoster, Domainesia, GoDaddy, dsb), berikan detail akun pengelola domain tersebut.
*   [ ] **Email Utama Organisasi (`info@ppiaachen.de`):** Pastikan admin baru memiliki akses ke inbox email ini karena sering digunakan untuk verifikasi keamanan dan pemulihan password akun-akun di atas.
*   [ ] **Akses Akun GitHub Developer / OAuth App:** Tunjukkan letak pengaturan aplikasi OAuth GitHub yang terdaftar di bawah organisasi PPI Aachen untuk keperluan integrasi CMS.

---
*Dokumen ini diperbarui terakhir kali pada Juni 2026 oleh Darrell Octavianus.
