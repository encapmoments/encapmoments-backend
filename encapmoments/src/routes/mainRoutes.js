const express = require("express");
const router = express.Router();

// /main으로 진입하면 이 라우터가 작동함
router.get("/", (req, res) => {
  res.render("main"); // views/main.ejs
});

router.get("/mypage", (req, res) => {
  res.render("mypage", {
    nickname: req.user.nickname,
    point: req.user.point,
  });
});

module.exports = router;