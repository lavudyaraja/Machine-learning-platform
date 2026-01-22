import { MethodOption } from "./types";

export const METHODS: MethodOption[] = [
  { value: "drop_rows", label: "Drop rows with missing values", icon: "🗑️" },
  { value: "drop_columns", label: "Drop columns with missing values", icon: "🗑️" },
  { value: "mean", label: "Mean imputation", icon: "📊" },
  { value: "median", label: "Median imputation", icon: "📈" },
  { value: "mode", label: "Mode imputation", icon: "🎯" },
  { value: "constant", label: "Constant value imputation", icon: "🔢" },
  { value: "std", label: "Standard Deviation (std)", icon: "📉" },
  { value: "variance", label: "Variance-based imputation", icon: "📐" },
  { value: "q1", label: "25% (First Quartile – Q1)", icon: "1️⃣" },
  { value: "q2", label: "50% (Median – Q2)", icon: "2️⃣" },
  { value: "q3", label: "75% (Third Quartile – Q3)", icon: "3️⃣" },
];

export const ID_COLUMN_NAMES = [
  'id', 'ID', 'Id', 'row', 'Row', 'index', 'Index', 
  'serial', 'Serial', 'sno', 'SNo', 'SNO', 
  'row_id', 'Row_ID', 'rowid', 'RowID'
];

export const STATISTICAL_METHODS = ["mean", "median", "mode", "std", "variance", "q1", "q2", "q3"];
export const SPECIAL_METHODS = ["drop_rows", "drop_columns", "constant"];

