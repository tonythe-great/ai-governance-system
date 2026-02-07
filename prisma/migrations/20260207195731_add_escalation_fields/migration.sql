-- AlterTable
ALTER TABLE "SubmissionReview" ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalationLevel" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SubmissionReview_dueDate_idx" ON "SubmissionReview"("dueDate");

-- CreateIndex
CREATE INDEX "SubmissionReview_escalationLevel_idx" ON "SubmissionReview"("escalationLevel");
