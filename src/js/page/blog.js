/* CSS        ----------------------------------------------------------------------------- */
import "@css/blog.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* UTILS      ----------------------------------------------------------------------------- */
import { render, redir, errorHandle, _xss } from "../utils";

/* NPM        ----------------------------------------------------------------------------- */
import { createEditor } from "@wangeditor/editor";

/* COMPONENT   ---------------------------------------------------------------------------- */
import blog_htmlStr from "../component/blog_htmlStr";

/* VAR        ----------------------------------------------------------------------------- */
const API = {
  REMOVE_COMMENT: "/api/comment",
  CREATE_COMMENT: "/api/comment",
};
/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  G.utils.render = render[G.data.page];
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  await render_blog();
  if (G.data.blog.showComment) {
    init_comment();
  }
  // 初始化留言功能
  function init_comment() {
    //  滑動至指定comment
    document.addEventListener("initPage", scrollToComment);

    //  顯示/移除刪除紐
    init_removeBtn();

    //  初始化根評論editor功能
    init_editor(
      document.querySelector(`.${G.constant.CLASS.COMMENT_EDITOR_CONTAINER}`)
    );

    // 初始化所有回覆鈕&刪除鈕功能
    document
      .querySelector(`.${G.constant.CLASS.COMMENT_LIST_CONTAINER}`)
      .addEventListener("click", create_or_remove_comment);

    // 回覆/刪除留言功能
    function create_or_remove_comment(e) {
      let target = e.target;
      if (target.tagName !== "BUTTON") {
        return;
      }
      e.preventDefault();
      let $target = $(e.target);
      let replyBox = $target
        .parents(`.${G.constant.CLASS.COMMENT_ITEM_CONTENT}`)
        .first();
      replyBox = replyBox.next();
      replyBox = replyBox.get(0);
      let isExist = typeof replyBox.show === "function";
      let remove_comment_id =
        $(target).data(G.constant.DATASET.KEY.REMOVE_COMMENT) * 1;
      //  若是「刪除鈕」
      if (remove_comment_id) {
        //  再次確認
        if (!confirm("真的要刪除?")) {
          isExist && !replyBox.isFocused() && replyBox.show();
          return;
        }
        //  執行刪除
        removeComment(e.target);
        return;
      }

      if (isExist) {
        //  若 editorContainer 有 show 方法，代表editor已被創建過
        //  顯示 editorContianer 即可
        replyBox.show();
      } else {
        //  初始化editor
        init_editor(replyBox);
      }

      async function removeComment(btn_remove) {
        //  檢查登入狀態
        if (!redir.check_login(G)) {
          return;
        }
        let $btn_remove = $(btn_remove);
        let $remove_comment_id = $btn_remove.data(
          G.constant.DATASET.KEY.REMOVE_COMMENT
        );
        let payload = {
          comment_id: $remove_comment_id,
        };
        let { data } = await G.utils.axios.delete(API.REMOVE_COMMENT, {
          data: payload,
        });
        //  data { commenter, time, isDeleted, ... }
        let htmlStr = G.utils.render.commentItem(data);
        $btn_remove
          .parents(`.${G.constant.CLASS.COMMENT_ITEM_CONTENT}`)
          .first()
          .html(htmlStr);
        //  同步G.data
        G.data.blog.map_comment.delete($remove_comment_id);
        return;
      }
    }

    //  初始化editor
    function init_editor(container) {
      const $container = $(container);
      let $$comment_pid = $container.data(G.constant.DATASET.KEY.PID);
      let $$isRootEditor = $$comment_pid === undefined;
      $$comment_pid = $$isRootEditor ? 0 : $$comment_pid;

      //  editor config

      //  功能：貼上純文字內容
      const customPaste = function (editor, event) {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        editor.insertText(text);
      };
      let editorConfig = {
        MENU_CONF: {},
        customPaste,
        autoFocus: false,
      };
      //  若container的父元素.replyBox的commentId不為0，則替editor添加onBlur handle
      if (!$$isRootEditor) {
        //  若此editor失去焦點，自動隱藏
        editorConfig.onBlur = function () {
          $container.hide();
        };
        editorConfig.autoFocus = true;
      }
      //  editor config : placeholder
      editorConfig.placeholder = "我有話要說";
      //  editor 創建
      const editor = createEditor({
        config: editorConfig,
        selector: container,
        mode: "simple",
      });
      G.utils.loading_backdrop.insertEditors([editor]);
      //  重設editor自訂的相關設定
      resetEditor();
      return editor;

      function resetEditor() {
        //  替container添加show方法
        container.show = () => {
          $container.show();
          editor.focus();
        };
        container.blur = () => {
          editor.blur();
        };
        container.isFocused = () => {
          editor.isFocused();
        };
        //  div.replyBox
        let replyBox = (editor.replyBox = container);
        //  editor 的 id
        editor.pid = $$comment_pid;
        //  editor 用來對 postComment 後，渲染 res 的方法
        editor.render = (html, comment_id) => {
          if ($$comment_pid) {
            $(replyBox.nextElementSibling).append(html);
          } else {
            $(`[data-${G.constant.DATASET.KEY.PID}=0]`).prepend(html);
          }
          // 顯示刪除鈕
          $(
            `button[data-${G.constant.DATASET.KEY.REMOVE_COMMENT}=${comment_id}]`
          ).removeAttr("style");
          scrollToComment(comment_id);
        };
        //  為container綁定判斷登入狀態的handle
        container.addEventListener("click", () => {
          //  檢查登入狀態
          if (!redir.check_login(G)) {
            return;
          }
        });
        container.addEventListener("keydown", cancelNewLine);
        //  為container綁定送出留言的handle
        container.addEventListener("keyup", sendComment);
        //  為container綁定送出留言的handle

        function cancelNewLine(e) {
          //  檢查登入狀態
          if (!redir.check_login(G)) {
            return;
          }
          //  判斷是否Enter
          let isEnter = e.key === "Enter";
          if ((e.shiftKey && isEnter) || !isEnter) {
            //  若是，且包含Shift
            return true;
          }
          e.preventDefault();
          return false;
        }

        async function sendComment(e) {
          //  檢查登入狀態
          if (!redir.check_login(G)) {
            return;
          }
          //  判斷是否Enter
          let isEnter = e.key === "Enter";
          if ((e.shiftKey && isEnter) || !isEnter) {
            //  若是，且包含Shift
            return;
          }

          let htmlStr = editor.getHtml();
          let html = _xss.blog(htmlStr);

          //  撇除空留言
          if (!html) {
            editor.setHtml();
            alert("請填入留言");
            return;
          }
          //  送出請求
          let { data } = await postComment();
          //  渲染此次送出的評論
          renderComment(data);
          //  更新評論數據 { id, html, time, pid, commenter: { id, email, nickname}}
          G.data.blog.map_comment.add(data);
          //  清空評論框
          editor.clear();

          return true;
          //  渲染評論 ---------------------------------------------------------------
          //  要修改
          //  ------------------------------------------------------------------------
          function renderComment(new_comment) {
            //  new_comment { item ↓ }
            //  commenter { email, id, nickname}
            //  commenter_id,
            //  html,
            //  id,
            //  isDeleted,
            //  pid,
            //  reply [],
            //  time,
            //  updatedAt
            let template_values = {
              tree: [{ ...new_comment }],
              ejs_render: G.utils.render,
            };
            let html_str = G.utils.render.commentTree(template_values);
            //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
            //  渲染
            editor.render(html_str, new_comment.id);
          }
          //  送出創建評論的請求
          async function postComment() {
            //  檢查登入狀態
            if (!redir.check_login(G)) {
              return;
            }
            let article_id = G.data.blog.id;
            let commenter_id = G.data.me.id;

            let payload = {
              article_id,
              commenter_id, //  留言者
              author_id: G.data.blog.author.id, //  文章作者
              html,
              pid: $$comment_pid,
            };
            return await G.utils.axios.post(API.CREATE_COMMENT, payload);
          }
        }
      }
    }

    //  顯示/移除刪除紐
    function init_removeBtn() {
      if (G.data.me?.id) {
        let isAuthor = G.data.me.id === G.data.blog.author.id;
        $(`button[data-${G.constant.DATASET.KEY.REMOVE_COMMENT}]`).each(
          (i, el) => {
            let $el = $(el);
            if (isAuthor) {
              $el.show();
              return;
            }
            let url = $el.parent("div").children("a").attr("href");
            let res = /\/other\/(?<commenter_id>\d+)/.exec(url);
            let commenter_id = res.groups.commenter_id * 1;
            if (G.data.me.id === commenter_id) {
              $el.show();
            } else {
              $el.remove();
            }
          }
        );
      }
    }

    //  滑動至指定comment
    function scrollToComment(comment_id) {
      if (!comment_id || comment_id instanceof Event) {
        let res = /#comment_(?<comment_id>\d+)/.exec(location.href);
        if (!res) {
          return;
        }
        comment_id = res.groups.comment_id;
      }

      let selector = `#comment_${comment_id}`;
      let viewpointH = window.innerHeight;
      let scrollY = window.scrollY;
      let { height: navHeight } = document
        .querySelector("nav.navbar")
        .getBoundingClientRect();
      let $comment = $(selector).eq(0);
      let $container = $comment.parent();
      let commentRect = $container.get(0).getBoundingClientRect();

      let commentY = Math.floor(commentRect.y);
      let commentH_half = Math.floor(Math.floor(commentRect.height) / 2);
      let navH = Math.floor(navHeight);
      let viewpointH_half = Math.floor(Math.floor(viewpointH) / 2);
      let targetY_1 = scrollY + commentY - navH;
      let up = viewpointH_half - navH;
      let targetY = targetY_1 - up + commentH_half;
      // 使用scrollTop進行視窗滾動，各瀏覽器有不同的綁定對象
      // 然而僅有被綁定的對象能改變scollTop值，利用此特性來做判斷
      document.body.scrollTop = 1;
      document.documentElement.scrollTop = 1;
      let ele = document.body.scrollTop
        ? document.body
        : document.documentElement;
      ele.scrollTop = targetY;

      $comment.css({ backgroundColor: "rgb(219, 159, 159)" });
      // 配合 .comment-item-content { transition: background-color 4s ease-out; }
      setTimeout(() => {
        $comment.removeAttr("style");
      }, 4000);
    }
  }

  // 渲染文章
  async function render_blog() {
    let active = G.data.active;
    if (active === "blog") {
      let { htmlStr, checkImgLoad } = blog_htmlStr(G);
      G.utils.checkImgLoad = checkImgLoad;
      $(`.${G.constant.CLASS.BLOG_CONTENT}`).html(htmlStr);
    } else if (active === "blog-preview") {
      _preview();
    }
    G.utils.checkImgLoad && (await G.utils.checkImgLoad());

    // 渲染文章預覽
    function _preview() {
      //  讀取localStorage數據
      let preview_key = new URL(location.href).searchParams.get(
        COMMON.BLOG.PREVIEW_KEY
      );
      let preview_data = localStorage.getItem(preview_key);
      if (!preview_data) {
        alert(`請回到文章編輯頁，重新點擊預覽\n此視窗將自動關閉`);
        window.close();
        return;
      }
      let { title, html } = JSON.parse(preview_data);
      G.data.blog.html = html;
      $(`.card-header > h1`).text(title);
      let { htmlStr, checkImgLoad } = blog_htmlStr(G);
      G.utils.checkImgLoad = checkImgLoad;
      $(`.${G.constant.CLASS.BLOG_CONTENT}`).html(htmlStr);
      //  刪除localStorage數據
      localStorage.removeItem(preview_key);

      // 使用loadBackdrop，但鼠標不使用讀取樣式
      document.addEventListener("initPage", () => {
        !process.env.isProd &&
          console.log("initPage handle ---> loading_backdrop.show");
        G.utils.loading_backdrop.show({ blockPage: false });
        // 移除loading_backdrop導致的滑鼠讀取狀態
        $("body").removeClass("wait");
      });

      return true;
    }
  }
}
