// Uses Vite dev proxy (/api/yahoo) in development.
// In production, falls back to CORS proxy.
const PROD_PROXY = 'https://api.allorigins.win/get?url=';
const YF_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=';
const YF_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart/';

function isDev() {
  return import.meta.env.DEV;
}

async function yahooFetch(path) {
  if (isDev()) {
    const res = await fetch(`/api/yahoo${path}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status}`);
    return res.json();
  }

  // Production: use allorigins CORS proxy
  const fullUrl = `https://query1.finance.yahoo.com${path}`;
  const res = await fetch(`${PROD_PROXY}${encodeURIComponent(fullUrl)}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const wrapper = await res.json();
  return JSON.parse(wrapper.contents);
}

export async function fetchStockPrices(symbols) {
  if (!symbols.length) return {};

  const data = await yahooFetch(`/v7/finance/quote?symbols=${symbols.join(',')}`);
  const result = {};

  for (const quote of data.quoteResponse?.result || []) {
    result[quote.symbol] = {
      price: quote.regularMarketPrice,
      change24h: quote.regularMarketChangePercent,
      name: quote.shortName || quote.longName || quote.symbol,
      prevClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
    };
  }

  return result;
}

export async function fetchStockSparkline(symbol) {
  const data = await yahooFetch(`/v8/finance/chart/${symbol}?interval=1d&range=7d`);
  return data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
}

export async function searchStock(query) {
  const symbol = query.toUpperCase().trim();
  const data = await yahooFetch(`/v7/finance/quote?symbols=${symbol}`);
  const quote = data.quoteResponse?.result?.[0];
  if (!quote) return null;
  return { symbol: quote.symbol, type: 'stock', name: quote.shortName || quote.symbol };
}
