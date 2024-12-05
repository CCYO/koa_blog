/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER } = require("../types");
const {
  COMMON: { AJV },
} = require("../../../config");

const User = seq.define(
  "User",
  {
    email: {
      type: STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: STRING,
      allowNull: false,
      validate: {
        is: AJV.HASH,
      },
    },
    age: {
      type: INTEGER,
      validate: {
        max: AJV.SETTING.AGE.MAXIMUM,
        min: AJV.SETTING.AGE.MINIMUM,
      },
    },
    nickname: {
      type: STRING,
      validate: {
        is: AJV.SETTING.NICKNAME.REGEXP,
        len: [AJV.SETTING.NICKNAME.MIN_LENGTH, AJV.SETTING.NICKNAME.MAX_LENGTH],
        notEmpty: false,
      },
    },
    avatar: {
      type: STRING,
      validate: {
        isUrl: true,
      },
    },
    avatar_hash: {
      type: STRING,
      validate: {
        is: AJV.HASH,
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = User;
