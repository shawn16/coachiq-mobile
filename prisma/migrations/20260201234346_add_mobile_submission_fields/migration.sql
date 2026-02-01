-- AlterTable
ALTER TABLE "rpe_submissions" ADD COLUMN     "rpe_request_id" TEXT;

-- AlterTable
ALTER TABLE "wellness_checks" ADD COLUMN     "illness_notes" TEXT,
ADD COLUMN     "soreness_notes" TEXT;

-- AddForeignKey
ALTER TABLE "rpe_submissions" ADD CONSTRAINT "rpe_submissions_rpe_request_id_fkey" FOREIGN KEY ("rpe_request_id") REFERENCES "rpe_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
