-- AlterTable
ALTER TABLE "wellness_checks" ADD COLUMN     "focus" INTEGER,
ADD COLUMN     "food_timing" TEXT,
ADD COLUMN     "illness_symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "soreness_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "wellness_request_id" TEXT;

-- CreateTable
CREATE TABLE "wellness_requests" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "group_id" TEXT,
    "coach_id" TEXT NOT NULL,
    "message" VARCHAR(200),
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wellness_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpe_requests" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "group_id" TEXT,
    "workout_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "message" VARCHAR(200),
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rpe_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_alerts" (
    "id" TEXT NOT NULL,
    "wellness_check_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wellness_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wellness_requests_team_id_idx" ON "wellness_requests"("team_id");

-- CreateIndex
CREATE INDEX "wellness_requests_coach_id_idx" ON "wellness_requests"("coach_id");

-- CreateIndex
CREATE INDEX "rpe_requests_team_id_idx" ON "rpe_requests"("team_id");

-- CreateIndex
CREATE INDEX "rpe_requests_workout_id_idx" ON "rpe_requests"("workout_id");

-- CreateIndex
CREATE INDEX "rpe_requests_coach_id_idx" ON "rpe_requests"("coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "device_tokens_is_active_idx" ON "device_tokens"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_user_id_token_key" ON "device_tokens"("user_id", "token");

-- CreateIndex
CREATE INDEX "wellness_alerts_wellness_check_id_idx" ON "wellness_alerts"("wellness_check_id");

-- CreateIndex
CREATE INDEX "wellness_alerts_athlete_id_idx" ON "wellness_alerts"("athlete_id");

-- CreateIndex
CREATE INDEX "wellness_alerts_team_id_idx" ON "wellness_alerts"("team_id");

-- CreateIndex
CREATE INDEX "wellness_alerts_severity_idx" ON "wellness_alerts"("severity");

-- CreateIndex
CREATE INDEX "wellness_alerts_is_resolved_idx" ON "wellness_alerts"("is_resolved");

-- AddForeignKey
ALTER TABLE "wellness_checks" ADD CONSTRAINT "wellness_checks_wellness_request_id_fkey" FOREIGN KEY ("wellness_request_id") REFERENCES "wellness_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_requests" ADD CONSTRAINT "wellness_requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_requests" ADD CONSTRAINT "wellness_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_requests" ADD CONSTRAINT "wellness_requests_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpe_requests" ADD CONSTRAINT "rpe_requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpe_requests" ADD CONSTRAINT "rpe_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpe_requests" ADD CONSTRAINT "rpe_requests_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpe_requests" ADD CONSTRAINT "rpe_requests_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_alerts" ADD CONSTRAINT "wellness_alerts_wellness_check_id_fkey" FOREIGN KEY ("wellness_check_id") REFERENCES "wellness_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_alerts" ADD CONSTRAINT "wellness_alerts_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_alerts" ADD CONSTRAINT "wellness_alerts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
