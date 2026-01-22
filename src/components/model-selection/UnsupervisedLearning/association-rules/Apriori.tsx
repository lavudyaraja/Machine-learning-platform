/**
 * Apriori Algorithm
 * Classic algorithm for mining frequent itemsets and association rules
 */

export interface AprioriConfig {
  minSupport?: number;
  minConfidence?: number;
  minLift?: number;
  maxLength?: number | null;
  lowMemory?: boolean;
}

export const AprioriInfo = {
  name: "Apriori",
  category: "association_rules",
  description: "Classic algorithm for discovering frequent itemsets and association rules in transactional data",
  detailedDescription: `Apriori is a classic algorithm for mining frequent itemsets and association rules from transactional data, using the downward closure property (if itemset is frequent, all subsets are frequent).

Steps:

1.Input Data: Transactional data where each transaction contains set of items (e.g., shopping baskets).

2.Support Threshold: Set minimum support (min_sup) - minimum frequency of itemset in transactions.

3.Support Calculation: Support(X) = count(transactions containing X) / total_transactions.

4.Generate 1-itemsets: Find all frequent 1-itemsets (single items) with support ≥ min_sup.

5.Candidate Generation: Generate candidate k-itemsets from frequent (k-1)-itemsets by joining itemsets that share (k-2) items.

6.Apriori Property: Prune candidates whose (k-1)-subsets are not all frequent (downward closure).

7.Support Counting: Count support of remaining candidates by scanning transactions.

8.Frequent Itemsets: Keep itemsets with support ≥ min_sup as frequent k-itemsets.

9.Iterate: Repeat steps 5-8 for k = 2, 3, ... until no more frequent itemsets found.

10.Association Rules: Generate rules X → Y from frequent itemsets where confidence(X → Y) = support(X∪Y)/support(X) ≥ min_confidence.

11.Output: Frequent itemsets and association rules with support and confidence metrics.`,
  complexity: "Medium",
  bestFor: "Market basket analysis, finding item associations",
  pros: [
    "Simple and easy to understand",
    "Well-established algorithm",
    "Can find all frequent itemsets",
    "Interpretable results",
    "Works with transactional data"
  ],
  cons: [
    "Slow on large datasets",
    "Requires multiple database scans",
    "Memory intensive",
    "Generates many candidate itemsets",
    "Performance depends on min_support"
  ],
  useCases: [
    "Market basket analysis",
    "Product recommendations",
    "Cross-selling strategies",
    "Customer behavior analysis",
    "Medical diagnosis rules"
  ],
  hyperparameters: {
    minSupport: {
      description: "Minimum support threshold (0-1)",
      default: 0.1,
      range: [0.001, 0.5]
    },
    minConfidence: {
      description: "Minimum confidence for rules (0-1)",
      default: 0.5,
      range: [0.1, 1.0]
    },
    minLift: {
      description: "Minimum lift value for rules",
      default: 1.0,
      range: [1.0, 10.0]
    },
    maxLength: {
      description: "Maximum itemset size",
      default: null,
      range: [2, 10]
    }
  },
  metricsExplanation: {
    support: "Fraction of transactions containing itemset: P(A∩B)",
    confidence: "P(B|A) - probability of B given A",
    lift: "lift = confidence / P(B), lift > 1 means positive correlation"
  },
  requirements: {
    dataType: "Transactional (binary matrix or list of transactions)",
    preprocessing: "Convert to one-hot encoded format",
    missingValues: "Treat as item not present"
  },
  performance: {
    trainingSpeed: "Slow (multiple scans)",
    memoryUsage: "High",
    scalability: "Poor for large datasets"
  },
  output: {
    frequentItemsets: "Sets of items appearing together often",
    rules: "If-then rules with support, confidence, lift"
  }
};

export function runApriori(
  transactions: string[][],
  config: AprioriConfig
) {
  console.log("Running Apriori with config:", config);
  return {
    algorithm: "apriori",
    config,
    frequentItemsets: [],
    rules: []
  };
}

