"""Preprocessing-related endpoints"""
from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Optional, List, Dict, Union
from pydantic import BaseModel
import time
import io
from .dependencies import UPLOAD_DIR

from .preprocessing_imports import (
    handle_missing_values,
    process_data_cleaning,
    process_categorical_encoding,
    process_feature_scaling,
    process_feature_selection,
    process_feature_extraction,
    process_dataset_splitting
)
from .utils import resolve_dataset_path_from_id, register_processed_dataset
import os

router = APIRouter()

class MissingValuesRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    columns: Optional[List[str]] = []
    constant_value: Optional[Union[str, int, float]] = None
    threshold: float = 0.5

@router.post("/preprocess/missing-values")
def preprocess_missing_values(req: MissingValuesRequest):
    """Handle missing values in a dataset"""
    try:
        print(f"[Missing Values API] Received request: dataset_id={req.dataset_id}, dataset_path={req.dataset_path}, method={req.method}, columns={req.columns}, threshold={req.threshold}")
        
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(
                status_code=404, 
                detail=f"Dataset file not found: {dataset_path}"
            )
        
        valid_methods = [
            "mean", "median", "mode", "constant", 
            "drop_rows", "drop_columns", 
            "std", "variance", "q1", "q2", "q3"
        ]
        if req.method not in valid_methods:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        if req.method == "constant" and req.constant_value is None:
            raise HTTPException(
                status_code=400,
                detail="Constant value is required when using constant method"
            )
        
        try:
            result = handle_missing_values(
                dataset_path=str(dataset_path),
                method=req.method,
                columns=req.columns if req.columns else None,
                constant_value=req.constant_value,
                threshold=req.threshold
            )
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            import traceback
            print(f"Error in handle_missing_values: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error processing missing values: {str(e)}"
            )
        
        print(f"[Missing Values API] Processing completed successfully")
        print(f"[Missing Values API] Processed path: {result.get('processed_path')}")
        
        processed_path = Path(result.get('processed_path', ''))
        if not processed_path.exists():
            print(f"[Missing Values API] Warning: Processed file not found at {processed_path}")
        
        # Store preprocessing step in database and get dataset_id for response
        dataset_id = None
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="missing_values",
                    step_name=f"Missing Values - {req.method}",
                    config={
                        "method": req.method,
                        "columns": req.columns if req.columns else None,
                        "constant_value": req.constant_value,
                        "threshold": req.threshold
                    },
                    output_path=str(processed_path) if processed_path.exists() else None,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Missing Values API] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Missing Values API] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
            # Fallback to file stem if database query failed
            if not dataset_id:
                dataset_id = dataset_path.stem
        
        # Format response to match frontend expectations
        final_dataset_id = dataset_id or dataset_path.stem
        
        response_data = {
            "success": True,
            "statistics": result.get("statistics", {}),
            "metrics": {
                "originalRows": result.get("original_rows", 0),
                "originalColumns": result.get("original_cols", 0),  # Note: backend returns original_cols
                "processedRows": result.get("processed_rows", 0),
                "processedColumns": result.get("processed_cols", 0),  # Note: backend returns processed_cols
                "missing_counts_before": result.get("missing_counts_before", {})
            },
            "processed_path": str(processed_path) if processed_path.exists() else result.get("processed_path", ""),
            "message": "Missing values processed successfully"
        }
        
        # Database-first storage
        csv_content = result.get("processed_csv_content")
        if not csv_content and processed_path.exists():
            with open(processed_path, 'r', encoding='utf-8') as f:
                csv_content = f.read()
        
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "missing_values")
            # Remove local file if it exists, as requested by user
            if processed_path.exists():
                try:
                    os.remove(processed_path)
                except:
                    pass
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in missing values endpoint: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing missing values: {str(e)}"
        )

class DataCleaningRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method_type: str
    method: str
    columns: Optional[List[str]] = []
    strategy: Optional[str] = None
    constant_value: Optional[Union[str, int, float]] = None
    threshold: Optional[float] = None
    text_method: Optional[str] = None
    trim_method: Optional[str] = None
    imbalance_method: Optional[str] = None
    target_column: Optional[str] = None
    log_method: Optional[str] = None
    outlier_method: Optional[str] = None
    skewness_method: Optional[str] = None
    smooth_method: Optional[str] = None
    window_size: Optional[int] = None
    remove_special_chars: Optional[bool] = False
    subset: Optional[List[str]] = None

