import { Code2, ListTodo, Plus, Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { api } from '../api';
import { configurationSchema, type Demo, type DemoConfiguration, type DemoInput, type Project, type ProjectInput, type Technology, type TechnologyInput } from '../../shared/content';
import { DemoWidget } from './Playground';
import styles from './Admin.module.css';
import portfolio from './DeveloperDemo.module.css';

export type Save = (task: () => Promise<unknown>, message: string, onSaved?: () => void) => Promise<void>;
export type FormProps<T> = { item?: T; busy: boolean; save: Save; select: (id: number) => void; close: () => void };
const field = (values: FormData, key: string) => String(values.get(key) ?? '');

function slugField(value?: string) {
  return <label>Alamat singkat<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={2} maxLength={80} readOnly={!!value} required defaultValue={value} placeholder="contoh-proyek" /></label>;
}

function ParagraphField({ label, name, value, required = false, maxLength = 500 }: {
  label: string; name: string; value?: string; required?: boolean; maxLength?: number;
}) {
  const id = useId();
  return <div className={styles.paragraphField}>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} name={name} defaultValue={value} rows={3} required={required} maxLength={maxLength} />
  </div>;
}

function Controls({ children, busy, onSubmit, title }: { children: ReactNode; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; title: string }) {
  return <section className={styles.editor} aria-label={title}><form onSubmit={onSubmit}>
    <fieldset className={styles.fields} disabled={busy}>{children}</fieldset>
  </form></section>;
}

const narratives = [['challenge', 'Tantangan'], ['approach', 'Implementasi'], ['outcome', 'Hasil']] as const;

export function ProjectForm({ item, demos, technologies, busy, save, select, close }: FormProps<Project> & { demos: Demo[]; technologies: Technology[] }) {
  const base = '/admin/projects';
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const published = submitter instanceof HTMLButtonElement ? submitter.value === 'published' : item?.published ?? false;
    const data: ProjectInput = {
      title: field(values, 'title'), category: field(values, 'category'), summary: field(values, 'summary'),
      challenge: field(values, 'challenge'), approach: field(values, 'approach'), outcome: field(values, 'outcome'),
      credit: field(values, 'credit'), repository: field(values, 'repository'), liveUrl: field(values, 'liveUrl'),
      position: Number(field(values, 'position')), published,
      demoIds: values.getAll('demoIds').map(Number), technologyIds: values.getAll('technologyIds').map(Number),
    };
    void save(async () => {
      if (item) await api(base + '/' + item.id, { method: 'PUT', data: { ...data, revision: item.revision } });
      else select((await api<Project>(base, { method: 'POST', data: { ...data, slug: field(values, 'slug') } })).id);
    }, published ? 'Proyek diterbitkan.' : 'Draf proyek disimpan.');
  }
  return <Controls onSubmit={submit} busy={busy} title="Isi proyek">
    <div className={styles.columns}>
      <label>Judul proyek<input name="title" required maxLength={100} defaultValue={item?.title} /></label>
      <label>Kategori proyek<input name="category" required maxLength={100} defaultValue={item?.category} /></label>
      {slugField(item?.slug)}
      <label>Urutan tampil<input name="position" type="number" min={0} max={999} required defaultValue={item?.position ?? 0} /></label>
    </div>
    <ParagraphField label="Ringkasan" name="summary" value={item?.summary} required />
    {narratives.map(([name, label]) => <ParagraphField key={name} label={label} name={name} value={item?.[name]} maxLength={3000} />)}
    <div className={styles.columns}>
      <label>URL repositori<input name="repository" type="url" maxLength={500} defaultValue={item?.repository} /></label>
      <label>URL situs proyek<input name="liveUrl" type="url" maxLength={500} defaultValue={item?.liveUrl} /></label>
    </div>
    <label>Kredit dan peran<input name="credit" maxLength={500} defaultValue={item?.credit} /></label>
    <div className={styles.columns}>
      <fieldset className={styles.choices}><legend>Demo interaktif</legend>
        {demos.length ? demos.map((itemDemo) => <label key={itemDemo.id} className={styles.checkbox}>
          <input type="checkbox" name="demoIds" value={itemDemo.id} defaultChecked={item?.demoIds.includes(itemDemo.id)} /> {itemDemo.title}
        </label>) : <p className={styles.meta}>Tambahkan demo dari tab Demo interaktif.</p>}
      </fieldset>
      <fieldset className={styles.choices}><legend>Stack teknologi</legend>
        {technologies.length ? technologies.map((tool) => <label key={tool.id} className={styles.checkbox}>
          <input type="checkbox" name="technologyIds" value={tool.id} defaultChecked={item?.technologyIds.includes(tool.id)} /> {tool.name}
        </label>) : <p className={styles.meta}>Tambahkan teknologi dari tab Stack teknologi.</p>}
      </fieldset>
    </div>
    <div className={styles.actions}>
      {item?.published && <button className={styles.primary} value="published">Simpan perubahan</button>}
      <button className={item?.published ? styles.secondary : styles.primary} value="draft">{item?.published ? 'Jadikan draf' : 'Simpan draf'}</button>
      {!item?.published && <button className={styles.secondary} value="published">Terbitkan proyek</button>}
      {item?.published && <Link className={styles.secondary} to={'/?proyek=' + item.slug + '#ilham-proyek'}>Buka proyek publik</Link>}
      {item && !item.published && <button className={styles.danger} type="button" onClick={() => {
        if (window.confirm('Hapus draf proyek ini?')) void save(() => api(base + '/' + item.id, { method: 'DELETE', data: { revision: item.revision } }), 'Proyek dihapus.', close);
      }}>Hapus draf</button>}
    </div>
    <p className={styles.meta}>Publikasi memerlukan isi implementasi, hasil, kredit, dan minimal satu teknologi.</p>
  </Controls>;
}

