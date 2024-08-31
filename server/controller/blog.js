const Opts = require("../utils/seq_options");
const Blog = require("../server/blog");
const C_Img = require("./img");
const C_BlogImg = require("./blogImg");
const C_BlogImgAlt = require("./blogImgAlt");
const C_ArticleReader = require("./articleReader");
const C_Comment = require("./comment");
const { MyErr, ErrModel, SuccModel } = require("../utils/model");
const { CACHE, ERR_RES, ENV } = require("../config");

//  查詢 blog 分頁列表數據
async function findListForPagination({
  currentUser_id,
  author_id,
  show,
  limit = undefined,
  offset = undefined,
}) {
  if (!show && (!currentUser_id || currentUser_id !== author_id)) {
    throw new MyErr(ERR_RES.BLOG.READ.NO_PERMISSION);
  }
  user_id = show ? currentUser_id : author_id;
  let resModel = await findListAndCount({ user_id, show, offset, limit });
  let data;
  if (show) {
    data = { public: resModel.data };
  } else {
    data = { private: resModel.data };
  }
  return new SuccModel({ data });
}
async function findInfoForPrivatePage({ cache, blog_id, author_id }) {
  let { exist, data } = cache;
  if (exist === CACHE.STATUS.NO_CACHE) {
    let resModel = await checkPermission({ blog_id, author_id });
    resModel.data.html = encodeURI(
      resModel.data.html ? resModel.data.html : ""
    );
    return resModel;
  } else {
    return new SuccModel({ data });
  }
}
async function findInfoForCommonPage({ cache, blog_id, user_id }) {
  let { exist, data } = cache;
  if (exist === CACHE.STATUS.NO_CACHE) {
    let resModel = await _findWholeInfo({ blog_id, user_id });
    if (!resModel.errno) {
      resModel.data.html = encodeURI(
        resModel.data.html ? resModel.data.html : ""
      );
    }
    return resModel;
  } else {
    return new SuccModel({ data });
  }
}

/** 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function add(title, author_id) {
  const data = await Blog.create(Opts.BLOG.CREATE.one({ title, author_id }));
  const opts = { data };
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.USER]: [author_id] };
  }
  return new SuccModel(opts);
}
/** 更新 blog
 *
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modify({ blog_id, author_id, ...blog_data }) {
  //  確認權限
  await checkPermission({ author_id, blog_id });
  //  let { title, cancelImgs = [], html, show } = blog_data
  let map = new Map(Object.entries(blog_data));
  let cache = undefined;
  if (!ENV.isNoCache) {
    cache = {
      [CACHE.TYPE.PAGE.BLOG]: [blog_id],
    };
  }
  //  存放 blog 要更新的數據
  let newData = {};

  let go = false;
  //  更新 文章公開狀態
  if (map.has("show")) {
    newData.show = map.get("show");
    if (newData.show) {
      newData.showAt = new Date();
      // 增加reader
      let { data: list } = await _addReadersFromFans(blog_id);
      // 恢復軟刪除的MsgReceiver
      await C_Comment.restoryReceiver(blog_id);
      // await _restoryMsgReceiverList(blog_id);
      if (cache && list.length) {
        cache[CACHE.TYPE.NEWS] = list;
      }
    } else {
      newData.showAt = null;
      // 軟刪除reader
      await _destoryReaders(blog_id);
      // 軟刪除MsgReceiver
      await C_Comment.destoryReceiver(blog_id);
      // await _removeMsgReceiverList(blog_id);
    }
    go = true;
  }
  if (map.has("html")) {
    newData.html = map.get("html");
    go = true;
  }
  if (map.has("title")) {
    newData.title = map.get("title");
    go = true;
  }
  if (go) {
    //  更新文章
    await Blog.update(Opts.BLOG.UPDATE.one({ blog_id, newData }));
  }
  //  刪除圖片
  if (map.has("cancelImgs")) {
    let cancelImgs = map.get("cancelImgs");
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    await _removeImgList(cancelImgs);
  }
  let { data } = await _findWholeInfo({ blog_id, user_id: author_id });
  data.html = encodeURI(data.html ? data.html : "");
  let opts = { data };
  if (cache) {
    if (map.has("title") || map.has("show")) {
      cache[CACHE.TYPE.PAGE.USER] = [author_id];
    }
    opts.cache = cache;
  }
  return new SuccModel(opts);
}
async function addImg({ author_id, ...data }) {
  let { blog_id } = data;
  let alt_id = await _getAltId(data);
  let resModel = await C_BlogImgAlt.findWholeInfo({
    author_id,
    blog_id,
    alt_id,
  });
  // let  { blog_id, alt_id, alt, blogImg_id, name, img_id, url, hash } = resModel.data
  let opts = { data: resModel.data };
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.BLOG]: [blog_id] };
  }
  return new SuccModel(opts);

  async function _getAltId(data) {
    //  固定參數 :  blog_id, hash, url, name, ext, img_id
    //  無blogImg_id ->  加   img開始
    //  有blogImg_id ->  直接加 blogImgAlt
    // -------------------------------------------------------------------------------------------------------------------
    let { blog_id, img_id, name, blogImg_id, alt, url, hash } = data;
    // let map = new Map(Object.entries(data));
    if (blogImg_id) {
      let {
        data: { id: alt_id },
      } = await C_BlogImgAlt.add(blogImg_id, alt);
      return alt_id;
      //  data { blog_id, name, img_id }
      // } else if (map.get("img_id")) {
    } else if (img_id) {
      //  data { blog_id, name, img_id }
      let {
        data: { id: blogImg_id },
      } = await C_BlogImg.add({ blog_id, name, img_id });
      return await _getAltId({ blogImg_id });
    } else {
      let {
        data: { id: img_id },
      } = await C_Img.add({ url, hash });
      return await _getAltId({ blog_id, img_id, name });
    }
  }
}
/** 刪除 blogs
 * @param {number} blog_id
 * @returns {object} SuccModel || ErrModel
 */
