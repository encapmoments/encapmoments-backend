const express = require("express");
const router = express.Router();
const { generateSignedUrl } = require("../utils/s3Signed");

router.get("/get-image-url", async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ message: "key is required" });

  try {
    const url = await generateSignedUrl(key);
    res.json({ url });
  } catch (err) {
    console.error("Signed URL 발급 오류:", err);
    res.status(500).json({ message: "Signed URL 생성 실패" });
  }
});

module.exports = router;
