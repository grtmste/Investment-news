import { useState, useMemo } from 'react';
import NewsCard from './NewsCard';
import { NEWS_SOURCES } from '../utils/constants';

const TABS = [
  { id: 'all',    label: 'All News' },
  { id: 'stocks', label: 'Stocks & Investing' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'ark',    label: 'ARK Invest' },
];

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 148 }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div className="skeleton" style={{ height: 10, width: 60 }} />
          <div className="skeleton" style={{ height: 10, width: 40 }} />
        </div>
        <div className="skeleton" style={{ height: 13, width: '95%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '75%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 11, width: '90%', marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '60%' }} />
      </div>
    </div>
  );
}

export default function NewsFeed({ articles, loading, lastUpdated, sourceStatus, refresh }) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() =>
    activeTab === 'all' ? articles : articles.filter(a => a.category === activeTab),
    [articles, activeTab]
  );

  const failedCount = Object.values(sourceStatus).filter(s => s === 'error').length;
  const total = NEWS_SOURCES.length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: 'var(--bg-base)', overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 var(--border-glow)',
        flexShrink: 0,
        padding: '10px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="section-label">News Feed</span>
            {!loading && filtered.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {filtered.length.toLocaleString()} articles
              </span>
            )}
            {failedCount > 0 && !loading && (
              <span style={{ fontSize: 10, color: '#D29922' }} title={`${failedCount} of ${total} sources unavailable`}>
                ⚠ {failedCount}/{total} sources
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 20, padding: '3px 10px',
                fontSize: 10, fontWeight: 600,
                color: loading ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {loading ? '↻ Loading…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginLeft: -4 }}>
          {TABS.map(tab => {
            const count = tab.id === 'all' ? articles.length : articles.filter(a => a.category === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    marginLeft: 5, fontSize: 9, padding: '1px 5px', borderRadius: 10,
                    background: activeTab === tab.id ? 'var(--gold-glow)' : 'var(--bg-overlay)',
                    color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Article grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📰</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>No articles found</div>
            {failedCount === total && (
              <div style={{ fontSize: 12, color: '#D29922', marginTop: 4 }}>
                All news sources failed to load. Check your connection.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {filtered.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div style={{
          padding: '6px 20px', borderTop: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-muted)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} className="live-dot" />
          Auto-refreshes every 15 minutes
        </div>
      )}
    </div>
  );
}
