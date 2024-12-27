module.exports = {
  CREATE: {
    ERR: {
      errno: 10100,
      msg: "創建失敗",
    },
    AJV_REGISTER: {
      errno: 10191,
      msg: "註冊數據不符校驗",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30100,
      msg: "USER資料更新失敗",
    },
    AVATAR_NO_ARGS_EXT: {
      errno: 30101,
      msg: "少了ext數據",
    },
    AVATAR_NO_ARGS_HASH: {
      errno: 30102,
      msg: "少了hash數據",
    },
    SAME_AVATAR_HASH: {
      errno: 30103,
      msg: "avatar hash相同，應該是同一圖檔",
    },
    AVATAR_FORMAT_ERR: {
      errno: 30104,
      msg: "avatar圖檔格式錯誤，只接受JPG或PNG",
    },
    ORIGIN_PASSWORD_ERR: {
      errno: 30105,
      msg: "原密碼錯誤",
    },
    AJV_SETTING: {
      errno: 30191,
      msg: "setting數據不符校驗",
    },
    NOT_ALLOW_FOR_EMPLOYER: {
      errno: 30106,
      msg: "感謝您的測試，但測試用帳號不會真的修改您填入的資訊唷：)",
    },
  },
  READ: {
    NO_IDOL: {
      errno: 40102,
      msg: "找不到 idol",
    },
    NO_EXIST: {
      errno: 40103,
      msg: "找不到此帳戶",
      code: 404,
    },
    LOGIN_FAIL: {
      errno: 40104,
      msg: "登入失敗，帳號或密碼錯誤",
    },
    NO_PASSWORD: {
      errno: 40105,
      msg: "缺少密碼",
    },
    NO_EMAIL: {
      errno: 40106,
      msg: "缺少信箱",
      code: 200,
    },
    EMAIL_EXIST: {
      errno: 40107,
      msg: "信箱已有人註冊",
    },
    AJV_IS_EMAIL_EXIST: {
      errno: 40191,
      msg: "查詢isEmailExist數據不符校驗",
    },
    AJV_LOGIN: {
      errno: 40192,
      msg: "登入數據不符校驗",
    },
  },
};
