const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middlewares/authMiddleware");
const userService = require("../services/userService");
const { uploadToS3 } = require("../services/s3Service");

// storage 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// profile/me: 현재 로그인한 사용자 정보 JSON 응답
router.get("/me", verifyToken, async (req, res) => {
  try {
    const data = await userService.getUserInfo(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("프로필 조회 오류:", err);
    res.status(500).json({ message: "프로필 정보를 불러오는 중 오류 발생" });
  }
});

// 프로필 이미지 업로드 엔드포인트
router.post("/upload", verifyToken, upload.single("profile_image"), async (req, res) => {
  console.log("업로드된 파일:", req.file); 

  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }
  
  try { 
	  const imageUrl = await uploadToS3(req.file, 'profile_images');
	  return res.json({ profile_image_url: imageUrl });
  } catch (err) { 
	  console.error("S3 업로드 오류:", err);
	  res.status(500).json({message: "S3 업로드 중 오류 발생" });
  }
});


// 프로필 정보 수정 엔드포인트 (이미지 포함)
router.put("/", verifyToken, upload.single("profile_image"), profileController.updateProfile);
// 프로필 정보 수정 (POST도 허용)
router.post("/", verifyToken, upload.single("profile_image"), profileController.updateProfile);

// 모든 엔드포인트에 verifyToken 적용 (문제 없음)

module.exports = router;
