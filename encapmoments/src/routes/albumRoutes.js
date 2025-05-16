const express = require("express");
const router = express.Router();

// 앨범 댓글 페이지
router.get("/comment", (req, res) => {
  res.render("albumComment");
});

module.exports = router;
