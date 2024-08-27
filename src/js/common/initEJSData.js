//  將ejs傳入el[data-my-data]的純字符數據，轉化為物件數據
//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}

/* CONSTANT --------------------------------------------------------------------------------- */
const DATA_SET = "my-data";
const SELECTOR = `[data-${DATA_SET}]`;
const KEYS = {
  ALBUM: "imgs",
  BLOG: "blog",
};

/* EXPORT MODULE ---------------------------------------------------------------------------- */
export default function () {
  let $container = $(SELECTOR);
  if (!$container.length) {
    return;
  }
  //  收集存放ejs data的元素
  let $box_list = Array.from($container, (box) => $(box).first());
  let ejs_data = {};
  ejs_data = $box_list.reduce((ejs_data, $box) => {
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
    if (key === KEYS.BLOG) {
      //  blog 數據
      kv = { [key]: initBlog(val) };
    } else if (key === KEYS.ALBUM) {
      //  album 數據
      kv = { map_imgs: initAlbum(val) };
    } else {
      //  其餘數據
      kv = { [key]: val };
    }
    return { ...ejs_data, ...kv };
    //  儲存整理後的ejs數據
  }, ejs_data);

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
    blog.html = parseBlogContent(blog.html);
  }
  if (blog.showComment) {
    blog.map_comment = _initComment(blog.comment.list);
  }
  delete blog.comment;
  return blog; //  再將整體轉為字符

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
  //  因為「後端存放的blog.html數據」是以
  //  1.百分比編碼存放
  //  2.<img>是以<x-img>存放
  //  所以此函數是用來將其轉化為一般htmlStr
  function parseBlogContent(URI_String) {
    /* 新創的文章會是空內容 */
    if (!URI_String) {
      return "";
    }
    //  百分比編碼 解碼
    let res = decodeURI(URI_String);
    return res;
  }
}
//  將 img 數據 map化
function initImg(imgs) {
  let map = new Map();
  /*  alt_id => {
   *    alt,
   *    blogImg: { id: blogImg_id, name },
   *    img: { id: img_id, url }
   *  }
   */
  for (let alt_id in imgs) {
    map.set(alt_id * 1, imgs[alt_id]);
  }
  return map;
}
