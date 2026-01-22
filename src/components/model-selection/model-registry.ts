/**
 * Model Registry
 * Maps model IDs to their individual model file imports
 */

import type { Model } from "./types";

// Classification Models
import { LogisticRegressionInfo } from "./SupervisedLearning/classification/LogisticRegression";
import { KNNInfo } from "./SupervisedLearning/classification/KNearestNeighbors";
import { SVMLinearInfo } from "./SupervisedLearning/classification/SVM_Linear";
import { SVMRBFInfo } from "./SupervisedLearning/classification/SVM_RBF";
import { RandomForestClassifierInfo } from "./SupervisedLearning/classification/RandomForestClassifier";
import { XGBoostClassifierInfo } from "./SupervisedLearning/classification/XGBoostClassifier";
import { LightGBMClassifierInfo } from "./SupervisedLearning/classification/LightGBMClassifier";
import { DecisionTreeClassifierInfo } from "./SupervisedLearning/classification/DecisionTreeClassifier";
import { NaiveBayesGaussianInfo } from "./SupervisedLearning/classification/NaiveBayesGaussian";
import { PerceptronInfo } from "./SupervisedLearning/classification/Perceptron";
import { PassiveAggressiveClassifierInfo } from "./SupervisedLearning/classification/PassiveAggressiveClassifier";
import { LinearDiscriminantAnalysisInfo } from "./SupervisedLearning/classification/LinearDiscriminantAnalysis";
import { QuadraticDiscriminantAnalysisInfo } from "./SupervisedLearning/classification/QuadraticDiscriminantAnalysis";
import { ExtraTreesClassifierInfo } from "./SupervisedLearning/classification/ExtraTreesClassifier";
import { AdaBoostClassifierInfo } from "./SupervisedLearning/classification/AdaBoostClassifier";
import { GradientBoostingClassifierInfo } from "./SupervisedLearning/classification/GradientBoostingClassifier";

// Regression Models
import { LinearRegressionInfo } from "./SupervisedLearning/regression/LinearRegression";
import { RidgeRegressionInfo } from "./SupervisedLearning/regression/RidgeRegression";
import { LassoRegressionInfo } from "./SupervisedLearning/regression/LassoRegression";
import { ElasticNetRegressionInfo } from "./SupervisedLearning/regression/ElasticNetRegression";
import { BayesianRidgeRegressionInfo } from "./SupervisedLearning/regression/BayesianRidgeRegression";
import { PolynomialRegressionInfo } from "./SupervisedLearning/regression/PolynomialRegression";
import { SGDRegressorInfo } from "./SupervisedLearning/regression/SGDRegressor";
import { HuberRegressorInfo } from "./SupervisedLearning/regression/HuberRegressor";
import { QuantileRegressionInfo } from "./SupervisedLearning/regression/QuantileRegression";
import { KNearestNeighborsRegressorInfo } from "./SupervisedLearning/regression/KNearestNeighborsRegressor";
import { SupportVectorRegressorInfo } from "./SupervisedLearning/regression/SupportVectorRegressor";
import { DecisionTreeRegressorInfo } from "./SupervisedLearning/regression/DecisionTreeRegressor";
import { RandomForestRegressorInfo } from "./SupervisedLearning/regression/RandomForestRegressor";
import { ExtraTreesRegressorInfo } from "./SupervisedLearning/regression/ExtraTreesRegressor";
import { AdaBoostRegressorInfo } from "./SupervisedLearning/regression/AdaBoostRegressor";
import { GradientBoostingRegressorInfo } from "./SupervisedLearning/regression/GradientBoostingRegressor";
import { XGBoostRegressorInfo } from "./SupervisedLearning/regression/XGBoostRegressor";
import { LightGBMRegressorInfo } from "./SupervisedLearning/regression/LightGBMRegressor";

