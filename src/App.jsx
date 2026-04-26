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
    lastUpdated: priceLastUpdated,
    addToWatchlist,
    removeFromWatchlist,
    getSparkline,
    refresh: refreshPrices,
  } = usePrices();

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <TopBar
        onRefreshNews={refreshNews}
        onRefreshPrices={refreshPrices}
        newsLoading={newsLoading}
        priceLoading={priceLoading}
      />
      <TickerStrip watchlist={watchlist} prices={prices} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: '0 0 62%', minWidth: 0, overflow: 'hidden' }}>
          <NewsFeed
            articles={articles}
            loading={newsLoading}
            lastUpdated={newsLastUpdated}
            sourceStatus={sourceStatus}
            refresh={refreshNews}
          />
        </div>
        <div style={{ flex: '0 0 38%', minWidth: 300, overflow: 'hidden' }}>
          <WatchlistPanel
            watchlist={watchlist}
            prices={prices}
            priceLoading={priceLoading}
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
