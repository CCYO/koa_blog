const BACKEND = require("../../server/config/backend_const");
console.log("@BACKEND => ", BACKEND);
const _IMG = {
  X_IMG_PARSE_TO_IMG:
    /<x-img.+?data-alt-id='(?<alt_id>\w+?)'.+?(data-style='(?<style>.*?)')?.*?\/>/g,
  IMG_PARSE_TO_X_IMG:
    /<img\ssrc="[^=]+?alt_id=(?<alt_id>\d+?)"(.+?style="(?<style>.*?)")?(.*?)\/?>/g,
};
//  PAGE
const ALBUM_LIST = {
  PAGINATION: {
    BLOG_COUNT: BACKEND.ALBUM_LIST.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: BACKEND.ALBUM_LIST.PAGINATION.PAGE_COUNT,
  },
  API: {
    GET_PAGINATION: "/api/album/list",
  },
  SELECTOR: {
    PAGE_NUM_LINK: ".pagination .pagination .page-link",
  },
  DATASET: {
    KEY: {
      BLOG_ID: "blog-id",
      PAGINATION_NUM: "pagination",
      PAGE_NUM: "page",
      PAGE_TURN: "turn",
      BLOG_STATUS: "status",
    },
    VALUE: {
      BLOG_STATUS_PUBLIC: BACKEND.BLOG.STATUS.PUBLIC,
      PREVIOUS_PAGE: "previous-page",
      NEXT_PAGE: "next-page",
      PREVIOUS_PAGINATION: "previous-pagination",
      NEXT_PAGINATION: "next-pagination",
    },
  },
};
const ALBUM = {
  ID: {
    MODAL: "modal_album",
  },
  DATASET: {
    KEY: {
      ALT_ID: "alt_id",
    },
  },
};
const BLOG_EDIT = {
  EDITOR: {
    // 單位byte
    IMG_MAX_SIZE: BACKEND.BLOG.EDITOR.IMG_MAX_SIZE,
    HTML_MAX_LENGTH: BACKEND.BLOG.EDITOR.HTML_MAX_LENGTH,
    HTML_MIN_LENGTH: BACKEND.BLOG.EDITOR.HTML_MIN_LENGTH,
  },
  API: {
    UPDATE_ALBUM: "/api/album",
    CREATE_IMG: "/api/blog/img",
    UPDATE_BLOG: "/api/blog",
  },
  REG: {
    IMG_ALT_ID: /alt_id=(?<alt_id>\w+)/,
    IMG_NAME_AND_EXT: /^(.+)\.(.+?)$/,
    X_IMG_PARSE_TO_IMG: _IMG.X_IMG_PARSE_TO_IMG,
    IMG_PARSE_TO_X_IMG: _IMG.IMG_PARSE_TO_X_IMG,
  },
  ID: {
    STATUS: "status",
    TITLE: "title",
    UPDATE_TITLE: "update_title",
    UPDATE_BLOG: "update_blog",
    REMOVE_BLOG: "remove_blog",
    BLOG_HTML_STRING_COUNT: "content_count",
    EDITOR_CONTAINER: "editor-container",
    EDITOR_TOOLBAR_CONTAINER: "toolbar-container",
  },
};
const BLOG = {
  REG: {
    BLOG_CONTENT_TRIM: /(<p><br><\/p>)|(<p>[\s&nbsp;]+<\/p>)/g,
    X_IMG_PARSE_TO_IMG: _IMG.X_IMG_PARSE_TO_IMG,
  },
  API: {
    REMOVE_COMMENT: "/api/comment",
    CREATE_COMMENT: "/api/comment",
  },
  DATASET: {
    KEY: {
      REMOVE_COMMENT: "remove",
      PID: "pid",
    },
  },
  CLASS: {
    COMMENT_ITEM_CONTENT: "comment-item-content",
    COMMENT_EDITOR_CONTAINER: "editor-container",
    COMMENT_LIST_CONTAINER: "comment-list-container",
    BLOG_CONTENT: "editor-content-view",
  },
};
const REGISTER_LOGIN = {
  NAME: {
    EMAIL: "email",
  },
  API: {
    REGISTER_SUCCESS: "/login",
    REGISTER: "/api/user/register",
    LOGIN_SUCCESS: "/self",
    LOGIN: "/api/user",
  },
  MESSAGE: {
    REGISTER_FAIL: "註冊失敗，請重新嘗試",
    REGISTER_SUCCESS: "註冊成功，請嘗試登入",
    LOGIN_SUCCESS: "登入成功",
    LOGIN_FAIL: "登入失敗，請重新嘗試",
  },
  ID: {
    LOGIN_FORM: "login",
    REGISTER_FORM: "register",
  },
};
const SETTING = {
  REG: {
    AVATAR_EXT: /\.(?<ext>\w+)\b/,
  },
  AVATAR: {
    URL: BACKEND.USER.AVATAR.URL,
    EXT: BACKEND.USER.AVATAR.EXT,
    //  單位byte
    MAX_SIZE: BACKEND.USER.AVATAR.MAX_SIZE,
  },
  API: {
    CHECK_PASSWORD: "/api/user/confirmPassword",
    SETTING: "/api/user",
  },
  ID: {
    MODAL_ORIGIN_PASSWORD: "modal_origin_password",
  },
  NAME: {
    ORIGIN_PASSWORD: "origin_password",
  },
};
const USER = {
  PAGINATION: {
    BLOG_COUNT: BACKEND.BLOG.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: BACKEND.BLOG.PAGINATION.PAGE_COUNT,
  },
  API: {
    //  view
    EDIT_BLOG: "/blog/edit",
    //  api
    CREATE_BLOG: "/api/blog",
    REMOVE_BLOGS: "/api/blog",
    CANCEL_FOLLOW: "/api/user/cancelFollow",
    GET_PAGINATION: "/api/blog/list",
    FOLLOW: "/api/user/follow",
  },
  SELECTOR: {
    PAGE_NUM_LINK: ".pagination .pagination .page-link",
  },
  DATASET: {
    KEY: {
      BLOG_ID: "blog-id",
      REMOVE_BLOG: "remove-blog",
      USER_ID: "user-id",
      PAGINATION_NUM: "pagination",
      PAGE_NUM: "page",
      PAGE_TURN: "turn",
      BLOG_STATUS: "status",
    },
    VALUE: {
      BLOG_STATUS_PUBLIC: BACKEND.BLOG.STATUS.PUBLIC,
      REMOVE_BLOG_LIST: "list",
      REMOVE_BLOG_ITEM: "item",
      PREVIOUS_PAGE: "previous-page",
      NEXT_PAGE: "next-page",
      PREVIOUS_PAGINATION: "previous-pagination",
      NEXT_PAGINATION: "next-pagination",
    },
  },
  ID: {
    CANCEL_FOLLOW: "cancelFollow",
    FOLLOW: "follow",
    IDOL_LIST: "idolList",
    FANS_LIST: "fansList",
    NEW_BLOG: "new_blog",
    NEW_BLOG_TITLE: "new_blog_title",
    NEW_BLOG_MODAL: "new_blog_modal",
  },
};

