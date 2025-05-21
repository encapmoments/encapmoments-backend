const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const verifyToken = require("../middlewares/authMiddleware");
const userService = require("../services/userService");
const { generateUploadSignedUrl } = require("../utils/s3Signed");

const upload = multer({ dest: "temp/" });

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

// 구성원 추가 (기존 API 유지, signed URL 내부 사용)
router.post("/members", verifyToken, upload.single("member_image"), async (req, res) => {
  try {
    const { member_name } = req.body;
    const file = req.file;

    if (!member_name || !file) {
      return res.status(400).json({ message: "이름과 이미지가 필요합니다." });
    }

    const contentType = file.mimetype;
    const { url, key } = await generateUploadSignedUrl("family-members", contentType);
    const imageBuffer = fs.readFileSync(file.path);
    await axios.put(url, imageBuffer, {
      headers: { "Content-Type": contentType },
    });
    fs.unlinkSync(file.path);

    await userService.addFamilyMember(req.user.id, { member_name, member_image: key });
    res.json({ message: "구성원 등록 완료" });
  } catch (err) {
    console.error("구성원 등록 오류:", err);
    res.status(500).json({ message: "구성원 추가 중 오류 발생" });
  }
});

// 구성원 수정 (기존 API 유지, signed URL 내부 사용)
router.put("/members/:id", verifyToken, upload.single("member_image"), async (req, res) => {
  try {
    const { member_name } = req.body;
    const file = req.file;

    const memberId = req.params.id;
    const userId = req.user.id;

    let member_image;
    if (file) {
      const contentType = file.mimetype;
      const { url, key } = await generateUploadSignedUrl("family-members", contentType);
      const imageBuffer = fs.readFileSync(file.path);
      await axios.put(url, imageBuffer, {
        headers: { "Content-Type": contentType },
      });
      fs.unlinkSync(file.path);
      member_image = key;
    }

    await userService.updateFamilyMember(memberId, userId, { member_name, ...(member_image && { member_image }) });
    res.json({ message: "구성원 정보 수정 완료" });
  } catch (err) {
    console.error("구성원 수정 오류:", err);
    res.status(500).json({ message: "구성원 수정 중 오류 발생" });
  }
});

// 구성원 삭제
router.delete("/members/:id", verifyToken, async (req, res) => {
  const memberId = req.params.id;
  const userId = req.user?.id;

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