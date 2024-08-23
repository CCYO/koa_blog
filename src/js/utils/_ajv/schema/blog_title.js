import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.BLOG_TITLE}.json`,
  type: "object",
  properties: {
    title: {
      type: "string",
      $ref: `${DEFAULT_URL}/title`,
    },
  },
  required: ["title"],
  _notEmpty: ["title"],
  additionalProperties: false,
  errorMessage: {
    required: "少傳了某些數據",
    additionalProperties: "多了額外數據",
  },
};
