/* CSS        ----------------------------------------------------------------------------- */
import "@css/blog-edit.scss";
console.log("6666");
/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* CONFIG     ----------------------------------------------------------------------------- */
import localeTw from "@config/const/wangeditor_locale_tw.json";

/* NPM        ----------------------------------------------------------------------------- */
import SparkMD5 from "spark-md5";
import {
  i18nAddResources,
  i18nChangeLanguage,
  createToolbar,
  createEditor,
} from "@wangeditor/editor";

/* UTILS      ----------------------------------------------------------------------------- */
import {
  _Ajv,
  Debounce,
  _xss,
  formFeedback,
  redir,
  errorHandle,
} from "../utils";

/* COMPONENT   ---------------------------------------------------------------------------- */
import blog_htmlStr from "../component/blog_htmlStr";

/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  //  離開頁面前，是否發出提醒
  G.data.saveWarn = true;
  G.utils._xss = _xss;
  const $$ajv = new _Ajv(G.utils.axios);
  G.utils.validate = {
    img_alt: $$ajv._validate.img_alt,
    blog_img: $$ajv._validate.blog_img,
    blog: $$ajv._validate.blog,
  };
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}
async function initMain() {
  let $blog_status = $(`#${G.constant.ID.STATUS}`);
  let $inp_title = $(`#${G.constant.ID.TITLE}`);
  let $btn_updateTitle = $(`#${G.constant.ID.UPDATE_TITLE}`);
  let $btn_updateBlog = $(`#${G.constant.ID.UPDATE_BLOG}`);
  let $btn_removeBlog = $(`#${G.constant.ID.REMOVE_BLOG}`);
  let $span_content_count = $(`#${G.constant.ID.BLOG_HTML_STRING_COUNT}`);
  //  校驗可否submit
  G.utils.lock = initLock();
  //  文章內容編輯器
  G.utils.editor = init_editor();
  //  將文章內容編輯器放入loading_backdrop管理
  G.utils.loading_backdrop.insertEditors([G.utils.editor]);
  //  整理圖片數據
  await initImgData();
  //  確認文章內容圖片皆讀取完畢（G.utils.checkImgLoad由init_editor內部生成）
  await G.utils.checkImgLoad();
  //  focus editor
  G.utils.editor.focus();

  //  生成 blog title 的 input handle
  let { debounce: handle_debounce_input_for_title } = new Debounce(
    handle_input,
    {
      //  debounce階段時，限制更新鈕
      loading(e) {
        $btn_updateTitle.prop("disabled", true);
        formFeedback.loading(e.target);
      },
    }
  );
  //  $title handleInput => 驗證標題合法性
  $inp_title.on("input", handle_debounce_input_for_title);
  //  $title handleBlur => 若標題非法，恢復原標題
  $inp_title.on("blur", handle_blur);
  //  $btn_updateTitlebtn handleClick => 送出新標題
  $btn_updateTitle.on("click", handle_updateTitle);
  //  $show handleChange => 改變文章的公開狀態
  $blog_status.on("change", handle_pubOrPri);
  //  $save handleClick => 更新文章
  $btn_updateBlog.on("click", handle_updateBlog);
  //  btn#remove 綁定 click handle => 刪除 blog
  $btn_removeBlog.on("click", handle_removeBlog);

  //  離開頁面前的提醒
  window.addEventListener("beforeunload", (e) => {
    if (G.data.saveWarn && G.utils.lock.check_submit()) {
      e.preventDefault();
      // 過去有些browser必須給予e.returnValue字符值，才能使beforeunload有效運作
      e.returnValue = "mark";
      // 必須具備RV，beforeunload才有效果
      return "1";
    }
  });
  //  取消編輯前的提醒
  $("#leave").on("click", cancelEdit);
  //  預覽文章
  $("#preview").on("click", preview);

  //  預覽文章
  async function preview(e) {
    // 取得當前 title
    let title = G.utils.lock.get("title");
    if (!title) {
      title = G.data.blog.title;
    }
    // 取得當前 html
    let html = G.utils.lock.get("html");
    if (!html) {
      html = G.data.blog.html;
    }
    let key = JSON.stringify(location.href);
    let val = JSON.stringify({ title, html });
    localStorage.clear();
    localStorage.setItem(key, val);
    window.open(
      `/blog/preview/${G.data.blog.id}?${G.constant.PREVIEW_KEY}=${key}`
    );
  }

  //  取消編輯前的提醒
  async function cancelEdit() {
    if (confirm("真的要放棄編輯?")) {
      if (G.utils.lock.check_submit() && confirm("放棄編輯前是否儲存?")) {
        await handle_updateBlog();
      }
      G.data.saveWarn = false;
      location.replace("/self");
    }
  }

  //  刪除文章
  async function handle_removeBlog(e) {
    //  檢查登入狀態
    if (!redir.check_login(G) || !confirm("真的要刪掉?")) {
      return;
    }
    const data = {
      blogList: [G.data.blog.id],
    };
    let { errno } = await G.utils.axios.delete(G.constant.API.UPDATE_BLOG, {
      data,
    });
    if (errno) {
      location.href = `/permission/${errno}`;
      return;
    }
    alert("已成功刪除此篇文章，現在將跳往個人頁面");
    G.data.saveWarn = false;
    location.href = "/self";
  }

  //  更新文章
  async function handle_updateBlog(e) {
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    let payload = G.utils.lock.getPayload();
    //  整理出「預計刪除BLOG→IMG關聯」的數據
    let cancelImgs = getBlogImgIdList_needToRemove();
    if (cancelImgs.length) {
      //  若cancel有值
      payload.cancelImgs = cancelImgs; //  放入payload
    }
    let result = await G.utils.validate.blog({ ...payload, _old: G.data.blog });
    if (!result.valid) {
      throw new Error(JSON.stringify(result));
    }
    // 作為event_handle才詢問預覽
    if (e instanceof Event && confirm("儲存成功！是否預覽？（新開視窗）")) {
      window.open(`/blog/preview/${G.data.blog.id}`);
    }
    payload.blog_id = G.data.blog.id;
    let { errno, data } = await G.utils.axios.patch(
      G.constant.API.UPDATE_BLOG,
      payload
    );
    if (errno) {
      location.href = `/permission/${errno}`;
      return;
    }
    let { title, html, show, time } = data;
    let newData = {
      title,
      html: html ? decodeURI(html) : undefined,
      show,
      time,
    };
    //  畫面內容處理
    if (payload.hasOwnProperty("show")) {
      let text;
      if (show) {
        text = `已於 ${time} 發佈`;
      } else {
        text = `最近一次於 ${time} 編輯`;
      }
      $("#time").text(text);
    }
    //  數據同步
    if (payload.hasOwnProperty("cancelImgs")) {
      for (let { blogImgAlt_list } of cancelImgs) {
        for (let alt_id of blogImgAlt_list) {
          G.data.blog.map_imgs.delete(alt_id);
        }
      }
    }
    for (let [key, value] of Object.entries(newData)) {
      if (G.data.blog.hasOwnProperty(key)) {
        G.data.blog[key] = value;
      }
    }
    G.utils.lock.clear();
    G.utils.lock.check_submit();
    alert("文章已更新");
    return;
  }

  //  公開or隱藏文章
  async function handle_pubOrPri(e) {
    let KEY = "show";
    let newData = { [KEY]: e.target.checked };
    let result = await G.utils.validate.blog({ ...newData, _old: G.data.blog });
    if (result.valid) {
      G.utils.lock.setKVpairs(newData);
    } else {
      G.utils.lock.del(KEY);
    }
    if (!G.utils._xss.blog(G.utils.editor.getHtml())) {
      return;
    }
    G.utils.lock.check_submit();
  }

  //  更新title
  async function handle_updateTitle(e) {
    e.preventDefault();
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    const KEY = "title";
    const payload = {
      blog_id: G.data.blog.id,
      title: G.utils.lock.get(KEY),
    };
    let response = await G.utils.axios.patch(
      G.constant.API.UPDATE_BLOG,
      payload
    );
    //  同步數據
    G.data.blog[KEY] = response.data[KEY];
    G.utils.lock.del(KEY);
    G.utils.lock.check_submit();
    formFeedback.clear($inp_title.get(0));
    //  清空提醒
    alert("標題更新完成");
    return;
  }

  //  blur title表格
  async function handle_blur(e) {
    const KEY = "title";
    const target = e.target;
    if (!G.utils.lock.has(KEY)) {
      target.value = G.data.blog.title;
      formFeedback.clear(target);
    }
    G.utils.lock.check_submit();
    return;
  }

  //  input title表格
  async function handle_input(e) {
    const KEY = "title";
    const target = e.target;
    let title = _xss.trim(target.value);
    let newData = { [KEY]: title };
    let result = await G.utils.validate.blog({ ...newData, _old: G.data.blog });
    let result_title = result.find(({ field_name }) => field_name === "title");
    formFeedback.validated(target, result_title.valid, result_title.message);
    if (result.valid) {
      G.utils.lock.setKVpairs(newData);
    } else {
      G.utils.lock.del(KEY);
    }
    G.utils.lock.check_submit();
    return;
  }

  //  初始化editor
  function init_editor() {
    let cache_content = "";
    let first = true;
    //  判斷如何顯示img modal的表格內容
    //  0 -> 修改圖片
    //  1 -> 網路圖片
    //  2 -> 上傳圖片
    let setImgMode = 0;
    //  紀錄插入youtube影片的網址
    let hash;
    //  editor 的 繁中設定
    i18nAddResources("tw", localeTw);
    i18nChangeLanguage("tw");
    const { debounce: handle_debounce_change } = new Debounce(
      handle_editorChange,
      { loading: loading_editorChange }
    );
    //  部分的 input 不會觸動 wengeditor editorConfig.onChange，
    //  導致無法觸發 editorConfig.onChange 其中校驗表單可否更新的功能
    //  故此處主動綁定
    $blog_status.on("click", handle_debounce_change);
    //  editor config
    const editorConfig = {
      readOnly: true,
      placeholder: "請開始撰寫文章內容...",
      //  每次editor焦點/內容變動時調用
      onChange: handle_debounce_change,
      hoverbarKeys: {
        image: {
          menuKeys: [
            "editImage",
            "imageWidth30",
            "imageWidth50",
            "imageWidth100",
            "deleteImage",
          ],
        },
      },
      MENU_CONF: {
        //  插入網路圖片
        insertImage: {
          checkImage: customCheckInsertImgage,
        },
        //  上傳圖片
        uploadImage: {
          //  圖片的上傳函數
          customUpload,
        },
        //  編輯圖片
        editImage: {
          //  編輯前的檢查函數
          checkImage,
        },
        //  插入影片
        insertVideo: {
          //  校驗影片網址
          checkVideo: customCheckVideo,
          //  轉換影片插入的html
          parseVideoSrc: customParseVideoSrc,
          //  插入影片後的CB
          onInsertedVideo,
        },
      },
    };
    let { htmlStr, checkImgLoad } = blog_htmlStr(G);
    G.utils.checkImgLoad = checkImgLoad;
    var x = `<p style="text-align: left;">您好：</p>
    <p style="text-align: left;">我是一位自學網頁設計的求職者，關於我的個人履歷，請前往我的<a href="/other/1" target="_blank">個人頁面</a>查看。</p>
    <p style="text-align: left;">作為自學者，畢竟沒有實際經歷，希望此網站能作為一份自薦的作品，原始碼已經存放在<a href="https://github.com/CCYO/koa_blog" target="_blank">Github</a>，歡迎前往查看。</p>
    <p style="text-align: left;">此站希望藉由模擬『部落格網站』，表現我具有基本的網站設計能力，針對網站的大略配置、基本功能與實現方式，下方整理了粗略的說明：</p>
    <h5>－網站配置－</h5>
    <p style="text-align: left;">此網站以NodeJS搭建伺服器服務，後端採<a href="https://www.npmjs.com/package/koa" target="_blank">KOA框架</a>，前端樣式以Bootstrap為基礎來設計，前端功能使用JQuery、搭配部分<a href="https://www.npmjs.com/" target="_blank">NPM包</a>以及基本JS編寫，開發全程都以Webpack作為前後端程式的打包統整工具。</p>
    <p style="text-align: left;">伺服器架設在<a href="https://cloud.google.com/products/compute?hl=zh-TW" target="_blank">GCE平台</a>，使用<a href="https://www.npmjs.com/package/pm2" target="_blank">PM2</a>維持伺服器自動重啟與更新，並搭配Nginx作反向代理。</p>
    <p style="text-align: left;">資料庫共使用以下三種：</p>
    <ul>
      <li><span>Redis</span></li>
    </ul>
    <p> &nbsp; &nbsp;管理登入狀態（Session）以及常用公開數據緩存。</p>
    <ul>
      <li><span>MySQL</span></li>
    </ul>
    <p> &nbsp; &nbsp;負責管理網站主要數據，為了方便配合NodeJS使用JS操作，基本上都是利用<a href="https://sequelize.org/" target="_blank">NPM_Sequelize</a>進行操作。</p>
    <ul>
      <li><a href="https://firebase.google.com/products/storage" target="_blank">Google FireBase/Cloud Stroage</a></li>
    </ul>
    <p> &nbsp; &nbsp;負責管理圖片資源。</p>
    <h5>－基本功能與實現－</h5>
    <ul>
      <li><span>註冊/登入系統</span></li>
    </ul>
    <p> &nbsp; &nbsp;前端表格資料校驗，符合後再以AJAX傳至後端，進行MySql建立/驗證會員數據，並以Redis登記Session資料。</p>
    <ul>
      <li><span>追蹤/退追偶像</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>將MySQL內的使用者資料建立關聯，往後若偶像（被追蹤者）發布文章時，追蹤者就能接收到通知；反之取消追蹤時，便將MySQL內的使用者資料關聯取消。</p>
    <ul>
      <li><span>通知功能</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>新粉絲追蹤、偶像發布文章、你的文章有新留言、你的留言有新回覆，以上『與你有關的通知』，都能接收到通知提醒。</p>
    <ul>
      <li><span>即時通知提示</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span style="color: red;">［需登入］</span>運用<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket" target="_blank">websocket</a>保持前後端會話，當後端產生了『與你有關的通知』（請參考<span>通知功能</span>的說明），此時若你正在使用此站頁面、且是登入狀態，頁面會顯示飛入動畫、提醒你讀取新通知。</p>
    <ul>
      <li><span>撰寫文章</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>使用<a href="https://www.npmjs.com/package/wangeditor" target="_blank">NPM_wangEditor</a>建立文本編輯器，並添加編輯文章必要的各項功能，包含<u>修改標題</u>、<u>圖片上傳</u>、<u>文章內容校驗</u>、<u>隱藏/公開文章</u>、<u>預覽</u>、<u>儲存</u>、<u>刪除</u>、<u>提醒尚未儲存</u>。</p>
    <ul>
      <li><span>文章相簿編輯</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>以分頁的方式展示出含有照片的個人文章列表，選擇指定文章進入後，可為該文章照片重新命名，此命名會在觀看文章時，成為&lt;img alt="xxx"&gt;展示。</p>
    <ul>
      <li><span>文章留言</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>可在公開文章的底下留言，除了文章作者會接收到通知，每則留言都會被認列入一個『留言串』（id），同一個留言串有其他人回覆新留言時，此留言串裡的所有人都會接收到通知。</p>
    <ul>
      <li><span>個人資訊編輯</span></li>
    </ul>
    <p> &nbsp; &nbsp;<span>［需登入］</span>可修改個人資訊，包含Email、暱稱、密碼、年齡、大頭照，與更新資訊有關的頁面，顯示的資料也會一併更新。</p>
    <ul>
      <li><span>靜態資源緩存</span></li>
    </ul>
    <p> &nbsp; &nbsp;前端頁面可複用的靜態資源(JS,CSS,favicon)，依靠NGINX實現緩存，且藉由webpack的contentHash命名機制，避免使用過期資源。</p>
    <ul>
      <li><span>動態數據緩存</span></li>
    </ul>
    <p> &nbsp; &nbsp;網站頁面都是藉由後端EJS渲染，其中無須登入也可瀏覽的頁面（<a href="/other/1" target="_blank">他人頁面</a>、<a href="/square" target="_blank">文章廣場</a>、<a href="/blog/1" target="_blank">公開文章</a>），針對這些頁面模板（EJS Template）所需傳入的數據，使用Redis進行緩存，並依據請求時的If-None-Match/Etag判斷是否為有效緩存，減少後端操作MySQL的負擔。</p>
    <ul>
      <li><span>資料校驗</span></li>
    </ul>
    <p> &nbsp; &nbsp;填寫前端所有表格時，都會提示資料是否符合校驗規則；點擊資料發送鈕時，無論前後端都會再次進行校驗（依靠<a href="https://www.npmjs.com/package/ajv" target="_blank">NPM_Ajv</a>實現），確認通過才會進行AJAX請求、操作MySQL。</p>
    <p><br></p>
    <p>以上，是此站配置與功能實現的大略介紹，感謝進入此站、並觀看至文末，若貴司仍有職缺，且我的條件符合需求，懇請傳送面試邀約，無論<a href="mailto:tume20938@gmail.com" target="_blank">Email</a>、<a href="tel:+886-981237800" target="_blank">來電</a>、<a href="https://line.me/ti/p/XGQyPIxqxt" target="_blank">LINE</a>形，或是在此篇文章回覆，我得到訊息後將隨即與貴司聯繫，再次感謝抽空閱讀至此的您。</p>`;
    // var x = `<p> &nbsp; &nbsp;<span style="color: red">［需登入］</span>運用保持前後端會話，當後端產生了『與你有關的通知』（請參考<span>通知功能</span>的說明），此時若你正在使用此站頁面、且是登入狀態，頁面會顯示飛入動畫、提醒你讀取新通知。</p>`;
    var html = decodeURI(htmlStr);
    // var html = x;
    //  editor 編輯欄 創建
    const editor = createEditor({
      //  插入後端取得的 html
      // html: htmlStr || "",
      html,
      selector: `#${G.constant.ID.EDITOR_CONTAINER}`,
      config: editorConfig,
    });
    //  editor 工具欄 創建
    createToolbar({
      editor,
      selector: `#${G.constant.ID.EDITOR_TOOLBAR_CONTAINER}`,
      mode: "simple",
      config: {
        //  移除滿版功能
        excludeKeys: ["fullScreen"],
      },
    });
    $span_content_count.text(
      `還能輸入${
        G.constant.EDITOR.HTML_MAX_LENGTH - editor.getHtml().length
      }個字`
    );
    let imgEditModalisShow = false;
    //  handle 用來隱藏 image modal 的 src & url 編輯功能
    editor.on("modalOrPanelShow", handle_modalShow);
    editor.on("modalOrPanelHide", handle_modalHide);

    return editor;
    //  handle 恢復 setImgMode
    function handle_modalHide(modalOrPanel) {
      imgEditModalisShow = false;
      //  handle 恢復 setImgMode
      setImgMode = 0;
      return;
    }
    //  handle 用來隱藏 image modal 的 src & url 編輯功能
    function handle_modalShow(modalOrPanel) {
      imgEditModalisShow = true;
      //  圖片編輯model，每次modalOrPanelShow都會重新創建子表格，所以要重新抓取
      const $modal = $(modalOrPanel.$elem).first();
      const $containerList = $modal.find("div > label.babel-container");
      const isImgModel =
        $containerList.first().children("span").text() === localeTw.image.src;
      if (!isImgModel || setImgMode) {
        return;
      }
      //  $containerList [ 圖片位址表格(src), 圖片說明表格(alt), 圖片連結表格(href)]
      $containerList.hide(0);
      //  不能省略focus操作，推估modalOrPanel成型條件需要由focus定位，
      //  否則會導致稍後任何點擊都導致 handle_editorChange，而讓model自動消失
      $containerList.eq(1).show(0).get(0).focus();
    }
    //  插入影片後的CB
    function onInsertedVideo() {
      hash = undefined;
    }
    //  轉換影片插入的html
    function customParseVideoSrc(src) {
      return genTemplate(hash);
      function genTemplate(hash) {
        return `
                    <iframe 
                        src="https://www.youtube.com/embed/${hash}"
                        width="570" height="370"
                        title="YouTube video player"
                        frameborder="0"
                        allow="
                            accelerometer;
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            gyroscope;
                            picture-in-picture;
                            web-share"
                        allowfullscreen
                    ></iframe>
                    `;
      }
    }
    //  校驗影片網址
    function customCheckVideo(src) {
      const reg_1 = /^https:\/\/youtu\.be\/(?<hash>.{11})/;
      const reg_2 = /^https:\/\/www\.youtube.com\/watch\?v=(?<hash>.{11})/;
      for (let reg of [reg_1, reg_2]) {
        let res = reg.exec(src);
        if (res) {
          hash = res.groups.hash;
          break;
        }
      }
      if (!hash) {
        return "請傳入youtube影片網址";
      }
      return true;
    }
    //  修改圖片資訊前的檢查函數
    async function checkImage(src, new_alt, url) {
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
      let res = G.constant.REG.IMG_ALT_ID.exec(src);
      //  取得要修改的alt_id
      let alt_id = (res.groups.alt_id *= 1);
      let { alt, img } = G.data.blog.map_imgs.get(alt_id);
      if (`${img.url}?alt_id=${alt_id}` !== src) {
        return "不能修改src";
      }
      if (url) {
        //  RV會自動被化作警告
        return "不能修改url";
      }
      let result = await G.utils.validate.img_alt({
        _old: {
          alt,
        },
        alt: new_alt,
      });
      if (!result.valid) {
        let { message } = result.find(({ field_name }) => field_name === "alt");
        return message;
      }
      let { errno } = await G.utils.axios.patch(G.constant.API.UPDATE_ALBUM, {
        alt_id,
        blog_id: G.data.blog.id,
        alt: _xss.trim(new_alt),
      });
      if (errno) {
        location.href = `/permission/${errno}`;
        return;
      }
      //  尋找相同 alt_id
      let imgData = G.data.blog.map_imgs.get(alt_id);
      imgData.alt = alt;
      return true;
    }
    //  自定義上傳圖片方法
    async function customUpload(img, insertFn) {
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
      //  取得 name ext
      let _res = G.constant.REG.IMG_NAME_AND_EXT.exec(img.name);
      if (!_res) {
        alert("圖檔格式必須為PNG或JPG");
        return false;
      }
      let [match = "", ext] = _res;
      let validated_list = await G.utils.validate.blog_img({
        ext,
        size: img.size,
      });
      if (!validated_list.valid) {
        let message = validated_list.reduce((acc, { message }) => {
          if (message) {
            if (acc.length) {
              acc += `,${message}`;
            } else {
              acc += `${message}`;
            }
          }
          return acc;
        }, "");
        alert(message);
        return false;
      }
      //  取得 img 的 MD5 Hash(hex格式)
      let hash = await _getMD5Hash(img);
      // exist = { blogImg_id, img_id };
      let exist = await _isImgExist(hash);
      let api = `${G.constant.API.CREATE_IMG}?hash=${hash}&blog_id=${G.data.blog.id}`;
      let formdata = new FormData();
      api += `&ext=${ext}`;
      formdata.append("blogImg", img);
      if (exist) {
        //  img為重覆的舊圖，傳給後端新建一個blogImgAlt
        let { img_id, blogImg_id } = exist;
        api += `&blogImg_id=${blogImg_id}&img_id=${img_id}`;
      }
      let res = await G.utils.axios.post(api, formdata);
      //  res.data { id, alt, blogImg: { id }, img: { id, url, hash }}
      let { data: blogImgAlt } = res;
      let { id, ...alt_data } = blogImgAlt;
      //  同步數據
      //  { [alt_id]: { alt, blogImg: { id }, img: { id, hash, url } }}
      G.data.blog.map_imgs.set(id, alt_data);
      //  將圖片插入 editor
      insertFn(`${alt_data.img.url}?alt_id=${id}`, alt_data.alt);
      return;
      //  取得圖片的 hash
      async function _isImgExist(hash) {
        let res;
        let { map_imgs } = G.data.blog;
        if (map_imgs.size) {
          ////  確認此時要上傳的img是否為舊圖
          // map_item { [alt_id] => { alt, blogImg: { id }, img: { id, hash, url } }, ...}
          let values = [...map_imgs.values()];
          let target = values.find(({ img }) => img.hash === hash);
          if (target) {
            res = {
              blogImg_id: target.blogImg.id,
              img_id: target.img.id,
            };
          }
        }
        return res;
      }

      //  計算 file 的 MD5 Hash
      function _getMD5Hash(file) {
        return new Promise((resolve, reject) => {
          let fr = new FileReader();
          fr.readAsArrayBuffer(file);
          fr.addEventListener("load", () => {
            if (fr.readyState === FileReader.DONE) {
              let hash = SparkMD5.ArrayBuffer.hash(fr.result);
              resolve(hash);
              return;
            }
          });
          fr.addEventListener("error", () => {
            reject(fr.error);
            return;
          });
        });
      }
    }
    //  校驗插入網路圖片的網址
    function customCheckInsertImgage(src, alt, url) {
      // JS 语法
      if (!src) {
        return;
      }
      if (src.indexOf("http") !== 0) {
        return "圖片網址必須為 http/https 开头";
      }
      return true;
    }

    //  handle：editor選區改變、內容改變時觸發
    async function handle_editorChange() {
      if (first) {
        ////  迴避editor創建後，首次因為editor.focus觸發的changeEvent
        first = false;
        $("[data-menu-key=insertImage] > .title").on("click", () => {
          //  1 -> 網路圖片
          setImgMode = 1;
        });
        $("[data-menu-key=uploadImage] > .title").on("click", () => {
          //  2 -> 上傳圖片
          setImgMode = 2;
        });
        return;
      } else if (imgEditModalisShow) {
        return;
      }

      let KEY = "html";
      let content = G.utils.editor.getHtml();
      // xss + 將<img>轉換為自定義<x-img>
      cache_content = _parseHtmlStr_ImgToXImg(_xss.blog(content));
      let newData = { [KEY]: cache_content };
      //  校證html
      let result = await G.utils.validate.blog({
        ...newData,
        _old: G.data.blog,
      });
      let text_count = G.constant.EDITOR.HTML_MAX_LENGTH - cache_content.length;
      let text = `還能輸入${text_count}個字`;
      if (result.valid) {
        G.utils.lock.setKVpairs(newData);
        $span_content_count.removeClass("text-danger").text(text);
      } else {
        let { keyword, message } = result.find(
          ({ field_name }) => field_name === KEY
        );
        G.utils.lock.del(KEY);
        let set = new Set(keyword);
        if (set.has("_notEmpty")) {
          text = "文章內容不可為空";
          $span_content_count.addClass("text-danger").text(text);
        } else if (set.has("_notRepeat")) {
          //  _notRepeat 不用報錯
          $span_content_count.removeClass("text-danger").text(text);
        } else {
          $span_content_count.addClass("text-danger").text(message);
        }
      }
      G.utils.lock.check_submit();

      //  將<img>替換為自定義<x-img>
      function _parseHtmlStr_ImgToXImg(html) {
        let reg = G.constant.REG.IMG_PARSE_TO_X_IMG;
        let res;
        let copy = html;
        while ((res = reg.exec(html))) {
          let { alt_id, style } = res.groups;
          copy = copy.replace(
            res[0],
            //  此次匹配到的整條字符串
            `<x-img data-alt-id='${alt_id}' ${
              style ? `data-style='${style}'` : ""
            }/>`
          );
        }
        return copy;
      }
    }
    function loading_editorChange() {
      if (!first) {
        $btn_updateBlog.prop("disabled", true);
        $span_content_count.text("確認中...").removeClass("text-danger");
      }
    }
  }

  //  校驗submit
  function initLock() {
    return new (class Lock extends Map {
      setKVpairs(dataObj) {
        //  將kv資料存入
        const entries = Object.entries(dataObj);
        if (entries.length) {
          for (let [key, value] of entries) {
            this.#set(key, value);
          }
        }
      }
      getPayload() {
        let res = {};
        for (let [key, value] of [...this]) {
          res[key] = value;
        }
        return res;
      }
      check_submit() {
        let disabled = true;
        // if (this.size) {
        if (this.size) {
          disabled = $span_content_count.hasClass("text-danger");
        }
        $btn_updateBlog.prop("disabled", disabled);
        return !disabled;
      }
      //  刪除數據
      del(key) {
        this.delete(key);
        if (key === "title") {
          //  若刪除的是title，關閉更新鈕
          $btn_updateTitle.prop("disabled", true);
        }
      }
      #set(key, value) {
        if (key === "title") {
          //  若設定的是title，開啟更新鈕
          $btn_updateTitle.prop("disabled", false);
        }
        this.set(key, value);
      }
    })();
  }

  //  整理圖片數據
  async function initImgData() {
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    ////  取出存在pageData.imgs的圖數據，但editor沒有的
    ////  通常是因為先前editor有做updateImg，但沒有存文章，導致後端有數據，但editor的html沒有
    //  整理要與該blog切斷關聯的圖片，格式為[{blogImg_id, blogImgAlt_list}, ...]
    let cancelImgs = getBlogImgIdList_needToRemove();

    if (!cancelImgs.length) {
      return;
    }
    await G.utils.axios.patch(G.constant.API.UPDATE_BLOG, {
      cancelImgs,
      blog_id: G.data.blog.id,
    });
    //  整理img數據
    cancelImgs.forEach(({ blogImgAlt_list }) => {
      blogImgAlt_list.forEach((alt_id) => {
        G.data.blog.map_imgs.delete(alt_id);
      });
    });
    !process.env.isProd &&
      console.log(
        "初始化頁面數據時重整圖片數據，已完成前/後端移除 => ",
        cancelImgs
      );
  }

  //  針對要移除的圖片，整理出相關數據
  function getBlogImgIdList_needToRemove() {
    /**
     * 使用狀況：
     * (1)上一次編輯，有上傳圖片卻未儲存文章
     * (2)此次編輯時，有上傳圖片卻又刪除
     * 會導致G.data.blog.map_imgs存在G.data.blog.html所沒有的圖片
     */
    let set = new Set(G.data.blog.map_imgs.keys());
    let reg = G.constant.REG.IMG_ALT_ID;
    //  找出editor內的<img>數據，格式為 [{src, alt, href}, ...]
    let alt_list = G.utils.editor
      .getElemsByType("image")
      .reduce((acc, { src }) => {
        let res = reg.exec(src);
        if (res && res.groups.alt_id) {
          //  由電腦上傳的圖片
          let alt_id = res.groups.alt_id * 1;
          acc.delete(alt_id);
        }
        return acc;
      }, set);
    ////  整理出要給後端移除照片的資訊
    let cancelImgs = Array.from(alt_list).reduce((acc, alt_id) => {
      let {
        blogImg: { id: blogImg_id },
      } = G.data.blog.map_imgs.get(alt_id);
      let index = acc.findIndex((img) => img.blogImg_id === blogImg_id);
      if (index < 0) {
        ////  代表須被移除的圖檔，目前僅發現當前這一張
        acc.push({
          blogImg_id,
          blogImgAlt_list: [alt_id],
        });
      } else {
        ////  這張需被移除的圖片，目前已有一張以上的同檔
        acc[index]["blogImgAlt_list"].push(alt_id);
      }
      return acc;
    }, []);
    return cancelImgs;
  }
}
