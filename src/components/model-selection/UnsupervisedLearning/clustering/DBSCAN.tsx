/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
 * Density-based clustering that can find arbitrarily shaped clusters
 */

export interface DBSCANConfig {
  eps?: number; // Maximum distance between two samples
  minSamples?: number; // Minimum samples in neighborhood
  metric?: string;
  algorithm?: "auto" | "ball_tree" | "kd_tree" | "brute";
  leafSize?: number;
  p?: number; // Minkowski metric power
  nJobs?: number;
}

export const DBSCANInfo = {
  name: "DBSCAN",
  category: "clustering",
  description: "Density-based clustering that can find arbitrarily shaped clusters and identify outliers",
  detailedDescription: `DBSCAN (Density-Based Spatial Clustering of Applications with Noise) is a density-based algorithm that groups together points that are closely packed and identifies outliers as noise.

Steps:

1.Input Data: Unlabeled data with numerical features.

2.Parameters: Set eps (maximum distance for neighbors) and min_samples (minimum points to form dense region).

3.Core Points: Identify core points - points with at least min_samples neighbors within eps distance.

4.Density-Reachable: Two points are density-reachable if connected by chain of core points within eps distance.

5.Cluster Formation: Form clusters by grouping all density-reachable points together.

6.Border Points: Points within eps of core point but not core themselves become border points of that cluster.

7.Noise Points: Points that are neither core nor border points are labeled as noise/outliers.

8.Output: Clusters of arbitrary shape and noise points. Number of clusters determined automatically.`,
  complexity: "Medium",
  bestFor: "Non-spherical clusters, outlier detection",
  pros: [
    "No need to specify number of clusters",
    "Can find arbitrarily shaped clusters",
    "Robust to outliers (marks as noise)",
    "Works well with varying density (somewhat)",
    "Good for spatial data"
  ],
  cons: [
    "Sensitive to eps and min_samples",
    "Struggles with varying densities",
    "Not suitable for high-dimensional data",
    "Doesn't scale well to very large datasets",
    "Parameters hard to choose"
  ],
  useCases: [
    "Geospatial Analysis",
    "Anomaly Detection",
    "Image Segmentation",
    "Network Analysis",
    // "Social Networks"
  ],
  hyperparameters: {
    eps: {
      description: "Maximum distance between two samples to be neighbors",
      default: 0.5,
      range: [0.1, 2.0]
    },
    minSamples: {
      description: "Minimum samples in neighborhood to form core point",
      default: 5,
      range: [2, 20]
    },
    metric: {
      description: "Distance metric",
      default: "euclidean",
      options: ["euclidean", "manhattan", "cosine", "minkowski"]
    },
    algorithm: {
      description: "Algorithm for nearest neighbors",
      default: "auto",
      options: ["auto", "ball_tree", "kd_tree", "brute"]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required (important!)",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Medium (O(n²) worst case)",
    memoryUsage: "Medium",
    scalability: "Moderate (use for < 50K samples)"
  },
  outputLabels: {
    corePoints: "Points with enough neighbors",
    borderPoints: "Neighbors of core points",
    noise: "Labeled as -1, considered outliers"
  }
};

export function trainDBSCAN(
  X: number[][],
  config: DBSCANConfig
) {
  console.log("Training DBSCAN with config:", config);
  return {
    model: "dbscan",
    config,
    trained: true
  };
}