// Mixed Features Models
import { CatBoostInfo } from "./SupervisedLearning/mixed-features/CatBoost";
import { LightGBMInfo } from "./SupervisedLearning/mixed-features/LightGBM";
import { DecisionTreeInfo } from "./SupervisedLearning/mixed-features/DecisionTree";
import { RandomForestInfo } from "./SupervisedLearning/mixed-features/RandomForest";
import { ExtraTreesInfo } from "./SupervisedLearning/mixed-features/ExtraTrees";
import { GradientBoostingInfo } from "./SupervisedLearning/mixed-features/GradientBoosting";
import { XGBoostInfo } from "./SupervisedLearning/mixed-features/XGBoost";
import { NaiveBayesInfo } from "./SupervisedLearning/mixed-features/NaiveBayes";
import { KNNInfo as MixedKNNInfo } from "./SupervisedLearning/mixed-features/KNN";

// Reinforcement Learning Models
import { QLearningInfo } from "./ReinforcementLearning/QLearning";
import { SARSAInfo } from "./ReinforcementLearning/SARSA";
import { ExpectedSARSAInfo } from "./ReinforcementLearning/ExpectedSARSA";
import { DQNInfo } from "./ReinforcementLearning/DQN";
import { DoubleDQNInfo } from "./ReinforcementLearning/DoubleDQN";
import { DuelingDQNInfo } from "./ReinforcementLearning/DuelingDQN";
import { RainbowDQNInfo } from "./ReinforcementLearning/RainbowDQN";
import { REINFORCEInfo } from "./ReinforcementLearning/REINFORCE";
import { VPGInfo } from "./ReinforcementLearning/VPG";
import { A2CInfo } from "./ReinforcementLearning/A2C";
import { A3CInfo } from "./ReinforcementLearning/A3C";
import { DDPGInfo } from "./ReinforcementLearning/DDPG";
import { TD3Info } from "./ReinforcementLearning/TD3";
import { SACInfo } from "./ReinforcementLearning/SAC";
import { PPOInfo } from "./ReinforcementLearning/PPO";
import { TRPOInfo } from "./ReinforcementLearning/TRPO";
import { DynaQInfo } from "./ReinforcementLearning/Dyna-Q";
import { AlphaZeroInfo } from "./ReinforcementLearning/AlphaZero";
import { MADDPGInfo } from "./ReinforcementLearning/MADDPG";
import { QMIXInfo } from "./ReinforcementLearning/QMIX";

// Unsupervised Learning - Clustering Models
import { KMeansInfo } from "./UnsupervisedLearning/clustering/KMeans";
import { DBSCANInfo } from "./UnsupervisedLearning/clustering/DBSCAN";
import { GaussianMixtureInfo } from "./UnsupervisedLearning/clustering/GaussianMixture";
import { HierarchicalClusteringInfo } from "./UnsupervisedLearning/clustering/HierarchicalClustering";
import { AgglomerativeClusteringInfo } from "./UnsupervisedLearning/clustering/AgglomerativeClustering";
import { MeanShiftInfo } from "./UnsupervisedLearning/clustering/MeanShift";
import { SpectralClusteringInfo } from "./UnsupervisedLearning/clustering/SpectralClustering";
import { OPTICSInfo } from "./UnsupervisedLearning/clustering/OPTICS";
import { HDBSCANInfo } from "./UnsupervisedLearning/clustering/HDBSCAN";
import { BIRCHInfo } from "./UnsupervisedLearning/clustering/BIRCH";
import { MiniBatchKMeansInfo } from "./UnsupervisedLearning/clustering/MiniBatchKMeans";

// Unsupervised Learning - Association Rules Models
import { AprioriInfo } from "./UnsupervisedLearning/association-rules/Apriori";
import { FPGrowthInfo } from "./UnsupervisedLearning/association-rules/FPGrowth";
import { ECLATInfo } from "./UnsupervisedLearning/association-rules/ECLAT";

// Helper function to convert model info to Model type
function createModelFromInfo(
  id: string,
  info: any,
  category: "classification" | "regression" | "both" | "reinforcement" | "clustering" | "association_rules",
  paradigm: "supervised" | "unsupervised" | "reinforcement" = "supervised",
  icon: string,
  color: string
): Model {
  const featureType: "numerical" | "categorical_mixed" = 
    info.requirements?.categorical?.includes("natively") || 
    info.requirements?.categorical?.includes("Can handle natively")
      ? "categorical_mixed"
      : "numerical";

  // Map category to TaskType
  const taskType: "classification" | "regression" | "clustering" | "association_rules" | "reinforcement" = 
    category === "both" ? "classification" : 
    category === "reinforcement" ? "reinforcement" :
    category === "clustering" ? "clustering" :
    category === "association_rules" ? "association_rules" :
    category;

  return {
    id,
    name: info.name,
    category: taskType,
    paradigm,
    featureType,
    complexity: info.complexity as "Low" | "Medium" | "High",
    description: info.description,
    icon,
    color,
    pros: info.pros || [],
    cons: info.cons || [],
    bestFor: info.bestFor || "",
    useCases: info.useCases || [],
  };
}

