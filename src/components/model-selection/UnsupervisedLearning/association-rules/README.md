# Association Rule Mining Algorithms

Algorithms for discovering interesting relations between variables in large databases.

## 🛒 Available Algorithms (3 total)

### Classic Algorithms
1. **Apriori.tsx** - Original frequent itemset mining algorithm
2. **FPGrowth.tsx** - Frequent Pattern Growth (faster than Apriori)
3. **ECLAT.tsx** - Equivalence Class Transformation (vertical format)

## 📊 Algorithm Comparison

| Feature | Apriori | FP-Growth | ECLAT |
|---------|---------|-----------|-------|
| Data Scans | Multiple | 2 | Multiple |
| Data Format | Horizontal | Horizontal | Vertical |
| Speed | Slow | Fast | Medium |
| Memory | High | Medium | Medium |
| Best For | Small data | Large data | Sparse data |

## 🎯 Key Concepts

### Support
- **Definition**: Fraction of transactions containing itemset
- **Formula**: `support(A) = count(A) / total_transactions`
- **Range**: 0 to 1

### Confidence
- **Definition**: How often rule is correct
- **Formula**: `confidence(A→B) = support(A∪B) / support(A)`
- **Range**: 0 to 1

### Lift
- **Definition**: Ratio of observed to expected support
- **Formula**: `lift(A→B) = support(A∪B) / (support(A) × support(B))`
- **Interpretation**:
  - lift > 1: Positive correlation
  - lift = 1: Independent
  - lift < 1: Negative correlation

## 💡 Use Cases

1. **Market Basket Analysis**
   - "Customers who buy X also buy Y"
   - Cross-selling recommendations

2. **Web Usage Mining**
   - Page navigation patterns
   - Click sequence analysis

3. **Medical Diagnosis**
   - Symptom → Disease rules
   - Drug interaction patterns

4. **Fraud Detection**
   - Unusual transaction patterns
   - Suspicious behavior rules

## 📁 File Structure

```typescript
export interface <Algorithm>Config {
  minSupport?: number;
  minConfidence?: number;
  ...
}

export const <Algorithm>Info = {
  name, description, pros, cons,
  hyperparameters, ...
}

export function run<Algorithm>(transactions, config) {
  // Mining logic
}
```

## 🔧 Typical Workflow

1. **Prepare Data**: Convert to transactional format
2. **Set Parameters**: min_support, min_confidence
3. **Mine Frequent Itemsets**: Run algorithm
4. **Generate Rules**: From frequent itemsets
5. **Filter Rules**: By confidence, lift
6. **Interpret**: Business insights

## ⚠️ Tips

- Start with high min_support, lower if too few results
- Use lift > 1 to filter meaningful rules
- Consider conviction metric for implication strength
- FP-Growth is usually the best choice for large data

