import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

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

export interface LogEntryInput {
  timestamp: string;
  payload: string;
  classification: string;
  rule_hits: string[];
  ml_score: number | null;
  sensitivity: string;
  safe_mode: boolean;
}

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all logs from file
function readLogs(): LogEntry[] {
  ensureDataDir();

  if (!existsSync(LOGS_FILE)) {
    return [];
  }

  try {
    const data = readFileSync(LOGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading logs file:", error);
    return [];
  }
}

// Write all logs to file
function writeLogs(logs: LogEntry[]) {
  ensureDataDir();

  try {
    writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("Error writing logs file:", error);
  }
}

// Get next ID
function getNextId(logs: LogEntry[]): number {
  if (logs.length === 0) return 1;
  return Math.max(...logs.map((log) => log.id)) + 1;
}

export function insertLog(entry: LogEntryInput): number {
  const logs = readLogs();
  const newId = getNextId(logs);

  const newEntry: LogEntry = {
    id: newId,
    ...entry,
  };

  logs.unshift(newEntry); // Add to beginning

  // Keep only the last 1000 logs to prevent file from growing too large
  if (logs.length > 1000) {
    logs.splice(1000);
  }

  writeLogs(logs);
  return newId;
}

export function fetchLogs(limit: number = 200): LogEntry[] {
  const logs = readLogs();
  return logs.slice(0, limit);
}
