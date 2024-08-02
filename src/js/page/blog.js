/* CSS Module ------------------------------------------------------------------------------- */
import "@css/blog.scss";
// import "@wangeditor/editor/dist/css/style.css";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* NPM Module ------------------------------------------------------------------------------- */
import { createEditor } from "@wangeditor/editor";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { errorHandle, render, _xss, redir, dev_log } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  G.page = "blog";
  G.constant = FRONTEND.BLOG;
  await G.main(initMain);
  // setTimeout(G.utils.scrollToComment, 2000);
  G.utils.scrollToComment();
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  //  若是因為comment通知前來此頁面，可以直接滑動至錨點
  G.utils.scrollToComment = scrollToComment;

  function _parseHtmlStr_XImgToImg() {
    /* 將 <x-img> 數據轉回 <img> */
    let htmlStr = G.data.blog.html;
    //  複製一份htmlStr
    let reg = G.constant.REG.X_IMG_PARSE_TO_IMG;
    let res;
    //  存放 reg 匹配後 的 img src 數據
    while ((res = reg.exec(htmlStr))) {
      let { alt_id, style } = res.groups;
      //  MAP: alt_id → { alt, blogImg: {id, name}, img: {id, hash, url}}
      let {
        alt,
        img: { url },
      } = G.data.blog.map_imgs.get(alt_id * 1);
      let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}" title="${alt}"`;
      let replaceStr = style ? `${imgEle} style="${style}"/>` : `${imgEle}/>`;
      //  修改 _html 內對應的 img相關字符
      htmlStr = htmlStr.replace(res[0], replaceStr);
      dev_log(`html內blogImgAlt/${alt_id}的tag數據-----parse完成`);
    }
    return htmlStr;
  }
  $(`.${G.constant.CLASS.BLOG_CONTENT}`).html(_parseHtmlStr_XImgToImg());
  if (!G.data.blog.showComment) {
    dev_log("不需要渲染評論");
    return;
  }
  ////  根據使用者身分，顯示/移除刪除紐
  if (G.data.me?.id) {
    let isAuthor = G.data.me.id === G.data.blog.author.id;
    $(`button[data-${G.constant.DATASET.KEY.REMOVE_COMMENT}]`).each((i, el) => {
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
    });
  }
  /* ------------------------------------------------------------------------------------------ */
  /* JQ Ele in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  const $root_comment_list_container = $(
    `.${G.constant.CLASS.COMMENT_LIST_CONTAINER}`
  ).first();
  const $root_editor_container = $(
    `.${G.constant.CLASS.COMMENT_EDITOR_CONTAINER}`
  ).first();
  /* ------------------------------------------------------------------------------------------ */
  /* Public Var in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  //  let { me, blog } = G.data

  //  初始化根評論editor
  init_editor($root_editor_container.get(0));
  $root_comment_list_container.on("click", handle_click);

  function handle_click(e) {
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
      redir.check_login(G.data);
      let $btn_remove = $(btn_remove);
      let $remove_comment_id = $btn_remove.data(
        G.constant.DATASET.KEY.REMOVE_COMMENT
      );
      let payload = {
        comment_id: $remove_comment_id,
      };
      let { data } = await G.utils.axios.delete(G.constant.API.REMOVE_COMMENT, {
        data: payload,
      });
      //  data { commenter, time, isDeleted, ... }
      let htmlStr = render.blog.commentItem({ ...data });
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
        G.utils.scrollToComment(comment_id);
        // let $comment = $(`#comment_${comment_id}`);
        // $comment.css({
        //   backgroundColor: "rgb(219, 159, 159)",
        // });

        // setTimeout(() => {
        //   $comment.removeAttr("style");
        // }, 4000);
      };
      //  為container綁定判斷登入狀態的handle
      container.addEventListener("click", () => redir.check_login(G.data));
      container.addEventListener("keydown", cancelNewLine);
      //  為container綁定送出留言的handle
      container.addEventListener("keyup", sendComment);
      //  為container綁定送出留言的handle

      function cancelNewLine(e) {
        redir.check_login(G.data);
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
        redir.check_login(G.data);
        //  判斷是否Enter
        let isEnter = e.key === "Enter";
        if ((e.shiftKey && isEnter) || !isEnter) {
          //  若是，且包含Shift
          return;
        }

        let htmlStr = editor.getHtml();
        let html = htmlStr.replace(G.constant.REG.BLOG_CONTENT_TRIM, "");
        //  撇除空留言
        if (!html.trim()) {
          editor.setHtml();
          alert("請填入留言");
          return;
        }
        //  送出請求
        let { data } = await postComment();
        //  渲染此次送出的評論
        renderComment(data);
        //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
        G.data.blog.map_comment.mset(data);
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
            ejs_render: render,
          };
          let html_str = render.blog.commentTree(template_values);
          //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
          //  渲染
          editor.render(html_str, new_comment.id);
        }
        //  送出創建評論的請求
        async function postComment() {
          redir.check_login(G.data);
          let article_id = G.data.blog.id;
          let commenter_id = G.data.me.id;

          let payload = {
            article_id,
            commenter_id, //  留言者
            author_id: G.data.blog.author.id, //  文章作者
            html,
            pid: $$comment_pid,
          };
          return await G.utils.axios.post(
            G.constant.API.CREATE_COMMENT,
            payload
          );
        }
      }
    }
  }

  //  若是因為comment通知前來此頁面，可以直接滑動至錨點
  function scrollToComment(comment_id) {
    if (!comment_id) {
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
    console.log(`scrollY: ${scrollY}`);
    console.log(`commentY: ${commentY}`);
    console.log(`navH: ${navH}`);
    let targetY_1 = scrollY + commentY - navH;
    console.log(`第一階段targetY_1: ${targetY_1}`);
    console.log(`此時commentY: ${navH}`);
    console.log(`viewpointH_half: ${viewpointH_half}`);
    let up = viewpointH_half - navH;
    console.log(`距離viewport中心要往回(上)滾動: ${up}`);
    console.log(`再往下commentH_half: ${commentH_half}`);
    let targetY = targetY_1 - up + commentH_half;
    console.log(`目標是${targetY}`);
    document.body.scrollTop = targetY;

    $comment.css({ backgroundColor: "rgb(219, 159, 159)" });
    setTimeout(() => {
      $comment.removeAttr("style");
    }, 4000);
  }
}
