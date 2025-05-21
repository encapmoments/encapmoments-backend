const userService = require("../services/userService");
const bcrypt = require("bcryptjs");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, email, password, profile_image } = req.body;

    const user = await userService.findUserWithProfile(userId);
    const oldImage = user?.profile?.profile_image;

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const existingUser = await userService.findUserByEmail(email);
    if (email && existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }
    await userService.updateUserInfo(userId, updateData);

    const profileData = {};
    if (nickname) profileData.nickname = nickname;
    if (profile_image) profileData.profile_image = profile_image;
    await userService.upsertProfile(userId, profileData);

    res.json({ message: "프로필 수정 완료" });
  } catch (err) {
    console.error("프로필 수정 오류:", err);
    res.status(500).json({ message: "프로필 수정 중 오류 발생" });
  }
};
