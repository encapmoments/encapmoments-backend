const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 유저 생성
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
  const id = typeof userId === "string" ? parseInt(userId, 10) : userId;
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
  // 명세서에 맞게 필요한 필드만 반환
  return await prisma.album_member.findMany({
    where: { id: userId },
    select: { id: true, member_id: true, member_name: true, member_image: true }
  });
};

const updateFamilyMember = async (memberId, userId, updateData) => {
  console.log('updateFamilyMember 호출:', { memberId, userId, updateData });

  // 찾는 기준 (복합키)
  const member = await prisma.album_member.findUnique({
    where: { member_id_id: { member_id: parseInt(memberId), id: userId } },
  });

  console.log('찾은 멤버:', member);

  if (!member) throw new Error("가족 구성원을 찾을 수 없습니다.");

  return await prisma.album_member.update({
    where: { member_id_id: { member_id: parseInt(memberId), id: userId } },
    data: updateData,
  });
};

const deleteFamilyMember = async (memberId, userId) => {
  return await prisma.album_member.delete({
    where: { member_id_id: { member_id: parseInt(memberId), id: userId } },
  });
};

const getUserMissions = async (userId) => {
  // 명세서에 맞게 필드명 변경
  const daily = await prisma.daily_mission.findMany({
    where: { id: userId, is_completed: true },
    select: {
      daily_title: true,
      reward: true,
      created_at: true
    }
  });
  const weekly = await prisma.weekly_mission.findMany({
    where: { id: userId, is_completed: true },
    select: {
      weekly_title: true,
      reward: true,
      created_at: true,
      weekly_image: true
    }
  });
  // 필드명 변환
  return {
    daily: daily.map(d => ({
      mission_title: d.daily_title,
      reward: d.reward,
      created_at: d.created_at
    })),
    weekly: weekly.map(w => ({
      mission_title: w.weekly_title,
      reward: w.reward,
      created_at: w.created_at,
      mission_image: w.weekly_image
    }))
  };
};

const createAlbumComment = async ({ userId, albumId, memberName, comment_text }) => {
  const member = await prisma.album_member.findFirst({
    where: { id: userId, member_name: memberName },
  });
  if (!member) throw new Error("해당 멤버를 찾을 수 없습니다.");

  await prisma.album_comment.create({
    data: {
      id: userId,
      album_id: albumId,
      member_id: member.member_id,
      comment_text,
    }
  });
  return { message: "댓글 등록 성공" }; // <-- 명세서에 맞게 수정
};

const getAlbumComments = async (albumId) => {
  // albumId로 해당 앨범의 댓글들 먼저 불러오기
  const comments = await prisma.album_comment.findMany({
    where: { album_id: albumId },
    orderBy: { commented_at: "desc" },
  });

  // 각 댓글의 member_id, id (user id)를 가지고 album_member 조회해서 이름과 이미지 붙이기
  const enrichedComments = await Promise.all(
    comments.map(async (comment) => {
      const member = await prisma.album_member.findUnique({
        where: {
          member_id_id: {
            member_id: comment.member_id,
            id: comment.id,
          },
        },
        select: {
          member_name: true,
          member_image: true,
        },
      });

      return {
        comment_id: comment.comment_id,
        comment_text: comment.comment_text,
        member_name: member?.member_name || "알 수 없음",
        member_image: member?.member_image || "/default-profile.png",
      };
    })
  );

  return enrichedComments;
};

const updateAlbumComment = async ({ userId, albumId, commentId, comment_text }) => {
  await prisma.album_comment.update({
    where: {
      comment_id_id_album_id: {
        comment_id: commentId,
        id: userId,
        album_id: albumId,
      },
    },
    data: { comment_text },
  });
  return { message: "댓글 수정 성공" }; // <-- 명세서에 맞게 수정
};

const deleteAlbumComment = async ({ userId, albumId, commentId }) => {
  await prisma.album_comment.delete({
    where: {
      comment_id_id_album_id: {
        comment_id: commentId,
        id: userId,
        album_id: albumId,
      },
    },
  });
  return { message: "댓글 삭제 성공" }; // <-- 명세서에 맞게 수정
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
