const USER = require(`./user`);
const BLOG = require(`./blog`);
const COMMENT = require(`./comment`);
const IMG = require(`./img`);
const BLOG_IMG = require(`./blogImg`);
const BLOG_IMG_ALT = require(`./blogImgAlt`);
const IDOL_FANS = require(`./idolFans`);
const ARTICLE_READER = require(`./articleReader`);
const MSG_RECEIVER = require(`./msgReceiver`);
const NEWS = require(`./news`);
const FIREBASE = require(`./firebase`);
const CACHE = require(`./cache`);
const SERVER = require(`./server`);

module.exports = {
  SERVER,
  CACHE,
  MSG_RECEIVER,
  COMMENT,
  BLOG_IMG,
  BLOG,
  ARTICLE_READER,
  IDOL_FANS,
  NEWS,
  USER,
  BLOG_IMG_ALT,
  IMG,
  FIREBASE,
};
