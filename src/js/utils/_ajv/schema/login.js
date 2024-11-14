import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.LOGIN}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${DEFAULT_URL}/email`,
    },
    password: {
      type: "string",
      $ref: `${DEFAULT_URL}/password`,
    },
  },
  // required: ["email", "password"],
  _notEmpty: ["email", "password"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
