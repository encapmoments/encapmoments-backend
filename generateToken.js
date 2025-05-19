const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1 }, 'mysecretkey123', { expiresIn: '7d' }); // 만료시간 7일 
console.log(token)