const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

exports.naverLogin = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  // 네이버 토큰 요청 URL 구성
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&code=${code}&state=${state}`;

  try {
    // access token, refresh token 획득
    const response = await fetch(api_url);
    const tokenData = await response.json();

    if (tokenData.access_token) {
      // 네이버 사용자 정보 요청
      const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileResponse.json();
      const naverId = profileData.response.id;

      // DB에 유저 조회 또는 생성
      const user = await userService.findOrCreateByNaver(naverId, tokenData);

      // JWT access/refresh token 발급
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

      // refresh token을 DB에 저장
      await userService.saveRefreshToken(user.id, refreshToken);

      // 쿠키에 토큰 저장
      res.cookie("token", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      // 메인 페이지로 이동
      res.redirect("/main");
    } else {
      res.status(500).send("네이버 로그인 실패");
    }
  } catch (error) {
    console.error("네이버 로그인 오류:", error);
    res.status(500).send("네이버 로그인 중 오류 발생");
  }
};

// 카카오 로그인 처리
exports.kakaoLogin = async (req, res) => {
  const code = req.query.code;

  // 카카오 토큰 요청 URL 구성
  const api_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`;

  try {
    // POST 요청으로 access token 요청
    const response = await fetch(api_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const tokenData = await response.json();

    if (tokenData.access_token) {
      // 카카오 사용자 정보 요청
      const profileResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileResponse.json();
      const kakaoId = profileData.id;

      // DB에 유저 조회 또는 생성
      const user = await userService.findOrCreateByKakao(kakaoId, tokenData);

      // JWT access/refresh token 발급
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

      // refresh token DB에 저장
      await userService.saveRefreshToken(user.id, refreshToken);

      // 쿠키에 토큰 저장
      res.cookie("token", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      // 메인 페이지로 이동
      res.redirect("/main");
    } else {
      res.status(500).send("카카오 로그인 실패");
    }
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    res.status(500).send("카카오 로그인 중 오류 발생");
  }
};