const fs = require("fs");
const path = require("path");
const userService = require("../services/userService");
const bcrypt = require("bcryptjs");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, email, password } = req.body;
    const newImage = req.file ? `/uploads/${req.file.filename}` : null;

    // 기존 이미지 경로 불러오기
    const user = await userService.findUserWithProfile(userId);
    const oldImagePath = user?.profile?.profile_image;

    // 사용자 테이블 업데이트
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const existingUser = await userService.findUserByEmail(email);
    // 이메일이 이미 존재하고, 그 사용자가 나 자신이 아닌 경우만 예외 처리
    if (email && existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }
    await userService.updateUserInfo(userId, updateData);

    // 프로필 테이블 업데이트 또는 삽입
    const profileData = {};
    if (nickname) profileData.nickname = nickname;
    if (newImage) {
	    let album_image_url = nuill;
	    try {
		    album_image_url = await uploadToS3(newImage, 'profiles');
	    } catch (uploadErr) {
		    console.error("S3 업로드 실패:", uploadErr);
		    return res.status(500).json({ message: "이미지 업로드 실패"});
	    }

	    profileData.profile_image = album_image_url;

	    // 기존 이미지 삭제(S3에서 삭제)
	    if (oldImagePath) {
		    const oldImageKey = oldImagePath.split('/').pop();
		    try {
			    await deleteFromS3(oldImageKey);
			    console.log("기존 이미지 S3에서 삭제 완료");
		    } catch (delteErr) {
			    console.error("기존 이미지 삭제 실패:", deleteErr);
		    }
	    }
    }
    
    await userService.upsertProfile(userId, profileData);

    res.json({ message: "프로필 수정 완료" }); // 명세서에 맞는 구조
  } catch (err) {
    console.error("프로필 수정 오류:", err);
    res.status(500).json({ message: "프로필 수정 중 오류 발생" });
  }
};