// Model ID to Info mapping
export const MODEL_REGISTRY: Record<string, () => Model> = {
  // Classification
  "logistic-regression": () => createModelFromInfo(
    "logistic-regression",
    LogisticRegressionInfo,
    "classification",
    "supervised",
    "📈",
    "from-blue-500 to-cyan-500"
  ),
  "knn-classifier": () => createModelFromInfo(
    "knn-classifier",
    KNNInfo,
    "classification",
    "supervised",
    "🎯",
    "from-purple-500 to-pink-500"
  ),
  "svm-classifier": () => createModelFromInfo(
    "svm-classifier",
    SVMLinearInfo,
    "classification",
    "supervised",
    "⚔️",
    "from-orange-500 to-red-500"
  ),
  "svm-rbf": () => createModelFromInfo(
    "svm-rbf",
    SVMRBFInfo,
    "classification",
    "supervised",
    "⚔️",
    "from-red-500 to-pink-500"
  ),
  "random-forest-classifier": () => createModelFromInfo(
    "random-forest-classifier",
    RandomForestClassifierInfo,
    "classification",
    "supervised",
    "🌲",
    "from-green-500 to-emerald-500"
  ),
  "xgboost-classifier": () => createModelFromInfo(
    "xgboost-classifier",
    XGBoostClassifierInfo,
    "classification",
    "supervised",
    "🚀",
    "from-indigo-500 to-purple-500"
  ),
  "lightgbm-classifier": () => createModelFromInfo(
    "lightgbm-classifier",
    LightGBMClassifierInfo,
    "classification",
    "supervised",
    "💡",
    "from-yellow-500 to-orange-500"
  ),
  "decision-tree-classifier": () => createModelFromInfo(
    "decision-tree-classifier",
    DecisionTreeClassifierInfo,
    "classification",
    "supervised",
    "🌳",
    "from-lime-500 to-green-500"
  ),
  "naive-bayes": () => createModelFromInfo(
    "naive-bayes",
    NaiveBayesGaussianInfo,
    "classification",
    "supervised",
    "🎲",
    "from-teal-500 to-cyan-500"
  ),
  "perceptron": () => createModelFromInfo(
    "perceptron",
    PerceptronInfo,
    "classification",
    "supervised",
    "🧠",
    "from-violet-500 to-purple-500"
  ),
  "passive-aggressive-classifier": () => createModelFromInfo(
    "passive-aggressive-classifier",
    PassiveAggressiveClassifierInfo,
    "classification",
    "supervised",
    "⚡",
    "from-yellow-500 to-amber-500"
  ),
  "lda": () => createModelFromInfo(
    "lda",
    LinearDiscriminantAnalysisInfo,
    "classification",
    "supervised",
    "📐",
    "from-blue-500 to-indigo-500"
  ),
  "qda": () => createModelFromInfo(
    "qda",
    QuadraticDiscriminantAnalysisInfo,
    "classification",
    "supervised",
    "📊",
    "from-indigo-500 to-purple-500"
  ),
  "extra-trees-classifier": () => createModelFromInfo(
    "extra-trees-classifier",
    ExtraTreesClassifierInfo,
    "classification",
    "supervised",
    "🌴",
    "from-green-500 to-teal-500"
  ),
  "adaboost-classifier": () => createModelFromInfo(
    "adaboost-classifier",
    AdaBoostClassifierInfo,
    "classification",
    "supervised",
    "📈",
    "from-orange-500 to-red-500"
  ),
  "gradient-boosting-classifier": () => createModelFromInfo(
    "gradient-boosting-classifier",
    GradientBoostingClassifierInfo,
    "classification",
    "supervised",
    "🚀",
    "from-purple-500 to-pink-500"
  ),

  // Regression
  "linear-regression": () => createModelFromInfo(
    "linear-regression",
    LinearRegressionInfo,
    "regression",
    "supervised",
    "📊",
    "from-blue-500 to-indigo-500"
  ),
  "ridge-regression": () => createModelFromInfo(
    "ridge-regression",
    RidgeRegressionInfo,
    "regression",
    "supervised",
    "🏔️",
    "from-slate-500 to-zinc-500"
  ),
  "lasso-regression": () => createModelFromInfo(
    "lasso-regression",
    LassoRegressionInfo,
    "regression",
    "supervised",
    "🎯",
    "from-rose-500 to-pink-500"
  ),
  "elastic-net": () => createModelFromInfo(
    "elastic-net",
    ElasticNetRegressionInfo,
    "regression",
    "supervised",
    "🎯",
    "from-rose-500 to-pink-500"
  ),
  "bayesian-ridge": () => createModelFromInfo(
    "bayesian-ridge",
    BayesianRidgeRegressionInfo,
    "regression",
    "supervised",
    "🔮",
    "from-purple-500 to-indigo-500"
  ),
  "polynomial-regression": () => createModelFromInfo(
    "polynomial-regression",
    PolynomialRegressionInfo,
    "regression",
    "supervised",
    "📈",
    "from-blue-500 to-cyan-500"
  ),
  "sgd-regressor": () => createModelFromInfo(
    "sgd-regressor",
    SGDRegressorInfo,
    "regression",
    "supervised",
    "⚡",
    "from-yellow-500 to-orange-500"
  ),
  "huber-regressor": () => createModelFromInfo(
    "huber-regressor",
    HuberRegressorInfo,
    "regression",
    "supervised",
    "🛡️",
    "from-slate-500 to-gray-500"
  ),
  "quantile-regression": () => createModelFromInfo(
    "quantile-regression",
    QuantileRegressionInfo,
    "regression",
    "supervised",
    "📊",
    "from-indigo-500 to-blue-500"
  ),
  "knn-regressor": () => createModelFromInfo(
    "knn-regressor",
    KNearestNeighborsRegressorInfo,
    "regression",
    "supervised",
    "🎯",
    "from-purple-500 to-pink-500"
  ),
  "svr": () => createModelFromInfo(
    "svr",
    SupportVectorRegressorInfo,
    "regression",
    "supervised",
    "⚡",
    "from-amber-500 to-orange-500"
  ),
  "decision-tree-regressor": () => createModelFromInfo(
    "decision-tree-regressor",
    DecisionTreeRegressorInfo,
    "regression",
    "supervised",
    "🌳",
    "from-lime-500 to-green-500"
  ),
  "random-forest-regressor": () => createModelFromInfo(
    "random-forest-regressor",
    RandomForestRegressorInfo,
    "regression",
    "supervised",
    "🌲",
    "from-green-500 to-teal-500"
  ),
  "extra-trees-regressor": () => createModelFromInfo(
    "extra-trees-regressor",
    ExtraTreesRegressorInfo,
    "regression",
    "supervised",
    "🌴",
    "from-green-500 to-teal-500"
  ),
  "adaboost-regressor": () => createModelFromInfo(
    "adaboost-regressor",
    AdaBoostRegressorInfo,
    "regression",
    "supervised",
    "📈",
    "from-orange-500 to-red-500"
  ),
  "gradient-boosting-regressor": () => createModelFromInfo(
    "gradient-boosting-regressor",
    GradientBoostingRegressorInfo,
    "regression",
    "supervised",
    "🚀",
    "from-purple-500 to-pink-500"
  ),
  "xgboost-regressor": () => createModelFromInfo(
    "xgboost-regressor",
    XGBoostRegressorInfo,
    "regression",
    "supervised",
    "🚀",
    "from-violet-500 to-purple-500"
  ),
  "lightgbm-regressor": () => createModelFromInfo(
    "lightgbm-regressor",
    LightGBMRegressorInfo,
    "regression",
    "supervised",
    "💡",
    "from-yellow-500 to-orange-500"
  ),

  // Mixed Features
  "catboost-classifier": () => createModelFromInfo(
    "catboost-classifier",
    CatBoostInfo,
    "classification",
    "supervised",
    "🐱",
    "from-amber-500 to-yellow-500"
  ),
  "catboost-regressor": () => createModelFromInfo(
    "catboost-regressor",
    CatBoostInfo,
    "regression",
    "supervised",
    "🐱",
    "from-amber-500 to-yellow-500"
  ),

  // Reinforcement Learning - Value-Based
  "q-learning": () => createModelFromInfo(
    "q-learning",
    QLearningInfo,
    "reinforcement",
    "reinforcement",
    "🎯",
    "from-blue-500 to-cyan-500"
  ),
  "sarsa": () => createModelFromInfo(
    "sarsa",
    SARSAInfo,
    "reinforcement",
    "reinforcement",
    "🔄",
    "from-green-500 to-emerald-500"
  ),
  "expected-sarsa": () => createModelFromInfo(
    "expected-sarsa",
    ExpectedSARSAInfo,
    "reinforcement",
    "reinforcement",
    "📊",
    "from-teal-500 to-cyan-500"
  ),
  "dqn": () => createModelFromInfo(
    "dqn",
    DQNInfo,
    "reinforcement",
    "reinforcement",
    "🧠",
    "from-purple-500 to-pink-500"
  ),
  "double-dqn": () => createModelFromInfo(
    "double-dqn",
    DoubleDQNInfo,
    "reinforcement",
    "reinforcement",
    "🎲",
    "from-indigo-500 to-purple-500"
  ),
  "dueling-dqn": () => createModelFromInfo(
    "dueling-dqn",
    DuelingDQNInfo,
    "reinforcement",
    "reinforcement",
    "⚔️",
    "from-violet-500 to-purple-500"
  ),
  "rainbow-dqn": () => createModelFromInfo(
    "rainbow-dqn",
    RainbowDQNInfo,
    "reinforcement",
    "reinforcement",
    "🌈",
    "from-pink-500 to-rose-500"
  ),

  // Reinforcement Learning - Policy-Based
  "reinforce": () => createModelFromInfo(
    "reinforce",
    REINFORCEInfo,
    "reinforcement",
    "reinforcement",
    "📈",
    "from-orange-500 to-red-500"
  ),
  "vpg": () => createModelFromInfo(
    "vpg",
    VPGInfo,
    "reinforcement",
    "reinforcement",
    "🎪",
    "from-yellow-500 to-orange-500"
  ),

  // Reinforcement Learning - Actor-Critic
  "a2c": () => createModelFromInfo(
    "a2c",
    A2CInfo,
    "reinforcement",
    "reinforcement",
    "🎭",
    "from-blue-500 to-indigo-500"
  ),
  "a3c": () => createModelFromInfo(
    "a3c",
    A3CInfo,
    "reinforcement",
    "reinforcement",
    "⚡",
    "from-cyan-500 to-blue-500"
  ),
  "ddpg": () => createModelFromInfo(
    "ddpg",
    DDPGInfo,
    "reinforcement",
    "reinforcement",
    "🤖",
    "from-slate-500 to-gray-500"
  ),
  "td3": () => createModelFromInfo(
    "td3",
    TD3Info,
    "reinforcement",
    "reinforcement",
    "🔧",
    "from-zinc-500 to-slate-500"
  ),
  "sac": () => createModelFromInfo(
    "sac",
    SACInfo,
    "reinforcement",
    "reinforcement",
    "❄️",
    "from-sky-500 to-blue-500"
  ),

  // Reinforcement Learning - Policy Optimization
  "ppo": () => createModelFromInfo(
    "ppo",
    PPOInfo,
    "reinforcement",
    "reinforcement",
    "🛡️",
    "from-emerald-500 to-green-500"
  ),
  "trpo": () => createModelFromInfo(
    "trpo",
    TRPOInfo,
    "reinforcement",
    "reinforcement",
    "🔒",
    "from-teal-500 to-cyan-500"
  ),

  // Reinforcement Learning - Model-Based
  "dyna-q": () => createModelFromInfo(
    "dyna-q",
    DynaQInfo,
    "reinforcement",
    "reinforcement",
    "🌳",
    "from-lime-500 to-green-500"
  ),
  "alphazero": () => createModelFromInfo(
    "alphazero",
    AlphaZeroInfo,
    "reinforcement",
    "reinforcement",
    "♟️",
    "from-amber-500 to-yellow-500"
  ),

  // Reinforcement Learning - Multi-Agent
  "maddpg": () => createModelFromInfo(
    "maddpg",
    MADDPGInfo,
    "reinforcement",
    "reinforcement",
    "👥",
    "from-fuchsia-500 to-pink-500"
  ),
  "qmix": () => createModelFromInfo(
    "qmix",
    QMIXInfo,
    "reinforcement",
    "reinforcement",
    "🔀",
    "from-rose-500 to-pink-500"
  ),

  // Unsupervised Learning - Clustering
  "k-means": () => createModelFromInfo(
    "k-means",
    KMeansInfo,
    "clustering",
    "unsupervised",
    "🎯",
    "from-blue-500 to-cyan-500"
  ),
  "dbscan": () => createModelFromInfo(
    "dbscan",
    DBSCANInfo,
    "clustering",
    "unsupervised",
    "🔍",
    "from-green-500 to-emerald-500"
  ),
  "gaussian-mixture": () => createModelFromInfo(
    "gaussian-mixture",
    GaussianMixtureInfo,
    "clustering",
    "unsupervised",
    "📊",
    "from-purple-500 to-pink-500"
  ),
  "hierarchical-clustering": () => createModelFromInfo(
    "hierarchical-clustering",
    HierarchicalClusteringInfo,
    "clustering",
    "unsupervised",
    "🌳",
    "from-teal-500 to-cyan-500"
  ),
  "agglomerative-clustering": () => createModelFromInfo(
    "agglomerative-clustering",
    AgglomerativeClusteringInfo,
    "clustering",
    "unsupervised",
    "🔗",
    "from-indigo-500 to-blue-500"
  ),
  "mean-shift": () => createModelFromInfo(
    "mean-shift",
    MeanShiftInfo,
    "clustering",
    "unsupervised",
    "📈",
    "from-orange-500 to-red-500"
  ),
  "spectral-clustering": () => createModelFromInfo(
    "spectral-clustering",
    SpectralClusteringInfo,
    "clustering",
    "unsupervised",
    "🌈",
    "from-violet-500 to-purple-500"
  ),
  "optics": () => createModelFromInfo(
    "optics",
    OPTICSInfo,
    "clustering",
    "unsupervised",
    "🔬",
    "from-amber-500 to-yellow-500"
  ),
  "hdbscan": () => createModelFromInfo(
    "hdbscan",
    HDBSCANInfo,
    "clustering",
    "unsupervised",
    "🌲",
    "from-emerald-500 to-green-500"
  ),
  "birch": () => createModelFromInfo(
    "birch",
    BIRCHInfo,
    "clustering",
    "unsupervised",
    "🌿",
    "from-lime-500 to-green-500"
  ),
  "minibatch-k-means": () => createModelFromInfo(
    "minibatch-k-means",
    MiniBatchKMeansInfo,
    "clustering",
    "unsupervised",
    "⚡",
    "from-yellow-500 to-orange-500"
  ),

  // Unsupervised Learning - Association Rules
  "apriori": () => createModelFromInfo(
    "apriori",
    AprioriInfo,
    "association_rules",
    "unsupervised",
    "🛒",
    "from-blue-500 to-indigo-500"
  ),
  "fp-growth": () => createModelFromInfo(
    "fp-growth",
    FPGrowthInfo,
    "association_rules",
    "unsupervised",
    "🌳",
    "from-green-500 to-teal-500"
  ),
  "eclat": () => createModelFromInfo(
    "eclat",
    ECLATInfo,
    "association_rules",
    "unsupervised",
    "📋",
    "from-purple-500 to-violet-500"
  ),
};

