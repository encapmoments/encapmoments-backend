const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const registerRoutes = require("./routes/registerRoutes");
const socialRoutes = require("./routes/socialRoutes");
const mypageRoutes = require("./routes/mypageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const familyRoutes = require("./routes/familyRoutes");
const albumRoutes = require("./routes/album");
const dailyMissionRoutes = require("./routes/daily_mission");
const weeklyMissionRoutes = require("./routes/weekly_mission");
const albumCommentRoutes = require("./routes/albumCommentRoutes");
const verifyToken = require("./middlewares/authMiddleware");
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: true,
}));


app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/icons", express.static(path.join(__dirname, "public/icons")));
app.use("/missions", express.static(path.join(__dirname, "public/missions")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API 라우팅
app.use("/auth", authRoutes);
app.use("/auth", socialRoutes);
app.use("/register", registerRoutes);
app.use("/naver", socialRoutes);
app.use("/kakao", socialRoutes);
app.use("/mypage", verifyToken, mypageRoutes);
app.use("/profile", verifyToken, profileRoutes);
app.use("/family", verifyToken, familyRoutes);
app.use("/album", verifyToken, albumRoutes);
app.use("/album-comment", albumCommentRoutes);
app.use('/daily_mission', verifyToken, dailyMissionRoutes);
app.use('/weekly_mission', verifyToken, weeklyMissionRoutes);

// 기본 페이지 및 웹 렌더링 제거
app.get("/", (req, res) => {
  res.json({ message: "API 서버 작동 중" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://0.0.0.0:${PORT}`);
});
