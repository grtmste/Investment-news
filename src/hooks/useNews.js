import { useState, useEffect, useCallback } from 'react';
import { NEWS_SOURCES, REFRESH_INTERVALS } from '../utils/constants';
import { fetchRssFeed } from '../utils/newsApi';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sourceStatus, setSourceStatus] = useState({});

  const fetchAllNews = useCallback(async () => {
    setLoading(true);
    const status = {};

    const results = await Promise.allSettled(
      NEWS_SOURCES.map((source) =>
        fetchRssFeed(source.rss, 20).then((items) =>
          items.map((item) => ({
            ...item,
            category: source.category,
            sourceName: source.name,
            sourceId: source.id,
          }))
        )
      )
    );

    const allArticles = [];
    results.forEach((result, i) => {
      const src = NEWS_SOURCES[i];
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
        status[src.id] = 'ok';
      } else {
        status[src.id] = 'error';
      }
    });

    // Deduplicate by URL
    const seen = new Set();
    const unique = allArticles.filter((a) => {
      if (!a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    // Sort newest first, filter out future dates
    const now = Date.now();
    unique
      .filter((a) => a.publishedAt && a.publishedAt.getTime() <= now)
      .sort((a, b) => b.publishedAt - a.publishedAt);

    unique.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));

    setArticles(unique);
    setSourceStatus(status);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllNews();
    const interval = setInterval(fetchAllNews, REFRESH_INTERVALS.NEWS);
    return () => clearInterval(interval);
  }, [fetchAllNews]);

  return { articles, loading, lastUpdated, sourceStatus, refresh: fetchAllNews };
}
