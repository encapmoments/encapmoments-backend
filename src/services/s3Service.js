const AWS = require("aws-sdk");
const path = require("path");
const axios = require("axios");


const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// 클라이언트로부터 받은 req.file 업로드
exports.uploadToS3 = async (file, folder) => {
  const fileName = `${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${folder}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: "public-read",
  };
  const result = await s3.upload(params).promise();
  return result.Location; // 이미지 URL
};

// 외부 이미지 URL(DALL·E 등) 다운로드 후 업로드
// 새로 추가: DALL·E URL → S3 업로드
exports.uploadUrlToS3 = async (url, file, folder) => { // 여기에서의 file은 단순 file이름임
  // 1. 이미지 데이터 요청
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const fileBuffer = Buffer.from(response.data); // 바이너리로 변환

  // 2. S3 업로드 Key (경로/파일이름)
  const key = `${folder}/${Date.now()}_${file}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET, // 환경변수에 설정된 버킷 이름
    Key: key,                         // 저장될 위치 및 파일명
    Body: fileBuffer,                // 실제 이미지 데이터
    ContentType: response.headers["content-type"], // MIME 타입 자동 설정
  };

  // 3. 업로드
  const result = await s3.upload(params).promise();

  // 4. 이미지 URL 반환
  return result.Location;
};