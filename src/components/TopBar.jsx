function MarketStatus() {
  const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const h = et.getHours() + et.getMinutes() / 60;
  const day = et.getDay();
  const weekend = day === 0 || day === 6;

  let label = 'CLOSED', color = 'var(--text-muted)', bg = 'rgba(90,96,112,0.1)';
  if (!weekend && h >= 4 && h < 9.5)   { label = 'PRE-MKT';  color = 'var(--gold)';  bg = 'var(--gold-glow)'; }
  if (!weekend && h >= 9.5 && h < 16)  { label = 'MKT OPEN'; color = 'var(--green)'; bg = 'rgba(46,204,113,0.1)'; }
  if (!weekend && h >= 16 && h < 20)   { label = 'AFTER-HRS'; color = 'var(--gold)'; bg = 'var(--gold-glow)'; }

  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
      padding: '4px 10px', borderRadius: 20,
      color, background: bg, border: `1px solid ${color}30`,
    }}>
      {label}
    </div>
  );
}

function IconButton({ onClick, disabled, children, title, hoverColor = 'var(--gold)' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '5px 14px',
        fontSize: 11,
        fontWeight: 500,
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = hoverColor; e.currentTarget.style.color = hoverColor; e.currentTarget.style.boxShadow = `0 0 8px ${hoverColor}30`; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </button>
  );
}

export default function TopBar({ onRefreshNews, onRefreshPrices, newsLoading, priceLoading }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      height: 54,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 0 var(--border-glow)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="var(--bg-overlay)" />
          <polyline points="4,23 10,14 16,18 22,8 28,13"
            stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="28" cy="13" r="2.5" fill="var(--green)" />
        </svg>
        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Invest<span style={{ color: 'var(--gold)' }}>Feed</span>
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Live dot + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--gold)', display: 'inline-block',
        }} className="live-dot" />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.08em' }}>LIVE</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeStr}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconButton onClick={onRefreshPrices} disabled={priceLoading} title="Refresh prices" hoverColor="var(--green)">
          <span style={{ fontSize: 12 }}>↻</span> Prices
        </IconButton>
        <IconButton onClick={onRefreshNews} disabled={newsLoading} title="Refresh news">
          <span style={{ fontSize: 12 }}>↻</span> News
        </IconButton>
        <MarketStatus />
      </div>
    </div>
  );
}
