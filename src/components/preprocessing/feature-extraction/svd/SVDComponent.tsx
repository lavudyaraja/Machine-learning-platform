"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface SVDComponentProps {
  config: FeatureExtractionConfig;
  onConfigChange: (updates: Partial<FeatureExtractionConfig>) => void;
}

export default function SVDComponent({ config, onConfigChange }: SVDComponentProps) {
  return (
    <Card className="border-orange-200 dark:border-orange-900">
      <CardHeader>
        <CardTitle className="text-base">Singular Value Decomposition (SVD)</CardTitle>
        <CardDescription>
          Decompose matrix into singular values and vectors for dimensionality reduction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula */}
        <div className="bg-muted p-4 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Mathematical Formula:</h4>
          <div className="space-y-2 text-sm font-mono">
            <p>X = UΣV^T</p>
            <p>Where:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>X = Original data matrix (m × n)</li>
              <li>U = Left singular vectors (m × m) - orthonormal</li>
              <li>Σ = Singular values (diagonal matrix, m × n)</li>
              <li>V = Right singular vectors (n × n) - orthonormal</li>
            </ul>
            <p className="mt-2">Truncated SVD: X ≈ U_k Σ_k V_k^T</p>
            <p>Where k is the number of components</p>
            <p>Reduced representation: X_reduced = X × V_k</p>
            <p>Variance explained: σ_i^2 / Σσ_j^2</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="svd-components">Number of Components</Label>
            <Input
              id="svd-components"
              type="number"
              min="1"
              value={config.nComponents || 2}
              onChange={(e) => onConfigChange({ nComponents: parseInt(e.target.value) || 2 })}
            />
            <p className="text-xs text-muted-foreground">
              Number of singular values/vectors to keep
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="svd-solver">SVD Solver</Label>
            <Select
              value={config.svdSolver || "auto"}
              onValueChange={(value: "auto" | "full" | "arpack" | "randomized") =>
                onConfigChange({ svdSolver: value })
              }
            >
              <SelectTrigger id="svd-solver">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="full">Full SVD</SelectItem>
                <SelectItem value="arpack">ARPACK</SelectItem>
                <SelectItem value="randomized">Randomized</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Algorithm for SVD computation
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="svd-random-state">Random State</Label>
          <Input
            id="svd-random-state"
            type="number"
            value={config.randomState || 42}
            onChange={(e) => onConfigChange({ randomState: parseInt(e.target.value) || 42 })}
          />
          <p className="text-xs text-muted-foreground">
            Seed for random number generator (for randomized solver)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

