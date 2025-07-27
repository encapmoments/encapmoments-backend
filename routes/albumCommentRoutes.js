const express = require("express");
const router = express.Router();
const controller = require("../controllers/albumCommentController");
const verifyToken = require("../middlewares/authMiddleware");

// 앨범 멤버 목록 조회 (댓글 작성용)
router.get("/members", verifyToken, controller.fetchMembers);

// 댓글 조회
router.get("/:albumId", verifyToken, controller.fetchComments);

// 댓글 작성
router.post("/:albumId", verifyToken, controller.postComment);

// 댓글 수정
router.put("/:albumId/:commentId", verifyToken, controller.patchComment);
router.patch("/:albumId/:commentId", verifyToken, controller.patchComment);

// 댓글 삭제
router.delete("/:albumId/:commentId", verifyToken, controller.deleteComment);

module.exports = router;