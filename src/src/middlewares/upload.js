const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // req.file.buffer로 접근 가능
module.exports = upload;
