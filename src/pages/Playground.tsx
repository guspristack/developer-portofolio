import { Braces, Check, Copy, RotateCcw } from 'lucide-react';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { DemoConfiguration, PublicDemo } from '../../shared/content';
import styles from './DeveloperDemo.module.css';

const filters = ['Semua', 'Aktif', 'Selesai'] as const;
type Filter = (typeof filters)[number];

function contrastingText(hex: string) {
  const lights = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return lights[0] * .2126 + lights[1] * .7152 + lights[2] * .0722 > .179 ? '#000000' : '#FFFFFF';
}

function DemoPanels({ language, snippet, reset, children }: { language: string; snippet: string; reset: () => void; children: ReactNode }) {
  return <div className={styles.panels}>
    <div className={styles.codePanel}>
      <div><Braces size={18} aria-hidden="true" /><h3>Kode contoh</h3><span>{language}</span></div>
      <pre tabIndex={0} aria-label="Cuplikan kode"><code>{snippet}</code></pre>
    </div>
    <div className={styles.demoPanel}>
      <div className={styles.panelHead}><h3>Pratinjau</h3><button type="button" onClick={reset}><RotateCcw size={15} aria-hidden="true" /> Atur ulang</button></div>
      {children}
    </div>
  </div>;
}

function PaletteDemo({ colors }: Extract<DemoConfiguration, { kind: 'palette' }>) {
  const [index, setIndex] = useState(0);
  const theme = colors[index] ?? colors[0];
  const text = contrastingText(theme.hex);
  const snippet = `.preview {
  --accent: ${theme.hex};
  --on-accent: ${text};
}

.badge {
  background: var(--accent);
  color: var(--on-accent);
}`;
  return <DemoPanels language="CSS" snippet={snippet} reset={() => setIndex(0)}>
    <div className={styles.themeDemo}>
      <div className={styles.themeCard} style={{ '--preview-accent': theme.hex, '--on-accent': text } as CSSProperties} aria-live="polite">
        <p>Variabel warna</p><strong>{theme.name}</strong><span>{theme.hex}</span>
      </div>
      <div className={styles.themePick} role="group" aria-label="Pilih warna aksen">
        {colors.map(({ name, hex }, item) => <button type="button" key={name} style={{ '--theme': hex } as CSSProperties} aria-pressed={index === item} onClick={() => setIndex(item)}><i aria-hidden="true" />{name}</button>)}
      </div>
    </div>
  </DemoPanels>;
}

function TasksDemo({ tasks }: Extract<DemoConfiguration, { kind: 'tasks' }>) {
  const [done, setDone] = useState(() => tasks.map((task) => task.done));
  const [filter, setFilter] = useState<Filter>('Semua');
  const selectedFilter = useRef<HTMLButtonElement>(null);
  const visible = tasks.map(({ label }, index) => ({ label, index })).filter(({ index }) => filter === 'Semua' || done[index] === (filter === 'Selesai'));
  const snippet = `const filter = "${filter}";

const visible = tasks.filter(task => {
  if (filter === "Semua") return true;
  return task.done === (filter === "Selesai");
});`;
  function toggle(index: number) {
    if (filter !== 'Semua') selectedFilter.current?.focus();
    setDone((current) => current.map((value, item) => item === index ? !value : value));
  }
  return <DemoPanels language="TypeScript" snippet={snippet} reset={() => { setDone(tasks.map((task) => task.done)); setFilter('Semua'); }}>
    <div className={styles.taskDemo}>
      <div className={styles.switcher} role="group" aria-label="Saring tugas">
        {filters.map((item) => <button type="button" key={item} ref={item === filter ? selectedFilter : undefined} aria-pressed={item === filter} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <p className={styles.taskCount} aria-live="polite">{done.filter(Boolean).length} dari {tasks.length} tugas selesai</p>
      <div className={styles.tasks}>
        {visible.map(({ label, index }) => <button type="button" key={label} aria-pressed={done[index]} onClick={() => toggle(index)}><span>{done[index] && <Check size={14} aria-hidden="true" />}</span>{label}</button>)}
        {!visible.length && <p>Tidak ada tugas dalam filter ini.</p>}
      </div>
    </div>
  </DemoPanels>;
}

export function DemoWidget({ demo }: { demo: PublicDemo }) {
  const { configuration } = demo;
  return configuration.kind === 'palette' ? <PaletteDemo {...configuration} /> : <TasksDemo {...configuration} />;
}

export function CopyDemoLink({ url }: { url: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  return <div className={styles.share}>
    <button type="button" onClick={async () => {
      try {
        await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
        setState('copied');
      } catch {
        setState('fallback');
      }
    }}><Copy size={16} aria-hidden="true" /> Salin tautan demo</button>
    {state === 'copied' && <p role="status">Tautan disalin.</p>}
    {state === 'fallback' && <label>Tautan demo<input readOnly value={new URL(url, window.location.origin).href} onFocus={(event) => event.currentTarget.select()} /></label>}
  </div>;
}
