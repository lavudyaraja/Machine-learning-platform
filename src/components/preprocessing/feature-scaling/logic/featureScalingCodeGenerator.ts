/**
 * Feature Scaling Code Generator
 * 
 * This module generates Python code for various feature scaling techniques
 * including standardization, normalization, and unit vector scaling.
 * 
 * Supports: StandardScaler, MinMaxScaler, MaxAbsScaler, Normalizer (L1/L2)
 * 
 * @module featureScalingCodeGenerator
 * @version 2.0.0
 */

export interface FeatureScalingCodeGeneratorParams {
  method: string;
  selectedColumns: string[];
  withMean?: boolean;
  withStd?: boolean;
  featureRange?: [number, number];
}

export interface ScalingMethodInfo {
  name: string;
  description: string;
  formula: string;
  useCases: string[];
  parameters: string[];
}

/**
 * Main code generation function
 * Generates Python code for feature scaling based on the selected method
 * 
 * @param params - Configuration parameters for code generation
 * @returns Generated Python code as a string
 */
export function generateFeatureScalingCode(params: FeatureScalingCodeGeneratorParams): string {
  const { method, selectedColumns, withMean, withStd, featureRange } = params;
  
  const cols = selectedColumns.length > 0 
    ? selectedColumns.map((c) => `"${c}"`).join(", ")
    : "all numeric columns";
  
  let code = "";
  
  switch (method) {
    case "standard":
      code = generateStandardScalingCode(selectedColumns, cols, withMean, withStd);
      break;
    
    case "minmax":
      code = generateMinMaxScalingCode(selectedColumns, cols, featureRange);
      break;
    
    case "maxabs":
      code = generateMaxAbsScalingCode(selectedColumns, cols);
      break;
    
    case "l1":
      code = generateL1NormalizationCode(selectedColumns, cols);
      break;
    
    case "l2":
      code = generateL2NormalizationCode(selectedColumns, cols);
      break;
    
    default:
      code = generateUnknownMethodCode(method);
  }
  
  return code;
}

/**
 * Generate code for Standardization (Z-score scaling)
 * Formula: z = (x - μ) / σ
 * 
 * Transforms features to have mean=0 and standard deviation=1
 * Best for: Normally distributed data, linear models, neural networks
 */
function generateStandardScalingCode(
  selectedColumns: string[], 
  cols: string, 
  withMean?: boolean, 
  withStd?: boolean
): string {
  const meanParam = withMean !== false ? "with_mean=True" : "with_mean=False";
  const stdParam = withStd !== false ? "with_std=True" : "with_std=False";
  
  const header = `"""
Standardization (Z-score Scaling)
==================================
Formula: z = (x - μ) / σ
- Centers data to mean=0
- Scales to standard deviation=1
- Preserves the shape of the original distribution
"""

`;
  
  if (selectedColumns.length > 0) {
    return header + `from sklearn.preprocessing import StandardScaler
import pandas as pd

# Initialize StandardScaler
scaler = StandardScaler(${meanParam}, ${stdParam})

# Select columns to scale
columns_to_scale = [${cols}]

# Fit and transform the selected columns
df[columns_to_scale] = scaler.fit_transform(df[columns_to_scale])

# Display scaling statistics
print(f"Mean after scaling: {df[columns_to_scale].mean().values}")
print(f"Std after scaling: {df[columns_to_scale].std().values}")

# Save the scaler for future use (e.g., test data)
import joblib
joblib.dump(scaler, 'standard_scaler.pkl')`;
  } else {
    return header + `from sklearn.preprocessing import StandardScaler
import pandas as pd

# Initialize StandardScaler
scaler = StandardScaler(${meanParam}, ${stdParam})

# Automatically select all numeric columns
numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
print(f"Scaling {len(numeric_cols)} numeric columns: {numeric_cols}")

# Fit and transform all numeric columns
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

# Display scaling statistics
print(f"Mean after scaling: {df[numeric_cols].mean().values}")
print(f"Std after scaling: {df[numeric_cols].std().values}")

# Save the scaler for future use
import joblib
joblib.dump(scaler, 'standard_scaler.pkl')`;
  }
}

/**
 * Generate code for Min-Max Scaling (Normalization)
 * Formula: X_scaled = (X - X_min) / (X_max - X_min)
 * 
 * Scales features to a fixed range (default [0, 1])
 * Best for: Bounded distributions, neural networks, image processing
 */
