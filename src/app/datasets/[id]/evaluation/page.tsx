"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Target,
  CheckCircle2,
  TrendingUp,
  Percent,
  PieChart,
  Activity,
  Zap,
  FileText,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDatasetDetail } from "@/hooks/useDataset";

interface ClassificationMetrics {
  className: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

interface ModelResult {
  id: string;
  name: string;
  icon: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  classificationReport: ClassificationMetrics[];
}

// Generate simulated evaluation data
const generateModelResults = (models: any[]): ModelResult[] => {
  return models.map((model) => {
    const accuracy = 0.85 + Math.random() * 0.12;
    const precision = 0.82 + Math.random() * 0.15;
    const recall = 0.80 + Math.random() * 0.17;
    const f1Score = (2 * precision * recall) / (precision + recall);

    return {
      id: model.id,
      name: model.name,
      icon: model.icon || "🤖",
      accuracy: accuracy * 100,
      precision: precision * 100,
      recall: recall * 100,
      f1Score: f1Score * 100,
      confusionMatrix: [
        [Math.floor(80 + Math.random() * 20), Math.floor(5 + Math.random() * 10)],
        [Math.floor(8 + Math.random() * 12), Math.floor(75 + Math.random() * 25)],
      ],
      classificationReport: [
        {
          className: "Class 0",
          precision: 0.85 + Math.random() * 0.1,
          recall: 0.82 + Math.random() * 0.12,
          f1Score: 0.83 + Math.random() * 0.1,
          support: Math.floor(100 + Math.random() * 50),
        },
        {
          className: "Class 1",
          precision: 0.88 + Math.random() * 0.08,
          recall: 0.85 + Math.random() * 0.1,
          f1Score: 0.86 + Math.random() * 0.08,
          support: Math.floor(90 + Math.random() * 60),
        },
      ],
    };
  });
};

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const { dataset, loading: datasetLoading } = useDatasetDetail(datasetId);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Models should be fetched from backend API instead of localStorage
  useEffect(() => {
    // TODO: Fetch models from backend API using datasetId
    // For now, initialize empty state
    setModelResults([]);
    setSelectedModel(null);
  }, [datasetId]);

  const currentModel = modelResults.find((m) => m.id === selectedModel);

