import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface DatasetSplittingMethodInfo extends MethodInfo {
  label: string;
  icon: string;
  useCases: string[];
  category: "Split Type" | "Split Method";
  formula?: string;
}

export const datasetSplittingData: DatasetSplittingMethodInfo[] = [
  {
    id: "train",
    label: "Training Set",
    icon: "📚",
    definition: "The portion of data used to train the machine learning model. The model learns patterns from this set.",
    concept: "The training set is the largest portion of your dataset (typically 60-80%) used to train the machine learning model. During training, the model learns the patterns, relationships, and features in the data. The model adjusts its parameters (weights, biases) based on the training data. A larger training set generally provides more examples for the model to learn from, but requires more computational resources.",
    useCases: [
      "Model training and parameter learning",
      "Feature learning in deep learning",
      "Building the initial model",
      "Learning data patterns and relationships",
      "Optimizing model parameters",
      "Primary dataset for model development"
    ],
    implementationInsight: `from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

# Basic train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42,
    shuffle=True
)

# Train-validation-test split
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.5,
    random_state=42
)

# Using pandas
train_size = 0.7
train_df = df.sample(frac=train_size, random_state=42)
test_df = df.drop(train_df.index)

# Stratified split (for classification)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y  # Preserves class distribution
)`,
    effect: "Largest portion of data for model training. Model learns patterns from this set. More data typically improves model performance but increases training time.",
    category: "Split Type",
    impact: "high",
    formula: "Train Size = N × train_ratio (typically 0.6-0.8)",
  },
  {
    id: "validation",
    label: "Validation Set",
    icon: "🔍",
    definition: "The portion of data used to tune hyperparameters and validate model performance during development. Not used for final training.",
    concept: "The validation set (typically 10-20% of data) is used during model development to tune hyperparameters, select features, and make decisions about model architecture. It helps prevent overfitting by providing an unbiased evaluation of the model on unseen data during development. The validation set is separate from both training and test sets, allowing you to iteratively improve the model without peeking at the test set.",
    useCases: [
      "Hyperparameter tuning",
      "Model selection and comparison",
      "Early stopping in neural networks",
      "Feature selection validation",
      "Model architecture decisions",
      "Preventing overfitting during development"
    ],
    implementationInsight: `from sklearn.model_selection import train_test_split
import pandas as pd

# Three-way split: train, validation, test
# First split: separate test set
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# Second split: separate train and validation
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val,
    test_size=0.2,  # 20% of remaining = 16% of total
    random_state=42
)

# Using K-Fold for validation
from sklearn.model_selection import KFold
kf = KFold(n_splits=5, shuffle=True, random_state=42)
for train_idx, val_idx in kf.split(X):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

# Time series split
from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, val_idx in tscv.split(X):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]`,
    effect: "Used for model development and hyperparameter tuning. Prevents overfitting by providing unbiased evaluation. Separate from test set to avoid data leakage.",
    category: "Split Type",
    impact: "high",
    formula: "Validation Size = N × validation_ratio (typically 0.1-0.2)",
  },
  {
    id: "test",
    label: "Test Set",
    icon: "🎯",
    definition: "The portion of data held out for final model evaluation. Only used once at the end to assess final model performance.",
    concept: "The test set (typically 10-20% of data) is the final, untouched portion of your dataset used only once to evaluate the fully trained and tuned model. It provides an unbiased estimate of how the model will perform on new, unseen data. The test set should never be used during training, validation, or hyperparameter tuning. It's your final check before deploying the model to production.",
    useCases: [
      "Final model evaluation",
      "Unbiased performance estimation",
      "Model comparison and selection",
      "Production readiness assessment",
      "Reporting final metrics",
      "One-time evaluation before deployment"
    ],
    implementationInsight: `from sklearn.model_selection import train_test_split
import pandas as pd

# Standard train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,  # 20% for testing
    random_state=42,
    shuffle=True
)

# Three-way split
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.5,  # 50% of 30% = 15% total
    random_state=42
)

# Important: Never use test set during development
# Only evaluate final model once on test set
final_score = model.score(X_test, y_test)

# Using pandas
test_size = 0.2
test_df = df.sample(frac=test_size, random_state=42)
train_df = df.drop(test_df.index)`,
    effect: "Final evaluation set, used only once. Provides unbiased estimate of model performance. Critical for assessing production readiness. Never use during development.",
    category: "Split Type",
    impact: "high",
    formula: "Test Size = N × test_ratio (typically 0.1-0.2)",
  },
  {
    id: "train_val",
    label: "Train-Validation Split",
    icon: "🔄",
    definition: "Standard random split method. Randomly divides data into training and validation sets without preserving class distribution.",
    concept: "Train-validation split is the standard random splitting method that randomly divides your dataset into training and validation sets. It doesn't preserve any specific distribution (like class distribution in classification). This method is suitable for regression tasks, balanced classification datasets, or when class distribution preservation is not critical. The split is random but reproducible when using a fixed random_state.",
    useCases: [
      "Regression tasks",
      "Balanced classification datasets",
      "When class distribution is not critical",
      "General machine learning tasks",
      "Time-agnostic data splitting",
      "Standard model development workflow"
    ],
    implementationInsight: `from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

# Basic train-validation split
X_train, X_val, y_train, y_val = train_test_split(
    X, y,
    test_size=0.2,  # 20% for validation
    random_state=42,
    shuffle=True
)

# Custom split ratios
train_size = 0.7
val_size = 0.15
test_size = 0.15

# First split: train vs temp
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=(val_size + test_size),
    random_state=42,
    shuffle=True
)

# Second split: validation vs test
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=(test_size / (val_size + test_size)),
    random_state=42,
    shuffle=True
)

# Using pandas
train_df = df.sample(frac=0.7, random_state=42)
remaining = df.drop(train_df.index)
val_df = remaining.sample(frac=0.5, random_state=42)
test_df = remaining.drop(val_df.index)`,
    effect: "Standard random split suitable for most tasks. Simple and fast. Doesn't preserve class distribution. Good for regression and balanced datasets.",
    category: "Split Method",
    impact: "medium",
    formula: "Random split with train_size + val_size + test_size = 1.0",
  },
  {
    id: "stratified",
    label: "Stratified Split",
    icon: "⚖️",
    definition: "Preserves class distribution across splits. Ensures each split has the same proportion of classes as the original dataset.",
    concept: "Stratified splitting ensures that the proportion of classes in each split (train, validation, test) matches the proportion in the original dataset. This is crucial for imbalanced classification problems where some classes are rare. Without stratification, a random split might result in splits with very few examples of rare classes, making it difficult to train and evaluate the model properly. Stratified splitting is essential for classification tasks with imbalanced classes.",
    useCases: [
      "Imbalanced classification datasets",
      "When class distribution matters",
      "Rare class preservation",
      "Classification tasks",
      "Ensuring representative splits",
      "Medical diagnosis, fraud detection"
    ],
    implementationInsight: `from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

# Stratified train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y  # Preserves class distribution
)

# Stratified three-way split
# First split: separate test set with stratification
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Second split: separate train and validation with stratification
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val,
    test_size=0.2,
    random_state=42,
    stratify=y_train_val
)

# Verify class distribution
print("Original:", y.value_counts(normalize=True))
print("Train:", y_train.value_counts(normalize=True))
print("Test:", y_test.value_counts(normalize=True))

# Using StratifiedKFold for cross-validation
from sklearn.model_selection import StratifiedKFold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
for train_idx, val_idx in skf.split(X, y):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]`,
    effect: "Preserves class distribution across all splits. Essential for imbalanced datasets. Ensures representative splits. Critical for classification tasks with rare classes.",
    category: "Split Method",
    impact: "high",
    formula: "Each split maintains: P(class_i in split) = P(class_i in original)",
  },
];

