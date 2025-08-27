export type Sensitivity = "Low" | "Medium" | "Paranoid";

interface Config {
  safe_mode: boolean;
  sensitivity: Sensitivity;
}

// In-memory configuration storage
let config: Config = {
  safe_mode: true,
  sensitivity: "Medium",
};

export function getConfig(): [boolean, Sensitivity] {
  return [config.safe_mode, config.sensitivity];
}

export function updateConfig(options: {
  safe_mode?: boolean;
  sensitivity?: Sensitivity;
}): [boolean, Sensitivity] {
  if (options.safe_mode !== undefined) {
    config.safe_mode = options.safe_mode;
  }

  if (options.sensitivity !== undefined) {
    config.sensitivity = options.sensitivity;
  }

  return [config.safe_mode, config.sensitivity];
}
