export interface Job {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  company: string;
  company_logo?: string | null;
  location: string;
  salary?: string | null;
  job_type?: string | null;
  experience_level?: string | null;
  description?: string | null;
  tags: string[];
  match_score: number;
  job_url: string;
  source_url?: string | null;
  applied_status: boolean;
  saved_status: boolean;
  fetched_at: string;
  created_at: string;
}
