import * as fetch from 'node-fetch';
import * as cherrio from 'cheerio';

const seenUrl = {};
const crawl = async ({ url }) => {
  if (seenUrl[url]) {
    return;
  }
  console.log('crawling', url);
  seenUrl[url] = true;
  const response = await fetch(url);
  const html = await response.text();

  const $ = cherrio.load(html);
  const links = $('a')
    .map((i, link) => link.attribs.href)
    .get();
  links.forEach((link) => {
    crawl({
      url: getUrl(link),
    });
  });

  return true;
};

const getUrl = (link) => {
  if (link.includes('http')) {
    return link;
  } else if (link.startsWith('/')) {
    return `http://localhost:10000${link}`;
  } else {
    return `http://localhost:10000/${link}`;
  }
};

crawl({ url: 'http://localhost:10000/index.html' });
