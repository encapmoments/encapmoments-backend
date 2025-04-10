const express = require("express");
const router = express.Router();

// /main으로 진입하면 이 라우터가 작동함
router.get("/", (req, res) => {
  res.render("main"); // views/main.ejs
});

module.exports = router;