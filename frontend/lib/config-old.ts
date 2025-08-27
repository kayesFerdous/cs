export type Sensitivity = "Low" | "Medium" | "Paranoid";

interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  windowMinutes: number;
}

interface Config {
  safe_mode: boolean;
  sensitivity: Sensitivity;
  rate_limiting: RateLimitConfig;
}

// In-memory configuration storage
let config: Config = {
  safe_mode: true,
  sensitivity: "Medium",
  rate_limiting: {
    enabled: true,
    requests: 30,
    windowMinutes: 1,
  },
};

export function getConfig(): [boolean, Sensitivity] {
  return [config.safe_mode, config.sensitivity];
}

export function getRateLimitConfig(): RateLimitConfig {
  return config.rate_limiting;
}

export function updateConfig(options: {
  safe_mode?: boolean;
  sensitivity?: Sensitivity;
  rate_limiting?: Partial<RateLimitConfig>;
}): [boolean, Sensitivity] {
  if (options.safe_mode !== undefined) {
    config.safe_mode = options.safe_mode;
  }

  if (options.sensitivity !== undefined) {
    config.sensitivity = options.sensitivity;
  }

  if (options.rate_limiting !== undefined) {
    config.rate_limiting = {
      ...config.rate_limiting,
      ...options.rate_limiting,
    };
  }

  return [config.safe_mode, config.sensitivity];
}
