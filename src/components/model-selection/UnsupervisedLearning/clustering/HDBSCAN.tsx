/**
 * HDBSCAN (Hierarchical Density-Based Spatial Clustering)
 * Hierarchical version of DBSCAN that handles varying densities
 */

export interface HDBSCANConfig {
  minClusterSize?: number;
  minSamples?: number;
  metric?: string;
  clusterSelectionMethod?: "eom" | "leaf";
  alpha?: number;
  clusterSelectionEpsilon?: number;
  algorithm?: "best" | "generic" | "prims_kdtree" | "prims_balltree" | "boruvka_kdtree" | "boruvka_balltree";
  leafSize?: number;
  allowSingleCluster?: boolean;
}

export const HDBSCANInfo = {
  name: "HDBSCAN",
  category: "clustering",
  description: "Hierarchical DBSCAN that handles clusters of varying densities",
  detailedDescription: `HDBSCAN (Hierarchical Density-Based Spatial Clustering) extends DBSCAN to handle clusters of varying densities by building a hierarchy of DBSCAN clusterings at different density levels.

Steps:

1.Input Data: Unlabeled data with numerical features.

2.Mutual Reachability Distance: Calculate mutual reachability graph where distance = max(core_distance(x), core_distance(y), distance(x,y)).

3.Minimum Spanning Tree: Build MST of mutual reachability graph.

4.Hierarchy Construction: Create cluster hierarchy by removing edges from MST in order of decreasing distance.

5.Cluster Tree: Build cluster tree showing how clusters merge as density threshold decreases.

6.Cluster Stability: Calculate stability score for each cluster = Σ(1/density_threshold) for points in cluster.

7.Cluster Selection: Extract most stable clusters from hierarchy, allowing varying densities.

8.Outlier Detection: Points not in any stable cluster are labeled as noise/outliers.

9.Output: Clusters of varying densities with hierarchical structure. More robust than DBSCAN for varying densities.`,
  complexity: "Medium",
  bestFor: "Datasets with varying cluster densities, noise detection",
  pros: [
    "No need to specify number of clusters",
    "Handles varying density clusters",
    "More robust than DBSCAN",
    "Provides hierarchy of clusters",
    "Better outlier detection",
    "Fewer parameters than DBSCAN"
  ],
  cons: [
    "Slower than standard DBSCAN",
    "More complex algorithm",
    "Memory intensive for large datasets",
    "Can produce many small clusters"
  ],
  useCases: [
    "Density-varying Data",
    "Anomaly Detection",
    "Natural Language",
    "Bioinformatics",
    "Variable Clusters"
  ],
  hyperparameters: {
    minClusterSize: {
      description: "Minimum size for a cluster",
      default: 5,
      range: [2, 100]
    },
    minSamples: {
      description: "How conservative the clustering is",
      default: null,
      range: [1, 50]
    },
    clusterSelectionMethod: {
      description: "Method to select flat clusters",
      default: "eom",
      options: ["eom", "leaf"]
    },
    clusterSelectionEpsilon: {
      description: "Distance threshold for merging clusters",
      default: 0.0,
      range: [0, 1]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Required",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Medium",
    memoryUsage: "Medium to High",
    scalability: "Better than hierarchical, but still limited"
  }
};

export function trainHDBSCAN(
  X: number[][],
  config: HDBSCANConfig
) {
  console.log("Training HDBSCAN with config:", config);
  return {
    model: "hdbscan",
    config,
    trained: true
  };
}

