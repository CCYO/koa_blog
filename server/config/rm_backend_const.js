const ErrRes = require("../model/errRes");
const { PATTERN } = require("../utils/validator/config");

const SQUARE = {
  PAGINATION: {
    BLOG_COUNT: 5,
    PAGE_COUNT: 2,
  },
};
const ALBUM_LIST = {
  PAGINATION: {
    BLOG_COUNT: 5,
    PAGE_COUNT: 2,
  },
};
const NEWS = {
  FRONT_END_STATUS: {
    FIRST: 1, //  初次請求
    AGAIN: 2, //  已知仍有news條目未拉取
    CHECK: 3, //  以知news條目皆已拉取
  },
  TIME_FORMAT: "YYYY/MM/DD HH:mm:ss",
};
const COMMENT = {
  TIME_FORMAT: "YYYY/MM/DD HH:mm:ss",
};
const BLOG = {
  TIME_FORMAT: "YYYY/MM/DD HH:mm:ss",
  PAGINATION: {
    BLOG_COUNT: 5,
    PAGE_COUNT: 2,
  },
  //  僅有 STATUS 會被用在ejs的初始化(user/coponents/blog_card.ejs)
  STATUS: {
    PUBLIC: "public",
    //  ↑ ------------------------------------------------------------------
    PRIVATE: "private",
  },
  EDITOR: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 20,
    HTML_MIN_LENGTH: 1,
    HTML_MAX_LENGTH: 65535,
    IMG_MAX_SIZE: 1024 * 1024 * 10, // bytes
    IMG_EXT: ["JPG", "PNG"],
    IMG_ALT_MIN_LENGTH: 1,
    IMG_ALT_MAX_LENGTH: 20,
    IMG_ALT_PATTERN: "^[\\u4e00-\\u9fa5a-zA-Z\\d\\-_]+$",
  },
};
const USER = {
  AVATAR: {
    URL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    HASH: "6f6bbb16aec97391aefe120ec5a4e6a2",
    EXT: ["JPG", "PNG"],
    MAX_SIZE: 1024 * 1024 * 1,
  },
};
const QUERY_NEWS = {
  LIMIT: 2,
  TYPE: {
    IDOL_FANS: 1,
    ARTICLE_READER: 2,
    MSG_RECEIVER: 3,
  },
};
const CACHE = {
  TYPE: {
    NEWS: "newNews",
    PAGE: {
      USER: "userPage",
      BLOG: "blogPage",
    },
  },
  STATUS: {
    HAS_FRESH_CACHE: 0,
    NO_CACHE: 1,
    NO_IF_NONE_MATCH: 2, // 請求未攜帶 if-none-match
    IF_NONE_MATCH_IS_NO_FRESH: 3, //  請求 if-none-match 已過期
  },
};
const GFB = {
  BLOG_REF: "blogImg",
  AVATAR_REF: "avatar",
};
const UTILS = {
  REDIR_FROM: "from",
};

module.exports = {
  PATTERN,
  UTILS,
  ERR_RES: ErrRes,
  GFB,
  CACHE,
  QUERY_NEWS,
  USER,
  COMMENT,
  BLOG,
  NEWS,
  ALBUM_LIST,
  SQUARE,
};
