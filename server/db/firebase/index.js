/**
 * @description firebase init
 */

/* NPM        ----------------------------------------------------------------------------- */
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

/* _CONFIG    ----------------------------------------------------------------------------- */
const { DB } = require("../../_config");

const firebaseConfig = {
  //  applicationDefault() 會撈取 環境變量GOOGLE_APPLICATION_CREDENTIALS存放的路徑，作為服務帳號的密鑰(json格式)
  //  ex1: $ export GOOGLE_APPLICATION_CREDENTIALS="/home/使用者帳號/koa-blog/server/conf/GFB_admin_key.json"
  //  ex2: 此專案是使用dotenv完成設定
  //  測試/確認
  //  *1* 終端: > echo $GOOGLE_APPLICATION_CREDENTIALS
  //  *2* NodeJS: process.env.GOOGLE_APPLICATION_CREDENTIALS
  credential: applicationDefault(),
  //  firebase storage 功能，需額外設置 firebaseConfig.storageBucket
  //  參考: https://reurl.cc/AyV3Ke
  storageBucket: DB.GFB_CONF.storageBucket,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = {
  storage,
};
