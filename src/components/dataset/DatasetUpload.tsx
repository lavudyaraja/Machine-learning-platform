"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle2,
  FileText,
  AlertCircle,
  Info,
  FileUp,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import type { Dataset } from "@/types";

interface DatasetUploadProps {
  onUploadSuccess?: (dataset: Dataset) => void;
  onUploadError?: (error: string) => void;
  showInstructionsOnMount?: boolean;
}

export default function DatasetUpload({
  onUploadSuccess,
  onUploadError,
  showInstructionsOnMount = false,
}: DatasetUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(showInstructionsOnMount);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const guidelines = [
    { title: "Clean Structure", desc: "Ensure dataset is well-structured and remove unnecessary data." },
    { title: "Meaningful Names", desc: "Use clear and descriptive column/folder names." },
    { title: "Standard Characters", desc: "Avoid special characters; use alphanumeric, hyphens, or underscores." },
    { title: "No Encryption", desc: "Do not upload password-protected or encrypted files." },
    { title: "Storage Check", desc: "Ensure sufficient disk space before starting the upload." },
    { title: "Upload Duration", desc: "Large datasets may take time; please be patient during the process." },
    { title: "Keep Browser Open", desc: "Closing the browser will immediately cancel the upload." },
    { title: "One at a Time", desc: "Upload only one dataset per session for better management." },
    { title: "No Duplicates", desc: "Remove duplicate entries to maintain data quality." },
    { title: "Verify via Preview", desc: "Always check the data preview after the upload completes." },
  ];

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(false);
    const allowedTypes = ["text/csv", "application/json", "text/plain"];
    const isValidType = allowedTypes.includes(file.type) || /\.(csv|json|txt)$/.test(file.name.toLowerCase());

    if (!isValidType) {
      setError("Supported formats: CSV, JSON, TXT only.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    // Prevent multiple uploads
    if (uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const progressInterval = setInterval(() => {
        setUploadProgress((v) => (v >= 90 ? 90 : v + 5));
      }, 150);

      const response = await fetch("/api/datasets", { method: "POST", body: formData });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Upload failed. Please try again.");
      }

      const result = await response.json();
      // Validate the response
      if (!result || !result.data) {
        throw new Error("Invalid response from server");
      }

      setSuccess(true);
      console.log("Upload successful:", result.data);
      // Call onUploadSuccess callback
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during upload";
      setError(errorMessage);
      console.error("Upload error:", err);
      // Call onUploadError callback
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="border-border shadow-none rounded-lg overflow-hidden border-2">
        <CardHeader className="border-b bg-muted/20 py-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileUp className="size-5" />
                Dataset Upload
              </CardTitle>
              <CardDescription>
                Upload your CSV, JSON or TXT files (Max 100MB)
              </CardDescription>
            </div>
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-2 font-semibold">
                  <Info className="size-4 mr-2" />
                  View Guidelines
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-2 shadow-none">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-lg font-bold">Comprehensive Upload Guidelines</DialogTitle>
                  <DialogDescription>Please follow these steps for a successful data import</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {guidelines.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/10 transition-colors hover:bg-muted/20">
                      <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={cn(
              "relative min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
              isDragging ? "bg-muted border-primary" : "bg-background border-muted-foreground/20 hover:border-primary/50",
              selectedFile && "border-solid bg-primary/[0.02] border-primary/30"
            )}
          >
            {!selectedFile ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted border">
                  <Upload className="size-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold">Click to browse or drag & drop</p>
                  <p className="text-sm text-muted-foreground mt-1">First row should contain column headers</p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm px-4 py-2 space-y-5">
                <div className="flex items-center gap-4 p-4 border-2 rounded-lg bg-background relative">
                  <div className="p-2 bg-muted rounded">
                    <FileText className="size-8 text-primary shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{formatNumber(selectedFile.size / 1024, 1)} KB</p>
                  </div>
                  {!uploading && !success && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="h-8 w-8 rounded-full">
                      <X className="size-4" />
                    </Button>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Uploading Data</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 rounded-none bg-muted" />
                  </div>
                )}

                {success && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold animate-in fade-in">
                    <CheckCircle2 className="size-5" />
                    Upload Completed Successfully
                  </div>
                )}

                {!uploading && !success && (
                  <Button onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="w-full h-10 font-bold shadow-none rounded-md">
                    Execute Upload
                  </Button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.json,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-lg border-2 shadow-none py-4">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-dashed">
             <div className="flex gap-2">
                <Badge variant="secondary" className="font-bold text-[10px] rounded px-2">CSV</Badge>
                <Badge variant="secondary" className="font-bold text-[10px] rounded px-2">JSON</Badge>
                <Badge variant="secondary" className="font-bold text-[10px] rounded px-2">TXT</Badge>
             </div>
             <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tighter flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-green-600" /> Auto-Format Detection Enabled
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}