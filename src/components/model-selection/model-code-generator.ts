/**
 * Generate model-specific Python code examples
 * Main entry point that routes to specialized code generators
 */

import { generateSupervisedModelCode } from "./code-generation/supervisedmodelscode";
import { generateUnsupervisedModelCode } from "./code-generation/unsupervisedmodelscode";
import { generateReinforcementModelCode } from "./code-generation/reinforcementmodelcode";

export function generateModelCode(modelId: string, category: string, modelInfo: any): string {
  const modelName = modelInfo?.name || modelId;
  
  // Route to appropriate code generator based on category
  if (category === "classification" || category === "regression") {
    const code = generateSupervisedModelCode(modelId, category, modelInfo);
    if (code) return code;
  }
  
  if (category === "clustering" || category === "association_rules") {
    const code = generateUnsupervisedModelCode(modelId, category, modelInfo);
    if (code) return code;
  }
  
  if (category === "reinforcement") {
    const code = generateReinforcementModelCode(modelId, category, modelInfo);
    if (code) return code;
  }
  
  // Fallback for unknown categories
  return `# Code example for ${modelName}\n# Implementation coming soon`;
}
