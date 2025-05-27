DROP DATABASE if exists encapmomentsDB;
CREATE DATABASE encapmomentsDB;
use encapmomentsDB;

ALTER DATABASE encapmomentsDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


create table user(
   id int auto_increment,
   email varchar(255) UNIQUE,
   password varchar(255),
   
   kakao_id bigint unsigned default null,
   kakao_access_code varchar(64) default null,
   kakao_refresh_code varchar(64) default null,
   kakao_id_token text default null,
   
   google_id varchar(255) default null,
   google_id_token text default null,
   google_access_code varchar(100) default null,
   google_refresh_code varchar(100) default null,
   
   naver_id VARCHAR(255) DEFAULT NULL,
   naver_id_token TEXT DEFAULT NULL,
   naver_access_code VARCHAR(100) DEFAULT NULL,
   naver_refresh_code VARCHAR(100) DEFAULT NULL,
  
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
   primary key (id)
);

ALTER TABLE user ADD COLUMN jwt_refresh_token TEXT;

create table profile(
   id int,
   nickname varchar(50),
   -- profile_image varchar(255),
   profile_image text,
   -- status_message varchar(1000),
   points int default 0,
   primary key (id),
   foreign key (id) references user(id) on delete cascade
);
-- profile과 user_login table이 1:1 매칭이라 오버헤드 비효율일 수 있지만, api설계를 위해 직관적으로 이렇게 설계


CREATE TABLE daily_mission_pool (
  pool_id INT AUTO_INCREMENT PRIMARY KEY,
  -- daily_image VARCHAR(255),
  daily_image text,
  daily_title VARCHAR(40),
  daily_description VARCHAR(1000),
  reward INT DEFAULT 100 CHECK (reward >= 0)
);

create table daily_mission(
   id int not null,
   daily_id int not null auto_increment,
   pool_id INT NOT NULL,   -- 일단 포함.
   -- daily_image varchar(255),
   daily_image text,
   daily_title varchar(40),
   daily_description varchar(1000),
   reward int default 100 CHECK (reward >= 0),
     
   is_completed Boolean default false,  
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
   expires_at DATETIME NOT NULL,  -- 1일 후 자동 만료, 데이터 생성시 계산해서 처리.
   
   FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE,
	 FOREIGN KEY (pool_id) REFERENCES daily_mission_pool(pool_id),
	 PRIMARY KEY (daily_id, id)
);

create table weekly_mission(
   id int not null,
   weekly_id int not null auto_increment,
   -- weekly_image varchar(255),
   weekly_image text,
   weekly_title varchar(40),
   weekly_description varchar(1000),
   reward int default 100 CHECK (reward >= 0),   
   
	 is_completed Boolean default false, 
	 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
   expires_at DATETIME NOT NULL,  -- 1주 후 자동 만료

   primary key (weekly_id, id),
   foreign key (id) references user(id) on delete cascade
);

--ALTER TABLE weekly_mission CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


create table album(
   id int not null,
   album_id int not null auto_increment,
   album_title varchar(40),
   album_tag varchar(20),
   -- album_image varchar(255),
   album_image text,
   location varchar(50),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (album_id, id),   -- (사용자 ID, 앨범 ID) 조합으로 기본 키 설정
   FOREIGN KEY (id) references user(id) on delete cascade
);

-- 태그, 미션 게시한 시간, 위치로 앨범 검색


create table album_member(
	id int not null,
	member_id int not null auto_increment,
	member_name varchar(20) NOT NULL,
	-- member_image varchar(255),
	member_image text,
	primary key(member_id, id),
	foreign key (id) REFERENCES user(id) ON DELETE CASCADE
	);

