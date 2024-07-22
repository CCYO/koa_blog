/* CSS Module ------------------------------------------------------------------------------- */
import "@css/blog-edit.scss";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* NPM Module ------------------------------------------------------------------------------- */
import SparkMD5 from "spark-md5";
import {
  i18nAddResources,
  i18nChangeLanguage,
  createToolbar,
  createEditor,
} from "@wangeditor/editor";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import {
  Debounce,
  _Ajv,
  errorHandle,
  _xss,
  formFeedback,
  dev_log,
  localeTw,
} from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  const $$ajv = new _Ajv(G.utils.axios);
  G.page = "blog_edit";
  G.constant = FRONTEND.BLOG_EDIT;
  G.utils._xss = _xss;
  G.utils.validate = {
    img_alt: $$ajv._validate.img_alt,
    blog_img: $$ajv._validate.blog_img,
    blog: $$ajv._validate.blog,
  };
  await G.main(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  /* ------------------------------------------------------------------------------------------ */
  /* JQ Ele in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  let $blog_status = $(`#${G.constant.ID.STATUS}`);
  let $inp_title = $(`#${G.constant.ID.TITLE}`);
  let $btn_updateTitle = $(`#${G.constant.ID.UPDATE_TITLE}`);
  let $btn_updateBlog = $(`#${G.constant.ID.UPDATE_BLOG}`);
  let $btn_removeBlog = $(`#${G.constant.ID.REMOVE_BLOG}`);
  let $span_content_count = $(`#${G.constant.ID.BLOG_HTML_STRING_COUNT}`);
  /* ------------------------------------------------------------------------------------------ */
  /* Public Var in Closure -------------------------------------------------------------------- */
  /* ------------------------------------------------------------------------------------------ */
  //  初始化 頁面各功能
  G.utils.lock = initLock();
  G.utils.editor = create_editor();
  G.utils.loading_backdrop.insertEditors([G.utils.editor]);
  //  整理圖片數據
  await initImgData();
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
  /* ------------------------------------------------------------------------------------------ */
  /* Init ------------------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------------------------ */

  function create_editor() {
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
    //  editor 編輯欄 創建
    const editor = createEditor({
      //  插入後端取得的 html
      html: parseHtmlStr_XImgToImg() || "",
      selector: `#${G.constant.ID.EDITOR_CONTAINER}`,
      config: editorConfig,
    });
    //  editor 工具欄 創建
    const toolbar = createToolbar({
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
    //  handle 用來隱藏 image modal 的 src & url 編輯功能
    editor.on("modalOrPanelShow", handle_modalShow);
    //  handle 恢復 setImgMode
    editor.on("modalOrPanelHide", handle_modalHide);
    return editor;
    //  handle 恢復 setImgMode
    function handle_modalHide(modalOrPanel) {
      setImgMode = 0;
      return;
    }
    //  handle 用來隱藏 image modal 的 src & url 編輯功能
    function handle_modalShow(modalOrPanel) {
      const $modal = $(modalOrPanel.$elem).first();
      const $containerList = $modal.find("div > label.babel-container");
      const isImgModel =
        $containerList.first().children("span").text() === localeTw.image.src;
      //  若匹配，代表是 Image modal
      if (!isImgModel) {
        return;
      }
      //  關於編輯圖片資訊的model，每次modalOrPanelShow都會重新創建子表格
      //  $containerList [ 圖片位址表格(src), 圖片說明表格(alt), 圖片連結表格(href)]
      if (setImgMode === 0) {
        $containerList.eq(0).hide();
      }
      $containerList.eq(2).hide();
      return;
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
      result = result.filter(({ field_name }) => field_name !== "_old");
      result.invalid = result.some(({ valid }) => !valid);
      if (result.invalid) {
        let { message } = result.find(({ field_name }) => field_name === "alt");
        return message;
      }

      await G.utils.axios.patch(G.constant.API.UPDATE_ALBUM, {
        alt_id,
        blog_id: G.data.blog.id,
        alt: _xss.trim(new_alt),
      });
      //  尋找相同 alt_id
      let imgData = G.data.blog.map_imgs.get(alt_id);
      imgData.alt = alt;
      return true;
    }
    //  自定義上傳圖片方法
    async function customUpload(img, insertFn) {
      //  取得 name ext
      //  取得 size

      // let nameAndExt = _getNameAndExt(img.name);
      let _res = G.constant.REG.IMG_NAME_AND_EXT.exec(img.name);
      let [_ = "", alt = "", ext] = _res;
      // if (!nameAndExt) {
      //   return false;
      // }
      // if (img.size > FRONTEND.BLOG_EDIT.EDITOR.IMG_MAX_SIZE) {
      //   alert(
      //     `片大小必須小於${Math.floor(
      //       FRONTEND.EDITOR.IMG_MAX_SIZE / (1024 * 1024)
      //     )}Mb`
      //   );
      //   return false;
      // }
      let validated_list = await G.utils.validate.blog_img({
        alt,
        ext,
        size: img.size,
      });
      let valid = !validated_list.some((item) => !item.valid);
      if (!valid) {
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
      //  生成 img 的 hash(hex格式)
      //  取得 img 的 MD5 Hash(hex格式)
      let hash = await _getMD5Hash(img);
      // let blogImg_id = await _findExistBlogImgId(hash);
      // exist = { blogImg_id, url, hash, img_id };
      let blogImg_id = await _findExistBlogImgId(hash);
      let api = `${G.constant.API.CREATE_IMG}?hash=${hash}&blog_id=${G.data.blog.id}`;
      let formdata = new FormData();
      if (!blogImg_id) {
        ////  img為新圖，傳給後端新建一個blogImgAlt
        //  imgName要作為query參數傳送，必須先作百分比編碼
        alt = encodeURIComponent(alt);
        api += `&name=${alt}&ext=${ext}`;
        formdata.append("blogImg", img);
      } else {
        ////  img為重覆的舊圖，傳給後端新建一個blogImgAlt
        api += `&blogImg_id=${blogImg_id}`;
      }
      let res = await G.utils.axios.post(api, formdata);
      //  blogImgAlt { id, alt, blog: { id, author_id }, blogImg: { id, name }, img: { id, url, hash }}
      let { data: blogImgAlt } = res;
      let { id, blog, ...alt_data } = blogImgAlt;
      //  上傳成功
      //  newImg格式:
      /*{
                        "alt_id": 16,
                        "alt": "IMG_6362",
                        "blogImg_id": 8,
                        "name": "IMG_6362",
                        "img_id": 7,
                        "url": xxxxx
                    }
                    */
      //  同步數據
      //  { [alt_id]: { alt, blogImg: { id, name }, img: { id, hash, url } }}
      G.data.blog.map_imgs.set(id, alt_data);
      //  將圖片插入 editor
      insertFn(`${alt_data.img.url}?alt_id=${id}`, alt_data.alt);
      return;
      //  取得圖片的 hash
      async function _findExistBlogImgId(hash) {
        // let blogImg_id = undefined;
        let res;
        let { map_imgs } = G.data.blog;
        if (map_imgs.size) {
          ////  確認此時要上傳的img是否為舊圖
          //  map_imgs: { MAP [alt_id] -> { alt, blogImg: { id, name }, img: { id, hash, url } } }
          let values = [...map_imgs.values()];
          //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
          let target = values.find(({ img }) => img.hash === hash);
          if (target) {
            // blogImg_id = target.blogImg_id;
            // let { alt_id, alt, blogImg_id, name, img_id, hash, url } =
            //   target;
            res = target.blogImg.id;
          }
        }
        // return blogImg_id;
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
      function _getNameAndExt(imgName) {
        let result = true;
        let [_, name, ext] = G.constant.REG.IMG_NAME_AND_EXT.exec(imgName);
        name = _xss.trim(name).toUpperCase();
        ext = _xss.trim(ext).toUpperCase();
        if (ext !== "PNG" && ext !== "JPG") {
          result = false;
        }
        if (result) {
          result = { name, ext };
        } else {
          alert("圖片格式錯誤，必須是png或jpg圖檔");
        }
        return result;
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

    function parseHtmlStr_XImgToImg() {
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
        let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}"`;
        let replaceStr = style ? `${imgEle} style="${style}"/>` : `${imgEle}/>`;
        //  修改 _html 內對應的 img相關字符
        htmlStr = htmlStr.replace(res[0], replaceStr);
        dev_log(`html內blogImgAlt/${alt_id}的tag數據-----parse完成`);
      }
      return htmlStr;
    }
    //  handle：editor選區改變、內容改變時觸發
    async function handle_editorChange() {
      if (first) {
        ////  迴避editor創建後，首次因為editor.focus觸發的changeEvent
        first = false;
        $("[data-menu-key=insertImage] > .title").on("click", () => {
          setImgMode = 1;
        });
        $("[data-menu-key=uploadImage] > .title").on("click", () => {
          setImgMode = 2;
        });
        return;
      }
      let KEY = "html";
      let content = G.utils.editor.getHtml();
      // xss + 將<img>轉換為自定義<x-img>
      cache_content = _parseHtmlStr_ImgToXImg(_xss.blog(content));
      let newData = { [KEY]: cache_content };
      //  校證html
      let result = await validate(newData);
      let { keyword, message } = result.find(
        ({ field_name }) => field_name === KEY
      );
      let text_count = G.constant.EDITOR.HTML_MAX_LENGTH - cache_content.length;
      let text = `還能輸入${text_count}個字`;
      if (!result.invalid) {
        G.utils.lock.setKVpairs(newData);
        $span_content_count.removeClass("text-danger").text(text);
      } else {
        G.utils.lock.del(KEY);
        let set = new Set(keyword);
        if (set.size > 2) {
          //  合理的情況下，最多同時 _notEmpty + _notRepeat
          throw new Error(JSON.stringify(result));
        } else if (set.has("_notEmpty")) {
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
            `<x-img data-alt-id='${alt_id}' data-style='${style}'/>`
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

  //  初始化 更新紐的lock
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
        if (this.size) {
          disabled = $span_content_count.hasClass("text-danger");
        }
        $btn_updateBlog.prop("disabled", disabled);
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
  /* ------------------------------------------------------------------------------------------ */
  /* Handle ------------------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------------------------ */
  //  關於 刪除文章的相關操作
  async function handle_removeBlog(e) {
    if (!confirm("真的要刪掉?")) {
      return;
    }
    const data = {
      blogList: [G.data.blog.id],
    };
    await G.utils.axios.delete(G.constant.API.UPDATE_BLOG, { data });
    alert("已成功刪除此篇文章，現在將跳往個人頁面");
    location.href = "/self";
  }
  //  關於 更新文章的相關操作
  async function handle_updateBlog(e) {
    let payload = G.utils.lock.getPayload();
    //  整理出「預計刪除BLOG→IMG關聯」的數據
    let cancelImgs = getBlogImgIdList_needToRemove();
    if (cancelImgs.length) {
      //  若cancel有值
      payload.cancelImgs = cancelImgs; //  放入payload
    }
    let result = await validate(payload);
    if (result.invalid) {
      throw new Error(JSON.stringify(result));
    }
    payload.blog_id = G.data.blog.id;
    let { data } = await G.utils.axios.patch(
      G.constant.API.UPDATE_BLOG,
      payload
    );
    let { title, html, show, time } = data;
    let newData = { title, html, show, time };
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
    if (confirm("儲存成功！是否預覽？（新開視窗）")) {
      window.open(`/blog/preview/${G.data.blog.id}`);
    }
    return;
  }
  //  關於 設定文章公開/隱藏時的操作
  async function handle_pubOrPri(e) {
    let KEY = "show";
    let newData = { [KEY]: e.target.checked };
    let result = await validate(newData);
    if (!result.invalid) {
      G.utils.lock.setKVpairs(newData);
    } else {
      G.utils.lock.del(KEY);
    }
    G.utils.lock.check_submit();
    return;
  }
  //  關於 更新title 的相關操作
  async function handle_updateTitle(e) {
    e.preventDefault();
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
  //  關於 title 輸入新值後，又沒立即更新的相關操作
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
  //  關於 title 輸入新值時的相關操作
  async function handle_input(e) {
    const KEY = "title";
    const target = e.target;
    let title = _xss.trim(target.value);
    let newData = { [KEY]: title };
    let result = await validate(newData);
    let result_title = result.find(({ field_name }) => field_name === "title");
    formFeedback.validated(target, result_title.valid, result_title.message);
    if (!result.invalid) {
      G.utils.lock.setKVpairs(newData);
    } else {
      G.utils.lock.del(KEY);
    }
    G.utils.lock.check_submit();
    return;
  }

  /* UTILS ------------------- */

  async function initImgData() {
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
    dev_log("初始化頁面數據時重整圖片數據，已完成前/後端移除 => ", cancelImgs);
  }
  /*  取出要移除的 blogImgAlt_id  */
  ////  移除上一次編輯時，有上傳的圖片卻沒有儲存文章，導致這次編輯時，
  ////  G.data.blog.map_imgs 內可能存在 G.data.blog.html 所沒有的圖片
  function getBlogImgIdList_needToRemove() {
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
  //  校驗blog數據，且決定submit可否點擊
  async function validate(newData) {
    let result = await G.utils.validate.blog({
      ...newData,
      _old: G.data.blog,
    });
    //  過濾掉 _old
    result = result.filter(({ field_name }) => field_name !== "_old");
    result.invalid = result.some(({ valid }) => !valid);
    return result;
  }
}
