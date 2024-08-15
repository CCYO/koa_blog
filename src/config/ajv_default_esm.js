import AJV_DEFAULT from "./const/ajv_default.json";
import FRONTEND_CONFIG from "./frontend_esm";

export default genDefault(AJV_DEFAULT, FRONTEND_CONFIG);

function genDefault(JSON, FRONTEND_CONFIG) {
  const { ALBUM, BLOG_EDIT, SETTING } = FRONTEND_CONFIG;
  JSON.email.minLength = SETTING.EMAIL.MIN_LENGTH;

  JSON.nickname.minLength = SETTING.NICKNAME.MIN_LENGTH;
  JSON.nickname.maxLength = SETTING.NICKNAME.MAX_LENGTH;
  JSON.nickname.errorMessage.minLength = `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`;
  JSON.nickname.errorMessage.maxLength = `必須介於${SETTING.NICKNAME.MIN_LENGTH}-${SETTING.NICKNAME.MAX_LENGTH}個字符`;

  JSON.password.minLength = SETTING.PASSWORD.MIN_LENGTH;
  JSON.password.maxLength = SETTING.PASSWORD.MAX_LENGTH;
  JSON.password.errorMessage.minLength = `必須介於${SETTING.PASSWORD.MIN_LENGTH}-${SETTING.PASSWORD.MAX_LENGTH}個字符`;
  JSON.password.errorMessage.maxLength = `必須介於${SETTING.PASSWORD.MIN_LENGTH}-${SETTING.PASSWORD.MAX_LENGTH}個字符`;

  JSON.age.minimum = SETTING.AGE.MINIMUM;
  JSON.age.maximum = SETTING.AGE.MAXIMUM;
  JSON.age.errorMessage.minimum = `必需介於${SETTING.AGE.MINIMUM}-${SETTING.AGE.MAXIMUM}之間`;
  JSON.age.errorMessage.maximum = `必需介於${SETTING.AGE.MINIMUM}-${SETTING.AGE.MAXIMUM}之間`;

  JSON.title.minLength = BLOG_EDIT.EDITOR.TITLE_MIN_LENGTH;
  JSON.title.maxLength = BLOG_EDIT.EDITOR.TITLE_MAX_LENGTH;
  JSON.title.errorMessage.minLength = `必須介於${BLOG_EDIT.EDITOR.TITLE_MIN_LENGTH}-${BLOG_EDIT.EDITOR.TITLE_MAX_LENGTH}個字符`;
  JSON.title.errorMessage.maxLength = `必須介於${BLOG_EDIT.EDITOR.TITLE_MIN_LENGTH}-${BLOG_EDIT.EDITOR.TITLE_MAX_LENGTH}個字符`;

  JSON.blogImg_size.minimum = BLOG_EDIT.EDITOR.IMG_MIN_SIZE;
  JSON.blogImg_size.maximum = BLOG_EDIT.EDITOR.IMG_MAX_SIZE;
  JSON.blogImg_size.errorMessage.minimum = `圖片不存在`;
  JSON.blogImg_size.errorMessage.maximum = `必須小於${
    (BLOG_EDIT.EDITOR.IMG_MAX_SIZE / 1024) * 1024
  }M`;

  JSON.html.minLength = BLOG_EDIT.EDITOR.HTML_MIN_LENGTH;
  JSON.html.maxLength = BLOG_EDIT.EDITOR.HTML_MAX_LENGTH;
  JSON.html.errorMessage.minLength = `長度需小於${BLOG_EDIT.EDITOR.HTML_MIN_LENGTH}個字`;
  JSON.html.errorMessage.maxLength = `長度需大於${BLOG_EDIT.EDITOR.HTML_MAX_LENGTH}個字`;

  JSON.alt.minLength = ALBUM.ALT.MIN_LENGTH;
  JSON.alt.maxLength = ALBUM.ALT.MAX_LENGTH;
  JSON.alt.errorMessage.minLength = `名稱需介於${ALBUM.ALT.MIN_LENGTH}-${ALBUM.ALT.MAX_LENGTH}個字`;
  JSON.alt.errorMessage.maxLength = `名稱需介於${ALBUM.ALT.MIN_LENGTH}-${ALBUM.ALT.MAX_LENGTH}個字`;

  return JSON;
}
