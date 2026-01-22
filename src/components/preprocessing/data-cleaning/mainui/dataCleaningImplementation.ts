/**
 * Data Cleaning Implementation - Type Definitions
 * 
 * Type definitions for data cleaning methods.
 */

export interface CleaningResult {
  success: boolean;
  rowsProcessed: number;
  rowsAffected: number;
  columnsAffected: string[];
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

export interface DatasetData {
  columns: string[];
  rows: unknown[][];
  totalRows: number;
}
