import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass, Rss, ShieldCheck, AlertTriangle, Search } from 'lucide-react';
import { useDecryptionEffect } from '../hooks/useDecryptionEffect';

export default function Hub() {
  const [searchDomain, setSearchDomain] = useState('');
  const [checkedDomain, setCheckedDomain] = useState(null);

  const handleCheck = () => {
    if (searchDomain.trim().length > 2) {
      setCheckedDomain(searchDomain.toLowerCase());
    }
  };

  const decryptedDomain = useDecryptionEffect(checkedDomain ? `${checkedDomain}.axiomnews.tlid.io` : '', !!checkedDomain, 20);

  // Immutable Notary State
  const [notaryText, setNotaryText] = useState('');
  const [notaryReceipt, setNotaryReceipt] = useState(null);
  const [isHashing, setIsHashing] = useState(false);

  const handleTrustDrop = async () => {
    if (!notaryText.trim()) return;
    setIsHashing(true);
    setNotaryReceipt(null);
    
    // Client-side SHA-256
    const msgBuffer = new TextEncoder().encode(notaryText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const clientHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    try {
      const res = await fetch('http://localhost:3001/api/notary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientHash })
      });
      const data = await res.json();
      
      if (data.success) {
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`http://localhost:3001/api/notary/${data.id}`);
          const statusData = await statusRes.json();
          if (statusData.fractal_block_hash) {
            clearInterval(pollInterval);
            setNotaryReceipt({
              clientHash: statusData.client_hash,
              fractalHash: statusData.fractal_block_hash,
              tllHash: statusData.tll_anchor_hash,
              timestamp: statusData.timestamp
            });
            setIsHashing(false);
          }
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      setIsHashing(false);
    }
  };

  const decNotaryL2 = useDecryptionEffect(notaryReceipt?.fractalHash || '', !!notaryReceipt, 15);
  const decNotaryL1 = useDecryptionEffect(notaryReceipt?.tllHash || '', !!notaryReceipt, 15);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px' }}>
          <span className="gradient-text">AxiomNews</span> Network
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          The premier purveyor of decentralized, deterministic information. Select a portal to enter.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', alignContent: 'stretch' }}>
        
        <Link to="/local" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s ease', cursor: 'pointer', background: 'linear-gradient(rgba(10,10,12,0.7), rgba(10,10,12,0.9)), url(/local_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}>
              <MapPin size={32} color="white" />
            </div>
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Local Dist</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Hyper-local stories and breaking news mapped exclusively to your district.</p>
          </div>
        </Link>

        <Link to="/top" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s ease', cursor: 'pointer', background: 'linear-gradient(rgba(10,10,12,0.7), rgba(10,10,12,0.9)), url(/global_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
              <Compass size={32} color="white" />
            </div>
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Global Top</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>The most important global stories and macroeconomic shifts, updated in real-time.</p>
          </div>
        </Link>

        <Link to="/interests" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s ease', cursor: 'pointer', background: 'linear-gradient(rgba(10,10,12,0.7), rgba(10,10,12,0.9)), url(/curated_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}>
              <Rss size={32} color="white" />
            </div>
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Curated Feed</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Personalized stories driven by your interaction history and core interests.</p>
          </div>
        </Link>
      </div>

      {/* Axiom Philosophy / Transparency Portal */}
      <div className="glass-panel" style={{ marginTop: '4rem', padding: '3rem 2rem', maxWidth: '800px', width: '100%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '-0.5px' }}>The Axiom Standard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <p>
            <strong style={{ color: 'white' }}>Deterministic Truth, Not Algorithmic Noise.</strong><br/>
            Most networks optimize for engagement by feeding you what makes you angry. We built a pristine glass container. You tell us your ZIP code, you tell us your interests, and we deliver exactly what is relevant to you. No hidden editorial slants.
          </p>
          <p>
            <strong style={{ color: 'white' }}>The Veritas Gate (Verified Sources).</strong><br/>
            We reject anonymous mob rule. While anyone can read the news, only cryptographically <span style={{ color: 'var(--accent-secondary)' }}>Verified Sources</span> can broadcast or validate local intelligence.
          </p>
          <p>
            <strong style={{ color: 'white' }}>Immutable Public Ledger.</strong><br/>
            When a Verified Source broadcasts a tip and the community validates it, we cryptographically anchor that story to the DarkWave Trust Layer. Look for the <strong style={{ color: '#10b981' }}>"Verify on Ledger"</strong> badge on stories to mathematically prove the content has not been tampered with.
          </p>
        </div>
      </div>
      {/* Subdomain Governance Portal */}
      <div className="glass-panel" style={{ marginTop: '4rem', padding: '3rem 2rem', maxWidth: '800px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Franchise Registration Portal</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Claim a dedicated Fractal Ledger node for your industry. <strong style={{color: 'white'}}>You can add your own industry or own your own space permanently by registering an available subdomain.</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.5rem 1rem', width: '100%', maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="e.g. healthcare, automotive"
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', flex: 1, fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>.axiomnews.tlid.io</span>
          </div>
          <button onClick={handleCheck} style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', padding: '0 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} /> Check
          </button>
        </div>
        <p style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>* If the space is available, it becomes yours to govern.</p>

        {checkedDomain && (
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '4px', border: '1px solid rgba(0,255,65,0.1)' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--accent-primary)' }}>AVAILABLE:</span> {decryptedDomain}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Path A: Verified Enterprise */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'rgba(0,255,65,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-primary)', color: 'black', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', borderBottomLeftRadius: '4px' }}>RECOMMENDED</div>
                <h5 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} /> Verified Enterprise</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Require corporate identity verification via the Veritas Gate. If your EIN matches the industry requested, the license is granted instantly to accelerate ecosystem adoption.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>$0.00</span>
                  <button style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Authenticate KYB</button>
                </div>
              </div>

              {/* Path B: Speculator Stake */}
              <div style={{ padding: '1.5rem', border: '1px solid rgba(255,60,60,0.5)', borderRadius: '4px', background: 'rgba(255,60,60,0.05)' }}>
                <h5 style={{ color: '#ff4d4d', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> Anonymous Speculator</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Refusing identity verification requires an exorbitant Proof of Stake to deter squatters. <br/><strong style={{color: '#ff4d4d'}}>Warning:</strong> If a legitimate enterprise initiates a CORE Ledger Governance Challenge, you will be evicted and your stake forfeited.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>$10,000<span style={{fontSize:'0.9rem', color: 'var(--text-muted)'}}>/year stake</span></span>
                  <button style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Stake Capital</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Immutable Notary (Trust Drop) Portal */}
      <div className="glass-panel" style={{ marginTop: '4rem', padding: '3rem 2rem', maxWidth: '800px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Immutable Notary <span style={{ color: 'var(--accent-secondary)' }}>(Trust Drop)</span></h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Hash any private document or statement entirely in your browser. Anchor it to the public blockchain to prove its existence forever.</p>
        
        <textarea 
          placeholder="Paste secret text, code, or document content here..."
          value={notaryText}
          onChange={(e) => setNotaryText(e.target.value)}
          style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '4px', padding: '1rem', color: 'white', fontFamily: 'var(--font-mono)', marginBottom: '1rem', resize: 'vertical' }}
        />
        <button 
          onClick={handleTrustDrop} 
          disabled={isHashing || !notaryText.trim()}
          style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: isHashing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', opacity: (isHashing || !notaryText.trim()) ? 0.5 : 1 }}
        >
          <ShieldCheck size={18} /> {isHashing ? 'Hashing & Anchoring...' : 'Hash & Anchor (Local)'}
        </button>

        {notaryReceipt && (
          <div style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '4px', border: '1px solid var(--accent-secondary)' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>CRYPTOGRAPHIC RECEIPT ISSUED</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Original Data Hash (SHA-256)</span>
                <div style={{ color: 'white', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>{notaryReceipt.clientHash}</div>
              </div>
              <div>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Fractal Block Hash (Layer 2)</span>
                <div style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', background: 'rgba(0,255,65,0.05)', padding: '8px', borderRadius: '4px', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>{decNotaryL2}</div>
              </div>
              <div>
                <span style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>TLL Anchor Proof (Layer 1)</span>
                <div style={{ color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)', background: 'rgba(138,43,226,0.05)', padding: '8px', borderRadius: '4px', textShadow: '0 0 8px rgba(138,43,226,0.5)' }}>{decNotaryL1}</div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Timestamp: {notaryReceipt.timestamp}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
