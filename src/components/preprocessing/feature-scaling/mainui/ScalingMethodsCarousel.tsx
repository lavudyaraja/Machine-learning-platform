"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Activity,
  Maximize2,
  Scale,
  TrendingUp,
  Minimize2,
  Info,
  Pause,
  Play,
  Maximize,
  Copy,
  Check,
  Star,
  Keyboard,
  Grid3x3,
  Zap,
  Eye,
  Sparkles,
} from "lucide-react";
import { FeatureScalingConfig } from "../FeatureScaler";

interface ScalingMethodsCarouselProps {
  selectedMethods: string[];
  config: FeatureScalingConfig;
  onConfigChange: (config: FeatureScalingConfig) => void;
}

const SCALING_METHODS_CONFIG = [
  {
    value: "standard",
    label: "Standardization (Z-score)",
    subtitle: "StandardScaler Configuration",
    icon: Activity,
    color: "blue",
    description: "Configure StandardScaler parameters for machine learning preprocessing",
    configFields: [
      {
        id: "with-mean",
        label: "Center Data (with_mean)",
        description: "If True, center the data by subtracting the mean. This makes the mean of transformed data equal to 0.",
        formula: "x_centered = x - μ",
        default: true,
        badge: "Default: True",
        useWhen: "Data should be centered around zero",
        type: "checkbox" as const,
        key: "withMean" as keyof FeatureScalingConfig,
      },
      {
        id: "with-std",
        label: "Scale to Unit Variance (with_std)",
        description: "If True, scale the data to unit variance. This makes the standard deviation of transformed data equal to 1.",
        formula: "x_scaled = (x - μ) / σ",
        default: true,
        badge: "Default: True",
        useWhen: "Features need equal variance",
        type: "checkbox" as const,
        key: "withStd" as keyof FeatureScalingConfig,
      },
    ],
    bestPractices: [
      "Linear Models: Use both with_mean=True and with_std=True for optimal performance",
      "Neural Networks: Standardization helps with gradient descent convergence",
      "PCA: Essential for principal component analysis to work correctly",
    ],
    useCases: [
      "Linear models (Linear Regression, Logistic Regression)",
      "Neural networks and deep learning",
      "Support Vector Machines (SVM)",
    ],
  },
  {
    value: "minmax",
    label: "Min-Max Scaling",
    subtitle: "MinMaxScaler Configuration",
    icon: Maximize2,
    color: "purple",
    description: "Configure MinMaxScaler parameters for bounded feature scaling",
    configFields: [
      {
        id: "feature-range",
        label: "Feature Range (feature_range)",
        description: "Desired range of transformed data. Default is [0, 1].",
        formula: "x_scaled = (x - min) / (max - min) × (max_range - min_range) + min_range",
        default: [0, 1],
        badge: "Default: [0, 1]",
        useWhen: "You need bounded output values",
        type: "range" as const,
        key: "featureRange" as keyof FeatureScalingConfig,
      },
      {
        id: "clip",
        label: "Clip Values (clip)",
        description: "If True, clip transformed values to the feature_range.",
        formula: "Values outside range are clipped to min/max",
        default: false,
        badge: "Default: False",
        useWhen: "You need strict bounds on output values",
        type: "checkbox" as const,
        key: "clip" as keyof FeatureScalingConfig,
      },
    ],
    bestPractices: [
      "Neural Networks: Default [0, 1] range works well with sigmoid/tanh activations",
      "Image Processing: Pixel values typically scaled to [0, 1] or [0, 255]",
      "Distance-based Algorithms: KNN, K-means benefit from bounded features",
    ],
    useCases: [
      "Neural networks with sigmoid/tanh activations",
      "Image processing (pixel normalization)",
      "Distance-based algorithms (KNN)",
    ],
  },
  {
    value: "maxabs",
    label: "MaxAbs Scaling",
    subtitle: "MaxAbsScaler Configuration",
    icon: Scale,
    color: "green",
    description: "Configure MaxAbsScaler for sparse data preservation",
    configFields: [
      {
        id: "maxabs-info",
        label: "MaxAbs Scaling Overview",
        description: "Scales each feature by its maximum absolute value. Preserves zeros and maintains sparsity.",
        formula: "x_scaled = x / max(|x|)",
        default: null,
        badge: "Output Range: [-1, 1]",
        useWhen: "Sparse data preservation",
        type: "info" as const,
        key: null,
      },
    ],
    bestPractices: [
      "Sparse Matrices: Preserves zero values and sparsity structure",
      "Text Data: TF-IDF vectors and bag-of-words representations",
      "Memory Efficiency: Works well with scipy.sparse matrices",
    ],
    useCases: [
      "Sparse matrices and sparse data",
      "Text data (TF-IDF, bag-of-words)",
      "When zeros are meaningful",
    ],
  },
  {
    value: "l1",
    label: "L1 Normalization",
    subtitle: "Normalizer with L1 Norm",
    icon: TrendingUp,
    color: "orange",
    description: "Configure Normalizer with L1 norm (Manhattan distance)",
    configFields: [
      {
        id: "l1-info",
        label: "L1 Norm (Manhattan Distance)",
        description: "Normalizes samples to unit L1 norm. The sum of absolute values equals 1.",
        formula: "x_normalized = x / Σ|x|",
        default: null,
        badge: "Sum of Abs Values: 1",
        useWhen: "Sparse features",
        type: "info" as const,
        key: null,
      },
    ],
    bestPractices: [
      "Text Classification: Document-term matrices and TF-IDF vectors",
      "Feature Selection: L1 regularization (Lasso) works well",
      "Sparse Data: Handles high-dimensional sparse data effectively",
    ],
    useCases: [
      "Text classification and mining",
      "Feature selection with L1 regularization",
      "Sparse high-dimensional data",
    ],
  },
  {
    value: "l2",
    label: "L2 Normalization",
    subtitle: "Normalizer with L2 Norm",
    icon: Minimize2,
    color: "cyan",
    description: "Configure Normalizer with L2 norm (Euclidean distance)",
    configFields: [
      {
        id: "l2-info",
        label: "L2 Norm (Euclidean Distance)",
        description: "Normalizes samples to unit L2 norm. The Euclidean length equals 1.",
        formula: "x_normalized = x / √(Σx²)",
        default: null,
        badge: "Vector Length: 1",
        useWhen: "Direction matters",
        type: "info" as const,
        key: null,
      },
    ],
    bestPractices: [
      "Cosine Similarity: Essential for text similarity and recommendations",
      "Text Mining: Document vectors, word embeddings normalization",
      "Neural Networks: Feature normalization before dense layers",
    ],
    useCases: [
      "Cosine similarity calculations",
      "Text mining and document similarity",
      "Neural network feature normalization",
    ],
  },
];

