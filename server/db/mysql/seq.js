/**
 * @description Sequelize Ins
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { DB } = require("../../_config");

/* NPM        ----------------------------------------------------------------------------- */
const { Sequelize } = require("sequelize");
const cls = require("cls-hooked");

/* UTILS      ----------------------------------------------------------------------------- */
const { log } = require("../../utils/log");

const namespace = cls.createNamespace("seq-namespace");
Sequelize.useCLS(namespace);
const seq = new Sequelize({ ...DB.MYSQL_CONF, logging: false });

//  連線測試
seq
  .authenticate()
  .then(() => log("Seqalize 已連結"))
  .catch((e) => console.error("Sequalize 連結發生錯誤 ===> \n", e));

module.exports = seq;
