const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

let _auth = null;

async function getAuth() {
  if (_auth && Date.now() - _auth.ts < 25 * 60 * 1000) return _auth;

  try {
    const r1 = await fetch('https://fc.yahoo.com/', {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    const raw = r1.headers.get('set-cookie') || '';
    const cookie = raw
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');

    const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: cookie },
      signal: AbortSignal.timeout(8000),
    });
    const crumb = r2.ok ? await r2.text() : '';

    _auth = { cookie, crumb, ts: Date.now() };
  } catch {
    _auth = { cookie: '', crumb: '', ts: Date.now() };
  }
  return _auth;
}

export default async function handler(req, res) {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'Missing symbols' });

  try {
    const auth = await getAuth();
    const crumbParam = auth.crumb ? `&crumb=${encodeURIComponent(auth.crumb)}` : '';
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}${crumbParam}`;

    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Cookie: auth.cookie,
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      },
      signal: AbortSignal.timeout(8000),
    });

    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=30');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
