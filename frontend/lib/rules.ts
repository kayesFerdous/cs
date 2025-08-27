// Precompiled regex patterns for common XSS and SQLi
const XSS_PATTERNS = [
  /< *script\b/i,
  /on\w+ *= *\\?"?[^\s>]+/i, // onerror=, onclick=
  /javascript: */i,
  /< *img\b[^>]*src *=/i,
];

const SQLI_PATTERNS = [
  /\bUNION +SELECT\b/i,
  /\bDROP +TABLE\b/i,
  /\bOR +1=1\b/i,
  /\b-- /i,
  /; *SHUTDOWN\b/i,
];

// Add patterns for command-line tools and suspicious URLs
const GENERIC_DANGEROUS = [
  /< *\/? *iframe\b/i,
  /< *svg\b/i,
  /\bexec\b|\bxp_cmdshell\b/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /https?:\/\/[\w\.-]+/i,
  /exploit=\d+/i,
  // Path traversal
  /\.\.\//i,
  /\/etc\/passwd/i,
  // Command injection
  /\| *rm +-rf +\//i,
  /; *rm +-rf +\//i,
  // PHP RCE
  /<\?php.*system *\(/i,
  /\$_GET *\[ *['"]cmd['"] *\]/i,
];

export function scanRules(
  payload: string,
  sensitivity: string
): [string[], string] {
  const hits: string[] = [];

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(payload)) {
      hits.push(`XSS:${pattern.source}`);
    }
  }

  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(payload)) {
      hits.push(`SQLi:${pattern.source}`);
    }
  }

  for (const pattern of GENERIC_DANGEROUS) {
    if (pattern.test(payload)) {
      hits.push(`GENERIC:${pattern.source}`);
    }
  }

  // Sensitivity tuning
  const normalizedSensitivity =
    (sensitivity || "Medium").charAt(0).toUpperCase() +
    sensitivity.slice(1).toLowerCase();
  const numHits = hits.length;

  if (numHits === 0) {
    return [hits, "Clean"];
  }

  if (normalizedSensitivity === "Low") {
    // Only heavy patterns escalate high threat
    if (
      hits.some((h) => h.startsWith("SQLi:")) ||
      hits.some((h) => h.includes("< *script"))
    ) {
      return [hits, "High Threat"];
    }
    return [hits, "Suspicious"];
  }

  if (normalizedSensitivity === "Medium") {
    // A couple hits => suspicious, SQLi => high
    if (hits.some((h) => h.startsWith("SQLi:"))) {
      return [hits, "High Threat"];
    }
    if (numHits >= 2) {
      return [hits, "Suspicious"];
    }
    return [hits, "Suspicious"];
  }

  // Paranoid
  if (hits.some((h) => h.startsWith("SQLi:"))) {
    return [hits, "High Threat"];
  }
  if (numHits >= 1) {
    return [hits, "Suspicious"];
  }

  return [hits, "Clean"];
}
