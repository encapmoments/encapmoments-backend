const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");

dotenv.config(); // 환경변수 설정

const authRoutes = require("./routes/authRoutes");
const registerRoutes = require("./routes/registerRoutes");
const socialRoutes = require("./routes/socialRoutes");
const mainRoutes = require("./routes/mainRoutes");
const mypageRoutes = require("./routes/mypageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const familyRoutes = require("./routes/familyRoutes");
const albumRoutes = require("./routes/albumRoutes");
const albumCommentRoutes = require("./routes/albumCommentRoutes");
const verifyToken = require("./middlewares/authMiddleware");
const app = express();

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: true,
}));

// 공통 미들웨어
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/icons", express.static(path.join(__dirname, "public/icons")));
app.use("/missions", express.static(path.join(__dirname, "public/missions")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 뷰 엔진 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 라우팅
app.use("/auth", authRoutes);
app.use("/auth", socialRoutes);
app.use("/register", registerRoutes);
app.use("/naver", socialRoutes);
app.use("/kakao", socialRoutes);
app.use("/main", verifyToken, mainRoutes);
app.use("/mypage", verifyToken, mypageRoutes);
app.use("/profile", verifyToken, profileRoutes);
app.use("/family", verifyToken, familyRoutes);
app.use("/album", verifyToken, albumRoutes);
app.use("/album-comment", albumCommentRoutes); 

// 기본 페이지
app.get("/", (req, res) => {
  res.render("index", {
    naverLoginURL: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=RANDOM_STATE`,
    kakaoLoginURL: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`,
  });
});

// 회원가입 첫 화면
app.get("/register", (req, res) => res.render("registerProfile"));

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://127.0.0.1:${PORT}`);
});
