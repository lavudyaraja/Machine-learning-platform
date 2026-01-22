"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LineChart,
  TrendingUp,
  Target,
  Award,
  Info,
  Zap,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDatasetDetail } from "@/hooks/useDataset";

interface ROCData {
  fpr: number[];
  tpr: number[];
}

interface ModelROCResult {
  id: string;
  name: string;
  icon: string;
  aucScore: number;
  rocData: ROCData;
  thresholds: { threshold: number; fpr: number; tpr: number }[];
  classWiseAUC?: { className: string; auc: number; macroAvg: number; weightedAvg: number };
}

// Generate simulated ROC data
const generateROCData = (models: any[]): ModelROCResult[] => {
  return models.map((model) => {
    const aucScore = 0.82 + Math.random() * 0.15;
    
    // Generate ROC curve points
    const numPoints = 50;
    const fpr: number[] = [0];
    const tpr: number[] = [0];
    
    for (let i = 1; i < numPoints; i++) {
      const t = i / numPoints;
      // Create a curve that bends towards top-left for good classifiers
      const curvature = 2 + (aucScore - 0.5) * 4;
      fpr.push(t);
      tpr.push(Math.pow(t, 1 / curvature));
    }
    fpr.push(1);
    tpr.push(1);

    // Generate threshold data
    const thresholds = [
      { threshold: 0.3, fpr: 0.15 + Math.random() * 0.1, tpr: 0.92 + Math.random() * 0.05 },
      { threshold: 0.5, fpr: 0.08 + Math.random() * 0.05, tpr: 0.85 + Math.random() * 0.1 },
      { threshold: 0.7, fpr: 0.03 + Math.random() * 0.03, tpr: 0.70 + Math.random() * 0.15 },
    ];

    // Generate class-wise AUC scores (for multi-class scenario)
    const classWiseAUC = {
      className: "Binary Classification",
      auc: aucScore,
      macroAvg: aucScore,
      weightedAvg: aucScore,
    };

    return {
      id: model.id,
      name: model.name,
      icon: model.icon || "🤖",
      aucScore: aucScore,
      rocData: { fpr, tpr },
      thresholds,
      classWiseAUC,
    };
  });
};

