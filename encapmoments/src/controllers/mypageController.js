const userService = require("../services/userService");
const path = require("path");
const fs = require("fs");

exports.renderMypage = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req.user.id);
    res.render("mypage", userInfo); // email, nickname, profile_image, point 포함
  } catch (error) {
    console.error("마이페이지 로딩 오류:", error);
    res.status(500).json({ error: "마이페이지 정보를 불러오는 중 오류 발생" });
  }
};

exports.renderEditProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.findUserWithProfile(userId);
    const profile = user.profile;
    const members = await userService.getFamilyMembers(userId);

    res.render("editProfile", {
      nickname: profile?.nickname || "",
      email: user.email || "",
      profile_image: profile?.profile_image || "/default-profile.png",
      members: members || []
    });
  } catch (err) {
    console.error("프로필 불러오기 오류:", err);
    res.status(500).json({ error: "프로필 정보를 불러오는 중 오류 발생" });
  }
};

exports.renderMissionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily, weekly } = await userService.getUserMissions(userId);
    res.render("missionHistory", { daily, weekly });
  } catch (err) {
    console.error("미션 목록 로딩 오류:", err);
    res.status(500).json({ error: "미션 정보를 불러오는 중 오류 발생" });
  }
};

