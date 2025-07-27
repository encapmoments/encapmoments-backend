const AWS = require("aws-sdk");
const path = require("path");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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
