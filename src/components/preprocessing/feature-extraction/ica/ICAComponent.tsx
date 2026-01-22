"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface ICAComponentProps {
  config: FeatureExtractionConfig;
  onConfigChange: (updates: Partial<FeatureExtractionConfig>) => void;
}

export default function ICAComponent({ config, onConfigChange }: ICAComponentProps) {
  return (
    <Card className="border-purple-200 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="text-base">Independent Component Analysis (ICA)</CardTitle>
        <CardDescription>
          Separate mixed signals into independent components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula */}
        <div className="bg-muted p-4 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Mathematical Formula:</h4>
          <div className="space-y-2 text-sm font-mono">
            <p>X = AS</p>
            <p>Where:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>X = Observed mixed signals (n × p)</li>
              <li>A = Mixing matrix (p × k)</li>
              <li>S = Independent sources (k × n)</li>
            </ul>
            <p className="mt-2">Goal: Find W such that S = WX</p>
            <p>Maximize non-Gaussianity: J(W) = E[G(W^T x)]</p>
            <p>Update rule: W ← W + α[I - g(W^T x)x^T]W</p>
            <p>Where g is the derivative of G (contrast function)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ica-components">Number of Components</Label>
            <Input
              id="ica-components"
              type="number"
              min="1"
              value={config.nComponents || 2}
              onChange={(e) => onConfigChange({ nComponents: parseInt(e.target.value) || 2 })}
            />
            <p className="text-xs text-muted-foreground">
              Number of independent components to extract
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ica-algorithm">Algorithm</Label>
            <Select
              value={config.algorithm || "fastica"}
              onValueChange={(value) => onConfigChange({ algorithm: value })}
            >
              <SelectTrigger id="ica-algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fastica">FastICA</SelectItem>
                <SelectItem value="picard">Picard</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Algorithm for ICA computation
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ica-max-iter">Max Iterations</Label>
          <Input
            id="ica-max-iter"
            type="number"
            min="1"
            value={config.maxIter || 1000}
            onChange={(e) => onConfigChange({ maxIter: parseInt(e.target.value) || 1000 })}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of iterations
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ica-tol">Tolerance</Label>
          <Input
            id="ica-tol"
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
          <Label htmlFor="ica-random-state">Random State</Label>
          <Input
            id="ica-random-state"
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