const SQUARE = {
  PAGINATION: {
    BLOG_COUNT: BACKEND.SQUARE.PAGINATION.BLOG_COUNT,
    PAGE_COUNT: BACKEND.SQUARE.PAGINATION.PAGE_COUNT,
  },
  API: {
    GET_PAGINATION: "/api/square/list",
  },
  SELECTOR: {
    PAGE_NUM_LINK: ".pagination .pagination .page-link",
  },
  DATASET: {
    KEY: {
      BLOG_ID: "blog-id",
      PAGINATION_NUM: "pagination",
      PAGE_NUM: "page",
      PAGE_TURN: "turn",
      BLOG_STATUS: "status",
    },
    VALUE: {
      PREVIOUS_PAGE: "previous-page",
      NEXT_PAGE: "next-page",
      PREVIOUS_PAGINATION: "previous-pagination",
      NEXT_PAGINATION: "next-pagination",
      BLOG_STATUS_PUBLIC: BACKEND.BLOG.STATUS.PUBLIC,
    },
  },
};
//  UTILS
const NAVBAR = {
  NEWS: {
    STATUS: {
      FIRST: BACKEND.NEWS.FRONT_END_STATUS.FIRST,
      AGAIN: BACKEND.NEWS.FRONT_END_STATUS.AGAIN,
      CHECK: BACKEND.NEWS.FRONT_END_STATUS.CHECK,
    },
    LIMIT: BACKEND.QUERY_NEWS.LIMIT,
    TIME_FORMAT: BACKEND.NEWS.TIME_FORMAT,
  },
};
const INIT_EJS = {
  ALBUM_LIST: {
    PAGINATION: {
      BLOG_COUNT: BACKEND.ALBUM_LIST.PAGINATION.BLOG_COUNT,
      PAGE_COUNT: BACKEND.ALBUM_LIST.PAGINATION.PAGE_COUNT,
    },
  },
};
const _AXIOS = {
  ERR_RES: {
    NEWS_NO_LOGIN: BACKEND.ERR_RES.NEWS.READ.NO_LOGIN,
    NO_LOGIN: BACKEND.ERR_RES.SERVER.RESPONSE.NO_LOGIN,
  },
};
const REDIR = {
  FROM: BACKEND.UTILS.REDIR_FROM,
};

const PATTERN = BACKEND.PATTERN;

module.exports = {
  //  UTILS
  REDIR,
  _AXIOS,
  INIT_EJS,
  NAVBAR,
  //  PAGE
  USER,
  SETTING,
  REGISTER_LOGIN,
  BLOG_EDIT,
  ALBUM,
  ALBUM_LIST,
  BLOG,
  SQUARE,
  SETTING,
  PATTERN,
};
