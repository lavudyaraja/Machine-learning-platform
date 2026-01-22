/**
 * SARSA (State-Action-Reward-State-Action)
 * On-policy temporal difference learning algorithm
 */

export interface SARSAConfig {
  learningRate?: number;
  discountFactor?: number;
  epsilon?: number;
  epsilonDecay?: number;
  epsilonMin?: number;
  episodes?: number;
  maxStepsPerEpisode?: number;
}

export const SARSAInfo = {
  name: "SARSA",
  category: "reinforcement",
  description: "On-policy temporal difference learning algorithm",
  detailedDescription: `SARSA (State-Action-Reward-State-Action) is an on-policy temporal difference learning algorithm that learns Q-values by following the current policy, updating based on actual action taken.

Steps:

1.Environment: Agent interacts with environment, receives state s, takes action a, gets reward r and next state s'.

2.Q-Table: Initialize Q-table Q(s,a) = 0 for all state-action pairs (tabular method for discrete states/actions).

3.Exploration Policy: Use ε-greedy policy: with probability ε, choose random action, else choose argmax_a Q(s,a).

4.Action Selection: In state s, select action a using ε-greedy policy.

5.Environment Step: Execute action a, observe reward r and next state s'.

6.Next Action: In state s', select next action a' using same ε-greedy policy (on-policy - uses actual policy).

7.Q-Value Update: Update Q-value: Q(s,a) = Q(s,a) + α[r + γ Q(s',a') - Q(s,a)] where α is learning rate, γ is discount factor.

8.On-Policy: SARSA is on-policy - learns Q-values for policy it's following (more conservative than Q-Learning).

9.Iterate: Repeat steps 4-7 for many episodes until Q-values converge.

10.Output: Learned Q-table for the policy being followed. More conservative than Q-Learning as it considers actual next action.`,
  complexity: "Medium",
  bestFor: "Discrete state-action spaces, on-policy learning",
  pros: [
    "On-policy learning (safer exploration)",
    "Simple and well-understood",
    "Model-free",
    "Works well for discrete spaces",
    "More conservative than Q-learning"
  ],
  cons: [
    "Only for discrete spaces",
    "Slower convergence than Q-learning",
    "Memory intensive",
    "Requires exploration strategy"
  ],
  useCases: [
    "Grid world problems",
    "Discrete control",
    "When safety is important",
    "On-policy scenarios"
  ],
  hyperparameters: {
    learningRate: {
      description: "Learning rate (alpha)",
      default: 0.1,
      range: [0.01, 1.0]
    },
    discountFactor: {
      description: "Discount factor (gamma)",
      default: 0.99,
      range: [0.1, 1.0]
    },
    epsilon: {
      description: "Initial exploration rate",
      default: 1.0,
      range: [0.0, 1.0]
    }
  },
  requirements: {
    dataType: "Discrete state-action spaces",
    environment: "Markov Decision Process",
    rewardFunction: "Required"
  },
  performance: {
    trainingSpeed: "Medium",
    convergence: "Slower than Q-learning",
    memoryUsage: "High for large spaces",
    scalability: "Limited to discrete"
  }
};

export function trainSARSA(
  environment: any,
  config: SARSAConfig
) {
  console.log("Training SARSA with config:", config);
  return {
    model: "sarsa",
    config,
    trained: true
  };
}

