const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const userService = require("../services/userService");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 1단계: 프로필 이미지 업로드 화면 렌더링
router.get("/profile", (req, res) => {
  res.render("registerProfile");
});

// 1단계: 프로필 이미지 업로드 후 2단계 이동
router.post("/uploadProfile", upload.single("profile_image"), (req, res) => {
  req.session.profileImage = "/uploads/" + req.file.filename;
  res.redirect("/register/form");
});

// 2단계: 이메일, 닉네임, 비밀번호 입력 화면 렌더링
router.get("/form", (req, res) => {
  if (!req.session.profileImage) return res.redirect("/register/profile");
  res.render("registerForm", { profile_image: req.session.profileImage });
});

router.post("/form", async (req, res) => {
  const { email, password, nickname } = req.body;
  const profile_image = req.session.profileImage;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await userService.createUser(email, hashedPassword);
    await userService.upsertProfile(user.id, { nickname, profile_image });
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).send("이미 존재하는 이메일입니다.");
    } else {
      console.error("회원가입 예외:", error);
      res.status(500).send("회원가입 처리 중 오류 발생");
    }
  }
});


module.exports = router;
