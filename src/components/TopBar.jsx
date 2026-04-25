export default function TopBar({ onRefreshNews, onRefreshPrices, newsLoading, priceLoading, lastNewsUpdate }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        height: 52,
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
          <rect width="32" height="32" rx="6" fill="#21262d" />
          <polyline points="4,22 10,14 16,18 22,8 28,12" stroke="#58a6ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="28" cy="12" r="2.5" fill="#3fb950" />
        </svg>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em' }}>
          Invest<span style={{ color: '#58a6ff' }}>Feed</span>
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: '#30363d' }} />

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#3fb950',
            display: 'inline-block',
          }}
          className="live-dot"
        />
        <span style={{ fontSize: 11, color: '#3fb950', fontWeight: 600, letterSpacing: '0.06em' }}>
          LIVE
        </span>
        <span style={{ fontSize: 11, color: '#6e7681' }}>{timeStr}</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onRefreshPrices}
          disabled={priceLoading}
          style={{
            background: 'none',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 11,
            color: priceLoading ? '#6e7681' : '#8b949e',
            cursor: priceLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
          onMouseEnter={(e) => { if (!priceLoading) { e.currentTarget.style.borderColor = '#3fb950'; e.currentTarget.style.color = '#3fb950'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
          title="Refresh prices"
        >
          <span style={{ fontSize: 13 }}>↻</span>
          <span>Prices</span>
        </button>

        <button
          onClick={onRefreshNews}
          disabled={newsLoading}
          style={{
            background: 'none',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 11,
            color: newsLoading ? '#6e7681' : '#8b949e',
            cursor: newsLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
          onMouseEnter={(e) => { if (!newsLoading) { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.color = '#58a6ff'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
          title="Refresh news"
        >
          <span style={{ fontSize: 13 }}>↻</span>
          <span>News</span>
        </button>
      </div>

      {/* Market hours indicator */}
      <MarketStatus />
    </div>
  );
}

function MarketStatus() {
  const now = new Date();
  // Convert to ET for market hours check
  const etHour = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).getHours();
  const etMin = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).getMinutes();
  const etDay = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay();

  const isWeekend = etDay === 0 || etDay === 6;
  const timeDecimal = etHour + etMin / 60;
  const isPreMarket = !isWeekend && timeDecimal >= 4 && timeDecimal < 9.5;
  const isOpen = !isWeekend && timeDecimal >= 9.5 && timeDecimal < 16;
  const isAfterHours = !isWeekend && timeDecimal >= 16 && timeDecimal < 20;

  let label = 'Market Closed';
  let color = '#6e7681';
  if (isPreMarket) { label = 'Pre-Market'; color = '#d29922'; }
  if (isOpen) { label = 'Market Open'; color = '#3fb950'; }
  if (isAfterHours) { label = 'After Hours'; color = '#d29922'; }

  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 4,
        color,
        border: `1px solid ${color}30`,
        background: `${color}10`,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </div>
  );
}
