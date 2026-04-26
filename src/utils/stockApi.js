// Stock data via /api/stock and /api/stock-chart.
// In dev: handled by Vite configureServer plugin.
// In prod: handled by Vercel serverless functions.

export async function fetchStockPrices(symbols) {
  if (!symbols.length) return {};

  const res = await fetch(`/api/stock?symbols=${symbols.join(',')}`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Stock API HTTP ${res.status}`);

  const data = await res.json();
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
    const res = await fetch(`/api/stock-chart?symbol=${symbol}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
  } catch {
    return [];
  }
}

export async function searchStock(query) {
  const symbol = query.toUpperCase().trim();
  try {
    const res = await fetch(`/api/stock?symbols=${symbol}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const quote = data.quoteResponse?.result?.[0];
    if (!quote) return null;
    return { symbol: quote.symbol, type: 'stock', name: quote.shortName || quote.symbol };
  } catch {
    return null;
  }
}
