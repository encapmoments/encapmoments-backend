const userService = require("../services/userService");

// 구성원 목록 조회
exports.getMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const members = await userService.getFamilyMembers(userId);
    res.json(members);
  } catch (err) {
    console.error("구성원 목록 조회 오류:", err);
    res.status(500).json({ message: "구성원 목록 조회 실패" });
  }
};

// 구성원 추가
exports.addMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { member_name, member_image } = req.body;
    await userService.addFamilyMember(userId, { member_name, member_image });
    res.json({ message: "구성원 등록 완료" });
  } catch (err) {
    console.error("구성원 추가 오류:", err);
    res.status(500).json({ message: "구성원 등록 실패" });
  }
};

// 구성원 수정
exports.updateMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberId = parseInt(req.params.id); // 문자열일 수 있으므로 정수로 변환
    const { member_name, member_image } = req.body;
    await userService.updateFamilyMember(memberId, userId, { member_name, member_image });
    res.json({ message: "구성원 정보 수정 완료" });
  } catch (err) {
    console.error("구성원 수정 오류:", err);
    res.status(500).json({ message: "구성원 수정 실패" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ 로그인 사용자 ID
    const memberId = req.params.id;
    await userService.deleteFamilyMember(memberId, userId);
    res.json({ message: "구성원 삭제 완료" });
  } catch (err) {
    console.error("구성원 삭제 오류:", err);
    res.status(500).json({ message: "구성원 삭제 실패" });
  }
};


