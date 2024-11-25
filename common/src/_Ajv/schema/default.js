import { AJV } from "../../const";
const { EDITOR, SETTING, IMG_EXT } = AJV;

export default {
  blogImg_size: {
    type: "number",
    minimum: EDITOR.IMG_MIN_SIZE,
    maximum: EDITOR.IMG_MAX_SIZE,
    errorMessage: {
      minimum: `圖片不存在`,
      maximum: `必須小於${EDITOR.IMG_MAX_SIZE / (1024 * 1024)}M`,
      type: "必須是number",
    },
  },
  img_ext: {
    type: "string",
    regexp: {
      pattern: `^(${IMG_EXT.map((ext) => `(${ext})`).join("|")})$`,
      flags: "i",
    },
    errorMessage: {
      type: "必須是字符串",
      regexp: `圖片格式必須是${IMG_EXT.join(", ")}類型`,
    },
  },
  alt: {
    type: "string",
    minLength: EDITOR.IMG_ALT_MIN_LENGTH,
    maxLength: EDITOR.IMG_ALT_MAX_LENGTH,
    regexp: EDITOR.IMG_ALT_REGEXP.toString(),
    errorMessage: {
      minLength: `名稱需介於${EDITOR.IMG_ALT_MIN_LENGTH}-${EDITOR.IMG_ALT_MAX_LENGTH}個字`,
      maxLength: `名稱需介於${EDITOR.IMG_ALT_MIN_LENGTH}-${EDITOR.IMG_ALT_MAX_LENGTH}個字`,
      regexp: EDITOR.IMG_ALT_REGEXP_ERR_MSG,
      type: "必須是字符串",
    },
  },
  url: {
    type: "string",
    format: "url",
    errorMessage: {
      type: "必須是string",
      format: "資料需符合url格式",
    },
  },
  email: {
    type: "string",
    format: "email",
    minLength: SETTING.EMAIL.MIN_LENGTH,
    errorMessage: {
      type: "必須是字符串",
      format: "必須是電子信箱格式",
      minLength: "不可為空",
    },
  },
  nickname: {
    type: "string",
    pattern: "",
    regexp: SETTING.NICKNAME.REGEXP.toString(),
    minLength: SETTING.NICKNAME.MIN_LENGTH,
    maxLength: SETTING.NICKNAME.MAX_LENGTH,
    errorMessage: {
      minLength: `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`,
      maxLength: `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`,
      regexp: SETTING.NICKNAME.REGEXP_ERR_MSG,
      type: "必須是字符串",
    },
  },
  password: {
    type: "string",
    regexp: /^[\w]+$/.toString(),
    minLength: SETTING.PASSWORD.MIN_LENGTH,
    maxLength: SETTING.PASSWORD.MAX_LENGTH,
    errorMessage: {
      minLength: `必須介於${SETTING.PASSWORD.MIN_LENGTH}-${SETTING.PASSWORD.MAX_LENGTH}個字符`,
      maxLength: `必須介於${SETTING.PASSWORD.MIN_LENGTH}-${SETTING.PASSWORD.MAX_LENGTH}個字符`,
      regexp: "限制由大小寫英文、數字與底線組成",
      type: "必須是字符串",
    },
  },
  password_again: {
    type: "string",
    const: {
      $data: "1/password",
    },
    errorMessage: {
      type: "必須是字符串",
      const: "請再次確認密碼是否相同",
    },
  },
  age: {
    type: "number",
    minimum: SETTING.AGE.MINIMUM,
    maximum: SETTING.AGE.MAXIMUM,
    errorMessage: {
      minimum: `必需介於${SETTING.AGE.MINIMUM}-${SETTING.AGE.MAXIMUM}之間`,
      maximum: `必需介於${SETTING.AGE.MINIMUM}-${SETTING.AGE.MAXIMUM}之間`,
      type: "必須是數字",
    },
  },
  hash: {
    type: "string",
    pattern: "[0-9a-f]{16,16}",
    errorMessage: {
      type: "必須是字符串",
      pattern: "必須由32個16進制字符組成",
    },
  },
  title: {
    type: "string",
    regexp: EDITOR.TITLE_REGEXP.toString(),
    minLength: EDITOR.TITLE_MIN_LENGTH,
    maxLength: EDITOR.TITLE_MAX_LENGTH,
    errorMessage: {
      minLength: `必須介於${EDITOR.TITLE_MIN_LENGTH}-${EDITOR.TITLE_MAX_LENGTH}個字符`,
      maxLength: `必須介於${EDITOR.TITLE_MIN_LENGTH}-${EDITOR.TITLE_MAX_LENGTH}個字符`,
      regexp: EDITOR.TITLE_REGEXP_ERR_MSG,
      type: "必須是字符串",
    },
  },
  html: {
    type: "string",
    minLength: EDITOR.HTML_MIN_LENGTH,
    maxLength: EDITOR.HTML_MAX_LENGTH,
    errorMessage: {
      minLength: `長度需小於${EDITOR.HTML_MIN_LENGTH}個字`,
      maxLength: `長度需大於${EDITOR.HTML_MAX_LENGTH}個字`,
      type: "必須是字符串",
    },
  },
  show: {
    type: "boolean",
    errorMessage: {
      type: "必須是boolean",
    },
  },
  cancelImgItem: {
    type: "object",
    properties: {
      blogImg_id: {
        type: "integer",
        errorMessage: {
          type: "只能是整數",
        },
      },
      blogImgAlt_list: {
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          type: "integer",
          errorMessage: {
            type: "只能是整數",
          },
        },
        errorMessage: {
          type: "必須是array",
          minItems: "不能為空",
          uniqueItems: "不該有重複的值",
        },
      },
    },
    required: ["blogImg_id", "blogImgAlt_list"],
    _notEmpty: ["blogImg_id", "blogImgAlt_list"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "不允許除了blogImg_id與blogImgAlt_list以外的數據",
    },
  },
  cancelImgs: {
    type: "array",
    items: {
      $ref: "#/definitions/cancelImgItem",
    },
  },
  blog_id: {
    type: "integer",
    minimum: 1,
    errorMessage: {
      type: "必須是整數",
      minimum: "必須 > 0",
    },
  },
  alt_id: {
    type: "integer",
    minimum: 1,
    errorMessage: {
      type: "必須是整數",
      minimum: "必須 > 0",
    },
  },
};
