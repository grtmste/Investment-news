import { useState, useCallback } from 'react';
import AssetRow from './AssetRow';
import { searchCrypto, isCryptoSymbol } from '../utils/cryptoApi';
import { searchStock } from '../utils/stockApi';

export default function WatchlistPanel({ watchlist, prices, getSparkline, addToWatchlist, removeFromWatchlist, lastUpdated }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    const sym = query.trim().toUpperCase();
    if (!sym) return;

    if (watchlist.some((a) => a.symbol === sym)) {
      setSearchError(`${sym} is already in your watchlist`);
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      let asset = null;
      if (isCryptoSymbol(sym)) {
        asset = await searchCrypto(sym);
      } else {
        // Try stock first, then crypto
        try {
          asset = await searchStock(sym);
        } catch {}
        if (!asset) {
          asset = await searchCrypto(sym);
        }
      }

      if (!asset) {
        setSearchError(`"${sym}" not found. Check the symbol and try again.`);
      } else {
        addToWatchlist(asset);
        setQuery('');
        setSearchError('');
      }
    } catch (err) {
      setSearchError(`Search failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  }, [query, watchlist, addToWatchlist]);

  const cryptoAssets = watchlist.filter((a) => a.type === 'crypto');
  const stockAssets = watchlist.filter((a) => a.type === 'stock');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#161b22',
        borderLeft: '1px solid #30363d',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid #30363d',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Watchlist
          </span>
          {lastUpdated && (
            <span style={{ fontSize: 10, color: '#6e7681' }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchError(''); }}
            placeholder="Add symbol (BTC, AAPL…)"
            disabled={searching}
            style={{
              flex: 1,
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              color: '#e6edf3',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#58a6ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#30363d'; }}
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            style={{
              background: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: searching || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: searching || !query.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {searching ? '…' : '+'}
          </button>
        </form>

        {searchError && (
          <div style={{ fontSize: 11, color: '#f85149', marginTop: 6 }}>{searchError}</div>
        )}
      </div>

      {/* Asset list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Crypto section */}
        {cryptoAssets.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#3fb950', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Crypto
            </div>
            {cryptoAssets.map((asset) => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                priceData={prices[asset.symbol]}
                sparklineData={getSparkline(asset.symbol, asset.type)}
                onRemove={removeFromWatchlist}
              />
            ))}
          </div>
        )}

        {/* Stocks section */}
        {stockAssets.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#58a6ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Stocks & ETFs
            </div>
            {stockAssets.map((asset) => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                priceData={prices[asset.symbol]}
                sparklineData={getSparkline(asset.symbol, asset.type)}
                onRemove={removeFromWatchlist}
              />
            ))}
          </div>
        )}

        {watchlist.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
            <div>Your watchlist is empty.</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Search for a symbol above to add it.</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid #21262d',
          fontSize: 10,
          color: '#6e7681',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} className="live-dot" />
        <span>Prices auto-refresh every 60s • Watchlist saved to browser</span>
      </div>
    </div>
  );
}
