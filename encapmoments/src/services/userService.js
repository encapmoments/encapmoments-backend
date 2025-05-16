const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 유저 생성
const createUser = async (email, password) => {
  return await prisma.user.create({
    data: { email, password },
  });
};

// 이메일로 유저 조회
const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

// 네이버 로그인
const findOrCreateByNaver = async (naverId, tokens) => {
  const user = await prisma.user.findFirst({ where: { naver_id: naverId } });
  if (user) return user;

  return await prisma.user.create({
    data: {
      naver_id: naverId,
      naver_id_token: tokens.id_token || null,
      naver_access_code: tokens.access_token || null,
      naver_refresh_code: tokens.refresh_token || null,
    },
  });
};

// 카카오 로그인
const findOrCreateByKakao = async (kakaoId, tokens) => {
  const user = await prisma.user.findFirst({ where: { kakao_id: kakaoId } });
  if (user) return user;

  return await prisma.user.create({
    data: {
      kakao_id: kakaoId,
      kakao_id_token: tokens.id_token || null,
      kakao_access_code: tokens.access_token || null,
      kakao_refresh_code: tokens.refresh_token || null,
    },
  });
};

// refresh token 저장
const saveRefreshToken = async (userId, refreshToken) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { jwt_refresh_token: refreshToken },
  });
};

// refresh token 삭제
const clearRefreshToken = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { jwt_refresh_token: null },
  });
};

// 사용자 ID로 조회
const findUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

// 마이페이지 사용자 정보
const getUserInfo = async (userId) => {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return {
    email: user?.email || "",
    nickname: profile?.nickname || "",
    profile_image: profile?.profile_image || "/default-profile.png",
    points: profile?.points || 0,
  };
};

// 사용자 정보 업데이트
const updateUserInfo = async (userId, updateData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

// 프로필 조인 조회
const findUserWithProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
};

// 프로필 생성 또는 업데이트
const upsertProfile = async (userId, profileData) => {
  return await prisma.profile.upsert({
    where: { id: userId },
    update: profileData,
    create: { id: userId, ...profileData },
  });
};

// 가족 구성원 추가
const addFamilyMember = async (userId, memberData) => {
  return await prisma.album_member.create({
    data: {
      ...memberData,
      id: userId,
    },
  });
};

// 가족 구성원 조회
const getFamilyMembers = async (userId) => {
  return await prisma.album_member.findMany({
    where: { id: userId },
  });
};

// 가족 구성원 업데이트
const updateFamilyMember = async (memberId, userId, updatedData) => {
  const parsedMemberId = parseInt(memberId);
  const parsedUserId = parseInt(userId);

  // 🔍 확인용 로그
  console.log("updateFamilyMember()", { parsedMemberId, parsedUserId });

  const member = await prisma.album_member.findUnique({
    where: {
      member_id_id: {
        member_id: parsedMemberId,
        id: parsedUserId,
      },
    },
  });

  if (!member) {
    throw new Error("해당 구성원을 찾을 수 없습니다.");
  }

  const oldImage = member.member_image;

  await prisma.album_member.update({
    where: {
      member_id_id: {
        member_id: parsedMemberId,
        id: parsedUserId,
      },
    },
    data: updatedData,
  });

  if (updatedData.member_image && oldImage && oldImage !== updatedData.member_image) {
    const fullPath = path.join(__dirname, "../public", oldImage);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};


// 가족 구성원 삭제
const deleteFamilyMember = async (memberId, userId) => {
  const member = await prisma.album_member.findUnique({
    where: {
      member_id_id: {
        member_id: parseInt(memberId),
        id: parseInt(userId),
      },
    },
  });

  if (member?.member_image) {
    const fullPath = path.join(__dirname, "../public", member.member_image);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  return await prisma.album_member.delete({
    where: {
      member_id_id: {
        member_id: parseInt(memberId),
        id: parseInt(userId),
      },
    },
  });
};


// 사용자 미션 조회
const getUserMissions = async (userId) => {
  const daily = await prisma.daily_mission.findMany({
    where: {
      id: userId,
      is_completed: true,
    },
  });

  const weekly = await prisma.weekly_mission.findMany({
    where: {
      id: userId,
      is_completed: true,
    },
  });

  return { daily, weekly };
};


const createAlbumComment = async ({ userId, albumId, memberName, comment_text }) => {
  const member = await prisma.album_member.findFirst({
    where: { id: userId, member_name: memberName },
  });
  if (!member) throw new Error("해당 멤버를 찾을 수 없습니다.");

  return await prisma.album_comment.create({
    data: {
      id: userId,
      album_id: albumId,
      member_id: member.member_id,
      comment_text,
    },
    include: {
      album_member: {
        select: { member_name: true, member_image: true },
      },
    },
  });
};

// 앨범 댓글 조회
const getAlbumComments = async (albumId, userId) => {
  console.log("🧾 댓글 조회 요청:", { albumId, userId });
  return await prisma.album_comment.findMany({
    where: { album_id: albumId, id: userId },
    include: {
      album_member: {
        select: { member_name: true, member_image: true },
      },
    },
    orderBy: { commented_at: "desc" },
  });
};


const updateAlbumComment = async ({ userId, albumId, commentId, comment_text }) => {
  return await prisma.album_comment.update({
    where: {
      comment_id_id_album_id: {
        comment_id: commentId,
        id: userId,
        album_id: albumId,
      },
    },
    data: { comment_text },
  });
};

const deleteAlbumComment = async ({ userId, albumId, commentId }) => {
  return await prisma.album_comment.delete({
    where: {
      comment_id_id_album_id: {
        comment_id: commentId,
        id: userId,
        album_id: albumId,
      },
    },
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findOrCreateByNaver,
  findOrCreateByKakao,
  saveRefreshToken,
  clearRefreshToken,
  findUserById,
  getUserInfo,
  getUserMissions,
  updateUserInfo,
  findUserWithProfile,
  upsertProfile,
  addFamilyMember,
  getFamilyMembers,
  updateFamilyMember,
  deleteFamilyMember,
  getAlbumComments,
  createAlbumComment,
  updateAlbumComment,
  deleteAlbumComment,
};
