import { portfolioMedia, type PortfolioMedia } from './portfolioMedia';

export type PortfolioProfile = {
  id: string;
  name: string;
  profession: string;
  location: string;
  bio: string;
  specialty: string;
  contactFor: string;
  media: PortfolioMedia;
  experience: ReadonlyArray<{ period: string; title: string; description: string }>;
};

export const profiles = {
  ilham: {
    id: 'ilham',
    media: portfolioMedia.ilham,
    name: 'Ilham Rasyid',
    profession: 'Creative front-end developer',
    location: 'Bandung, Indonesia',
    bio: 'Saya membangun antarmuka interaktif dengan React dan CSS. Saya senang membuat contoh kecil yang memperjelas hubungan antara keputusan desain, keadaan komponen, dan kode.',
    specialty: 'React, TypeScript, CSS, dan navigasi keyboard',
    contactFor: 'Untuk prototipe interaktif, pengembangan front-end, dan kolaborasi komponen web.',
    experience: [
      { period: 'Apr–Okt 2026', title: 'Playground front-end · Proyek mandiri', description: 'Membangun dua demo untuk mendokumentasikan perubahan tema dan cara state memengaruhi daftar tugas.' },
      { period: 'Agu–Des 2025', title: 'Eksplorasi komponen web', description: 'Membuat komponen responsif dan memeriksa keadaan fokus, kosong, dan aktif.' },
    ],
  },
} satisfies Record<string, PortfolioProfile>;
