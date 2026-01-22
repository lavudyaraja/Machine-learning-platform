# Classification Models

This folder contains individual model files for all classification algorithms.

## Available Models:

### Linear Models
1. **LogisticRegression.tsx** - Linear model for classification
2. **Perceptron.tsx** - Single layer neural network
3. **PassiveAggressiveClassifier.tsx** - Online learning algorithm

### Distance-Based Models
4. **KNearestNeighbors.tsx** - K-NN classifier
5. **LinearDiscriminantAnalysis.tsx** - LDA for classification
6. **QuadraticDiscriminantAnalysis.tsx** - QDA for classification

### Support Vector Machines
7. **SVM_Linear.tsx** - Linear kernel SVM
8. **SVM_RBF.tsx** - RBF kernel SVM

### Probabilistic Models
9. **NaiveBayesGaussian.tsx** - Gaussian Naive Bayes

### Tree-Based Models
10. **DecisionTreeClassifier.tsx** - Single decision tree
11. **RandomForestClassifier.tsx** - Ensemble of trees
12. **ExtraTreesClassifier.tsx** - Extremely randomized trees

### Boosting Models
13. **AdaBoostClassifier.tsx** - Adaptive boosting
14. **GradientBoostingClassifier.tsx** - Gradient boosting
15. **XGBoostClassifier.tsx** - Extreme gradient boosting
16. **LightGBMClassifier.tsx** - Light gradient boosting

## Usage:
Each file exports:
- `<ModelName>Config` - Configuration interface
- `<ModelName>Info` - Model metadata and information
- `train<ModelName>` - Training function

## Model Selection:
- **Simple Problems**: Logistic Regression, KNN
- **High Accuracy**: XGBoost, Random Forest
- **Interpretability**: Decision Tree, Logistic Regression
- **Speed**: Logistic Regression, Naive Bayes

