"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface DatasetGridCardProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Dataset>) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  deleting?: boolean;
}

export default function DatasetGridCard({
  dataset,
  onDelete,
  onUpdate,
  onDuplicate,
  deleting = false,
}: DatasetGridCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [newName, setNewName] = useState(dataset.name);
  const [shareScope, setShareScope] = useState<AccessScope>(dataset.accessScope || "private");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { downloadDataset, duplicateDataset, updateDataset } = useDataset();

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
      className="hover:shadow-lg hover:border-purple-400 transition-all duration-300 group relative overflow-hidden"
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

      <CardHeader className="pb-3 overflow-hidden">
        <div className="flex items-start gap-2 sm:gap-3 overflow-hidden">
          {/* Preview Icon/Thumbnail */}
          <div className="relative shrink-0">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
              <span className="text-xl sm:text-2xl">{getTypeIcon(dataset.type)}</span>
            </div>
            {/* Health Indicator */}
            <div
              className={cn(
                "absolute -top-0.5 -right-0.5 size-3 sm:size-4 rounded-full border-2 border-background z-10 shadow-sm",
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 overflow-hidden">
                <CardTitle 
                  className="text-base sm:text-lg truncate block w-full" 
                  title={dataset.name}
                >
                  {dataset.name}
                </CardTitle>
                <p 
                  className="text-xs sm:text-sm text-muted-foreground mt-1 truncate block w-full" 
                  title={dataset.filename}
                >
                  {dataset.filename}
                </p>
              </div>
            </div>

            {/* Tags and Status */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {getStatusBadge(dataset.status)}
              {dataset.version && (
                <Badge variant="outline" className="text-xs">
                  {dataset.version}
                </Badge>
              )}
              {dataset.type && (
                <Badge variant="outline" className="text-xs capitalize">
                  {dataset.type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Dataset Stats Grid */}
        <div className="grid gap-2 sm:gap-3 grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="size-3" />
              <span>Rows</span>
            </div>
            <p className="text-sm font-semibold">
              {formatNumber(dataset.rows)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="size-3" />
              <span>Columns</span>
            </div>
            <p className="text-sm font-semibold">{dataset.columns}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <File className="size-3" />
              <span>Size</span>
            </div>
            <p className="text-sm font-semibold">
              {formatFileSize(dataset.size)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="size-3" />
              <span>Health</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "size-2.5 rounded-full shrink-0",
                  getHealthColor(dataset.health)
                )}
              />
              <p className="text-sm font-semibold capitalize">
                {dataset.health || "healthy"}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="size-3 text-muted-foreground" />
            {dataset.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{dataset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 pt-2 border-t">
          {dataset.uploadedBy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3" />
              <span className="truncate">By {dataset.uploadedBy}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>
              {formatDate(new Date(dataset.createdAt))}
              {dataset.updatedAt &&
                dataset.updatedAt !== dataset.createdAt &&
                ` • Updated ${formatDate(new Date(dataset.updatedAt))}`}
            </span>
          </div>
          {dataset.accessScope && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3" />
              <span className="capitalize">{dataset.accessScope}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {dataset.isLocked ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs sm:text-sm"
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
              Unlock to View
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="flex-1 text-xs sm:text-sm cursor-pointer">
              <Link href={`/datasets/${dataset.id}`} className="cursor-pointer">
                <Eye className="size-3 sm:size-4 mr-1 sm:mr-2" />
                View
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
                  className="px-2 sm:px-3"
                >
                  <Trash2 className="size-3 sm:size-4" />
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

