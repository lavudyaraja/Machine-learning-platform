/**
 * FP-Growth Algorithm
 * Frequent Pattern Growth - faster alternative to Apriori
 */

export interface FPGrowthConfig {
  minSupport?: number;
  useColnames?: boolean;
  maxLength?: number | null;
  verbose?: number;
}

export const FPGrowthInfo = {
  name: "FP-Growth",
  category: "association_rules",
  description: "Frequent Pattern Growth algorithm - mines frequent patterns without candidate generation",
  detailedDescription: `FP-Growth (Frequent Pattern Growth) is an efficient algorithm that mines frequent itemsets without candidate generation by building a compact FP-tree structure and using pattern growth.

Steps:

1.Input Data: Transactional data where each transaction contains set of items.

2.Support Threshold: Set minimum support (min_sup) for frequent itemsets.

3.Scan Database: First pass - count support of all items, sort items by frequency (descending).

4.Filter Transactions: Remove infrequent items from each transaction, sort remaining items by frequency order.

5.FP-Tree Construction: Build Frequent Pattern tree (FP-tree) by inserting transactions, sharing common prefixes.

6.FP-Tree Structure: Each node stores item and count. Path from root to leaf represents itemset with its frequency.

7.Header Table: Maintain header table linking all nodes of same item for efficient traversal.

8.Mine FP-Tree: For each item in header table (bottom-up), construct conditional pattern base and conditional FP-tree.

9.Pattern Growth: Recursively mine conditional FP-trees to find frequent patterns ending with specific item.

10.Frequent Itemsets: Generate all frequent itemsets by combining items from conditional patterns.

11.Output: Frequent itemsets. More efficient than Apriori as it avoids candidate generation and multiple database scans.`,
  complexity: "Medium",
  bestFor: "Large transactional databases, efficient frequent pattern mining",
  pros: [
    "Much faster than Apriori",
    "Only 2 database scans",
    "No candidate generation needed",
    "Memory efficient with FP-tree",
    "Better performance on large datasets"
  ],
  cons: [
    "FP-tree can be large",
    "Not as intuitive as Apriori",
    "Implementation more complex",
    "Memory issues if tree doesn't fit"
  ],
  useCases: [
    "Large-scale market basket analysis",
    "Web usage mining",
    "Click-stream analysis",
    "Gene expression analysis",
    "When Apriori is too slow"
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
    },
    useColnames: {
      description: "Use column names instead of indices",
      default: true,
      options: [true, false]
    }
  },
  algorithm: {
    step1: "Scan database and find frequent 1-itemsets",
    step2: "Build FP-tree from transactions",
    step3: "Mine FP-tree recursively for patterns"
  },
  requirements: {
    dataType: "Transactional (binary matrix or list of transactions)",
    preprocessing: "Convert to one-hot encoded format",
    missingValues: "Treat as item not present"
  },
  performance: {
    trainingSpeed: "Fast (2 scans only)",
    memoryUsage: "Medium (FP-tree)",
    scalability: "Good"
  }
};

export function runFPGrowth(
  transactions: string[][],
  config: FPGrowthConfig
) {
  console.log("Running FP-Growth with config:", config);
  return {
    algorithm: "fp_growth",
    config,
    frequentItemsets: []
  };
}

