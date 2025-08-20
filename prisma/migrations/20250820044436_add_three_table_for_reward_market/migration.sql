-- CreateTable
CREATE TABLE `reward_item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `image_url` TEXT NULL,
    `category` VARCHAR(50) NULL,
    `cost` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gifticon_stock` (
    `stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `barcode` VARCHAR(255) NOT NULL,
    `image_url` TEXT NULL,
    `expires_at` DATETIME(3) NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_reward` (
    `user_reward_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `stock_id` INTEGER NULL,
    `purchased_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `used_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_reward_stock_id_key`(`stock_id`),
    PRIMARY KEY (`user_reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gifticon_stock` ADD CONSTRAINT `gifticon_stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `reward_item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reward` ADD CONSTRAINT `user_reward_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `reward_item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reward` ADD CONSTRAINT `user_reward_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `gifticon_stock`(`stock_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reward` ADD CONSTRAINT `user_reward_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
