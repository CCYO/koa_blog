const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const BACKEND = require("../../config");
const _comment = require("./_comment");
const {
  filterEmptyAndFranferFns,
  filterEmptyAndFranferFnsForArray,
} = require("./_filterEmpty"); //  0404

function blogImgAlt(data) {
  return toJSONAndFns(data, _init);
  function _init(item) {
    //  ----------------------------------------------------------------------------------------
    //  item { id, alt, BlogImg: {id, name, Blog: { id, author_id}, Img: {id, url, hash} }}
    let { id, alt, ...otherData } = item;
    let res = { id, alt };
    if (otherData.hasOwnProperty("BlogImg")) {
      res.blogImg = otherData.BlogImg;
      if (!res.alt) {
        res.alt = res.blogImg.name;
      }
      if (res.blogImg.hasOwnProperty("Blog")) {
        res.blog = { ...res.blogImg.Blog };
        delete res.blogImg.Blog;
      }
      if (res.blogImg.hasOwnProperty("Img")) {
        res.img = { ...res.blogImg.Img };
        delete res.blogImg.Img;
      }
    }
    //  { id, alt, blog: { id, author_id }, blogImg: { id, name }, img: { id, url, hash }}
    return res;
  }
}

function comment(data) {
  return toJSONAndFns(data, _init);
  function _init(comment) {
    let data = { ...comment };
    let map = new Map(Object.entries(data));
    if (map.has("pid")) {
      data.pid = comment.pid === null ? 0 : comment.pid;
    }
    if (map.has("commenter")) {
      data.commenter = user(data.commenter);
    }
    if (map.has("article")) {
      data.article = blog(data.article);
    }
    if (map.has("receivers")) {
      data.receivers = user(data.receivers);
    }
    return data;
  }
}

function blog(data) {
  return toJSONAndFns(data, _init);
  function _init(data) {
    let blog = { ...data };
    let map = new Map(Object.entries(blog));
    if (map.has("author") && blog.author) {
      blog.author = user(blog.author);
    }
    if (map.has("readers") && blog.readers) {
      let _readers = [];
      for (let reader of blog.readers) {
        _readers.push(user(reader));
      }
      blog.readers = _readers;
    }
    if (map.has("BlogImgs")) {
      blog.imgs = _blogImg(data.BlogImgs);
      delete blog.BlogImgs;
    }
    if (map.has("replys")) {
      let list = comment(data.replys);
      if (
        list?.length &&
        list[0].receivers?.length &&
        list[0].receivers[0].MsgReceiver
      ) {
        blog.msgReceivers = list
          .map(({ receivers }) =>
            receivers.map(({ MsgReceiver }) => MsgReceiver.id)
          )
          .flat();
      }
      blog.comment = _comment.toNest(list);
      delete blog.replys;
    }
    if (map.has("show")) {
      let prop = undefined;
      if (map.get("show") && map.get("showAt")) {
        prop = "showAt";
      } else if (!map.get("show") && map.get("updatedAt")) {
        prop = "updatedAt";
      }
      blog.time = dayjs
        .utc(map.get(prop))
        .utcOffset(8)
        .format(BACKEND.BLOG.TIME_FORMAT);
    }
    return blog;
  }
}

function user(data) {
  return toJSONAndFns(data, _init);

  function _init(json) {
    let data = { ...json };
    let map = new Map(Object.entries(data));
    //  刪除 password
    if (map.has("password")) {
      delete data.password;
    }
    //  設置默認的nickname
    if (map.has("nickname") && !map.get("nickname")) {
      let regex = /^([\w]+)@/;
      let [_, target] = regex.exec(map.get("email"));
      data.nickname = target;
    }
    //  設置默認的avatar
    if (map.has("avatar") && !map.get("avatar")) {
      data.avatar = BACKEND.USER.AVATAR.URL;
      data.avatar_hash = BACKEND.USER.AVATAR.HASH;
    }
    if (map.has("fansList")) {
      data.fansList = user(data.fansList);
    }
    if (map.has("blogs")) {
      data.blogs = blog(data.blogs);
    }
    return data;
  }
}
module.exports = {
  time: {
    comment: _comment.initTime,
  },
  NestedComments: _comment.toNest,
  articleReader: toJSONAndFns,
  idolFans: toJSONAndFns,
  blogImgAlt,
  comment,
  user,
  blog,

  msgReceiver: toJSONAndFns,
  blogImg: toJSONAndFns,
  img: toJSONAndFns,
};

function _blogImg(blogImgs) {
  //  正常來說，blogImgs會是arr
  return filterEmptyAndFranferFnsForArray(blogImgs, _init);
  function _init(datas) {
    //  blogImg { id, name, Img: { id, url, hash }, BlogImgAlts: [{ id, alt }, ...] }
    let blogImgs = new Map();
    let alts = new Map();
    let imgs = new Map();
    for (let { id, name, ...data } of datas) {
      let blogImg_id = id;
      blogImgs.set(id, { id, name });
      if (data.hasOwnProperty("Img")) {
        let { id, url, hash } = data.Img;
        let img = { id };
        if (url) {
          img.url = url;
        }
        if (hash) {
          img.hash = hash;
        }
        !imgs.has(id) && imgs.set(id, img);
      }
      if (data.hasOwnProperty("BlogImgAlts")) {
        for (let { id, alt } of data.BlogImgAlts) {
          alt = !alt ? blogImgs.get(blogImg_id).name : alt;
          alts.set(id, {
            alt,
            blogImg: blogImgs.get(blogImg_id),
            img: imgs.get(data.Img.id),
          });
        }
      }
    }
    alts = [...alts].reduce((acc, [alt_id, alt_data]) => {
      acc[alt_id] = alt_data;
      return acc;
    }, {});
    //  { [alt_id]: { alt, blogImg: { id, name }, img: { id, hash, url } }}
    return alts;
  }
}

function toJSONAndFns(data, ...fns) {
  return filterEmptyAndFranferFns(data, ...[_toJSON, ...fns]);

  function _toJSON(data) {
    return data.toJSON ? data.toJSON() : data;
  }
}
