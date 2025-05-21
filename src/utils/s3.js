// src/utils/s3.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.uploadImageToS3 = async (file, folder = 'uploads') => {
  const fileContent = fs.readFileSync(file.path);
  const key = `${folder}/${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();
  fs.unlinkSync(file.path); // 임시 파일 삭제
  return data.Location; // 업로드된 이미지 URL 반환
};