async function removeList({ blogList, author_id }) {
  if (!Array.isArray(blogList) || !blogList.length) {
    throw new MyErr(ERR_RES.BLOG.REMOVE.NO_DATA);
  }
  // 確認權限
  let resModel_list = await Promise.all(
    blogList.map((blog_id) => checkPermission({ author_id, blog_id }))
  );
  // 取得待刪除文章內的blogImg_id
  let blogImg_id_list = resModel_list
    .map((resModel) => {
      let { imgs } = resModel.data;
      // imgs: { alt_id: { alt, img: {id, url, hash}, blogImg: {id, name }}, ...}
      return Object.values(imgs).map(({ blogImg }) => blogImg.id);
    })
    .flat();
  // 移除blogImg
  await C_BlogImg.removeList([...new Set(blogImg_id_list)]);
  // 軟刪除讀者(連同articleReader一併刪除)
  await Promise.all(blogList.map(_destoryReaders));
  // 移除comment(連同MsgReceiver一併刪除)
  await Promise.all(blogList.map(C_Comment.removeListInBlog));
  // 移除blog
  let row = await Blog.destroyList(Opts.BLOG.REMOVE.list(blogList));
  if (row !== blogList.length) {
    throw new MyErr(ERR_RES.BLOG.REMOVE.ROW);
  }
  let opts = {};
  if (!ENV.isNoCache) {
    opts.cache = {
      [CACHE.TYPE.NEWS]: [author_id],
      [CACHE.TYPE.PAGE.USER]: [author_id],
      [CACHE.TYPE.PAGE.BLOG]: blogList,
    };
  }
  return new SuccModel(opts);
}

async function findListAndCountOfSquare(opts) {
  //  opts { user_id, offset, limit }
  //  data {list, count}
  let { blogs, count } = await Blog.readListAndCountAll(
    Opts.BLOG.FIND.listAndCountForSquare(opts)
  );
  let data = {
    public: { blogs, count },
  };
  return new SuccModel({ data });
}

