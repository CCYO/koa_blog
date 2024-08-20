const SERVER_CONST = require("./const/server.json");
const FRONTEND_CONST = require("./const/frontend.json");
const PATTERN = require("./const/pattern.json");
const ERR_RES = require("./const/errRes.json");

module.exports = genFRONTEND_CONFIG(
  FRONTEND_CONST,
  SERVER_CONST,
  PATTERN,
  ERR_RES
);

function genFRONTEND_CONFIG(FRONTEND_CONST, SERVER_CONST, PATTERN, ERR_RES) {
  FRONTEND_CONST.ALBUM_LIST.PAGINATION = {
    BLOG_COUNT: SERVER_CONST.ALBUM_LIST.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: SERVER_CONST.ALBUM_LIST.PAGINATION.PAGE_COUNT,
  };
  FRONTEND_CONST.ALBUM_LIST.DATASET.VALUE.BLOG_STATUS_PUBLIC =
    SERVER_CONST.BLOG.STATUS.PUBLIC;

  // FRONTEND_CONST.BLOG_EDIT.EDITOR = {
  //   // 單位byte
  //   IMG_MAX_SIZE: SERVER_CONST.BLOG.EDITOR.IMG_MAX_SIZE,
  //   HTML_MAX_LENGTH: SERVER_CONST.BLOG.EDITOR.HTML_MAX_LENGTH,
  //   HTML_MIN_LENGTH: SERVER_CONST.BLOG.EDITOR.HTML_MIN_LENGTH,
  // };

  // FRONTEND_CONST.BLOG_EDIT.REG.X_IMG_PARSE_TO_IMG = PATTERN.X_IMG_PARSE_TO_IMG;
  // FRONTEND_CONST.BLOG_EDIT.REG.IMG_PARSE_TO_X_IMG = PATTERN.IMG_PARSE_TO_X_IMG;

  // FRONTEND_CONST.BLOG.REG.X_IMG_PARSE_TO_IMG = PATTERN.X_IMG_PARSE_TO_IMG;

  // FRONTEND_CONST.SETTING.AVATAR = {
  //   URL: SERVER_CONST.USER.AVATAR.URL,
  //   EXT: SERVER_CONST.USER.AVATAR.EXT,
  //   //MAX_SIZE:  "單位byte",
  //   MAX_SIZE: SERVER_CONST.USER.AVATAR.MAX_SIZE,
  // };

  FRONTEND_CONST.USER.PAGINATION = {
    BLOG_COUNT: SERVER_CONST.BLOG.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: SERVER_CONST.BLOG.PAGINATION.PAGE_COUNT,
  };
  FRONTEND_CONST.USER.DATASET.VALUE.BLOG_STATUS_PUBLIC =
    SERVER_CONST.BLOG.STATUS.PUBLIC;

  FRONTEND_CONST.SQUARE.PAGINATION = {
    BLOG_COUNT: SERVER_CONST.SQUARE.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: SERVER_CONST.SQUARE.PAGINATION.PAGE_COUNT,
  };
  FRONTEND_CONST.SQUARE.DATASET.VALUE.BLOG_STATUS_PUBLIC =
    SERVER_CONST.BLOG.STATUS.PUBLIC;

  // FRONTEND_CONST.NAVBAR = {
  //   NEWS: {
  //     STATUS: {
  //       FIRST: SERVER_CONST.NEWS.FRONT_END_STATUS.FIRST,
  //       AGAIN: SERVER_CONST.NEWS.FRONT_END_STATUS.AGAIN,
  //       CHECK: SERVER_CONST.NEWS.FRONT_END_STATUS.CHECK,
  //     },
  //     LIMIT: SERVER_CONST.QUERY_NEWS.LIMIT,
  //     TIME_FORMAT: SERVER_CONST.NEWS.TIME_FORMAT,
  //   },
  // };
  // FRONTEND_CONST.INIT_EJS = {
  //   ALBUM_LIST: {
  //     PAGINATION: {
  //       BLOG_COUNT: SERVER_CONST.ALBUM_LIST.PAGINATION.BLOG_COUNT,
  //       PAGE_COUNT: SERVER_CONST.ALBUM_LIST.PAGINATION.PAGE_COUNT,
  //     },
  //   },
  // };

  // FRONTEND_CONST.REDIR = {
  //   FROM: SERVER_CONST.UTILS.REDIR_FROM,
  // };

  FRONTEND_CONST._AXIOS = {
    ERR_RES: {
      NEWS_NO_LOGIN: ERR_RES.NEWS.READ.NO_LOGIN,
      NO_LOGIN: ERR_RES.SERVER.RESPONSE.NO_LOGIN,
    },
  };

  return FRONTEND_CONST;
}
