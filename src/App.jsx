import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Hub from './components/Hub';
import SiteHeader from './components/SiteHeader';
import LocalDistFeed from './components/LocalDistFeed';
import GlobalTopFeed from './components/GlobalTopFeed';
import CuratedFeed from './components/CuratedFeed';
import './index.css';

// Standalone Site Layouts
const LocalSite = () => (
  <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
    <SiteHeader title="Axiom Local" subtitle="District Feed" colorPrimary="#3b82f6" colorSecondary="#60a5fa" />
    <main style={{ paddingBottom: '4rem' }}>
      <LocalDistFeed />
    </main>
  </div>
);

const GlobalSite = () => (
  <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
    <SiteHeader title="Axiom Global" subtitle="Top Stories" colorPrimary="#8b5cf6" colorSecondary="#a78bfa" />
    <main style={{ paddingBottom: '4rem' }}>
      <GlobalTopFeed />
    </main>
  </div>
);

const CuratedSite = () => (
  <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
    <SiteHeader title="Axiom Curated" subtitle="Your Interests" colorPrimary="#10b981" colorSecondary="#34d399" />
    <main style={{ paddingBottom: '4rem' }}>
      <CuratedFeed />
    </main>
  </div>
);

function App() {
  return (
    <>
      <div className="cosmic-void">
        <div className="stars"></div>
      </div>
      <div className="living-ledger-bg"></div>
      <BrowserRouter>
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Hub />} />
            <Route path="/local" element={<LocalSite />} />
            <Route path="/top" element={<GlobalSite />} />
            <Route path="/interests" element={<CuratedSite />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