@router.post("/preprocess/data-cleaning")
def preprocess_data_cleaning(req: DataCleaningRequest):
    """Process data cleaning operations"""
    try:
        print(f"[Data Cleaning] Received request: dataset_id={req.dataset_id}, dataset_path={req.dataset_path}, method_type={req.method_type}, method={req.method}, columns={req.columns}")
        
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        valid_types = ["categorical", "numerical", "common"]
        if req.method_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method_type: {req.method_type}. Valid types are: {', '.join(valid_types)}"
            )
        
        kwargs = {}
        if req.strategy:
            kwargs["strategy"] = req.strategy
        if req.constant_value is not None:
            kwargs["constant_value"] = req.constant_value
        if req.threshold is not None:
            kwargs["threshold"] = req.threshold
        if req.text_method:
            kwargs["text_method"] = req.text_method
        if req.trim_method:
            kwargs["trim_method"] = req.trim_method
        if req.imbalance_method:
            kwargs["imbalance_method"] = req.imbalance_method
        if req.target_column:
            kwargs["target_column"] = req.target_column
        if req.log_method:
            kwargs["log_method"] = req.log_method
        if req.outlier_method:
            kwargs["outlier_method"] = req.outlier_method
        if req.skewness_method:
            kwargs["skewness_method"] = req.skewness_method
        if req.smooth_method:
            kwargs["smooth_method"] = req.smooth_method
        if req.window_size:
            kwargs["window_size"] = req.window_size
        if req.remove_special_chars is not None:
            kwargs["remove_special_chars"] = req.remove_special_chars
        if req.subset:
            kwargs["subset"] = req.subset
        
        print(f"[Data Cleaning] Processing with kwargs: {kwargs}")
        
        result = process_data_cleaning(
            dataset_path=str(dataset_path),
            method_type=req.method_type,
            method=req.method,
            columns=req.columns if req.columns else None,
            **kwargs
        )
        
        print(f"[Data Cleaning] Processing completed. Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        print(f"[Data Cleaning] Processed path: {result.get('processed_path') if isinstance(result, dict) else 'N/A'}")
        
        if isinstance(result, dict) and "processed_path" not in result:
            print(f"[Data Cleaning] WARNING: processed_path not in result!")
        
        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = result.get('processed_path') if isinstance(result, dict) else None
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="data_cleaning",
                    step_name=f"Data Cleaning - {req.method_type}/{req.method}",
                    config={
                        "method_type": req.method_type,
                        "method": req.method,
                        "columns": req.columns if req.columns else None,
                        "strategy": req.strategy,
                        "constant_value": req.constant_value,
                        "threshold": req.threshold,
                        "target_column": req.target_column
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Data Cleaning] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Data Cleaning] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Format response to match frontend expectations
        processed_path_str = result.get('processed_path', '') if isinstance(result, dict) else ''
        processed_path_obj = Path(processed_path_str) if processed_path_str else None
        
        # Get dataset_id for response
        final_dataset_id = None
        try:
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem
        
        response_data = {
            "success": True,
            "processed_path": processed_path_str,
            "metrics": {
                "originalRows": result.get("original_rows", 0) if isinstance(result, dict) else 0,
                "originalColumns": result.get("original_cols", 0) if isinstance(result, dict) else 0,
                "processedRows": result.get("processed_rows", 0) if isinstance(result, dict) else 0,
                "processedColumns": result.get("processed_cols", 0) if isinstance(result, dict) else 0,
            },
            "message": "Data cleaning completed successfully"
        }
        
        # Database-first storage
        csv_content = result.get("processed_csv_content")
        if not csv_content and processed_path_obj and processed_path_obj.exists():
            with open(processed_path_obj, 'r', encoding='utf-8') as f:
                csv_content = f.read()
        
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "data_cleaning")
            # Remove local file if it exists, as requested by user
            if processed_path_obj and processed_path_obj.exists():
                try:
                    os.remove(processed_path_obj)
                except:
                    pass
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        # Add metadata if available
        if isinstance(result, dict):
            if "metadata" in result:
                response_data["metadata"] = result["metadata"]
            if "columns_processed" in result:
                response_data["columns_processed"] = result["columns_processed"]
            if "rows_affected" in result:
                response_data["rows_affected"] = result.get("rows_affected", 0)
            if "missing_handled" in result:
                response_data["missing_handled"] = result.get("missing_handled", 0)
            if "duplicates_removed" in result:
                response_data["duplicates_removed"] = result.get("duplicates_removed", 0)
            if "rows_dropped" in result:
                response_data["rows_dropped"] = result.get("rows_dropped", 0)
            if "columns_removed" in result:
                response_data["columns_removed"] = result.get("columns_removed", [])
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing data cleaning: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing data cleaning: {str(e)}")

class CategoricalEncodingRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    columns: List[str]
    target_column: Optional[str] = None
    drop_first: bool = False
    handle_unknown: str = "ignore"
    ordinal_mapping: Optional[Dict[str, Dict[str, int]]] = None
    n_features: Optional[int] = None  # For hash encoding

@router.post("/preprocess/categorical-encoding")
def preprocess_categorical_encoding(req: CategoricalEncodingRequest):
    """Process categorical encoding operations"""
    try:
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        method_normalized = req.method.lower()
        if method_normalized == "one_hot":
            method_normalized = "onehot"
        elif method_normalized == "leave-one-out":
            method_normalized = "leave_one_out"
        elif method_normalized == "weight_of_evidence":
            method_normalized = "woe"
        
        valid_methods = ["label", "onehot", "ordinal", "target", "binary", "frequency", "count", "hash", "leave_one_out", "woe"]
        if method_normalized not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        encoding_kwargs = {}
        if method_normalized == "hash" and req.n_features:
            encoding_kwargs["n_features"] = req.n_features
        
        result = process_categorical_encoding(
            dataset_path=str(dataset_path),
            method=method_normalized,
            columns=req.columns,
            target_column=req.target_column,
            drop_first=req.drop_first,
            handle_unknown=req.handle_unknown,
            ordinal_mapping=req.ordinal_mapping,
            **encoding_kwargs
        )
        
        # Check if we need to save the processed data to disk
        if isinstance(result, dict) and "processed_csv_content" in result and not result.get("processed_path"):
            try:
                import pandas as pd
                from io import StringIO
                df_processed = pd.read_csv(StringIO(result["processed_csv_content"]))
                timestamp = int(time.time() * 1000)
                processed_filename = f"{timestamp}_{dataset_path.stem}_encoded.csv"
                processed_file_path = UPLOAD_DIR / processed_filename
                df_processed.to_csv(processed_file_path, index=False)
                result["processed_path"] = str(processed_file_path)
                print(f"[Categorical Encoding] Saved processed data to: {processed_file_path}")
            except Exception as e:
                print(f"[Categorical Encoding] Warning: Could not save processed data to disk: {e}")

        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = result.get('processed_path') if isinstance(result, dict) else None
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="categorical_encoding",
                    step_name=f"Categorical Encoding - {method_normalized}",
                    config={
                        "method": method_normalized,
                        "columns": req.columns,
                        "target_column": req.target_column,
                        "drop_first": req.drop_first,
                        "handle_unknown": req.handle_unknown,
                        "ordinal_mapping": req.ordinal_mapping
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Categorical Encoding] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Categorical Encoding] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Prepare response
        response_data = result
        
        # Add processedData if available (use preview from result if available)
        final_dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem

        # Database-first storage
        csv_content = result.get("processed_csv_content")
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "categorical_encoding")
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing categorical encoding: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing categorical encoding: {str(e)}")

class FeatureScalingRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    columns: List[str]
    feature_range: Optional[List[float]] = None
    with_mean: bool = True
    with_std: bool = True
    with_centering: bool = True
    with_scaling: bool = True
    n_quantiles: int = 1000
    output_distribution: str = "uniform"
    log_base: Optional[float] = None

