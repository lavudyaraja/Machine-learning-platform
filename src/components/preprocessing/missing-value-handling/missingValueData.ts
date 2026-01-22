export interface MissingValueMethodInfo {
  id: string;
  title: string;
  definition: string;
  concept: string;
  usedFor: string;
  implementationInsight: string;
  effect: string;
  category: "imputation" | "deletion" | "statistical";
  icon: string;
}

export const missingValueData: MissingValueMethodInfo[] = [
  {
    id: "drop_rows",
    title: "Drop Rows with Missing Values",
    definition: "Removes entire rows that contain any missing values from the dataset.",
    concept: "This method completely eliminates rows where at least one column has a missing value. It's a simple deletion strategy that preserves data completeness but may result in significant data loss if missing values are common.",
    usedFor: "When missing values are random and sparse, when you have sufficient data to afford losing rows, or when missing values indicate invalid records.",
    implementationInsight: `import pandas as pd

# Drop rows with any missing values
df_cleaned = df.dropna()

# Or drop rows where all values are missing
df_cleaned = df.dropna(how='all')

# Drop rows with missing values in specific columns
df_cleaned = df.dropna(subset=['column1', 'column2'])`,
    effect: "Reduces dataset size but ensures complete data. May introduce bias if missing values are not random.",
    category: "deletion",
    icon: "🗑️",
  },
  {
    id: "drop_columns",
    title: "Drop Columns with Missing Values",
    definition: "Removes entire columns that contain missing values from the dataset.",
    concept: "This method eliminates columns that have any missing values. It's useful when a column has too many missing values to be useful or when the column is not critical for analysis.",
    usedFor: "When columns have excessive missing values (>50%), when columns are not essential for modeling, or when imputation would introduce significant bias.",
    implementationInsight: `import pandas as pd

# Drop columns with any missing values
df_cleaned = df.dropna(axis=1)

# Drop columns where all values are missing
df_cleaned = df.dropna(axis=1, how='all')

# Drop columns with missing values above a threshold
threshold = 0.5  # 50% missing
df_cleaned = df.dropna(axis=1, thresh=int(len(df) * (1 - threshold)))`,
    effect: "Preserves all rows but reduces feature space. May lose important information if dropped columns were relevant.",
    category: "deletion",
    icon: "🗑️",
  },
  {
    id: "mean",
    title: "Mean Imputation",
    definition: "Replaces missing values with the mean (average) of the available values in the column.",
    concept: "This method calculates the arithmetic mean of all non-missing values in a column and uses it to fill missing values. It's a simple statistical imputation technique that preserves the overall distribution.",
    usedFor: "When data is normally distributed, when missing values are random (MCAR), and when you want to preserve the sample size.",
    implementationInsight: `import pandas as pd
from sklearn.impute import SimpleImputer

# Using pandas
df['column'].fillna(df['column'].mean(), inplace=True)

# Using sklearn
imputer = SimpleImputer(strategy='mean')
df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)`,
    effect: "Preserves sample size and doesn't change the mean. May reduce variance and distort distributions if data is skewed.",
    category: "imputation",
    icon: "📊",
  },
  {
    id: "median",
    title: "Median Imputation",
    definition: "Replaces missing values with the median (middle value) of the available values in the column.",
    concept: "This method uses the median as the imputation value, which is less sensitive to outliers than the mean. The median is the value that separates the higher half from the lower half of the data.",
    usedFor: "When data contains outliers, when data is skewed, or when you want a robust imputation method.",
    implementationInsight: `import pandas as pd
from sklearn.impute import SimpleImputer

# Using pandas
df['column'].fillna(df['column'].median(), inplace=True)

# Using sklearn
imputer = SimpleImputer(strategy='median')
df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)`,
    effect: "Robust to outliers and preserves sample size. May not be optimal for normally distributed data.",
    category: "imputation",
    icon: "📈",
  },
  {
    id: "mode",
    title: "Mode Imputation",
    definition: "Replaces missing values with the most frequently occurring value (mode) in the column.",
    concept: "This method identifies the most common value in a column and uses it to fill missing values. For categorical data, it's particularly effective when there's a clear dominant category.",
    usedFor: "Categorical variables, when there's a clear most frequent value, or when missing values are likely to be similar to existing values.",
    implementationInsight: `import pandas as pd
from sklearn.impute import SimpleImputer

# Using pandas
df['column'].fillna(df['column'].mode()[0], inplace=True)

# Using sklearn for categorical
imputer = SimpleImputer(strategy='most_frequent')
df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)`,
    effect: "Works well for categorical data. May over-represent the most frequent value if many values are missing.",
    category: "imputation",
    icon: "🎯",
  },
  {
    id: "constant",
    title: "Constant Value Imputation",
    definition: "Replaces missing values with a predefined constant value specified by the user.",
    concept: "This method allows you to specify any constant value to fill missing values. It's useful when missing values have a specific meaning or when you want to flag missing values explicitly.",
    usedFor: "When missing values represent a specific state (e.g., 0 for 'not applicable'), when you want to preserve information about missingness, or for categorical data.",
    implementationInsight: `import pandas as pd
from sklearn.impute import SimpleImputer

# Using pandas
df['column'].fillna(0, inplace=True)  # Replace with 0
df['column'].fillna('Unknown', inplace=True)  # Replace with string

# Using sklearn
imputer = SimpleImputer(strategy='constant', fill_value=0)
df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)`,
    effect: "Preserves sample size and allows explicit handling of missingness. May introduce artificial patterns in the data.",
    category: "imputation",
    icon: "🔢",
  },
  {
    id: "std",
    title: "Standard Deviation (std)",
    definition: "Replaces missing values using the standard deviation of the column.",
    concept: "This method uses the standard deviation (a measure of data spread) as the imputation value. It's less common but can be useful in specific statistical contexts.",
    usedFor: "Specialized statistical applications where standard deviation has specific meaning.",
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate standard deviation
std_value = df['column'].std()

# Fill missing values
df['column'].fillna(std_value, inplace=True)`,
    effect: "Uses a statistical measure of spread. May not be as interpretable as mean or median.",
    category: "statistical",
    icon: "📉",
  },
  {
    id: "variance",
    title: "Variance-based Imputation",
    definition: "Replaces missing values using the variance of the column.",
    concept: "This method uses the variance (a measure of data variability) as the imputation value. Variance represents how spread out the data points are from the mean.",
    usedFor: "Advanced statistical applications where variance has specific analytical importance.",
    implementationInsight: `import pandas as pd

# Calculate variance
var_value = df['column'].var()

# Fill missing values
df['column'].fillna(var_value, inplace=True)`,
    effect: "Uses a statistical measure of variability. Less commonly used than mean or median imputation.",
    category: "statistical",
    icon: "📐",
  },
  {
    id: "q1",
    title: "25% (First Quartile – Q1)",
    definition: "Replaces missing values with the first quartile (25th percentile) of the column.",
    concept: "Quartiles divide the data into four equal parts. Q1 is the value below which 25% of the data falls. It's useful when you want to use a robust measure of central tendency that's not affected by extreme values.",
    usedFor: "When data contains outliers, when you want robust imputation, or in statistical analysis requiring quartile-based imputation.",
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate Q1 (25th percentile)
q1_value = df['column'].quantile(0.25)

# Fill missing values
df['column'].fillna(q1_value, inplace=True)

# Alternative using numpy
q1_value = np.percentile(df['column'].dropna(), 25)`,
    effect: "Robust to outliers in the upper range. Represents the lower quarter of the data distribution.",
    category: "statistical",
    icon: "1️⃣",
  },
  {
    id: "q2",
    title: "50% (Median – Q2)",
    definition: "Replaces missing values with the median (50th percentile, second quartile) of the column.",
    concept: "The median is the middle value when data is sorted. It's equivalent to Q2 and is highly robust to outliers. This method is essentially the same as median imputation.",
    usedFor: "Same as median imputation - when data contains outliers or is skewed.",
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate Q2 (50th percentile - median)
q2_value = df['column'].quantile(0.5)

# Fill missing values
df['column'].fillna(q2_value, inplace=True)

# Alternative using numpy
q2_value = np.percentile(df['column'].dropna(), 50)`,
    effect: "Same as median imputation - robust to outliers and preserves sample size.",
    category: "statistical",
    icon: "2️⃣",
  },
  {
    id: "q3",
    title: "75% (Third Quartile – Q3)",
    definition: "Replaces missing values with the third quartile (75th percentile) of the column.",
    concept: "Q3 is the value below which 75% of the data falls. It's useful when you want to impute with a higher value that represents the upper quarter of the data distribution.",
    usedFor: "When you want to impute with a higher representative value, or in statistical analysis requiring quartile-based imputation.",
    implementationInsight: `import pandas as pd
import numpy as np

# Calculate Q3 (75th percentile)
q3_value = df['column'].quantile(0.75)

# Fill missing values
df['column'].fillna(q3_value, inplace=True)

# Alternative using numpy
q3_value = np.percentile(df['column'].dropna(), 75)`,
    effect: "Robust to outliers in the lower range. Represents the upper quarter of the data distribution.",
    category: "statistical",
    icon: "3️⃣",
  },
];
