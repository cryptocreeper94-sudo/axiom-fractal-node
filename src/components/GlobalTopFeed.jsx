import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { mockDynamicNews } from '../data/mockData';

export default function GlobalTopFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching global stories and populate with a massive feed for masonry
    setTimeout(() => {
      setFeed([...mockDynamicNews, ...mockDynamicNews, ...mockDynamicNews, ...mockDynamicNews]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading Global Network...
        </div>
      ) : (
        <div className="masonry-grid">
          {feed.map((story, idx) => (
            <div key={`${story.id}-${idx}`} className="masonry-item animate-fade-in" style={{ animationDelay: `${(idx % 10) * 0.1}s` }}>
              <NewsCard story={story} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
