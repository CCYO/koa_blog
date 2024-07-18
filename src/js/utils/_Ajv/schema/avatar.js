import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.AVATAR}.json`,
  type: "object",
  properties: {
    hash: {
      type: "string",
      $ref: `${DEFAULT_URL}/avatar_hash`,
    },
    url: {
      type: "string",
      $ref: `${DEFAULT_URL}/avatar`,
    },
    size: {
      type: "number",
      maximum: 1 * 1024 * 1024,
    },
    ext: {
      type: "string",
      $ref: `${DEFAULT_URL}/avatar_ext`,
    },
    data_url: {
      type: "string",
      format: "byte",
      errorMessage: {
        type: "必須是string",
        format: "預覽網址必須符合base64編碼",
      },
    },
  },
  required: ["hash", "url", "size", "ext", "data_url"],
  _notEmpty: ["hash", "url", "size", "ext", "data_url"],
  _notRepeat: ["hash"],
};
