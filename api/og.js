const UA = 'Mozilla/5.0 (compatible; InvestFeed/1.0; +https://github.com)';

function extractOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
    /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && !m[1].startsWith('data:')) return m[1].trim();
  }
  return null;
}

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ image: null });

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
    });

    if (!r.ok) {
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).json({ image: null });
    }

    // Read only first 80KB — og:image is always in <head>
    const reader = r.body.getReader();
    let html = '';
    let bytes = 0;
    while (bytes < 80_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
      bytes += value.length;
    }
    reader.cancel().catch(() => {});

    const image = extractOgImage(html);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Cache hit OG images for 24h, misses for 1h
    res.setHeader('Cache-Control', image ? 's-maxage=86400' : 's-maxage=3600');
    return res.status(200).json({ image });
  } catch {
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json({ image: null });
  }
}
