import React from 'react';
import { MapPin, Rss, Compass } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'top', label: 'Top Stories', icon: <Compass size={18} /> },
    { id: 'interests', label: 'Your Interests', icon: <Rss size={18} /> },
    { id: 'dist', label: 'Local Dist', icon: <MapPin size={18} /> },
  ];

  return (
    <header className="header-glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 10, 12, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          <span className="gradient-text">Axiom</span>News
        </h1>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
      </div>
      
      <nav style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', width: '100%', maxWidth: '800px', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
