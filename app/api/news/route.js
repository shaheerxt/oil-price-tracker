import { NextResponse } from 'next/server';

export const revalidate = 300;

async function fetchOilNews() {
  const feeds = [
    {
      url: 'https://news.google.com/rss/search?q=oil+price+crude+brent+war+energy&hl=en&gl=US&ceid=US:en',
      source: 'Google News',
    },
  ];

  const articles = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      });

      if (!res.ok) continue;

      const xml = await res.text();

      // Simple XML extraction
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 12)) {
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() || '';
        const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
        const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
        const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() || feed.source;

        if (title && link) {
          articles.push({
            title: decodeHTMLEntities(title),
            url: link,
            source,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch news from ${feed.source}:`, e.message);
    }
  }

  // Sort by date, newest first
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return articles.slice(0, 10);
}

function decodeHTMLEntities(text) {
  const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => entities[m] || m);
}

function getFallbackNews() {
  return [
    {
      title: 'Oil prices ease but Brent remains above $100 amid Iran war concerns',
      url: 'https://www.reuters.com/business/energy/',
      source: 'Reuters',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Strait of Hormuz tensions keep energy markets on edge',
      url: 'https://www.reuters.com/world/middle-east/',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      title: 'US strikes on Kharg Island military sites push oil to 2022 highs',
      url: 'https://www.reuters.com/business/energy/',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      title: 'OPEC+ members cut supplies as Middle East conflict escalates',
      url: 'https://www.reuters.com/business/energy/',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
}

export async function GET() {
  try {
    const articles = await fetchOilNews();

    if (articles.length === 0) {
      return NextResponse.json({
        articles: getFallbackNews(),
        _meta: { source: 'fallback', timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      articles,
      _meta: { source: 'google_news_rss', timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({
      articles: getFallbackNews(),
      _meta: { source: 'fallback', error: error.message, timestamp: new Date().toISOString() },
    });
  }
}
