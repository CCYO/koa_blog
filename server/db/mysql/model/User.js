/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER } = require("../types");
const { COMMON } = require("../../../const");

const User = seq.define(
  "User",
  {
    email: {
      type: STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
      },
    },
    password: {
      type: STRING,
      allowNull: false,
      validate: {
        notNull: true,
        is: /^[\w]+$/,
        len: [32, 32],
      },
    },
    age: {
      type: INTEGER,
      validate: {
        max: COMMON.AJV.SETTING.AGE.MAXIMUM,
        min: COMMON.AJV.SETTING.AGE.MINIMUM,
      },
    },
    nickname: {
      type: STRING,
      allowNull: true,
      validate: {
        is: COMMON.AJV.SETTING.NICKNAME.REGEXP,
        len: [
          COMMON.AJV.SETTING.NICKNAME.MIN_LENGTH,
          COMMON.AJV.SETTING.NICKNAME.MAX_LENGTH,
        ],
        notNull: false,
      },
    },
    avatar: {
      type: STRING,
      allowNull: true,
    },
    avatar_hash: {
      type: STRING,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = User;
