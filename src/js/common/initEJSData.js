/**
 * @description 後端EJS模板傳入，要給JS使用的數據
 */

/* VAR        ----------------------------------------------------------------------------- */
const DATA_SET = "my-data";
//  需要特別處理的數據
const KEYS = {
  //  album頁面的 imgs數據
  ALBUM: ["imgs", "map_imgs"],
  //  blog頁面的 blog 數據
  BLOG: ["blog", "blog"],
};

/* EXPORT     ----------------------------------------------------------------------------- */
export default function () {
  let $container = $(`[data-${DATA_SET}]`);
  if (!$container.length) {
    return;
  }
  //  收集存放ejs data的元素
  let $box_list = Array.from($container, (box) => $(box).first());
  let ejs_data = $box_list.reduce((ejs_data, $box) => {
    //  取得data-set，同時代表此數據的類型
    let key = $box.data(DATA_SET);
    //  該ejs數據元素內，所存放的數據種類名稱
    let kv;
    //  取出元素內的字符，其為ejs data的JSON string 格式
    let JSON_string = $box.html().trim();
    //  JSON String → JSON Obj
    let val;
    try {
      val = JSON.parse(JSON_string);
    } catch (e) {
      val = "";
    }
    //  統整ejs data
    if (key === KEYS.BLOG[0]) {
      //  blog 數據
      kv = { [KEYS.BLOG[1]]: initBlog(val) };
    } else if (key === KEYS.ALBUM[0]) {
      //  album 數據
      kv = { [KEYS.ALBUM[1]]: initAlbum(val) };
    } else {
      //  其餘數據
      kv = { [key]: val };
    }
    ejs_data = { ...ejs_data, ...kv };
    return ejs_data;
    //  儲存整理後的ejs數據
  }, {});

  $container.parent().remove();
  return ejs_data;
}
//  初始化album數據
function initAlbum(imgs) {
  //  img數據map化
  return initImg(imgs);
}
//  初始化blog數據
function initBlog(blog) {
  if (blog.imgs) {
    blog.map_imgs = initImg(blog.imgs);
    delete blog.imgs;
  }
  //  對 blog.html(百分比編碼格式) 進行解碼
  if (blog.html) {
    blog.html = parseHTML(blog.html);
  }
  if (blog.showComment) {
    blog.map_comment = _initComment(blog.comment.list);
  }
  delete blog.comment;
  return blog; //  再將整體轉為字符

  //  將 comment 數據 map化
  function _initComment(list) {
    class Comment extends Map {
      constructor(list) {
        let kv_list = list.map((comment) => [comment.id, comment]);
        super(kv_list);
      }
      add(comment) {
        super.set(comment.id, comment);
        return super.get(comment.id);
      }
    }
    return new Comment(list);
  }

  function parseHTML(URI_String) {
    //  新創的文章會是空內容
    if (!URI_String) {
      return "";
    }
    //  後端blog.html數據內容，是以百分比編碼格式存放，需解碼
    return decodeURI(URI_String);
  }
}

//  將 img 數據 map化
function initImg(imgs) {
  /**
   * imgs { [alt_id]: { alt, blogImg: { id }, img: { id, hash, url } }, ...}
   */
  let map = new Map();
  for (let alt_id in imgs) {
    let data = imgs[alt_id];
    data.alt = data.alt === data.img.hash ? "" : data.alt;
    map.set(alt_id * 1, imgs[alt_id]);
  }
  return map;
}
