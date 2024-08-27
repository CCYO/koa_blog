const AJV_DEFAULT = require("./_ajv_default");
const FRONTEND_CONST = require("./_frontend_const");
const SERVER_CONST = require("./_server_const");
const ERR_RES = require("./_errRes");
const ENV = require("./env");

module.exports = {
  FRONTEND_CONST,
  ...SERVER_CONST,
  AJV_DEFAULT,
  ERR_RES,
  ENV,
};