type Palette = Extract<DemoConfiguration, { kind: 'palette' }>;
type Tasks = Extract<DemoConfiguration, { kind: 'tasks' }>;
function remove<T>(items: T[], target: number) {
  return items.filter((_, index) => index !== target);
}
function replace<T>(items: T[], target: number, values: Partial<T>) {
  return items.map((item, index) => index === target ? { ...item, ...values } : item);
}
const newPalette: Palette = { kind: 'palette', colors: [{ name: 'Iris', hex: '#6654D1' }, { name: 'Hutan', hex: '#128166' }] };
const newTasks: Tasks = { kind: 'tasks', tasks: [{ label: '', done: false }] };

function PaletteFields({ configuration, change }: { configuration: Palette; change: (value: Palette) => void }) {
  const { colors } = configuration;
  const update = (data: Palette['colors']) => change({ kind: 'palette', colors: data });
  return <fieldset className={styles.choices}><legend>Warna aksen</legend>
    <p className={styles.meta}>Warna pertama menjadi pilihan awal untuk pengunjung.</p>
    {colors.map(({ name, hex }, index) => <div className={styles.configRow} key={index}>
      <label>Nama warna {index + 1}<input value={name} required maxLength={35} onChange={(event) => update(replace(colors, index, { name: event.target.value }))} /></label>
      <label>Warna {index + 1}<input type="color" value={hex} onChange={(event) => update(replace(colors, index, { hex: event.target.value }))} /></label>
      <button aria-label={'Hapus warna ' + (index + 1)} className={styles.danger} type="button" disabled={colors.length <= 2} onClick={() => update(remove(colors, index))}><Trash2 size={16} aria-hidden="true" /></button>
    </div>)}
    <button className={styles.secondary} type="button" disabled={colors.length >= 6} onClick={() => update([...colors, { hex: '#334155', name: '' }])}><Plus size={16} aria-hidden="true" /> Tambah warna</button>
  </fieldset>;
}

function TaskFields({ configuration, change }: { configuration: Tasks; change: (value: Tasks) => void }) {
  const { tasks } = configuration;
  const update = (data: Tasks['tasks']) => change({ kind: 'tasks', tasks: data });
  return <fieldset className={styles.choices}><legend>Daftar tugas awal</legend>
    {tasks.map(({ done, label }, index) => <div className={styles.configRow} key={index}>
      <label>Tugas {index + 1}<input value={label} required maxLength={100} onChange={(event) => update(replace(tasks, index, { label: event.target.value }))} /></label>
      <label className={styles.checkbox}><input type="checkbox" checked={done} onChange={(event) => update(replace(tasks, index, { done: event.target.checked }))} /> Sudah selesai</label>
      <button aria-label={'Hapus tugas ' + (index + 1)} className={styles.danger} type="button" disabled={tasks.length <= 1} onClick={() => update(remove(tasks, index))}><Trash2 size={16} aria-hidden="true" /></button>
    </div>)}
    <button className={styles.secondary} type="button" disabled={tasks.length >= 10} onClick={() => update([...tasks, { label: '', done: false }])}><Plus size={16} aria-hidden="true" /> Tambah tugas</button>
  </fieldset>;
}

function RemoveLinked({ count, kind, onRemove }: { count: number; kind: string; onRemove: () => void }) {
  return <button className={styles.danger} type="button" disabled={count > 0} onClick={() => {
    if (window.confirm('Hapus ' + kind.toLowerCase() + ' ini?')) onRemove();
  }}>Hapus {kind.toLowerCase()}</button>;
}

