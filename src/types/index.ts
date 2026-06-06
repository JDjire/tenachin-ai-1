export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  created_at: string;
}

export interface Disease {
  id: string;
  name: string;
}

export interface UserDisease {
  id: string;
  user_id: string;
  disease_id: string;
}

export interface HealthGoal {
  id: string;
  user_id: string;
  goal_name: string;
}

export type RiskLevel = 'SAFE' | 'CAUTION' | 'RISK';

export interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  image_url: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  risk_level: RiskLevel;
  recommendation: string;
  created_at: string;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SymptomLog {
  id: string;
  user_id: string;
  symptoms: string;
  possible_condition: string;
  severity: SeverityLevel;
  recommendation: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  points: number;
  streak: number;
  rank: number | null;
  updated_at: string;
  profile?: Profile; // Joined data
}

export interface FoodAnalysisResponse {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  risk_level: RiskLevel;
  disease_warning: string;
  recommendation: string;
}

export interface SymptomAnalysisResponse {
  possible_condition: string;
  severity: SeverityLevel;
  recommendation: string;
  needs_hospital: boolean;
}
