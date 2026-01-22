/**
 * Dyna-Q
 * Model-based reinforcement learning combining Q-learning with planning
 */

export interface DynaQConfig {
  learningRate?: number;
  discountFactor?: number;
  epsilon?: number;
  epsilonDecay?: number;
  epsilonMin?: number;
  planningSteps?: number; // Number of planning steps per real step
  episodes?: number;
  maxStepsPerEpisode?: number;
}

export const DynaQInfo = {
  name: "Dyna-Q",
  category: "reinforcement",
  description: "Model-based reinforcement learning that combines Q-learning with planning using learned environment model",
  detailedDescription: `Dyna-Q is a model-based reinforcement learning algorithm that combines Q-learning with planning. It learns a model of the environment and uses it for planning, accelerating learning by simulating experiences.

Steps:

1.Environment: Agent interacts with environment, receives state s, takes action a, gets reward r and next state s'.

2.Q-Table: Initialize Q-table Q(s,a) = 0 for all state-action pairs (tabular method).

3.Environment Model: Initialize model M(s,a) = (r, s') that predicts reward and next state for state-action pairs.

4.Real Experience: In state s, select action a using ε-greedy policy, execute in environment, observe real (r, s').

5.Q-Learning Update: Update Q-value using real experience: Q(s,a) = Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)].

6.Model Learning: Update environment model: M(s,a) = (r, s') storing observed transition.

7.Planning: Perform n planning steps: randomly sample (s, a) from previously visited states, use model to get (r, s') = M(s,a).

8.Simulated Q-Update: Update Q-value using simulated experience: Q(s,a) = Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)].

9.Alternate Real and Planning: Alternate between real environment steps and planning steps (e.g., 1 real step, n planning steps).

10.Accelerated Learning: Planning allows agent to learn from simulated experiences, accelerating convergence.

11.Output: Learned Q-table and environment model. Much faster than pure Q-learning due to planning.`,
  complexity: "Medium",
  bestFor: "Discrete spaces, model-based learning, faster convergence",
  pros: [
    "Faster learning than Q-Learning",
    "Uses environment model",
    "Planning accelerates learning",
    "Works for discrete spaces",
    "Sample efficient"
  ],
  cons: [
    "Only works for discrete spaces",
    "Requires accurate model",
    "Memory for model storage",
    "Planning adds computation",
    "Model errors can hurt performance"
  ],
  useCases: [
    "Grid world problems",
    "Discrete control tasks",
    "When environment model is learnable",
    "Faster Q-learning convergence"
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
    planningSteps: {
      description: "Number of planning steps per real step",
      default: 5,
      range: [1, 50]
    }
  },
  requirements: {
    dataType: "Discrete state-action spaces",
    environment: "Markov Decision Process (MDP)",
    rewardFunction: "Required",
    stateSpace: "Discrete and finite"
  },
  performance: {
    trainingSpeed: "Fast (with planning)",
    convergence: "Much faster than Q-Learning",
    memoryUsage: "High (Q-table + model)",
    scalability: "Limited to discrete spaces"
  }
};

export function trainDynaQ(
  environment: any,
  config: DynaQConfig
) {
  console.log("Training Dyna-Q with config:", config);
  return {
    model: "dyna_q",
    config,
    trained: true
  };
}