  const getMetricColor = (value: number) => {
    if (value >= 90) return "text-emerald-600";
    if (value >= 80) return "text-blue-600";
    if (value >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getMetricBgColor = (value: number) => {
    if (value >= 90) return "bg-emerald-50";
    if (value >= 80) return "bg-blue-50";
    if (value >= 70) return "bg-amber-50";
    return "bg-red-50";
  };

  if (datasetLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <BarChart3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
          </div>
          <p className="text-slate-500 font-medium">Loading evaluation results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[24px] px-4 py-3 flex items-center justify-between hover:border-emerald-400 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Link
              href={`/datasets/${datasetId}/training`}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-tight text-slate-700">
                Model Evaluation
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets/${datasetId}/training`} className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                Training
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets/${datasetId}/roc-auc`} className="flex items-center gap-2">
                <LineChart className="h-3.5 w-3.5" />
                ROC & AUC
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Model Evaluation</h1>
          <p className="text-slate-500 mt-1">
            Analyze classification metrics and model performance
          </p>
        </div>

        {/* Model Selector */}
        {modelResults.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {modelResults.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedModel(model.id)}
                  className="rounded-xl gap-2"
                >
                  <span>{model.icon}</span>
                  {model.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentModel ? (
          <>
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${getMetricBgColor(currentModel.accuracy)}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Target className={`w-6 h-6 ${getMetricColor(currentModel.accuracy)}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Accuracy</p>
                        <p className={`text-2xl font-bold ${getMetricColor(currentModel.accuracy)}`}>
                          {currentModel.accuracy.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${getMetricBgColor(currentModel.precision)}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <CheckCircle2 className={`w-6 h-6 ${getMetricColor(currentModel.precision)}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Precision</p>
                        <p className={`text-2xl font-bold ${getMetricColor(currentModel.precision)}`}>
                          {currentModel.precision.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${getMetricBgColor(currentModel.recall)}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <TrendingUp className={`w-6 h-6 ${getMetricColor(currentModel.recall)}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recall</p>
                        <p className={`text-2xl font-bold ${getMetricColor(currentModel.recall)}`}>
                          {currentModel.recall.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${getMetricBgColor(currentModel.f1Score)}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Activity className={`w-6 h-6 ${getMetricColor(currentModel.f1Score)}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">F1 Score</p>
                        <p className={`text-2xl font-bold ${getMetricColor(currentModel.f1Score)}`}>
                          {currentModel.f1Score.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Classification Report */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Classification Report
                    </CardTitle>
                    <CardDescription>
                      Per-class precision, recall, and F1-score metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead className="text-right">Precision</TableHead>
                          <TableHead className="text-right">Recall</TableHead>
                          <TableHead className="text-right">F1-Score</TableHead>
                          <TableHead className="text-right">Support</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentModel.classificationReport.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.className}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className={getMetricBgColor(row.precision * 100)}>
                                {(row.precision * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className={getMetricBgColor(row.recall * 100)}>
                                {(row.recall * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className={getMetricBgColor(row.f1Score * 100)}>
                                {(row.f1Score * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{row.support}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50 font-semibold">
                          <TableCell>Weighted Avg</TableCell>
                          <TableCell className="text-right">
                            {(currentModel.precision).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {(currentModel.recall).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {(currentModel.f1Score).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {currentModel.classificationReport.reduce((sum, r) => sum + r.support, 0)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Confusion Matrix */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      Confusion Matrix
                    </CardTitle>
                    <CardDescription>
                      Model prediction accuracy breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Matrix Header */}
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-slate-700 mb-2">Predicted Labels</div>
                          <div className="text-xs text-slate-500">↓ Actual Labels</div>
                        </div>
                      </div>

                      {/* Matrix Grid */}
                      <div className="flex justify-center">
                        <div className="relative">
                          {/* Row Labels */}
                          <div className="absolute -left-20 top-1/2 -translate-y-1/2 space-y-8">
                            <div className="text-sm font-medium text-slate-700 text-right">Class 0</div>
                            <div className="text-sm font-medium text-slate-700 text-right">Class 1</div>
                          </div>

                          {/* Column Labels */}
                          <div className="flex mb-2">
                            <div className="w-32"></div>
                            <div className="w-32 text-center text-sm font-medium text-slate-700">Predicted Class 0</div>
                            <div className="w-32 text-center text-sm font-medium text-slate-700">Predicted Class 1</div>
                          </div>

                          {/* Matrix Cells */}
                          <div className="space-y-2">
                            {currentModel.confusionMatrix.map((row, i) => (
                              <div key={`row-${i}`} className="flex">
                                <div className="w-32 flex items-center justify-end pr-4">
                                  <span className="text-sm font-medium text-slate-700">Actual Class {i}</span>
                                </div>
                                {row.map((value, j) => {
                                  const total = currentModel.confusionMatrix.flat().reduce((a, b) => a + b, 0);
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  const isDiagonal = i === j;

                                  return (
                                    <div
                                      key={`${i}-${j}`}
                                      className={`w-32 h-24 rounded-lg flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                                        isDiagonal
                                          ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-sm"
                                          : "bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 shadow-sm"
                                      }`}
                                    >
                                      {/* Background Pattern */}
                                      <div className={`absolute inset-0 opacity-5 ${
                                        isDiagonal ? "bg-emerald-600" : "bg-red-600"
                                      }`}>
                                        <div className="w-full h-full bg-gradient-to-br from-transparent to-current opacity-20"></div>
                                      </div>

                                      {/* Content */}
                                      <div className="relative z-10 text-center">
                                        <div className={`text-2xl font-bold mb-1 ${
                                          isDiagonal ? "text-emerald-700" : "text-red-700"
                                        }`}>
                                          {value}
                                        </div>
                                        <div className={`text-xs font-medium mb-1 ${
                                          isDiagonal ? "text-emerald-600" : "text-red-600"
                                        }`}>
                                          {percentage}%
                                        </div>
                                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                          isDiagonal
                                            ? "bg-emerald-200 text-emerald-800"
                                            : "bg-red-200 text-red-800"
                                        }`}>
                                          {i === j ? (i === 0 ? "TN" : "TP") : (i === 0 ? "FP" : "FN")}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Legend and Stats */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Legend */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700">Legend</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded"></div>
                              <span className="text-sm text-slate-600">Correct Predictions</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded"></div>
                              <span className="text-sm text-slate-600">Incorrect Predictions</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700">Matrix Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Total Samples:</span>
                              <span className="font-medium text-slate-900">
                                {currentModel.confusionMatrix.flat().reduce((a, b) => a + b, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Accuracy:</span>
                              <span className="font-medium text-emerald-700">
                                {currentModel.accuracy.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Precision:</span>
                              <span className="font-medium text-blue-700">
                                {currentModel.precision.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Model Comparison Bar Chart */}
            {modelResults.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Model Comparison
                    </CardTitle>
                    <CardDescription>
                      Compare performance metrics across all trained models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {modelResults.map((model, index) => (
                        <div key={model.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{model.icon}</span>
                              <span className="font-medium text-slate-700">{model.name}</span>
                            </div>
                            <Badge variant="secondary" className={getMetricBgColor(model.accuracy)}>
                              {model.accuracy.toFixed(1)}% Accuracy
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Accuracy</span>
                                <span>{model.accuracy.toFixed(1)}%</span>
                              </div>
                              <Progress value={model.accuracy} className="h-2 [&>div]:bg-blue-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Precision</span>
                                <span>{model.precision.toFixed(1)}%</span>
                              </div>
                              <Progress value={model.precision} className="h-2 [&>div]:bg-emerald-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Recall</span>
                                <span>{model.recall.toFixed(1)}%</span>
                              </div>
                              <Progress value={model.recall} className="h-2 [&>div]:bg-purple-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>F1 Score</span>
                                <span>{model.f1Score.toFixed(1)}%</span>
                              </div>
                              <Progress value={model.f1Score} className="h-2 [&>div]:bg-amber-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 rounded-xl">
                        <LineChart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-emerald-900">
                          Continue to ROC & AUC Analysis
                        </h3>
                        <p className="text-sm text-emerald-700">
                          Analyze ROC curves and AUC scores for detailed performance insights
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                    >
                      <Link href={`/datasets/${datasetId}/roc-auc`}>
                        View ROC & AUC
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="py-16 text-center">
              <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-4">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-4">No evaluation data available</p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/datasets/${datasetId}/training`}>
                  Go to Training
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

