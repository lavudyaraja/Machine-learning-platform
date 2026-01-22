"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface FactorAnalysisComponentProps {
  config: FeatureExtractionConfig;
  onConfigChange: (updates: Partial<FeatureExtractionConfig>) => void;
}

export default function FactorAnalysisComponent({ config, onConfigChange }: FactorAnalysisComponentProps) {
  return (
    <Card className="border-pink-200 dark:border-pink-900">
      <CardHeader>
        <CardTitle className="text-base">Factor Analysis</CardTitle>
        <CardDescription>
          Extract latent factors that explain observed variable correlations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula */}
        <div className="bg-muted p-4 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Mathematical Formula:</h4>
          <div className="space-y-2 text-sm font-mono">
            <p>X = ΛF + ε</p>
            <p>Where:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>X = Observed variables (n × p)</li>
              <li>Λ = Factor loadings matrix (p × k)</li>
              <li>F = Latent factors (k × n)</li>
              <li>ε = Error terms (p × n)</li>
            </ul>
            <p className="mt-2">Covariance structure: Σ = ΛΛ^T + Ψ</p>
            <p>Where Ψ is the diagonal matrix of unique variances</p>
            <p>Factor loadings: λ_ij = correlation(X_i, F_j)</p>
            <p>Communality: h_i^2 = Σλ_ij^2 (variance explained by factors)</p>
            <p>Uniqueness: ψ_i = 1 - h_i^2 (unique variance)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fa-factors">Number of Factors</Label>
            <Input
              id="fa-factors"
              type="number"
              min="1"
              value={config.nFactors || config.nComponents || 10}
              onChange={(e) => onConfigChange({ nFactors: parseInt(e.target.value) || 10})}
            />
            <p className="text-xs text-muted-foreground">
              Number of latent factors to extract
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fa-rotation">Rotation Method</Label>
            <Select
              value={config.rotation || "varimax"}
              onValueChange={(value: "varimax" | "promax" | "oblimin" | "quartimax") =>
                onConfigChange({ rotation: value })
              }
            >
              <SelectTrigger id="fa-rotation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="varimax">Varimax (orthogonal)</SelectItem>
                <SelectItem value="promax">Promax (oblique)</SelectItem>
                <SelectItem value="oblimin">Oblimin (oblique)</SelectItem>
                <SelectItem value="quartimax">Quartimax (orthogonal)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Rotation method for factor loadings
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fa-max-iter">Max Iterations</Label>
          <Input
            id="fa-max-iter"
            type="number"
            min="1"
            value={config.maxIter || 1000}
            onChange={(e) => onConfigChange({ maxIter: parseInt(e.target.value) || 1000 })}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of iterations for factor extraction
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fa-tol">Tolerance</Label>
          <Input
            id="fa-tol"
            type="number"
            step="0.0001"
            value={config.tol || 0.0001}
            onChange={(e) => onConfigChange({ tol: parseFloat(e.target.value) || 0.0001 })}
          />
          <p className="text-xs text-muted-foreground">
            Convergence tolerance
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fa-random-state">Random State</Label>
          <Input
            id="fa-random-state"
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

