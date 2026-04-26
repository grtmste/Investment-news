import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cached Yahoo Finance auth (crumb + cookie), refreshed every 30 min
let yahooAuth = { crumb: null, cookie: null, ts: 0 };

async function getYahooAuth() {
  if (yahooAuth.crumb && Date.now() - yahooAuth.ts < 30 * 60 * 1000) {
    return yahooAuth;
  }
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // Yahoo requires a session cookie + crumb for quote API
  const r1 = await fetch('https://fc.yahoo.com/', {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  const setCookieHeader = r1.headers.get('set-cookie') || '';
  const cookie = setCookieHeader.split(',')
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');

  const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  if (!r2.ok) throw new Error(`Crumb HTTP ${r2.status}`);
  const crumb = await r2.text();

  yahooAuth = { crumb, cookie, ts: Date.now() };
  return yahooAuth;
}

const devServerPlugin = {
  name: 'investfeed-dev-proxy',
  configureServer(server) {
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    server.middlewares.use(async (req, res, next) => {
      let pathname;
      try {
        pathname = new URL(req.url, 'http://localhost').pathname;
      } catch {
        return next();
      }

      // ── /api/rss?url=ENCODED_RSS_URL ──────────────────────────────────────
      if (pathname === '/api/rss') {
        const targetUrl = new URL(req.url, 'http://localhost').searchParams.get('url');
        if (!targetUrl) { res.statusCode = 400; return res.end('Missing url'); }

        try {
          const r = await fetch(targetUrl, {
            headers: {
              'User-Agent': UA,
              Accept: 'application/rss+xml, application/xml, text/xml, */*',
              'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(12000),
          });
          const text = await r.text();
          res.setHeader('Content-Type', 'text/xml; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = r.ok ? 200 : r.status;
          return res.end(text);
        } catch (err) {
          res.statusCode = 502;
          return res.end(JSON.stringify({ error: err.message }));
        }
      }

      // ── /api/stock?symbols=AAPL,TSLA ──────────────────────────────────────
      if (pathname === '/api/stock') {
        const symbols = new URL(req.url, 'http://localhost').searchParams.get('symbols');
        if (!symbols) { res.statusCode = 400; return res.end('Missing symbols'); }

        try {
          const auth = await getYahooAuth();
          const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&crumb=${encodeURIComponent(auth.crumb)}`;
          const r = await fetch(quoteUrl, {
            headers: { 'User-Agent': UA, Cookie: auth.cookie },
            signal: AbortSignal.timeout(10000),
          });
          const text = await r.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(text);
        } catch (err) {
          res.statusCode = 502;
          return res.end(JSON.stringify({ error: err.message }));
        }
      }

      // ── /api/stock-chart?symbol=AAPL ──────────────────────────────────────
      if (pathname === '/api/stock-chart') {
        const symbol = new URL(req.url, 'http://localhost').searchParams.get('symbol');
        if (!symbol) { res.statusCode = 400; return res.end('Missing symbol'); }

        try {
          const auth = await getYahooAuth();
          const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d&crumb=${encodeURIComponent(auth.crumb)}`;
          const r = await fetch(chartUrl, {
            headers: { 'User-Agent': UA, Cookie: auth.cookie },
            signal: AbortSignal.timeout(10000),
          });
          const text = await r.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(text);
        } catch (err) {
          res.statusCode = 502;
          return res.end(JSON.stringify({ error: err.message }));
        }
      }

      // ── /api/og?url=ARTICLE_URL ────────────────────────────────────────────
      if (pathname === '/api/og') {
        const targetUrl = new URL(req.url, 'http://localhost').searchParams.get('url');
        if (!targetUrl) { res.statusCode = 400; return res.end(JSON.stringify({ image: null })); }

        try {
          const r = await fetch(targetUrl, {
            headers: {
              'User-Agent': UA,
              Accept: 'text/html,application/xhtml+xml,*/*;q=0.9',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(7000),
          });

          let html = '';
          if (r.ok) {
            const reader = r.body.getReader();
            let bytes = 0;
            while (bytes < 80_000) {
              const { done, value } = await reader.read();
              if (done) break;
              html += new TextDecoder().decode(value);
              bytes += value.length;
            }
            reader.cancel().catch(() => {});
          }

          const patterns = [
            /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
            /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
          ];
          let image = null;
          for (const re of patterns) {
            const m = html.match(re);
            if (m?.[1] && !m[1].startsWith('data:')) { image = m[1].trim(); break; }
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(JSON.stringify({ image }));
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(JSON.stringify({ image: null }));
        }
      }

      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), devServerPlugin],
  server: {
    host: true,
    port: 5173,
  },
})
