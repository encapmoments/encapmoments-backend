/*
  Warnings:

  - You are about to drop the column `is_used` on the `gifticon_stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gifticon_stock` DROP COLUMN `is_used`,
    ADD COLUMN `is_assigned` BOOLEAN NOT NULL DEFAULT false;
