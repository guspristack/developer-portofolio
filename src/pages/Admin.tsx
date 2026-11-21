import { ArrowLeft, Code2, FolderKanban, Layers3, LockKeyhole, LogOut, Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ApiError, api, errorText, useResource } from '../api';
import type { Demo, Project, Technology } from '../../shared/content';
import { CreditFooter } from '../components';
import { DemoForm, ProjectForm, TechnologyForm, type Save } from './StudioForms';
import styles from './Admin.module.css';

const tabs = {
  projects: { label: 'Proyek', item: 'proyek', description: 'Susun proyek, kaitkan demo dan stack, lalu kelola status publikasinya.', icon: FolderKanban },
  demos: { label: 'Demo interaktif', item: 'demo', description: 'Atur palet warna dan daftar tugas yang bisa dicoba pengunjung.', icon: Code2 },
  technologies: { label: 'Stack teknologi', item: 'teknologi', description: 'Kelola teknologi yang ditampilkan pada proyek beserta dokumentasinya.', icon: Layers3 },
} as const;
type Section = keyof typeof tabs;
type Editor = number | 'new' | null;

function Login({ onLogin }: { onLogin: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api('/admin/login', { method: 'POST', data: { email: values.get('email'), password: values.get('password') } });
      onLogin();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }
  return <main className={styles.loginShell}>
    <Link className={styles.back} to="/"><ArrowLeft size={16} aria-hidden="true" /> Portofolio</Link>
    <section className={styles.login} aria-labelledby="login-title">
      <span className={styles.loginIcon}><LockKeyhole size={20} aria-hidden="true" /></span>
      <h1 id="login-title">Masuk ke studio</h1>
      <p>Kelola proyek, demo, dan stack Ilham Rasyid.</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <form onSubmit={submit}><fieldset className={styles.fields} disabled={busy}>
        <label>Email admin<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
        <label>Kata sandi<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
        <button className={styles.primary}>{busy ? 'Sedang masuk…' : 'Masuk'}</button>
      </fieldset></form>
    </section>
    <CreditFooter className={styles.footer} />
  </main>;
}

function Studio({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Section>('projects');
  const [editor, setEditor] = useState<Editor>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const projects = useResource<Project[]>('/admin/projects');
  const demos = useResource<Demo[]>('/admin/demos');
  const technologies = useResource<Technology[]>('/admin/technologies');

  const currentProject = projects.data?.find(({ id }) => id === editor);
  const currentDemo = demos.data?.find(({ id }) => id === editor);
  const currentTech = technologies.data?.find(({ id }) => id === editor);
  const page = tabs[tab];
  const currentTitle = tab === 'projects' ? currentProject?.title : tab === 'demos' ? currentDemo?.title : currentTech?.name;
  const resourcesError = projects.error || demos.error || technologies.error;

  function show(target: Editor) {
    setError('');
    setNotice('');
    setEditor(target);
  }
  function reload() {
    projects.retry();
    demos.retry();
    technologies.retry();
  }
  const save: Save = async (task, message, onSaved) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
      onSaved?.();
      if (message) { reload(); setNotice(message); }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) onLogout();
      else setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  };
  const props = { busy, save, select: setEditor, close: () => setEditor(null) };
  let content: ReactNode;
  if (resourcesError) {
    content = <div className={styles.error} role="alert">{resourcesError} <button type="button" className={styles.secondary} onClick={reload}>Coba lagi</button></div>;
  } else if (!projects.data || !demos.data || !technologies.data) {
    content = <p role="status">Memuat isi studio…</p>;
  } else if (editor === null) {
    const list = tab === 'projects'
      ? projects.data.map((item) => ({ id: item.id, title: item.title, detail: (item.published ? 'Terbit' : 'Draf') + ' · ' + item.category }))
      : tab === 'demos'
        ? demos.data.map((item) => ({ id: item.id, title: item.title, detail: (item.configuration.kind === 'palette' ? 'Palet warna' : 'Filter tugas') + ' · ' + item.projectCount + ' proyek' }))
        : technologies.data.map((item) => ({ id: item.id, title: item.name, detail: item.category + ' · ' + item.projectCount + ' proyek' }));
    content = <>
      <button className={styles.primary} type="button" onClick={() => show('new')}><Plus size={17} aria-hidden="true" /> Tambah {page.item}</button>
      {list.length ? <ul className={styles.series}>{list.map((item) => <li key={item.id}>
        <div><h2>{item.title}</h2><p className={styles.meta}>{item.detail}</p></div>
        <button className={styles.secondary} aria-label={'Sunting ' + item.title} type="button" onClick={() => show(item.id)}>Sunting</button>
      </li>)}</ul> : <p className={styles.empty}>Belum ada {page.item}.</p>}
    </>;
  } else if (editor === 'new' || currentTitle) {
    if (tab === 'projects') content = <ProjectForm key={currentProject?.revision ?? 'new'} item={currentProject} demos={demos.data} technologies={technologies.data} {...props} />;
    else if (tab === 'demos') content = <DemoForm key={currentDemo?.revision ?? 'new'} item={currentDemo} {...props} />;
    else content = <TechnologyForm key={currentTech?.revision ?? 'new'} item={currentTech} {...props} />;
  } else {
    content = <p role="status">Memuat perubahan…</p>;
  }

  return <>
    <header className={styles.topBar}><div className={styles.shell}>
      <p className={styles.wordmark}>Studio <span>Ilham</span></p>
      <div className={styles.actions}>
        <Link className={styles.back} to="/">Portofolio</Link>
        <button type="button" disabled={busy} className={styles.secondary} onClick={() => void save(() => api('/admin/logout', { method: 'POST' }), '', onLogout)}><LogOut size={16} aria-hidden="true" /> Keluar</button>
      </div>
    </div></header>
    <main className={styles.shell + ' ' + styles.dashboard}>
      <div className={styles.tabs} role="group" aria-label="Bagian studio">
        {(Object.keys(tabs) as Section[]).map((key) => {
          const { icon: Icon, label } = tabs[key];
          return <button key={key} type="button" aria-current={key === tab ? 'page' : undefined} disabled={busy} onClick={() => { setTab(key); show(null); }}><Icon size={17} aria-hidden="true" /> {label}</button>;
        })}
      </div>
      {editor !== null && <button type="button" className={styles.back} disabled={busy} onClick={() => show(null)}><ArrowLeft size={16} aria-hidden="true" /> Kembali ke daftar</button>}
      <div className={styles.dashboardHead}><div><h1>{currentTitle ?? (editor === 'new' ? 'Tambah ' + page.item : page.label)}</h1><p className={styles.meta}>{page.description}</p></div></div>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {content}
    </main>
    <CreditFooter className={styles.shell + ' ' + styles.footer} />
  </>;
}

export default function Admin() {
  const [override, setOverride] = useState<boolean | null>(null);
  const { data, error, retry } = useResource<{ authenticated: true }>('/admin/session');
  if (override === true || (override === null && data)) return <div className={styles.page}><Studio onLogout={() => setOverride(false)} /></div>;
  if (override === false || error === 'Masuk sebagai admin untuk melanjutkan.') return <div className={styles.page}><Login onLogin={() => setOverride(true)} /></div>;
  return <div className={styles.page}><main className={styles.loginShell}>
    {error ? <p role="alert">{error} <button className={styles.secondary} onClick={retry}>Coba lagi</button></p> : <p role="status">Memeriksa sesi…</p>}
  </main></div>;
}
