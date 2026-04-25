import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import TickerStrip from './components/TickerStrip';
import NewsFeed from './components/NewsFeed';
import WatchlistPanel from './components/WatchlistPanel';
import { useNews } from './hooks/useNews';
import { usePrices } from './hooks/usePrices';

export default function App() {
  const {
    articles,
    loading: newsLoading,
    lastUpdated: newsLastUpdated,
    sourceStatus,
    refresh: refreshNews,
  } = useNews();

  const {
    watchlist,
    prices,
    priceLoading,
    priceError,
    lastUpdated: priceLastUpdated,
    addToWatchlist,
    removeFromWatchlist,
    getSparkline,
    refresh: refreshPrices,
  } = usePrices();

  // Refresh clock in TopBar
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#0d1117',
      }}
    >
      {/* Top bar */}
      <TopBar
        onRefreshNews={refreshNews}
        onRefreshPrices={refreshPrices}
        newsLoading={newsLoading}
        priceLoading={priceLoading}
        lastNewsUpdate={newsLastUpdated}
      />

      {/* Ticker strip */}
      <TickerStrip watchlist={watchlist} prices={prices} />

      {/* Error banner for prices */}
      {priceError && !priceLoading && (
        <div
          style={{
            background: 'rgba(248,81,73,0.1)',
            borderBottom: '1px solid rgba(248,81,73,0.3)',
            padding: '6px 20px',
            fontSize: 12,
            color: '#f85149',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span>⚠</span>
          <span>{priceError} Stock prices require the dev server proxy (run <code style={{ background: '#21262d', padding: '1px 4px', borderRadius: 3 }}>npm run dev</code>) or a CORS proxy in production.</span>
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* News feed — 60% */}
        <div style={{ flex: '0 0 60%', minWidth: 0, overflow: 'hidden' }}>
          <NewsFeed
            articles={articles}
            loading={newsLoading}
            lastUpdated={newsLastUpdated}
            sourceStatus={sourceStatus}
            refresh={refreshNews}
          />
        </div>

        {/* Watchlist — 40% */}
        <div style={{ flex: '0 0 40%', minWidth: 280, overflow: 'hidden' }}>
          <WatchlistPanel
            watchlist={watchlist}
            prices={prices}
            getSparkline={getSparkline}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
            lastUpdated={priceLastUpdated}
          />
        </div>
      </div>
    </div>
  );
}
