const _path = "../../src/config/const/errRes";
const USER = require(`${_path}/user.json`);
const BLOG = require(`${_path}/blog.json`);
const COMMENT = require(`${_path}/comment.json`);
const IMG = require(`${_path}/img.json`);
const BLOG_IMG = require(`${_path}/blogImg.json`);
const BLOG_IMG_ALT = require(`${_path}/blogImgAlt.json`);
const IDOL_FANS = require(`${_path}/idolFans.json`);
const ARTICLE_READER = require(`${_path}/articleReader.json`);
const MSG_RECEIVER = require(`${_path}/msgReceiver.json`);
const NEWS = require(`${_path}/news.json`);
const FIREBASE = require(`${_path}/firebase.json`);
const CACHE = require(`${_path}/cache.json`);
const SERVER = require(`${_path}/server.json`);

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
