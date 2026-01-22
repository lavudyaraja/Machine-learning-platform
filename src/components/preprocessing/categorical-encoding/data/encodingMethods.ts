import { Hash, Binary, ArrowUpDown, Target, BarChart3, TrendingUp, Layers } from "lucide-react";

export interface EncodingMethod {
  value: string;
  label: string;
  icon: any;
  description: string;
  bestFor: string;
}

export const ENCODING_METHODS: EncodingMethod[] = [
  { 
    value: "label", 
    label: "Label Encoding",
    icon: Hash,
    description: "Assigns unique integers (0, 1, 2...) to each category. Simple and fast, but assumes ordinal relationships.",
    bestFor: "Ordinal data",
  },
  { 
    value: "one_hot", 
    label: "One-Hot Encoding",
    icon: Binary,
    description: "Creates separate binary columns (0/1) for each category. Eliminates ordinal assumptions.",
    bestFor: "Nominal data (low cardinality)",
  },
  { 
    value: "ordinal", 
    label: "Ordinal Encoding",
    icon: ArrowUpDown,
    description: "Maps categories to integers based on their natural order. Preserves ordinal relationships.",
    bestFor: "Ordered categories",
  },
  { 
    value: "target", 
    label: "Target Encoding",
    icon: Target,
    description: "Replaces each category with the mean of the target variable for that category.",
    bestFor: "High cardinality with target",
  },
  { 
    value: "frequency", 
    label: "Frequency Encoding",
    icon: BarChart3,
    description: "Replaces categories with their frequency counts in the dataset.",
    bestFor: "High cardinality features",
  },
  { 
    value: "count", 
    label: "Count Encoding",
    icon: TrendingUp,
    description: "Similar to frequency encoding, replaces categories with total occurrence counts.",
    bestFor: "Categorical with patterns",
  },
  { 
    value: "binary", 
    label: "Binary Encoding",
    icon: Binary,
    description: "Converts categories to binary representation, reducing dimensionality compared to one-hot.",
    bestFor: "High cardinality",
  },
  { 
    value: "hash", 
    label: "Hash Encoding",
    icon: Hash,
    description: "Uses hashing to map categories to fixed-size feature vectors.",
    bestFor: "Very high cardinality",
  },
  { 
    value: "leave_one_out", 
    label: "Leave-One-Out",
    icon: Layers,
    description: "Target encoding variant that excludes the current row when calculating category means.",
    bestFor: "Prevents overfitting",
  },
  { 
    value: "woe", 
    label: "Weight of Evidence",
    icon: Target,
    description: "Calculates the logarithmic ratio of positive to negative events per category.",
    bestFor: "Binary classification",
  },
];
