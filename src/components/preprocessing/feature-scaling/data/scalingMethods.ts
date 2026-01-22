export interface ScalingMethod {
  value: string;
  label: string;
  desc: string;
  category: "Standardization" | "Normalization" | "Robust" | "Transformation";
  impact: "high" | "medium" | "low";
}

export const scalingMethods: ScalingMethod[] = [
  {
    value: "standard",
    label: "Standardization (Z-Score)",
    desc: "Z-score scaling: transforms features to have mean=0 and std=1",
    category: "Standardization",
    impact: "high",
  },
  {
    value: "minmax",
    label: "Min-Max Scaling",
    desc: "Scales features to a fixed range (default [0, 1])",
    category: "Normalization",
    impact: "high",
  },
  {
    value: "robust",
    label: "Robust Scaling",
    desc: "Uses median and IQR, robust to outliers",
    category: "Robust",
    impact: "high",
  },
  {
    value: "maxabs",
    label: "MaxAbs Scaling",
    desc: "Scales by maximum absolute value to range [-1, 1]",
    category: "Normalization",
    impact: "medium",
  },
  {
    value: "quantile",
    label: "Quantile Transformation",
    desc: "Maps data to uniform or normal distribution using quantiles",
    category: "Transformation",
    impact: "high",
  },
  {
    value: "box_cox",
    label: "Box-Cox Transformation",
    desc: "Power transformation for positive values to normalize distribution",
    category: "Transformation",
    impact: "medium",
  },
  {
    value: "yeo_johnson",
    label: "Yeo-Johnson Transformation",
    desc: "Power transformation that handles both positive and negative values",
    category: "Transformation",
    impact: "medium",
  },
  {
    value: "l1",
    label: "L1 Normalization",
    desc: "Scales to unit L1 norm (sum of absolute values = 1)",
    category: "Normalization",
    impact: "medium",
  },
  {
    value: "l2",
    label: "L2 Normalization",
    desc: "Scales to unit L2 norm (Euclidean length = 1)",
    category: "Normalization",
    impact: "medium",
  },
  {
    value: "unit_vector",
    label: "Unit Vector Scaling",
    desc: "Normalizes each row to unit length (same as L2)",
    category: "Normalization",
    impact: "medium",
  },
  {
    value: "log",
    label: "Log Scaling",
    desc: "Applies logarithmic transformation to reduce skewness",
    category: "Transformation",
    impact: "medium",
  },
  {
    value: "decimal",
    label: "Decimal Scaling",
    desc: "Scales by dividing by power of 10 to move decimal point",
    category: "Normalization",
    impact: "low",
  },
];

export const categories = ["all", "Standardization", "Normalization", "Robust", "Transformation"] as const;

export const impactColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200"
} as const;

/**
 * Get scaling method by value
 */
export const getScalingMethod = (value: string): ScalingMethod | undefined => {
  return scalingMethods.find(method => method.value === value);
};

/**
 * Get methods by category
 */
export const getMethodsByCategory = (category: string): ScalingMethod[] => {
  if (category === "all") return scalingMethods;
  return scalingMethods.filter(method => method.category === category);
};

/**
 * Get methods by impact level
 */
export const getMethodsByImpact = (impact: "high" | "medium" | "low"): ScalingMethod[] => {
  return scalingMethods.filter(method => method.impact === impact);
};

/**
 * Filter methods by search query
 */
export const filterMethods = (
  methods: ScalingMethod[],
  searchQuery: string,
  category: string = "all"
): ScalingMethod[] => {
  const matchesSearch = (method: ScalingMethod) => 
    method.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.desc.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesCategory = (method: ScalingMethod) => 
    category === "all" || method.category === category;
  
  return methods.filter(method => matchesSearch(method) && matchesCategory(method));
};
