import { disconnectDatabase, prisma } from '../server/database';
import type { DemoInput, TechnologyInput } from '../shared/content';

const examples: (DemoInput & { slug: string })[] = [
  {
    slug: 'tema', title: 'Tema', description: 'Pilihan warna di state React mengubah variabel CSS kartu dan cuplikan kode secara bersamaan.',
    credit: 'Ilham Rasyid · Desain palet dan implementasi variabel warna',
    configuration: { kind: 'palette', colors: [
      { name: 'Iris', hex: '#6654D1' }, { name: 'Hutan', hex: '#128166' }, { name: 'Bara', hex: '#AC4831' },
    ] },
  },
  {
    slug: 'tugas', title: 'Filter tugas', description: 'Daftar dihitung dari status tugas dan filter aktif. Saat sebuah tugas keluar dari daftar, fokus berpindah ke tombol filter aktif.',
    credit: 'Ilham Rasyid · Implementasi status tugas, filter, dan fokus keyboard',
    configuration: { kind: 'tasks', tasks: [
      { label: 'Susun struktur halaman', done: true },
      { label: 'Periksa tampilan ponsel', done: false },
      { label: 'Uji navigasi keyboard', done: false },
    ] },
  },
];

const technologies: TechnologyInput[] = [
  { name: 'React', category: 'Antarmuka', description: 'State komponen dan interaksi kedua demo.', docsUrl: 'https://react.dev/' },
  { name: 'TypeScript', category: 'Bahasa', description: 'Tipe data demo, proyek, dan kontrak API.', docsUrl: 'https://www.typescriptlang.org/docs/' },
  { name: 'CSS Modules', category: 'Tampilan', description: 'Gaya komponen dan variabel aksen untuk pratinjau tema.', docsUrl: 'https://github.com/css-modules/css-modules' },
  { name: 'Vite', category: 'Build', description: 'Server pengembangan dan build aset frontend.', docsUrl: 'https://vite.dev/guide/' },
];

try {
  await prisma.$transaction(async (db) => {
    if (await db.project.findUnique({ where: { slug: 'playground-frontend' }, select: { id: true } })) return;
    await db.project.create({
      data: {
        slug: 'playground-frontend', title: 'Playground front-end', category: 'Komponen interaktif',
        summary: 'Dua komponen kecil untuk memperlihatkan hubungan antara state, tampilan, dan kode.',
        challenge: 'Bagaimana pengguna melihat dampak dari perubahan warna dan status langsung pada antarmuka?',
        approach: 'Kelola pilihan tema dan status tugas sebagai state React. Uji navigasi keyboard, kondisi daftar kosong, dan pengaturan ulang.',
        outcome: 'Pratinjau warna mengikuti pilihan palet. Daftar tugas mendukung filter aktif dan selesai serta memperbarui hitungan saat status berubah.',
        credit: 'Ilham Rasyid · Desain interaksi dan pengembangan front-end',
        liveUrl: '', repository: 'https://github.com/guspristack/developer-portofolio', position: 0, published: true,
        demos: { create: examples.map((item, position) => ({
          position, demo: { connectOrCreate: { where: { slug: item.slug }, create: item } },
        })) },
        technologies: { create: technologies.map((item, position) => ({
          position, technology: { connectOrCreate: { where: { name: item.name }, create: item } },
        })) },
      },
    });
  });
  console.log('Playground contoh Ilham tersedia.');
} finally {
  await disconnectDatabase();
}
