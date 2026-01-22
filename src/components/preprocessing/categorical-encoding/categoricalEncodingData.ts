import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface CategoricalEncodingMethodInfo extends MethodInfo {
  label: string;
  icon: string;
  useCases: string[];
  category: "Basic" | "Advanced" | "Target-Based";
  formula?: string;
}

export const categoricalEncodingData: CategoricalEncodingMethodInfo[] = [
  {
    id: "label",
    label: "Label Encoding",
    icon: "🏷️",
    definition: "Assigns unique integers (0, 1, 2...) to each category. Simple and fast encoding method.",
    concept: "Maps each unique category to a sequential integer. The encoder learns the mapping during fit and applies it during transform. This method assumes an implicit ordinal relationship between categories, which may not always be appropriate for nominal data.",
    useCases: [
      "Tree-based algorithms (Decision Trees, Random Forest)",
      "Ordinal categorical variables",
      "When memory efficiency is critical",
      "Low cardinality features"
    ],
    implementationInsight: `from sklearn.preprocessing import LabelEncoder
import pandas as pd

# Initialize LabelEncoder
encoder = LabelEncoder()

# Fit and transform
df['encoded_column'] = encoder.fit_transform(df['categorical_column'])

# Manual implementation
unique_values = df['categorical_column'].unique()
mapping = {val: idx for idx, val in enumerate(unique_values)}
df['encoded_column'] = df['categorical_column'].map(mapping)

# Inverse transform
df['original'] = encoder.inverse_transform(df['encoded_column'])`,
    effect: "Creates a single numeric column. Memory efficient but may introduce false ordinal relationships in nominal data.",
    category: "Basic",
    impact: "medium",
    formula: "encoded_value = index_of_category",
  },
  {
    id: "one_hot",
    label: "One-Hot Encoding",
    icon: "🔥",
    definition: "Creates separate binary columns (0/1) for each category. Eliminates ordinal assumptions.",
    concept: "Transforms each category into a binary vector where only one position is 1 (hot) and all others are 0. This creates k new columns for k unique categories. Eliminates any implicit ordinal relationships and works well with most machine learning algorithms.",
    useCases: [
      "Nominal categorical variables",
      "Linear models and neural networks",
      "Low to medium cardinality (< 20 categories)",
      "When category relationships are unknown"
    ],
    implementationInsight: `from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Initialize OneHotEncoder
encoder = OneHotEncoder(drop='first', sparse=False, handle_unknown='ignore')

# Fit and transform
encoded = encoder.fit_transform(df[['categorical_column']])
df_encoded = pd.DataFrame(encoded, columns=encoder.get_feature_names_out(['categorical_column']))

# Using pandas get_dummies
df_encoded = pd.get_dummies(df, columns=['categorical_column'], drop_first=True, prefix='cat')

# With handle_unknown
encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
encoded = encoder.fit_transform(df[['categorical_column']])`,
    effect: "Increases dimensionality significantly (k columns for k categories). Creates sparse representation but eliminates ordinal assumptions.",
    category: "Basic",
    impact: "high",
    formula: "For category i: column_i = 1, all_other_columns = 0",
  },
  {
    id: "ordinal",
    label: "Ordinal Encoding",
    icon: "📊",
    definition: "Maps categories to integers based on their natural order. Preserves ordinal relationships.",
    concept: "Similar to label encoding but explicitly preserves the natural order of categories. Requires manual specification of the category order. Useful when categories have a meaningful ranking (e.g., small < medium < large).",
    useCases: [
      "Ordered categorical variables",
      "Rating scales (1-5 stars)",
      "Size categories (S, M, L, XL)",
      "Education levels (High School < Bachelor < Master < PhD)"
    ],
    implementationInsight: `from sklearn.preprocessing import OrdinalEncoder
import pandas as pd

# Define category order
categories = [['small', 'medium', 'large']]

# Initialize OrdinalEncoder with order
encoder = OrdinalEncoder(categories=categories)

# Fit and transform
df['encoded_column'] = encoder.fit_transform(df[['categorical_column']])

# Manual implementation
mapping = {'small': 0, 'medium': 1, 'large': 2}
df['encoded_column'] = df['categorical_column'].map(mapping)`,
    effect: "Preserves ordinal relationships while maintaining compact representation. Single column output.",
    category: "Basic",
    impact: "medium",
    formula: "encoded_value = position_in_ordered_list",
  },
  {
    id: "target",
    label: "Target Encoding",
    icon: "🎯",
    definition: "Replaces each category with the mean of the target variable for that category. Powerful encoding method.",
    concept: "Calculates the mean target value for each category and replaces the category with this mean. This captures the relationship between categories and the target variable. Requires careful handling to prevent overfitting, often using cross-validation or smoothing techniques.",
    useCases: [
      "High cardinality categorical features",
      "When target relationship is important",
      "Tree-based and linear models",
      "Regression and classification tasks"
    ],
    implementationInsight: `import pandas as pd
import numpy as np
from category_encoders import TargetEncoder

# Using category_encoders library
encoder = TargetEncoder(cols=['categorical_column'], smoothing=1.0)

# Fit and transform (requires target)
encoder.fit(df[['categorical_column']], df['target'])
df['encoded_column'] = encoder.transform(df[['categorical_column']])

# Manual implementation with smoothing
def target_encode(df, cat_col, target_col, smoothing=1.0):
    # Calculate global mean
    global_mean = df[target_col].mean()
    
    # Calculate category means
    category_means = df.groupby(cat_col)[target_col].mean()
    category_counts = df.groupby(cat_col)[target_col].count()
    
    # Apply smoothing
    smoothing_factor = 1 / (1 + np.exp(-(category_counts - 1) / smoothing))
    encoded = category_means * smoothing_factor + global_mean * (1 - smoothing_factor)
    
    return df[cat_col].map(encoded)`,
    effect: "Captures target relationship but risks overfitting. Requires target variable and careful validation strategy.",
    category: "Target-Based",
    impact: "high",
    formula: "encoded_value = mean(target | category)",
  },
  {
    id: "frequency",
    label: "Frequency Encoding",
    icon: "📈",
    definition: "Replaces categories with their frequency counts in the dataset. Captures category importance.",
    concept: "Maps each category to its frequency (count of occurrences) in the dataset. Categories that appear more frequently get higher values. This encoding captures the importance or popularity of categories based on their occurrence rate.",
    useCases: [
      "High cardinality features",
      "When frequency is informative",
      "Tree-based algorithms",
      "Features where common categories matter"
    ],
    implementationInsight: `import pandas as pd

# Calculate frequencies
freq_map = df['categorical_column'].value_counts().to_dict()

# Apply frequency encoding
df['encoded_column'] = df['categorical_column'].map(freq_map)

# Normalized frequency (0 to 1)
freq_normalized = df['categorical_column'].value_counts(normalize=True).to_dict()
df['encoded_column'] = df['categorical_column'].map(freq_normalized)

# Using groupby
freq = df.groupby('categorical_column').size() / len(df)
df['encoded_column'] = df['categorical_column'].map(freq)`,
    effect: "Simple and effective for high cardinality. Single column output but may lose category identity.",
    category: "Advanced",
    impact: "medium",
    formula: "encoded_value = count(category) / total_rows",
  },
  {
    id: "count",
    label: "Count Encoding",
    icon: "🔢",
    definition: "Similar to frequency encoding, replaces categories with total occurrence counts. Useful for capturing category popularity.",
    concept: "Maps categories to their absolute count in the dataset. Similar to frequency encoding but uses raw counts instead of proportions. Categories that appear more often get higher numeric values, capturing the popularity or commonness of each category.",
    useCases: [
      "High cardinality categorical features",
      "When absolute counts matter",
      "Tree-based models",
      "Features with varying category frequencies"
    ],
    implementationInsight: `import pandas as pd

# Calculate counts
count_map = df['categorical_column'].value_counts().to_dict()

# Apply count encoding
df['encoded_column'] = df['categorical_column'].map(count_map)

# Using groupby
counts = df.groupby('categorical_column').size()
df['encoded_column'] = df['categorical_column'].map(counts)

# With reset_index
count_df = df.groupby('categorical_column').size().reset_index(name='count')
df = df.merge(count_df, on='categorical_column', how='left')`,
    effect: "Intuitive encoding that captures category popularity. Single column with raw counts.",
    category: "Advanced",
    impact: "medium",
    formula: "encoded_value = count(category)",
  },
  {
    id: "binary",
    label: "Binary Encoding",
    icon: "🔲",
    definition: "Converts categories to binary representation, reducing dimensionality compared to one-hot while preserving information.",
    concept: "First applies ordinal encoding, then converts the ordinal integers to binary representation. This creates fewer columns than one-hot encoding (log2(k) columns instead of k columns). Each category is represented as a binary number, reducing dimensionality while maintaining some information.",
    useCases: [
      "High cardinality features",
      "When one-hot creates too many columns",
      "Tree-based and linear models",
      "Memory-constrained environments"
    ],
    implementationInsight: `import pandas as pd
import category_encoders as ce

# Using category_encoders library
encoder = ce.BinaryEncoder(cols=['categorical_column'])

# Fit and transform
df_encoded = encoder.fit_transform(df[['categorical_column']])

# Manual implementation
from sklearn.preprocessing import LabelEncoder
import numpy as np

# Step 1: Label encode
le = LabelEncoder()
ordinal = le.fit_transform(df['categorical_column'])

# Step 2: Convert to binary
max_bits = int(np.ceil(np.log2(len(le.classes_))))
binary_cols = []
for i in range(max_bits):
    df[f'binary_{i}'] = (ordinal >> i) & 1`,
    effect: "Reduces dimensionality compared to one-hot (log2(k) vs k columns). Preserves some category information.",
    category: "Advanced",
    impact: "medium",
    formula: "binary_representation = binary(ordinal_index)",
  },
  {
    id: "hash",
    label: "Hash Encoding",
    icon: "🔐",
    definition: "Uses hashing to map categories to fixed-size feature vectors. Efficient for very high cardinality features.",
    concept: "Uses a hash function to map categories to a fixed number of features (typically 2-8 columns). Multiple categories may hash to the same value (collision), but this is often acceptable. The output size is fixed regardless of the number of categories, making it very efficient for high cardinality features.",
    useCases: [
      "Very high cardinality features (1000+ categories)",
      "When exact category identity is not critical",
      "Memory-efficient encoding",
      "Real-time prediction systems"
    ],
    implementationInsight: `import pandas as pd
import category_encoders as ce

# Using category_encoders library
encoder = ce.HashingEncoder(cols=['categorical_column'], n_components=8)

# Fit and transform
df_encoded = encoder.fit_transform(df[['categorical_column']])

# Manual implementation
import hashlib

def hash_encode(df, col, n_components=8):
    def hash_to_vector(value, n):
        # Hash the value
        hash_val = int(hashlib.md5(str(value).encode()).hexdigest(), 16)
        # Create binary vector
        vector = [0] * n
        for i in range(n):
            vector[i] = (hash_val >> i) & 1
        return vector
    
    vectors = df[col].apply(lambda x: hash_to_vector(x, n_components))
    return pd.DataFrame(list(vectors), columns=[f'hash_{i}' for i in range(n_components)])`,
    effect: "Fixed output size regardless of cardinality. Handles unseen categories but may have hash collisions.",
    category: "Advanced",
    impact: "high",
    formula: "hash_vector = hash_function(category) mod n_components",
  },
  {
    id: "leave_one_out",
    label: "Leave-One-Out Encoding",
    icon: "🔄",
    definition: "Target encoding variant that excludes the current row when calculating category means. Prevents data leakage and overfitting.",
    concept: "Similar to target encoding but calculates the mean target value for each category excluding the current row. This prevents data leakage and reduces overfitting compared to standard target encoding. Each row's encoding is calculated using only the other rows in the same category.",
    useCases: [
      "High cardinality with target variable",
      "When preventing overfitting is critical",
      "Cross-validation scenarios",
      "Small to medium datasets"
    ],
    implementationInsight: `import pandas as pd
import category_encoders as ce

# Using category_encoders library
encoder = ce.LeaveOneOutEncoder(cols=['categorical_column'])

# Fit and transform (requires target)
encoder.fit(df[['categorical_column']], df['target'])
df['encoded_column'] = encoder.transform(df[['categorical_column']])

# Manual implementation
def leave_one_out_encode(df, cat_col, target_col):
    def encode_row(row):
        category = row[cat_col]
        # Calculate mean excluding current row
        mask = (df[cat_col] == category) & (df.index != row.name)
        if mask.sum() > 0:
            return df.loc[mask, target_col].mean()
        else:
            return df[target_col].mean()  # Fallback to global mean
    
    return df.apply(encode_row, axis=1)`,
    effect: "Reduces overfitting compared to target encoding. Prevents data leakage but computationally more expensive.",
    category: "Target-Based",
    impact: "high",
    formula: "encoded_value = mean(target | category, excluding_current_row)",
  },
  {
    id: "woe",
    label: "Weight of Evidence",
    icon: "⚖️",
    definition: "Calculates the logarithmic ratio of positive to negative events per category. Commonly used in credit scoring and binary classification.",
    concept: "Calculates the Weight of Evidence (WoE) which is the natural logarithm of the ratio of the proportion of positive events to the proportion of negative events for each category. WoE = ln(% of positive events / % of negative events). Commonly used in credit risk modeling and binary classification tasks.",
    useCases: [
      "Binary classification tasks",
      "Credit scoring and risk modeling",
      "High cardinality categorical features",
      "When interpretability is important"
    ],
    implementationInsight: `import pandas as pd
import numpy as np
import category_encoders as ce

# Using category_encoders library
encoder = ce.WOEEncoder(cols=['categorical_column'])

# Fit and transform (requires binary target)
encoder.fit(df[['categorical_column']], df['target'])
df['encoded_column'] = encoder.transform(df[['categorical_column']])

# Manual implementation
def woe_encode(df, cat_col, target_col):
    # Calculate positive and negative counts per category
    positive = df.groupby(cat_col)[target_col].sum()
    negative = df.groupby(cat_col)[target_col].apply(lambda x: (x == 0).sum())
    
    # Calculate proportions
    total_positive = df[target_col].sum()
    total_negative = (df[target_col] == 0).sum()
    
    pct_positive = positive / total_positive
    pct_negative = negative / total_negative
    
    # Calculate WoE (with smoothing to avoid division by zero)
    woe = np.log((pct_positive + 0.5) / (pct_negative + 0.5))
    
    return df[cat_col].map(woe)`,
    effect: "Excellent for binary classification. Interpretable and commonly used in credit risk modeling.",
    category: "Target-Based",
    impact: "high",
    formula: "WoE = ln((% positive events) / (% negative events))",
  },
];

