import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.PASSWORD}.json`,
  type: "object",
  properties: {
    origin_password: {
      type: "string",
      $ref: `${DEFAULT_URL}/password`,
    },
  },
  required: ["origin_password"],
  _notEmpty: ["origin_password"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
