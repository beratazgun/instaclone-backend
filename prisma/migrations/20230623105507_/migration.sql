/*
  Warnings:

  - You are about to drop the column `commentId` on the `likes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_commentId_fkey";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "commentId",
ALTER COLUMN "postId" DROP NOT NULL;
