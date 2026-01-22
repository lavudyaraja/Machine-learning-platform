// Preprocessing options

export const normalizationMethods = [
  { value: "standard", label: "Standard Scaler" },
  { value: "minmax", label: "Min-Max Scaler" },
  { value: "robust", label: "Robust Scaler" },
];

export const missingValueStrategies = [
  { value: "mean", label: "Mean" },
  { value: "median", label: "Median" },
  { value: "mode", label: "Mode" },
  { value: "drop", label: "Drop Rows" },
];

