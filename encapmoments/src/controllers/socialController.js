const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

// 네이버 로그인 처리
exports.naverLogin = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&code=${code}&state=${state}`;

  try {
    const response = await fetch(api_url);
    const tokenData = await response.json();

    if (tokenData.access_token) {
      const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileResponse.json();
      const naverId = profileData.response.id;

      const user = await userService.findOrCreateByNaver(naverId, tokenData);

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

      await userService.saveRefreshToken(user.id, refreshToken);

      res.cookie("token", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      res.json({ message: "네이버 로그인 성공" });
    } else {
      res.status(500).json({ message: "네이버 로그인 실패" });
    }
  } catch (error) {
    console.error("네이버 로그인 오류:", error);
    res.status(500).json({ message: "네이버 로그인 중 오류 발생" });
  }
};

// 카카오 로그인 처리
exports.kakaoLogin = async (req, res) => {
  const code = req.query.code;
  const api_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`;

  try {
    const response = await fetch(api_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const tokenData = await response.json();

    if (tokenData.access_token) {
      const profileResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileResponse.json();
      const kakaoId = profileData.id;

      const user = await userService.findOrCreateByKakao(kakaoId, tokenData);

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

      await userService.saveRefreshToken(user.id, refreshToken);

      res.cookie("token", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      res.json({ message: "카카오 로그인 성공" });
    } else {
      res.status(500).json({ message: "카카오 로그인 실패" });
    }
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    res.status(500).json({ message: "카카오 로그인 중 오류 발생" });
  }
};

// 소셜 회원가입
exports.registerSocialUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, profile_image } = req.body;

    if (!nickname || !profile_image) {
      return res.status(400).json({ message: "닉네임과 프로필 이미지가 필요합니다." });
    }

    await userService.upsertProfile(userId, { nickname, profile_image });

    res.json({ message: "소셜 회원가입 완료" });
  } catch (error) {
    console.error("소셜 회원가입 오류:", error);
    res.status(500).json({ message: "회원가입 실패" });
  }
};
