const REG_ch_and_keywordW = /^[\u4e00-\u9fa5\w\-]+$/;
const ERR_MSG_ch_and_keywordW = "必須由中文、英文、數字以及底線與連接線組成";
export default {
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
  SETTING: {
    EMAIL: {
      MIN_LENGTH: 1,
    },
    NICKNAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 20,
      REGEXP: REG_ch_and_keywordW,
      REGEXP_ERR_MSG: ERR_MSG_ch_and_keywordW,
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
  IMG_EXT: ["jpg", "png"],
};
