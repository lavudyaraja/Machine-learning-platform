/**
 * Double DQN
 * Deep Q-Network with double Q-learning to reduce overestimation bias
 */

export interface DoubleDQNConfig {
  learningRate?: number;
  discountFactor?: number;
  epsilon?: number;
  epsilonDecay?: number;
  epsilonMin?: number;
  batchSize?: number;
  replayBufferSize?: number;
  targetUpdateFrequency?: number;
  hiddenLayers?: number[];
}

export const DoubleDQNInfo = {
  name: "Double DQN",
  category: "reinforcement",
  description: "Deep Q-Network with double Q-learning to reduce overestimation bias in Q-value estimates",
  detailedDescription: `Double DQN extends DQN by using two networks to reduce overestimation bias: one network selects the best action, and the target network evaluates that action, preventing overestimation of Q-values.

Steps:

1.Environment: Agent interacts with environment with continuous/high-dimensional states, discrete actions.

2.Main Q-Network: Initialize Q-network Q(s,a;θ) with random weights θ.

3.Target Q-Network: Initialize target network Q(s,a;θ_target) with same architecture, copy weights from main network.

4.Experience Replay: Store experiences (s, a, r, s', done) in replay buffer D.

5.Exploration: Use ε-greedy policy: with probability ε, random action, else a = argmax_a Q(s,a;θ).

6.Collect Experience: Execute action, observe (s, a, r, s', done), store in replay buffer.

7.Sample Batch: Randomly sample batch of experiences from replay buffer.

8.Double Q-Learning: For each experience, compute target: y = r if done, else y = r + γ Q(s', argmax_a' Q(s',a';θ); θ_target) - uses main network to select action, target network to evaluate.

9.Reduce Overestimation: Double Q-learning reduces overestimation bias by decoupling action selection from evaluation.

10.Loss Function: Compute loss L = Σ(y - Q(s,a;θ))².

11.Gradient Update: Update main network: θ = θ - α∇_θ L.

12.Target Update: Periodically copy main network to target network θ_target.

13.Output: Trained Q-network with reduced overestimation bias for more stable learning.`,
  complexity: "High",
  bestFor: "Continuous state spaces, reducing Q-value overestimation",
  pros: [
    "Reduces overestimation bias",
    "More stable than DQN",
    "Better performance in many environments",
    "Handles continuous states",
    "Experience replay for stability"
  ],
  cons: [
    "More complex than DQN",
    "Requires two networks",
    "Hyperparameter sensitive",
    "Long training time"
  ],
  useCases: [
    "Atari games",
    "Continuous control",
    "Robotics",
    "When Q-value overestimation is problematic"
  ],
  hyperparameters: {
    learningRate: {
      description: "Learning rate for neural network",
      default: 0.0001,
      range: [0.00001, 0.001]
    },
    discountFactor: {
      description: "Discount factor for future rewards",
      default: 0.99,
      range: [0.1, 1.0]
    },
    batchSize: {
      description: "Batch size for experience replay",
      default: 32,
      range: [16, 128]
    }
  },
  requirements: {
    dataType: "Continuous or high-dimensional states",
    environment: "Markov Decision Process (MDP)",
    rewardFunction: "Required",
    stateSpace: "Continuous or discrete"
  },
  performance: {
    trainingSpeed: "Slow",
    convergence: "More stable than DQN",
    memoryUsage: "High (two networks + replay buffer)",
    scalability: "Good for continuous spaces"
  }
};

export function trainDoubleDQN(
  environment: any,
  config: DoubleDQNConfig
) {
  console.log("Training Double DQN with config:", config);
  return {
    model: "double_dqn",
    config,
    trained: true
  };
}
