const express = require("express");
const dotenv = require("dotenv");
const app = express();

// 환경변수 로드
dotenv.config();

// JSON, form 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 연결
app.use("/auth", require("./src/routes/auth"));
app.use("/user", require("./src/routes/album"));
app.use("/post", require("./src/routes/comment"));
app.use("/mission", require("./src/routes/mission"));
app.use("/profile", require("./src/routes/profile"));

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
