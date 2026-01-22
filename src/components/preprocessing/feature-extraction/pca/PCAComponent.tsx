"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface PCAComponentProps {
  config: FeatureExtractionConfig;
  onConfigChange: (updates: Partial<FeatureExtractionConfig>) => void;
}

export default function PCAComponent({ config, onConfigChange }: PCAComponentProps) {
  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader>
        <CardTitle className="text-base">Principal Component Analysis (PCA)</CardTitle>
        <CardDescription>
          Reduce dimensionality by finding principal components that capture maximum variance
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
              <li>X = Original data matrix (n × p)</li>
              <li>U = Left singular vectors (n × n)</li>
              <li>Σ = Singular values (diagonal matrix)</li>
              <li>V = Right singular vectors (p × p) - Principal Components</li>
            </ul>
            <p className="mt-2">Principal Components: PC_i = X × V_i</p>
            <p>Variance Explained: λ_i / Σλ_j</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pca-components">Number of Components</Label>
            <Input
              id="pca-components"
              type="number"
              min="1"
              value={config.nComponents || 2}
              onChange={(e) => onConfigChange({ nComponents: parseInt(e.target.value) || 2 })}
            />
            <p className="text-xs text-muted-foreground">
              Number of principal components to extract
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pca-solver">SVD Solver</Label>
            <Select
              value={config.svdSolver || "auto"}
              onValueChange={(value: "auto" | "full" | "arpack" | "randomized") =>
                onConfigChange({ svdSolver: value })
              }
            >
              <SelectTrigger id="pca-solver">
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pca-whiten"
              checked={config.whiten || false}
              onCheckedChange={(checked) => onConfigChange({ whiten: checked as boolean })}
            />
            <Label htmlFor="pca-whiten" className="cursor-pointer">
              Whiten Components
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Scale components to unit variance
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pca-random-state">Random State</Label>
          <Input
            id="pca-random-state"
            type="number"
            value={config.randomState || 42}
            onChange={(e) => onConfigChange({ randomState: parseInt(e.target.value) || 42 })}
          />
          <p className="text-xs text-muted-foreground">
            Seed for random number generator
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

