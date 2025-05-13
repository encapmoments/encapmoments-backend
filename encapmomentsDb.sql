DROP DATABASE encapmomentsDB;
CREATE DATABASE encapmomentsDB;
use encapmomentsDB;

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

create table profile(
   id int,
   nickname varchar(50),
   profile_image varchar(255),
   -- status_message varchar(1000),
   points int default 0,
   primary key (id),
   foreign key (id) references user(id) on delete cascade
);
-- profile과 user_login table이 1:1 매칭이라 오버헤드 비효율일 수 있지만, api설계를 위해 직관적으로 이렇게 설계


CREATE TABLE daily_mission_pool (
  pool_id INT AUTO_INCREMENT PRIMARY KEY,
  daily_image VARCHAR(255),
  daily_title VARCHAR(40),
  daily_description VARCHAR(1000),
  reward INT DEFAULT 100 CHECK (reward >= 0)
);

create table daily_mission(
   id int not null,
   daily_id int not null auto_increment,
   pool_id INT NOT NULL,   -- 일단 포함.
   daily_image varchar(255),
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
   weekly_image varchar(255),
   weekly_title varchar(40),
   weekly_description varchar(1000),
   reward int default 100 CHECK (reward >= 0),   
   
	 is_completed Boolean default false, 
	 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
   expires_at DATETIME NOT NULL,  -- 1주 후 자동 만료

   primary key (weekly_id, id),
   foreign key (id) references user(id) on delete cascade
);



create table album(
   id int not null,
   album_id int not null auto_increment,
   album_title varchar(40),
   album_tag varchar(20),
   album_image varchar(255),
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
	member_image varchar(255),	
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
