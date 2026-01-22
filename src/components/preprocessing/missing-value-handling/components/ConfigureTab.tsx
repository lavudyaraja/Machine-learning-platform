"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings2, InfoIcon, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MethodOption } from "../types";
import { STATISTICAL_METHODS, SPECIAL_METHODS } from "../constants";

interface ConfigureTabProps {
  methods: MethodOption[];
  selectedMethods: string[];
  selectedColumns: string[];
  fetchedColumns: string[];
  constantValue: string;
  errors: Record<string, string>;
  onMethodToggle: (method: string) => void;
  onConstantValueChange: (value: string) => void;
  onBackToSelection: () => void;
  onOpenTooltip: (methodId: string, e: React.MouseEvent) => void;
}

export function ConfigureTab({
  methods,
  selectedMethods,
  selectedColumns,
  fetchedColumns,
  constantValue,
  errors,
  onMethodToggle,
  onConstantValueChange,
  onBackToSelection,
  onOpenTooltip,
}: ConfigureTabProps) {
  const statisticalMethods = methods.filter((m) => !SPECIAL_METHODS.includes(m.value));
  const specialMethods = methods.filter((m) => SPECIAL_METHODS.includes(m.value));

  return (
    <div className="space-y-6">
      {/* Methods Selection */}
        <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Settings2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select Handling Methods</h2>
              <p className="text-sm text-slate-500">Choose one or more methods to handle missing values</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-6">
          {/* Statistical Methods */}
          {statisticalMethods.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Statistical Methods</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statisticalMethods.map((method) => {
                  const isSelected = selectedMethods.includes(method.value);
                  return (
                    <div
                      key={method.value}
                      className={`relative h-32 w-full p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-400 ring-2 ring-purple-400/50"
                          : "border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/30"
                      }`}
                      onClick={() => onMethodToggle(method.value)}
                    >
                      {/* Neon glow effect when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 via-purple-500/10 to-purple-400/20 opacity-75 blur-sm animate-pulse pointer-events-none" />
                      )}
                      
                      {/* Info Icon Button */}
                      <div className="absolute top-2 right-2 z-20">
                        <button
                          type="button"
                          className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer z-20 relative ${
                            isSelected
                              ? "hover:bg-purple-200/80 bg-purple-100/50"
                              : "hover:bg-purple-100 bg-slate-100/50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenTooltip(method.value, e);
                          }}
                        >
                          <InfoIcon className={`h-5 w-5 ${isSelected ? "text-purple-700" : "text-slate-500"}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-1.5">
                        <div className={`text-2xl mb-0.5 ${isSelected ? "text-purple-600" : "text-slate-500"}`}>
                          {method.icon}
                        </div>
                        <h4 className={`text-xs font-semibold leading-tight px-1 ${
                          isSelected ? "text-purple-900" : "text-slate-700"
                        }`}>
                          {method.label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Methods */}
          {specialMethods.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Special Methods (Single Selection)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {specialMethods.map((method) => {
                  const isSelected = selectedMethods.includes(method.value);
                  return (
                    <div
                      key={method.value}
                      className={`relative h-32 w-full p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-400 ring-2 ring-purple-400/50"
                          : "border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/30"
                      }`}
                      onClick={() => onMethodToggle(method.value)}
                    >
                      {/* Neon glow effect when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 via-purple-500/10 to-purple-400/20 opacity-75 blur-sm animate-pulse pointer-events-none" />
                      )}
                      
                      {/* Info Icon Button */}
                      <div className="absolute top-2 right-2 z-20">
                        <button
                          type="button"
                          className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer z-20 relative ${
                            isSelected
                              ? "hover:bg-purple-200/80 bg-purple-100/50"
                              : "hover:bg-purple-100 bg-slate-100/50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenTooltip(method.value, e);
                          }}
                        >
                          <InfoIcon className={`h-5 w-5 ${isSelected ? "text-purple-700" : "text-slate-500"}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-1.5">
                        <div className={`text-2xl mb-0.5 ${isSelected ? "text-purple-600" : "text-slate-500"}`}>
                          {method.icon}
                        </div>
                        <h4 className={`text-xs font-semibold leading-tight px-1 ${
                          isSelected ? "text-purple-900" : "text-slate-700"
                        }`}>
                          {method.label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {errors.methods && (
            <Alert className="border-2 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.methods}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Constant Value Input */}
      {selectedMethods.includes("constant") && (
        <div className="bg-gradient-to-br from-white to-slate-50/30 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Constant Value</h2>
                <p className="text-sm text-slate-600">Enter a value to fill missing data</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="constant-value" className="text-sm font-semibold text-slate-700">
                Constant Value
              </Label>
              <Input
                id="constant-value"
                value={constantValue}
                onChange={(e) => onConstantValueChange(e.target.value)}
                placeholder="Enter constant value (e.g., 0, -1, 'N/A')"
                className="rounded-xl border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 bg-white shadow-sm h-11 transition-colors"
              />
              {errors.constant && (
                <p className="text-red-600 text-sm mt-2">{errors.constant}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Columns Info */}
      {!selectedMethods.includes("drop_columns") && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Database className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Selected Columns</h3>
              <p className="text-sm text-slate-600 mb-3">
                {selectedColumns.length > 0
                  ? `Processing ${selectedColumns.length} column${selectedColumns.length !== 1 ? 's' : ''}: ${selectedColumns.slice(0, 3).join(", ")}${selectedColumns.length > 3 ? ` and ${selectedColumns.length - 3} more` : ""}`
                  : `Processing all ${fetchedColumns.length} columns`}
              </p>
              <Button
                variant="link"
                size="sm"
                className="mt-2 text-purple-600 hover:text-purple-700 p-0 h-auto"
                onClick={onBackToSelection}
              >
                Change selection →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Alerts */}
      {selectedMethods.some((m) => STATISTICAL_METHODS.includes(m)) && (
        <Alert className="border-2 border-purple-200 bg-purple-50">
          <InfoIcon className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            Statistical methods will only be applied to numeric columns. Non-numeric columns will be skipped.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
