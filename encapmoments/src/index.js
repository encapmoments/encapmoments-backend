const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const socialRoutes = require("./routes/socialRoutes");
const mainRoutes = require("./routes/mainRoutes");
const mypageRoutes = require("./routes/mypageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const verifyToken = require("./middlewares/authMiddleware");
const { renderMypage } = require("./controllers/mypageController");
const familyRoutes = require("./routes/familyRoutes");
dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 라우터 등록
app.use("/auth", authRoutes);
app.use("/naver", socialRoutes);
app.use("/kakao", socialRoutes);
app.use("/main", verifyToken, mainRoutes);
app.use("/family", familyRoutes);
app.use("/mypage", verifyToken, mypageRoutes);
app.use("/profile", profileRoutes);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/icons", express.static(path.join(__dirname, "public/icons")));
app.use("/missions", express.static(path.join(__dirname, "public/missions")));

// 기본 페이지
app.get("/", (req, res) => {
  res.render("index", {
    naverLoginURL: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=RANDOM_STATE`,
    kakaoLoginURL: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`,
  });
});

app.get("/register", (req, res) => res.render("register"));

// DB 연결 및 서버 실행
const PORT = process.env.PORT || 3000;
db.authenticate()
  .then(() => {
    console.log("DB 연결 성공");
    app.listen(PORT, () => {
      console.log(`http://127.0.0.1:${PORT} 서버 실행 중`);
    });
  })
  .catch((err) => {
    console.error("DB 연결 실패:", err);
  });