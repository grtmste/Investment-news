import { useState, useEffect } from 'react';
import { timeAgo } from '../utils/newsApi';
import { getOgImage } from '../utils/ogImageCache';

const CATEGORY = {
  stocks: { label: 'Stocks', color: '#4E9EF5', bg: 'rgba(78,158,245,0.15)' },
  crypto: { label: 'Crypto', color: 'var(--green)', bg: 'rgba(46,204,113,0.12)' },
  ark:    { label: 'ARK',    color: 'var(--gold)',  bg: 'var(--gold-glow)' },
};

const PLACEHOLDER_BG = {
  stocks: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A3B 100%)',
  crypto: 'linear-gradient(135deg, #0A1F14 0%, #112B1C 100%)',
  ark:    'linear-gradient(135deg, #1A1200 0%, #2A1E00 100%)',
};

export default function NewsCard({ article }) {
  const [thumb, setThumb]       = useState(article.thumbnail || null);
  const [imgFailed, setFailed]  = useState(false);
  const [ogFetched, setOgFetched] = useState(false);

  // Fetch og:image when RSS provided no thumbnail
  useEffect(() => {
    if (thumb || ogFetched || !article.url) return;
    let alive = true;
    setOgFetched(true);
    getOgImage(article.url).then(img => {
      if (alive && img) setThumb(img);
    });
    return () => { alive = false; };
  }, [article.url, thumb, ogFetched]);

  const cat     = CATEGORY[article.category] || CATEGORY.stocks;
  const ago     = timeAgo(article.publishedAt);
  const showImg = thumb && !imgFailed;
  const placeholderBg = PLACEHOLDER_BG[article.category] || PLACEHOLDER_BG.stocks;

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card">
      {/* Image area */}
      <div style={{ position: 'relative', height: 148, overflow: 'hidden', flexShrink: 0, background: placeholderBg }}>
        {showImg ? (
          <img
            src={thumb}
            alt=""
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${cat.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: cat.color,
            }}>
              {article.sourceName?.[0] ?? '?'}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {article.sourceName}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(13,17,23,0.85) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          padding: '3px 8px', borderRadius: 20,
          background: cat.bg, color: cat.color,
          border: `1px solid ${cat.color}30`,
          textTransform: 'uppercase',
        }}>
          {cat.label}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: cat.color }}>{article.sourceName}</span>
          <span style={{ color: 'var(--border)', fontSize: 10 }}>•</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ago}</span>
        </div>

        <div style={{
          fontSize: 13, fontWeight: 700,
          color: 'var(--text-primary)', lineHeight: 1.45,
          marginBottom: article.summary ? 8 : 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </div>

        {article.summary && (
          <div style={{
            fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {article.summary}
          </div>
        )}
      </div>
    </a>
  );
}
