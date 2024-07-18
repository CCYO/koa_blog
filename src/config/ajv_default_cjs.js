const AJV_DEFAULT = require("./const/ajv_default.json");
const BACKEND_CONFIG = require("./const/server.json");

module.exports = genDefault(AJV_DEFAULT, BACKEND_CONFIG);

function genDefault(JSON, BACKEND_CONFIG) {
  const { USER, BLOG } = BACKEND_CONFIG;
  //    USER
  JSON.email.minLength = USER.EMAIL.MIN_LENGTH;

  JSON.nickname.minLength = USER.NICKNAME.MIN_LENGTH;
  JSON.nickname.maxLength = USER.NICKNAME.MAX_LENGTH;
  JSON.nickname.errorMessage.minLength = `必須介於${USER.NICKNAME.MIN_LENGTH}-${USER.NICKNAME.MAX_LENGTH}個字符`;
  JSON.nickname.errorMessage.maxLength = `必須介於${USER.NICKNAME.MIN_LENGTH}-${USER.NICKNAME.MAX_LENGTH}個字符`;

  JSON.password.minLength = USER.NICKNAME.MIN_LENGTH;
  JSON.password.maxLength = USER.NICKNAME.MAX_LENGTH;
  JSON.password.errorMessage.minLength = `必須介於${USER.NICKNAME.MIN_LENGTH}-${USER.NICKNAME.MAX_LENGTH}個字符`;
  JSON.password.errorMessage.maxLength = `必須介於${USER.NICKNAME.MIN_LENGTH}-${USER.NICKNAME.MAX_LENGTH}個字符`;

  JSON.age.minimum = USER.AGE.MINIMUN;
  JSON.age.maximum = USER.AGE.MAXIMUN;
  JSON.age.errorMessage.minimum = `必需介於${USER.AGE.MINIMUN}-${USER.AGE.MAXIMUM}之間`;
  JSON.age.errorMessage.maximum = `必需介於${USER.AGE.MINIMUN}-${USER.AGE.MAXIMUM}之間`;

  //BLOG
  JSON.title.minLength = BLOG.EDITOR.TITLE_MIN_LENGTH;
  JSON.title.maxLength = BLOG.EDITOR.TITLE_MAX_LENGTH;
  JSON.title.errorMessage.minLength = `必須介於${BLOG.EDITOR.TITLE_MIN_LENGTH}-${BLOG.EDITOR.TITLE_MAX_LENGTH}個字符`;
  JSON.title.errorMessage.maxLength = `必須介於${BLOG.EDITOR.TITLE_MIN_LENGTH}-${BLOG.EDITOR.TITLE_MAX_LENGTH}個字符`;

  JSON.html.minLength = BLOG.EDITOR.HTML_MIN_LENGTH;
  JSON.html.maxLength = BLOG.EDITOR.HTML_MAX_LENGTH;
  JSON.html.errorMessage.minLength = `長度需小於${BLOG.EDITOR.HTML_MIN_LENGTH}個字`;
  JSON.html.errorMessage.maxLength = `長度需大於${BLOG.EDITOR.HTML_MAX_LENGTH}個字`;

  //ALBUM
  JSON.alt.minLength = BLOG.EDITOR.IMG_ALT_MIN_LENGTH;
  JSON.alt.maxLength = BLOG.EDITOR.IMG_ALT_MAX_LENGTH;
  JSON.alt.errorMessage.minLength = `長度需大於${BLOG.EDITOR.IMG_ALT_MIN_LENGTH}個字`;
  JSON.alt.errorMessage.maxLength = `長度需小於${BLOG.EDITOR.IMG_ALT_MAX_LENGTH}個字`;

  return JSON;
}
