// Sequelize의 DataTypes 불러오기
const { DataTypes } = require("sequelize");
// DB 연결 인스턴스 불러오기
const sequelize = require("../config/db");

// user_login 테이블 정의 (Sequelize 모델)
const User = sequelize.define("user_login", {
  // 일반 이메일 회원가입 유저의 이메일 (unique 설정)
  email: { 
    type: DataTypes.STRING, 
    unique: true,           // 중복 방지
    allowNull: true         // 소셜 로그인은 이메일이 없을 수도 있음
  },

  // 일반 이메일 회원가입 유저의 비밀번호 (bcrypt로 해시된 값)
  password: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },

  // 카카오 로그인 관련 정보
  kakao_id: DataTypes.STRING,              // 카카오 고유 식별자
  kakao_id_token: DataTypes.TEXT,          // ID 토큰 (OpenID Connect용, 선택적)
  kakao_access_code: DataTypes.STRING,     // Access Token
  kakao_refresh_code: DataTypes.STRING,    // Refresh Token

  // 네이버 로그인 관련 정보
  naver_id: DataTypes.STRING,              // 네이버 고유 식별자
  naver_id_token: DataTypes.TEXT,          // ID 토큰
  naver_access_code: DataTypes.STRING,     // Access Token
  naver_refresh_code: DataTypes.STRING,    // Refresh Token

  // JWT 방식에서 사용되는 refresh token (서버에서 저장하여 인증 시 검증용)
  jwt_refresh_token: DataTypes.TEXT        // 서버 저장용 refresh token
}, {
  tableName: "user_login",  // 실제 DB 테이블 이름 지정
  timestamps: false         // createdAt, updatedAt 자동 생성 비활성화
});

// 모델 export
module.exports = User;
