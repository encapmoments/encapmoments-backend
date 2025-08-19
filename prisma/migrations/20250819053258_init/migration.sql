-- CreateTable
CREATE TABLE `album` (
    `id` INTEGER NOT NULL,
    `album_id` INTEGER NOT NULL AUTO_INCREMENT,
    `album_title` VARCHAR(40) NOT NULL,
    `album_tag` VARCHAR(20) NULL,
    `album_image` TEXT NULL,
    `location` VARCHAR(50) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `uploaded_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id`(`id`),
    PRIMARY KEY (`album_id`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `album_comment` (
    `id` INTEGER NOT NULL,
    `album_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `comment_text` TEXT NOT NULL,
    `commented_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `album_id`(`album_id`, `id`),
    INDEX `member_id`(`member_id`, `id`),
    PRIMARY KEY (`comment_id`, `id`, `album_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `album_member` (
    `id` INTEGER NOT NULL,
    `member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_name` VARCHAR(20) NOT NULL,
    `member_image` TEXT NULL,
    `member_gender` VARCHAR(191) NULL,
    `member_age` INTEGER NULL,

    INDEX `id`(`id`),
    PRIMARY KEY (`member_id`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_mission` (
    `id` INTEGER NOT NULL,
    `daily_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pool_id` INTEGER NOT NULL,
    `daily_image` TEXT NULL,
    `daily_title` VARCHAR(40) NULL,
    `daily_description` VARCHAR(1000) NULL,
    `reward` INTEGER NULL DEFAULT 100,
    `is_completed` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` DATETIME(0) NOT NULL,

    INDEX `id`(`id`),
    INDEX `pool_id`(`pool_id`),
    PRIMARY KEY (`daily_id`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_mission_pool` (
    `pool_id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_image` TEXT NULL,
    `daily_title` VARCHAR(40) NULL,
    `daily_description` VARCHAR(1000) NULL,
    `reward` INTEGER NULL DEFAULT 100,

    PRIMARY KEY (`pool_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile` (
    `id` INTEGER NOT NULL,
    `nickname` VARCHAR(50) NULL,
    `profile_image` TEXT NULL,
    `points` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `kakao_id` BIGINT UNSIGNED NULL,
    `kakao_access_code` VARCHAR(64) NULL,
    `kakao_refresh_code` VARCHAR(64) NULL,
    `kakao_id_token` TEXT NULL,
    `google_id` VARCHAR(255) NULL,
    `google_id_token` TEXT NULL,
    `google_access_code` VARCHAR(100) NULL,
    `google_refresh_code` VARCHAR(100) NULL,
    `naver_id` VARCHAR(255) NULL,
    `naver_id_token` TEXT NULL,
    `naver_access_code` VARCHAR(100) NULL,
    `naver_refresh_code` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `jwt_refresh_token` TEXT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_mission` (
    `id` INTEGER NOT NULL,
    `weekly_id` INTEGER NOT NULL AUTO_INCREMENT,
    `weekly_image` TEXT NULL,
    `weekly_title` VARCHAR(40) NULL,
    `weekly_description` VARCHAR(1000) NULL,
    `reward` INTEGER NULL DEFAULT 100,
    `is_completed` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` DATETIME(0) NOT NULL,

    INDEX `id`(`id`),
    PRIMARY KEY (`weekly_id`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
