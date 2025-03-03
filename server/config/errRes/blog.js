module.exports = {
  CREATE: {
    ERR: {
      errno: 10200,
      msg: "BLOG 創建失敗",
    },
    AJV_CREATE: {
      errno: 10291,
      msg: "創建數據不符校驗",
    },
  },
  REMOVE: {
    ERR: {
      errno: 20200,
      msg: "刪除 Blog 失敗",
    },
    ROW: {
      errno: 20201,
      msg: "刪除 BLOG 的數量不完全",
    },
    NO_DATA: {
      errno: 20202,
      msg: "刪除BLOG時，沒有提供blogList數據",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30200,
      msg: "BLOG資料更新失敗",
    },
  },
  READ: {
    NOT_AUTHOR: {
      errno: 40201,
      msg: "非作者本人，無此權限",
      code: 403,
    },
    NOT_EXIST: {
      errno: 40202,
      msg: "該文章不存在",
      code: 404,
    },
    NO_ALBUM: {
      errno: 40204,
      msg: "此相本不存在",
      code: 404,
    },
    NO_LIST: {
      errno: 40203,
      msg: "沒有文章",
    },
    NO_PERMISSION: {
      errno: 40205,
      msg: "沒有權限查看",
    },
    AJV_UPDATE: {
      errno: 40291,
      msg: "更新數據不符校驗",
    },
  },
};
