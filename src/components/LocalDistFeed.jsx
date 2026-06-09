import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { MapPin, CloudRain, Thermometer, Edit2, Send, Shield, Lock } from 'lucide-react';

export default function LocalDistFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userZip, setUserZip] = useState(() => localStorage.getItem('axiom_user_zip') || '');
  const [isEditingZip, setIsEditingZip] = useState(!localStorage.getItem('axiom_user_zip'));
  const [tempZip, setTempZip] = useState('');
  
  // Veritas Gate
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [intelText, setIntelText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeed = async (zip) => {
    if (!zip) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/news?zip=${zip}`);
      const data = await response.json();
      setFeed(data.stories || []);
    } catch (err) {
      console.error("Failed to fetch Local Dist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userZip && !isEditingZip) {
      fetchFeed(userZip);
      const intervalId = setInterval(() => fetchFeed(userZip), 60000);
      return () => clearInterval(intervalId);
    }
  }, [userZip, isEditingZip]);

  const handleZipSubmit = (e) => {
    e.preventDefault();
    if (tempZip.trim().length >= 5) {
      setUserZip(tempZip.trim());
      localStorage.setItem('axiom_user_zip', tempZip.trim());
      setIsEditingZip(false);
    }
  };

  const handleConnectVerified = () => {
    setVerifying(true);
    // Simulate cryptographic handshake
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  const handleIntelSubmit = async (e) => {
    e.preventDefault();
    if (!intelText.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: userZip, content: intelText })
      });
      setIntelText('');
      fetchFeed(userZip);
    } catch (err) {
      console.error("Intel submission error", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditingZip) {
    return (
      <div style={{ padding: '3rem 1rem', maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}>
            <MapPin size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1rem' }}>Connect to Your District</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your ZIP code to establish a localized data link for hyper-local news and tracking.</p>
          <form onSubmit={handleZipSubmit} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="e.g. 10001" value={tempZip} onChange={(e) => setTempZip(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', width: '150px', textAlign: 'center' }} autoFocus />
            <button type="submit" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>Sync District</button>
          </form>
          {userZip && <button onClick={() => setIsEditingZip(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '1.5rem', cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Hyper-Local District Module */}
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--accent-secondary)' }}>
            <MapPin size={20} /> District {userZip}
            <button onClick={() => { setTempZip(userZip); setIsEditingZip(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Change ZIP Code"><Edit2 size={14} /></button>
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time local tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
          <div><Thermometer size={24} style={{ color: 'white', marginBottom: '4px' }} /><div style={{ fontWeight: 'bold' }}>72°F</div></div>
          <div><CloudRain size={24} style={{ color: '#60a5fa', marginBottom: '4px' }} /><div style={{ fontWeight: 'bold' }}>14%</div></div>
        </div>
      </div>

      {/* Veritas Gate Module */}
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem', background: isVerified ? 'rgba(16, 185, 129, 0.05)' : 'rgba(139, 92, 246, 0.05)', border: isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)', transition: 'all 0.5s ease' }}>
        <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isVerified ? <Shield size={18} color="#10b981" /> : <Lock size={18} color="#8b5cf6" />} 
          {isVerified ? "Verified Source: Active" : "Veritas Gate (Read-Only)"}
        </h4>
        
        {!isVerified ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '400px' }}>
              Anonymous submissions are rejected by the network. Connect your cryptographic identity to broadcast local intel.
            </p>
            <button onClick={handleConnectVerified} disabled={verifying} style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: verifying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {verifying ? 'Verifying Ed25519...' : 'Connect Identity'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleIntelSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              placeholder="Report a local tip. Your signature will be anchored to the Trust Layer upon community verification." 
              value={intelText}
              onChange={(e) => setIntelText(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', color: 'white', minHeight: '80px', resize: 'vertical', outline: 'none' }}
            />
            <button type="submit" disabled={submitting || !intelText.trim()} style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: submitting || !intelText.trim() ? 'not-allowed' : 'pointer', opacity: submitting || !intelText.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} /> {submitting ? 'Broadcasting...' : 'Broadcast Intel'}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing Local Network...</div>
      ) : feed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No local data found for District {userZip} yet. Be the first to broadcast intel!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {feed.map((story) => <NewsCard key={story.id} story={story} />)}
        </div>
      )}
    </div>
  );
}
