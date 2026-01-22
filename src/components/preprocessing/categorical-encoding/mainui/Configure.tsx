"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2 } from "lucide-react";
import { CategoricalEncodingConfig } from "../CategoricalEncoder";

interface ConfigureProps {
  config: CategoricalEncodingConfig;
  selectedMethods: string[];
  targetColumn?: string;
  onConfigChange: (config: CategoricalEncodingConfig) => void;
}

export default function Configure({
  config,
  selectedMethods,
  targetColumn,
  onConfigChange,
}: ConfigureProps) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50/30 rounded-2xl border-2 border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-md">
            <Settings2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Advanced Options</h2>
            <p className="text-sm text-slate-600">Configure encoding parameters</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label htmlFor="handle-unknown" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Handle Unknown Categories
            </Label>
            <Select
              value={config.handleUnknown || "error"}
              onValueChange={(value) => {
                const newConfig = { 
                  ...config, 
                  handleUnknown: value as any
                };
                onConfigChange(newConfig);
              }}
            >
              <SelectTrigger id="handle-unknown" className="rounded-xl border-2 border-slate-200 hover:border-cyan-300 focus:border-cyan-500 bg-white shadow-sm h-11 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="error" className="rounded-lg">Error (Raise Exception)</SelectItem>
                <SelectItem value="ignore" className="rounded-lg">Ignore (Skip Unknown)</SelectItem>
                <SelectItem value="use_encoded_value" className="rounded-lg">Use Encoded Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedMethods.includes("target") || selectedMethods.includes("leave_one_out") || selectedMethods.includes("woe")) && (
            <div className="space-y-2.5">
              <Label htmlFor="target-column" className="text-sm font-semibold text-slate-700">Target Column</Label>
              <Input
                id="target-column"
                value={targetColumn || config.targetColumn || ""}
                onChange={(e) => {
                  const newConfig = { ...config, targetColumn: e.target.value };
                  onConfigChange(newConfig);
                }}
                placeholder="Enter target column name"
                className="rounded-xl border-2 border-slate-200 hover:border-cyan-300 focus:border-cyan-500 bg-white shadow-sm h-11 transition-colors"
              />
            </div>
          )}
        </div>

        {selectedMethods.includes("one_hot") && (
          <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-cyan-50/50 transition-all border-2 border-slate-200 bg-white shadow-sm">
            <Checkbox
              id="drop-first"
              checked={config.dropFirst || false}
              onCheckedChange={(checked) => {
                const newConfig = { ...config, dropFirst: !!checked };
                onConfigChange(newConfig);
              }}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="drop-first" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                Drop first category
              </Label>
              <p className="text-xs text-slate-600 mt-1">Prevents multicollinearity in regression models</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
