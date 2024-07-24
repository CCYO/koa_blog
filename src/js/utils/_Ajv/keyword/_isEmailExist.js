import Ajv from "ajv";
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
        },
      ],
    },
  };
  throw new Ajv.ValidationError([error]);
}

export default {
  keyword,
  async: true,
  type: "string",
  schemaType: "boolean",
  validate,
  errors: true,
};
