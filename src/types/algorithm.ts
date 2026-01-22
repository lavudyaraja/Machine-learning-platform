// Algorithm-related types

export interface Algorithm {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: AlgorithmParameter[];
}

export interface AlgorithmParameter {
  name: string;
  type: "number" | "string" | "boolean" | "select";
  default?: unknown;
  options?: unknown[];
  required?: boolean;
}

