"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  File,
  Calendar,
  Database,
  Trash2,
  Eye,
  MoreVertical,
  Lock,
  Download,
  Edit,
  Archive,
  Unlock,
  Copy,
  Share2,
  User,
  Tag,
  Activity,
  Shield,
  Layers,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataset } from "@/hooks/useDataset";
import { formatDate, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Dataset, DatasetStatus, DatasetHealth, AccessScope } from "@/types";
import { toast } from "sonner";

interface DatasetListCardProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Dataset>) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  deleting?: boolean;
}

export default function DatasetListCard({
  dataset,
  onDelete,
  onUpdate,
  onDuplicate,
  deleting = false,
}: DatasetListCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [newName, setNewName] = useState(dataset.name);
  const [shareScope, setShareScope] = useState<AccessScope>(dataset.accessScope || "private");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { downloadDataset, duplicateDataset, updateDataset } = useDataset();

  // Determine data type (Numerical/Categorical) based on columnsInfo
  const dataType = useMemo(() => {
    if (!dataset.columnsInfo || !Array.isArray(dataset.columnsInfo) || dataset.columnsInfo.length === 0) {
      return null;
    }

    let numericalCount = 0;
    let categoricalCount = 0;

    dataset.columnsInfo.forEach(col => {
      const type = col.type?.toLowerCase() || "";
      
      if (type.includes("numeric") || type.includes("int") || type.includes("float") || type.includes("number") || type.includes("decimal")) {
        numericalCount++;
      } else if (type.includes("categorical") || type.includes("string") || type.includes("object") || type.includes("category")) {
        categoricalCount++;
      }
    });

    if (numericalCount > 0 && categoricalCount > 0) {
      return "Mixed";
    } else if (numericalCount > 0) {
      return "Numerical";
    } else if (categoricalCount > 0) {
      return "Categorical";
    }

    return null;
  }, [dataset.columnsInfo]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
  };

  const getHealthColor = (health?: DatasetHealth) => {
    switch (health) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusBadge = (status?: DatasetStatus) => {
    const variants: Record<DatasetStatus, "default" | "secondary" | "outline"> =
      {
        active: "default",
        locked: "secondary",
        archived: "outline",
      };
    return (
      <Badge variant={variants[status || "active"]} className="text-xs">
        {status || "active"}
      </Badge>
    );
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "text":
        return "📄";
      default:
        return "📊";
    }
  };

  async function handleRename() {
    if (!newName.trim() || newName === dataset.name) return;
    try {
      await updateDataset(dataset.id, { name: newName.trim() });
      if (onUpdate) {
        await onUpdate(dataset.id, { name: newName.trim() });
      }
      toast.success("Dataset renamed successfully");
      setRenameOpen(false);
    } catch (error) {
      toast.error("Failed to rename dataset");
    }
  }

  async function handleShare() {
    if (shareScope === dataset.accessScope) return;
    try {
      await updateDataset(dataset.id, { accessScope: shareScope });
      if (onUpdate) {
        await onUpdate(dataset.id, { accessScope: shareScope });
      }
      toast.success("Access scope updated");
      setShareOpen(false);
    } catch (error) {
      toast.error("Failed to update access scope");
    }
  }

  return (
    <Card
      className="hover:shadow-lg hover:border-purple-400 transition-all duration-300 group relative overflow-hidden border-2 rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three Dots Menu - Visible on Hover */}
      <div
        className={cn(
          "absolute top-4 right-4 z-10 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/datasets/${dataset.id}`} className="cursor-pointer">
                <Eye className="size-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await downloadDataset(dataset.id, dataset.filename);
                  toast.success("Dataset downloaded successfully");
                } catch (error) {
                  toast.error("Failed to download dataset");
                }
              }}
              className="cursor-pointer"
            >
              <Download className="size-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                if (isDuplicating) return;
                setIsDuplicating(true);
                try {
                  await duplicateDataset(dataset.id);
                  if (onDuplicate) {
                    await onDuplicate(dataset.id);
                  }
                  toast.success("Dataset duplicated successfully");
                } catch (error) {
                  toast.error("Failed to duplicate dataset");
                } finally {
                  setIsDuplicating(false);
                }
              }}
              disabled={isDuplicating}
              className="cursor-pointer"
            >
              <Copy className="size-4 mr-2" />
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRenameOpen(true)} className="cursor-pointer">
              <Edit className="size-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShareOpen(true)} className="cursor-pointer">
              <Share2 className="size-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {dataset.isLocked ? (
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await updateDataset(dataset.id, { isLocked: false, status: "active" });
                    if (onUpdate) {
                      await onUpdate(dataset.id, { isLocked: false, status: "active" });
                    }
                    toast.success("Dataset unlocked");
                  } catch (error) {
                    toast.error("Failed to unlock dataset");
                  }
                }}
                className="cursor-pointer"
              >
                <Unlock className="size-4 mr-2" />
                Unlock
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await updateDataset(dataset.id, { isLocked: true, status: "locked" });
                    if (onUpdate) {
                      await onUpdate(dataset.id, { isLocked: true, status: "locked" });
                    }
                    toast.success("Dataset locked");
                  } catch (error) {
                    toast.error("Failed to lock dataset");
                  }
                }}
                className="cursor-pointer"
              >
                <Lock className="size-4 mr-2" />
                Lock
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await updateDataset(dataset.id, { status: "archived" });
                  if (onUpdate) {
                    await onUpdate(dataset.id, { status: "archived" });
                  }
                  toast.success("Dataset archived");
                } catch (error) {
                  toast.error("Failed to archive dataset");
                }
              }}
              className="cursor-pointer"
            >
              <Archive className="size-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{dataset.name}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(dataset.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-4 gap-6">
          
          {/* 1. Left Section: File Info */}
          <div className="flex items-center gap-4 flex-1 min-w-[280px]">
            <div className="relative shrink-0">
              <div className="size-14 bg-primary/10 border-2 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {getTypeIcon(dataset.type)}
              </div>
              {/* Health Indicator */}
              <div
                className={cn(
                  "absolute -top-1 -right-1 size-3 rounded-full border-2 border-background z-10 shadow-sm",
                  getHealthColor(dataset.health)
                )}
                title={`Health: ${dataset.health || "healthy"}`}
              />
              {/* Lock Icon */}
              {dataset.isLocked && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-background">
                  <Lock className="size-3 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base font-semibold truncate">
                  {dataset.name}
                </CardTitle>
                {getStatusBadge(dataset.status)}
              </div>
              <p className="text-xs text-muted-foreground truncate mb-2">
                {dataset.filename}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {dataset.uploadedBy && (
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {dataset.uploadedBy}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> {formatDate(new Date(dataset.createdAt))}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Middle Section: Stats */}
          <div className="hidden lg:flex items-center justify-between flex-[2.5] px-8 border-x-2 border-dashed h-14">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/20 rounded-md">
                <Database className="size-4 text-primary/70" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground/70 leading-none mb-1">Rows</p>
                <p className="text-sm font-semibold">{formatNumber(dataset.rows)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/20 rounded-md">
                <Layers className="size-4 text-primary/70" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground/70 leading-none mb-1">Columns</p>
                <p className="text-sm font-semibold">{dataset.columns}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/20 rounded-md">
                <BarChart3 className="size-4 text-primary/70" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground/70 leading-none mb-1">Size</p>
                <p className="text-sm font-semibold">{formatFileSize(dataset.size)}</p>
              </div>
            </div>

            {/* Data Type (Numerical/Categorical) */}
            {dataType && (
              <div className="flex items-center gap-3 pl-4 border-l-2 border-muted/30">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Activity className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-muted-foreground/70 leading-none mb-1">Data Type</p>
                  <p className="text-sm font-semibold text-primary capitalize">{dataType}</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Right Section: Actions */}
          <div className="flex items-center justify-between lg:justify-end gap-6 flex-1 shrink-0">
            <div className="flex flex-col items-end gap-1">
              {dataset.version && (
                <Badge variant="outline" className="text-xs">
                  v{dataset.version}
                </Badge>
              )}
              {dataset.type && (
                <Badge variant="outline" className="text-xs capitalize">
                  {dataset.type}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {dataset.isLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-5"
                  onClick={async () => {
                    try {
                      await updateDataset(dataset.id, { isLocked: false, status: "active" });
                      if (onUpdate) {
                        await onUpdate(dataset.id, { isLocked: false, status: "active" });
                      }
                      toast.success("Dataset unlocked");
                    } catch (error) {
                      toast.error("Failed to unlock dataset");
                    }
                  }}
                >
                  <Unlock className="size-4 mr-2" />
                  Unlock
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm" className="h-10 px-5 cursor-pointer">
                  <Link href={`/datasets/${dataset.id}`} className="cursor-pointer">
                    <Eye className="size-4 mr-2" /> View
                  </Link>
                </Button>
              )}

              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                      className="h-10 w-10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{dataset.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(dataset.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Stats - Shown only on small screens */}
        <div className="lg:hidden mt-4 pt-4 border-t px-4 pb-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center">
              <Database className="size-4 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Rows</span>
              <span className="text-sm font-semibold">{formatNumber(dataset.rows)}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Layers className="size-4 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Columns</span>
              <span className="text-sm font-semibold">{dataset.columns}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="size-4 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Size</span>
              <span className="text-sm font-semibold">{formatFileSize(dataset.size)}</span>
            </div>
            {dataType ? (
              <div className="flex flex-col items-center text-center">
                <Activity className="size-4 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-sm font-semibold text-primary capitalize">{dataType}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Activity className="size-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Health</span>
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      getHealthColor(dataset.health)
                    )}
                  />
                  <span className="text-sm font-semibold capitalize">
                    {dataset.health || "healthy"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags - Mobile */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="lg:hidden mt-3 pt-3 border-t px-4 pb-4 flex items-center gap-1.5 flex-wrap">
            <Tag className="size-3 text-muted-foreground" />
            {dataset.tags.slice(0, 5).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 5 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{dataset.tags.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Dataset</DialogTitle>
            <DialogDescription>
              Enter a new name for this dataset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dataset Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter dataset name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newName.trim() || newName === dataset.name}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dataset</DialogTitle>
            <DialogDescription>
              Share "{dataset.name}" via different methods or change access scope.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Share Methods */}
            <div className="space-y-3">
              <Label>Share via</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const url = `${window.location.origin}/datasets/${dataset.id}`;
                    const text = `Check out this dataset: ${dataset.name}\n${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    toast.success("Opening WhatsApp...");
                  }}
                >
                  <Share2 className="size-4 mr-2" />
                  Share via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const url = `${window.location.origin}/datasets/${dataset.id}`;
                    const subject = `Dataset: ${dataset.name}`;
                    const body = `Check out this dataset: ${dataset.name}\n\nView it here: ${url}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
                    toast.success("Opening email client...");
                  }}
                >
                  <Share2 className="size-4 mr-2" />
                  Share via Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    const url = `${window.location.origin}/datasets/${dataset.id}`;
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard!");
                    } catch (error) {
                      // Fallback for older browsers
                      const textArea = document.createElement("textarea");
                      textArea.value = url;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand("copy");
                      document.body.removeChild(textArea);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                >
                  <Copy className="size-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Access Scope</Label>
                <Select
                  value={shareScope}
                  onValueChange={(value: AccessScope) => setShareScope(value)}
                >
                  <SelectTrigger id="scope" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareScope === dataset.accessScope}
            >
              Update Access Scope
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
