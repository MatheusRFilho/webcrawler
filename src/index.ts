import * as fetch from 'node-fetch';
import * as cherrio from 'cheerio';

const crawl = async ({ url }) => {
  const response = await fetch(url);
  const html = await response.text();

  const $ = cherrio.load(html);
  const links = $('a')
    .map((i, link) => link.attribs.href)
    .get();
  console.log(links);

  return true;
};

crawl({ url: 'http://localhost:10000/index.html' });
