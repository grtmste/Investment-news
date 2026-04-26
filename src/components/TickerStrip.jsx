function fmt(price) {
  if (price == null) return '—';
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1)     return '$' + price.toFixed(2);
  return '$' + price.toFixed(4);
}

function TickerItem({ symbol, data }) {
  const positive = (data?.change24h ?? 0) >= 0;
  const color = data ? (positive ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '0 20px',
      borderRight: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
        {symbol}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
        {data ? fmt(data.price) : '—'}
      </span>
      {data && (
        <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: 'monospace' }}>
          {positive ? '▲' : '▼'} {Math.abs(data.change24h ?? 0).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

export default function TickerStrip({ watchlist, prices }) {
  if (!watchlist.length) return null;
  const symbols = watchlist.map(a => a.symbol);
  const items = [...symbols, ...symbols];

  return (
    <div style={{
      height: 34, background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'inset 0 -1px 0 var(--border-glow)',
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      {/* Fade edges */}
      {['left', 'right'].map(side => (
        <div key={side} style={{
          position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 48,
          background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, var(--bg-surface), transparent)`,
          zIndex: 1, pointerEvents: 'none',
        }} />
      ))}
      <div className="ticker-track">
        {items.map((sym, i) => (
          <TickerItem key={`${sym}-${i}`} symbol={sym} data={prices[sym]} />
        ))}
      </div>
    </div>
  );
}
