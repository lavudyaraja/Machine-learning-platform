/**
 * Hierarchical Clustering
 * Creates a hierarchy of clusters using tree-like structure (dendrogram)
 */

export interface HierarchicalClusteringConfig {
  nClusters?: number | null;
  affinity?: "euclidean" | "l1" | "l2" | "manhattan" | "cosine";
  linkage?: "ward" | "complete" | "average" | "single";
  distanceThreshold?: number | null;
  computeFullTree?: boolean | "auto";
  computeDistances?: boolean;
}

export const HierarchicalClusteringInfo = {
  name: "Hierarchical Clustering",
  category: "clustering",
  description: "Creates a hierarchy of clusters visualized as dendrogram",
  detailedDescription: `Hierarchical Clustering creates a hierarchy of clusters by iteratively merging (agglomerative) or splitting (divisive) clusters, resulting in a dendrogram that shows cluster relationships.

Steps:

1.Input Data: Unlabeled data with numerical features.

2.Distance Matrix: Calculate pairwise distance matrix D where Dᵢⱼ = distance(xᵢ, xⱼ) using metric (Euclidean, Manhattan, etc.).

3.Initial Clusters: Start with each point as its own cluster (agglomerative) or all points in one cluster (divisive).

4.Linkage Criterion: Calculate distance between clusters using linkage (single, complete, average, ward).

5.Single Linkage: Distance = min distance between any points in two clusters.

6.Complete Linkage: Distance = max distance between any points in two clusters.

7.Average Linkage: Distance = average distance between all pairs of points in two clusters.

8.Merge/Split: Merge two closest clusters (agglomerative) or split cluster (divisive).

9.Dendrogram: Build tree structure showing cluster merges/splits at different distances.

10.Output: Cut dendrogram at desired height to get specified number of clusters.`,
  complexity: "Medium",
  bestFor: "When cluster hierarchy is important, small to medium datasets",
  pros: [
    "No need to specify K beforehand (can cut dendrogram)",
    "Creates hierarchy of clusters",
    "Visualizable with dendrogram",
    "Works with any distance metric",
    "Deterministic results"
  ],
  cons: [
    "Computationally expensive O(n³)",
    "High memory usage O(n²)",
    "Not suitable for large datasets",
    "Sensitive to noise and outliers",
    "Cannot undo merge decisions"
  ],
  useCases: [
    "Taxonomy Creation",
    "Document Organization",
    "Gene Analysis",
    "Social Networks",
    "Cluster Hierarchy"
  ],
  hyperparameters: {
    nClusters: {
      description: "Number of clusters (or use distance_threshold)",
      default: 2,
      range: [2, 50]
    },
    linkage: {
      description: "Linkage criterion for merging clusters",
      default: "ward",
      options: ["ward", "complete", "average", "single"]
    },
    affinity: {
      description: "Distance metric",
      default: "euclidean",
      options: ["euclidean", "l1", "l2", "manhattan", "cosine"]
    },
    distanceThreshold: {
      description: "Distance threshold for forming clusters",
      default: null,
      range: [0, 100]
    }
  },
  linkageExplanation: {
    ward: "Minimizes variance within clusters (most common)",
    complete: "Maximum distance between points in different clusters",
    average: "Average distance between all pairs",
    single: "Minimum distance between points (creates long chains)"
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Slow (O(n³))",
    memoryUsage: "High (O(n²))",
    scalability: "Poor (use for < 10K samples)"
  }
};

export function trainHierarchicalClustering(
  X: number[][],
  config: HierarchicalClusteringConfig
) {
  console.log("Training Hierarchical Clustering with config:", config);
  return {
    model: "hierarchical_clustering",
    config,
    trained: true
  };
}

