const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const verifyToken = require("../middlewares/authMiddleware");
const userService = require("../services/userService");

// storage 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 구성원 목록 조회
router.get("/members", verifyToken, async (req, res) => {
  try {
    const members = await userService.getFamilyMembers(req.user.id);
    res.json(members);
  } catch (err) {
    console.error("구성원 조회 오류:", err);
    res.status(500).json({ message: "구성원 목록 조회 중 오류 발생" });
  }
});

// 구성원 추가 (이미지 업로드 포함)
router.post("/members", verifyToken, upload.single("member_image"), async (req, res) => {
  try {
    const { member_name } = req.body;
    const member_image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!member_name || !member_image) {
      return res.status(400).json({ message: "이름과 이미지가 필요합니다." });
    }
    await userService.addFamilyMember(req.user.id, { member_name, member_image });
    res.json({ message: "구성원 등록 완료" });
  } catch (err) {
    console.error("구성원 등록 오류:", err);
    res.status(500).json({ message: "구성원 추가 중 오류 발생" });
  }
});

// 구성원 수정
router.put("/members/:id", verifyToken, upload.single("member_image"), async (req, res) => {
  try {
    const member_name = req.body.member_name;
    const member_image = req.file ? `/uploads/${req.file.filename}` : null;

    const memberId = req.params.id;
    const userId = req.user.id;
    await userService.updateFamilyMember(memberId, userId, { member_name, member_image });
    res.json({ message: "구성원 정보 수정 완료" });
  } catch (err) {
    console.error("구성원 수정 오류:", err);
    res.status(500).json({ message: "구성원 수정 중 오류 발생" });
  }
});

// 구성원 삭제
router.delete("/members/:id", verifyToken, async (req, res) => {
  const memberId = req.params.id;
  const userId = req.user?.id; // 🔍 여기서 undefined이면 문제 발생

  if (!userId) {
    return res.status(400).json({ error: "유저 정보 없음" });
  }

  try {
    await userService.deleteFamilyMember(memberId, userId);
    res.json({ message: "구성원 삭제 완료" });
  } catch (err) {
    console.error("구성원 삭제 오류:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});


module.exports = router;
