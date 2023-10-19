const express = require("express");

const authController = require("../controllers/auth-controllers");
const router = express.Router();
const authen = require("../public/authen-middleware");

router.post("/login", authController.logIn); //route to login

//for test api with secure api
//need to send with header Authorization Bear token
//example Authorization : bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjYsIlBlcnNvbklEIjoiMzU2MDEwMDAwMTYyOSIsIlByZWZpeElEIjpudWxsLCJQcmVmaXhOYW1lIjpudWxsLCJGaXJzdE5hbWUiOiLguK3guJXguLTguIHguLLguJnguJXguYwiLCJMYXN0TmFtZSI6IuC4m-C4tOC4oeC4m-C4siIsIkZpcnN0TmFtZUVuZyI6ImF0aWthbiIsIkxhc3ROYW1lRW5nIjoicGltcGEiLCJVc2VybmFtZSI6ImtldHNhcmluLnAiLCJQYXNzd29yZCI6IjM1NjAxMDAwMDE2MjkiLCJSb2xlIjozLCJPZmZpY2VJRCI6NDE1LCJQb3NpdGlvbklEIjoyMiwiUG9zaXRpb25OYW1lIjpudWxsLCJFbWFpbCI6bnVsbCwiVGVsZXBob25lIjoiKzY2ODQ0ODU2ODIwIiwiaWF0IjoxNjk3NDM4ODE1LCJleHAiOjE3Mjg5NzQ4MTV9.Ya5oHwLM_m0ixAwv-iBIstXriPf-h9ymWCgvbk-jyKo
//this middleware will pass decoded data to res.body.tokenData
router.post(
  "/testSecureroute",
  authen.checkPermission,
  authController.testsecureRoute
);

module.exports = router;
