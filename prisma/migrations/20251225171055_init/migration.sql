-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('url', 'text');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "inputType" "InputType" NOT NULL,
    "inputHash" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "originalUrl" TEXT,
    "originalText" TEXT,
    "summary" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_inputHash_idx" ON "jobs"("inputHash");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");