// ROC Curve visualization component
const ROCCurveChart = ({ data, modelName, aucScore }: { data: ROCData; modelName: string; aucScore: number }) => {
  const width = 400;
  const height = 400;
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Convert data points to SVG coordinates
  const points = data.fpr.map((fpr, i) => {
    const x = padding + fpr * chartWidth;
    const y = padding + (1 - data.tpr[i]) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Diagonal line points (random classifier)
  const diagonalStart = `${padding},${padding + chartHeight}`;
  const diagonalEnd = `${padding + chartWidth},${padding}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded-xl border border-slate-200">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1={padding + v * chartWidth}
              y1={padding}
              x2={padding + v * chartWidth}
              y2={padding + chartHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding + (1 - v) * chartHeight}
              x2={padding + chartWidth}
              y2={padding + (1 - v) * chartHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={padding + v * chartWidth}
              y={padding + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {v.toFixed(2)}
            </text>
            <text
              x={padding - 10}
              y={padding + (1 - v) * chartHeight + 4}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              {v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Diagonal line (random classifier) */}
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={padding + chartWidth}
          y2={padding}
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* AUC fill area */}
        <polygon
          points={`${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`}
          fill="url(#aucGradient)"
          opacity="0.3"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="aucGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* ROC curve */}
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm font-medium fill-slate-700"
        >
          False Positive Rate
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-sm font-medium fill-slate-700"
        >
          True Positive Rate
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-emerald-500 rounded" />
          <span className="text-slate-600">ROC Curve (AUC = {aucScore.toFixed(3)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-slate-300 rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-slate-600">Random Classifier</span>
        </div>
      </div>
    </div>
  );
};

export default function ROCAUCPage() {
  const params = useParams();
  const datasetId = params.id as string;

  const { dataset, loading: datasetLoading } = useDatasetDetail(datasetId);
  const [modelResults, setModelResults] = useState<ModelROCResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Models should be fetched from backend API instead of localStorage
  useEffect(() => {
    // TODO: Fetch models from backend API using datasetId
    // For now, initialize empty state
    setModelResults([]);
    setSelectedModel(null);
  }, [datasetId]);

  const currentModel = modelResults.find((m) => m.id === selectedModel);

  const getAUCColor = (value: number) => {
    if (value >= 0.9) return "text-emerald-600";
    if (value >= 0.8) return "text-blue-600";
    if (value >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  const getAUCLabel = (value: number) => {
    if (value >= 0.9) return "Excellent";
    if (value >= 0.8) return "Good";
    if (value >= 0.7) return "Fair";
    if (value >= 0.6) return "Poor";
    return "Fail";
  };

  const getAUCBgColor = (value: number) => {
    if (value >= 0.9) return "bg-emerald-50";
    if (value >= 0.8) return "bg-blue-50";
    if (value >= 0.7) return "bg-amber-50";
    return "bg-red-50";
  };

  if (datasetLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <LineChart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
          </div>
          <p className="text-slate-500 font-medium">Loading ROC analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[24px] px-4 py-3 flex items-center justify-between hover:border-indigo-400 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Link
              href={`/datasets/${datasetId}/evaluation`}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-tight text-slate-700">
                ROC & AUC Analysis
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets/${datasetId}/evaluation`} className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                Evaluation
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets/${datasetId}/deploy`} className="flex items-center gap-2">
                <Rocket className="h-3.5 w-3.5" />
                Deploy Model
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ROC & AUC Analysis</h1>
          <p className="text-slate-500 mt-1">
            Receiver Operating Characteristic curves and Area Under Curve scores
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Understanding ROC & AUC</AlertTitle>
          <AlertDescription className="text-blue-700">
            ROC curve shows the trade-off between True Positive Rate and False Positive Rate. 
            AUC (Area Under Curve) ranges from 0 to 1, where 1 represents perfect classification 
            and 0.5 represents random guessing.
          </AlertDescription>
        </Alert>

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
            {/* AUC Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-1"
              >
                <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${getAUCBgColor(currentModel.aucScore)}`}>
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm inline-block mb-4">
                      <Award className={`w-10 h-10 ${getAUCColor(currentModel.aucScore)}`} />
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">AUC Score</p>
                    <p className={`text-4xl font-bold ${getAUCColor(currentModel.aucScore)}`}>
                      {currentModel.aucScore.toFixed(3)}
                    </p>
                    <Badge className={`mt-3 ${getAUCBgColor(currentModel.aucScore)} ${getAUCColor(currentModel.aucScore)} border-0`}>
                      {getAUCLabel(currentModel.aucScore)}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2"
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl h-full">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* AUC Score Interpretation */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-4">AUC Score Interpretation</h3>
                        <div className="space-y-3">
                          {[
                            { range: "0.90 - 1.00", label: "Excellent", color: "bg-emerald-500" },
                            { range: "0.80 - 0.90", label: "Good", color: "bg-blue-500" },
                            { range: "0.70 - 0.80", label: "Fair", color: "bg-amber-500" },
                            { range: "0.60 - 0.70", label: "Poor", color: "bg-orange-500" },
                            { range: "0.50 - 0.60", label: "Fail", color: "bg-red-500" },
                          ].map((item) => (
                            <div key={item.range} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm text-slate-600">{item.range}</span>
                              <span className="text-sm font-medium text-slate-800">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Class-wise & Model-wise Scores */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Detailed AUC Scores</h3>

                        {/* Class-wise Scores */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Class-wise Performance
                          </h4>
                          {currentModel.classWiseAUC && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Overall AUC</span>
                                <Badge className={`${getAUCBgColor(currentModel.classWiseAUC.auc)} ${getAUCColor(currentModel.classWiseAUC.auc)} border-0`}>
                                  {currentModel.classWiseAUC.auc.toFixed(3)}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Macro Average</span>
                                <Badge className={`${getAUCBgColor(currentModel.classWiseAUC.macroAvg)} ${getAUCColor(currentModel.classWiseAUC.macroAvg)} border-0`}>
                                  {currentModel.classWiseAUC.macroAvg.toFixed(3)}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Weighted Average</span>
                                <Badge className={`${getAUCBgColor(currentModel.classWiseAUC.weightedAvg)} ${getAUCColor(currentModel.classWiseAUC.weightedAvg)} border-0`}>
                                  {currentModel.classWiseAUC.weightedAvg.toFixed(3)}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Model-wise Comparison */}
                        {modelResults.length > 1 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Model Comparison
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {modelResults
                                .sort((a, b) => b.aucScore - a.aucScore)
                                .slice(0, 3) // Show top 3 models
                                .map((model, index) => (
                                  <div key={model.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      {index === 0 && <Award className="w-4 h-4 text-amber-500" />}
                                      <span className="text-sm">{model.icon}</span>
                                      <span className="text-sm font-medium text-slate-700">{model.name}</span>
                                    </div>
                                    <Badge className={`${getAUCBgColor(model.aucScore)} ${getAUCColor(model.aucScore)} border-0 text-xs`}>
                                      {model.aucScore.toFixed(3)}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROC Curve Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-indigo-600" />
                      ROC Curve
                    </CardTitle>
                    <CardDescription>
                      {currentModel.name} - Performance visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ROCCurveChart
                      data={currentModel.rocData}
                      modelName={currentModel.name}
                      aucScore={currentModel.aucScore}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Threshold Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Threshold Analysis
                    </CardTitle>
                    <CardDescription>
                      Performance at different classification thresholds
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Threshold</TableHead>
                          <TableHead className="text-right">FPR</TableHead>
                          <TableHead className="text-right">TPR</TableHead>
                          <TableHead className="text-right">Specificity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentModel.thresholds.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.threshold.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="bg-red-50 text-red-600">
                                {(row.fpr * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">
                                {(row.tpr * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                                {((1 - row.fpr) * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-800 mb-2">Recommended Threshold</h4>
                      <p className="text-sm text-slate-600">
                        Based on the analysis, a threshold of <strong>0.5</strong> provides 
                        a good balance between TPR ({(currentModel.thresholds[1].tpr * 100).toFixed(1)}%) 
                        and FPR ({(currentModel.thresholds[1].fpr * 100).toFixed(1)}%).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Model Comparison */}
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
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      AUC Score Comparison
                    </CardTitle>
                    <CardDescription>
                      Compare AUC scores across all trained models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {modelResults
                        .sort((a, b) => b.aucScore - a.aucScore)
                        .map((model, index) => (
                          <div key={model.id} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 w-48">
                              {index === 0 && <Award className="w-5 h-5 text-amber-500" />}
                              <span className="text-xl">{model.icon}</span>
                              <span className="font-medium text-slate-700">{model.name}</span>
                            </div>
                            <div className="flex-1">
                              <Progress 
                                value={model.aucScore * 100} 
                                className={`h-3 ${
                                  model.aucScore >= 0.9 ? "[&>div]:bg-emerald-500" :
                                  model.aucScore >= 0.8 ? "[&>div]:bg-blue-500" :
                                  model.aucScore >= 0.7 ? "[&>div]:bg-amber-500" :
                                  "[&>div]:bg-red-500"
                                }`}
                              />
                            </div>
                            <Badge className={`w-20 justify-center ${getAUCBgColor(model.aucScore)} ${getAUCColor(model.aucScore)} border-0`}>
                              {model.aucScore.toFixed(3)}
                            </Badge>
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
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 rounded-xl">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-indigo-900">
                          Ready to Deploy Your Model
                        </h3>
                        <p className="text-sm text-indigo-700">
                          Export and deploy your best performing model to production
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
                    >
                      <Link href={`/datasets/${datasetId}/deploy`}>
                        Deploy Model
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
                <LineChart className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-4">No ROC data available</p>
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

