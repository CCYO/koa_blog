/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING } = require("../types");

const {
  COMMON: { AJV },
} = require("../../../config");

const Img = seq.define("Img", {
  url: {
    type: STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  hash: {
    type: STRING,
    allowNull: false,
    validate: {
      is: AJV.HASH,
    },
  },
});

module.exports = Img;
