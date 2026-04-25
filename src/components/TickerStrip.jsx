function formatTickerPrice(price) {
  if (price == null) return '—';
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1) return '$' + price.toFixed(2);
  return '$' + price.toFixed(4);
}

function TickerItem({ symbol, data }) {
  if (!data) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', opacity: 0.4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', fontFamily: 'monospace' }}>{symbol}</span>
        <span style={{ fontSize: 11, color: '#6e7681', fontFamily: 'monospace' }}>—</span>
      </span>
    );
  }

  const positive = (data.change24h ?? 0) >= 0;
  const color = positive ? '#3fb950' : '#f85149';
  const arrow = positive ? '▲' : '▼';
  const changeStr = data.change24h != null
    ? `${positive ? '+' : ''}${data.change24h.toFixed(2)}%`
    : '—';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 20px',
        borderRight: '1px solid #21262d',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>
        {symbol}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', fontFamily: 'monospace' }}>
        {formatTickerPrice(data.price)}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: 'monospace' }}>
        {arrow} {changeStr}
      </span>
    </span>
  );
}

export default function TickerStrip({ watchlist, prices }) {
  // Use watchlist symbols for the ticker
  const symbols = watchlist.map((a) => a.symbol);
  if (!symbols.length) return null;

  // Duplicate for seamless loop
  const items = [...symbols, ...symbols];

  return (
    <div
      style={{
        height: 36,
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 40,
          background: 'linear-gradient(to right, #161b22, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 40,
          background: 'linear-gradient(to left, #161b22, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div className="ticker-track">
        {items.map((symbol, idx) => (
          <TickerItem key={`${symbol}-${idx}`} symbol={symbol} data={prices[symbol]} />
        ))}
      </div>
    </div>
  );
}
