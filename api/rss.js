const UA = 'Mozilla/5.0 (compatible; InvestFeed/1.0; +https://github.com)';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    const text = await r.text();
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