@router.post("/preprocess/feature-scaling")
def preprocess_feature_scaling(req: FeatureScalingRequest):
    """Process feature scaling operations"""
    try:
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        method_normalized = req.method.lower()
        if method_normalized == "box-cox":
            method_normalized = "box_cox"
        elif method_normalized == "yeo-johnson":
            method_normalized = "yeo_johnson"
        elif method_normalized == "unit-vector":
            method_normalized = "unit_vector"
        
        valid_methods = ["standard", "minmax", "robust", "maxabs", "quantile", 
                        "box_cox", "yeo_johnson", "l1", "l2", "unit_vector", "log", "decimal"]
        if method_normalized not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        feature_range_tuple = None
        if req.feature_range and len(req.feature_range) == 2:
            feature_range_tuple = (req.feature_range[0], req.feature_range[1])
        
        log_base = req.log_base if req.log_base is not None else 2.718281828459045
        
        result = process_feature_scaling(
            dataset_path=str(dataset_path),
            method=method_normalized,
            columns=req.columns,
            feature_range=feature_range_tuple,
            with_mean=req.with_mean,
            with_std=req.with_std,
            with_centering=req.with_centering,
            with_scaling=req.with_scaling,
            n_quantiles=req.n_quantiles,
            output_distribution=req.output_distribution,
            log_base=log_base
        )
        
        # Check if we need to save the processed data to disk
        if isinstance(result, dict) and "processed_csv_content" in result and not result.get("processed_path"):
            try:
                import pandas as pd
                from io import StringIO
                df_processed = pd.read_csv(StringIO(result["processed_csv_content"]))
                timestamp = int(time.time() * 1000)
                processed_filename = f"{timestamp}_{dataset_path.stem}_scaled.csv"
                processed_file_path = UPLOAD_DIR / processed_filename
                df_processed.to_csv(processed_file_path, index=False)
                result["processed_path"] = str(processed_file_path)
                print(f"[Feature Scaling] Saved processed data to: {processed_file_path}")
            except Exception as e:
                print(f"[Feature Scaling] Warning: Could not save processed data to disk: {e}")

        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = result.get('processed_path') if isinstance(result, dict) else None
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="feature_scaling",
                    step_name=f"Feature Scaling - {method_normalized}",
                    config={
                        "method": method_normalized,
                        "columns": req.columns,
                        "feature_range": req.feature_range,
                        "with_mean": req.with_mean,
                        "with_std": req.with_std,
                        "n_quantiles": req.n_quantiles,
                        "output_distribution": req.output_distribution,
                        "log_base": log_base
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Feature Scaling] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Feature Scaling] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Prepare response
        response_data = result
        
        # Add processedData if available (use preview from result if available)
        final_dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem

        # Database-first storage
        csv_content = result.get("processed_csv_content")
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "feature_scaling")
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing feature scaling: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing feature scaling: {str(e)}")

class FeatureSelectionRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    columns: List[str]
    target_column: Optional[str] = None
    n_features: Optional[int] = None
    threshold: float = 0.0
    correlation_threshold: float = 0.8
    alpha: float = 0.01

@router.post("/preprocess/feature-selection")
def preprocess_feature_selection(req: FeatureSelectionRequest):
    """Process feature selection operations"""
    try:
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        valid_methods = ["variance_threshold", "correlation", "mutual_info", "chi2", 
                        "f_test", "forward_selection", "backward_elimination", "rfe", 
                        "recursive_elimination", "lasso", "ridge", "elastic_net", "tree_importance"]
        if req.method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        supervised_methods = ["mutual_info", "chi2", "f_test", "forward_selection", 
                             "backward_elimination", "rfe", "recursive_elimination", 
                             "lasso", "ridge", "elastic_net", "tree_importance"]
        if req.method in supervised_methods and not req.target_column:
            raise HTTPException(
                status_code=400,
                detail=f"target_column is required for {req.method} method"
            )
        
        result = process_feature_selection(
            dataset_path=str(dataset_path),
            method=req.method,
            columns=req.columns,
            target_column=req.target_column,
            n_features=req.n_features,
            threshold=req.threshold,
            correlation_threshold=req.correlation_threshold,
            alpha=req.alpha
        )
        
        # Check if we need to save the processed data to disk
        if isinstance(result, dict) and "processed_csv_content" in result and not result.get("processed_path"):
            try:
                import pandas as pd
                from io import StringIO
                df_processed = pd.read_csv(StringIO(result["processed_csv_content"]))
                timestamp = int(time.time() * 1000)
                processed_filename = f"{timestamp}_{dataset_path.stem}_selected.csv"
                processed_file_path = UPLOAD_DIR / processed_filename
                df_processed.to_csv(processed_file_path, index=False)
                result["processed_path"] = str(processed_file_path)
                print(f"[Feature Selection] Saved processed data to: {processed_file_path}")
            except Exception as e:
                print(f"[Feature Selection] Warning: Could not save processed data to disk: {e}")

        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = result.get('processed_path') if isinstance(result, dict) else None
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="feature_selection",
                    step_name=f"Feature Selection - {req.method}",
                    config={
                        "method": req.method,
                        "columns": req.columns,
                        "target_column": req.target_column,
                        "n_features": req.n_features,
                        "threshold": req.threshold,
                        "correlation_threshold": req.correlation_threshold,
                        "alpha": req.alpha
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Feature Selection] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Feature Selection] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Prepare response
        response_data = result
        
        # Add processedData if available (use preview from result if available)
        final_dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem

        # Database-first storage
        csv_content = result.get("processed_csv_content")
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "feature_selection")
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing feature selection: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing feature selection: {str(e)}")

class FeatureExtractionRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    columns: Optional[List[str]] = None
    n_components: int = 2
    target_column: Optional[str] = None
    variance_threshold: Optional[float] = None
    random_state: int = 42
    svd_solver: Optional[str] = None
    whiten: Optional[bool] = None
    tol: Optional[float] = None
    solver: Optional[str] = None
    shrinkage: Optional[float] = None
    algorithm: Optional[str] = None
    fun: Optional[str] = None
    max_iter: Optional[int] = None
    n_iter: Optional[int] = None
    perplexity: Optional[float] = None
    early_exaggeration: Optional[float] = None
    learning_rate: Optional[Union[str, float]] = None
    n_neighbors: Optional[int] = None
    min_dist: Optional[float] = None
    metric: Optional[str] = None

@router.post("/preprocess/feature-extraction")
def preprocess_feature_extraction(req: FeatureExtractionRequest):
    """Process feature extraction operations"""
    try:
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        valid_methods = ["pca", "lda", "ica", "svd", "factor_analysis", "tsne", "umap"]
        if req.method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        if req.method == "lda" and not req.target_column:
            raise HTTPException(
                status_code=400,
                detail="target_column is required for LDA method"
            )
        
        kwargs = {}
        if req.method == "pca":
            if req.svd_solver is not None:
                kwargs['svd_solver'] = req.svd_solver
            if req.whiten is not None:
                kwargs['whiten'] = req.whiten
            if req.tol is not None:
                kwargs['tol'] = req.tol
        elif req.method == "lda":
            if req.solver is not None:
                kwargs['solver'] = req.solver
            if req.shrinkage is not None:
                kwargs['shrinkage'] = req.shrinkage
        elif req.method == "ica":
            if req.algorithm is not None:
                kwargs['algorithm'] = req.algorithm
            if req.fun is not None:
                kwargs['fun'] = req.fun
            if req.max_iter is not None:
                kwargs['max_iter'] = req.max_iter
        elif req.method == "svd":
            if req.algorithm is not None:
                kwargs['algorithm'] = req.algorithm
            if req.n_iter is not None:
                kwargs['n_iter'] = req.n_iter
            if req.tol is not None:
                kwargs['tol'] = req.tol
        elif req.method == "factor_analysis":
            if req.max_iter is not None:
                kwargs['max_iter'] = req.max_iter
            if req.tol is not None:
                kwargs['tol'] = req.tol
        elif req.method == "tsne":
            if req.perplexity is not None:
                kwargs['perplexity'] = req.perplexity
            if req.early_exaggeration is not None:
                kwargs['early_exaggeration'] = req.early_exaggeration
            if req.learning_rate is not None:
                kwargs['learning_rate'] = req.learning_rate
        elif req.method == "umap":
            if req.n_neighbors is not None:
                kwargs['n_neighbors'] = req.n_neighbors
            if req.min_dist is not None:
                kwargs['min_dist'] = req.min_dist
            if req.metric is not None:
                kwargs['metric'] = req.metric
        
        columns_to_use = req.columns if req.columns and len(req.columns) > 0 else None
        
        result = process_feature_extraction(
            dataset_path=str(dataset_path),
            method=req.method,
            columns=columns_to_use,
            n_components=req.n_components,
            target_column=req.target_column,
            variance_threshold=req.variance_threshold,
            random_state=req.random_state,
            **kwargs
        )
        
        # Check if we need to save the processed data to disk
        if isinstance(result, dict) and "processed_csv_content" in result and not result.get("processed_path"):
            try:
                import pandas as pd
                from io import StringIO
                df_processed = pd.read_csv(StringIO(result["processed_csv_content"]))
                timestamp = int(time.time() * 1000)
                processed_filename = f"{timestamp}_{dataset_path.stem}_extracted.csv"
                processed_file_path = UPLOAD_DIR / processed_filename
                df_processed.to_csv(processed_file_path, index=False)
                result["processed_path"] = str(processed_file_path)
                print(f"[Feature Extraction] Saved processed data to: {processed_file_path}")
            except Exception as e:
                print(f"[Feature Extraction] Warning: Could not save processed data to disk: {e}")

        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = result.get('processed_path') if isinstance(result, dict) else None
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="feature_extraction",
                    step_name=f"Feature Extraction - {req.method}",
                    config={
                        "method": req.method,
                        "columns": columns_to_use,
                        "n_components": req.n_components,
                        "target_column": req.target_column,
                        "variance_threshold": req.variance_threshold,
                        "random_state": req.random_state,
                        **kwargs
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Feature Extraction] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Feature Extraction] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Prepare response
        response_data = result
        
        # Add processedData if available (use preview from result if available)
        final_dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem

        # Database-first storage
        csv_content = result.get("processed_csv_content")
        new_dataset_id = final_dataset_id
        if csv_content:
            new_dataset_id = register_processed_dataset(csv_content, dataset_path, result, "feature_extraction")
        
        response_data["processedData"] = {
            "datasetId": new_dataset_id,
            "data": {
                "columns": result.get("preview", {}).get("columns", []),
                "rows": result.get("preview", {}).get("rows", []),
                "totalRows": result.get("processed_rows", 0)
            }
        }
        
        # If preview was missing but we have content, generate it
        if not response_data["processedData"]["data"]["columns"] and csv_content:
             try:
                import pandas as pd
                from io import StringIO
                df_prev = pd.read_csv(StringIO(csv_content), nrows=100)
                response_data["processedData"]["data"] = {
                    "columns": df_prev.columns.tolist(),
                    "rows": df_prev.values.tolist(),
                    "totalRows": len(df_prev) if result.get("processed_rows") == 0 else result.get("processed_rows")
                }
             except:
                 pass
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing feature extraction: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing feature extraction: {str(e)}")

