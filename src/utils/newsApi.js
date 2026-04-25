const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

export async function fetchRssFeed(rssUrl, count = 20) {
  const url = `${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}&count=${count}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'Feed error');

  return data.items.map((item) => ({
    id: item.guid || item.link,
    title: cleanText(item.title),
    url: item.link,
    sourceFeedTitle: data.feed?.title || '',
    publishedAt: new Date(item.pubDate),
    summary: cleanText(item.description).slice(0, 220),
    thumbnail: item.thumbnail || extractFirstImage(item.description) || extractFirstImage(item.content),
  }));
}

function cleanText(html) {
  if (!html) return '';
  return html
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

export function formatLocalTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
