/**
 * Code generation for Unsupervised Learning Models
 * Clustering and Association Rules models
 */

export function generateUnsupervisedModelCode(modelId: string, category: string, modelInfo: any): string {
  const modelName = modelInfo?.name || modelId;
  
  // Clustering models
  if (category === "clustering") {
    switch (modelId) {
      case "k-means":
        return `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import numpy as np

# Scale features (important for K-Means)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Determine optimal number of clusters using elbow method
inertias = []
silhouette_scores = []
K_range = range(2, 11)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)
    silhouette_scores.append(silhouette_score(X_scaled, kmeans.labels_))

# Choose optimal K (example: using silhouette score)
optimal_k = K_range[np.argmax(silhouette_scores)]
print(f"Optimal number of clusters: {optimal_k}")

# Initialize and fit model
model = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
labels = model.fit_predict(X_scaled)

# Get cluster centers
centers = model.cluster_centers_

# Evaluate clustering
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "dbscan":
        return `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features (important for DBSCAN)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = DBSCAN(eps=0.5, min_samples=5, metric='euclidean')
labels = model.fit_predict(X_scaled)

# Number of clusters (excluding noise points labeled as -1)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Number of clusters: {n_clusters}")
print(f"Number of noise points: {n_noise}")

# Evaluate clustering (excluding noise points)
if n_clusters > 1:
    mask = labels != -1
    if mask.sum() > 0:
        silhouette = silhouette_score(X_scaled[mask], labels[mask])
        print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "gaussian-mixture":
        return `from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import numpy as np

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Determine optimal number of components
n_components_range = range(2, 11)
best_score = -1
best_n = 2

for n in n_components_range:
    gmm = GaussianMixture(n_components=n, random_state=42)
    labels = gmm.fit_predict(X_scaled)
    if len(set(labels)) > 1:
        score = silhouette_score(X_scaled, labels)
        if score > best_score:
            best_score = score
            best_n = n

print(f"Optimal number of components: {best_n}")

# Initialize and fit model
model = GaussianMixture(n_components=best_n, random_state=42)
labels = model.fit_predict(X_scaled)

# Get probabilities
probabilities = model.predict_proba(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "hierarchical-clustering":
        return `from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Create linkage matrix for dendrogram
linkage_matrix = linkage(X_scaled, method='ward')

# Plot dendrogram
plt.figure(figsize=(10, 6))
dendrogram(linkage_matrix, truncate_mode='level', p=5)
plt.title('Hierarchical Clustering Dendrogram')
plt.xlabel('Sample Index')
plt.ylabel('Distance')
plt.show()

# Initialize and fit model
model = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels = model.fit_predict(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "agglomerative-clustering":
        return `from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = AgglomerativeClustering(
    n_clusters=3,
    linkage='ward',  # or 'complete', 'average', 'single'
    metric='euclidean'
)
labels = model.fit_predict(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "mean-shift":
        return `from sklearn.cluster import MeanShift
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model (bandwidth can be auto-estimated)
model = MeanShift(bandwidth=None, bin_seeding=True)
labels = model.fit_predict(X_scaled)

# Get cluster centers
centers = model.cluster_centers_

# Number of clusters
n_clusters = len(set(labels))
print(f"Number of clusters: {n_clusters}")

# Evaluate
if n_clusters > 1:
    silhouette = silhouette_score(X_scaled, labels)
    print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "spectral-clustering":
        return `from sklearn.cluster import SpectralClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = SpectralClustering(
    n_clusters=3,
    affinity='rbf',  # or 'nearest_neighbors'
    gamma=1.0,
    random_state=42
)
labels = model.fit_predict(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "optics":
        return `from sklearn.cluster import OPTICS
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = OPTICS(min_samples=5, max_eps=float('inf'), metric='euclidean')
labels = model.fit_predict(X_scaled)

# Number of clusters (excluding noise points labeled as -1)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Number of clusters: {n_clusters}")
print(f"Number of noise points: {n_noise}")

# Evaluate (excluding noise points)
if n_clusters > 1:
    mask = labels != -1
    if mask.sum() > 0:
        silhouette = silhouette_score(X_scaled[mask], labels[mask])
        print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "hdbscan":
        return `import hdbscan
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = hdbscan.HDBSCAN(
    min_cluster_size=5,
    min_samples=None,
    cluster_selection_epsilon=0.0
)
labels = model.fit_predict(X_scaled)

# Number of clusters (excluding noise points labeled as -1)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Number of clusters: {n_clusters}")
print(f"Number of noise points: {n_noise}")

# Evaluate (excluding noise points)
if n_clusters > 1:
    mask = labels != -1
    if mask.sum() > 0:
        silhouette = silhouette_score(X_scaled[mask], labels[mask])
        print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "birch":
        return `from sklearn.cluster import Birch
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = Birch(
    n_clusters=3,
    threshold=0.5,
    branching_factor=50
)
labels = model.fit_predict(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      case "minibatch-k-means":
        return `from sklearn.cluster import MiniBatchKMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = MiniBatchKMeans(
    n_clusters=3,
    batch_size=100,
    random_state=42,
    n_init=3
)
labels = model.fit_predict(X_scaled)

# Get cluster centers
centers = model.cluster_centers_

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;

      default:
        return `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Initialize and fit model
model = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = model.fit_predict(X_scaled)

# Evaluate
silhouette = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {silhouette:.4f}")

# Add cluster labels to data
X_with_clusters = X.copy()
X_with_clusters['cluster'] = labels`;
    }
  }
  
  // Association Rules models
  if (category === "association_rules") {
    switch (modelId) {
      case "apriori":
        return `from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

# Prepare transaction data (list of lists)
# Example: transactions = [['bread', 'milk'], ['bread', 'diaper', 'beer'], ...]
transactions = [
    ['bread', 'milk'],
    ['bread', 'diaper', 'beer', 'eggs'],
    ['milk', 'diaper', 'beer', 'cola'],
    ['bread', 'milk', 'diaper', 'beer'],
    ['bread', 'milk', 'diaper', 'cola']
]

# Encode transactions
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Find frequent itemsets
frequent_itemsets = apriori(df, min_support=0.5, use_colnames=True)
print("Frequent Itemsets:")
print(frequent_itemsets)

# Generate association rules
rules = association_rules(
    frequent_itemsets,
    metric="confidence",
    min_threshold=0.6
)
print("\\nAssociation Rules:")
print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])`;

      case "fp-growth":
        return `from mlxtend.frequent_patterns import fpgrowth, association_rules
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

# Prepare transaction data (list of lists)
# Example: transactions = [['bread', 'milk'], ['bread', 'diaper', 'beer'], ...]
transactions = [
    ['bread', 'milk'],
    ['bread', 'diaper', 'beer', 'eggs'],
    ['milk', 'diaper', 'beer', 'cola'],
    ['bread', 'milk', 'diaper', 'beer'],
    ['bread', 'milk', 'diaper', 'cola']
]

# Encode transactions
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Find frequent itemsets using FP-Growth
frequent_itemsets = fpgrowth(df, min_support=0.5, use_colnames=True)
print("Frequent Itemsets:")
print(frequent_itemsets)

# Generate association rules
rules = association_rules(
    frequent_itemsets,
    metric="confidence",
    min_threshold=0.6
)
print("\\nAssociation Rules:")
print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])`;

      case "eclat":
        return `from mlxtend.frequent_patterns import fpgrowth  # ECLAT-like functionality
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

# Prepare transaction data (list of lists)
# Example: transactions = [['bread', 'milk'], ['bread', 'diaper', 'beer'], ...]
transactions = [
    ['bread', 'milk'],
    ['bread', 'diaper', 'beer', 'eggs'],
    ['milk', 'diaper', 'beer', 'cola'],
    ['bread', 'milk', 'diaper', 'beer'],
    ['bread', 'milk', 'diaper', 'cola']
]

# Encode transactions (vertical format for ECLAT)
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Find frequent itemsets (ECLAT uses vertical format internally)
# Using FP-Growth as ECLAT alternative in mlxtend
frequent_itemsets = fpgrowth(df, min_support=0.5, use_colnames=True)
print("Frequent Itemsets:")
print(frequent_itemsets)

# Note: ECLAT focuses on itemset mining, not rule generation
# For rules, you can use association_rules from frequent_itemsets`;

      default:
        return `from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

# Prepare transaction data
transactions = [
    ['bread', 'milk'],
    ['bread', 'diaper', 'beer'],
    ['milk', 'diaper', 'beer']
]

# Encode transactions
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Find frequent itemsets
frequent_itemsets = apriori(df, min_support=0.5, use_colnames=True)

# Generate association rules
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.6)
print(rules)`;
    }
  }
  
  return "";
}
