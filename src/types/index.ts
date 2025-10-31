export interface District {
  id: string;
  state: string;
  district: string;
  state_code?: string;
  district_code?: string;
}

export interface MGNREGAMetrics {
  district_id: string;
  year: number;
  month: number;
  families_employed: number;
  person_days_generated: number;
  total_expenditure: number;
  wages_paid: number;
  material_cost?: number;
  assets_created: number;
  api_fetched_at?: string;
  data_timestamp?: string;
}

export interface MonthlyTrendData {
  month: string;
  workforce?: number;
  budget?: number;
  families?: number;
  [key: string]: any;
}

export interface ComparisonData {
  district_name: string;
  workforce: number;
  projects: number;
  budget: number;
}

export interface StatePerformance {
  state_name: string;
  total_families_employed: number;
  total_person_days: number;
  total_expenditure: number;
  district_count: number;
}
