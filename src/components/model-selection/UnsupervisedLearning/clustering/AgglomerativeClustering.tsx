/**
 * Agglomerative Clustering
 * Bottom-up hierarchical clustering that merges closest clusters iteratively
 */

export interface AgglomerativeClusteringConfig {
  nClusters?: number | null;
  affinity?: "euclidean" | "l1" | "l2" | "manhattan" | "cosine" | "precomputed";
  memory?: string | null;
  connectivity?: any;
  computeFullTree?: boolean | "auto";
  linkage?: "ward" | "complete" | "average" | "single";
  distanceThreshold?: number | null;
  computeDistances?: boolean;
}

export const AgglomerativeClusteringInfo = {
  name: "Agglomerative Clustering",
  category: "clustering",
  description: "Bottom-up hierarchical clustering starting from individual points",
  detailedDescription: `Agglomerative Clustering is a bottom-up hierarchical clustering method that starts with each point as its own cluster and iteratively merges the closest clusters until desired number is reached.

Steps:

1.Input Data: Unlabeled data with numerical features.

2.Initial Clusters: Start with each data point as its own cluster (N clusters for N points).

3.Distance Matrix: Calculate pairwise distance matrix between all clusters using distance metric (Euclidean, Manhattan, etc.).

4.Linkage Criterion: Calculate inter-cluster distance using linkage method (single, complete, average, ward).

5.Single Linkage: Distance = minimum distance between any points in two clusters (connects closest points).

6.Complete Linkage: Distance = maximum distance between any points in two clusters (ensures all points close).

7.Average Linkage: Distance = average distance between all pairs of points in two clusters.

8.Ward Linkage: Distance = increase in within-cluster variance when merging clusters (minimizes variance).

9.Merge Clusters: Merge two clusters with smallest distance.

10.Iterate: Repeat steps 4-9 until desired number of clusters K is reached.

11.Output: K clusters with hierarchical structure showing merge order.`,
  complexity: "Medium",
  bestFor: "Small datasets, when cluster hierarchy needed",
  pros: [
    "Creates intuitive hierarchy",
    "Can specify number of clusters or distance threshold",
    "Various linkage methods available",
    "Works well with different cluster shapes",
    "Deterministic"
  ],
  cons: [
    "O(n²) memory complexity",
    "O(n³) time complexity",
    "Not suitable for large datasets",
    "Sensitive to outliers (especially single linkage)",
    "Merging decisions are final"
  ],
  useCases: [
    "Customer Segmentation",
    "Document Clustering",
    "Image Analysis",
    "Medical Imaging",
    "Gene Analysis",
    "Social Networks",
    // "Market Research"

  ],
  hyperparameters: {
    nClusters: {
      description: "Number of clusters to find",
      default: 2,
      range: [2, 50]
    },
    linkage: {
      description: "Linkage criterion",
      default: "ward",
      options: ["ward", "complete", "average", "single"]
    },
    affinity: {
      description: "Metric for distance computation",
      default: "euclidean",
      options: ["euclidean", "l1", "l2", "manhattan", "cosine"]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Slow",
    memoryUsage: "High",
    scalability: "Poor (< 10K samples recommended)"
  }
};

export function trainAgglomerativeClustering(
  X: number[][],
  config: AgglomerativeClusteringConfig
) {
  console.log("Training Agglomerative Clustering with config:", config);
  return {
    model: "agglomerative_clustering",
    config,
    trained: true
  };
}

