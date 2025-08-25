from __future__ import annotations

import re
from typing import List, Tuple

# Precompiled regex patterns for common XSS and SQLi
XSS_PATTERNS = [
    re.compile(r"<\s*script\b", re.IGNORECASE),
    re.compile(r"on\w+\s*=\s*\\?\"?[^\s>]+", re.IGNORECASE),  # onerror=, onclick=
    re.compile(r"javascript:\s*", re.IGNORECASE),
    re.compile(r"<\s*img\b[^>]*src\s*=", re.IGNORECASE),
]

SQLI_PATTERNS = [
    re.compile(r"\bUNION\s+SELECT\b", re.IGNORECASE),
    re.compile(r"\bDROP\s+TABLE\b", re.IGNORECASE),
    re.compile(r"\bOR\s+1=1\b", re.IGNORECASE),
    re.compile(r"\b--\s", re.IGNORECASE),
    re.compile(r";\s*SHUTDOWN\b", re.IGNORECASE),
]


# Add patterns for command-line tools and suspicious URLs
GENERIC_DANGEROUS = [
    re.compile(r"<\s*/?\s*iframe\b", re.IGNORECASE),
    re.compile(r"<\s*svg\b", re.IGNORECASE),
    re.compile(r"\bexec\b|\bxp_cmdshell\b", re.IGNORECASE),
    re.compile(r"\bcurl\b", re.IGNORECASE),
    re.compile(r"\bwget\b", re.IGNORECASE),
    re.compile(r"http[s]?://[\w\.-]+", re.IGNORECASE),
    re.compile(r"exploit=\d+", re.IGNORECASE),
    # Path traversal
    re.compile(r"\.\./+", re.IGNORECASE),
    re.compile(r"/etc/passwd", re.IGNORECASE),
    # Command injection
    re.compile(r"\|\s*rm\s+-rf\s+/", re.IGNORECASE),
    re.compile(r";\s*rm\s+-rf\s+/", re.IGNORECASE),
    # PHP RCE
    re.compile(r"<\?php.*system\s*\(", re.IGNORECASE),
    re.compile(r"\$_GET\s*\[\s*['\"]cmd['\"]\s*\]", re.IGNORECASE),
]


def scan_rules(payload: str, sensitivity: str) -> Tuple[List[str], str]:
    """Return (rule_hits, severity) based on rule matches and sensitivity.

    severity in {Clean, Suspicious, High Threat}
    """
    hits: List[str] = []

    for pat in XSS_PATTERNS:
        if pat.search(payload):
            hits.append("XSS:" + pat.pattern)

    for pat in SQLI_PATTERNS:
        if pat.search(payload):
            hits.append("SQLi:" + pat.pattern)

    for pat in GENERIC_DANGEROUS:
        if pat.search(payload):
            hits.append("GENERIC:" + pat.pattern)

    # Sensitivity tuning
    sensitivity = (sensitivity or "Medium").capitalize()
    num_hits = len(hits)

    if num_hits == 0:
        return hits, "Clean"

    if sensitivity == "Low":
        # Only heavy patterns escalate high threat
        if any(h.startswith("SQLi:") for h in hits) or any("<\\s*script" in h for h in hits):
            return hits, "High Threat"
        return hits, "Suspicious"

    if sensitivity == "Medium":
        # A couple hits => suspicious, SQLi => high
        if any(h.startswith("SQLi:") for h in hits):
            return hits, "High Threat"
        if num_hits >= 2:
            return hits, "Suspicious"
        return hits, "Suspicious"

    # Paranoid
    if any(h.startswith("SQLi:") for h in hits):
        return hits, "High Threat"
    if num_hits >= 1:
        return hits, "Suspicious"

    return hits, "Clean"
