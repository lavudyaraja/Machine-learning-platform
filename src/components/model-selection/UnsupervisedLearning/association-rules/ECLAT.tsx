/**
 * ECLAT Algorithm
 * Equivalence Class Transformation - vertical data format approach
 */

export interface ECLATConfig {
  minSupport?: number;
  maxLength?: number | null;
  sortedIndex?: boolean;
}

export const ECLATInfo = {
  name: "ECLAT",
  category: "association_rules",
  description: "Equivalence Class Transformation - uses vertical data format for efficient pattern mining",
  detailedDescription: `ECLAT (Equivalence Class Transformation) is an efficient itemset mining algorithm that uses vertical data format (tid-list) instead of horizontal (transaction-list), enabling fast intersection operations.

Steps:

1.Input Data: Transactional data where each transaction contains set of items.

2.Support Threshold: Set minimum support (min_sup) for frequent itemsets.

3.Vertical Format: Transform data to vertical format - for each item, store list of transaction IDs (tid-list) containing that item.

4.Support Calculation: Support of item = length of its tid-list / total_transactions.

5.Frequent 1-itemsets: Find all items with support ≥ min_sup, store their tid-lists.

6.Itemset Intersection: For itemset {A,B}, tid-list = intersection(tid-list(A), tid-list(B)) - transactions containing both A and B.

7.Support from Intersection: Support({A,B}) = |tid-list({A,B})| / total_transactions.

8.Pattern Growth: Generate k-itemsets by intersecting tid-lists of (k-1)-itemsets.

9.Equivalence Classes: Group itemsets with same prefix into equivalence classes for efficient processing.

10.Recursive Mining: Recursively mine each equivalence class to find all frequent itemsets.

11.Output: Frequent itemsets. Efficient for dense datasets due to fast tid-list intersections.`,
  complexity: "Medium",
  bestFor: "Large datasets, when data fits in memory",
  pros: [
    "Faster than Apriori",
    "Uses set intersection for support counting",
    "No candidate generation like FP-Growth",
    "Depth-first search approach",
    "Memory efficient for sparse data"
  ],
  cons: [
    "Requires vertical data format transformation",
    "Memory issues with dense data",
    "Can be slower than FP-Growth for very large datasets",
    "TID-set intersection can be expensive"
  ],
  useCases: [
    "Market basket analysis",
    "Sparse transaction datasets",
    "When items per transaction is small",
    "Real-time association mining",
    "Alternative to FP-Growth"
  ],
  hyperparameters: {
    minSupport: {
      description: "Minimum support threshold (0-1)",
      default: 0.1,
      range: [0.001, 0.5]
    },
    maxLength: {
      description: "Maximum itemset length",
      default: null,
      range: [2, 10]
    }
  },
  algorithm: {
    step1: "Transform data to vertical format (item → TID-set)",
    step2: "Find frequent 1-itemsets",
    step3: "Generate k+1 itemsets by intersecting TID-sets",
    step4: "Repeat until no more frequent itemsets"
  },
  dataFormat: {
    horizontal: "Transaction → {items}",
    vertical: "Item → {transaction IDs (TID-set)}"
  },
  requirements: {
    dataType: "Transactional data",
    preprocessing: "Convert to vertical format",
    missingValues: "Treat as item not present"
  },
  performance: {
    trainingSpeed: "Fast (set intersections)",
    memoryUsage: "Medium (TID-sets)",
    scalability: "Good for sparse data"
  }
};

export function runECLAT(
  transactions: string[][],
  config: ECLATConfig
) {
  console.log("Running ECLAT with config:", config);
  return {
    algorithm: "eclat",
    config,
    frequentItemsets: []
  };
}