function generateMinMaxScalingCode(
  selectedColumns: string[], 
  cols: string, 
  featureRange?: [number, number]
): string {
  const range = featureRange || [0, 1];
  
  const header = `"""
Min-Max Scaling (Normalization)
================================
Formula: X_scaled = (X - X_min) / (X_max - X_min) * (max - min) + min
- Scales features to a fixed range: [${range[0]}, ${range[1]}]
- Sensitive to outliers
- Preserves zero entries in sparse data
"""

`;
  
  if (selectedColumns.length > 0) {
    return header + `from sklearn.preprocessing import MinMaxScaler
import pandas as pd

# Initialize MinMaxScaler with custom range
scaler = MinMaxScaler(feature_range=(${range[0]}, ${range[1]}))

# Select columns to scale
columns_to_scale = [${cols}]

# Fit and transform the selected columns
df[columns_to_scale] = scaler.fit_transform(df[columns_to_scale])

# Display scaling range
print(f"Min values after scaling: {df[columns_to_scale].min().values}")
print(f"Max values after scaling: {df[columns_to_scale].max().values}")

# Save the scaler for future use
import joblib
joblib.dump(scaler, 'minmax_scaler.pkl')`;
  } else {
    return header + `from sklearn.preprocessing import MinMaxScaler
import pandas as pd

# Initialize MinMaxScaler with custom range
scaler = MinMaxScaler(feature_range=(${range[0]}, ${range[1]}))

# Automatically select all numeric columns
numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
print(f"Scaling {len(numeric_cols)} numeric columns: {numeric_cols}")

# Fit and transform all numeric columns
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

# Display scaling range
print(f"Min values after scaling: {df[numeric_cols].min().values}")
print(f"Max values after scaling: {df[numeric_cols].max().values}")

# Save the scaler for future use
import joblib
joblib.dump(scaler, 'minmax_scaler.pkl')`;
  }
}

/**
 * Generate code for MaxAbs Scaling
 * Formula: X_scaled = X / max(|X|)
 * 
 * Scales by dividing by the maximum absolute value
 * Best for: Sparse data, preserving signs and zeros
 */
function generateMaxAbsScalingCode(selectedColumns: string[], cols: string): string {
  const header = `"""
MaxAbs Scaling
==============
Formula: X_scaled = X / max(|X|)
- Scales to range [-1, 1]
- Preserves sparsity (does not shift/center data)
- Maintains sign of original values
"""

`;
  
  if (selectedColumns.length > 0) {
    return header + `from sklearn.preprocessing import MaxAbsScaler
import pandas as pd

# Initialize MaxAbsScaler
scaler = MaxAbsScaler()

# Select columns to scale
columns_to_scale = [${cols}]

# Fit and transform the selected columns
df[columns_to_scale] = scaler.fit_transform(df[columns_to_scale])

# Display scaling statistics
print(f"Min values after scaling: {df[columns_to_scale].min().values}")
print(f"Max absolute values: {df[columns_to_scale].abs().max().values}")

# Save the scaler for future use
import joblib
joblib.dump(scaler, 'maxabs_scaler.pkl')`;
  } else {
    return header + `from sklearn.preprocessing import MaxAbsScaler
import pandas as pd

# Initialize MaxAbsScaler
scaler = MaxAbsScaler()

# Automatically select all numeric columns
numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
print(f"Scaling {len(numeric_cols)} numeric columns: {numeric_cols}")

# Fit and transform all numeric columns
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

# Display scaling statistics
print(f"Min values after scaling: {df[numeric_cols].min().values}")
print(f"Max absolute values: {df[numeric_cols].abs().max().values}")

# Save the scaler for future use
import joblib
joblib.dump(scaler, 'maxabs_scaler.pkl')`;
  }
}

/**
 * Generate code for L1 Normalization (Manhattan Distance)
 * Formula: X_normalized = X / sum(|X|)
 * 
 * Scales each sample to have L1 norm equal to 1
 * Best for: Sparse data, text classification, feature selection
 */
