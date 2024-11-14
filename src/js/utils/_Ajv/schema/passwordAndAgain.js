import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.PASSOWRD_AGAIN}.json`,
  type: "object",
  properties: {
    password: {
      type: "string",
      $ref: `${DEFAULT_URL}/password`,
    },
    password_again: {
      type: "string",
      $ref: `${DEFAULT_URL}/password_again`,
    },
  },
  required: ["password", "password_again"],
  _notEmpty: ["password", "password_again"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
