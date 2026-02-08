import type { WellnessFormData, WellnessSubmission } from '@/types/wellness';

export async function submitWellnessCheckIn(
  formData: WellnessFormData,
): Promise<WellnessSubmission> {
  const submission: WellnessSubmission = {
    athleteId: 'mock-athlete',
    submittedAt: new Date().toISOString(),
    sleepHours: formData.sleepHours,
    hydration: formData.hydration!,
    energyLevel: formData.energy!,
    motivation: formData.motivation!,
    foodTiming: formData.foodTiming!,
    focus: formData.focus!,
    sorenessAreas: formData.sorenessAreas,
    illnessSymptoms: formData.illnessSymptoms,
    notes: formData.notes,
  };

  console.log('[WellnessCheckIn] Submission:', JSON.stringify(submission, null, 2));

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  return submission;
}
