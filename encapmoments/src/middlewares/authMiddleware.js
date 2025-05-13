// jsonwebtoken 모듈을 사용하여 JWT 토큰 검증
const jwt = require("jsonwebtoken");

// .env 파일의 환경변수 로드
require("dotenv").config();

// 인증 미들웨어 함수 export
module.exports = (req, res, next) => {
  // 쿠키에서 토큰 가져오기
  const token = req.cookies.token; // 클라이언트가 보낸 쿠키 중 'token' 항목

  // 토큰이 없는 경우 (로그인 안 한 상태)
  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증된 사용자 정보(req.user)에 저장 (다음 미들웨어나 라우터에서 사용 가능), decoded에서 table의 id에 해당하는 값을 뽑음
    req.user = { id: decoded.id }; 
 

    // 다음 미들웨어로 진행
    next();
  } catch (error) {
    // 토큰이 유효하지 않거나 만료된 경우
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};
