import { useState, useMemo } from 'react';
import NewsCard from './NewsCard';
import { NEWS_SOURCES } from '../utils/constants';

const TABS = [
  { id: 'all', label: 'All News' },
  { id: 'stocks', label: 'Stocks & Investing' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'ark', label: 'ARK Invest' },
];

const SKELETON_COUNT = 8;

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #21262d' }}>
      <div className="skeleton" style={{ width: 72, height: 48, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '85%' }} />
      </div>
    </div>
  );
}

export default function NewsFeed({ articles, loading, lastUpdated, sourceStatus, refresh }) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return articles;
    return articles.filter((a) => a.category === activeTab);
  }, [articles, activeTab]);

  const failedCount = Object.values(sourceStatus).filter((s) => s === 'error').length;
  const totalSources = NEWS_SOURCES.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0d1117',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px 0',
          borderBottom: '1px solid #30363d',
          flexShrink: 0,
          background: '#161b22',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              News Feed
            </span>
            {!loading && articles.length > 0 && (
              <span style={{ fontSize: 11, color: '#6e7681' }}>
                {filtered.length.toLocaleString()} articles
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {failedCount > 0 && !loading && (
              <span style={{ fontSize: 10, color: '#d29922' }} title={`${failedCount} of ${totalSources} sources failed to load`}>
                ⚠ {failedCount}/{totalSources} sources
              </span>
            )}
            {lastUpdated && (
              <span style={{ fontSize: 10, color: '#6e7681' }}>
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              style={{
                background: 'none',
                border: '1px solid #30363d',
                borderRadius: 5,
                padding: '3px 8px',
                fontSize: 11,
                color: loading ? '#6e7681' : '#8b949e',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.color = '#58a6ff'; }}}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
            >
              {loading ? '↻ Loading…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map((tab) => {
            const count = tab.id === 'all' ? articles.length : articles.filter((a) => a.category === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #58a6ff' : '2px solid transparent',
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#e6edf3' : '#8b949e',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 10,
                      background: isActive ? 'rgba(88,166,255,0.2)' : '#21262d',
                      color: isActive ? '#58a6ff' : '#6e7681',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Article list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#6e7681' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📰</div>
            <div style={{ fontSize: 14 }}>No articles found</div>
            {failedCount === totalSources && (
              <div style={{ fontSize: 12, marginTop: 8, color: '#d29922' }}>
                All news sources failed to load. Check your connection.
              </div>
            )}
          </div>
        ) : (
          filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </div>

      {/* Auto-refresh notice */}
      {!loading && (
        <div
          style={{
            padding: '6px 16px',
            borderTop: '1px solid #21262d',
            fontSize: 10,
            color: '#6e7681',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#58a6ff', display: 'inline-block' }} className="live-dot" />
          Auto-refreshes every 15 minutes
        </div>
      )}
    </div>
  );
}
