import { z } from 'zod';

const name = z.string().trim().min(1).max(100);
const brief = z.string().trim().min(1).max(500);
const paragraph = z.string().trim().max(3000);
const webUrl = z.string().trim().max(500).pipe(z.union([z.literal(''), z.url({ protocol: /^https?$/ })]));
const id = z.number().int().positive().max(2147483647);
const uniqueIds = z.array(id).max(12).refine((values) => new Set(values).size === values.length, 'Pilihan tidak boleh ganda.');

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(256),
});
export const revision = id;
export const slugSchema = z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Gunakan huruf kecil, angka, dan tanda hubung.');
export const projectSchema = z.strictObject({
  title: name, category: name, summary: brief, challenge: paragraph, approach: paragraph, outcome: paragraph,
  credit: z.string().trim().max(500), repository: webUrl, liveUrl: webUrl,
  published: z.boolean(), position: z.number().int().min(0).max(999),
  demoIds: uniqueIds, technologyIds: uniqueIds,
});
export const technologySchema = z.strictObject({
  name, category: name, description: brief, docsUrl: webUrl,
});
const swatch = z.strictObject({
  name: z.string().trim().min(1).max(35),
  hex: z.string().regex(/^#[a-fA-F0-9]{6}$/, 'Gunakan kode warna #RRGGBB.').transform((value) => value.toUpperCase()),
});
const task = z.strictObject({ label: z.string().trim().min(1).max(100), done: z.boolean() });

export const configurationSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('palette'), colors: z.array(swatch).min(2).max(6) }),
  z.strictObject({ kind: z.literal('tasks'), tasks: z.array(task).min(1).max(10) }),
]).refine((data) => {
  const labels = data.kind === 'palette' ? data.colors.map((color) => color.name) : data.tasks.map((item) => item.label);
  return new Set(labels.map((label) => label.toLowerCase())).size === labels.length;
}, 'Nama warna atau tugas tidak boleh ganda.');

export const demoSchema = z.strictObject({ title: name, description: brief, credit: brief, configuration: configurationSchema });

export type ProjectInput = z.infer<typeof projectSchema>;
export type DemoInput = z.infer<typeof demoSchema>;
export type TechnologyInput = z.infer<typeof technologySchema>;
export type DemoConfiguration = z.infer<typeof configurationSchema>;
export type Project = ProjectInput & { id: number; revision: number; slug: string };
export type Demo = DemoInput & { id: number; revision: number; slug: string; projectCount: number };
export type Technology = TechnologyInput & { id: number; revision: number; projectCount: number };
export type PublicDemo = DemoInput & { slug: string };
export type PublicProject = Omit<ProjectInput, 'published' | 'position' | 'demoIds' | 'technologyIds'> & {
  slug: string; demos: PublicDemo[]; technologies: TechnologyInput[];
};
