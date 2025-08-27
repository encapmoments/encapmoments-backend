const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToS3 } = require("../services/s3Service");  // S3 업로드 함수 추가
const userService = require("../services/userService"); 

// multer storage 설정 (S3 업로드에서는 사용되지 않음)
const storage = multer.memoryStorage();  // 메모리에 저장하여 바로 S3로 업로드 가능
const upload = multer({ storage });

// 구성원 목록 조회
router.get("/members", async (req, res) => {
  try {
    const members = await userService.getFamilyMembers(req.user.id);
    res.json(members);
  } catch (err) {
    console.error("구성원 조회 오류:", err);
    res.status(500).json({ message: "구성원 목록 조회 중 오류 발생" });
  }
});

// 구성원 추가 (이미지 업로드 포함)
router.post("/members", upload.single("member_image"), async (req, res) => {
  try {
    const { member_name, member_gender, member_age, member_image: memberImageUrl } = req.body;

    // 이미지 처리: 업로드 파일이 있으면 S3로 업로드, 없으면 body URL 사용
    let member_image = req.file
      ? await uploadToS3(req.file, 'family_members')
      : memberImageUrl || null;

    if (!member_name || !member_image) {
      return res.status(400).json({ message: "이름과 이미지가 필요합니다." });
    }

    await userService.addFamilyMember(req.user.id, { 
      member_name, 
      member_image, 
      member_gender, 
      member_age 
    });

    res.json({ 
      message: "구성원 등록 완료", 
      member_image_url: member_image 
    });
  } catch (err) {
    console.error("구성원 등록 오류:", err);
    res.status(500).json({ message: "구성원 추가 중 오류 발생" });
  }
});

// 구성원 수정
router.put("/members/:id", upload.single("member_image"), async (req, res) => {
  try {
    const { member_name, member_gender, member_age } = req.body;
    let member_image = req.body.member_image || null; // 기존 이미지 URL 유지

    // 파일이 업로드되면 S3에 업로드하고 URL 반환
    if (req.file) {
      member_image = await uploadToS3(req.file, 'family_members'); // S3 'family_members' 폴더에 업로드
    }

    const memberId = req.params.id;
    const userId = req.user.id;

    const updateData = { member_name, member_image, member_gender, member_age}

    await userService.updateFamilyMember(memberId, userId, updateData);

    // 클라이언트에 수정된 member_image URL도 함께 반환
    res.json({ message: "구성원 정보 수정 완료", member_image_url: member_image || req.body.member_image }); 
  } catch (err) {
    console.error("구성원 수정 오류:", err);
    res.status(500).json({ message: "구성원 수정 중 오류 발생" });
  }
});

// 구성원 삭제
router.delete("/members/:id", async (req, res) => {
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