export function DemoForm({ item, busy, save, select, close }: FormProps<Demo>) {
  const [configuration, setConfiguration] = useState<DemoConfiguration>(item?.configuration ?? newPalette);
  const [showPreview, setShowPreview] = useState(false);
  const base = '/admin/demos';
  const preview = configurationSchema.safeParse(configuration);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const data: DemoInput = { title: field(values, 'title'), description: field(values, 'description'), credit: field(values, 'credit'), configuration };
    void save(async () => {
      if (item) await api(base + '/' + item.id, { method: 'PUT', data: { ...data, revision: item.revision } });
      else select((await api<Demo>(base, { method: 'POST', data: { ...data, slug: field(values, 'slug') } })).id);
    }, 'Demo disimpan.');
  }
  return <Controls onSubmit={submit} busy={busy} title="Isi demo">
    <div className={styles.columns}>
      <label>Judul demo<input name="title" required maxLength={100} defaultValue={item?.title} /></label>
      {slugField(item?.slug)}
    </div>
    <ParagraphField label="Cara kerja demo" name="description" value={item?.description} required />
    <label>Kredit demo<input name="credit" required maxLength={500} defaultValue={item?.credit} /></label>
    <div className={styles.actions} role="group" aria-label="Jenis demo">
      <button type="button" className={styles.secondary} aria-pressed={configuration.kind === 'palette'} onClick={() => { if (configuration.kind !== 'palette') setConfiguration(newPalette); }}><Code2 size={16} aria-hidden="true" /> Palet warna</button>
      <button type="button" className={styles.secondary} aria-pressed={configuration.kind === 'tasks'} onClick={() => { if (configuration.kind !== 'tasks') setConfiguration(newTasks); }}><ListTodo size={16} aria-hidden="true" /> Filter tugas</button>
    </div>
    {configuration.kind === 'palette' ? <PaletteFields configuration={configuration} change={setConfiguration} /> : <TaskFields configuration={configuration} change={setConfiguration} />}
    <div className={styles.actions}>
      <button className={styles.primary}>Simpan demo</button>
      <button className={styles.secondary} type="button" aria-expanded={showPreview} onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Tutup pratinjau' : 'Coba pratinjau'}</button>
      {item && <RemoveLinked count={item.projectCount} kind="Demo" onRemove={() => void save(() => api(base + '/' + item.id, { method: 'DELETE', data: { revision: item.revision } }), 'Demo dihapus.', close)} />}
    </div>
    {!!item?.projectCount && <p className={styles.meta}>Terhubung ke {item.projectCount} proyek. Perubahan akan langsung tampil pada proyek terkait yang sudah terbit.</p>}
    {showPreview && <div className={styles.previewDemo + ' ' + portfolio.page} aria-label="Pratinjau konfigurasi demo">
      {preview.success ? <DemoWidget key={JSON.stringify(preview.data)} demo={{ slug: 'pratinjau', title: '', description: '', credit: '', configuration: preview.data }} /> : <p className={styles.meta}>Isi nama setiap warna atau tugas untuk melihat pratinjau.</p>}
    </div>}
  </Controls>;
}

export function TechnologyForm({ item, busy, save, select, close }: FormProps<Technology>) {
  const base = '/admin/technologies';
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const data: TechnologyInput = { name: field(values, 'name'), category: field(values, 'category'), description: field(values, 'description'), docsUrl: field(values, 'docsUrl') };
    void save(async () => {
      if (item) await api(base + '/' + item.id, { method: 'PUT', data: { ...data, revision: item.revision } });
      else select((await api<Technology>(base, { method: 'POST', data })).id);
    }, 'Teknologi disimpan.');
  }
  return <Controls onSubmit={submit} busy={busy} title="Isi teknologi">
    <div className={styles.columns}>
      <label>Nama teknologi<input name="name" required maxLength={100} defaultValue={item?.name} /></label>
      <label>Kategori teknologi<input name="category" required maxLength={100} defaultValue={item?.category} /></label>
    </div>
    <ParagraphField label="Penggunaan dalam proyek" name="description" value={item?.description} required />
    <label>URL dokumentasi<input name="docsUrl" type="url" maxLength={500} defaultValue={item?.docsUrl} /></label>
    <div className={styles.actions}>
      <button className={styles.primary}>Simpan teknologi</button>
      {item && <RemoveLinked count={item.projectCount} kind="Teknologi" onRemove={() => void save(() => api(base + '/' + item.id, { method: 'DELETE', data: { revision: item.revision } }), 'Teknologi dihapus.', close)} />}
    </div>
    {!!item?.projectCount && <p className={styles.meta}>Teknologi dipakai oleh {item.projectCount} proyek. Lepaskan teknologi dari proyek terkait untuk menghapusnya.</p>}
  </Controls>;
}
