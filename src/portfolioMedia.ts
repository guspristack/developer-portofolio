import portrait from './images/portrait-ilham.webp';

export type SocialLink = { platform: 'instagram' | 'linkedin' | 'github'; url?: string };
export type PortfolioMedia = { portrait: string; socials: readonly SocialLink[] };

export const portfolioMedia = {
  ilham: { portrait, socials: [{ platform: 'instagram' }, { platform: 'linkedin' }, { platform: 'github' }] },
} satisfies Record<string, PortfolioMedia>;
