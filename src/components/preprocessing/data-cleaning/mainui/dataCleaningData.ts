import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface DataCleaningMethodInfo extends MethodInfo {
  title: string;
  category: "Essential" | "Transform" | "Advanced";
  usedFor: string;
}

export const dataCleaningData: DataCleaningMethodInfo[] = [
  {
    id: "handling_missing_values",
    title: "Missing Values Handler",
    definition: "Detect and fill missing data points using various imputation strategies.",
    concept: "Identifies null, NaN, empty strings, or undefined values and applies statistical methods (mean, median, mode) or forward/backward fill strategies. For numerical columns, calculates mean (μ = Σ(x_i) / n), median (middle value), or mode (most frequent). For categorical columns, uses mode or constant values like 'Unknown'.",
    usedFor: "Any dataset with incomplete data, required before machine learning training, handling data collection gaps, or preprocessing pipelines.",
    implementationInsight: `from sklearn.impute import SimpleImputer
import pandas as pd

# Numerical imputation
imputer = SimpleImputer(strategy='mean')  # or 'median', 'most_frequent'
X_imputed = imputer.fit_transform(X)

# Using pandas
df['column'].fillna(df['column'].mean(), inplace=True)

# Forward fill
df.fillna(method='ffill', inplace=True)

# Backward fill
df.fillna(method='bfill', inplace=True)`,
    effect: "Ensures complete datasets for analysis and prevents errors during model training. May introduce bias if missing values are not random.",
    category: "Essential",
    impact: "high",
  },
  {
    id: "removing_duplicates",
    title: "Duplicate Remover",
    definition: "Eliminate redundant records based on selected columns or all columns.",
    concept: "Uses hash-based comparison (O(n) complexity) to identify duplicate rows. Can compare all columns for exact duplicates or selected columns for subset duplicates. Options include keeping first occurrence, last occurrence, or based on priority column (e.g., most recent timestamp).",
    usedFor: "Data entry errors, merged datasets with overlapping records, ETL processes, or removing redundant data from multiple sources.",
    implementationInsight: `import pandas as pd

# Remove exact duplicates (all columns)
df_cleaned = df.drop_duplicates()

# Remove duplicates based on specific columns
df_cleaned = df.drop_duplicates(subset=['column1', 'column2'])

# Keep last occurrence instead of first
df_cleaned = df.drop_duplicates(keep='last')

# Remove duplicates and reset index
df_cleaned = df.drop_duplicates().reset_index(drop=True)`,
    effect: "Reduces dataset size and prevents duplicate records from skewing analysis. Improves data quality and model performance.",
    category: "Essential",
    impact: "high",
  },
  {
    id: "fixing_inconsistent_data",
    title: "Consistency Fixer",
    definition: "Standardize inconsistent data formats and values across the dataset.",
    concept: "Detects and fixes case variations (USA, usa, Usa), format variations (01/01/2024 vs 2024-01-01), abbreviation variations (Street vs St vs St.), and whitespace variations. Creates canonical forms and mapping dictionaries, then applies standardization using fuzzy matching for similar values.",
    usedFor: "Categorical data with multiple representations, merged datasets from different sources, data entry inconsistencies, or preparing data for grouping/aggregation.",
    implementationInsight: `import pandas as pd

# Standardize case
df['column'] = df['column'].str.lower()

# Create mapping dictionary
mapping = {'usa': 'USA', 'uk': 'UK', 'st': 'Street'}
df['column'] = df['column'].map(mapping).fillna(df['column'])

# Remove extra whitespace
df['column'] = df['column'].str.strip().str.replace(r'\\s+', ' ', regex=True)

# Standardize formats
df['date'] = pd.to_datetime(df['date'], format='mixed')`,
    effect: "Improves data consistency and enables accurate grouping, filtering, and analysis. Reduces errors from format mismatches.",
    category: "Essential",
    impact: "medium",
  },
  {
    id: "correcting_data_types",
    title: "Type Corrector",
    definition: "Auto-detect and convert columns to appropriate data types.",
    concept: "Analyzes each column to detect current type (numeric → int/float, dates → datetime, boolean → bool). Detects type mismatches like numeric strings ('123' should be int), date strings ('2024-01-01' should be datetime), and boolean strings ('True'/'False' should be bool). Converts types using parseFloat(), parseInt(), or date parsing, handling errors gracefully.",
    usedFor: "CSV imports with incorrect types, API data with string representations, manual data entry, or preparing data for numerical operations.",
    implementationInsight: `import pandas as pd

# Auto-detect and convert types
df = df.convert_dtypes()

# Convert specific columns
df['numeric_col'] = pd.to_numeric(df['numeric_col'], errors='coerce')
df['date_col'] = pd.to_datetime(df['date_col'], errors='coerce')
df['bool_col'] = df['bool_col'].map({'True': True, 'False': False})

# Convert string numbers to numeric
df['column'] = df['column'].astype(float)

# Infer types
df = df.infer_objects()`,
    effect: "Ensures correct data types for operations and calculations. Prevents type-related errors and improves performance.",
    category: "Essential",
    impact: "medium",
  },
  {
    id: "null_column_dropper",
    title: "Null Column Dropper",
    definition: "Remove columns with excessive missing values (threshold-based).",
    concept: "Calculates null percentage for each column: null_percentage = (null_count / total_rows) * 100. Applies configurable threshold (default: 90%). If null_percentage >= threshold, the column is marked for removal. Reports removed columns and their null percentages.",
    usedFor: "Sparse datasets with many empty columns, feature selection, data quality improvement, or reducing dimensionality.",
    implementationInsight: `import pandas as pd

# Calculate null percentage
null_percentage = (df.isnull().sum() / len(df)) * 100

# Drop columns with more than 90% null values
threshold = 0.9
df_cleaned = df.dropna(axis=1, thresh=int(len(df) * (1 - threshold)))

# Or drop columns where all values are null
df_cleaned = df.dropna(axis=1, how='all')

# Custom threshold
df_cleaned = df.loc[:, df.isnull().mean() < 0.9]`,
    effect: "Reduces feature space and removes uninformative columns. May remove important information if threshold is too aggressive.",
    category: "Essential",
    impact: "medium",
  },
  {
    id: "whitespace_trimmer",
    title: "Whitespace Trimmer",
    definition: "Clean extra spaces from text data by removing leading, trailing, and normalizing internal whitespace.",
    concept: "Removes spaces, tabs, and newlines from start and end using trim(). Normalizes internal whitespace by replacing multiple spaces with single space and removing tabs/newlines within text, while preserving intentional spacing between words. Handles special cases like preserving whitespace in structured data (addresses).",
    usedFor: "Text data cleaning, user input normalization, data entry errors, or preparing text for analysis or matching.",
    implementationInsight: `import pandas as pd

# Trim leading and trailing whitespace
df['column'] = df['column'].str.strip()

# Remove all whitespace
df['column'] = df['column'].str.replace('\\s+', '', regex=True)

# Normalize internal whitespace (multiple spaces to single)
df['column'] = df['column'].str.replace(r'\\s+', ' ', regex=True)

# Trim all string columns
df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)`,
    effect: "Improves text consistency and enables accurate matching. Prevents errors from whitespace variations.",
    category: "Essential",
    impact: "low",
  },
  {
    id: "standardizing_text",
    title: "Text Normalizer",
    definition: "Fix case and text formatting inconsistencies in text data.",
    concept: "Standardizes text by converting to lowercase, uppercase, or title case. Handles special characters, accents, and formatting. Can normalize Unicode characters, remove accents, or standardize punctuation. Useful for preparing text data for analysis, matching, or machine learning.",
    usedFor: "Text preprocessing, data matching, preparing text for NLP models, or standardizing user input.",
    implementationInsight: `import pandas as pd
import unicodedata

# Convert to lowercase
df['column'] = df['column'].str.lower()

# Convert to uppercase
df['column'] = df['column'].str.upper()

# Title case
df['column'] = df['column'].str.title()

# Remove accents
df['column'] = df['column'].apply(lambda x: unicodedata.normalize('NFD', x).encode('ascii', 'ignore').decode('ascii'))

# Remove special characters
df['column'] = df['column'].str.replace(r'[^a-zA-Z0-9\\s]', '', regex=True)`,
    effect: "Improves text consistency and enables accurate text matching and analysis. Essential for text-based operations.",
    category: "Transform",
    impact: "low",
  },
  {
    id: "log_transformer",
    title: "Log Transformer",
    definition: "Transform skewed data to normal distribution using logarithmic transformation.",
    concept: "Applies logarithmic transformation to reduce skewness. Formulas: log(x) = ln(x) for natural log, log1p(x) = log(1 + x) for values near zero, or log10(x) for base-10. Requires all values > 0. Calculates skewness before/after: Skewness = 3 * (mean - median) / std. Inverse transformation available: exp(x).",
    usedFor: "Right-skewed data, multiplicative relationships, variance stabilization, or meeting normal distribution requirements for statistical tests.",
    implementationInsight: `import numpy as np
import pandas as pd

# Natural logarithm
df['column'] = np.log(df['column'])

# Log1p (handles zeros)
df['column'] = np.log1p(df['column'])

# Log10
df['column'] = np.log10(df['column'])

# Check for positive values first
df['column'] = np.log(df['column'] + 1)  # Add 1 if zeros exist

# Inverse transformation
df['original'] = np.exp(df['log_column'])`,
    effect: "Reduces skewness and stabilizes variance. Makes data more suitable for statistical analysis and linear models.",
    category: "Transform",
    impact: "medium",
  },
  {
    id: "date_time_parser",
    title: "Date-Time Parser",
    definition: "Convert different date formats to standard format (ISO 8601).",
    concept: "Detects and parses various date format patterns: ISO (2024-01-01, 2024-01-01T10:30:00), US (01/01/2024, 01-01-2024), EU (01/01/2024, 01.01.2024), and text formats (January 1, 2024, 1st Jan 2024). Standardizes to ISO 8601 format (YYYY-MM-DD HH:MM:SS). Extracts components like year, month, day, hour, minute, second, day of week, and week number. Handles timezones and invalid dates.",
    usedFor: "Time series analysis, feature engineering from dates, data integration from multiple sources, or preparing temporal data for analysis.",
    implementationInsight: `import pandas as pd

# Auto-parse dates
df['date'] = pd.to_datetime(df['date'], format='mixed')

# Parse specific format
df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')

# Extract components
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['day_of_week'] = df['date'].dt.dayofweek

# Handle multiple formats
df['date'] = pd.to_datetime(df['date'], errors='coerce', infer_datetime_format=True)`,
    effect: "Enables time-based analysis and feature engineering. Essential for time series modeling and temporal insights.",
    category: "Transform",
    impact: "high",
  },
  {
    id: "unit_converter",
    title: "Unit Converter",
    definition: "Convert measurement units to standard units (meters, kilograms, Celsius).",
    concept: "Detects unit type from column name or values: Length (meters, feet, inches, km, miles), Weight (kg, pounds, grams, ounces), Temperature (Celsius, Fahrenheit, Kelvin), Volume (liters, gallons, milliliters). Parses value and unit (e.g., '5.5 kg' → value=5.5, unit='kg'). Applies conversion formulas: Feet to Meters (m = ft * 0.3048), Pounds to Kg (kg = lb * 0.453592), Fahrenheit to Celsius (°C = (°F - 32) * 5/9).",
    usedFor: "International datasets with mixed units, merged data sources, standardization for analysis, or preparing data for comparison.",
    implementationInsight: `import pandas as pd

# Length conversions
def feet_to_meters(ft):
    return ft * 0.3048

# Weight conversions
def pounds_to_kg(lb):
    return lb * 0.453592

# Temperature conversions
def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

# Apply conversions
df['height_m'] = df['height_ft'].apply(feet_to_meters)
df['weight_kg'] = df['weight_lb'].apply(pounds_to_kg)
df['temp_c'] = df['temp_f'].apply(fahrenheit_to_celsius)`,
    effect: "Enables accurate comparison and analysis across different measurement systems. Essential for international datasets.",
    category: "Transform",
    impact: "medium",
  },
  {
    id: "handling_outliers",
    title: "Outlier Detector",
    definition: "Identify and handle anomalies using IQR (Interquartile Range) method.",
    concept: "Calculates quartiles: Q1 (25th percentile), Q2 (50th percentile/median), Q3 (75th percentile). Calculates IQR = Q3 - Q1. Defines outlier boundaries: Lower bound = Q1 - 1.5 * IQR, Upper bound = Q3 + 1.5 * IQR. Identifies outliers as values < Lower bound or > Upper bound. Handles outliers by removing, capping (replace with boundary values), or transforming (log/square root).",
    usedFor: "Anomaly detection, data quality improvement, model robustness, or removing data entry errors.",
    implementationInsight: `import numpy as np
import pandas as pd

# Calculate IQR
Q1 = df['column'].quantile(0.25)
Q3 = df['column'].quantile(0.75)
IQR = Q3 - Q1

# Define boundaries
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Remove outliers
df_cleaned = df[(df['column'] >= lower_bound) & (df['column'] <= upper_bound)]

# Cap outliers
df['column'] = df['column'].clip(lower=lower_bound, upper=upper_bound)

# Using z-score method
from scipy import stats
z_scores = np.abs(stats.zscore(df['column']))
df_cleaned = df[z_scores < 3]`,
    effect: "Improves data quality and model robustness. May remove valid extreme values if not careful.",
    category: "Advanced",
    impact: "high",
  },
  {
    id: "imbalance_handler",
    title: "Imbalance Handler",
    definition: "Handle class imbalance using techniques like SMOTE (Synthetic Minority Oversampling).",
    concept: "Calculates class distribution and identifies majority/minority classes. SMOTE creates synthetic samples for minority class by interpolating between nearest neighbors: new_sample = sample + random(0,1) * (neighbor - sample). Other strategies include undersampling (randomly remove majority class) or oversampling (duplicate minority class). Applies balancing to reach target ratio (e.g., 1:1).",
    usedFor: "Classification with imbalanced classes, fraud detection, medical diagnosis, or any scenario with unequal class distribution.",
    implementationInsight: `from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.combine import SMOTETomek

# SMOTE oversampling
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Undersampling
undersampler = RandomUnderSampler(random_state=42)
X_resampled, y_resampled = undersampler.fit_resample(X, y)

# Combined SMOTE + Tomek
smote_tomek = SMOTETomek(random_state=42)
X_resampled, y_resampled = smote_tomek.fit_resample(X, y)`,
    effect: "Improves model performance on minority classes. Prevents models from being biased toward majority class.",
    category: "Advanced",
    impact: "high",
  },
  {
    id: "skewness_fixer",
    title: "Skewness Fixer",
    definition: "Fix incorrect data distribution by transforming skewed data to normal distribution.",
    concept: "Calculates skewness: Skewness = 3 * (mean - median) / std. Positive = right-skewed (tail on right), Negative = left-skewed (tail on left). For right-skewed: applies Log (log(x) or log1p(x)), Square Root (√x), or Box-Cox ((x^λ - 1) / λ). For left-skewed: applies Square (x²), Exponential, or Inverse. Verifies skewness reduction (target: |skewness| < 0.5).",
    usedFor: "Normal distribution requirements, statistical tests, model assumptions, or preparing data for parametric tests.",
    implementationInsight: `import numpy as np
from scipy import stats
import pandas as pd

# Calculate skewness
skewness = 3 * (df['column'].mean() - df['column'].median()) / df['column'].std()

# Log transformation (right-skewed)
df['column'] = np.log1p(df['column'])

# Square root transformation
df['column'] = np.sqrt(df['column'])

# Box-Cox transformation (optimal lambda)
df['column'], fitted_lambda = stats.boxcox(df['column'])

# Square transformation (left-skewed)
df['column'] = df['column'] ** 2`,
    effect: "Makes data suitable for statistical tests requiring normal distribution. Improves model assumptions.",
    category: "Advanced",
    impact: "medium",
  },
  {
    id: "collinearity_remover",
    title: "Collinearity Remover",
    definition: "Remove highly correlated redundant columns to reduce multicollinearity.",
    concept: "Calculates correlation matrix using Pearson correlation: r = Σ((x-μx)(y-μy)) / (n*σx*σy), range -1 to +1. Identifies highly correlated pairs with threshold |r| > 0.8 or 0.9 (configurable). Selects columns to remove by keeping column with higher variance (more information), lower missing values, or first occurrence. Reports removed columns and correlation values.",
    usedFor: "Feature selection, multicollinearity reduction, model interpretability, or improving regression model stability.",
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate correlation matrix
corr_matrix = df.corr().abs()

# Find highly correlated pairs
threshold = 0.8
upper_triangle = corr_matrix.where(
    np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
)

# Find columns to drop
to_drop = [column for column in upper_triangle.columns if any(upper_triangle[column] > threshold)]

# Drop columns
df_cleaned = df.drop(columns=to_drop)

# Using variance inflation factor (VIF)
from statsmodels.stats.outliers_influence import variance_inflation_factor
vif_data = pd.DataFrame()
vif_data["feature"] = df.columns
vif_data["VIF"] = [variance_inflation_factor(df.values, i) for i in range(df.shape[1])]`,
    effect: "Reduces multicollinearity and improves model stability. May remove important features if threshold is too aggressive.",
    category: "Advanced",
    impact: "medium",
  },
  {
    id: "noisy_data_smoother",
    title: "Noisy Data Smoother",
    definition: "Reduce random fluctuations using smoothing techniques like moving average or binning.",
    concept: "Moving Average: smoothed[i] = (x[i-k] + ... + x[i] + ... + x[i+k]) / (2k+1) with window size (e.g., 3, 5, 7). Binning: Groups values into bins (equal-width: bins = (max - min) / bin_count, or equal-frequency: bins with same number of values), then replaces values with bin mean/median. Handles edge cases for beginning/end of series and empty bins.",
    usedFor: "Time series smoothing, noise reduction, trend identification, or preparing data for analysis by removing random fluctuations.",
    implementationInsight: `import pandas as pd
import numpy as np

# Moving average
window_size = 5
df['smoothed'] = df['column'].rolling(window=window_size, center=True).mean()

# Binning (equal-width)
num_bins = 10
df['binned'] = pd.cut(df['column'], bins=num_bins, labels=False)

# Binning (equal-frequency)
df['binned'] = pd.qcut(df['column'], q=num_bins, labels=False, duplicates='drop')

# Replace with bin mean
df['binned_mean'] = df.groupby('binned')['column'].transform('mean')

# Exponential smoothing
df['smoothed'] = df['column'].ewm(span=5, adjust=False).mean()`,
    effect: "Reduces noise and reveals underlying trends. May lose some detail in the process.",
    category: "Advanced",
    impact: "low",
  },
  {
    id: "handling_invalid_values",
    title: "Validation Check",
    definition: "Fix invalid entries by detecting and handling values that violate defined rules.",
    concept: "Defines validation rules: Range checks (min/max values), Type checks (expected data type), Format checks (regex patterns), Business rules (domain-specific constraints). Detects invalid values: Out of range, Type mismatch, Format mismatch (invalid email, phone), Negative values where not allowed. Handles by removing, replacing (with default/mean/median), or flagging (mark as invalid but keep).",
    usedFor: "Data quality assurance, input validation, error detection, or ensuring data meets business rules and constraints.",
    implementationInsight: `import pandas as pd
import numpy as np

# Range validation
df = df[(df['column'] >= min_value) & (df['column'] <= max_value)]

# Type validation
df = df[pd.to_numeric(df['column'], errors='coerce').notna()]

# Format validation (email)
import re
email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
df = df[df['email'].str.match(email_pattern, na=False)]

# Replace invalid values
df['column'] = df['column'].where(
    (df['column'] >= min_value) & (df['column'] <= max_value),
    df['column'].mean()
)

# Flag invalid values
df['is_valid'] = (df['column'] >= min_value) & (df['column'] <= max_value)`,
    effect: "Improves data quality and ensures data meets requirements. Prevents errors from invalid entries.",
    category: "Advanced",
    impact: "medium",
  },
  {
    id: "removing_irrelevant_features",
    title: "Feature Pruner",
    definition: "Remove irrelevant or unnecessary columns like constant columns, ID columns, or low variance features.",
    concept: "Identifies irrelevant features: Constant columns (all values same, variance = 0), ID columns (high cardinality, unique values ≈ total rows), Low variance (variance < threshold, e.g., 0.01 normalized), Manual selection (user-specified). Calculates feature importance: Variance = Σ(xi - x̄)² / n, Correlation with target (if available). Removes selected columns and reports reasons.",
    usedFor: "Feature selection, dimensionality reduction, model efficiency improvement, or removing uninformative columns.",
    implementationInsight: `import pandas as pd
import numpy as np

# Remove constant columns (zero variance)
constant_cols = [col for col in df.columns if df[col].nunique() <= 1]
df_cleaned = df.drop(columns=constant_cols)

# Remove ID columns (high cardinality)
id_cols = [col for col in df.columns if df[col].nunique() / len(df) > 0.9]
df_cleaned = df.drop(columns=id_cols)

# Remove low variance columns
threshold = 0.01
variances = df.var()
low_variance_cols = variances[variances < threshold].index
df_cleaned = df.drop(columns=low_variance_cols)

# Manual removal
df_cleaned = df.drop(columns=['id', 'uuid', 'row_number'])`,
    effect: "Reduces dimensionality and improves model efficiency. May remove important features if criteria are too strict.",
    category: "Advanced",
    impact: "low",
  },
];

