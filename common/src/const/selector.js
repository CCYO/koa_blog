// SELECTOR: BUILD 與 SRC 需要使用
import BLOG from "./blog";

const BLOG_STATUS_PUBLIC = BLOG.STATUS.PUBLIC;

export default {
  ERR_PAGE: {},
  ALBUM_LIST: {
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
        BLOG_STATUS_PUBLIC,
        PREVIOUS_PAGE: "previous-page",
        NEXT_PAGE: "next-page",
        PREVIOUS_PAGINATION: "previous-pagination",
        NEXT_PAGINATION: "next-pagination",
      },
    },
  },
  ALBUM: {
    ID: {
      MODAL: "modal_album",
    },
    DATASET: {
      KEY: {
        ALT_ID: "alt_id",
      },
    },
  },
  BLOG_EDIT: {
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
  },
  BLOG: {
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
  },
  REGISTER_LOGIN: {
    NAME: {
      EMAIL: "email",
      PASSWORD: "password",
      PASSWORD_AGAIN: "password_again",
      EMAIL_CODE: "code",
    },
    ID: {
      LOGIN_FORM: "login",
      REGISTER_FORM: "register",
      MODAL_EMAIL_CODE: "modal_email_code",
      GET_EMAIL_CODE: "email_code",
      CHECK_EMAIL_CODE: "check_email_code",
    },
  },
  SETTING: {
    ID: {
      FORM: "setting",
      MODAL_ORIGIN_PASSWORD: "modal_origin_password",
      CHECK_ORIGIN_PASSWORD: "check_orgin_password",

      MODAL_REGISTER_CODE: "modal_register_code",
      MAIL_REGISTER_CODE: "mail_register_code",
      CHECK_REGISTER_CODE: "check_register_code",

      SHOW_MODAL_EMAIL_CODE: "show_model_register_code",
      IMG_AVATAR: "avatar-img",
      CANCEL: "cancel",
    },
    NAME: {
      EMAIL: "email",
      EMAIL_CODE: "code",
      ORIGIN_PASSWORD: "origin_password",
      NEW_PASSWORD: "password",
      PASSWORD_AGAIN: "password_again",
    },
  },
  USER: {
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
        BLOG_STATUS_PUBLIC,
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
  },
  SQUARE: {
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
        BLOG_STATUS_PUBLIC,
        PREVIOUS_PAGE: "previous-page",
        NEXT_PAGE: "next-page",
        PREVIOUS_PAGINATION: "previous-pagination",
        NEXT_PAGINATION: "next-pagination",
      },
    },
  },
};