class DatasetSplittingRequest(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    method: str
    test_size: float = 0.2
    validation_size: Optional[float] = None
    random_state: int = 42
    shuffle: bool = True
    stratify_column: Optional[str] = None
    time_column: Optional[str] = None
    group_column: Optional[str] = None

@router.post("/preprocess/dataset-splitting")
def preprocess_dataset_splitting(req: DatasetSplittingRequest):
    """Process dataset splitting operations"""
    try:
        # Resolve dataset path from ID or path
        dataset_path = resolve_dataset_path_from_id(req.dataset_id, req.dataset_path)
        
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
        
        valid_methods = ["random", "stratified", "time_series", "group"]
        if req.method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method: {req.method}. Valid methods are: {', '.join(valid_methods)}"
            )
        
        if req.method == "stratified" and not req.stratify_column:
            raise HTTPException(
                status_code=400,
                detail="stratify_column is required for stratified splitting"
            )
        
        if req.method == "group" and not req.group_column:
            raise HTTPException(
                status_code=400,
                detail="group_column is required for group splitting"
            )
        
        total_size = req.test_size + (req.validation_size or 0)
        if total_size >= 1.0 or total_size <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid split sizes: test_size={req.test_size}, validation_size={req.validation_size}. Total must be between 0 and 1."
            )
        
        result = process_dataset_splitting(
            dataset_path=str(dataset_path),
            method=req.method,
            test_size=req.test_size,
            validation_size=req.validation_size,
            random_state=req.random_state,
            shuffle=req.shuffle,
            stratify_column=req.stratify_column,
            time_column=req.time_column,
            group_column=req.group_column
        )
        
        # Store preprocessing step in database
        try:
            from database import get_db_context
            from models import PreprocessingStep, Dataset
            
            dataset_id = None
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    dataset_id = str(db_dataset.id)
                else:
                    dataset_id = dataset_path.stem
            
            processed_path = None
            if isinstance(result, dict):
                processed_path = result.get('train_path') or result.get('processed_path')
            
            with get_db_context() as db:
                preprocessing_step = PreprocessingStep(
                    dataset_id=dataset_id,
                    step_type="dataset_splitting",
                    step_name=f"Dataset Splitting - {req.method}",
                    config={
                        "method": req.method,
                        "test_size": req.test_size,
                        "validation_size": req.validation_size,
                        "random_state": req.random_state,
                        "shuffle": req.shuffle,
                        "stratify_column": req.stratify_column,
                        "time_column": req.time_column,
                        "group_column": req.group_column
                    },
                    output_path=processed_path,
                    status="completed"
                )
                db.add(preprocessing_step)
                print(f"[Dataset Splitting] Preprocessing step saved to database with ID: {preprocessing_step.id}")
        except Exception as db_error:
            print(f"[Dataset Splitting] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        # Prepare response
        response_data = result
        
        # Add processedData if available (use preview from result if available)
        final_dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            with get_db_context() as db:
                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(dataset_path)).first()
                if db_dataset:
                    final_dataset_id = str(db_dataset.id)
                else:
                    final_dataset_id = dataset_path.stem
        except:
            final_dataset_id = dataset_path.stem

        # Initialize processedData
        processed_data_field = {
            "datasetId": final_dataset_id,
        }

        # Special handling for splitting which has multiple datasets
        if isinstance(result, dict) and "splits" in result:
            processed_splits = []
            
            for split_type, split_info in result["splits"].items():
                if isinstance(split_info, dict) and "csv_content" in split_info:
                    try:
                        csv_content = split_info["csv_content"]
                        
                        # Use helper to register in DB
                        current_id = register_processed_dataset(csv_content, dataset_path, result, "dataset_splitting", split_type=split_type)
                        
                        # Parse for preview
                        import pandas as pd
                        from io import StringIO
                        df_split = pd.read_csv(StringIO(csv_content), nrows=100)

                        # Add to array
                        processed_splits.append({
                            "splitType": split_type,
                            "datasetId": current_id,
                            "data": {
                                "columns": df_split.columns.tolist(),
                                "rows": df_split.values.tolist(),
                                "totalRows": len(df_split)
                            }
                        })
                    except Exception as e:
                        print(f"[Dataset Splitting] Warning: Could not process {split_type} split: {e}")
            
            processed_data_field["splits"] = processed_splits
            response_data["processedData"] = processed_data_field
        elif isinstance(result, dict) and "processed_csv_content" in result:
             # Fallback if splits aren't in dict but content is
             new_id = register_processed_dataset(result["processed_csv_content"], dataset_path, result, "dataset_splitting")
             response_data["processedData"] = {
                "datasetId": new_id,
                "data": {
                    "columns": result.get("preview", {}).get("columns", []),
                    "rows": result.get("preview", {}).get("rows", []),
                    "totalRows": result.get("processed_rows", 0)
                }
             }
        
        return response_data
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error processing dataset splitting: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing dataset splitting: {str(e)}")

