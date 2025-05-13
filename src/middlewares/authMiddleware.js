const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ★ 여기서 user 정보 저장 (user.id 포함)
    next(); // 다음 미들웨어 또는 컨트롤러로 넘어감
  } catch (err) {
    console.error('토큰 검증 실패:', err);
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;
