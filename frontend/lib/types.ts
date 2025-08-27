export interface ScanRequest {
  payload: string;
}

export interface ScanResponse {
  classification: string;
  rule_hits: string[];
  ml_score: number | null;
  sensitivity: string;
  safe_mode: boolean;
  action: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  payload: string;
  classification: string;
  rule_hits: string[];
  ml_score: number | null;
  sensitivity: string;
  safe_mode: boolean;
}

export interface ConfigPayload {
  sensitivity?: string;
  safe_mode?: boolean;
}

export interface ConfigResponse {
  sensitivity: string;
  safe_mode: boolean;
}
