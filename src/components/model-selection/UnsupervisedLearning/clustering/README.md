# Clustering Algorithms

Complete collection of clustering algorithms for unsupervised learning.

## 🔵 Available Algorithms (11 total)

### Centroid-Based Clustering
1. **KMeans.tsx** - Classic K-Means clustering
2. **MiniBatchKMeans.tsx** - Scalable K-Means for large datasets

### Hierarchical Clustering
3. **HierarchicalClustering.tsx** - Generic hierarchical clustering
4. **AgglomerativeClustering.tsx** - Bottom-up hierarchical
5. **BIRCH.tsx** - Scalable hierarchical with CF-trees

### Density-Based Clustering
6. **DBSCAN.tsx** - Density-based spatial clustering
7. **HDBSCAN.tsx** - Hierarchical DBSCAN
8. **MeanShift.tsx** - Mode-finding algorithm
9. **OPTICS.tsx** - Ordering points for cluster structure

### Other Methods
10. **SpectralClustering.tsx** - Graph-based clustering
11. **GaussianMixture.tsx** - Probabilistic soft clustering

## 📊 Algorithm Selection Guide

| Scenario | Recommended Algorithm |
|----------|----------------------|
| Know number of clusters | K-Means, GMM |
| Unknown number of clusters | DBSCAN, HDBSCAN, MeanShift |
| Very large dataset | MiniBatchKMeans, BIRCH |
| Non-spherical clusters | DBSCAN, SpectralClustering |
| Varying density | HDBSCAN, OPTICS |
| Need hierarchy | Agglomerative, BIRCH |
| Soft assignments | GMM |
| Outlier detection | DBSCAN (labels as -1) |

## 🎯 Complexity Comparison

| Algorithm | Time | Space | Best For |
|-----------|------|-------|----------|
| K-Means | O(n·k·i) | O(n·k) | Large data |
| DBSCAN | O(n²) | O(n) | Arbitrary shapes |
| Hierarchical | O(n³) | O(n²) | Small data |
| GMM | O(n·k·d²) | O(n·k) | Soft clustering |
| BIRCH | O(n) | O(n) | Streaming data |

## 📁 File Structure

Each file contains:
```typescript
export interface <Algorithm>Config { ... }
export const <Algorithm>Info = { ... }
export function train<Algorithm>() { ... }
```

## 🔢 Evaluation Metrics

- **Silhouette Score**: -1 to 1 (higher is better)
- **Calinski-Harabasz Index**: Higher is better
- **Davies-Bouldin Index**: Lower is better
- **Elbow Method**: For K selection

## 💡 Tips

1. **Always scale data** for distance-based algorithms
2. **Use Elbow/Silhouette** to find optimal K
3. **Start with K-Means** as baseline
4. **Use HDBSCAN** when density varies
5. **GMM for soft clustering** with probabilities

