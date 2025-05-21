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
const s3Routes = require("./routes/s3Routes");
const verifyToken = require("./middlewares/authMiddleware");

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use("/daily_mission", verifyToken, dailyMissionRoutes);
app.use("/weekly_mission", verifyToken, weeklyMissionRoutes);
app.use("/s3", s3Routes);

// 기본 페이지 및 웹 렌더링 제거
app.get("/", (req, res) => {
  res.json({ message: "API 서버 작동 중" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