@router.get("/preprocess/steps")
def get_preprocessing_steps():
    """Get all preprocessing steps from database"""
    try:
        from database import get_db_context
        from models import PreprocessingStep, Dataset
        
        with get_db_context() as db:
            steps = db.query(PreprocessingStep).all()
            result = []
            
            for step in steps:
                # Get dataset info
                dataset = db.query(Dataset).filter(Dataset.id == step.dataset_id).first()
                
                step_data = {
                    "id": step.id,
                    "dataset_id": step.dataset_id,
                    "dataset_name": dataset.name if dataset else "Unknown",
                    "step_type": step.step_type,
                    "step_name": step.step_name,
                    "config": step.config,
                    "output_path": step.output_path,
                    "status": step.status,
                    "created_at": step.created_at.isoformat() if step.created_at else None
                }
                result.append(step_data)
            
            return {
                "steps": result,
                "total": len(result)
            }
    except Exception as e:
        import traceback
        print(f"Error retrieving preprocessing steps: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving preprocessing steps: {str(e)}")

@router.get("/preprocess/steps/{dataset_id}")
def get_preprocessing_steps_for_dataset(dataset_id: str):
    """Get preprocessing steps for a specific dataset"""
    try:
        from database import get_db_context
        from models import PreprocessingStep
        
        with get_db_context() as db:
            steps = db.query(PreprocessingStep).filter(PreprocessingStep.dataset_id == dataset_id).all()
            result = []
            
            for step in steps:
                step_data = {
                    "id": step.id,
                    "dataset_id": step.dataset_id,
                    "step_type": step.step_type,
                    "step_name": step.step_name,
                    "config": step.config,
                    "output_path": step.output_path,
                    "status": step.status,
                    "created_at": step.created_at.isoformat() if step.created_at else None
                }
                result.append(step_data)
            
            return {
                "dataset_id": dataset_id,
                "steps": result,
                "total": len(result)
            }
    except Exception as e:
        import traceback
        print(f"Error retrieving preprocessing steps for dataset {dataset_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving preprocessing steps: {str(e)}")
