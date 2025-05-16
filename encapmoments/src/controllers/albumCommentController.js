const {
  getAlbumComments,
  createAlbumComment,
  updateAlbumComment,
  deleteAlbumComment,
  getFamilyMembers
} = require("../services/userService");

// 앨범 멤버 목록 조회 (댓글 작성용)
exports.fetchMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "유저 정보 없음" });

    const members = await getFamilyMembers(userId);
    res.json(members);
  } catch (err) {
    console.error("멤버 목록 조회 오류:", err);
    res.status(500).json({ error: "멤버 목록 조회 실패" });
  }
};

// 댓글 조회
exports.fetchComments = async (req, res) => {
  try {
    const albumId = Number(req.params.albumId);
    const userId = req.user.id;
    console.log("댓글 조회 요청:", { albumId, userId });

    if (isNaN(albumId)) {
      return res.status(400).json({ error: "유효하지 않은 albumId입니다." });
    }
    const comments = await getAlbumComments(albumId, userId);
    res.json(comments);
  } catch (error) {
    console.error("댓글 조회 실패:", error);
    res.status(500).json({ error: "댓글 조회 실패" });
  }
};

// 댓글 작성
exports.postComment = async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId);
    const userId = req.user.id;
    const { memberName, comment_text } = req.body;
    const newComment = await createAlbumComment({ userId, albumId, memberName, comment_text });
    res.status(201).json(newComment);
  } catch (error) {
    console.error("댓글 작성 실패:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 댓글 수정
exports.patchComment = async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;
    const { comment_text } = req.body;
    const updated = await updateAlbumComment({ userId, albumId, commentId, comment_text });
    res.json(updated);
  } catch (error) {
    console.error("댓글 수정 실패:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;
    await deleteAlbumComment({ userId, albumId, commentId });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("댓글 삭제 실패:", error.message);
    res.status(400).json({ error: error.message });
  }
};
