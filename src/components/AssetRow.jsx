import { useState } from 'react';
import Sparkline from './Sparkline';

function fmtPrice(price) {
  if (price == null) return null;
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1000)  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1)     return '$' + price.toFixed(2);
  if (price >= 0.01)  return '$' + price.toFixed(4);
  return '$' + price.toFixed(6);
}

function fmtChange(change) {
  if (change == null) return null;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

export default function AssetRow({ asset, priceData, sparklineData, onRemove, globalLoading }) {
  const [hovered, setHovered] = useState(false);
  const { symbol, type } = asset;
  const positive  = (priceData?.change24h ?? 0) >= 0;
  const hasPrice  = priceData?.price != null;
  const changeStr = hasPrice ? fmtChange(priceData.change24h) : null;
  const priceStr  = hasPrice ? fmtPrice(priceData.price) : null;
  const changeColor = hasPrice ? (positive ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.15s ease',
        cursor: 'default',
      }}
    >
      {/* Live dot */}
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: hasPrice ? (positive ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)',
        opacity: hasPrice ? 1 : 0.3,
      }} />

      {/* Symbol + type */}
      <div style={{ flex: '1 1 0', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
            {symbol}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
            padding: '1px 6px', borderRadius: 12,
            ...(type === 'crypto'
              ? { background: 'rgba(46,204,113,0.12)', color: 'var(--green)' }
              : { background: 'var(--gold-glow)', color: 'var(--gold)' }),
          }}>
            {type === 'crypto' ? 'CRYPTO' : 'STOCK'}
          </span>
        </div>
        {priceData?.name && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {priceData.name}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div style={{ flexShrink: 0 }}>
        <Sparkline data={sparklineData} positive={positive} width={68} height={26} />
      </div>

      {/* Price + change */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 82 }}>
        {priceStr ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {priceStr}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: changeColor, fontFamily: 'monospace' }}>
              {changeStr}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {globalLoading ? 'loading…' : 'N/A'}
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(symbol); }}
        title="Remove from watchlist"
        style={{
          flexShrink: 0,
          width: 22, height: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: `1px solid ${hovered ? 'var(--red)30' : 'transparent'}`,
          background: hovered ? 'rgba(231,76,60,0.1)' : 'transparent',
          cursor: 'pointer',
          color: hovered ? 'var(--red)' : 'transparent',
          fontSize: 14, lineHeight: 1,
          transition: 'all 0.2s ease',
        }}
      >
        ×
      </button>
    </div>
  );
}
