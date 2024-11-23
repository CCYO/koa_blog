module.exports = {
  TYPE: {
    NEWS_RESTORY: "confirm_news_restory",
    NEWS: "newNews",
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
};
