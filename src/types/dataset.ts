// Dataset-related types

export type DatasetType = "tabular" | "image" | "text";
export type DatasetStatus = "active" | "locked" | "archived";
export type DatasetHealth = "healthy" | "warning" | "error";
export type AccessScope = "private" | "team" | "project";

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  size: number;
  rows: number;
  columns: number;
  columnsInfo?: DatasetColumn[];
  createdAt: string;
  updatedAt?: string;
  // New fields
  type?: DatasetType;
  version?: string;
  uploadedBy?: string;
  status?: DatasetStatus;
  health?: DatasetHealth;
  tags?: string[];
  accessScope?: AccessScope;
  isLocked?: boolean;
}

export interface DatasetColumn {
  name: string;
  type: string;
  nullable: boolean;
  unique?: number;
  nullCount?: number;
}

export interface DatasetPreview {
  columns: string[];
  rows: unknown[][];
  totalRows: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

