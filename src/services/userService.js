const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (email, password) => {
  return await prisma.user.create({ data: { email, password } });
};

const isEmailDuplicate = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

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

const saveRefreshToken = async (userId, refreshToken) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { jwt_refresh_token: refreshToken },
  });
};

const clearRefreshToken = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { jwt_refresh_token: null },
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

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

const updateUserInfo = async (userId, updateData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

const findUserWithProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  return { ...user, profile };
};


const upsertProfile = async (userId, profileData) => {
  return await prisma.profile.upsert({
    where: { id: userId },
    update: profileData,
    create: { id: userId, ...profileData },
  });
};

const addFamilyMember = async (userId, memberData) => {
  return await prisma.album_member.create({
    data: { ...memberData, id: userId },
  });
};

const getFamilyMembers = async (userId) => {
  return await prisma.album_member.findMany({ where: { id: userId } });
};

const updateFamilyMember = async (memberId, userId, updatedData) => {
  const parsedMemberId = parseInt(memberId);
  const parsedUserId = parseInt(userId);

  const member = await prisma.album_member.findUnique({
    where: {
      member_id_id: { member_id: parsedMemberId, id: parsedUserId },
    },
  });
  if (!member) throw new Error("해당 구성원을 찾을 수 없습니다.");

  await prisma.album_member.update({
    where: {
      member_id_id: { member_id: parsedMemberId, id: parsedUserId },
    },
    data: updatedData,
  });
};

const deleteFamilyMember = async (memberId, userId) => {
  return await prisma.album_member.delete({
    where: {
      member_id_id: {
        member_id: parseInt(memberId),
        id: parseInt(userId),
      },
    },
  });
};

const getUserMissions = async (userId) => {
  const daily = await prisma.daily_mission.findMany({
    where: { id: userId, is_completed: true },
  });
  const weekly = await prisma.weekly_mission.findMany({
    where: { id: userId, is_completed: true },
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

const getAlbumComments = async (albumId, userId) => {
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
  isEmailDuplicate,
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
