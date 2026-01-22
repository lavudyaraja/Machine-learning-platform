// Algorithm selection logic

import { useState } from "react";
import type { Algorithm } from "@/types";

export function useAlgorithm() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(null);
  const [parameters, setParameters] = useState<Record<string, unknown>>({});

  const selectAlgorithm = (algorithm: Algorithm) => {
    setSelectedAlgorithm(algorithm);
  };

  const updateParameter = (name: string, value: unknown) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  return { selectedAlgorithm, parameters, selectAlgorithm, updateParameter };
}

