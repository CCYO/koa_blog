/**
 * @description reportErrot api
 */

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { REPORT } = require("../../middleware/api");

router.prefix("/api/report");

router.post("/srcErr", REPORT.loadErr);
router.post("/error", REPORT.codeErr);

module.exports = router;
