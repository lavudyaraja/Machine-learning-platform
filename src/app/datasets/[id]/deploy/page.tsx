"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Rocket,
  Download,
  Cloud,
  Server,
  FileCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  Package,
  Settings,
  Shield,
  Zap,
  Code,
  Terminal,
  Globe,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useDatasetDetail } from "@/hooks/useDataset";

interface ModelInfo {
  id: string;
  name: string;
  icon: string;
  accuracy: number;
  aucScore: number;
}

export default function DeployPage() {
  const params = useParams();
  const datasetId = params.id as string;

  const { dataset, loading: datasetLoading } = useDatasetDetail(datasetId);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "deployed">("idle");
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Models should be fetched from backend API instead of localStorage
  useEffect(() => {
    // TODO: Fetch models from backend API using datasetId
    // For now, initialize empty state
    setModels([]);
    setSelectedModel(null);
  }, [datasetId]);

  const currentModel = models.find((m) => m.id === selectedModel);

  const handleDeploy = async () => {
    if (!currentModel) return;

    setDeploymentStatus("deploying");
    setDeploymentProgress(0);

    // Simulate deployment progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDeploymentProgress(i);
    }

    setDeploymentStatus("deployed");
    toast.success("Model deployed successfully!", {
      description: `${currentModel.name} is now ready for predictions`,
    });
  };

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const pythonCode = `# Load and use your deployed model
import joblib
import numpy as np

# Load the trained model
model = joblib.load('${currentModel?.name?.toLowerCase().replace(/\s+/g, '_') || 'model'}.pkl')

# Make predictions
def predict(features):
    """
    Make predictions using the deployed model
    
    Args:
        features: numpy array of shape (n_samples, n_features)
    
    Returns:
        predictions: numpy array of predictions
    """
    predictions = model.predict(features)
    probabilities = model.predict_proba(features)
    return predictions, probabilities

# Example usage
sample_data = np.array([[5.1, 3.5, 1.4, 0.2]])
prediction, proba = predict(sample_data)
print(f"Prediction: {prediction}")
print(f"Probability: {proba}")`;

  const apiCode = `# REST API Integration
import requests

API_URL = "https://api.mlmodels.com/v1/predict"
API_KEY = "your-api-key-here"

def predict_api(features):
    """
    Make predictions via REST API
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model_id": "${currentModel?.id || 'model-id'}",
        "features": features.tolist()
    }
    
    response = requests.post(API_URL, json=payload, headers=headers)
    return response.json()

# Example usage
result = predict_api(sample_data)
print(result)`;

  const dockerCode = `# Dockerfile for model deployment
FROM python:3.9-slim

WORKDIR /app

# Copy model and requirements
COPY requirements.txt .
COPY ${currentModel?.name?.toLowerCase().replace(/\s+/g, '_') || 'model'}.pkl .
COPY app.py .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]`;

  if (datasetLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
          </div>
          <p className="text-slate-500 font-medium">Loading deployment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[24px] px-4 py-3 flex items-center justify-between hover:border-violet-400 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Link
              href={`/datasets/${datasetId}/roc-auc`}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-tight text-slate-700">
                Model Deployment
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets/${datasetId}/roc-auc`} className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                ROC & AUC
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/datasets`} className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                All Datasets
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deploy Your Model</h1>
          <p className="text-slate-500 mt-1">
            Export, deploy, and integrate your trained model into production
          </p>
        </div>

        {currentModel ? (
          <>
            {/* Model Selection */}
            {models.length > 1 && (
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Model to Deploy
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {models
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .map((model, index) => (
                      <Button
                        key={model.id}
                        variant={selectedModel === model.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedModel(model.id)}
                        className="rounded-xl gap-2"
                      >
                        {index === 0 && <Award className="w-4 h-4 text-amber-500" />}
                        <span>{model.icon}</span>
                        {model.name}
                        <Badge variant="secondary" className="ml-1">
                          {model.accuracy.toFixed(1)}%
                        </Badge>
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Best Model Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{currentModel.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-violet-900">{currentModel.name}</h2>
                          {models.indexOf(currentModel) === 0 && (
                            <Badge className="bg-amber-100 text-amber-700 border-0">
                              <Award className="w-3 h-3 mr-1" />
                              Best Model
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-violet-700">
                            Accuracy: <strong>{currentModel.accuracy.toFixed(2)}%</strong>
                          </span>
                          <span className="text-sm text-violet-700">
                            AUC: <strong>{currentModel.aucScore.toFixed(3)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {deploymentStatus === "idle" && (
                      <Button
                        onClick={handleDeploy}
                        className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 px-6"
                        size="lg"
                      >
                        <Rocket className="w-5 h-5" />
                        Deploy Model
                      </Button>
                    )}
                    
                    {deploymentStatus === "deploying" && (
                      <div className="flex items-center gap-4">
                        <div className="w-48">
                          <Progress value={deploymentProgress} className="h-2 [&>div]:bg-violet-500" />
                          <p className="text-xs text-violet-600 mt-1 text-center">
                            Deploying... {deploymentProgress}%
                          </p>
                        </div>
                        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                      </div>
                    )}
                    
                    {deploymentStatus === "deployed" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="font-medium text-emerald-700">Deployed Successfully</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Deployment Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl h-full cursor-pointer hover:border-blue-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-blue-50 rounded-2xl inline-block mb-4">
                      <Download className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Download Model</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Export as .pkl or .joblib file for local use
                    </p>
                    <Button variant="outline" className="rounded-xl w-full gap-2">
                      <Download className="w-4 h-4" />
                      Download .pkl
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl h-full cursor-pointer hover:border-emerald-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-emerald-50 rounded-2xl inline-block mb-4">
                      <Cloud className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Cloud Deploy</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Deploy to AWS, GCP, or Azure with one click
                    </p>
                    <Button variant="outline" className="rounded-xl w-full gap-2">
                      <Cloud className="w-4 h-4" />
                      Deploy to Cloud
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl h-full cursor-pointer hover:border-purple-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-purple-50 rounded-2xl inline-block mb-4">
                      <Server className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">REST API</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Generate REST API endpoint for predictions
                    </p>
                    <Button variant="outline" className="rounded-xl w-full gap-2">
                      <Server className="w-4 h-4" />
                      Create API
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Code Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-slate-600" />
                    Integration Code
                  </CardTitle>
                  <CardDescription>
                    Copy and use these code snippets to integrate your model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="python" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="python" className="gap-2">
                        <FileCode className="w-4 h-4" />
                        Python
                      </TabsTrigger>
                      <TabsTrigger value="api" className="gap-2">
                        <Server className="w-4 h-4" />
                        REST API
                      </TabsTrigger>
                      <TabsTrigger value="docker" className="gap-2">
                        <Package className="w-4 h-4" />
                        Docker
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="python">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 gap-1"
                          onClick={() => handleCopyCode(pythonCode, "python")}
                        >
                          {copiedCode === "python" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedCode === "python" ? "Copied!" : "Copy"}
                        </Button>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{pythonCode}</code>
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="api">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 gap-1"
                          onClick={() => handleCopyCode(apiCode, "api")}
                        >
                          {copiedCode === "api" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedCode === "api" ? "Copied!" : "Copy"}
                        </Button>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{apiCode}</code>
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="docker">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 gap-1"
                          onClick={() => handleCopyCode(dockerCode, "docker")}
                        >
                          {copiedCode === "docker" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedCode === "docker" ? "Copied!" : "Copy"}
                        </Button>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm">
                          <code>{dockerCode}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Deployment Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Deployment Checklist
                  </CardTitle>
                  <CardDescription>
                    Ensure your model is production-ready
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Model trained and validated", done: true, icon: CheckCircle2 },
                      { label: "Performance metrics evaluated", done: true, icon: CheckCircle2 },
                      { label: "ROC/AUC analysis completed", done: true, icon: CheckCircle2 },
                      { label: "Model exported successfully", done: deploymentStatus !== "idle", icon: deploymentStatus !== "idle" ? CheckCircle2 : Settings },
                      { label: "API endpoint configured", done: deploymentStatus === "deployed", icon: deploymentStatus === "deployed" ? CheckCircle2 : Server },
                      { label: "Monitoring setup", done: deploymentStatus === "deployed", icon: deploymentStatus === "deployed" ? CheckCircle2 : Zap },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          item.done ? "bg-emerald-50" : "bg-slate-50"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            item.done ? "text-emerald-500" : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            item.done ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Success Message */}
            {deploymentStatus === "deployed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <AlertTitle className="text-emerald-900">Deployment Successful!</AlertTitle>
                  <AlertDescription className="text-emerald-700">
                    Your model <strong>{currentModel.name}</strong> has been deployed successfully. 
                    You can now use it for predictions via the API endpoint or download it for local use.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </>
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="py-16 text-center">
              <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-4">
                <Rocket className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-4">No models available for deployment</p>
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

