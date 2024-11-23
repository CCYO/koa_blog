export default {
  EDITOR: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 20,
    HTML_MIN_LENGTH: 1,
    HTML_MAX_LENGTH: 65535,
    //IMG_MAX_SIZE: 10MB
    IMG_MAX_SIZE: 10485760,
    IMG_MIN_SIZE: 1,
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
