import type { MethodInfo } from "@/components/common/MethodTooltipDialog";

export interface FeatureExtractionMethodInfo extends MethodInfo {
  label: string;
  icon: string;
  useCases: string[];
  category: "Linear" | "Supervised" | "Matrix Factorization" | "Latent Variables";
  formula?: string;
}

export const featureExtractionData: FeatureExtractionMethodInfo[] = [
  {
    id: "pca",
    label: "Principal Component Analysis (PCA)",
    icon: "📊",
    definition: "Reduces dimensionality while preserving maximum variance. Transforms data into principal components that capture the most information.",
    concept: "PCA finds the directions (principal components) in which the data varies the most. It projects the data onto these directions, creating new features that are linear combinations of the original features. The first principal component captures the maximum variance, the second captures the next most variance (orthogonal to the first), and so on. This allows reducing dimensions while retaining most of the information.",
    useCases: [
      "High-dimensional data visualization (reduce to 2D/3D)",
      "Noise reduction in datasets",
      "Feature compression for machine learning",
      "Multicollinearity removal",
      "Data preprocessing before clustering",
      "Image compression and denoising"
    ],
    implementationInsight: `from sklearn.decomposition import PCA
import pandas as pd
import numpy as np

# Initialize PCA
pca = PCA(n_components=2, random_state=42)

# Fit and transform
X_pca = pca.fit_transform(X)

# Explained variance ratio
explained_variance = pca.explained_variance_ratio_
cumulative_variance = np.cumsum(explained_variance)

# Determine optimal number of components (e.g., 95% variance)
pca_95 = PCA(n_components=0.95)  # Keep 95% variance
X_pca_95 = pca_95.fit_transform(X)

# Inverse transform (reconstruction)
X_reconstructed = pca.inverse_transform(X_pca)

# Using pandas
df_pca = pd.DataFrame(X_pca, columns=[f'PC{i+1}' for i in range(X_pca.shape[1])])`,
    effect: "Reduces dimensionality while preserving maximum variance. Creates orthogonal components that are uncorrelated. Useful for visualization and noise reduction.",
    category: "Linear",
    impact: "high",
    formula: "PC = X × W, where W is the eigenvector matrix",
  },
  {
    id: "lda",
    label: "Linear Discriminant Analysis (LDA)",
    icon: "🎯",
    definition: "Maximizes class separability for classification tasks. Projects data to maximize between-class variance while minimizing within-class variance.",
    concept: "LDA is a supervised dimensionality reduction technique that finds linear combinations of features that best separate classes. Unlike PCA which maximizes variance, LDA maximizes the ratio of between-class variance to within-class variance. This makes it ideal for classification tasks as it explicitly considers class labels to find the most discriminative directions.",
    useCases: [
      "Classification with high-dimensional features",
      "Face recognition systems",
      "Text classification",
      "Biometric identification",
      "Multi-class classification problems",
      "When class separation is important"
    ],
    implementationInsight: `from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
import pandas as pd
import numpy as np

# Initialize LDA (requires target labels)
lda = LinearDiscriminantAnalysis(n_components=2)

# Fit and transform (requires y labels)
X_lda = lda.fit_transform(X, y)

# For classification, use as classifier
lda_classifier = LinearDiscriminantAnalysis()
lda_classifier.fit(X_train, y_train)
predictions = lda_classifier.predict(X_test)

# Explained variance ratio (for dimensionality reduction)
explained_variance = lda.explained_variance_ratio_

# Using pandas
df_lda = pd.DataFrame(X_lda, columns=[f'LD{i+1}' for i in range(X_lda.shape[1])])`,
    effect: "Maximizes class separability, making it ideal for classification. Reduces dimensions while preserving class-discriminative information. Requires labeled data.",
    category: "Supervised",
    impact: "high",
    formula: "LD = X × W, where W maximizes between-class / within-class variance",
  },
  {
    id: "ica",
    label: "Independent Component Analysis (ICA)",
    icon: "🔀",
    definition: "Separates multivariate signals into independent components. Assumes sources are statistically independent and non-Gaussian.",
    concept: "ICA assumes that observed data is a linear mixture of independent source signals. It finds the unmixing matrix that separates these sources. Unlike PCA which finds orthogonal components, ICA finds statistically independent components. This makes it useful for blind source separation problems where you want to separate mixed signals.",
    useCases: [
      "Signal processing and source separation",
      "EEG/MEG signal analysis",
      "Image feature extraction",
      "Audio signal separation",
      "Removing artifacts from data",
      "Feature extraction from mixed signals"
    ],
    implementationInsight: `from sklearn.decomposition import FastICA
import pandas as pd
import numpy as np

# Initialize ICA
ica = FastICA(n_components=2, random_state=42, max_iter=1000, tol=0.0001)

# Fit and transform
X_ica = ica.fit_transform(X)

# Reconstruct original signal
X_reconstructed = ica.inverse_transform(X_ica)

# Get mixing matrix
mixing_matrix = ica.mixing_

# Using pandas
df_ica = pd.DataFrame(X_ica, columns=[f'IC{i+1}' for i in range(X_ica.shape[1])])

# With whitening
ica_whiten = FastICA(n_components=2, whiten=True, random_state=42)
X_ica_whiten = ica_whiten.fit_transform(X)`,
    effect: "Separates mixed signals into independent sources. Useful for blind source separation. Components are statistically independent, not just uncorrelated.",
    category: "Linear",
    impact: "medium",
    formula: "X = A × S, where A is mixing matrix, S is source signals",
  },
  {
    id: "svd",
    label: "Singular Value Decomposition (SVD)",
    icon: "🔢",
    definition: "Decomposes matrix into singular vectors and values. Fundamental matrix factorization technique used in many algorithms.",
    concept: "SVD decomposes a matrix X into three matrices: X = U × Σ × V^T, where U contains left singular vectors, Σ contains singular values (diagonal), and V^T contains right singular vectors. The singular values represent the importance of each component. SVD is the mathematical foundation behind PCA and is used in many dimensionality reduction and matrix approximation techniques.",
    useCases: [
      "Matrix approximation and compression",
      "Recommendation systems (collaborative filtering)",
      "Latent semantic analysis (LSA) in NLP",
      "Image compression",
      "Noise reduction",
      "Low-rank matrix approximation"
    ],
    implementationInsight: `from sklearn.decomposition import TruncatedSVD
import pandas as pd
import numpy as np
from scipy.linalg import svd

# Using sklearn TruncatedSVD
svd_model = TruncatedSVD(n_components=2, random_state=42, algorithm='randomized')
X_svd = svd_model.fit_transform(X)

# Explained variance
explained_variance = svd_model.explained_variance_ratio_

# Using scipy for full SVD
U, s, Vt = svd(X, full_matrices=False)

# Reconstruct with top k components
k = 2
X_reconstructed = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]

# Using pandas
df_svd = pd.DataFrame(X_svd, columns=[f'SVD{i+1}' for i in range(X_svd.shape[1])])`,
    effect: "Fundamental matrix decomposition technique. Basis for many algorithms. Can handle sparse matrices efficiently. Provides low-rank approximation of data.",
    category: "Matrix Factorization",
    impact: "high",
    formula: "X = U × Σ × V^T",
  },
  {
    id: "factor_analysis",
    label: "Factor Analysis",
    icon: "🔍",
    definition: "Identifies underlying latent factors in data. Assumes observed variables are linear combinations of unobserved factors plus error.",
    concept: "Factor Analysis assumes that observed variables are influenced by a smaller number of unobserved (latent) factors. It finds these factors and their loadings (how much each factor influences each variable). Unlike PCA which finds components that maximize variance, Factor Analysis finds factors that explain correlations between variables. It's commonly used in psychology, social sciences, and market research to identify underlying constructs.",
    useCases: [
      "Identifying latent constructs in data",
      "Psychology and social science research",
      "Market research and survey analysis",
      "Dimensionality reduction with interpretability",
      "Noise reduction in observed variables",
      "Understanding variable relationships"
    ],
    implementationInsight: `from sklearn.decomposition import FactorAnalysis
import pandas as pd
import numpy as np

# Initialize Factor Analysis
fa = FactorAnalysis(n_components=2, random_state=42, max_iter=1000, tol=0.0001)

# Fit and transform
X_fa = fa.fit_transform(X)

# Get factor loadings
loadings = fa.components_

# Get log-likelihood
log_likelihood = fa.score(X)

# With rotation (varimax, promax, etc.)
# Note: sklearn doesn't support rotation directly
# Use factor_analyzer library for rotation:
# from factor_analyzer import FactorAnalyzer
# fa = FactorAnalyzer(n_factors=2, rotation='varimax')
# fa.fit(X)
# loadings = fa.loadings_

# Using pandas
df_fa = pd.DataFrame(X_fa, columns=[f'Factor{i+1}' for i in range(X_fa.shape[1])])`,
    effect: "Identifies underlying latent factors. More interpretable than PCA for understanding variable relationships. Useful for exploratory data analysis and hypothesis testing.",
    category: "Latent Variables",
    impact: "medium",
    formula: "X = Λ × F + ε, where Λ is loadings, F is factors, ε is error",
  },
];

