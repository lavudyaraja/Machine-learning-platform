export interface CleaningMethod {
  value: string;
  label: string;
  desc: string;
  category: "Essential" | "Transform" | "Advanced";
  impact: "high" | "medium" | "low";
}

export const cleaningMethods: CleaningMethod[] = [
  // Essential Methods (Fundamental Cleaning)
  
  /**
   * # Missing Values Logic
   * 
   * Algorithm: Multiple imputation strategies for handling missing/null values
   * 
   * Implementation Steps:
   * 1. Detect missing values: Identify null, NaN, empty strings, or undefined values
   * 2. Calculate statistics for numerical columns:
   *    - Mean: Average of all non-null values (sum(values) / count)
   *    - Median: Middle value when sorted (Q2 quartile)
   *    - Mode: Most frequently occurring value
   *    - Forward Fill: Use previous row's value
   *    - Backward Fill: Use next row's value
   *    - Interpolation: Linear interpolation between adjacent values
   * 3. For categorical columns:
   *    - Mode: Most frequent category
   *    - Constant: Fill with fixed value (e.g., "Unknown", "N/A")
   *    - Missing Indicator: Create new column indicating missing status
   * 4. Apply selected strategy column-wise
   * 5. Track imputed values for reporting
   * 
   * Formula Examples:
   * - Mean: μ = Σ(x_i) / n
   * - Median: middle value of sorted array
   * - Mode: argmax(frequency(x))
   * 
   * Use Cases: Any dataset with incomplete data, required before ML training
   */
  { 
    value: "handling_missing_values", 
    label: "Missing Values Handler", 
    desc: "Detect and fill missing data points", 
    category: "Essential", 
    impact: "high" 
  },
  /**
   * # Duplicate Removal Logic
   * 
   * Algorithm: Identify and remove duplicate rows based on selected columns or all columns
   * 
   * Implementation Steps:
   * 1. Identify duplicate rows:
   *    - Option A: Compare all columns (exact duplicates)
   *    - Option B: Compare selected columns (subset duplicates)
   * 2. Determine which duplicate to keep:
   *    - Keep first occurrence (default)
   *    - Keep last occurrence
   *    - Keep based on priority column (e.g., most recent timestamp)
   * 3. Remove duplicates using hash-based comparison for efficiency
   * 4. Track removed row count and indices
   * 
   * Algorithm Complexity: O(n) using hash map for comparison
   * 
   * Use Cases: Data entry errors, merged datasets, ETL processes
   */
  { 
    value: "removing_duplicates", 
    label: "Duplicate Remover", 
    desc: "Eliminate redundant records", 
    category: "Essential", 
    impact: "high" 
  },
  /**
   * # Consistency Fixer Logic
   * 
   * Algorithm: Standardize inconsistent data formats and values
   * 
   * Implementation Steps:
   * 1. Detect inconsistencies:
   *    - Case variations (e.g., "USA", "usa", "Usa")
   *    - Format variations (e.g., "01/01/2024" vs "2024-01-01")
   *    - Abbreviation variations (e.g., "Street" vs "St" vs "St.")
   *    - Whitespace variations (e.g., "New York" vs "New  York")
   * 2. Create standardization rules:
   *    - Define canonical forms for each category
   *    - Create mapping dictionary (e.g., {"usa": "USA", "uk": "UK"})
   * 3. Apply standardization:
   *    - Replace variations with canonical form
   *    - Use fuzzy matching for similar values
   * 4. Validate consistency after transformation
   * 
   * Use Cases: Categorical data with multiple representations, merged datasets
   */
  { 
    value: "fixing_inconsistent_data", 
    label: "Consistency Fixer", 
    desc: "Standardize data formats", 
    category: "Essential", 
    impact: "medium" 
  },
  /**
   * # Data Type Correction Logic
   * 
   * Algorithm: Auto-detect and convert columns to appropriate data types
   * 
   * Implementation Steps:
   * 1. Analyze each column to detect current type:
   *    - Check if all values are numeric → int/float
   *    - Check if all values are dates → datetime
   *    - Check if all values are boolean → bool
   *    - Default → string/object
   * 2. Detect type mismatches:
   *    - Numeric strings (e.g., "123" should be int)
   *    - Date strings (e.g., "2024-01-01" should be datetime)
   *    - Boolean strings (e.g., "True"/"False" should be bool)
   * 3. Convert types:
   *    - String to numeric: parseFloat() or parseInt()
   *    - String to datetime: parse date formats (ISO, US, EU formats)
   *    - String to boolean: map "true"/"false", "yes"/"no", "1"/"0"
   * 4. Handle conversion errors gracefully (keep original if conversion fails)
   * 
   * Use Cases: CSV imports, API data, manual data entry
   */
  { 
    value: "correcting_data_types", 
    label: "Type Corrector", 
    desc: "Fix incorrect data types", 
    category: "Essential", 
    impact: "medium" 
  },
  /**
   * # Null Column Dropper Logic
   * 
   * Algorithm: Remove columns with excessive missing values (threshold-based)
   * 
   * Implementation Steps:
   * 1. Calculate null percentage for each column:
   *    - null_percentage = (null_count / total_rows) * 100
   * 2. Apply threshold (default: 90%):
   *    - If null_percentage >= threshold → mark for removal
   *    - Configurable threshold (e.g., 50%, 75%, 90%)
   * 3. Remove columns exceeding threshold
   * 4. Report removed columns and their null percentages
   * 
   * Formula: null_percentage = (count(null_values) / total_rows) * 100
   * 
   * Use Cases: Sparse datasets, feature selection, data quality improvement
   */
  { 
    value: "null_column_dropper", 
    label: "Null Column Dropper", 
    desc: "Remove columns with more than 90% empty values", 
    category: "Essential", 
    impact: "medium" 
  },
  /**
   * # Whitespace Trimmer Logic
   * 
   * Algorithm: Remove leading, trailing, and normalize internal whitespace
   * 
   * Implementation Steps:
   * 1. Trim leading/trailing whitespace:
   *    - Remove spaces, tabs, newlines from start and end
   *    - Use trim() function
   * 2. Normalize internal whitespace:
   *    - Replace multiple spaces with single space
   *    - Remove tabs and newlines within text
   *    - Preserve intentional spacing (e.g., between words)
   * 3. Handle special cases:
   *    - Preserve whitespace in structured data (e.g., addresses)
   *    - Option to preserve single newlines
   * 
   * Use Cases: Text data cleaning, user input normalization, data entry errors
   */
  { 
    value: "whitespace_trimmer", 
    label: "Whitespace Trimmer", 
    desc: "Clean extra spaces from text data", 
    category: "Essential", 
    impact: "low" 
  },
  
  // Transform Methods (Data Engineering)
  

  { 
    value: "standardizing_text", 
    label: "Text Normalizer", 
    desc: "Fix case and text formatting", 
    category: "Transform", 
    impact: "low" 
  },
  /**
   * # Log Transformation Logic
   * 
   * Algorithm: Apply logarithmic transformation to reduce skewness
   * 
   * Implementation Steps:
   * 1. Check data validity:
   *    - Ensure all values > 0 (log requires positive values)
   *    - Handle zeros: add small constant (log1p) or skip
   * 2. Apply transformation:
   *    - Natural Log: log(x) = ln(x)
   *    - Log1p: log(1 + x) (handles zeros)
   *    - Log10: log₁₀(x)
   * 3. Calculate skewness before/after:
   *    - Skewness = 3 * (mean - median) / std
   * 4. Inverse transformation available: exp(x)
   * 
   * Formulas:
   * - log(x): Natural logarithm
   * - log1p(x): log(1 + x) for values near zero
   * 
   * Use Cases: Right-skewed data, multiplicative relationships, variance stabilization
   */
  { 
    value: "log_transformer", 
    label: "Log Transformer", 
    desc: "Transform skewed data to normal distribution", 
    category: "Transform", 
    impact: "medium" 
  },
  /**
   * # Date-Time Parser Logic
   * 
   * Algorithm: Parse and standardize various date/time formats
   * 
   * Implementation Steps:
   * 1. Detect date format patterns:
   *    - ISO: "2024-01-01", "2024-01-01T10:30:00"
   *    - US: "01/01/2024", "01-01-2024"
   *    - EU: "01/01/2024", "01.01.2024"
   *    - Text: "January 1, 2024", "1st Jan 2024"
   * 2. Parse dates using multiple format attempts
   * 3. Standardize to ISO 8601 format: "YYYY-MM-DD HH:MM:SS"
   * 4. Extract components:
   *    - Year, Month, Day
   *    - Hour, Minute, Second
   *    - Day of week, Week number
   * 5. Handle timezones and invalid dates
   * 
   * Use Cases: Time series analysis, feature engineering, data integration
   */
  { 
    value: "date_time_parser", 
    label: "Date-Time Parser", 
    desc: "Convert different date formats to standard format", 
    category: "Transform", 
    impact: "high" 
  },
  /**
   * # Unit Converter Logic
   * 
   * Algorithm: Convert measurement units to standard units
   * 
   * Implementation Steps:
   * 1. Detect unit type from column name or values:
   *    - Length: meters, feet, inches, km, miles
   *    - Weight: kg, pounds, grams, ounces
   *    - Temperature: Celsius, Fahrenheit, Kelvin
   *    - Volume: liters, gallons, milliliters
   * 2. Parse value and unit (e.g., "5.5 kg" → value=5.5, unit="kg")
   * 3. Apply conversion formula:
   *    - Length: meters (standard)
   *    - Weight: kilograms (standard)
   *    - Temperature: Celsius (standard)
   * 4. Convert all values to standard unit
   * 
   * Conversion Examples:
   * - Feet to Meters: m = ft * 0.3048
   * - Pounds to Kg: kg = lb * 0.453592
   * - Fahrenheit to Celsius: °C = (°F - 32) * 5/9
   * 
   * Use Cases: International datasets, merged data sources, standardization
   */
  { 
    value: "unit_converter", 
    label: "Unit Converter", 
    desc: "Convert measurements to standard units", 
    category: "Transform", 
    impact: "medium" 
  },
  
  // Advanced Methods (Statistical Cleaning)
  
  /**
   * # Outlier Detection Logic
   * 
   * Algorithm: Identify and handle statistical outliers using IQR method
   * 
   * Implementation Steps:
   * 1. Calculate quartiles:
   *    - Q1 (25th percentile): median of lower half
   *    - Q2 (50th percentile): median (middle value)
   *    - Q3 (75th percentile): median of upper half
   * 2. Calculate IQR (Interquartile Range):
   *    - IQR = Q3 - Q1
   * 3. Define outlier boundaries:
   *    - Lower bound = Q1 - 1.5 * IQR
   *    - Upper bound = Q3 + 1.5 * IQR
   * 4. Identify outliers:
   *    - Values < Lower bound or > Upper bound
   * 5. Handle outliers:
   *    - Remove: Delete outlier rows
   *    - Cap: Replace with boundary values
   *    - Transform: Apply log/square root
   * 
   * Formula: Outlier if x < (Q1 - 1.5*IQR) or x > (Q3 + 1.5*IQR)
   * 
   * Use Cases: Anomaly detection, data quality, model robustness
   */
  { 
    value: "handling_outliers", 
    label: "Outlier Detector", 
    desc: "Identify and handle anomalies", 
    category: "Advanced", 
    impact: "high" 
  },
  /**
   * # Class Imbalance Handler Logic
   * 
   * Algorithm: Balance class distribution using oversampling/undersampling
   * 
   * Implementation Steps:
   * 1. Calculate class distribution:
   *    - Count samples per class
   *    - Identify majority and minority classes
   *    - Calculate imbalance ratio
   * 2. Choose strategy:
   *    - SMOTE (Synthetic Minority Oversampling):
   *      * Create synthetic samples for minority class
   *      * Interpolate between nearest neighbors
   *      * Formula: new_sample = sample + random(0,1) * (neighbor - sample)
   *    - Undersampling: Randomly remove majority class samples
   *    - Oversampling: Duplicate minority class samples
   * 3. Apply balancing to reach target ratio (e.g., 1:1)
   * 4. Validate balanced distribution
   * 
   * SMOTE Algorithm:
   * - Find k nearest neighbors for each minority sample
   * - Generate synthetic samples along line segments
   * - Preserve class distribution characteristics
   * 
   * Use Cases: Classification with imbalanced classes, fraud detection, medical diagnosis
   */
  { 
    value: "imbalance_handler", 
    label: "Imbalance Handler", 
    desc: "Handle class imbalance using techniques like SMOTE", 
    category: "Advanced", 
    impact: "high" 
  },
  /**
   * # Skewness Fixer Logic
   * 
   * Algorithm: Transform skewed distributions to normal distribution
   * 
   * Implementation Steps:
   * 1. Calculate skewness:
   *    - Skewness = 3 * (mean - median) / std
   *    - Positive: Right-skewed (tail on right)
   *    - Negative: Left-skewed (tail on left)
   * 2. Choose transformation based on skewness:
   *    - Right-skewed: Log, Square root, Box-Cox
   *    - Left-skewed: Square, Exponential, Inverse
   * 3. Apply transformation:
   *    - Log: log(x) or log1p(x)
   *    - Square Root: √x
   *    - Box-Cox: (x^λ - 1) / λ (optimal λ)
   * 4. Verify skewness reduction (target: |skewness| < 0.5)
   * 
   * Formulas:
   * - Skewness: γ = 3(μ - median) / σ
   * - Log: y = log(x) for right-skewed
   * - Square Root: y = √x for moderate right-skew
   * 
   * Use Cases: Normal distribution requirements, statistical tests, model assumptions
   */
  { 
    value: "skewness_fixer", 
    label: "Skewness Fixer", 
    desc: "Fix incorrect data distribution", 
    category: "Advanced", 
    impact: "medium" 
  },
  /**
   * # Collinearity Removal Logic
   * 
   * Algorithm: Detect and remove highly correlated redundant features
   * 
   * Implementation Steps:
   * 1. Calculate correlation matrix:
   *    - Pearson correlation: r = Σ((x-μx)(y-μy)) / (n*σx*σy)
   *    - Range: -1 to +1
   * 2. Identify highly correlated pairs:
   *    - Threshold: |r| > 0.8 or 0.9 (configurable)
   *    - Find pairs with correlation above threshold
   * 3. Select columns to remove:
   *    - Keep column with higher variance (more information)
   *    - Or keep column with lower missing values
   *    - Or keep first occurrence
   * 4. Remove redundant columns
   * 5. Report removed columns and correlation values
   * 
   * Formula: r = Σ((xi - x̄)(yi - ȳ)) / √(Σ(xi - x̄)² * Σ(yi - ȳ)²)
   * 
   * Use Cases: Feature selection, multicollinearity reduction, model interpretability
   */
  { 
    value: "collinearity_remover", 
    label: "Collinearity Remover", 
    desc: "Remove highly correlated redundant columns", 
    category: "Advanced", 
    impact: "medium" 
  },
  /**
   * # Noisy Data Smoother Logic
   * 
   * Algorithm: Reduce random fluctuations using smoothing techniques
   * 
   * Implementation Steps:
   * 1. Choose smoothing method:
   *    - Moving Average: Average of n consecutive values
   *      * Formula: smoothed[i] = (x[i-k] + ... + x[i] + ... + x[i+k]) / (2k+1)
   *    - Binning: Group values into bins, replace with bin mean/median
   *      * Equal-width: bins = (max - min) / bin_count
   *      * Equal-frequency: bins with same number of values
   * 2. Apply smoothing:
   *    - Moving Average: Window size (e.g., 3, 5, 7)
   *    - Binning: Number of bins (e.g., 5, 10, 20)
   * 3. Handle edge cases:
   *    - Beginning/end of series for moving average
   *    - Empty bins
   * 
   * Formulas:
   * - Moving Average: MA = (x[t-k] + ... + x[t] + ... + x[t+k]) / (2k+1)
   * - Binning: Replace values in bin with bin_mean or bin_median
   * 
   * Use Cases: Time series smoothing, noise reduction, trend identification
   */
  { 
    value: "noisy_data_smoother", 
    label: "Noisy Data Smoother", 
    desc: "Reduce random fluctuations using binning", 
    category: "Advanced", 
    impact: "low" 
  },
  /**
   * # Invalid Value Handling Logic
   * 
   * Algorithm: Detect and fix invalid data entries
   * 
   * Implementation Steps:
   * 1. Define validation rules:
   *    - Range checks: min/max values
   *    - Type checks: expected data type
   *    - Format checks: regex patterns
   *    - Business rules: domain-specific constraints
   * 2. Detect invalid values:
   *    - Out of range: values outside [min, max]
   *    - Type mismatch: string in numeric column
   *    - Format mismatch: invalid email, phone, etc.
   *    - Negative values where not allowed
   * 3. Handle invalid entries:
   *    - Remove: Delete invalid rows
   *    - Replace: Fill with default/mean/median
   *    - Flag: Mark as invalid but keep
   * 4. Report invalid entries with reasons
   * 
   * Use Cases: Data quality assurance, input validation, error detection
   */
  { 
    value: "handling_invalid_values", 
    label: "Validation Check", 
    desc: "Fix invalid entries", 
    category: "Advanced", 
    impact: "medium" 
  },
  /**
   * # Feature Pruner Logic
   * 
   * Algorithm: Remove irrelevant or unnecessary columns
   * 
   * Implementation Steps:
   * 1. Identify irrelevant features:
   *    - Constant columns: All values same (zero variance)
   *    - ID columns: Unique identifiers (e.g., row IDs, UUIDs)
   *    - Low variance: Variance below threshold
   *    - Manual selection: User-specified columns
   * 2. Calculate feature importance (optional):
   *    - Variance: var = Σ(xi - x̄)² / n
   *    - Correlation with target (if available)
   * 3. Remove selected columns:
   *    - Constant: variance = 0
   *    - ID: High cardinality (unique values ≈ total rows)
   *    - Low variance: variance < threshold
   * 4. Report removed columns and reasons
   * 
   * Criteria:
   * - Constant: All values identical
   * - ID: Cardinality > 90% of rows
   * - Low variance: Variance < 0.01 (normalized)
   * 
   * Use Cases: Feature selection, dimensionality reduction, model efficiency
   */
  { 
    value: "removing_irrelevant_features", 
    label: "Feature Pruner", 
    desc: "Remove unnecessary columns", 
    category: "Advanced", 
    impact: "low" 
  },
];

export const categories = ["all", "Essential", "Transform", "Advanced"] as const;

export const impactColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200"
} as const;

/**
 * Get cleaning method by value
 */
export const getCleaningMethod = (value: string): CleaningMethod | undefined => {
  return cleaningMethods.find(method => method.value === value);
};

/**
 * Get methods by category
 */
export const getMethodsByCategory = (category: string): CleaningMethod[] => {
  if (category === "all") return cleaningMethods;
  return cleaningMethods.filter(method => method.category === category);
};

/**
 * Get methods by impact level
 */
export const getMethodsByImpact = (impact: "high" | "medium" | "low"): CleaningMethod[] => {
  return cleaningMethods.filter(method => method.impact === impact);
};

/**
 * Filter methods by search query
 */
export const filterMethods = (
  methods: CleaningMethod[],
  searchQuery: string,
  category: string = "all"
): CleaningMethod[] => {
  const matchesSearch = (method: CleaningMethod) => 
    method.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.desc.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesCategory = (method: CleaningMethod) => 
    category === "all" || method.category === category;
  
  return methods.filter(method => matchesSearch(method) && matchesCategory(method));
};

