export interface AlgorithmInfo {
  id: string;
  title: string;
  definition: string;
  concept: string;
  usedFor: string;
  implementationInsight: string;
  effect: string;
  category: "algorithms" | "preprocessing" | "scaling" | "selection";
}

export const algorithmData: AlgorithmInfo[] = [
  {
    id: "knn",
    title: "K-Nearest Neighbors (KNN)",
    definition: "A distance-based algorithm that classifies data using nearest neighbors.",
    concept: "The model looks at the 'K' closest data points and predicts based on majority vote.",
    usedFor: "Small to medium datasets where feature scaling is important.",
    implementationInsight: `from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)
predictions = model.predict(X_test)`,
    effect: "Sensitive to feature scale and noisy data.",
    category: "algorithms",
  },
  {
    id: "standard-scaler",
    title: "Standardization (Z-score Scaling)",
    definition: "Transforms features to have mean=0 and standard deviation=1.",
    concept: "Centers the data by subtracting the mean, then scales by dividing by the standard deviation. Formula: z = (x - μ) / σ",
    usedFor: "Normally distributed data, linear models, neural networks, and PCA.",
    implementationInsight: `from sklearn.preprocessing import StandardScaler

scaler = StandardScaler(with_mean=True, with_std=True)
X_scaled = scaler.fit_transform(X)`,
    effect: "Preserves the shape of the original distribution while centering and scaling.",
    category: "scaling",
  },
  {
    id: "minmax-scaler",
    title: "Min-Max Scaling",
    definition: "Scales features to a fixed range, typically [0, 1].",
    concept: "Transforms features by scaling each feature to a given range. Formula: X_scaled = (X - X_min) / (X_max - X_min)",
    usedFor: "Bounded distributions, neural networks with sigmoid/tanh activations, and image processing.",
    implementationInsight: `from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler(feature_range=(0, 1))
X_scaled = scaler.fit_transform(X)`,
    effect: "Sensitive to outliers but provides bounded output values.",
    category: "scaling",
  },
  {
    id: "maxabs-scaler",
    title: "MaxAbs Scaling",
    definition: "Scales each feature by its maximum absolute value to range [-1, 1].",
    concept: "Divides each feature by its maximum absolute value. Preserves zeros and maintains sparsity. Formula: X_scaled = X / max(|X|)",
    usedFor: "Sparse matrices, text data (TF-IDF), and when zeros are meaningful.",
    implementationInsight: `from sklearn.preprocessing import MaxAbsScaler

scaler = MaxAbsScaler()
X_scaled = scaler.fit_transform(X)`,
    effect: "Preserves sparsity and sign of original values.",
    category: "scaling",
  },
  {
    id: "l1-normalization",
    title: "L1 Normalization",
    definition: "Normalizes samples to unit L1 norm (sum of absolute values equals 1).",
    concept: "Scales each sample so that the sum of absolute values equals 1. Formula: X_normalized = X / sum(|X|)",
    usedFor: "Text classification, feature selection with L1 regularization, and sparse high-dimensional data.",
    implementationInsight: `from sklearn.preprocessing import Normalizer

normalizer = Normalizer(norm='l1')
X_normalized = normalizer.fit_transform(X)`,
    effect: "Useful for sparse features and L1 regularization compatibility.",
    category: "scaling",
  },
  {
    id: "l2-normalization",
    title: "L2 Normalization",
    definition: "Normalizes samples to unit L2 norm (Euclidean length equals 1).",
    concept: "Scales each sample so that the Euclidean length equals 1. Formula: X_normalized = X / sqrt(sum(X²))",
    usedFor: "Cosine similarity calculations, text mining, document similarity, and neural network feature normalization.",
    implementationInsight: `from sklearn.preprocessing import Normalizer

normalizer = Normalizer(norm='l2')
X_normalized = normalizer.fit_transform(X)`,
    effect: "Essential for cosine similarity and direction-based algorithms.",
    category: "scaling",
  },
  {
    id: "random-forest",
    title: "Random Forest",
    definition: "An ensemble learning method that combines multiple decision trees.",
    concept: "Builds multiple decision trees on random subsets of data and features, then aggregates predictions through voting or averaging.",
    usedFor: "Classification and regression tasks, feature importance analysis, and handling non-linear relationships.",
    implementationInsight: `from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)
predictions = model.predict(X_test)`,
    effect: "Reduces overfitting compared to single decision trees and provides feature importance scores.",
    category: "algorithms",
  },
  {
    id: "logistic-regression",
    title: "Logistic Regression",
    definition: "A linear model for classification that uses logistic function to model probabilities.",
    concept: "Applies a logistic (sigmoid) function to a linear combination of features to predict class probabilities.",
    usedFor: "Binary and multiclass classification, interpretable models, and baseline comparisons.",
    implementationInsight: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
predictions = model.predict(X_test)`,
    effect: "Requires feature scaling for optimal performance and provides interpretable coefficients.",
    category: "algorithms",
  },
  {
    id: "svm",
    title: "Support Vector Machine (SVM)",
    definition: "A powerful classifier that finds the optimal hyperplane to separate classes.",
    concept: "Finds the maximum margin hyperplane that best separates different classes in the feature space.",
    usedFor: "Classification tasks, especially with clear margin of separation, and both linear and non-linear problems (with kernels).",
    implementationInsight: `from sklearn.svm import SVC

model = SVC(kernel='rbf', C=1.0)
model.fit(X_train, y_train)
predictions = model.predict(X_test)`,
    effect: "Sensitive to feature scaling and can be memory-intensive for large datasets.",
    category: "algorithms",
  },
  {
    id: "feature-selection",
    title: "Feature Selection",
    definition: "The process of selecting a subset of relevant features for model building.",
    concept: "Reduces dimensionality by identifying and removing irrelevant or redundant features, improving model performance and interpretability.",
    usedFor: "High-dimensional datasets, reducing overfitting, improving model interpretability, and reducing training time.",
    implementationInsight: `from sklearn.feature_selection import SelectKBest, f_classif

selector = SelectKBest(score_func=f_classif, k=10)
X_selected = selector.fit_transform(X, y)`,
    effect: "Reduces model complexity, improves generalization, and speeds up training.",
    category: "selection",
  },
  {
    id: "missing-values",
    title: "Missing Value Handling",
    definition: "Techniques to handle missing or null values in datasets.",
    concept: "Various strategies like mean/median imputation, forward fill, or dropping rows/columns to handle incomplete data.",
    usedFor: "Real-world datasets that often contain missing values due to data collection issues or errors.",
    implementationInsight: `from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)`,
    effect: "Ensures models can process complete datasets and prevents errors during training.",
    category: "preprocessing",
  },
  {
    id: "outlier-detection",
    title: "Outlier Detection",
    definition: "Identification and handling of data points that deviate significantly from the norm.",
    concept: "Uses statistical methods (IQR, Z-score) or machine learning techniques to identify anomalous data points.",
    usedFor: "Datasets with potential errors, anomalies, or extreme values that could skew model performance.",
    implementationInsight: `from sklearn.ensemble import IsolationForest

detector = IsolationForest(contamination=0.1)
outliers = detector.fit_predict(X)`,
    effect: "Improves model robustness by reducing the impact of extreme values on predictions.",
    category: "preprocessing",
  },
];

