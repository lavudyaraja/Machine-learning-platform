# Model Selection Library

Comprehensive machine learning model library organized by learning paradigm.

## 📁 Folder Structure

```
model-selection/
├── SupervisedLearning/
│   ├── classification/          # 16 classification models
│   ├── regression/              # 18 regression models
│   └── mixed-features/          # Models for numerical + categorical data
├── UnsupervisedLearning/        # Clustering, dimensionality reduction
├── ReinforcementLearning/       # RL agents and algorithms
└── ModelSelector.tsx            # Main UI component
```

## 🎯 Supervised Learning

### Classification Models (16 total)
**Linear Models:**
- Logistic Regression
- Perceptron
- Passive Aggressive Classifier

**Distance-Based:**
- K-Nearest Neighbors
- Linear Discriminant Analysis (LDA)
- Quadratic Discriminant Analysis (QDA)

**SVM:**
- SVM Linear
- SVM RBF/Poly

**Probabilistic:**
- Naive Bayes (Gaussian)

**Tree-Based:**
- Decision Tree
- Random Forest
- Extra Trees

**Boosting:**
- AdaBoost
- Gradient Boosting
- XGBoost
- LightGBM

### Regression Models (18 total)
**Linear:**
- Linear Regression
- Ridge, Lasso, Elastic Net
- Bayesian Ridge
- SGD Regressor

**Robust:**
- Huber Regressor
- Quantile Regression

**Non-Linear:**
- Polynomial Regression
- K-NN Regressor
- SVR

**Tree-Based:**
- Decision Tree
- Random Forest
- Extra Trees

**Boosting:**
- AdaBoost
- Gradient Boosting
- XGBoost
- LightGBM

### Mixed Features (9 total)
Models that handle numerical + categorical:
- CatBoost ⭐ (Best for categorical)
- LightGBM
- Decision Trees family
- Random Forest family
- Gradient Boosting family
- Naive Bayes (after encoding)
- KNN (after encoding)

## 🔍 Unsupervised Learning

### Clustering (9 models)
- K-Means family
- DBSCAN family
- Hierarchical methods
- Gaussian Mixture

### Dimensionality Reduction (6 models)
- PCA, SVD, Factor Analysis
- t-SNE, UMAP, Isomap

### Anomaly Detection (3 models)
- Isolation Forest
- One-Class SVM
- Local Outlier Factor

### Association Rules (2 models)
- Apriori
- FP-Growth

## 🎮 Reinforcement Learning

### Value-Based (7 models)
- Q-Learning, SARSA
- DQN family

### Policy-Based (2 models)
- REINFORCE, VPG

### Actor-Critic (6 models)
- A2C, A3C, DDPG, TD3, SAC

### Policy Optimization (2 models)
- PPO, TRPO

### Model-Based & Multi-Agent (3 models)
- Dyna-Q, AlphaZero, MADDPG

## 📖 File Structure

Each model file contains:
```typescript
export interface <Model>Config {
  // Hyperparameters
}

export const <Model>Info = {
  name, category, description,
  complexity, bestFor, pros, cons,
  useCases, hyperparameters,
  requirements, performance
}

export function train<Model>() {
  // Training logic
}
```

## 🎓 For Students

### Quick Decision Tree:
1. **Have labeled data?**
   - Yes → Supervised Learning
   - No → Unsupervised Learning
   - Environment interaction → Reinforcement Learning

2. **Supervised - What's the target?**
   - Categories → Classification
   - Numbers → Regression

3. **What type of features?**
   - Only numbers → numerical models
   - Mix of types → mixed-features models

4. **What's the priority?**
   - Speed → Linear models
   - Accuracy → Boosting (XGBoost, LightGBM)
   - Interpretability → Decision Tree, Linear models
   - Categorical data → CatBoost

## 🚀 Usage Example

```typescript
import { LogisticRegressionInfo, trainLogisticRegression } from 
  './SupervisedLearning/classification/LogisticRegression';

// Get model information
console.log(LogisticRegressionInfo.bestFor);
console.log(LogisticRegressionInfo.pros);

// Train model
const model = trainLogisticRegression(XTrain, yTrain, {
  C: 1.0,
  penalty: 'l2'
});
```

## 📊 Model Comparison

| Aspect | Linear | Tree | Boosting |
|--------|--------|------|----------|
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡ |
| Accuracy | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Interpretability | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Scaling Required | Yes | No | No |
| Categorical Support | No | After encoding | Native (some) |

## 🔗 Integration

Models integrate with:
- Dataset Splitting component
- Preprocessing pipeline
- Evaluation metrics
- Model deployment

---

Total Models: **60+** across all paradigms!

