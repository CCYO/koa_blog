import Ajv2019 from "ajv/dist/2019";

import VALIDATE_CONFIG from "../ERROR_PARAMS";

const keyword = "_isEmailExist";

async function validate(schema, email, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  let response = await this.$$axios.post("/api/user/isEmailExist", { email });
  if (!response.errno) {
    return true;
  }
  let error = {
    keyword: "myKeyword",
    message: response.msg,
    params: {
      errors: [
        {
          keyword,
          params: {
            [VALIDATE_CONFIG.ERROR_PARAMS._noSpace]: dataCtx.parentDataProperty,
          },
        },
      ],
    },
  };
  // 依據Ajv文檔，需傳入array
  throw new Ajv2019.ValidationError([error]);
}

export default {
  keyword,
  async: true,
  type: "string",
  schemaType: "boolean",
  validate,
  errors: true,
};
