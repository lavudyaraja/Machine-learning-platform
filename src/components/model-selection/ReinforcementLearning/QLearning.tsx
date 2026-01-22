/**
 * Q-Learning
 * Classic tabular Q-learning algorithm for reinforcement learning
 */

export interface QLearningConfig {
  learningRate?: number; // Alpha
  discountFactor?: number; // Gamma
  epsilon?: number; // Exploration rate
  epsilonDecay?: number;
  epsilonMin?: number;
  episodes?: number;
  maxStepsPerEpisode?: number;
}

export const QLearningInfo = {
  name: "Q-Learning",
  category: "reinforcement",
  description: "Classic tabular Q-learning algorithm for model-free reinforcement learning",
  detailedDescription: `Q-Learning is a model-free, off-policy reinforcement learning algorithm that learns optimal action-value function Q(s,a) using temporal difference learning and Bellman equation.

Steps:

1.Environment: Agent interacts with environment, receives state s, takes action a, gets reward r and next state s'.

2.Q-Table: Initialize Q-table Q(s,a) = 0 for all state-action pairs (tabular method, requires discrete states/actions).

3.Exploration vs Exploitation: Use ε-greedy policy: with probability ε, choose random action (explore), else choose argmax_a Q(s,a) (exploit).

4.Action Selection: In state s, select action a using ε-greedy policy.

5.Environment Step: Execute action a, observe reward r and next state s'.

6.Q-Value Update: Update Q-value using Bellman equation: Q(s,a) = Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)] where α is learning rate, γ is discount factor.

7.Off-Policy: Q-Learning is off-policy - learns optimal policy while following exploration policy (ε-greedy).

8.Iterate: Repeat steps 4-6 for many episodes until Q-values converge.

9.Optimal Policy: After convergence, optimal policy π*(s) = argmax_a Q(s,a).

10.Output: Learned Q-table representing optimal action values for all state-action pairs.`,
  complexity: "Medium",
  bestFor: "Discrete state-action spaces, tabular problems",
  pros: [
    "Simple and well-understood",
    "Model-free (no environment model needed)",
    "Guaranteed convergence under certain conditions",
    "Works well for discrete spaces",
    "Off-policy learning"
  ],
  cons: [
    "Only works for discrete state-action spaces",
    "Memory intensive for large state spaces",
    "Slow convergence for large problems",
    "Requires exploration strategy"
  ],
  useCases: [
    "Grid world problems",
    "Simple game playing",
    "Discrete control problems",
    "Educational purposes",
    "Small state-action spaces"
  ],
  hyperparameters: {
    learningRate: {
      description: "Learning rate (alpha) - how much to update Q-values",
      default: 0.1,
      range: [0.01, 1.0]
    },
    discountFactor: {
      description: "Discount factor (gamma) - importance of future rewards",
      default: 0.99,
      range: [0.1, 1.0]
    },
    epsilon: {
      description: "Initial exploration rate",
      default: 1.0,
      range: [0.0, 1.0]
    },
    epsilonDecay: {
      description: "Rate at which epsilon decreases",
      default: 0.995,
      range: [0.9, 1.0]
    },
    episodes: {
      description: "Number of training episodes",
      default: 1000,
      range: [100, 10000]
    }
  },
  requirements: {
    dataType: "Discrete state-action spaces",
    environment: "Markov Decision Process (MDP)",
    rewardFunction: "Required",
    stateSpace: "Discrete and finite"
  },
  performance: {
    trainingSpeed: "Medium",
    convergence: "Guaranteed under certain conditions",
    memoryUsage: "High for large state spaces",
    scalability: "Limited to discrete spaces"
  }
};

export function trainQLearning(
  environment: any,
  config: QLearningConfig
) {
  console.log("Training Q-Learning with config:", config);
  return {
    model: "q_learning",
    config,
    trained: true
  };
}

