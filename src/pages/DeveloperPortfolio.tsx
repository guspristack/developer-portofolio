import { ArrowUpRight, Code2, Download, Layers, ListTodo, LockKeyhole } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import type { PublicProject } from '../../shared/content';
import { useResource } from '../api';
import { scrollToSection } from '../components';
import { ProfileAvatar } from '../PortfolioIdentity';
import { PortfolioDetails, PortfolioTop, WorkCredits } from '../PortfolioProfile';
import { profiles } from '../portfolioProfiles';
import desk from '../images/developer-desk.webp';
import { CopyDemoLink, DemoWidget } from './Playground';
import demoSource from './Playground.tsx?url&no-inline';
import styles from './DeveloperDemo.module.css';

const navigation = [
  ['Proyek', 'ilham-proyek'], ['Demo', 'ilham-demo'], ['Stack', 'ilham-stack'],
  ['Profil', 'ilham-profil'], ['Pengalaman', 'ilham-pengalaman'], ['Kontak', 'ilham-kontak'],
];

function demoUrl(project: string, demo: string) {
  return '/?' + new URLSearchParams({ proyek: project, demo }).toString() + '#ilham-demo';
}

function Playground({ project }: { project?: PublicProject }) {
  const [params, setParams] = useSearchParams();
  const demo = project?.demos.find((item) => item.slug === params.get('demo')) ?? project?.demos[0];
  return <section className={styles.playground} aria-labelledby="ilham-demo">
    <div className={styles.sectionHead}>
      <div><h2 id="ilham-demo" tabIndex={-1}>Playground</h2>{project && <p>{project.title}</p>}</div>
      {project && project.demos.length > 0 && <div className={styles.switcher} role="group" aria-label="Pilih demo">
        {project.demos.map((item) => {
          const Icon = item.configuration.kind === 'palette' ? Layers : ListTodo;
          return <button key={item.slug} type="button" aria-pressed={demo?.slug === item.slug} onClick={() => {
            setParams({ proyek: project.slug, demo: item.slug }, { replace: true, preventScrollReset: true });
          }}><Icon size={16} aria-hidden="true" />{item.title}</button>;
        })}
      </div>}
    </div>
    {project && demo ? <>
      <DemoWidget key={project.slug + '/' + demo.slug} demo={demo} />
      <div className={styles.demoNote}>
        <h3>Cara kerja demo</h3>
        <p>{demo.description}</p>
        <p className={styles.meta}>{demo.credit}</p>
        <CopyDemoLink key={demo.slug} url={demoUrl(project.slug, demo.slug)} />
        <div className={styles.projectLinks}><a href={demoSource} download="Playground.tsx"><Download size={16} aria-hidden="true" /> Unduh kode komponen demo</a></div>
      </div>
    </> : <p className={styles.empty}>{project ? 'Proyek ini belum memiliki demo interaktif.' : 'Belum ada demo yang diterbitkan.'}</p>}
  </section>;
}

