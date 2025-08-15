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
    if (isNaN(albumId)) {
      return res.status(400).json({ error: "유효하지 않은 albumId입니다." });
    }
    const comments = await getAlbumComments(albumId); 

    const result = comments.map(c => ({
      comment_id: c.comment_id,
      comment_text: c.comment_text,
      member_name: c.member_name,
      member_image: c.member_image,
    }));

    res.json(result);
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
    await createAlbumComment({ userId, albumId, memberName, comment_text });
    res.status(201).json({ message: "댓글 등록 성공" }); 
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
    const userId = req.user?.id;
    const { comment_text } = req.body;

    console.log("댓글 수정 요청", {
      albumId,
      commentId,
      userId,
      comment_text,
    });

    if (!userId || !comment_text) {
      return res.status(400).json({ error: "요청 값 누락" });
    }

    await updateAlbumComment({ userId, albumId, commentId, comment_text });
    res.json({ message: "댓글 수정 성공" }); 
  } catch (error) {
    console.error("댓글 수정 실패:", error);
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
    res.json({ message: "댓글 삭제 성공" }); 
  } catch (error) {
    console.error("댓글 삭제 실패:", error.message);
    res.status(400).json({ error: error.message });
  }
};
