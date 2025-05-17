const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/authMiddleware");

// 소셜 로그인 콜백 처리 
router.get("/naver/callback", socialController.naverLogin);
router.get("/kakao/callback", socialController.kakaoLogin);

router.post("/social/register", verifyToken, socialController.registerSocialUser);

router.post("/uploadProfile", verifyToken, upload.single("profile_image"), (req, res) => {
  req.session.profileImage = "/uploads/" + req.file.filename;
  res.redirect("/social/form");
});

// 프로필 이미지 업로드 화면 렌더링   
router.get("/form", verifyToken, (req, res) => {
  if (!req.session.profileImage) return res.redirect("/social/upload");
  res.render("registerSocialForm", { profile_image: req.session.profileImage });
});


router.post("/social/register", verifyToken, socialController.registerSocialUser);


router.get("/form", verifyToken, (req, res) => {
  if (!req.session.profileImage) return res.redirect("/social/upload");
  res.render("registerSocialForm", { profile_image: req.session.profileImage });
});

router.post("/social/register", verifyToken, socialController.registerSocialUser);

module.exports = router;    