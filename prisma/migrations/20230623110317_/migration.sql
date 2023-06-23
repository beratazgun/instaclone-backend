/*
  Warnings:

  - Made the column `postId` on table `likes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "likes" ALTER COLUMN "postId" SET NOT NULL;
