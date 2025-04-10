// Sequelize 모델 불러오기
const User = require("../models/User");

// 일반 회원가입 유저 생성 (이메일과 해싱된 비밀번호로 생성)
const createUser = async (email, password) => await User.create({ email, password });

// 이메일로 유저 조회 (일반 로그인 시 사용)
const findUserByEmail = async (email) => await User.findOne({ where: { email } });

// 네이버 소셜 로그인 유저 조회 또는 생성
const findOrCreateByNaver = async (naverId, tokens) => {
  // 이미 존재하는 유저인지 확인
  let user = await User.findOne({ where: { naver_id: naverId } });
  if (user) return user;

  // 없으면 새로 생성 (네이버에서 받은 토큰도 함께 저장)
  return await User.create({
    naver_id: naverId,
    naver_id_token: tokens.id_token || null,
    naver_access_code: tokens.access_token || null,
    naver_refresh_code: tokens.refresh_token || null,
  });
};

// 카카오 소셜 로그인 유저 조회 또는 생성
const findOrCreateByKakao = async (kakaoId, tokens) => {
  // 이미 존재하는 유저인지 확인
  let user = await User.findOne({ where: { kakao_id: kakaoId } });
  if (user) return user;

  // 없으면 새로 생성 (카카오에서 받은 토큰도 함께 저장)
  return await User.create({
    kakao_id: kakaoId,
    kakao_id_token: tokens.id_token || null,
    kakao_access_code: tokens.access_token || null,
    kakao_refresh_code: tokens.refresh_token || null,
  });
};

// JWT 리프레시 토큰 저장 (로그인 시 DB에 저장)
const saveRefreshToken = async (userId, refreshToken) => {
  return await User.update({ jwt_refresh_token: refreshToken }, { where: { id: userId } });
};

// JWT 리프레시 토큰 삭제 (로그아웃 시 DB에서 제거)
const clearRefreshToken = async (userId) => {
  return await User.update({ jwt_refresh_token: null }, { where: { id: userId } });
};

// ID로 유저 조회 (JWT 토큰 검증 후 사용자 정보 확인 시 사용)
const findUserById = async (id) => await User.findByPk(id);

// 다른 파일에서 사용할 수 있도록 함수들 export
module.exports = {
  createUser,
  findUserByEmail,
  findOrCreateByNaver,
  findOrCreateByKakao,
  saveRefreshToken,
  clearRefreshToken,
  findUserById
};