function generateL1NormalizationCode(selectedColumns: string[], cols: string): string {
  const header = `"""
L1 Normalization (Unit Vector - Manhattan Distance)
===================================================
Formula: X_normalized = X / sum(|X|)
- Each sample has L1 norm = 1 (sum of absolute values)
- Useful for sparse features
- Common in text classification
"""

`;
  
  if (selectedColumns.length > 0) {
    return header + `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize L1 Normalizer
normalizer = Normalizer(norm='l1')

# Select columns to normalize
columns_to_normalize = [${cols}]

# Fit and transform the selected columns
df[columns_to_normalize] = normalizer.fit_transform(df[columns_to_normalize])

# Verify L1 norm (should be close to 1)
l1_norms = np.abs(df[columns_to_normalize]).sum(axis=1)
print(f"L1 norms after normalization: min={l1_norms.min():.4f}, max={l1_norms.max():.4f}")
print(f"All norms close to 1: {np.allclose(l1_norms, 1.0)}")

# Note: Normalizer is stateless, no need to save`;
  } else {
    return header + `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize L1 Normalizer
normalizer = Normalizer(norm='l1')

# Automatically select all numeric columns
numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
print(f"Normalizing {len(numeric_cols)} numeric columns: {numeric_cols}")

# Fit and transform all numeric columns
df[numeric_cols] = normalizer.fit_transform(df[numeric_cols])

# Verify L1 norm (should be close to 1)
l1_norms = np.abs(df[numeric_cols]).sum(axis=1)
print(f"L1 norms after normalization: min={l1_norms.min():.4f}, max={l1_norms.max():.4f}")
print(f"All norms close to 1: {np.allclose(l1_norms, 1.0)}")

# Note: Normalizer is stateless, no need to save`;
  }
}

/**
 * Generate code for L2 Normalization (Euclidean Distance)
 * Formula: X_normalized = X / sqrt(sum(X^2))
 * 
 * Scales each sample to have L2 norm equal to 1
 * Best for: Text mining, cosine similarity, neural networks
 */
function generateL2NormalizationCode(selectedColumns: string[], cols: string): string {
  const header = `"""
L2 Normalization (Unit Vector - Euclidean Distance)
===================================================
Formula: X_normalized = X / sqrt(sum(X^2))
- Each sample has L2 norm = 1 (Euclidean length)
- Most common normalization method
- Essential for cosine similarity calculations
"""

`;
  
  if (selectedColumns.length > 0) {
    return header + `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize L2 Normalizer
normalizer = Normalizer(norm='l2')

# Select columns to normalize
columns_to_normalize = [${cols}]

# Fit and transform the selected columns
df[columns_to_normalize] = normalizer.fit_transform(df[columns_to_normalize])

# Verify L2 norm (should be close to 1)
l2_norms = np.sqrt((df[columns_to_normalize] ** 2).sum(axis=1))
print(f"L2 norms after normalization: min={l2_norms.min():.4f}, max={l2_norms.max():.4f}")
print(f"All norms close to 1: {np.allclose(l2_norms, 1.0)}")

# Note: Normalizer is stateless, no need to save`;
  } else {
    return header + `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize L2 Normalizer
normalizer = Normalizer(norm='l2')

# Automatically select all numeric columns
numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
print(f"Normalizing {len(numeric_cols)} numeric columns: {numeric_cols}")

# Fit and transform all numeric columns
df[numeric_cols] = normalizer.fit_transform(df[numeric_cols])

# Verify L2 norm (should be close to 1)
l2_norms = np.sqrt((df[numeric_cols] ** 2).sum(axis=1))
print(f"L2 norms after normalization: min={l2_norms.min():.4f}, max={l2_norms.max():.4f}")
print(f"All norms close to 1: {np.allclose(l2_norms, 1.0)}")

# Note: Normalizer is stateless, no need to save`;
  }
}

/**
 * Generate code for unknown/unsupported methods
 */
function generateUnknownMethodCode(method: string): string {
  return `"""
Unknown Scaling Method: ${method}
================================
The requested scaling method is not supported.

Supported methods:
- standard: Standardization (Z-score scaling)
- minmax: Min-Max Scaling (Normalization)
- maxabs: MaxAbs Scaling
- l1: L1 Normalization (Manhattan Distance)
- l2: L2 Normalization (Euclidean Distance)
"""

raise ValueError(f"Unsupported scaling method: '${method}'")`;
}

/**
 * Get metadata about a scaling method
 * Useful for documentation and UI hints
 */
