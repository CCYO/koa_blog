// \u2F00-\u2FD5 部首
// \u3105-\u312F 注音
// \u4E00-\u9FFF 繁簡中字
const REG_ch_and_keywordW = /^[\u2F00-\u2FD5\u3105-\u312F\u4E00-\u9FFF\w\-]+$/;
const ERR_MSG_ch_and_keywordW = "必須由中文、英文、數字以及底線與連接線組成";
const REG_HASH = /^[0-9a-f]{32,32}$/;
const REG_EMAIL_CODE = /^[0123456789]{6,6}$/;
const REG_MSG_EMAIL_CODE = "由六個數字組成";
export default {
  BLOG: {
    TITLE: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 20,
      REGEXP: REG_ch_and_keywordW,
      REGEXP_MSG: ERR_MSG_ch_and_keywordW,
    },
    HTML: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 65535,
    },
    IMG: {
      //IMG_MAX_SIZE: 10MB
      MAX_SIZE: 10485760,
      MIN_SIZE: 1,
    },
    IMG_ALT: {
      REGEXP: REG_ch_and_keywordW,
      REGEXP_MSG: ERR_MSG_ch_and_keywordW,
      MIN_LENGTH: 1,
      MAX_LENGTH: 20,
    },
  },
  SETTING: {
    EMAIL: {
      MIN_LENGTH: 1,
    },
    EMAIL_CODE: {
      REGEXP: REG_EMAIL_CODE,
      REGEXP_MSG: REG_MSG_EMAIL_CODE,
    },
    NICKNAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 20,
      REGEXP: REG_ch_and_keywordW,
      REGEXP_MSG: ERR_MSG_ch_and_keywordW,
    },
    PASSWORD: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 32,
    },
    AGE: {
      MINIMUM: 6,
      MAXIMUM: 120,
    },
    AVATAR: {
      MAX_SIZE: 1048576, //  1MB
    },
  },
  EDITOR: {
    TITLE_REGEXP: REG_ch_and_keywordW,
    TITLE_REGEXP_ERR_MSG: ERR_MSG_ch_and_keywordW,
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 20,
    HTML_MIN_LENGTH: 1,
    HTML_MAX_LENGTH: 65535,
    //IMG_MAX_SIZE: 10MB
    IMG_MAX_SIZE: 10485760,
    IMG_MIN_SIZE: 1,
    IMG_ALT_REGEXP: REG_ch_and_keywordW,
    IMG_ALT_REGEXP_ERR_MSG: ERR_MSG_ch_and_keywordW,
    IMG_ALT_MIN_LENGTH: 1,
    IMG_ALT_MAX_LENGTH: 20,
  },
  IMG: {
    EXT: ["jpg", "png"],
  },
  HASH: REG_HASH,
};
