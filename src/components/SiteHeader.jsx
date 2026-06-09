import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SiteHeader({ title, subtitle, colorPrimary, colorSecondary }) {
  return (
    <header className="header-glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 10, 12, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <ArrowLeft size={16} /> Hub
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', background: `linear-gradient(135deg, ${colorPrimary}, ${colorSecondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </h1>
          {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{subtitle}</p>}
        </div>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${colorPrimary}, ${colorSecondary})`, opacity: 0.8 }}></div>
      </div>
    </header>
  );
}
