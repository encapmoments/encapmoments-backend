const express = require("express");
const dotenv = require("dotenv");
const app = express();


// 기능 Routes
const albumRoutes = require('./src/routes/album');

// 미들웨어 Routes
const authMiddleware = require('./src/middlewares/authMiddleware'); // 토큰 검증 미들웨어



// 환경변수 로드
dotenv.config();

// JSON, form 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// 토큰 인증이 필요한, 미들웨어 사용하는 라우터
app.use('/album', authMiddleware, albumRoutes);


// 미들웨어 사용 안하는 라우터터
app.use("/auth", require("./src/routes/auth"));
app.use("/post", require("./src/routes/comment"));
app.use("/mission", require("./src/routes/mission"));
app.use("/profile", require("./src/routes/profile"));

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