export default function ScalingMethodsCarousel({
  selectedMethods,
  config,
  onConfigChange,
}: ScalingMethodsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Show all methods
  const availableMethods = SCALING_METHODS_CONFIG;

  // Auto-play with progress bar
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!api || !isAutoPlaying || availableMethods.length <= 1) {
      setAutoPlayProgress(0);
      return;
    }

    const initTimeout = setTimeout(() => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setAutoPlayProgress(progress);
        
        if (progress >= 100) {
          progress = 0;
          setAutoPlayProgress(0);
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
        }
      }, 100);

      progressIntervalRef.current = progressInterval;
    }, 300);

    return () => {
      clearTimeout(initTimeout);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [api, isAutoPlaying, availableMethods.length]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap());
      setAutoPlayProgress(0);
    };

    updateCurrent();
    api.on("select", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
    };
  }, [api]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          api.scrollPrev();
          setIsAutoPlaying(false);
          break;
        case "ArrowRight":
          e.preventDefault();
          api.scrollNext();
          setIsAutoPlaying(false);
          break;
        case " ":
          e.preventDefault();
          setIsAutoPlaying(prev => !prev);
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsFullScreen(prev => !prev);
          }
          break;
        case "t":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowThumbnails(prev => !prev);
          }
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
    setAutoPlayProgress(0);
  }, []);

  const toggleFavorite = useCallback((methodValue: string) => {
    setFavorites(prev => 
      prev.includes(methodValue)
        ? prev.filter(v => v !== methodValue)
        : [...prev, methodValue]
    );
  }, []);

  const copyFormula = useCallback((formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  }, []);

  const handleConfigChange = useCallback(
    (key: keyof FeatureScalingConfig, value: any) => {
      const newConfig = { ...config, [key]: value };
      onConfigChange(newConfig);
    },
    [config, onConfigChange]
  );

  return (
    <div className={`space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-8' : ''}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-4 py-1.5 font-semibold">
            <Sparkles className="h-3 w-3 mr-1 inline" />
            {current + 1} / {availableMethods.length}
          </Badge>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{availableMethods[current]?.label}</p>
            <p className="text-xs text-muted-foreground">{availableMethods[current]?.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowThumbnails(prev => !prev)}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Thumbnails</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoPlay}
            className="gap-2"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Auto-play</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyboardShortcuts(prev => !prev)}
            className="gap-2"
          >
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(prev => !prev)}
            className="gap-2"
          >
            <Maximize className="h-4 w-4" />
            <span className="hidden sm:inline">Full</span>
          </Button>
        </div>
      </div>

      {/* Auto-play Progress Bar */}
      {isAutoPlaying && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${autoPlayProgress}%` }}
          />
        </div>
      )}

      {/* Thumbnails Grid */}
      {showThumbnails && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-muted/30 rounded-lg border">
          {availableMethods.map((method, index) => {
            const Icon = method.icon;
            const isActive = index === current;
            const isFavorite = favorites.includes(method.value);
            
            return (
              <button
                key={method.value}
                onClick={() => {
                  api?.scrollTo(index);
                  setIsAutoPlaying(false);
                }}
                className={`
                  p-4 rounded-lg border transition-all
                  ${isActive ? 'border-primary' : 'border-border hover:border-primary/50'}
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-6 w-6" />
                  <p className="text-xs font-medium text-center line-clamp-2">{method.label}</p>
                  {isFavorite && (
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Carousel */}
      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {availableMethods.map((method) => {
              const Icon = method.icon;
              const isFavorite = favorites.includes(method.value);

              return (
                <CarouselItem key={method.value}>
                  <Card className="border">
                    <CardHeader className="pb-6 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <Icon className="h-7 w-7" />
                          </div>
                          
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1 flex items-center gap-2">
                              {method.label}
                              {isFavorite && (
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {method.subtitle}
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(method.value)}
                          >
                            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {method.color}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {method.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                      {/* Configuration Fields */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {method.configFields.map((field) => (
                          <div key={field.id} className="p-5 border rounded-xl">
                            {field.type === "checkbox" && field.key && (
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Label
                                        htmlFor={field.id}
                                        className="font-semibold text-base cursor-pointer"
                                      >
                                        {field.label}
                                      </Label>
                                      <Badge variant="secondary" className="text-xs">
                                        {field.badge}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {field.description}
                                    </p>
                                    
                                    <div className="p-3 bg-muted rounded-lg font-mono text-xs flex items-center justify-between gap-2">
                                      <code>{field.formula}</code>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyFormula(field.formula)}
                                      >
                                        {copiedFormula === field.formula ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    
                                    <Badge variant="outline" className="text-xs">
                                      <Zap className="h-3 w-3 mr-1" />
                                      {field.useWhen}
                                    </Badge>
                                  </div>
                                  
                                  <Checkbox
                                    id={field.id}
                                    checked={(config[field.key] as boolean) !== false}
                                    onCheckedChange={(checked) => {
                                      handleConfigChange(field.key!, checked === true);
                                    }}
                                    className="mt-1 h-5 w-5"
                                  />
                                </div>
                              </div>
                            )}

                            {field.type === "range" && field.key && (
                              <div className="space-y-4">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                  <Scale className="h-4 w-4" />
                                  {field.label}
                                </Label>
                                
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Minimum Value
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={(config[field.key] as [number, number])?.[0] ?? 0}
                                      onChange={(e) => {
                                        const min = Number(e.target.value);
                                        const max = (config[field.key] as [number, number])?.[1] ?? 1;
                                        if (min < max) {
                                          handleConfigChange(field.key!, [min, max]);
                                        }
                                      }}
                                      className="font-mono text-center"
                                    />
                                  </div>
                                  
                                  <div className="pt-6 text-muted-foreground font-bold">→</div>
                                  
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Maximum Value
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={(config[field.key] as [number, number])?.[1] ?? 1}
                                      onChange={(e) => {
                                        const max = Number(e.target.value);
                                        const min = (config[field.key] as [number, number])?.[0] ?? 0;
                                        if (max > min) {
                                          handleConfigChange(field.key!, [min, max]);
                                        }
                                      }}
                                      className="font-mono text-center"
                                    />
                                  </div>
                                </div>
                                
                                <div className="p-3 bg-muted rounded-lg font-mono text-xs">
                                  {field.formula}
                                </div>
                              </div>
                            )}

                            {field.type === "info" && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-primary" />
                                  <Label className="text-base font-semibold">
                                    {field.label}
                                  </Label>
                                </div>
                                
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {field.description}
                                </p>
                                
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                  <code className="text-sm font-mono">{field.formula}</code>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {field.badge}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {field.useWhen}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Best Practices */}
                      <Alert className="border">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-3">
                            <p className="font-semibold flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Machine Learning Best Practices:
                            </p>
                            <ul className="text-sm space-y-2 ml-4">
                              {method.bestPractices.map((practice, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{practice}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>

                      {/* Use Cases */}
                      <div className="p-5 border rounded-xl bg-muted/30">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          When to Use {method.label}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {method.useCases.map((useCase, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm p-2 rounded-lg bg-background/50"
                            >
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{useCase}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2">
        {availableMethods.map((method, index) => (
          <button
            key={index}
            onClick={() => {
              api?.scrollTo(index);
              setIsAutoPlaying(false);
            }}
            aria-label={`Go to ${method.label}`}
          >
            <div className={`
              h-2 rounded-full transition-all
              ${index === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'}
            `} />
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "←/→", action: "Navigate slides" },
                { key: "Space", action: "Toggle auto-play" },
                { key: "Ctrl/Cmd + F", action: "Toggle fullscreen" },
                { key: "Ctrl/Cmd + T", action: "Toggle thumbnails" },
                { key: "?", action: "Show this help" },
              ].map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{shortcut.action}</span>
                  <Badge variant="outline" className="font-mono">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
              
              <Button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="w-full mt-4"
              >
                Got it!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}