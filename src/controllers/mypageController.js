const userService = require("../services/userService");

// 마이페이지 정보 JSON 응답
exports.getMypageInfo = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req.user.id);
    res.json(userInfo); // email, nickname, profile_image, point 포함
  } catch (error) {
    console.error("마이페이지 로딩 오류:", error);
    res.status(500).json({ error: "마이페이지 정보를 불러오는 중 오류 발생" });
  }
};

// 수행 미션 목록 JSON 응답
exports.getUserMissionData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily, weekly } = await userService.getUserMissions(userId);
    res.json({ daily, weekly });
  } catch (err) {
    console.error("미션 데이터 JSON 응답 오류:", err);
    res.status(500).json({ message: "미션 정보를 불러오는 중 오류 발생" });
  }
};