import * as fetch from 'node-fetch';
import * as cherrio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

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

  const imagesUrls = $('img')
    .map((i, img) => img.attribs.src)
    .get();

  imagesUrls.forEach((imagesUrl) => {
    fetch(getUrl(imagesUrl)).then((response) => {
      const fileName = path.basename(imagesUrl);
      const dest = fs.createWriteStream(`images/${fileName}`);
      response.body.pipe(dest);
    });
  });

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
