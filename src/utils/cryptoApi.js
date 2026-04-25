import { CRYPTO_IDS } from './constants';

const CG_BASE = 'https://api.coingecko.com/api/v3';

// Reverse map: coinGeckoId -> symbol
const ID_TO_SYMBOL = Object.fromEntries(
  Object.entries(CRYPTO_IDS).map(([sym, id]) => [id, sym])
);

export async function fetchCryptoPrices(symbols) {
  const ids = symbols
    .map((s) => CRYPTO_IDS[s.toUpperCase()])
    .filter(Boolean)
    .join(',');

  if (!ids) return {};

  const url = `${CG_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

  const data = await res.json();
  const result = {};

  for (const coin of data) {
    const symbol = ID_TO_SYMBOL[coin.id];
    if (symbol) {
      result[symbol] = {
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price || [],
        name: coin.name,
        image: coin.image,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
      };
    }
  }

  return result;
}

export async function searchCrypto(query) {
  const upper = query.toUpperCase().trim();

  // Direct symbol match
  if (CRYPTO_IDS[upper]) {
    return { symbol: upper, type: 'crypto', coinGeckoId: CRYPTO_IDS[upper] };
  }

  // Search via CoinGecko
  const res = await fetch(`${CG_BASE}/search?query=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const coin = data.coins?.[0];
  if (!coin) return null;

  const sym = coin.symbol.toUpperCase();
  // Cache for future use
  CRYPTO_IDS[sym] = coin.id;
  ID_TO_SYMBOL[coin.id] = sym;

  return { symbol: sym, type: 'crypto', coinGeckoId: coin.id, name: coin.name };
}

export function isCryptoSymbol(symbol) {
  return Boolean(CRYPTO_IDS[symbol.toUpperCase()]);
}
