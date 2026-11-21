# Ilham Rasyid · Portofolio Developer

Proyek fullstack terpisah untuk Ilham Rasyid, persona fiktif dari Ruang Karya. Tampilan publik mempertahankan gaya gelap, Space Grotesk, potret generatif, serta demo palet warna dan filter tugas dari galeri.

## Portofolio publik

- Pilih proyek untuk melihat studi singkat, kredit, tautan, demo, dan stack teknologi yang terkait.
- Ganti warna aksen untuk melihat pratinjau dan cuplikan CSS berubah. Centang tugas, saring berdasarkan status, atau atur ulang demonstrasi.
- Tautan demo dapat disalin dan dibuka langsung. Interaksi pengunjung berlaku selama demo dibuka di browser.

## Studio admin

- Kelola proyek, ringkasan, uraian implementasi dan hasil, tautan repositori, urutan, serta draf dan publikasi.
- Buat dan sunting konfigurasi demo palet warna atau filter tugas. Coba pratinjau sebelum menyimpan. Warna pertama menjadi warna awal.
- Kelola katalog teknologi, kategori, penggunaan, dan tautan dokumentasi. Hubungkan teknologi dan demo ke proyek dari editor proyek.
- Perubahan pada demo atau teknologi berlaku untuk semua proyek terkait yang sudah terbit. Lepaskan item dari proyek sebelum menghapusnya.

Frontend memakai React, TypeScript, Vite, dan CSS Modules. Express menyediakan API. PostgreSQL dan Prisma menyimpan proyek, demo, teknologi, akun admin, dan sesi.

## Menjalankan secara lokal

Siapkan Node.js 24 dan PostgreSQL, lalu buat database. Salin `.env.example` menjadi `.env`. Isi `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD` dengan kata sandi minimal 16 karakter. Perintah pertama menghasilkan nilai acak untuk `SESSION_SECRET`.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm ci
npm run db:migrate
npm run db:seed
npm run admin:provision
npm run dev
```

Buka [portofolio](http://127.0.0.1:5183/) atau [studio admin](http://127.0.0.1:5183/admin). Untuk menjalankan hasil build, atur `APP_ORIGIN=http://127.0.0.1:4183`, jalankan `npm run build` lalu `npm start`.

## Kredit

Pengembangan oleh [guspriaman](https://github.com/guspriaman) untuk [guspriStack](https://github.com/guspristack). Desain asli, profil fiktif, dan gambar generatif berasal dari prototipe Ruang Karya.
