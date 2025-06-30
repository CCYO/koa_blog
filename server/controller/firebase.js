/**
 * @description middleware of upload to GCS by Formidable
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { COMMON, ERR_RES, SERVER } = require("../config");

/* NPM        ----------------------------------------------------------------------------- */
const { formidable } = require("formidable");
const { firstValues } = require("formidable/src/helpers/firstValues.js");

/* UTILS      ----------------------------------------------------------------------------- */
const { MyErr, SuccModel } = require("../utils/model");

/* CUSTOM     ----------------------------------------------------------------------------- */
const { storage } = require("../db/firebase");

/* VAR        ----------------------------------------------------------------------------- */
const pattern = `^(${COMMON.AJV.IMG.EXT.map((ext) => `(${ext})`).join("|")})$`;
const REGEXP_EXT = new RegExp(pattern, "i");

//  處理 blog 內文圖片
async function addBlogImg(ctx) {
  //  上傳 blog 內文圖片時，會附上圖片相關資料
  let { ext, hash } = ctx.query;
  if (ext) {
    if (!REGEXP_EXT.exec(ext)) {
      throw new MyErr(ERR_RES.IMG.CREATE.BLOG_IMG_FROMAT_ERR);
    }
  } else {
    throw new MyErr(ERR_RES.IMG.CREATE.BLOG_IMG_NO_EXT);
  }
  if (!hash) {
    throw new MyErr(ERR_RES.IMG.CREATE.BLOG_IMG_NO_HASH);
  }
  //  創建GFB的存放路徑
  let ref = storage.bucket().file(`${SERVER.GFB.BLOG_REF}/${hash}.${ext}`);
  //  確認是否已存
  let [exist] = await ref.exists();
  if (!exist) {
    ctx._my = { gceFile: { ref } };
    //  建立 formidable Ins
    let { files } = await _parse(ctx, {
      maxFileSize: COMMON.AJV.BLOG.IMG.MAX_SIZE,
    });
    if (!files[SERVER.GFB.BLOG_REF].length) {
      throw new MyErr(ERR_RES.SERVER.FORMIDABLE.NO_PAYLOAD);
    }
    delete ctx._my;
  }
  let publicUrl = `https://firebasestorage.googleapis.com/v0/b/${ref.bucket.id}/o/${ref.id}?alt=media`;
  ref.fullPath;
  let data = { [SERVER.GFB.BLOG_REF]: publicUrl };
  return new SuccModel({ data });
}
//  處理 user avatar
async function addUserAvatar(ctx) {
  let { avatar_ext, avatar_hash } = ctx.request.query;
  if (avatar_ext && !avatar_hash) {
    throw new MyErr(ERR_RES.USER.UPDATE.AVATAR_NO_ARGS_HASH);
  } else if (avatar_hash && !avatar_ext) {
    throw new MyErr(ERR_RES.USER.UPDATE.AVATAR_NO_ARGS_EXT);
  } else if (avatar_hash === ctx.session.user.avatar_hash) {
    throw new MyErr(ERR_RES.USER.UPDATE.SAME_AVATAR_HASH);
  }

  let data = {};
  let ref;
  if (avatar_ext && avatar_hash) {
    if (!REGEXP_EXT.exec(avatar_ext)) {
      throw new MyErr(ERR_RES.USER.UPDATE.AVATAR_FORMAT_ERR);
    }
    //  創建GFB的存放路徑
    // ref = storage
    //   .bucket()
    let bucket = storage.bucket();
    ref = bucket.file(`${SERVER.GFB.AVATAR_REF}/${avatar_hash}.${avatar_ext}`);
    //  確認是否已存
    let [exist] = await ref.exists();
    if (!exist) {
      ctx._my = { gceFile: { ref } };
    } else {
      data[SERVER.GFB.AVATAR_REF] = ref.publicUrl();
    }
  }
  let { fields, files } = await _parse(ctx, {
    maxFileSize: COMMON.AJV.SETTING.AVATAR.MAX_SIZE,
  }).catch((e) => {
    throw e;
  });
  if (
    !Object.getOwnPropertyNames(files).length &&
    !Object.getOwnPropertyNames(fields).length
  ) {
    throw new MyErr(ERR_RES.SERVER.FORMIDABLE.NO_PAYLOAD);
  }
  if (files.hasOwnProperty(SERVER.GFB.AVATAR_REF)) {
    delete ctx._my;
    let publicUrl = `https://firebasestorage.googleapis.com/v0/b/${ref.bucket.id}/o/${ref.id}?alt=media`;
    data[SERVER.GFB.AVATAR_REF] = publicUrl;
  }
  data = { ...data, ...fields };

  return new SuccModel({ data });
}

module.exports = {
  addUserAvatar,
  addBlogImg,
};

/** 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_genFormidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
async function _parse(ctx, opts) {
  let gceFile = ctx._my?.gceFile;

  //  創建 formidable Ins
  if (gceFile) {
    //  這次parse有File類型的數據，則對 formidable 進行配置，讓 File 可以直接上傳 GFB
    opts.fileWriteStreamHandler = function () {
      //  formidable Ins 調用 parse 時，fileWriteStreamHandler 作為 CB 調用
      let ws = gceFile.ref.createWriteStream(/* wsOpts */);
      //  創建寫入流
      //  wsOpts 可作緩存設定（參考資料：https://cloud.google.com/storage/docs/metadata#caching_data）
      //  以「不緩存」為例↓
      // wsOpts.metadata: { contnetType: 'image/jpeg', cacheControl: 'no-cache' }
      gceFile.promise = new Promise((resolve, reject) => {
        //  為 bar.promise 綁定 GCS 上傳的promise，以便捕撈錯誤
        ws.on("finish", resolve);
        ws.on("error", reject);
      });
      return ws;
    };
  }

  let formidableIns = formidable(opts);

  let [fields, files] = await formidableIns.parse(ctx.req).catch((error) => {
    //  拋出 formidable 解析錯誤
    throw new MyErr({ ...ERR_RES.SERVER.FORMIDABLE.PARSE_ERR, error });
  });
  fields = firstValues(formidableIns, fields);
  if (gceFile) {
    try {
      //  判斷圖檔上傳GFB的狀況
      await gceFile.promise;
      //  將圖檔在GFB的遠端路徑設為公開
      await gceFile.ref.makePublic();
    } catch (error) {
      throw new MyErr({ ...ERR_RES.SERVER.FORMIDABLE.GCE_ERR, error });
    }
  }
  return { fields, files };
}
