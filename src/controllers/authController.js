const upload = require("../middlewares/upload");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

// 프로필 이미지 업로드 후 닉네임 입력 폼 렌더링 (사용 안 함, 참고용)
exports.handleImageUpload = [
  upload.single("profile_image"),
  (req, res) => {
    const imagePath = `/uploads/${req.file.filename}`;
    // res.render("registerForm", { profile_image: imagePath });
  },
];

// 일반 회원가입 (RESTful 방식) - 완성본
exports.completeRegister = async (req, res) => {
  try {
    const { email, password, nickname, profile_image } = req.body;

    if (!email || !password || !nickname || !profile_image) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser(email, hashedPassword);
    await userService.upsertProfile(user.id, { nickname, profile_image });

    res.json({ success: true, message: "회원가입 성공" });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "회원가입 처리 중 오류 발생" });
  }
};

// 일반 로그인
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await userService.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    await userService.saveRefreshToken(user.id, refreshToken);

    // 이건 Web 용. mobile은 브라우저가 아니므로 쿠기 기반 유지 불가 => 쿠키 값을 json으로 mobile에 전달
    // res.cookie("token", token, { httpOnly: true });
    // res.cookie("refreshToken", refreshToken, { httpOnly: true });
    // res.redirect('/main');

    res.json({
      success: true,
      message: "로그인 성공",
      user: {
        email: user.email,
        nickname: user.profile?.nickname,
        profile_image: user.profile?.profile_image,
      },
      accessToken: token,
      refreshToken: refreshToken,
    });

  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인 처리 중 오류 발생" });
  }
};

// 로그아웃
exports.logout = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await userService.clearRefreshToken(req.user.id);
    }
    res.json({success: true}); // success 추가 (프론트용)

  } catch (error) {
    console.error("로그아웃 예외:", error);
  } finally {
    // res.clearCookie("token");
    // res.clearCookie("refreshToken");
    // res.redirect("/");

  }
};

// Access Token 재발급
exports.refreshToken = async (req, res) => {
  try {
    // const token = req.cookies.refreshToken;
    const token = req.body.refreshToken || req.headers['x-refresh-token']; // cookie 안 쓰고 body json에서 꺼내 씀, 뒤는 header에 넣는 거(보안용)
    if (!token) return res.status(401).json({ message: "Refresh token이 없습니다." });

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ accessToken });
  } catch (error) {
    console.error("토큰 재발급 오류:", error);
    res.status(403).json({ message: "유효하지 않은 refresh token" });
  }
};

module.exports = exports;
