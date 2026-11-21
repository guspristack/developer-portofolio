import { lazy, StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource/ibm-plex-mono/500.css';
import './reset.css';
import { DeveloperPortfolio } from './pages/DeveloperPortfolio';

const Admin = lazy(() => import('./pages/Admin'));

function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pathname === '/admin' ? 'Studio Ilham · Admin' : 'Ilham Rasyid · Developer';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationEffects />
      <Suspense fallback={<p className="resource-state" role="status">Memuat studio…</p>}>
        <Routes>
          <Route path="/" element={<DeveloperPortfolio />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<main className="resource-state"><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali ke portofolio</Link></main>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
