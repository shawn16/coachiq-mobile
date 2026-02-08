import type { RPEFormData, RPESubmission } from '@/types/rpe';

export async function submitRPE(
  formData: RPEFormData,
  workoutName: string,
): Promise<RPESubmission> {
  const submission: RPESubmission = {
    athleteId: 'mock-athlete',
    submittedAt: new Date().toISOString(),
    workoutName,
    rpeOverall: formData.rpeOverall!,
    rpeLegs: formData.rpeLegs!,
    rpeBreathing: formData.rpeBreathing!,
    notes: formData.notes,
  };

  console.log('[RPESubmission] Submission:', JSON.stringify(submission, null, 2));

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  return submission;
}
