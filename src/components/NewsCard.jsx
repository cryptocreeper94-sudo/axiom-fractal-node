import React, { useEffect, useRef, useState } from 'react';
import { Share2, Bookmark, Clock, CheckCircle, XCircle, ShieldCheck, Hash, Link as LinkIcon } from 'lucide-react';
import { useDecryptionEffect } from '../hooks/useDecryptionEffect';

export default function NewsCard({ story }) {
  const cardRef = useRef(null);
  const [tracked, setTracked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [votes, setVotes] = useState(story.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  
  const userId = localStorage.getItem('axiom_user_zip') || 'guest';

  useEffect(() => {
    if (tracked) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          fetch('/api/track/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId: story.id, zipCode: story.zipCode })
          }).catch(err => console.error("Tracking error:", err));
          setTracked(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [tracked, story]);

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, storyId: story.id, actionType: 'bookmark', tags: story.tags || '' })
      }).catch(err => console.error("Interaction error:", err));
    }
  };

  const handleVote = (e, type) => {
    e.stopPropagation();
    if (hasVoted) return;
    // Assume user is verified for prototype purposes
    setHasVoted(true);
    setVotes(prev => type === 'upvote' ? prev + 1 : prev - 1);
    fetch(`/api/intel/${story.id.replace('intel-', '')}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    }).catch(err => console.error("Vote tracking error:", err));
  };

  // Real Ledger Verification Data
  const isAnchored = story.isIntel && !!story.tllAnchorHash; 
  const layer2Hash = story.fractalBlockHash || "Awaiting block inclusion...";
  const layer1Hash = story.tllAnchorHash || "Awaiting L1 Anchor...";

  // Cyber-Decryption Effects
  const decryptedTitle = useDecryptionEffect(story.title, true, 20);
  const decryptedL2Hash = useDecryptionEffect(layer2Hash, showLedgerModal, 10);
  const decryptedL1Hash = useDecryptionEffect(layer1Hash, showLedgerModal, 10);

  return (
    <>
      <article 
        ref={cardRef}
        className="glass-panel animate-fade-in" 
        style={{
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          border: story.isIntel ? (isAnchored ? '1px solid #10b981' : '1px solid var(--accent-secondary)') : '1px solid var(--border-color)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = story.isIntel && isAnchored ? '0 12px 40px 0 rgba(16, 185, 129, 0.2)' : '0 12px 40px 0 rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
        }}
      >
        <div style={{ position: 'relative', width: '100%', paddingTop: '50%' }}>
          <img 
            src={story.imageUrl || `https://picsum.photos/seed/${story.id}/800/500`} 
            alt={story.title} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {story.isIntel && !isAnchored && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
              Unverified Intel
            </div>
          )}
          {isAnchored && (
            <div 
              onClick={(e) => { e.stopPropagation(); setShowLedgerModal(true); }}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', zIndex: 10 }}
              title="Click to view Cryptographic Proof"
            >
              <ShieldCheck size={16} /> Ledger Verified
            </div>
          )}
        </div>
        
        <div style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', fontFamily: story.isIntel ? 'var(--font-mono)' : 'var(--font-main)' }}>{decryptedTitle}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{story.summary}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {story.timeAgo}</span>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {story.isIntel && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '8px', borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{votes}</span>
                  <CheckCircle size={18} style={{ cursor: hasVoted ? 'default' : 'pointer', color: hasVoted ? 'var(--text-muted)' : '#10b981' }} onClick={(e) => handleVote(e, 'upvote')} title="Accurate" />
                  <XCircle size={18} style={{ cursor: hasVoted ? 'default' : 'pointer', color: hasVoted ? 'var(--text-muted)' : '#ef4444' }} onClick={(e) => handleVote(e, 'downvote')} title="Inaccurate" />
                </div>
              )}
              <Bookmark size={18} fill={bookmarked ? "white" : "none"} style={{ cursor: 'pointer', color: bookmarked ? 'white' : 'var(--text-muted)' }} onClick={handleBookmark} />
              <Share2 size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </article>

      {/* Public Transparency Modal for Trust Layer Proof */}
      {showLedgerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowLedgerModal(false)}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '2rem', border: '1px solid #10b981', boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: '#10b981' }}>
              <ShieldCheck size={32} />
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Cryptographic Proof</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              This local intelligence has been community-substantiated and immutably anchored to the <strong style={{color:'white'}}>DarkWave CORE Ledger</strong>. It cannot be tampered with or altered by any algorithm.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}><Hash size={14}/> Fractal Block Hash (Layer 2)</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', wordBreak: 'break-all', fontSize: '0.9rem', background: 'rgba(138,43,226,0.05)', padding: '12px', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '4px', textShadow: '0 0 8px rgba(138,43,226,0.5)' }}>
                  {decryptedL2Hash}
                </div>
              </div>
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}><LinkIcon size={14}/> TLL Anchor Proof (Layer 1)</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', wordBreak: 'break-all', fontSize: '0.9rem', background: 'rgba(0,255,65,0.05)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
                  {decryptedL1Hash}
                </div>
              </div>
            </div>

            <button onClick={() => setShowLedgerModal(false)} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              Close Ledger Verification
            </button>
          </div>
        </div>
      )}
    </>
  );
}
