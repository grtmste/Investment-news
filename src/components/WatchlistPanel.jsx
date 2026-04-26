import { useState, useCallback, useEffect, useRef } from 'react';
import AssetRow from './AssetRow';
import { searchCrypto, isCryptoSymbol } from '../utils/cryptoApi';
import { searchStock } from '../utils/stockApi';

/* ── Add-symbol modal ───────────────────────────────────────── */
function AddModal({ onClose, onAdd, existingSymbols }) {
  const [query, setQuery]     = useState('');
  const [searching, setSrch]  = useState(false);
  const [error, setError]     = useState('');
  const inputRef              = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    const sym = query.trim().toUpperCase();
    if (!sym) return;

    if (existingSymbols.includes(sym)) {
      setError(`${sym} is already in your watchlist.`);
      return;
    }

    setSrch(true);
    setError('');

    try {
      let asset = null;

      if (isCryptoSymbol(sym)) {
        asset = await searchCrypto(sym);
      } else {
        try { asset = await searchStock(sym); } catch {}
        if (!asset) asset = await searchCrypto(sym);
      }

      if (!asset) {
        setError(`"${sym}" not found. Check the symbol and try again.`);
      } else {
        onAdd(asset);
        onClose();
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    } finally {
      setSrch(false);
    }
  }, [query, existingSymbols, onAdd, onClose]);

  return (
    /* Backdrop */
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Add to Watchlist
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Enter a stock or crypto ticker symbol
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: 20, lineHeight: 1, padding: 4,
              borderRadius: 6, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, var(--gold), transparent)', marginBottom: 20, opacity: 0.4 }} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setError(''); }}
            placeholder="e.g. AAPL, MSFT, BTC, ETH…"
            disabled={searching}
            className={`input-gold${error ? ' error' : ''}`}
          />

          {error && (
            <div style={{
              marginTop: 8, fontSize: 12,
              color: 'var(--red)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Examples */}
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['NVDA', 'MSFT', 'BTC', 'SOL', 'DOGE'].map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => { setQuery(ex); setError(''); inputRef.current?.focus(); }}
                style={{
                  background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '2px 10px',
                  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.04em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn-gold"
              disabled={searching || !query.trim()}
            >
              {searching ? '⏳ Searching…' : '+ Add Symbol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main WatchlistPanel ────────────────────────────────────── */
export default function WatchlistPanel({
  watchlist, prices, priceLoading,
  getSparkline, addToWatchlist, removeFromWatchlist, lastUpdated,
}) {
  const [showModal, setShowModal] = useState(false);
  const existingSymbols = watchlist.map(a => a.symbol);

  const cryptoAssets = watchlist.filter(a => a.type === 'crypto');
  const stockAssets  = watchlist.filter(a => a.type === 'stock');

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-1px 0 0 var(--border-glow)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 0',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>Watchlist</div>
            {lastUpdated && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowModal(true)}
            title="Add symbol to watchlist"
            className="btn-gold"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            + Add
          </button>
        </div>

        {/* Gold accent line */}
        <div style={{ height: 1, background: 'linear-gradient(to right, var(--gold), transparent)', opacity: 0.3 }} />
      </div>

      {/* Asset list */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

        {/* Crypto section */}
        {cryptoAssets.length > 0 && (
          <div>
            <div style={{
              padding: '10px 16px 6px',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
              color: 'var(--green)', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Crypto
            </div>
            {cryptoAssets.map(asset => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                priceData={prices[asset.symbol]}
                sparklineData={getSparkline(asset.symbol, asset.type)}
                onRemove={removeFromWatchlist}
                globalLoading={priceLoading}
              />
            ))}
          </div>
        )}

        {/* Stocks section */}
        {stockAssets.length > 0 && (
          <div>
            <div style={{
              padding: '10px 16px 6px',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
              color: 'var(--gold)', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              Stocks & ETFs
            </div>
            {stockAssets.map(asset => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                priceData={prices[asset.symbol]}
                sparklineData={getSparkline(asset.symbol, asset.type)}
                onRemove={removeFromWatchlist}
                globalLoading={priceLoading}
              />
            ))}
          </div>
        )}

        {watchlist.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📈</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Your watchlist is empty</div>
            <div style={{ fontSize: 11, marginTop: 6, color: 'var(--text-muted)' }}>Click + Add to get started</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-muted)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} className="live-dot" />
        Prices refresh every 60s · Saved to browser
      </div>

      {/* Modal */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdd={addToWatchlist}
          existingSymbols={existingSymbols}
        />
      )}
    </div>
  );
}
