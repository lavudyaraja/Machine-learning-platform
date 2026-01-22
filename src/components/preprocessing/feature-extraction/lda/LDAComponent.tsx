"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeatureExtractionConfig } from "../FeatureExtractor";

interface LDAComponentProps {
  config: FeatureExtractionConfig;
  targetColumn?: string;
  columns?: string[];
  onConfigChange: (updates: Partial<FeatureExtractionConfig>) => void;
}

export default function LDAComponent({ config, targetColumn, columns = [], onConfigChange }: LDAComponentProps) {
  return (
    <Card className="border-green-200 dark:border-green-900">
      <CardHeader>
        <CardTitle className="text-base">Linear Discriminant Analysis (LDA)</CardTitle>
        <CardDescription>
          Reduce dimensionality while maximizing class separability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula */}
        <div className="bg-muted p-4 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Mathematical Formula:</h4>
          <div className="space-y-2 text-sm font-mono">
            <p>Between-class scatter: S_B = Σ n_i(μ_i - μ)(μ_i - μ)^T</p>
            <p>Within-class scatter: S_W = Σ Σ(x_j - μ_i)(x_j - μ_i)^T</p>
            <p>Fisher's criterion: J(w) = w^T S_B w / w^T S_W w</p>
            <p className="mt-2">Optimal projection: w* = argmax J(w)</p>
            <p>Solution: S_W^(-1) S_B w = λw (generalized eigenvalue problem)</p>
            <p>Transformed data: y = w^T x</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lda-components">Number of Components</Label>
          <Input
            id="lda-components"
            type="number"
            min="1"
            value={config.nComponents || 2}
            onChange={(e) => onConfigChange({ nComponents: parseInt(e.target.value) || 2 })}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of components (≤ min(n_features, n_classes - 1))
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lda-target-column">Target Column *</Label>
          {columns.length > 0 ? (
            <Select
              value={targetColumn || config.targetColumn || ""}
              onValueChange={(value) => onConfigChange({ targetColumn: value })}
            >
              <SelectTrigger id="lda-target-column">
                <SelectValue placeholder="Select target column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="lda-target-column"
              value={targetColumn || config.targetColumn || ""}
              onChange={(e) => onConfigChange({ targetColumn: e.target.value })}
              placeholder="Enter target column name"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Required for LDA. Select the target/class column for supervised dimensionality reduction.
          </p>
          {!targetColumn && !config.targetColumn && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ Target column is required for LDA
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lda-tol">Tolerance</Label>
          <Input
            id="lda-tol"
            type="number"
            step="0.0001"
            value={config.tol || 0.0001}
            onChange={(e) => onConfigChange({ tol: parseFloat(e.target.value) || 0.0001 })}
          />
          <p className="text-xs text-muted-foreground">
            Threshold for singular value decomposition
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

