-- CreateIndex
CREATE INDEX "wellness_alerts_team_id_is_resolved_severity_idx" ON "wellness_alerts"("team_id", "is_resolved", "severity");
