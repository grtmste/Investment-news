import { timeAgo } from '../utils/newsApi';

const CATEGORY_COLORS = {
  stocks: { bg: 'rgba(88,166,255,0.12)', text: '#58a6ff', label: 'Stocks' },
  crypto: { bg: 'rgba(63,185,80,0.12)', text: '#3fb950', label: 'Crypto' },
  ark: { bg: 'rgba(0,212,255,0.12)', text: '#00d4ff', label: 'ARK' },
};

export default function NewsCard({ article }) {
  const cat = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.stocks;
  const ago = timeAgo(article.publishedAt);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="news-card"
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid #21262d',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
    >
      {/* Thumbnail */}
      {article.thumbnail && (
        <div style={{ flexShrink: 0 }}>
          <img
            src={article.thumbnail}
            alt=""
            style={{
              width: 72,
              height: 48,
              objectFit: 'cover',
              borderRadius: 6,
              background: '#21262d',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Meta line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 3,
              background: cat.bg,
              color: cat.text,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {cat.label}
          </span>
          <span style={{ fontSize: 11, color: '#58a6ff', fontWeight: 600 }}>
            {article.sourceName}
          </span>
          <span style={{ fontSize: 11, color: '#6e7681' }}>•</span>
          <span style={{ fontSize: 11, color: '#6e7681' }}>{ago}</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#e6edf3',
            lineHeight: 1.4,
            marginBottom: 5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </div>

        {/* Summary */}
        {article.summary && (
          <div
            style={{
              fontSize: 12,
              color: '#8b949e',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.summary}
          </div>
        )}
      </div>
    </a>
  );
}