function ProjectList({ projects, active }: { projects: PublicProject[]; active: PublicProject }) {
  const [params, setParams] = useSearchParams();
  return <section className={styles.projectSection} aria-labelledby="ilham-proyek">
    <div className={styles.sectionHead}><h2 id="ilham-proyek" tabIndex={-1}>Proyek</h2></div>
    <div className={styles.projectGrid}>
      {projects.map((project) => <article key={project.slug} className={styles.projectCard} data-active={active.slug === project.slug}>
        <p className={styles.meta}>{project.category}</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <button type="button" className={styles.projectToggle} aria-pressed={active.slug === project.slug} aria-label={'Pilih proyek ' + project.title} onClick={() => {
          const next = new URLSearchParams(params);
          next.set('proyek', project.slug);
          next.delete('demo');
          setParams(next, { replace: true, preventScrollReset: true });
        }}>{active.slug === project.slug ? 'Proyek terpilih' : 'Lihat proyek'}</button>
      </article>)}
    </div>
    <article className={styles.caseDetail} aria-label={'Rincian ' + active.title}>
      {([['Tantangan', active.challenge], ['Implementasi', active.approach], ['Hasil', active.outcome]] as const).filter(([, text]) => text).map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}
      <div className={styles.projectLinks}>
        {active.demos[0] && <Link to={demoUrl(active.slug, active.demos[0].slug)}>Coba demo proyek</Link>}
        {active.repository && <a href={active.repository} target="_blank" rel="noopener noreferrer">Repositori <ArrowUpRight size={15} aria-hidden="true" /></a>}
        {active.liveUrl && <a href={active.liveUrl} target="_blank" rel="noopener noreferrer">Situs proyek <ArrowUpRight size={15} aria-hidden="true" /></a>}
      </div>
      <WorkCredits entries={[[ 'Kredit & peran', active.credit ]]} />
    </article>
    <section className={styles.stack} aria-labelledby="ilham-stack">
      <div className={styles.sectionHead}><h2 id="ilham-stack" tabIndex={-1}>Stack teknologi</h2><p>{active.title}</p></div>
      <div className={styles.techGrid}>{active.technologies.map((tool) => <article className={styles.techCard} key={tool.name}>
        <p className={styles.meta}>{tool.category}</p>
        <h3>{tool.docsUrl ? <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer">{tool.name} <ArrowUpRight size={15} aria-hidden="true" /></a> : tool.name}</h3>
        <p>{tool.description}</p>
      </article>)}</div>
    </section>
  </section>;
}

export function DeveloperPortfolio() {
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const { data, error, retry } = useResource<PublicProject[]>('/projects');
  const active = data?.find(({ slug }) => slug === params.get('proyek'))
    ?? (!params.has('proyek') && params.has('demo') ? data?.find(({ demos }) => demos.some(({ slug }) => slug === params.get('demo'))) : undefined)
    ?? data?.[0];

  useEffect(() => {
    if (!hash || !data) return;
    const frame = requestAnimationFrame(() => scrollToSection(hash.slice(1)));
    return () => cancelAnimationFrame(frame);
  }, [data, hash]);

  return <div className={styles.page}>
    <header className={styles.header} id="ilham-awal" tabIndex={-1}>
      <div className={styles.shell + ' ' + styles.headerInner}>
        <div className={styles.brand}><ProfileAvatar portrait={profiles.ilham.media.portrait} /> Ilham Rasyid</div>
        <nav className={styles.nav} aria-label="Navigasi portofolio Ilham">
          {navigation.filter(([, id]) => active || !['ilham-proyek', 'ilham-stack'].includes(id)).map(([label, id]) => <a key={id} href={'#' + id}>{label}</a>)}
        </nav>
        <Link to="/admin" className={styles.back}><LockKeyhole size={16} aria-hidden="true" /> Studio admin</Link>
      </div>
    </header>
    <main className={styles.shell}>
      <section className={styles.hero} aria-labelledby="ilham-hero">
        <img src={desk} alt="" fetchPriority="high" />
        <div className={styles.shade} />
        <div className={styles.heroBody}>
          <p className={styles.kicker}><Code2 size={16} aria-hidden="true" /> Ilham Rasyid · Creative Front-end Developer</p>
          <h1 id="ilham-hero">Antarmuka untuk<br /><em>langsung dicoba.</em></h1>
          <p className={styles.description}>Eksplorasi kecil tentang bagaimana kode, tampilan, dan interaksi saling terhubung.</p>
          <a className={styles.cta} href="#ilham-demo">Coba demo</a>
        </div>
      </section>
      {!data && !error && <p className={styles.empty} id="ilham-demo" role="status">Memuat proyek dan demo…</p>}
      {error && <div className={styles.empty} id="ilham-demo" role="alert">{error} <button type="button" onClick={retry}>Coba lagi</button></div>}
      {data && <Playground project={active} />}
      {data && active && <ProjectList projects={data} active={active} />}
      <PortfolioDetails profile={profiles.ilham} />
    </main>
    <footer className={styles.footer + ' ' + styles.shell}>
      <span>Pengembangan <a href="https://github.com/guspriaman">guspriaman</a> · <a href="https://github.com/guspristack">guspriStack</a></span>
      <PortfolioTop profile={profiles.ilham} />
    </footer>
  </div>;
}
