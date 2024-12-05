/**
 * @description 彙整api ws
 */

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const WS = require("../../middleware/ws");

router.prefix("/ws");

/**
 * @description 開啟ws連線
 */
router.get("/", WS.close_same_id, WS.init);

module.exports = router;
