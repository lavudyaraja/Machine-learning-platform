import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface ScalingMethodInfo extends MethodInfo {
  title: string;
  category: "Standardization" | "Normalization" | "Robust";
  usedFor: string;
  formula: string;
}

export const scalingData: ScalingMethodInfo[] = [
  {
    id: "standard",
    title: "Standardization (Z-score Scaling)",
    definition: "Transforms features to have mean=0 and standard deviation=1.",
    concept: "Centers the data by subtracting the mean, then scales by dividing by the standard deviation. Formula: z = (x - μ) / σ. This preserves the shape of the original distribution while centering and scaling.",
    usedFor: "Normally distributed data, linear models, neural networks, PCA, clustering algorithms, and when features have different scales.",
    implementationInsight: `from sklearn.preprocessing import StandardScaler
import pandas as pd

# Initialize StandardScaler
scaler = StandardScaler(with_mean=True, with_std=True)

# Fit and transform
X_scaled = scaler.fit_transform(X)

# Using pandas
df_scaled = (df - df.mean()) / df.std()

# Column-wise standardization
for col in numeric_columns:
    df[col] = (df[col] - df[col].mean()) / df[col].std()`,
    effect: "Preserves the shape of the original distribution while centering and scaling. Essential for algorithms sensitive to feature scale.",
    category: "Standardization",
    impact: "high",
    formula: "z = (x - μ) / σ",
  },
  {
    id: "minmax",
    title: "Min-Max Scaling",
    definition: "Scales features to a fixed range, typically [0, 1].",
    concept: "Transforms features by scaling each feature to a given range. Formula: X_scaled = (X - X_min) / (X_max - X_min). Maps the minimum value to the lower bound and maximum value to the upper bound of the range.",
    usedFor: "Bounded distributions, neural networks with sigmoid/tanh activations, image processing, distance-based algorithms, and when you need values in a specific range.",
    implementationInsight: `from sklearn.preprocessing import MinMaxScaler
import pandas as pd

# Initialize MinMaxScaler with custom range
scaler = MinMaxScaler(feature_range=(0, 1))

# Fit and transform
X_scaled = scaler.fit_transform(X)

# Using pandas
df_scaled = (df - df.min()) / (df.max() - df.min())

# Custom range [a, b]
# X_scaled = a + (X - X_min) * (b - a) / (X_max - X_min)`,
    effect: "Sensitive to outliers but provides bounded output values. Useful when you need values in a specific range.",
    category: "Normalization",
    impact: "high",
    formula: "X_scaled = (X - X_min) / (X_max - X_min)",
  },
  {
    id: "maxabs",
    title: "MaxAbs Scaling",
    definition: "Scales each feature by its maximum absolute value to range [-1, 1].",
    concept: "Divides each feature by its maximum absolute value. Preserves zeros and maintains sparsity. Formula: X_scaled = X / max(|X|). This scaling is useful for sparse data where zeros are meaningful.",
    usedFor: "Sparse matrices, text data (TF-IDF), when zeros are meaningful, and when you want to preserve the sign of original values.",
    implementationInsight: `from sklearn.preprocessing import MaxAbsScaler
import pandas as pd
import numpy as np

# Initialize MaxAbsScaler
scaler = MaxAbsScaler()

# Fit and transform
X_scaled = scaler.fit_transform(X)

# Using pandas
max_abs = df.abs().max()
df_scaled = df / max_abs

# Column-wise
for col in numeric_columns:
    max_abs = df[col].abs().max()
    df[col] = df[col] / max_abs if max_abs != 0 else df[col]`,
    effect: "Preserves sparsity and sign of original values. Maintains zeros and is robust to outliers.",
    category: "Normalization",
    impact: "medium",
    formula: "X_scaled = X / max(|X|)",
  },
  {
    id: "l1",
    title: "L1 Normalization",
    definition: "Normalizes samples to unit L1 norm (sum of absolute values equals 1).",
    concept: "Scales each sample so that the sum of absolute values equals 1. Formula: X_normalized = X / sum(|X|). This is also known as Manhattan distance normalization. Useful for sparse features and L1 regularization compatibility.",
    usedFor: "Text classification, feature selection with L1 regularization, sparse high-dimensional data, and when you need to normalize samples rather than features.",
    implementationInsight: `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize Normalizer with L1 norm
normalizer = Normalizer(norm='l1')

# Fit and transform (normalizes each row)
X_normalized = normalizer.fit_transform(X)

# Using numpy
l1_norm = np.abs(X).sum(axis=1, keepdims=True)
X_normalized = X / l1_norm

# Using pandas (row-wise)
df_normalized = df.div(df.abs().sum(axis=1), axis=0)`,
    effect: "Useful for sparse features and L1 regularization compatibility. Normalizes samples to have unit L1 norm.",
    category: "Normalization",
    impact: "medium",
    formula: "X_normalized = X / sum(|X|)",
  },
  {
    id: "l2",
    title: "L2 Normalization",
    definition: "Normalizes samples to unit L2 norm (Euclidean length equals 1).",
    concept: "Scales each sample so that the Euclidean length equals 1. Formula: X_normalized = X / sqrt(sum(X²)). This is also known as Euclidean normalization. Essential for cosine similarity calculations.",
    usedFor: "Cosine similarity calculations, text mining, document similarity, neural network feature normalization, and when direction matters more than magnitude.",
    implementationInsight: `from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Initialize Normalizer with L2 norm
normalizer = Normalizer(norm='l2')

# Fit and transform (normalizes each row)
X_normalized = normalizer.fit_transform(X)

# Using numpy
l2_norm = np.sqrt((X ** 2).sum(axis=1, keepdims=True))
X_normalized = X / l2_norm

# Using pandas (row-wise)
df_normalized = df.div(np.sqrt((df ** 2).sum(axis=1)), axis=0)`,
    effect: "Essential for cosine similarity and direction-based algorithms. Normalizes samples to have unit L2 norm.",
    category: "Normalization",
    impact: "medium",
    formula: "X_normalized = X / sqrt(sum(X²))",
  },
];

