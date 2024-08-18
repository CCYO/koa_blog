/* CSS Module ------------------------------------------------------------------------------- */
import "@css/user.scss";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* NPM Module ------------------------------------------------------------------------------- */
import BetterScroll from "better-scroll";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import {
  Debounce,
  _Ajv,
  errorHandle,
  _xss,
  formFeedback,
  redir,
  render,
  initPagination,
} from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  const $$ajv = new _Ajv(G.utils.axios);
  G.page = "user";
  G.constant = FRONTEND.USER;
  G.utils.render = render;
  G.utils.validate = {
    blog_title: $$ajv._validate.blog_title,
  };
  await G.main(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  /* ------------------------------------------------------------------------------------------ */
  /* JQ Ele in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  let $input_new_blog_title = $(`#${G.constant.ID.NEW_BLOG_TITLE}`);
  let $btn_new_blog = $(`#${G.constant.ID.NEW_BLOG}`);
  let $fansList = $(`#${G.constant.ID.FANS_LIST}`);
  // //  粉絲列表contaner
  let $idolList = $(`#${G.constant.ID.IDOL_LIST}`);
  //  偶像列表contaner
  let $btn_follow = $(`#${G.constant.ID.FOLLOW}`);
  //  追蹤鈕
  let $btn_cancelFollow = $(`#${G.constant.ID.CANCEL_FOLLOW}`);
  //  退追鈕
  let $div_blogList = $(`[data-${G.constant.DATASET.KEY.BLOG_STATUS}]`);
  //  文章列表container

  /* ------------------------------------------------------------------------------------------ */
  /* Public Var in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  const $$isLogin = !!G.data.me.id;
  const $$isSelf = G.data.currentUser.id === G.data.me.id;
  //  分頁功能
  initPagination(G);
  if ($$isSelf) {
    //  文章創建、編輯、刪除功能
    await init_self_permission();
  } else {
    //  追蹤、退追功能
    init_login_permission();
  }
  //  追蹤名單better-scroll
  G.utils.betterScroll = initBetterScroll([$fansList, $idolList]);
  //  刷新追蹤名單的滾動功能
  await G.utils.betterScroll.refresh();

  /*  初始化BetterScroll */
  function initBetterScroll(JQ_Eles) {
    class myBS {
      options = {
        click: true,
        scrollX: true,
        eventPassthrough: "vertical", //  垂直方向保持原生滾動
        scrollbar: {
          fade: false,
          scrollbarTrackClickable: true, //  scrollbar點擊滾動功能
        },
      };
      $el = undefined;
      el = undefined;
      bs = undefined;
      #list = [];
      constructor($el) {
        this.$el = $el;
        this.el = $el.get(0);
        let { debounce } = new Debounce(this.#refresh, {
          name: `${this.el.id}_refresh`,
        });
        this.refresh = debounce;
      }
      create = () => new BetterScroll(this.el, this.options);
      #refresh = () => {
        switch (this.#check()) {
          case "create":
            this.bs = this.create(this.el);
            this.#handle();
            break;
          case "refresh":
            this.#cancelHandle();
            this.bs.refresh();
            this.#handle();
            break;
          case "destroy":
            this.#cancelHandle();
            this.bs.destroy();
            delete this.bs;
        }
      };
      #check() {
        let outerW = this.$el.outerWidth();
        let contentW = this.$el.children(":first-child").outerWidth(true);
        //  若DOM Ele的外寬度 < first-child Ele外寬，則代表本身的 betterScroll 可滾動
        let canScroll = outerW < contentW;
        if (this.bs) {
          if (canScroll) {
            return "refresh";
          } else {
            return "destroy";
          }
        } else if (canScroll) {
          return "create";
        }
      }

      #handle() {
        if (this.bs.options.disableTouch) {
          return;
        }
        this.#list = this.$el.find("a");
        let go = false;

        this.#list.on("click._click", (event) => {
          event.preventDefault();
        });
        this.#list.on("touchstart.start", () => {
          go = true;
        });
        this.#list.on("touchmove.move", () => {
          go = false;
        });
        this.#list.on("touchend.end", (event) => {
          if (go) {
            go = false;
            location.href = event.target.href;
          }
        });
      }
      #cancelHandle() {
        if (this.bs.options.disableTouch) {
          return;
        }
        this.#list.off("click._click");
        this.#list.off("touchstart.start");
        this.#list.off("touchmove.move");
        this.#list.off("touchendend.end");
      }
    }
    let bs_list = [...JQ_Eles].map(($el) => new myBS($el));
    bs_list.refresh = async () =>
      await Promise.all(bs_list.map((bs) => bs.refresh()));
    window.addEventListener("resize", bs_list.refresh);
    return bs_list;
  }

  //  登入狀態擁有的功能權限(追蹤、退追)
  function init_login_permission() {
    //  判端是否為自己的偶像
    const isMyIdol = $$isLogin
      ? G.data.relationShip.fansList.some((fans) => fans.id === G.data.me.id)
      : false;
    //  依據 isMyIdol 顯示 退追紐
    $btn_cancelFollow.toggle(isMyIdol);
    //  依據 isMyIdol 顯示 追蹤紐
    $btn_follow.toggle(!isMyIdol);
    //  為btn註冊clickEvent handler
    $btn_follow.on("click", follow);
    //  為btn註冊clickEvent handler
    $btn_cancelFollow.on("click", cancelFollow);

    /* ------------------------------------------------------------------------------------------ */
    /* Handle ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    //  追蹤
    async function follow() {
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
      await G.utils.axios.post(G.constant.API.FOLLOW, {
        id: G.data.currentUser.id,
      });
      //  同步 fansList 數據
      G.data.relationShip.fansList.unshift(G.data.me);
      //  在粉絲列表中插入 粉絲htmlStr
      let html = render.user.relationshipItem({ user: G.data.me });

      if (G.data.relationShip.fansList.length === 1) {
        //  如果追蹤者只有當前的你
        $fansList.html(`<ul>${html}</ul>`);
      } else {
        //  如果追蹤者不只當前的你
        $fansList.children("ul").prepend(html);
        //  插在最前面
      }
      G.utils.betterScroll.refresh();
      //  重整 BetterScroll
      $btn_follow.toggle(false);
      //  追蹤鈕的toggle
      $btn_cancelFollow.toggle(true);
      //  退追鈕的toggle
      alert("已追蹤");
      return;
    }
    //  退追
    async function cancelFollow() {
      redir.check_login(G.data);
      await G.utils.axios.post(G.constant.API.CANCEL_FOLLOW, {
        id: G.data.currentUser.id,
      });
      G.data.relationShip.fansList.splice(
        G.data.relationShip.fansList.indexOf(G.data.me.id),
        1
      );
      //  在粉絲列表中移除 粉絲htmlStr
      if (G.data.relationShip.fansList.length > 0) {
        //  如果仍有追蹤者
        $fansList
          .find(`li[data-${G.constant.DATASET.KEY.USER_ID}=${G.data.me.id}]`)
          .remove();
        //  直接移除
      } else {
        //  如果已無追蹤者
        $fansList.html(`<p>可憐阿，沒有朋友</p>`);
        //  撤換掉列表內容
      }
      /*  同步 $$fansList 數據 */
      G.utils.betterScroll.refresh();
      //  重整 BetterScroll
      $btn_follow.toggle(true);
      //  追蹤鈕的toggle
      $btn_cancelFollow.toggle(false);
      //  退追鈕的toggle
      alert("已退追");
      return;
    }
  }

  //  登入者本人頁面功能權限(建立/刪除文章)
  async function init_self_permission() {
    //  禁用 創建文章鈕
    $btn_new_blog.prop("disabled", true);
    await import(
      /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
    );
    $("#new_blog_modal").on("focus", async () => {
      $input_new_blog_title.get(0).focus();
    });
    $("#new_blog_modal").on("keyup", (e) => {
      e.preventDefault();
      if (e.key.toUpperCase() === "ENTER") {
        $btn_new_blog.get(0).click();
      }
    });
    //  debouncer event handle
    let { debounce: handle_debounce_check_title } = new Debounce(check_title, {
      loading(e) {
        $btn_new_blog.prop("disabled", true);
        formFeedback.loading(e.target);
      },
    });
    //  為input註冊debounce化的inputEvent handler
    $input_new_blog_title.on("input", handle_debounce_check_title);
    //  為btn註冊clickEvent handler
    $btn_new_blog.on("click", handle_createBlog);
    //  為btn註冊clickEvent handler
    $div_blogList.on("click", handle_removeBlogs);

    /* ------------------------------------------------------------------------------------------ */
    /* Handle ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    //  刪除文章
    async function handle_removeBlogs(e) {
      let $target = $(e.target);
      let action = $target.data(G.constant.DATASET.KEY.REMOVE_BLOG);
      if (!action || (action && !confirm("真的要刪除嗎?"))) {
        return;
      }
      e.preventDefault();
      redir.check_login(G.data);
      let blogList = [];
      if (action === G.constant.DATASET.VALUE.REMOVE_BLOG_ITEM) {
        blogList.push(
          $target
            .parents(`[data-${G.constant.DATASET.KEY.BLOG_ID}]`)
            .data(G.constant.DATASET.KEY.BLOG_ID)
        );
      } else if (action === G.constant.DATASET.VALUE.REMOVE_BLOG_LIST) {
        let $container = $target.parents("ul").eq(0);
        let $li_blogItem_list = $container.find(
          `[data-${G.constant.DATASET.KEY.BLOG_ID}]`
        );
        blogList = Array.from($li_blogItem_list).map((li) =>
          $(li).data(G.constant.DATASET.KEY.BLOG_ID)
        );
      }
      //  送出刪除命令
      let { errno } = await G.utils.axios.delete(G.constant.API.REMOVE_BLOGS, {
        data: {
          blogList,
        },
      });
      if (errno) {
        return;
      }
      alert("刪除成功");
      location.reload();
      //  刷新頁面
    }
    //  創建文章
    async function handle_createBlog(e) {
      e && e.preventDefault();
      if (!redir.check_login(G)) {
        return;
      }
      let title = await check_title();
      if (!title) {
        return;
      }
      const {
        data: { id: blog_id },
      } = await G.utils.axios.post(G.constant.API.CREATE_BLOG, {
        title,
      });
      window.alert("創建成功，開始編輯文章");
      location.href = `${G.constant.API.EDIT_BLOG}/${blog_id}?owner_id=${G.data.me.id}`;
      //  清空表格
      $input_new_blog_title.val("");
    }

    //  校驗文章標題
    async function check_title() {
      let input = $input_new_blog_title.get(0);

      let data = {
        title: _xss.trim(input.value),
      };
      let validated_list = await G.utils.validate.blog_title(data);
      let { valid, message } = validated_list.find(
        (item) => item.field_name === "title"
      );
      formFeedback.validated(input, valid, message);
      $btn_new_blog.prop("disabled", !valid);
      return valid ? data.title : false;
    }
  }
}