export function getScalingMethodInfo(method: string): ScalingMethodInfo | null {
  const methodInfoMap: Record<string, ScalingMethodInfo> = {
    standard: {
      name: "Standardization",
      description: "Z-score scaling: transforms features to have mean=0 and std=1",
      formula: "z = (x - μ) / σ",
      useCases: ["Linear models", "Neural networks", "PCA", "Clustering"],
      parameters: ["with_mean", "with_std"]
    },
    minmax: {
      name: "Min-Max Scaling",
      description: "Scales features to a fixed range (default [0, 1])",
      formula: "X_scaled = (X - X_min) / (X_max - X_min)",
      useCases: ["Neural networks", "Image processing", "Distance-based algorithms"],
      parameters: ["feature_range"]
    },
    maxabs: {
      name: "MaxAbs Scaling",
      description: "Scales by maximum absolute value to [-1, 1]",
      formula: "X_scaled = X / max(|X|)",
      useCases: ["Sparse matrices", "Text data", "Preserving zeros"],
      parameters: []
    },
    l1: {
      name: "L1 Normalization",
      description: "Scales to unit L1 norm (Manhattan distance)",
      formula: "X_normalized = X / sum(|X|)",
      useCases: ["Text classification", "Feature selection", "Regularization"],
      parameters: []
    },
    l2: {
      name: "L2 Normalization",
      description: "Scales to unit L2 norm (Euclidean distance)",
      formula: "X_normalized = X / sqrt(sum(X^2))",
      useCases: ["Text mining", "Cosine similarity", "Neural networks"],
      parameters: []
    }
  };
  
  return methodInfoMap[method] || null;
}

/**
 * Generate comprehensive code for multiple scaling methods
 * Useful when comparing different scaling techniques
 */
export function generateComparisonCode(
  methods: string[],
  selectedColumns: string[],
  params: FeatureScalingCodeGeneratorParams
): string {
  const header = `"""
Feature Scaling Comparison
===========================
Comparing ${methods.length} scaling methods: ${methods.join(", ")}
Columns: ${selectedColumns.length > 0 ? selectedColumns.join(", ") : "All numeric columns"}
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, MaxAbsScaler, Normalizer
import matplotlib.pyplot as plt

# Create a copy of the original dataframe
df_original = df.copy()

`;
  
  const methodCodes = methods.map(method => {
    return generateFeatureScalingCode({ ...params, method });
  });
  
  const footer = `
# Visualization: Compare distributions before and after scaling
fig, axes = plt.subplots(len(columns_to_scale), ${methods.length + 1}, figsize=(15, 5 * len(columns_to_scale)))
fig.suptitle('Feature Scaling Comparison', fontsize=16)

for i, col in enumerate(columns_to_scale):
    # Original distribution
    axes[i, 0].hist(df_original[col], bins=30, edgecolor='black')
    axes[i, 0].set_title(f'{col} - Original')
    
    # Scaled distributions
    for j, method in enumerate([${methods.map(m => `"${m}"`).join(", ")}]):
        axes[i, j+1].hist(df[col], bins=30, edgecolor='black')
        axes[i, j+1].set_title(f'{col} - {method}')

plt.tight_layout()
plt.show()
`;
  
  return header + methodCodes.join("\n\n" + "=".repeat(70) + "\n\n") + footer;
}

/**
 * Export utility: Generate code to save scaled data
 */
export function generateSaveCode(outputPath: string = "scaled_data.csv"): string {
  return `
# Save the scaled dataframe
df.to_csv('${outputPath}', index=False)
print(f"Scaled data saved to '${outputPath}'")

# Optional: Save scaling statistics
scaling_stats = {
    'columns': columns_to_scale,
    'method': 'feature_scaling',
    'timestamp': pd.Timestamp.now().isoformat()
}

import json
with open('scaling_stats.json', 'w') as f:
    json.dump(scaling_stats, f, indent=2)
`;
}

/**
 * Generate inverse transform code
 * Useful for reverting scaled data back to original scale
 */
export function generateInverseTransformCode(method: string): string {
  if (method === "l1" || method === "l2") {
    return `
# Note: L1 and L2 normalization are not invertible
# The original scale information is lost during normalization
print("Warning: L1/L2 normalization is not invertible")
`;
  }
  
  return `
# Load the saved scaler
import joblib
scaler = joblib.load('${method}_scaler.pkl')

# Inverse transform to get back original scale
df[columns_to_scale] = scaler.inverse_transform(df[columns_to_scale])
print("Data transformed back to original scale")
`;
}