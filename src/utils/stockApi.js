// Stock data via Vite dev server proxy (server-side fetch, no CORS issues).
// Production fallback: allorigins.win CORS proxy.

async function devFetch(path) {
  const res = await fetch(path, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function prodYahooFetch(yahooUrl) {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;
  const res = await fetch(proxy, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const wrapper = await res.json();
  return JSON.parse(wrapper.contents);
}

export async function fetchStockPrices(symbols) {
  if (!symbols.length) return {};

  let data;
  if (import.meta.env.DEV) {
    data = await devFetch(`/api/stock?symbols=${symbols.join(',')}`);
  } else {
    data = await prodYahooFetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
    );
  }

  const result = {};
  for (const quote of data.quoteResponse?.result || []) {
    result[quote.symbol] = {
      price: quote.regularMarketPrice,
      change24h: quote.regularMarketChangePercent,
      name: quote.shortName || quote.longName || quote.symbol,
    };
  }
  return result;
}

export async function fetchStockSparkline(symbol) {
  try {
    let data;
    if (import.meta.env.DEV) {
      data = await devFetch(`/api/stock-chart?symbol=${symbol}`);
    } else {
      data = await prodYahooFetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`
      );
    }
    return data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
  } catch {
    return [];
  }
}

export async function searchStock(query) {
  const symbol = query.toUpperCase().trim();
  try {
    let data;
    if (import.meta.env.DEV) {
      data = await devFetch(`/api/stock?symbols=${symbol}`);
    } else {
      data = await prodYahooFetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
      );
    }
    const quote = data.quoteResponse?.result?.[0];
    if (!quote) return null;
    return { symbol: quote.symbol, type: 'stock', name: quote.shortName || quote.symbol };
  } catch {
    return null;
  }
}
