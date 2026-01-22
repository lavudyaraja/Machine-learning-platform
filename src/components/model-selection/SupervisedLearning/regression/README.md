# Regression Models

This folder contains individual model files for all regression algorithms.

## Available Models:

### Linear Models
1. **LinearRegression.tsx** - Ordinary least squares
2. **RidgeRegression.tsx** - L2 regularization
3. **LassoRegression.tsx** - L1 regularization
4. **ElasticNetRegression.tsx** - Combined L1+L2
5. **BayesianRidgeRegression.tsx** - Bayesian approach

### Polynomial & Advanced Linear
6. **PolynomialRegression.tsx** - Polynomial features
7. **SGDRegressor.tsx** - Stochastic gradient descent

### Robust Regression
8. **HuberRegressor.tsx** - Robust to outliers
9. **QuantileRegression.tsx** - Predicts quantiles

### Distance-Based
10. **KNearestNeighborsRegressor.tsx** - K-NN regressor

### Support Vector Machines
11. **SupportVectorRegressor.tsx** - SVR

### Tree-Based Models
12. **DecisionTreeRegressor.tsx** - Single decision tree
13. **RandomForestRegressor.tsx** - Ensemble of trees
14. **ExtraTreesRegressor.tsx** - Extremely randomized trees

### Boosting Models
15. **AdaBoostRegressor.tsx** - Adaptive boosting
16. **GradientBoostingRegressor.tsx** - Gradient boosting
17. **XGBoostRegressor.tsx** - Extreme gradient boosting
18. **LightGBMRegressor.tsx** - Light gradient boosting

## Usage:
Each file exports:
- `<ModelName>Config` - Configuration interface
- `<ModelName>Info` - Model metadata
- `train<ModelName>` - Training function

## Model Selection:
- **Linear Relationships**: Linear, Ridge, Lasso
- **Non-linear**: Random Forest, XGBoost
- **Outliers Present**: Huber Regressor
- **Feature Selection**: Lasso, Elastic Net

