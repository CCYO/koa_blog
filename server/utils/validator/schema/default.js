const definitions = require("../../../config/_ajv_default");
const { HOST, TYPE } = require("../config");

module.exports = {
  $id: `${HOST}/${TYPE.DEFAULT}.json`,
  definitions,
};
