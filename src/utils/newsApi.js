// Fetches RSS directly via CORS proxy and parses XML in the browser.
// No third-party RSS-to-JSON service dependency.

const PROXY_ALLORIGINS = (url) =>
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

const PROXY_CORSPROXY = (url) =>
  `https://corsproxy.io/?${encodeURIComponent(url)}`;

async function fetchXml(url) {
  // Try allorigins first — returns { contents: "<xml...>" }
  try {
    const res = await fetch(PROXY_ALLORIGINS(url), { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const data = await res.json();
      if (data.contents && data.contents.trim().length > 50) return data.contents;
    }
  } catch {}

  // Fall back to corsproxy.io — returns raw content
  const res = await fetch(PROXY_CORSPROXY(url), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function fetchRssFeed(rssUrl, count = 20) {
  const xml = await fetchXml(rssUrl);
  return parseRssXml(xml, count);
}

function parseRssXml(xmlStr, count) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('XML parse error');
  }

  // Support RSS <item> and Atom <entry>
  const items = [
    ...Array.from(doc.querySelectorAll('item')),
    ...Array.from(doc.querySelectorAll('entry')),
  ].slice(0, count);

  if (!items.length) throw new Error('No feed items found');

  return items
    .map((item) => {
      const title = nodeText(item, 'title');
      const link = rssLink(item);
      const pubDate =
        nodeText(item, 'pubDate') ||
        nodeText(item, 'published') ||
        nodeText(item, 'updated') ||
        nodeText(item, 'dc:date');
      const description =
        nodeText(item, 'description') ||
        nodeText(item, 'summary') ||
        nodeText(item, 'content\\:encoded') ||
        nodeText(item, 'content');
      const guid = nodeText(item, 'guid') || nodeText(item, 'id');
      const enclosure = item.querySelector('enclosure[type^="image"]');
      const mediaThumb =
        item.querySelector('media\\:thumbnail') ||
        item.querySelector('thumbnail');

      return {
        id: guid || link || title,
        title: cleanText(title),
        url: link,
        publishedAt: pubDate ? new Date(pubDate) : new Date(0),
        summary: cleanText(description).slice(0, 220),
        thumbnail:
          mediaThumb?.getAttribute('url') ||
          enclosure?.getAttribute('url') ||
          extractFirstImage(description),
      };
    })
    .filter((item) => item.url && item.title);
}

function nodeText(parent, tag) {
  return (
    parent.getElementsByTagName(tag)[0]?.textContent?.trim() || ''
  );
}

function rssLink(item) {
  // Atom uses <link href="..."/>, RSS uses <link>url</link>
  const linkEl = item.querySelector('link');
  if (!linkEl) return '';
  return (
    linkEl.getAttribute('href') || linkEl.textContent?.trim() || ''
  );
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return m ? m[1] : null;
}

export function timeAgo(date) {
  if (!date || isNaN(date.getTime())) return '';
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
