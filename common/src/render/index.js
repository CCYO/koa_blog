/* NPM        ----------------------------------------------------------------------------- */
import lodash_template from "lodash/template";

import { SELECTOR } from "../const";

//  藉row-loader將ejs轉純字符
import navbar_logout_uncollapseList from "!!raw-loader!../../../src/views/wedgets/navbar/template/logout_uncollapseList.ejs";
import navbar_login_uncollapseList from "!!raw-loader!../../../src/views/wedgets/navbar/template/login_uncollapseList.ejs";
import navbar_login_collapseList from "!!raw-loader!../../../src/views/wedgets/navbar/template/login_collapseList.ejs";
import navbar_fansIdol from "!!raw-loader!../../../src/views/wedgets/navbar/template/idolFans.ejs";
import navbar_articleReader from "!!raw-loader!../../../src/views/wedgets/navbar/template/articleReader.ejs";
import navbar_msgReceiver from "!!raw-loader!../../../src/views/wedgets/navbar/template/msgReceiver.ejs";

import blog_commentTree from "!!raw-loader!../../../src/views/pages/blog/template/commentTree.ejs";
import blog_commentItem from "!!raw-loader!../../../src/views/pages/blog/template/commentItem.ejs";

import user_relationshipItem from "!!raw-loader!../../../src/views/pages/user/template/relationshipItem.ejs";
import user_blogList from "!!raw-loader!../../../src/views/pages/user/template/blogList.ejs";

import square_blogList from "!!raw-loader!../../../src/views/pages/square/template/blogList.ejs";
import albumList_blogList from "!!raw-loader!../../../src/views/pages/albumList/template/blogList.ejs";

let result = {
  navbar: {
    fansIdol: lodash_template(navbar_fansIdol),
    articleReader: lodash_template(navbar_articleReader),
    msgReceiver: lodash_template(navbar_msgReceiver),
    logout_uncollapseList: (active) =>
      lodash_template(navbar_logout_uncollapseList)({ active }),
    login_uncollapseList: (active) =>
      lodash_template(navbar_login_uncollapseList)({ active }),
    login_collapseList: (active) =>
      lodash_template(navbar_login_collapseList)({ active }),
  },
  BLOG: {
    commentTree: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(blog_commentTree)(datas);
    },
    commentItem: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(blog_commentItem)(datas);
    },
  },
  USER: {
    relationshipItem: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(user_relationshipItem)(datas);
    },
    blogList: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(user_blogList)(datas);
    },
  },
  SQUARE: {
    blogList: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(square_blogList)(datas);
    },
  },
  ALBUM_LIST: {
    blogList: (datas) => {
      if (!datas.SELECTOR) {
        datas.SELECTOR = SELECTOR;
      }
      return lodash_template(albumList_blogList)(datas);
    },
  },
};

export default result;