async function findListAndCountOfAlbum(opts) {
  // opts {author_id, show, offset, limit}
  let public = false;
  let private = false;
  if (!opts.hasOwnProperty("show")) {
    public = true;
    private = true;
  } else if (opts.show) {
    public = true;
  } else {
    private = true;
  }
  let data = {};
  if (public) {
    data.public = await Blog.readListAndCountAll(
      Opts.BLOG.FIND.listAndCountForAlbum({ ...opts, show: true })
    );
  }
  if (private) {
    data.private = await Blog.readListAndCountAll(
      Opts.BLOG.FIND.listAndCountForAlbum({ ...opts, show: false })
    );
  }
  return new SuccModel({ data });
}
async function findListAndCount(opts) {
  //  opts { user_id, show, offset, limit }
  //  data {list, count}
  let data = await Blog.readListAndCountAll(Opts.BLOG.FIND.listAndCount(opts));
  return new SuccModel({ data });
}
async function findAlbum({ author_id, blog_id }) {
  await checkPermission({ author_id, blog_id });
  let data = await Blog.read(Opts.BLOG.FIND.album(blog_id));
  if (data) {
    return new SuccModel({ data });
  } else {
    return new ErrModel(ERR_RES.BLOG.READ.NO_ALBUM);
  }
}
async function confirmNews({ reader_id, articleReader_id }) {
  let blog = await Blog.read(
    Opts.BLOG.FIND.itemByArticleReader({ reader_id, articleReader_id })
  );
  if (!blog) {
    //  article不存在
    //  譬如article已刪除或隱藏，但newsCache不會針對刪除做更新，故reader可能在session.news中取得已被刪除的articleReceiver_id
    let opts = ERR_RES.NEWS.READ.NOT_EXIST;
    if (!ENV.isNoCache) {
      opts.cache = { [CACHE.TYPE.NEWS]: [reader_id] };
    }
    return new ErrModel(opts);
  }
  let { ArticleReader } = blog.readers[0];
  let opts = { data: { url: `/blog/${blog.id}` } };
  if (!ENV.isNoCache && !ArticleReader.confirm) {
    //  更新 articleReader
    await C_ArticleReader.modify(articleReader_id, { confirm: true });
    opts.cache = { [CACHE.TYPE.NEWS]: [reader_id] };
  }
  return new SuccModel(opts);
}
async function findItemForNews(blog_id) {
  if (!blog_id) {
    throw new MyErr(ERR_RES.BLOG.READ.NO_DATA);
  }
  let data = await Blog.read(Opts.BLOG.FIND.itemForNews(blog_id));
  if (!data) {
    throw new MyErr({
      ...ERR_RES.BLOG.READ.NOT_EXIST,
      error: `blog/${blog_id} 不存在`,
    });
  }
  return new SuccModel({ data });
}
async function checkPermission({ author_id, blog_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id));
  if (!data) {
    throw new MyErr({
      ...ERR_RES.BLOG.READ.NOT_EXIST,
      error: `blog/${blog_id}不存在`,
    });
  }
  if (data.author.id !== author_id) {
    throw new MyErr({
      ...ERR_RES.BLOG.READ.NOT_AUTHOR,
      error: `user/${author_id} 不是 blog/${blog_id} 的作者`,
    });
  }
  let opts = { data };
  return new SuccModel(opts);
}
module.exports = {
  confirmNews,
  findAlbum,
  findListAndCountOfSquare,
  findListAndCountOfAlbum,
  removeList,
  addImg,
  add,
  modify,
  findInfoForCommonPage,
  checkPermission,
  findInfoForPrivatePage,
  findListAndCount,
  findListForPagination,
  findItemForNews,
};
async function _removeImgList(cancelImgs) {
  //  cancelImgs [ { blogImg_id, blogImgAlt_list: [alt_id, ...] }, ...]
  // try {
  //  確認blog_id是否真為author_id所有
  await Promise.all(cancelImgs.map(_removeImg));
  // let opts = undefined;
  // if (!ENV.isNoCache) {
  //   opts = { [CACHE.TYPE.PAGE.BLOG]: [blog_id] };
  // }
  // return new SuccModel(opts);
  return new SuccModel();
  async function _removeImg({ blogImg_id, blogImgAlt_list }) {
    //  找到blog內，指定的blogImgAlt有幾筆
    let resModel = await C_BlogImg.countBlogImgAlt(blogImg_id);
    if (resModel.errno) {
      throw new MyErr({
        ...resModel,
        error: `blogImg/${blogImg_id} 不具備任何有關聯的 blogImgAlt`,
      });
    }
    if (resModel.data === blogImgAlt_list.length) {
      ////  代表要刪除整筆 blogImg
      await C_BlogImg.removeList([blogImg_id]);
    } else {
      ////  代表要刪除個別 blogImgAlt
      await C_BlogImgAlt.removeList(blogImgAlt_list);
    }
    return true;
  }
}
async function _destoryReaders(blog_id) {
  let blog = await Blog.read(Opts.BLOG.FIND.readerList(blog_id));
  if (!blog) {
    throw new MyErr(ERR_RES.BLOG.READ.NOT_EXIST);
  }
  let readers = blog.readers.map(({ id }) => id);
  if (readers.length) {
    await Blog.destoryReaders(blog_id, readers);
  }
  let data = { list: readers };
  return new SuccModel({ data });
}
async function _addReadersFromFans(blog_id) {
  let blog = await Blog.read(
    Opts.BLOG.FIND.fansAndDestoryedReaderList(blog_id)
  );
  if (!blog) {
    throw new MyErr(ERR_RES.BLOG.READ.NOT_EXIST);
  }
  let { readers, articleReaders } = blog.readers.reduce(
    (acc, reader) => {
      acc.readers.push(reader.id);
      acc.articleReaders.push(reader.ArticleReader.id);
      return acc;
    },
    { readers: [], articleReaders: [] }
  );
  let fansList = blog.author.fansList
    .filter(({ id }) => {
      return !readers.some((reader_id) => reader_id === id);
    })
    .map(({ id }) => id);

  if (articleReaders.length) {
    await C_ArticleReader.restoringList(articleReaders);
  }
  if (fansList.length) {
    await Blog.createReaders(blog_id, fansList);
  }
  let data = [...fansList, ...readers];
  return new SuccModel({ data });
}
/** 取得 blog 紀錄
 *
 * @param {number} blog_id blog id
 * @returns
 */
async function _findWholeInfo({ blog_id, user_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id));
  if (!data || (!data.show && data.author.id !== user_id)) {
    return new ErrModel({
      ...ERR_RES.BLOG.READ.NOT_EXIST,
      msg: `blog/${blog_id}不存在`,
    });
  }
  return new SuccModel({ data });
}
