import { AJV } from "../../const";
const { SETTING, IMG, BLOG, HASH } = AJV;

export default {
  blogImg_size: {
    type: "number",
    minimum: BLOG.IMG.MIN_SIZE,
    maximum: BLOG.IMG.MAX_SIZE,
    errorMessage: {
      minimum: `圖片不存在`,
      maximum: `必須小於${BLOG.IMG.MAX_SIZE / (1024 * 1024)}M`,
      type: "必須是number",
    },
  },
  img_ext: {
    type: "string",
    regexp: {
      pattern: `^(${IMG.EXT.map((ext) => `(${ext})`).join("|")})$`,
      flags: "i",
    },
    errorMessage: {
      type: "必須是字符串",
      regexp: `圖片格式必須是${IMG.EXT}類型`,
    },
  },
  alt: {
    type: "string",
    minLength: BLOG.IMG_ALT.MIN_LENGTH,
    maxLength: BLOG.IMG_ALT.MAX_LENGTH,
    regexp: BLOG.IMG_ALT.REGEXP.toString(),
    errorMessage: {
      minLength: `名稱需介於${BLOG.IMG_ALT.MIN_LENGTH}-${BLOG.IMG_ALT.MAX_LENGTH}個字`,
      maxLength: `名稱需介於${BLOG.IMG_ALT.MIN_LENGTH}-${BLOG.IMG_ALT.MAX_LENGTH}個字`,
      regexp: BLOG.IMG_ALT.REGEXP_MSG,
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
  email_code: {
    type: "string",
    regexp: SETTING.EMAIL_CODE.REGEXP.toString(),
    errorMessage: {
      type: "必須是字符串",
      regexp: SETTING.EMAIL_CODE.REGEXP_MSG,
    },
  },
  nickname: {
    type: "string",
    regexp: SETTING.NICKNAME.REGEXP.toString(),
    minLength: SETTING.NICKNAME.MIN_LENGTH,
    maxLength: SETTING.NICKNAME.MAX_LENGTH,
    errorMessage: {
      minLength: `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`,
      maxLength: `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`,
      regexp: SETTING.NICKNAME.REGEXP_MSG,
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
    regexp: HASH.toString(),
    errorMessage: {
      type: "必須是字符串",
      regexp: "必須符合HASH",
    },
  },
  title: {
    type: "string",
    regexp: BLOG.TITLE.REGEXP.toString(),
    minLength: BLOG.TITLE.MIN_LENGTH,
    maxLength: BLOG.TITLE.MAX_LENGTH,
    errorMessage: {
      minLength: `必須介於${BLOG.TITLE.MIN_LENGTH}-${BLOG.TITLE.MAX_LENGTH}個字符`,
      maxLength: `必須介於${BLOG.TITLE.MIN_LENGTH}-${BLOG.TITLE.MAX_LENGTH}個字符`,
      regexp: BLOG.TITLE.REGEXP_MSG,
      type: "必須是字符串",
    },
  },
  html: {
    type: "string",
    minLength: BLOG.HTML.MIN_LENGTH,
    maxLength: BLOG.HTML.MAX_LENGTH,
    errorMessage: {
      minLength: `長度需小於${BLOG.HTML.MIN_LENGTH}個字`,
      maxLength: `長度需大於${BLOG.HTML.MAX_LENGTH}個字`,
      type: "必須是字符串",
    },
  },
  show: {
    type: "boolean",
    errorMessage: {
      type: "必須是boolean",
    },
  },
  showAt: {
    type: "string",
    format: "date-time",
    errorMessage: {
      type: "必須是string",
      format: "必須是date-time格式",
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
