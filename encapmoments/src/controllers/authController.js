// bcryptjs: 비밀번호 해싱을 위한 라이브러리
const bcrypt = require("bcryptjs");

// jsonwebtoken: JWT 토큰 발급 및 검증을 위한 라이브러리
const jwt = require("jsonwebtoken");

// 사용자 관련 DB 조작을 담당하는 서비스
const userService = require("../services/userService");


// 회원가입 처리
exports.register = async (req, res) => {
  const { email, password } = req.body; // 클라이언트에서 전달된 이메일, 비밀번호
  try {
    // 비밀번호 해싱 (10은 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 해싱된 비밀번호와 함께 사용자 생성
    await userService.createUser(email, hashedPassword);

    // 회원가입 완료 후 로그인 페이지로 리디렉션
    res.redirect("/");
  } catch (error) {
    console.error("회원가입 예외:", error);
    res.status(500).send("회원가입 처리 중 오류 발생");
  }
};


// 일반 로그인 처리
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 이메일로 사용자 조회
    const user = await userService.findUserByEmail(email);
    if (!user) return res.status(401).send("사용자를 찾을 수 없습니다.");

    // 비밀번호 비교 (입력한 비밀번호와 DB의 해시된 비밀번호)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("비밀번호가 일치하지 않습니다.");

    // JWT access token 발급 (유효시간 1시간)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // JWT refresh token 발급 (유효시간 7일)
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    // DB에 refresh token 저장
    await userService.saveRefreshToken(user.id, refreshToken);

    // 쿠키로 access, refresh 토큰 저장 (httpOnly로 JS에서 접근 불가하게 함)
    res.cookie("token", token, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    // 메인 페이지로 이동
    res.redirect("/main");
  } catch (error) {
    console.error("로그인 예외:", error);
    res.status(500).send("로그인 처리 중 오류 발생");
  }
};


// 로그아웃 처리
exports.logout = async (req, res) => {
  try {
    // 토큰에서 인증된 사용자 정보(req.user)로 DB에서 refresh token 제거
    if (req.user && req.user.id) {
      await userService.clearRefreshToken(req.user.id);
    }
  } catch (error) {
    console.error("로그아웃 예외:", error);
  } finally {
    // 클라이언트의 쿠키 제거
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    // 홈 페이지로 이동
    res.redirect("/");
  }
};