create table album_comment(
   id int not null,  
   album_id int not null,                
   comment_id int not null auto_increment,  -- 같은 앨범 내에서 유일한 댓글 ID
   member_id int not null,   
   comment_text text not null,           -- 댓글 내용
   commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 댓글 작성 시간
   primary key (comment_id, id, album_id),     -- (앨범 ID + 댓글 ID) 복합 기본 키
   foreign key (member_id, id) references album_member(member_id, id) ON DELETE CASCADE,
   foreign key (album_id, id) REFERENCES album(album_id, id) ON DELETE CASCADE    -- 앨범 삭제되면 댓글들도 삭제   
);
-- id, ablum_id, comment_id로 어떤 앨범의 몇번 째 댓글인지 구별
-- member_id와 id를 이용해서 ablum_member table에 접근해서 member_name과 member_imagc
-- 가져옴
--INSERT INTO user (email, password, kakao_id, kakao_access_code, kakao_refresh_code, kakao_id_token,
--                  google_id, google_id_token, google_access_code, google_refresh_code,
--                  naver_id, naver_id_token, naver_access_code, naver_refresh_code)
--VALUES
--('test', 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
--('test2@example.com', 'pass1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
--('test3@example.com', 'pass1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
--('test4@example.com', 'pass1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
--('test5@example.com', 'pass1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--SELECT * FROM user;
--INSERT INTO weekly_mission (id, weekly_image, weekly_title, weekly_description, reward, is_completed, created_at, expires_at)
--VALUES
--(1, 'https://example.com/img1.jpg', '책 읽기', '한 시간 동안 독서하기', 100, false, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
--(1, 'https://example.com/img2.jpg', '산책하기', '동네 공원 30분 걷기', 150, false, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
--(1, 'https://example.com/img3.jpg', '일기 쓰기', '오늘 하루를 되돌아보며 일기 작성하기', 80, false, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
--(1, 'https://example.com/img4.jpg', '사진 찍기', '가족과 함께 사진 한 장 찍기', 120, false, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
--(1, 'https://example.com/img5.jpg', '노래 부르기', '좋아하는 노래 한 곡 부르기', 90, false, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

  -- SELECT * FROM daily_mission;
  -- TRUNCATE TABLE weekly_mission;
-- SELECT * FROM weekly_mission;
-- select * from user;
-- select * from album;
-- select * from profile;

-- 가정: user 테이블에 id = 1, 2, 3, 4 가 이미 존재

--INSERT INTO profile (id, nickname, profile_image, points) VALUES
--(1, '연웅이', 'https://example.com/images/profile1.jpg', 100),
--(2, '슬기로운개발자', 'https://example.com/images/profile2.jpg', 150),
--(3, '노드장인', 'https://example.com/images/profile3.jpg', 200),
--(4, '미션마스터', 'https://example.com/images/profile4.jpg', 300);



-- SHOW CREATE TABLE album;



ALTER TABLE album 
MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- select * from album;

-- 앨범 더미 데이터 삽입
-- INSERT INTO album (id, album_title, album_tag, album_image, location, created_at, uploaded_at) VALUES
-- (1, '가족 여행', '여행', 'https://example.com/album1.jpg', '제주도', NOW(), NOW()),
-- (2, '일상 기록', '일상', 'https://example.com/album2.jpg', '서울 강남', NOW(), NOW()),
-- (3, '반려동물 앨범', '반려동물', 'https://example.com/album3.jpg', '부산 해운대', NOW(), NOW()),
-- (4, '캠핑 추억', '취미', 'https://example.com/album4.jpg', '경기도 가평', NOW(), NOW()),
-- (1, '생일 파티', '행사', 'https://example.com/album5.jpg', '서울 종로', NOW(), NOW()),
-- (6, '가족 여행', '여행', 'https://example.com/album1.jpg', '제주도', NOW(), NOW()),
-- (6, '일상 기록', '일상', 'https://example.com/album2.jpg', '서울 강남', NOW(), NOW()),
-- (6, '반려동물 앨범', '반려동물', 'https://example.com/album3.jpg', '부산 해운대', NOW(), NOW()),
-- (6, '캠핑 추억', '취미', 'https://example.com/album4.jpg', '경기도 가평', NOW(), NOW()),
-- (6, '생일 파티', '행사', 'https://example.com/album5.jpg', '서울 종로', NOW(), NOW());

-- select * from profile;
-- select * from weekly_mission;
-- DESC user;


INSERT INTO daily_mission_pool (pool_id, daily_image, daily_title, daily_description, reward) VALUES
(1, '/public/daily8.png', '아침 스트레칭 하기', '가족과 함께 거실에서 가볍게 몸을 풀어보세요. 활기찬 하루가 시작됩니다!', 20),
(2, '/public/daily4.png', '감사 인사 전하기', '가족이나 친구에게 고마움을 표현해보세요. 따뜻한 마음이 오갑니다.', 20),
(3, '/public/daily2.png', '가족과 셀카 찍기', '오늘 하루의 추억을 사진으로 남겨보세요.', 100),
(4, '/public/daily3.png', '직접 요리해서 식사하기', '간단한 반찬이라도 정성껏 만들어보세요. 맛보다 의미가 더합니다.', 30),
(5, '/public/daily1.png', '산책하며 대화하기', '날씨 좋은 날 가족과 함께 동네를 걸으며 대화를 나눠보세요.', 10),
(6, '/public/daily10.png', '추억 사진 꺼내보기', '오래된 사진을 보며 추억을 떠올리고 이야기를 나눠보세요.', 20),
(7, '/public/daily9.png', '좋아하는 음악 함께 듣기', '같은 음악을 들으며 감정을 공유해보세요.', 20),
(8, '/public/daily6.png', '설거지 도와주기', '식사 후 작은 도움 하나가 큰 힘이 됩니다.', 30),
(9, '/public/daily7.png', '손편지 쓰기', '직접 쓴 손편지로 마음을 전해보세요.', 30),
(10, '/public/daily5.png', '감정 그림 그리기', '오늘 느낀 감정을 색으로 표현해보세요. 내 마음을 더 잘 알 수 있어요.', 20);

