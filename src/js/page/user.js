/* CSS        ----------------------------------------------------------------------------- */
import "@css/user.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import {
  ajv_init as _Ajv,
  Debounce,
  async_render,
  _xss,
  formFeedback,
  redir,
  errorHandle,
} from "../utils";

/* NPM        ----------------------------------------------------------------------------- */
import BetterScroll from "better-scroll";

/* COMPONENT   ---------------------------------------------------------------------------- */
import initPagination from "../component/pagination";
// import __ajv from "../utils/_ajv";
// import ajv2019 from "ajv/dist/2019";
// const _ajv = __ajv._my;
// console.log(
//   "in user page, ajv2019 === Ajv2019_default",
//   ajv2019 === __ajv.Ajv2019_default
// );
/* VAR        ----------------------------------------------------------------------------- */
let render = await async_render();

/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  // const $$ajv = new _Ajv(G.utils.axios);
  // const $$ajv = _Ajv(G.utils.axios);
  const $$ajv = _Ajv(G.utils.axios);
  console.log("$$ajv", $$ajv);
  G.utils.validate = {
    // blog_title: $$ajv._validate.blog_title,
    blog_title: $$ajv._validate.blog_title,
  };
  G.utils.render = render[G.data.page];
  G.utils._xss = _xss;
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  let $input_new_blog_title = $(`#${G.constant.ID.NEW_BLOG_TITLE}`);
  let $btn_new_blog = $(`#${G.constant.ID.NEW_BLOG}`);
  //  粉絲列表contaner
  let $fansList = $(`#${G.constant.ID.FANS_LIST}`);
  //  偶像列表contaner
  let $idolList = $(`#${G.constant.ID.IDOL_LIST}`);
  //  追蹤鈕
  let $btn_follow = $(`#${G.constant.ID.FOLLOW}`);
  //  退追鈕
  let $btn_cancelFollow = $(`#${G.constant.ID.CANCEL_FOLLOW}`);
  //  文章列表container
  let $div_blogList = $(`[data-${G.constant.DATASET.KEY.BLOG_STATUS}]`);
  if (G.data.active === "self") {
    //  文章創建、編輯、刪除功能
    await init_self();
  } else {
    //  追蹤、退追功能
    init_other();
  }
  //  分頁功能
  initPagination(G);
  //  初始化追蹤名單BetterScroll功能
  G.utils.betterScroll = init_BS([$fansList, $idolList]);
  //  刷新追蹤名單的滾動功能
  document.addEventListener("initPage", async () => {
    await G.utils.betterScroll.refresh();
  });

  // 初始化BetterScroll
  function init_BS(JQ_Eles) {
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
    bs_list.refresh = async () => {
      return await Promise.all(bs_list.map((bs) => bs.refresh()));
    };
    let _vW = document.documentElement.clientWidth;
    async function handle_resize() {
      let go = false;
      let vW = document.documentElement.clientWidth;
      if (_vW - vW !== 0) {
        !process.env.isProd &&
          console.log(`refresh by window, _vW:${_vW}, vW:${vW}`);
        this._vW = vW;
        go = true;
      }
      if (go) {
        await bs_list.refresh();
      }
    }
    window.addEventListener("resize", handle_resize);
    return bs_list;
  }

  //  追蹤、退追功能
  function init_other() {
    //  判端是否為自己的偶像
    const isMyIdol = G.data.me
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
      let html = G.utils.render.relationshipItem({ user: G.data.me });

      if (G.data.relationShip.fansList.length === 1) {
        //  如果追蹤者只有當前的你，撤換掉列表內容
        $fansList.children("ul").removeAttr("style").html(html);
      } else {
        //  如果追蹤者不只當前的你，插在最前面
        $fansList.children("ul").prepend(html);
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
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
      let { errno, msg } = await G.utils.axios.post(
        G.constant.API.CANCEL_FOLLOW,
        {
          id: G.data.currentUser.id,
        }
      );
      if (errno) {
        // 針對employer，限制取消
        alert(msg);
        return;
      }
      G.data.relationShip.fansList.splice(
        G.data.relationShip.fansList.indexOf(G.data.me.id),
        1
      );
      //  在粉絲列表中移除 粉絲htmlStr
      if (G.data.relationShip.fansList.length > 0) {
        //  如果仍有追蹤者，直接移除
        $fansList
          .find(`li[data-${G.constant.DATASET.KEY.USER_ID}=${G.data.me.id}]`)
          .remove();
      } else {
        //  如果已無追蹤者，撤換掉列表內容
        $fansList
          .children("ul")
          .css("width", "100%")
          .html(`<div>很遺憾，列表裡沒有人</div>`);
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
  async function init_self() {
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

    //  刪除文章
    async function handle_removeBlogs(e) {
      let $target = $(e.target);
      let action = $target.data(G.constant.DATASET.KEY.REMOVE_BLOG);
      if (!action || (action && !confirm("真的要刪除嗎?"))) {
        return;
      }
      e.preventDefault();
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
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
        location.href = `/permission/${errno}`;
        return;
      }
      alert("刪除成功，頁面將重新整理...");
      //  刷新頁面
      location.reload();
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
        title: G.utils._xss.trim(input.value),
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
