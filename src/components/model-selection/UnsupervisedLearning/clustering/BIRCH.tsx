/**
 * BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies)
 * Scalable clustering for large datasets using CF-trees
 */

export interface BIRCHConfig {
  threshold?: number;
  branchingFactor?: number;
  nClusters?: number | null;
  computeLabels?: boolean;
  copyX?: boolean;
}

export const BIRCHInfo = {
  name: "BIRCH",
  category: "clustering",
  description: "Scalable hierarchical clustering using Clustering Feature trees",
  detailedDescription: `BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies) is a scalable clustering algorithm that uses Clustering Feature (CF) trees to efficiently handle large datasets.

Steps:

1.Input Data: Unlabeled data with numerical features (can be very large).

2.Clustering Feature (CF): For cluster, store CF = (N, LS, SS) where N = number of points, LS = linear sum, SS = sum of squares.

3.CF Tree: Build balanced tree where each node stores CF entries (leaf nodes store sub-clusters, non-leaf nodes store CF summaries).

4.Insertion: Insert new point by traversing tree to find closest CF entry, update CF statistics.

5.Threshold: If CF entry radius exceeds threshold, split node or create new entry.

6.Tree Building: Build CF tree in single pass through data, storing compact summaries instead of all points.

7.Clustering: Apply clustering algorithm (typically K-Means) to CF tree leaf entries (much smaller than original data).

8.Output: Clusters from CF tree. Efficient for large datasets as it processes data in single pass with limited memory.`,
  complexity: "Medium",
  bestFor: "Large datasets, streaming data, when memory is limited",
  pros: [
    "Very scalable (single pass through data)",
    "Low memory usage",
    "Works well with streaming data",
    "Can handle large datasets",
    "Hierarchical structure available"
  ],
  cons: [
    "Only works with numerical features",
    "Sensitive to order of data points",
    "May not work well with non-spherical clusters",
    "Threshold parameter is crucial",
    "Best for relatively compact clusters"
  ],
  useCases: [
    "Large-scale Clustering",
    "Streaming Data",
    "Memory-limited Systems",
    "Online Learning",
    "Real-time Analysis"
  ],
  hyperparameters: {
    threshold: {
      description: "Maximum radius of sub-cluster in CF-tree",
      default: 0.5,
      range: [0.1, 2.0]
    },
    branchingFactor: {
      description: "Maximum number of CF sub-clusters per node",
      default: 50,
      range: [10, 100]
    },
    nClusters: {
      description: "Number of final clusters (null = auto from CF-tree)",
      default: 3,
      range: [2, 100]
    }
  },
  requirements: {
    dataType: "Numerical features only",
    scaling: "Recommended",
    missingValues: "Not allowed",
    categorical: "Must be encoded"
  },
  performance: {
    trainingSpeed: "Very Fast (single pass)",
    memoryUsage: "Very Low",
    scalability: "Excellent (millions of samples)"
  }
};

export function trainBIRCH(
  X: number[][],
  config: BIRCHConfig
) {
  console.log("Training BIRCH with config:", config);
  return {
    model: "birch",
    config,
    trained: true
  };
}

