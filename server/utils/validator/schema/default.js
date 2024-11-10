const definitions = require("../../../config/_ajv_default");
const AJV_CONFIG = require("../config");

module.exports = {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json`,
  definitions,
};
