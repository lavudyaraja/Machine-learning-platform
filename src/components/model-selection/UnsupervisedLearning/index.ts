/**
 * Unsupervised Learning Models Index
 * Central export point for all unsupervised learning models
 */

// Clustering Models
export * from "./clustering/KMeans";
export * from "./clustering/MiniBatchKMeans";
export * from "./clustering/HierarchicalClustering";
export * from "./clustering/AgglomerativeClustering";
export * from "./clustering/DBSCAN";
export * from "./clustering/HDBSCAN";
export * from "./clustering/MeanShift";
export * from "./clustering/OPTICS";
export * from "./clustering/SpectralClustering";
export * from "./clustering/BIRCH";
export * from "./clustering/GaussianMixture";

// Association Rule Mining
export * from "./association-rules/Apriori";
export * from "./association-rules/FPGrowth";
export * from "./association-rules/ECLAT";

// Model Categories
export const CLUSTERING_CATEGORIES = {
  CENTROID_BASED: "centroid_based",
  DENSITY_BASED: "density_based",
  HIERARCHICAL: "hierarchical",
  DISTRIBUTION_BASED: "distribution_based",
} as const;

// Clustering Algorithm Comparison
export const CLUSTERING_COMPARISON = {
  KMeans: {
    type: "centroid",
    scalesTo: "millions",
    parameters: "K",
    clusterShape: "spherical"
  },
  DBSCAN: {
    type: "density",
    scalesTo: "tens_of_thousands",
    parameters: "eps, min_samples",
    clusterShape: "arbitrary"
  },
  Hierarchical: {
    type: "hierarchical",
    scalesTo: "thousands",
    parameters: "linkage, n_clusters",
    clusterShape: "depends on linkage"
  },
  GMM: {
    type: "distribution",
    scalesTo: "tens_of_thousands",
    parameters: "n_components, covariance",
    clusterShape: "elliptical"
  }
};

// Clustering Selection Guide
export const CLUSTERING_GUIDE = {
  "large_data": ["KMeans", "MiniBatchKMeans", "BIRCH"],
  "unknown_clusters": ["DBSCAN", "HDBSCAN", "MeanShift"],
  "hierarchical_structure": ["AgglomerativeClustering", "BIRCH"],
  "density_varying": ["HDBSCAN", "OPTICS"],
  "soft_clustering": ["GaussianMixture"],
  "complex_shapes": ["SpectralClustering", "DBSCAN"]
};

// Association Rules Guide
export const ASSOCIATION_RULES_GUIDE = {
  "small_medium_data": ["Apriori"],
  "large_data": ["FPGrowth", "ECLAT"],
  "sparse_data": ["ECLAT"],
  "dense_data": ["FPGrowth"]
};

