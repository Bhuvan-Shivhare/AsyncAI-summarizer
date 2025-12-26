-- Initial schema for AsyncAI Summarizer

-- Create JobStatus enum
DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create InputType enum
DO $$ BEGIN
    CREATE TYPE "InputType" AS ENUM ('url', 'text');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create jobs table
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "inputType" "InputType" NOT NULL,
    "inputHash" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "originalUrl" TEXT,
    "originalText" TEXT,
    "summary" TEXT,
    "isCacheHit" BOOLEAN DEFAULT FALSE,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "jobs_inputHash_idx" ON "jobs"("inputHash");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "jobs_createdAt_idx" ON "jobs"("createdAt");
