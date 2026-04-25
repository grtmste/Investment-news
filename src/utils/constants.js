export const NEWS_SOURCES = [
  // Stocks & Investing
  {
    id: 'yahoo-finance', name: 'Yahoo Finance', category: 'stocks',
    rss: 'https://finance.yahoo.com/news/rssindex',
  },
  {
    id: 'cnbc', name: 'CNBC', category: 'stocks',
    rss: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  },
  {
    id: 'reuters', name: 'Reuters', category: 'stocks',
    rss: 'https://feeds.reuters.com/reuters/businessNews',
  },
  {
    id: 'investors-com', name: 'Investors.com', category: 'stocks',
    rss: 'https://www.investors.com/feed/',
  },
  {
    id: 'investment-news', name: 'InvestmentNews', category: 'stocks',
    rss: 'https://www.investmentnews.com/feed/',
  },
  {
    id: 'wsj', name: 'WSJ', category: 'stocks',
    rss: 'https://feeds.a.wsj.com/rss/WSJcomUSBusiness.xml',
  },
  {
    id: 'seeking-alpha', name: 'Seeking Alpha', category: 'stocks',
    rss: 'https://seekingalpha.com/market_currents.xml',
  },
  {
    id: 'bloomberg', name: 'Bloomberg', category: 'stocks',
    rss: 'https://feeds.bloomberg.com/markets/news.rss',
  },

  // ARK Invest
  {
    id: 'ark-invest', name: 'ARK Invest', category: 'ark',
    rss: 'https://ark-invest.com/feed/',
  },
  {
    id: 'ark-funds', name: 'ARK Funds', category: 'ark',
    rss: 'https://ark-funds.com/feed/',
  },

  // Crypto
  {
    id: 'coindesk', name: 'CoinDesk', category: 'crypto',
    rss: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
  },
  {
    id: 'cointelegraph', name: 'CoinTelegraph', category: 'crypto',
    rss: 'https://cointelegraph.com/rss',
  },
  {
    id: 'decrypt', name: 'Decrypt', category: 'crypto',
    rss: 'https://decrypt.co/feed',
  },
  {
    id: 'crypto-news', name: 'Crypto.news', category: 'crypto',
    rss: 'https://crypto.news/feed/',
  },
];

// CoinGecko coin ID mapping
export const CRYPTO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  XRP: 'ripple',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  NEAR: 'near',
  SHIB: 'shiba-inu',
  BNB: 'binancecoin',
  TRX: 'tron',
  TON: 'the-open-network',
  APE: 'apecoin',
  ARB: 'arbitrum',
  OP: 'optimism',
  INJ: 'injective-protocol',
  SUI: 'sui',
};

export const DEFAULT_WATCHLIST = [
  { symbol: 'BTC', type: 'crypto' },
  { symbol: 'ETH', type: 'crypto' },
  { symbol: 'SOL', type: 'crypto' },
  { symbol: 'AAPL', type: 'stock' },
  { symbol: 'TSLA', type: 'stock' },
  { symbol: 'NVDA', type: 'stock' },
  { symbol: 'SPY', type: 'stock' },
  { symbol: 'QQQ', type: 'stock' },
];

export const TICKER_DEFAULTS = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA', 'NVDA', 'SPY', 'QQQ'];

export const REFRESH_INTERVALS = {
  NEWS: 15 * 60 * 1000,
  PRICES: 60 * 1000,
};
