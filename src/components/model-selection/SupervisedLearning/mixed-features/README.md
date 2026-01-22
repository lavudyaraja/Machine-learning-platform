# Mixed Features Models

Models that can handle both numerical and categorical features natively.

## Classification & Regression (Both)

### Tree-Based Ensemble
1. **DecisionTree.tsx** - Single tree (both tasks)
2. **RandomForest.tsx** - Random forest (both tasks)
3. **ExtraTrees.tsx** - Extra trees (both tasks)

### Gradient Boosting
4. **GradientBoosting.tsx** - GB (both tasks)
5. **XGBoost.tsx** - XGBoost (both tasks)
6. **LightGBM.tsx** - LightGBM (both tasks)
7. **CatBoost.tsx** - CatBoost (both tasks) ⭐ Best for categorical

## Classification Only

8. **NaiveBayes.tsx** - After encoding
9. **KNN.tsx** - After encoding

## Regression Only

10. **DecisionTreeRegressor.tsx** - Single tree
11. **RandomForestRegressor.tsx** - Random forest
12. **GradientBoostingRegressor.tsx** - GB regressor

## Key Advantage:
These models can handle categorical features with minimal preprocessing:
- **CatBoost**: Native categorical support (no encoding needed)
- **LightGBM**: Efficient categorical handling
- **Tree-based**: Work after label/one-hot encoding

## When to Use:
✅ Dataset has mix of numerical and categorical columns  
✅ Want to avoid extensive feature engineering  
✅ Need high accuracy with less preprocessing  
✅ Working with real-world business data  

