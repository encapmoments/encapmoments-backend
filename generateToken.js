require('dotenv').config();  // env 파일을 불러오기 위해 필요
const jwt = require('jsonwebtoken');

// .env 파일에 JWT_SECRET=mysecretkey123 같이 설정돼 있어야 함
const secret = process.env.JWT_SECRET;

const token = jwt.sign({ id: 1 }, secret, { expiresIn: '7d' }); // 만료시간 7일
console.log(token);
