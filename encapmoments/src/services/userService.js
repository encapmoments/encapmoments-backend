const fs = require("fs");
const path = require("path");
// Sequelize 모델 불러오기
const { User, Profile, FamilyMember, DailyMission, WeeklyMission } = require("../models");

// 일반 회원가입 유저 생성 (이메일과 해싱된 비밀번호로 생성)
const createUser = async (email, password) => await User.create({ email, password });

// 이메일로 유저 조회 (일반 로그인 시 사용)
const findUserByEmail = async (email) => await User.findOne({ where: { email } });

// 네이버 소셜 로그인 유저 조회 또는 생성
const findOrCreateByNaver = async (naverId, tokens) => {
  let user = await User.findOne({ where: { naver_id: naverId } });
  if (user) return user;
  return await User.create({
    naver_id: naverId,
    naver_id_token: tokens.id_token || null,
    naver_access_code: tokens.access_token || null,
    naver_refresh_code: tokens.refresh_token || null,
  });
};

// 카카오 소셜 로그인 유저 조회 또는 생성
const findOrCreateByKakao = async (kakaoId, tokens) => {
  let user = await User.findOne({ where: { kakao_id: kakaoId } });
  if (user) return user;
  return await User.create({
    kakao_id: kakaoId,
    kakao_id_token: tokens.id_token || null,
    kakao_access_code: tokens.access_token || null,
    kakao_refresh_code: tokens.refresh_token || null,
  });
};

const saveRefreshToken = async (userId, refreshToken) => {
  return await User.update({ jwt_refresh_token: refreshToken }, { where: { id: userId } });
};

const clearRefreshToken = async (userId) => {
  return await User.update({ jwt_refresh_token: null }, { where: { id: userId } });
};

const findUserById = async (id) => await User.findByPk(id);

const getUserInfo = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Profile, as: "profile" }]
  });

  return {
    email: user.email,
    nickname: user.profile?.nickname || "",
    profile_image: user.profile?.profile_image || "/default-profile.png",
    point: user.point || 0
  };
};

const updateUserInfo = async (userId, updateData) => {
  return await User.update(updateData, {
    where: { id: userId },
  });
};

const findUserWithProfile = async (userId) => {
  return await User.findOne({
    where: { id: userId },
    include: [{ model: Profile, as: "profile" }],
  });
};

const upsertProfile = async (userId, profileData) => {
  const existingProfile = await Profile.findOne({ where: { id: userId } });
  if (existingProfile) {
    return await Profile.update(profileData, { where: { id: userId } });
  } else {
    return await Profile.create({ id: userId, ...profileData });
  }
};

// 구성원 관련 기능 추가
const addFamilyMember = async (userId, memberData) => {
  return await FamilyMember.create({ ...memberData, user_id: userId });
};

const getFamilyMembers = async (userId) => {
  return await FamilyMember.findAll({ where: { user_id: userId } });
};

const updateFamilyMember = async (memberId, updatedData) => {
  // 기존 구성원 정보 조회
  const member = await FamilyMember.findByPk(memberId);

  // 기존 이미지 경로 기억
  const oldImage = member?.member_image;

  // 업데이트 수행
  await FamilyMember.update(updatedData, { where: { id: memberId } });

  // 새 이미지가 있고, 기존 이미지가 있으며, 경로가 다를 경우 기존 이미지 삭제
  if (updatedData.member_image && oldImage && oldImage !== updatedData.member_image) {
    const fullPath = path.join(__dirname, "../public", oldImage);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // 이미지 파일 삭제
    }
  }
};


const deleteFamilyMember = async (memberId) => {
  // 삭제 전에 기존 구성원 정보 조회
  const member = await FamilyMember.findByPk(memberId);

  // 이미지 경로 확인 및 삭제
  if (member && member.member_image) {
    const fullPath = path.join(__dirname, "../public", member.member_image);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  // DB에서 구성원 삭제
  return await FamilyMember.destroy({ where: { id: memberId } });
};

// 미션 관련 기능 추가
const getUserMissions = async (userId) => {
  const daily = await DailyMission.findAll({ where: { id: userId } });
  const weekly = await WeeklyMission.findAll({ where: { id: userId } });
  return { daily, weekly };
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
  deleteFamilyMember
};
