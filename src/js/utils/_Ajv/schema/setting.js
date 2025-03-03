import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.SETTING}.json`,
    type: "object",
    $async: true,
    minProperties: 2,
    allOf: [
      {
        properties: {
          _old: {
            type: "object",
            errorMessage: {
              type: "_old需是object",
            },
          },
        },
      },
      {
        properties: {
          email: {
            $ref: `${DEFAULT_URL}/email`,
          },
          code: {
            $ref: `${DEFAULT_URL}/email_code`,
          },
          age: {
            $ref: `${DEFAULT_URL}/age`,
          },
          nickname: {
            $ref: `${DEFAULT_URL}/nickname`,
          },
          password: {
            $ref: `${DEFAULT_URL}/password`,
          },
          password_again: {
            $ref: `${DEFAULT_URL}/password_again`,
          },
          avatar_hash: {
            $ref: `${DEFAULT_URL}/hash`,
          },
          avatar_ext: {
            type: "string",
            $ref: `${DEFAULT_URL}/img_ext`,
          },
        },
      },
      {
        if: {
          properties: {
            email: {
              type: "string",
              $ref: `${DEFAULT_URL}/email`,
            },
          },
        },
        then: {
          properties: {
            email: {
              type: "string",
              _isEmailExist: true,
            },
          },
        },
        else: {
          properties: {
            email: {
              type: "string",
              $ref: `${DEFAULT_URL}/email`,
            },
          },
        },
      },
    ],
    _notRepeat: ["email", "age", "nickname", "password", "avatar_hash"],
    _noSpace: [
      "email",
      "code",
      "age",
      "nickname",
      "origin_password",
      "password",
      "avatar_hash",
      "avatar_ext",
    ],
    required: ["_old"],
    dependentRequired: {
      email: ["code"],
      password: ["password_again", "origin_password"],
      password_again: ["password", "origin_password"],
      avatar_hash: ["avatar_ext"],
      avatar_ext: ["avatar_hash"],
    },
    errorMessage: {
      required: "setting 校驗時，必須擁有_old",
      type: "驗證數據必須是 object 格式",
      minProperties: "至少需改一筆資料",
      dependentRequired: "必填",
    },
  };
}
