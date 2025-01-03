const { SETTING } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${SETTING}.json`,
    type: "object",
    minProperties: 2,
    properties: {
      _old: {
        type: "object",
        errorMessage: {
          type: "_old需是object",
        },
      },
      email: {
        $ref: `${DEFAULT_URL}/email`,
      },
      age: {
        $ref: `${DEFAULT_URL}/age`,
      },
      nickname: {
        $ref: `${DEFAULT_URL}/nickname`,
      },
      avatar: {
        $ref: `${DEFAULT_URL}/url`,
      },
      avatar_hash: {
        $ref: `${DEFAULT_URL}/hash`,
      },
      origin_password: {
        $ref: `${DEFAULT_URL}/password`,
      },
      password: {
        $ref: `${DEFAULT_URL}/password`,
      },
      password_again: {
        $ref: `${DEFAULT_URL}/password_again`,
      },
    },
    _notRepeat: ["email", "age", "nickname", "avatar", "avatar_hash"],
    dependentRequired: {
      origin_password: ["password", "password_again"],
      password: ["origin_password", "password_again"],
      password_again: ["origin_password", "password"],
      avatar: ["avatar_hash"],
      avatar_hash: ["avatar"],
    },
    _noSpace: [
      "email",
      "age",
      "nickname",
      "origin_password",
      "password",
      "avatar",
      "avatar_hash",
    ],
    required: ["_old"],
    errorMessage: {
      type: "驗證數據必須是 object 格式",
      required: "必填",
      minProperties: "至少需改1筆資料",
      dependentRequired: "必須有值",
    },
  };
};
