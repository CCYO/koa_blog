/**
 * @description user api
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const {
  VALIDATE,
  SESSION,
  CHECK,
  CACHE,
  FIREBASE,
  EMPLOYER,
} = require("../../middleware/api");
const WS = require("../../middleware/ws");
const User = require("../../controller/user");

router.prefix("/api/user");

/**
 * @description modify setting info
 */
router.patch(
  "/",
  CHECK.login,
  EMPLOYER.prohibit_setting,
  SESSION.reset,
  CACHE.modify,
  FIREBASE.userAvatar,
  VALIDATE.USER,
  async (ctx) => {
    ctx.body = await User.modifyInfo(ctx.request.body);
  }
);

/**
 * @description check password
 */
router.post("/confirmPassword", CHECK.login, async (ctx) => {
  let opts = {
    email: ctx.session.user.email,
    password: ctx.request.body.origin_password,
  };
  ctx.body = await User.checkOriginPassword(opts);
});

/**
 * @description cancel follow idol
 */
router.post(
  "/cancelFollow",
  CHECK.login,
  EMPLOYER.prohibit_cancel_Follow_me,
  CACHE.modify,
  async (ctx) => {
    let opts = {
      idol_id: ctx.request.body.id,
      fans_id: ctx.session.user.id,
    };
    ctx.body = await User.cancelFollow(opts);
  }
);

/**
 * @description follow idol
 */
router.post("/follow", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    idol_id: ctx.request.body.id,
    fans_id: ctx.session.user.id,
  };
  ctx.body = await User.follow(opts);
});

/**
 * @description check email exist
 */
router.post("/isEmailExist", VALIDATE.USER, async (ctx) => {
  ctx.body = await User.isEmailExist(ctx.request.body.email);
});

/**
 * @description  register
 */
router.post("/register", VALIDATE.USER, async (ctx) => {
  ctx.body = await User.register(ctx.request.body);
});

/**
 * @description  login
 */
router.post(
  "/",
  EMPLOYER.resetNews,
  WS.close_same_id,
  SESSION.set,
  VALIDATE.USER,
  async (ctx) => {
    ctx.body = await User.login(ctx.request.body);
  }
);

/**
 * @description  logout
 */
router.get("/logout", CHECK.login, SESSION.remove, WS.close);

module.exports = router;
