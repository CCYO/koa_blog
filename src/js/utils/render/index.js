import lodash_template from "lodash/template";

//  使用 template-ejs-loader 將 偶像粉絲列表的項目ejs檔 轉譯為 純字符
import navbar_logout_uncollapseList from "!!raw-loader!./template/navbar/logout_uncollapseList.ejs";
import navbar_login_uncollapseList from "!!raw-loader!./template/navbar/login_uncollapseList.ejs";
import navbar_login_collapseList from "!!raw-loader!./template/navbar/login_collapseList.ejs";
import navbar_fansIdol from "!!raw-loader!./template/navbar/idolFans.ejs";
import navbar_articleReader from "!!raw-loader!./template/navbar/articleReader.ejs";
import navbar_msgReceiver from "!!raw-loader!./template/navbar/msgReceiver.ejs";

import blog_commentTree from "!!raw-loader!./template/blog/commentTree.ejs";
import blog_commentItem from "!!raw-loader!./template/blog/commentItem.ejs";
import user_relationshipItem from "!!raw-loader!./template/user/relationshipItem.ejs";
import user_blogList from "!!raw-loader!./template/user/blogList.ejs";
import square_blogList from "!!raw-loader!./template/square/blogList.ejs";
import albumList_blogList from "!!raw-loader!./template/albumList/blogList.ejs";

export default {
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
    commentTree: lodash_template(blog_commentTree),
    commentItem: lodash_template(blog_commentItem),
  },
  USER: {
    relationshipItem: lodash_template(user_relationshipItem),
    blogList: lodash_template(user_blogList),
  },
  SQUARE: {
    blogList: lodash_template(square_blogList),
  },
  ALBUM_LIST: {
    blogList: lodash_template(albumList_blogList),
  },
};
