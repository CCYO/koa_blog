module.exports = {
  TYPE: {
    NEWS_RESTORY: "confirm_news_restory",
    NEWS: "newNews",
    REGISTER_CODE: "register_code",
    PAGE: {
      USER: "userPage",
      BLOG: "blogPage",
    },
  },
  STATUS: {
    HAS_FRESH_CACHE: 0,
    NO_CACHE: 1,
    //   請求未攜帶 if-none-match
    NO_IF_NONE_MATCH: 2,
    //   請求 if-none-match 已過期
    IF_NONE_MATCH_IS_NO_FRESH: 3,
  },
  REGISTER_CODE: {
    // 驗證碼有效期限(msec)
    TTL: 1 * 1000 * 60 * 10,
    // 多久可刷新(msec)
    REFRESH: 1 * 1000 * 60,
  },
};
