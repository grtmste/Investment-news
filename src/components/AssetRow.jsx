import Sparkline from './Sparkline';

function formatPrice(price) {
  if (price == null) return '—';
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return '$' + price.toFixed(2);
  if (price >= 0.01) return '$' + price.toFixed(4);
  return '$' + price.toFixed(6);
}

function formatChange(change) {
  if (change == null) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default function AssetRow({ asset, priceData, sparklineData, onRemove }) {
  const { symbol, type } = asset;
  const positive = (priceData?.change24h ?? 0) >= 0;
  const changeColor = priceData ? (positive ? '#3fb950' : '#f85149') : '#6e7681';
  const hasData = Boolean(priceData?.price);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 group transition-colors cursor-default"
      style={{ borderBottom: '1px solid #21262d' }}
    >
      {/* Symbol & name */}
      <div style={{ flex: '1 1 0', minWidth: 0 }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: '#e6edf3' }}>
            {symbol}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: 3,
              fontWeight: 600,
              letterSpacing: '0.05em',
              ...(type === 'crypto'
                ? { background: 'rgba(63,185,80,0.15)', color: '#3fb950' }
                : { background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }),
            }}
          >
            {type === 'crypto' ? 'CRYPTO' : 'STOCK'}
          </span>
        </div>
        {priceData?.name && (
          <div style={{ fontSize: 11, color: '#6e7681', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {priceData.name}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div style={{ flexShrink: 0 }}>
        <Sparkline data={sparklineData} positive={positive} width={72} height={28} />
      </div>

      {/* Price & change */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>
          {hasData ? formatPrice(priceData.price) : (
            <span style={{ color: '#6e7681', fontSize: 11 }}>loading…</span>
          )}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: changeColor }}>
          {hasData ? formatChange(priceData.change24h) : '—'}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(symbol)}
        title="Remove from watchlist"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: '#6e7681',
          fontSize: 16,
          opacity: 0,
          transition: 'opacity 0.15s, color 0.15s',
        }}
        className="group-hover:opacity-100"
        onMouseEnter={(e) => { e.currentTarget.style.color = '#f85149'; e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#6e7681'; }}
      >
        ×
      </button>
    </div>
  );
}
