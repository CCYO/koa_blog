import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.IS_EMAIL_EXIST}.json`,
  $async: true,
  if: {
    type: "object",
    properties: {
      email: {
        type: "string",
        $ref: `${DEFAULT_URL}/email`,
      },
    },
    _notEmpty: ["email"],
    required: ["email"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  },
  then: {
    type: "object",
    properties: {
      email: {
        type: "string",
        _isEmailExist: true,
      },
    },
  },
  else: {
    $ref: "#/if",
  },
};
