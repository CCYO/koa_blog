/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER } = require("../types");
const { COMMON } = require("../../../const");

const BlogImgAlt = seq.define("BlogImgAlt", {
  id: {
    type: INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  blogImg_id: {
    type: INTEGER,
    allowNull: false,
  },
  alt: {
    type: STRING(COMMON.AJV.EDITOR.IMG_ALT_MAX_LENGTH),
    validate: {
      is: COMMON.AJV.EDITOR.IMG_ALT_REGEXP,
    },
    allowNull: true,
  },
});

module.exports = BlogImgAlt;
