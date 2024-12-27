export default {
  STATUS: {
    //初次請求
    FIRST: 1,
    //已知仍有news條目未拉取
    AGAIN: 2,
    //已知news條目皆已拉取
    CHECK: 3,
  },
  TYPE: {
    IDOL_FANS: 1,
    ARTICLE_READER: 2,
    MSG_RECEIVER: 3,
  },
  LIMIT: 5,
};