// Get all models
export function getAllModels(): Model[] {
  return Object.keys(MODEL_REGISTRY).map(id => MODEL_REGISTRY[id]());
}

// Get model by ID
export function getModelById(id: string): Model | null {
  const modelFactory = MODEL_REGISTRY[id];
  return modelFactory ? modelFactory() : null;
}

// Get model info by ID (for DetailedPanel)
export function getModelInfoById(id: string): any {
  // Map model IDs to their info objects - must match MODEL_REGISTRY keys exactly
  const infoMap: Record<string, any> = {
    // Classification
    "logistic-regression": LogisticRegressionInfo,
    "knn-classifier": KNNInfo,
    "svm-classifier": SVMLinearInfo,
    "svm-rbf": SVMRBFInfo,
    "random-forest-classifier": RandomForestClassifierInfo,
    "xgboost-classifier": XGBoostClassifierInfo,
    "lightgbm-classifier": LightGBMClassifierInfo,
    "decision-tree-classifier": DecisionTreeClassifierInfo,
    "naive-bayes": NaiveBayesGaussianInfo,
    "perceptron": PerceptronInfo,
    "passive-aggressive-classifier": PassiveAggressiveClassifierInfo,
    "lda": LinearDiscriminantAnalysisInfo,
    "qda": QuadraticDiscriminantAnalysisInfo,
    "extra-trees-classifier": ExtraTreesClassifierInfo,
    "adaboost-classifier": AdaBoostClassifierInfo,
    "gradient-boosting-classifier": GradientBoostingClassifierInfo,
    
    // Regression
    "linear-regression": LinearRegressionInfo,
    "ridge-regression": RidgeRegressionInfo,
    "lasso-regression": LassoRegressionInfo,
    "elastic-net": ElasticNetRegressionInfo,
    "bayesian-ridge": BayesianRidgeRegressionInfo,
    "polynomial-regression": PolynomialRegressionInfo,
    "sgd-regressor": SGDRegressorInfo,
    "huber-regressor": HuberRegressorInfo,
    "quantile-regression": QuantileRegressionInfo,
    "knn-regressor": KNearestNeighborsRegressorInfo,
    "svr": SupportVectorRegressorInfo,
    "decision-tree-regressor": DecisionTreeRegressorInfo,
    "random-forest-regressor": RandomForestRegressorInfo,
    "extra-trees-regressor": ExtraTreesRegressorInfo,
    "adaboost-regressor": AdaBoostRegressorInfo,
    "gradient-boosting-regressor": GradientBoostingRegressorInfo,
    "xgboost-regressor": XGBoostRegressorInfo,
    "lightgbm-regressor": LightGBMRegressorInfo,
    
    // Mixed Features
    "catboost-classifier": CatBoostInfo,
    "catboost-regressor": CatBoostInfo,
    
    // Reinforcement Learning
    "q-learning": QLearningInfo,
    "sarsa": SARSAInfo,
    "expected-sarsa": ExpectedSARSAInfo,
    "dqn": DQNInfo,
    "double-dqn": DoubleDQNInfo,
    "dueling-dqn": DuelingDQNInfo,
    "rainbow-dqn": RainbowDQNInfo,
    "reinforce": REINFORCEInfo,
    "vpg": VPGInfo,
    "a2c": A2CInfo,
    "a3c": A3CInfo,
    "ddpg": DDPGInfo,
    "td3": TD3Info,
    "sac": SACInfo,
    "ppo": PPOInfo,
    "trpo": TRPOInfo,
    "dyna-q": DynaQInfo,
    "alphazero": AlphaZeroInfo,
    "maddpg": MADDPGInfo,
    "qmix": QMIXInfo,
    
    // Unsupervised Learning - Clustering
    "k-means": KMeansInfo,
    "dbscan": DBSCANInfo,
    "gaussian-mixture": GaussianMixtureInfo,
    "hierarchical-clustering": HierarchicalClusteringInfo,
    "agglomerative-clustering": AgglomerativeClusteringInfo,
    "mean-shift": MeanShiftInfo,
    "spectral-clustering": SpectralClusteringInfo,
    "optics": OPTICSInfo,
    "hdbscan": HDBSCANInfo,
    "birch": BIRCHInfo,
    "minibatch-k-means": MiniBatchKMeansInfo,
    
    // Unsupervised Learning - Association Rules
    "apriori": AprioriInfo,
    "fp-growth": FPGrowthInfo,
    "eclat": ECLATInfo,
  };

  // Direct lookup - ensure exact match
  if (id in infoMap) {
    return infoMap[id];
  }
  
  // Debug: Log if model info not found (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(`[getModelInfoById] Model info not found for ID: "${id}"`);
    console.warn(`Available IDs:`, Object.keys(infoMap).slice(0, 10), '...');
  }
  
  return null;
}
