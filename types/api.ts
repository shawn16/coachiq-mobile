/**
 * API type definitions matching the server's response format.
 */

// Generic API response wrapper — matches server's ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// ----- Auth -----

export interface TeamValidationResponse {
  valid: boolean;
  teamId?: string;
  teamName?: string;
}

export interface FindAthleteResponse {
  found: boolean;
  message?: string;
  athletes?: {
    id: string;
    firstName: string;
    lastName: string;
    grade: number | null;
  }[];
}

export interface AthleteProfile {
  id: string;
  firstName: string;
  lastName: string;
  grade: number | null;
  groupId: string | null;
  teamId: string;
  teamName: string;
}

export interface SetPinResponse {
  success: boolean;
  token: string;
  athlete: AthleteProfile;
}

export interface PinLoginResponse {
  success: boolean;
  token: string;
  athlete: AthleteProfile;
}

// ----- Wellness -----

export interface WellnessSubmissionRequest {
  sleepHours: number;
  sleepQuality: number;
  hydration: number;
  energy: number;
  motivation: number;
  focus: number;
  foodTiming: "havent_eaten" | "just_ate" | "1_2_hours" | "3_plus_hours";
  sorenessAreas?: string[];
  illnessSymptoms?: string[];
  notes?: string;
  sorenessNotes?: string;
  illnessNotes?: string;
  wellnessRequestId?: string;
}

export interface WellnessCheck {
  id: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  motivation: number | null;
  hydration: number | null;
  focus: number | null;
  foodTiming: string | null;
  sorenessAreas: string[];
  illnessSymptoms: string[];
  notes: string | null;
  submittedAt: string;
}

// ----- RPE -----

export interface RpeSubmissionRequest {
  workoutResultId?: string;
  rpe: number;
  rpeLegs?: number;
  rpeBreathing?: number;
  notes?: string;
  rpeRequestId?: string;
}

export interface RpeSubmission {
  id: string;
  rpe: number;
  rpeLegs: number | null;
  rpeBreathing: number | null;
  notes: string | null;
  submittedAt: string;
}

// ----- Pending Requests -----

export interface PendingRequest {
  id: string;
  type: "wellness" | "rpe";
  message: string | null;
  deadline: string;
  workoutId?: string;
  workoutName?: string;
}

export interface PendingRequestsResponse {
  wellness: PendingRequest[];
  rpe: PendingRequest[];
}

// ----- Workouts -----

export interface Workout {
  id: string;
  name: string;
  date: string;
  workoutType: string;
  description: string | null;
}

export interface WorkoutsResponse {
  workouts: Workout[];
}

// ----- Stats -----

export interface StatsData {
  recentWorkouts: {
    id: string;
    name: string;
    date: string;
    rpe: number | null;
    weci: number | null;
  }[];
  averageRpe: number | null;
  averageWeci: number | null;
  workoutCount: number;
  personalRecords: {
    event: string;
    time: number;
    date: string;
  }[];
}

export interface StatsResponse {
  stats: StatsData;
}
