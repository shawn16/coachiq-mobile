-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AIObservationSeverity" AS ENUM ('info', 'notice', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "public"."AIObservationType" AS ENUM ('athlete', 'team', 'workout', 'digest');

-- CreateEnum
CREATE TYPE "public"."AthleteStatus" AS ENUM ('pending', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."ObservationCategory" AS ENUM ('consistency', 'effort', 'wellness', 'progression');

-- CreateEnum
CREATE TYPE "public"."ObservationSeverity" AS ENUM ('info', 'watch', 'attention');

-- CreateEnum
CREATE TYPE "public"."ObservationType" AS ENUM ('pattern', 'flag', 'trend');

-- CreateEnum
CREATE TYPE "public"."PTGZone" AS ENUM ('endurance', 'stamina', 'aerobic_power', 'speed');

-- CreateEnum
CREATE TYPE "public"."WorkoutType" AS ENUM ('interval', 'tempo', 'long_run', 'recovery', 'race', 'fartlek', 'hill', 'threshold');

-- CreateTable
CREATE TABLE "public"."ai_observations" (
    "id" TEXT NOT NULL,
    "type" "public"."AIObservationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "dataPoints" JSONB NOT NULL,
    "related_athlete_ids" TEXT[],
    "workout_result_id" TEXT,
    "week_start" DATE,
    "severity" "public"."AIObservationSeverity" NOT NULL DEFAULT 'info',
    "viewed_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "dismiss_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."athlete_baseline_history" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "time_1600m" INTEGER NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_baseline_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."athlete_target_events" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "target_event_id" TEXT NOT NULL,
    "goal_time" INTEGER,
    "goal_pace" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_target_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."athletes" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "group_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "grade" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "invite_code" TEXT,
    "invite_code_expiry" TIMESTAMP(3),
    "status" "public"."AthleteStatus" NOT NULL DEFAULT 'pending',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "current_1600m_time" INTEGER,
    "target_event" TEXT,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coaches" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'gray',
    "is_alpha" BOOLEAN NOT NULL DEFAULT false,
    "scale_percentage" INTEGER,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."observation_settings" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "notify_severities" TEXT[] DEFAULT ARRAY['warning', 'critical']::TEXT[],
    "quiet_hours_start" INTEGER,
    "quiet_hours_end" INTEGER,
    "focus_athlete_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dismissed_patterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."observations" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "workout_id" TEXT,
    "date" DATE NOT NULL,
    "type" "public"."ObservationType" NOT NULL,
    "category" "public"."ObservationCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "public"."ObservationSeverity" NOT NULL DEFAULT 'info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personal_records" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "meet" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rpe_submissions" (
    "id" TEXT NOT NULL,
    "workout_result_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "rpe" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rpe_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."splits" (
    "id" TEXT NOT NULL,
    "workout_result_id" TEXT NOT NULL,
    "rep_number" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "pace" INTEGER,
    "off_pace_amount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."target_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_pace" INTEGER,
    "distance_meters" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school" TEXT,
    "season" TEXT,
    "year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wellness_checks" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sleep_hours" DOUBLE PRECISION,
    "sleep_quality" INTEGER,
    "energy_level" INTEGER,
    "soreness" INTEGER,
    "motivation" INTEGER,
    "hydration" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wellness_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workout_groups" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "is_source" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workout_results" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "splits" JSONB,
    "avg_pace" INTEGER,
    "weci" DOUBLE PRECISION,
    "rpe" INTEGER,
    "fpr" DOUBLE PRECISION,
    "completed_reps" INTEGER,
    "total_reps" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workouts" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workout_type" "public"."WorkoutType" NOT NULL,
    "structure" TEXT,
    "target_pace" INTEGER,
    "target_event_id" TEXT,
    "rest_interval" INTEGER,
    "ptg_zone" "public"."PTGZone",
    "specificity_rating" INTEGER,
    "weather_temp" INTEGER,
    "weather_conditions" TEXT,
    "weather_wind" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "structure_json" JSONB,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_observations_created_at_idx" ON "public"."ai_observations"("created_at" ASC);

-- CreateIndex
CREATE INDEX "ai_observations_severity_idx" ON "public"."ai_observations"("severity" ASC);

-- CreateIndex
CREATE INDEX "ai_observations_type_idx" ON "public"."ai_observations"("type" ASC);

-- CreateIndex
CREATE INDEX "ai_observations_viewed_at_idx" ON "public"."ai_observations"("viewed_at" ASC);

-- CreateIndex
CREATE INDEX "athlete_baseline_history_athlete_id_effective_at_idx" ON "public"."athlete_baseline_history"("athlete_id" ASC, "effective_at" ASC);

-- CreateIndex
CREATE INDEX "athlete_baseline_history_athlete_id_idx" ON "public"."athlete_baseline_history"("athlete_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "athlete_target_events_athlete_id_target_event_id_key" ON "public"."athlete_target_events"("athlete_id" ASC, "target_event_id" ASC);

-- CreateIndex
CREATE INDEX "athletes_group_id_idx" ON "public"."athletes"("group_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_invite_code_key" ON "public"."athletes"("invite_code" ASC);

-- CreateIndex
CREATE INDEX "athletes_status_idx" ON "public"."athletes"("status" ASC);

-- CreateIndex
CREATE INDEX "athletes_team_id_idx" ON "public"."athletes"("team_id" ASC);

-- CreateIndex
CREATE INDEX "athletes_team_id_status_idx" ON "public"."athletes"("team_id" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "public"."coaches"("email" ASC);

-- CreateIndex
CREATE INDEX "groups_team_id_idx" ON "public"."groups"("team_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "observation_settings_coach_id_key" ON "public"."observation_settings"("coach_id" ASC);

-- CreateIndex
CREATE INDEX "observations_athlete_id_idx" ON "public"."observations"("athlete_id" ASC);

-- CreateIndex
CREATE INDEX "observations_date_idx" ON "public"."observations"("date" ASC);

-- CreateIndex
CREATE INDEX "observations_is_read_idx" ON "public"."observations"("is_read" ASC);

-- CreateIndex
CREATE INDEX "observations_severity_idx" ON "public"."observations"("severity" ASC);

-- CreateIndex
CREATE INDEX "observations_workout_id_idx" ON "public"."observations"("workout_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_athlete_id_event_key" ON "public"."personal_records"("athlete_id" ASC, "event" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "rpe_submissions_workout_result_id_key" ON "public"."rpe_submissions"("workout_result_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "splits_workout_result_id_rep_number_key" ON "public"."splits"("workout_result_id" ASC, "rep_number" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "target_events_name_key" ON "public"."target_events"("name" ASC);

-- CreateIndex
CREATE INDEX "teams_coach_id_idx" ON "public"."teams"("coach_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wellness_checks_athlete_id_date_key" ON "public"."wellness_checks"("athlete_id" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "wellness_checks_athlete_id_idx" ON "public"."wellness_checks"("athlete_id" ASC);

-- CreateIndex
CREATE INDEX "wellness_checks_date_idx" ON "public"."wellness_checks"("date" ASC);

-- CreateIndex
CREATE INDEX "workout_groups_group_id_idx" ON "public"."workout_groups"("group_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workout_groups_workout_id_group_id_key" ON "public"."workout_groups"("workout_id" ASC, "group_id" ASC);

-- CreateIndex
CREATE INDEX "workout_groups_workout_id_idx" ON "public"."workout_groups"("workout_id" ASC);

-- CreateIndex
CREATE INDEX "workout_results_athlete_id_idx" ON "public"."workout_results"("athlete_id" ASC);

-- CreateIndex
CREATE INDEX "workout_results_created_at_idx" ON "public"."workout_results"("created_at" ASC);

-- CreateIndex
CREATE INDEX "workout_results_weci_idx" ON "public"."workout_results"("weci" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "workout_results_workout_id_athlete_id_key" ON "public"."workout_results"("workout_id" ASC, "athlete_id" ASC);

-- CreateIndex
CREATE INDEX "workout_results_workout_id_idx" ON "public"."workout_results"("workout_id" ASC);

-- CreateIndex
CREATE INDEX "workouts_date_idx" ON "public"."workouts"("date" ASC);

-- CreateIndex
CREATE INDEX "workouts_ptg_zone_idx" ON "public"."workouts"("ptg_zone" ASC);

-- CreateIndex
CREATE INDEX "workouts_team_id_date_idx" ON "public"."workouts"("team_id" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "workouts_team_id_idx" ON "public"."workouts"("team_id" ASC);

-- CreateIndex
CREATE INDEX "workouts_workout_type_idx" ON "public"."workouts"("workout_type" ASC);

-- AddForeignKey
ALTER TABLE "public"."athlete_baseline_history" ADD CONSTRAINT "athlete_baseline_history_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athlete_target_events" ADD CONSTRAINT "athlete_target_events_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athlete_target_events" ADD CONSTRAINT "athlete_target_events_target_event_id_fkey" FOREIGN KEY ("target_event_id") REFERENCES "public"."target_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athletes" ADD CONSTRAINT "athletes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athletes" ADD CONSTRAINT "athletes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."observations" ADD CONSTRAINT "observations_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."observations" ADD CONSTRAINT "observations_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personal_records" ADD CONSTRAINT "personal_records_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rpe_submissions" ADD CONSTRAINT "rpe_submissions_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rpe_submissions" ADD CONSTRAINT "rpe_submissions_workout_result_id_fkey" FOREIGN KEY ("workout_result_id") REFERENCES "public"."workout_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."splits" ADD CONSTRAINT "splits_workout_result_id_fkey" FOREIGN KEY ("workout_result_id") REFERENCES "public"."workout_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wellness_checks" ADD CONSTRAINT "wellness_checks_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_groups" ADD CONSTRAINT "workout_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_groups" ADD CONSTRAINT "workout_groups_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_results" ADD CONSTRAINT "workout_results_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_results" ADD CONSTRAINT "workout_results_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workouts" ADD CONSTRAINT "workouts_target_event_id_fkey" FOREIGN KEY ("target_event_id") REFERENCES "public"."target_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workouts" ADD CONSTRAINT "workouts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

