// Sequelize: Node.js에서 SQL DB를 쉽게 다루기 위한 ORM(Object Relational Mapping) 라이브러리
const { Sequelize } = require("sequelize");

// dotenv: .env 파일의 환경변수를 process.env에 로드
const dotenv = require("dotenv");
dotenv.config(); // .env 파일의 설정을 환경 변수로 등록

// Sequelize 인스턴스 생성 (DB 연결)
// 첫 번째 인자: 데이터베이스 이름
// 두 번째 인자: 사용자 이름
// 세 번째 인자: 비밀번호
// 네 번째 인자: 설정 객체 (호스트 주소, 사용하는 DB 종류 등)
const sequelize = new Sequelize(
  process.env.DB_NAME,     // 데이터베이스 이름
  process.env.DB_USER,     // DB 사용자
  process.env.DB_PASS,     // DB 비밀번호
  {
    host: process.env.DB_HOST, // DB 서버 주소
    dialect: "mysql",          // 사용하는 DBMS 종류 (MySQL)
  }
);

// 만든 Sequelize 인스턴스를 외부에서 사용 가능하게 export
module.exports = sequelize;
