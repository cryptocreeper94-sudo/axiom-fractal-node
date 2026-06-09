import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

export default function CuratedFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState([]);
  
  const userId = localStorage.getItem('axiom_user_zip') || 'guest';

  useEffect(() => {
    fetch(`/api/curated?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setFeed(data.stories || []);
        setInterests(data.topTagsAssessed || []);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Curating Your Network...</div>
      ) : (
        <div style={{ paddingLeft: '1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Discover</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Self-Evolving matrix adapted to your activity.
              {interests.length > 0 && <span style={{ display: 'block', marginTop: '8px', color: 'var(--accent-primary)' }}>Known Interests: {interests.join(', ')}</span>}
            </p>
          </div>
          <div className="horizontal-carousel">
            {feed.map((story, idx) => (
              <div key={`${story.id}-${idx}`} className="carousel-item animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <NewsCard story={story} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
