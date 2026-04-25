import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_WATCHLIST, REFRESH_INTERVALS } from '../utils/constants';
import { fetchCryptoPrices } from '../utils/cryptoApi';
import { fetchStockPrices, fetchStockSparkline } from '../utils/stockApi';

const STORAGE_KEY = 'investfeed_watchlist_v2';

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_WATCHLIST;
}

function saveWatchlist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function usePrices() {
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [prices, setPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const sparklineFetched = useRef(new Set());

  const fetchPrices = useCallback(async () => {
    const cryptoSymbols = watchlist.filter((a) => a.type === 'crypto').map((a) => a.symbol);
    const stockSymbols = watchlist.filter((a) => a.type === 'stock').map((a) => a.symbol);

    const [cryptoResult, stockResult] = await Promise.allSettled([
      cryptoSymbols.length ? fetchCryptoPrices(cryptoSymbols) : Promise.resolve({}),
      stockSymbols.length ? fetchStockPrices(stockSymbols) : Promise.resolve({}),
    ]);

    setPrices((prev) => ({
      ...prev,
      ...(cryptoResult.status === 'fulfilled' ? cryptoResult.value : {}),
      ...(stockResult.status === 'fulfilled' ? stockResult.value : {}),
    }));

    if (cryptoResult.status === 'rejected' && stockResult.status === 'rejected') {
      setPriceError('Could not load prices. Check your connection.');
    } else {
      setPriceError(null);
    }

    setLastUpdated(new Date());
    setPriceLoading(false);
  }, [watchlist]);

  const fetchSparklines = useCallback(async () => {
    const stockSymbols = watchlist
      .filter((a) => a.type === 'stock' && !sparklineFetched.current.has(a.symbol))
      .map((a) => a.symbol);

    if (!stockSymbols.length) return;

    const results = await Promise.allSettled(
      stockSymbols.map((sym) =>
        fetchStockSparkline(sym).then((data) => ({ sym, data }))
      )
    );

    const newSparklines = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.data.length) {
        newSparklines[r.value.sym] = r.value.data;
        sparklineFetched.current.add(r.value.sym);
      }
    });

    if (Object.keys(newSparklines).length) {
      setSparklines((prev) => ({ ...prev, ...newSparklines }));
    }
  }, [watchlist]);

  useEffect(() => {
    fetchPrices();
    fetchSparklines();
    const interval = setInterval(fetchPrices, REFRESH_INTERVALS.PRICES);
    return () => clearInterval(interval);
  }, [fetchPrices, fetchSparklines]);

  const addToWatchlist = useCallback((asset) => {
    setWatchlist((prev) => {
      if (prev.some((a) => a.symbol === asset.symbol)) return prev;
      const next = [...prev, { symbol: asset.symbol, type: asset.type }];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist((prev) => {
      const next = prev.filter((a) => a.symbol !== symbol);
      saveWatchlist(next);
      sparklineFetched.current.delete(symbol);
      return next;
    });
  }, []);

  const getSparkline = useCallback(
    (symbol, type) => {
      if (type === 'crypto') return prices[symbol]?.sparkline || [];
      return sparklines[symbol] || [];
    },
    [prices, sparklines]
  );

  return {
    watchlist,
    prices,
    priceLoading,
    priceError,
    lastUpdated,
    addToWatchlist,
    removeFromWatchlist,
    getSparkline,
    refresh: fetchPrices,
  };
}
