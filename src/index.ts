import * as fetch from 'node-fetch';
import * as cherrio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as urlParser from 'url';

const seenUrl = {};
const crawl = async ({ url, ignore }) => {
  if (seenUrl[url]) {
    return;
  }
  console.log('crawling', url);
  seenUrl[url] = true;

  const { host, protocol } = urlParser.parse(url);

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
    fetch(getUrl(imagesUrl, host, protocol)).then((response) => {
      const fileName = path.basename(imagesUrl);
      const dest = fs.createWriteStream(`images/${fileName}`);
      response.body.pipe(dest);
    });
  });

  links
    .filter((link) => link.includes(host) && !link.includes(ignore))
    .forEach((link) => {
      crawl({
        url: getUrl(link, host, protocol),
        ignore,
      });
    });
};

const getUrl = (link, host, protocol) => {
  if (link.includes('http')) {
    return link;
  } else if (link.startsWith('/')) {
    return `${protocol}//${host}${link}`;
  } else {
    return `${protocol}//${host}/${link}`;
  }
};

crawl({ url: 'http://stevescooking.blogspot.com/', ignore: '/search' });
