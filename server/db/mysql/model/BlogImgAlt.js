/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER } = require("../types");
const {
  COMMON: { AJV },
} = require("../../../config");

const BlogImgAlt = seq.define("BlogImgAlt", {
  id: {
    type: INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  blogImg_id: {
    type: INTEGER,
    allowNull: false,
  },
  alt: {
    type: STRING(AJV.BLOG.IMG_ALT.MAX_LENGTH),
    validate: {
      is: AJV.BLOG.IMG_ALT.REGEXP,
      len: [AJV.BLOG.IMG_ALT.MIN_LENGTH, AJV.BLOG.IMG_ALT.MAX_LENGTH],
      notEmpty: false,
    },
  },
});

module.exports = BlogImgAlt;
