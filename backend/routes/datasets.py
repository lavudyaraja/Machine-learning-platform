"""Dataset-related endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from datetime import datetime
import shutil
from urllib.parse import unquote
from typing import Optional
from pydantic import BaseModel

from .dependencies import UPLOAD_DIR
from .utils import get_dataset_stats, resolve_dataset_path
from validation import validate_dataset
from validation.formatter import format_validation_report

router = APIRouter()

class ValidationRequest(BaseModel):
    dataset_path: str
    target_column: Optional[str] = None

class ValidationRequestWithId(BaseModel):
    targetColumn: Optional[str] = None
    dataset_path: Optional[str] = None
    validationLevel: Optional[str] = None

@router.get("/datasets")
def list_datasets():
    """List all uploaded datasets from database"""
    try:
        from database import get_db_context
        from models import Dataset
        
        datasets = []
        
        # Try to get from database first
        try:
            with get_db_context() as db:
                db_datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
                
                for db_dataset in db_datasets:
                    # Verify file still exists
                    file_path = Path(db_dataset.file_path)
                    if file_path.exists():
                        # Get updated stats if needed
                        stats = get_dataset_stats(file_path)
                        
                        dataset_info = {
                            "id": str(db_dataset.id),  # Use database ID
                            "name": db_dataset.name,
                            "filename": db_dataset.filename,
                            "dataset_path": db_dataset.file_path,
                            "size": db_dataset.size or file_path.stat().st_size,
                            "rows": db_dataset.row_count or stats["rows"],
                            "columns": db_dataset.column_count or stats["columns"],
                            "columnsInfo": stats.get("columnsInfo", []),
                            "createdAt": db_dataset.created_at.isoformat() if db_dataset.created_at else datetime.now().isoformat(),
                            "updatedAt": db_dataset.updated_at.isoformat() if db_dataset.updated_at else None,
                            "type": "tabular",
                            "status": "active"
                        }
                        datasets.append(dataset_info)
                    else:
                        # File doesn't exist, skip or mark as deleted
                        print(f"[List Datasets] File not found for dataset ID {db_dataset.id}: {db_dataset.file_path}")
        except Exception as db_error:
            print(f"[List Datasets] Database error, falling back to file system: {db_error}")
            # Fallback to file system scan if database fails
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    try:
                        stat = file_path.stat()
                        original_filename = file_path.name
                        if "_" in original_filename:
                            parts = original_filename.split("_", 1)
                            if len(parts) > 1 and parts[0].isdigit():
                                original_filename = parts[1]
                        
                        stats = get_dataset_stats(file_path)
                        
                        dataset_info = {
                            "id": file_path.stem,
                            "name": original_filename.replace(".csv", ""),
                            "filename": original_filename,
                            "dataset_path": str(file_path),
                            "size": stat.st_size,
                            "rows": stats["rows"],
                            "columns": stats["columns"],
                            "columnsInfo": stats.get("columnsInfo", []),
                            "createdAt": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            "updatedAt": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "type": "tabular",
                            "status": "active"
                        }
                        datasets.append(dataset_info)
                    except Exception as e:
                        print(f"Error reading file {file_path}: {e}")
                        continue
        
        return datasets
    except Exception as e:
        import traceback
        print(f"Error listing datasets: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error listing datasets: {str(e)}")

@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    """Get a specific dataset by ID from database"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import Dataset
        
        db_dataset = None
        dataset_file = None
        
        # Store dataset attributes that we'll need later
        db_dataset_attrs = None

        # Try to get from database first
        try:
            with get_db_context() as db:
                # Try numeric ID first
                if dataset_id.isdigit():
                    db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()

                # If not found, try to find by file stem
                if not db_dataset:
                    if UPLOAD_DIR.exists():
                        for file_path in UPLOAD_DIR.glob("*.csv"):
                            if file_path.stem == dataset_id:
                                dataset_file = file_path
                                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(file_path)).first()
                                break
                else:
                    dataset_file = Path(db_dataset.file_path)

                # Store attributes before leaving the context
                if db_dataset:
                    db_dataset_attrs = {
                        'id': db_dataset.id,
                        'name': db_dataset.name,
                        'filename': db_dataset.filename,
                        'file_path': db_dataset.file_path,
                        'size': db_dataset.size,
                        'row_count': db_dataset.row_count,
                        'column_count': db_dataset.column_count,
                        'created_at': db_dataset.created_at,
                        'updated_at': db_dataset.updated_at
                    }
        except Exception as db_error:
            print(f"[Get Dataset] Database error, using file system: {db_error}")
            # Fallback to file system
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    if file_path.stem == dataset_id:
                        dataset_file = file_path
                        break
        
        if not dataset_file:
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    if file_path.stem == dataset_id:
                        dataset_file = file_path
                        break
        
        if not dataset_file or not dataset_file.exists():
            raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")
        
        # Get stats
        stats = get_dataset_stats(dataset_file)
        stat = dataset_file.stat()
        
        # Use database data if available, otherwise use file system
        if db_dataset_attrs:
            original_filename = db_dataset_attrs['filename']
            return {
                "id": str(db_dataset_attrs['id']),
                "name": db_dataset_attrs['name'],
                "filename": original_filename,
                "dataset_path": db_dataset_attrs['file_path'],
                "size": db_dataset_attrs['size'] or stat.st_size,
                "rows": db_dataset_attrs['row_count'] or stats["rows"],
                "columns": db_dataset_attrs['column_count'] or stats["columns"],
                "columnsInfo": stats.get("columnsInfo", []),
                "createdAt": db_dataset_attrs['created_at'].isoformat() if db_dataset_attrs['created_at'] else datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "updatedAt": db_dataset_attrs['updated_at'].isoformat() if db_dataset_attrs['updated_at'] else None,
                "type": "tabular",
                "status": "active"
            }
        else:
            # Fallback to file system data
            original_filename = dataset_file.name
            if "_" in original_filename:
                parts = original_filename.split("_", 1)
                if len(parts) > 1 and parts[0].isdigit():
                    original_filename = parts[1]
            
            return {
                "id": dataset_file.stem,
                "name": original_filename.replace(".csv", ""),
                "filename": original_filename,
                "dataset_path": str(dataset_file),
                "size": stat.st_size,
                "rows": stats["rows"],
                "columns": stats["columns"],
                "columnsInfo": stats.get("columnsInfo", []),
                "createdAt": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "updatedAt": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "type": "tabular",
                "status": "active"
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting dataset: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting dataset: {str(e)}")

@router.put("/datasets/{dataset_id}")
def update_dataset(dataset_id: str, updates: dict):
    """Update dataset metadata"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import Dataset
        
        dataset_file = None
        db_dataset = None
        
        # Try to find in database first
        try:
            with get_db_context() as db:
                if dataset_id.isdigit():
                    db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
                
                if db_dataset:
                    dataset_file = Path(db_dataset.file_path)
                    
                    # Update database fields
                    if "name" in updates:
                        db_dataset.name = updates["name"]
                    db_dataset.updated_at = datetime.now()
                    
                    # Commit happens automatically
                    
                    stats = get_dataset_stats(dataset_file) if dataset_file.exists() else {"rows": 0, "columns": 0, "columnsInfo": []}
                    stat = dataset_file.stat() if dataset_file.exists() else None
                    
                    return {
                        "id": str(db_dataset.id),
                        "name": db_dataset.name,
                        "filename": db_dataset.filename,
                        "dataset_path": db_dataset.file_path,
                        "size": db_dataset.size or (stat.st_size if stat else 0),
                        "rows": db_dataset.row_count or stats["rows"],
                        "columns": db_dataset.column_count or stats["columns"],
                        "columnsInfo": stats.get("columnsInfo", []),
                        "createdAt": db_dataset.created_at.isoformat() if db_dataset.created_at else datetime.now().isoformat(),
                        "updatedAt": db_dataset.updated_at.isoformat(),
                        "type": updates.get("type", "tabular"),
                        "status": updates.get("status", "active")
                    }
        except Exception as db_error:
            print(f"[Update Dataset] Database error: {db_error}")
        
        # Fallback to file system
        if not dataset_file and UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.glob("*.csv"):
                if file_path.stem == dataset_id:
                    dataset_file = file_path
                    break
        
        if not dataset_file or not dataset_file.exists():
            raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")
        
        stat = dataset_file.stat()
        original_filename = dataset_file.name
        if "_" in original_filename:
            parts = original_filename.split("_", 1)
            if len(parts) > 1 and parts[0].isdigit():
                original_filename = parts[1]
        
        stats = get_dataset_stats(dataset_file)
        
        return {
            "id": dataset_file.stem,
            "name": updates.get("name", original_filename.replace(".csv", "")),
            "filename": original_filename,
            "dataset_path": str(dataset_file),
            "size": stat.st_size,
            "rows": stats["rows"],
            "columns": stats["columns"],
            "columnsInfo": stats.get("columnsInfo", []),
            "createdAt": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "type": updates.get("type", "tabular"),
            "status": updates.get("status", "active")
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating dataset: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error updating dataset: {str(e)}")

class DatasetDataUpdate(BaseModel):
    columns: list
    rows: list
    totalRows: Optional[int] = None

@router.put("/datasets/{dataset_id}/data")
def update_dataset_data(dataset_id: str, data_update: DatasetDataUpdate):
    """Update dataset data (columns and rows) - saves to CSV file"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import Dataset
        
        dataset_file = None
        db_dataset = None
        
        # Try to find dataset in database first
        try:
            with get_db_context() as db:
                # Try numeric ID first
                if dataset_id.isdigit():
                    db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
                
                # If not found, try to find by file stem
                if not db_dataset:
                    if UPLOAD_DIR.exists():
                        for file_path in UPLOAD_DIR.glob("*.csv"):
                            if file_path.stem == dataset_id:
                                dataset_file = file_path
                                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(file_path)).first()
                                break
                else:
                    dataset_file = Path(db_dataset.file_path)
        except Exception as db_error:
            print(f"[Update Dataset Data] Database error, using file system: {db_error}")
            # Fallback to file system
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    if file_path.stem == dataset_id:
                        dataset_file = file_path
                        break
        
        # If still not found, try file system search
        if not dataset_file and UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.glob("*.csv"):
                if file_path.stem == dataset_id:
                    dataset_file = file_path
                    break
        
        if not dataset_file or not dataset_file.exists():
            raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")
        
        # Save data to CSV file
        try:
            import pandas as pd
            import numpy as np
            
            # Create DataFrame from columns and rows
            df = pd.DataFrame(data_update.rows, columns=data_update.columns)
            
            # Replace NaN values with None for proper CSV handling
            df = df.replace({np.nan: None})
            
            # Save to file
            df.to_csv(dataset_file, index=False)
            
            # Update database metadata if dataset exists in database
            if db_dataset:
                try:
                    with get_db_context() as db:
                        # Merge the detached dataset object back into the session
                        db_dataset = db.merge(db_dataset)
                        db_dataset.row_count = data_update.totalRows or len(data_update.rows)
                        db_dataset.column_count = len(data_update.columns)
                        db_dataset.updated_at = datetime.now()
                        # Commit happens automatically in context manager
                        print(f"[Update Dataset Data] Updated database metadata for dataset {dataset_id}")
                except Exception as db_error:
                    print(f"[Update Dataset Data] Warning: Failed to update database: {db_error}")
            
            return {
                "success": True,
                "message": "Dataset data updated successfully",
                "id": dataset_id,
                "rows": data_update.totalRows or len(data_update.rows),
                "columns": len(data_update.columns)
            }
        except Exception as e:
            import traceback
            print(f"Error saving dataset data: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error saving dataset data: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating dataset data: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error updating dataset data: {str(e)}")

@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    """Delete a dataset from both file system and database"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import Dataset
        
        dataset_file = None
        db_dataset_id = None
        
        # Try to find in database first
        try:
            with get_db_context() as db:
                # Try to find by ID (if it's a numeric ID from database)
                if dataset_id.isdigit():
                    db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
                    if db_dataset:
                        db_dataset_id = db_dataset.id
                        dataset_file = Path(db_dataset.file_path)
                
                # If not found by ID, try to find by file stem
                if not db_dataset_id:
                    # Find the dataset file
                    if UPLOAD_DIR.exists():
                        for file_path in UPLOAD_DIR.glob("*.csv"):
                            if file_path.stem == dataset_id:
                                dataset_file = file_path
                                # Try to find in database by file_path
                                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(file_path)).first()
                                if db_dataset:
                                    db_dataset_id = db_dataset.id
                                break
        except Exception as db_error:
            print(f"[Delete] Database error, using file system only: {db_error}")
            # Fallback to file system only
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    if file_path.stem == dataset_id:
                        dataset_file = file_path
                        break
        
        # If still not found, try file system search
        if not dataset_file and UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.glob("*.csv"):
                if file_path.stem == dataset_id:
                    dataset_file = file_path
                    break
        
        if not dataset_file or (dataset_file and not dataset_file.exists()):
            raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")
        
        # Delete from database if exists
        if db_dataset_id:
            try:
                with get_db_context() as db:
                    db_dataset = db.query(Dataset).filter(Dataset.id == db_dataset_id).first()
                    if db_dataset:
                        db.delete(db_dataset)
                        print(f"[Delete] Dataset {dataset_id} removed from database")
            except Exception as db_error:
                print(f"[Delete] Warning: Failed to delete from database: {db_error}")
        
        # Delete the file
        try:
            dataset_file.unlink()
            return {"message": f"Dataset {dataset_id} deleted successfully", "id": dataset_id}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error deleting dataset: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error deleting dataset: {str(e)}")

@router.get("/datasets/{dataset_id}/preview")
def get_dataset_preview(dataset_id: str, page: int = 1, page_size: int = 10):
    """Get dataset preview with pagination"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import Dataset
        
        dataset_file = None
        db_dataset = None
        
        # Try to find dataset in database first
        try:
            with get_db_context() as db:
                # Try numeric ID first
                if dataset_id.isdigit():
                    db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
                
                # If not found, try to find by file stem
                if not db_dataset:
                    if UPLOAD_DIR.exists():
                        for file_path in UPLOAD_DIR.glob("*.csv"):
                            if file_path.stem == dataset_id:
                                dataset_file = file_path
                                db_dataset = db.query(Dataset).filter(Dataset.file_path == str(file_path)).first()
                                break
                else:
                    dataset_file = Path(db_dataset.file_path)
        except Exception as db_error:
            print(f"[Preview] Database error, using file system: {db_error}")
            # Fallback to file system
            if UPLOAD_DIR.exists():
                for file_path in UPLOAD_DIR.glob("*.csv"):
                    if file_path.stem == dataset_id:
                        dataset_file = file_path
                        break
        
        # If still not found, try file system search
        if not dataset_file and UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.glob("*.csv"):
                if file_path.stem == dataset_id:
                    dataset_file = file_path
                    break
        
        if not dataset_file or not dataset_file.exists():
            raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")
        
        try:
            import pandas as pd
            
            # Read CSV with pagination
            skip_rows = (page - 1) * page_size
            df = pd.read_csv(dataset_file, skiprows=range(1, skip_rows + 1) if skip_rows > 0 else None, nrows=page_size)
            
            # Get total rows
            with open(dataset_file, 'r', encoding='utf-8') as f:
                total_rows = sum(1 for line in f) - 1  # Subtract header
            
            # Convert DataFrame to list of lists
            rows = df.values.tolist()
            columns = df.columns.tolist()
            
            # Convert NaN values to None for JSON serialization
            import numpy as np
            rows = [[None if (isinstance(val, float) and np.isnan(val)) else val for val in row] for row in rows]
            
            total_pages = (total_rows + page_size - 1) // page_size if total_rows > 0 else 1
            
            return {
                "columns": columns,
                "rows": rows,
                "totalRows": total_rows,
                "page": page,
                "pageSize": page_size,
                "totalPages": total_pages
            }
        except Exception as e:
            import traceback
            print(f"Error reading dataset preview: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error reading dataset preview: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting dataset preview: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting dataset preview: {str(e)}")

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a dataset file and store metadata in database"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        filename = f"{int(datetime.now().timestamp()*1000)}_{file.filename}"
        file_path = UPLOAD_DIR / filename

        # Save file to disk
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Get file stats
        stat = file_path.stat()
        file_size = stat.st_size
        
        # Get dataset stats (rows, columns)
        stats = get_dataset_stats(file_path)
        
        # Store in database
        dataset_id = None
        try:
            from database import get_db_context
            from models import Dataset
            
            with get_db_context() as db:
                dataset = Dataset(
                    name=file.filename.replace(".csv", ""),
                    filename=file.filename,
                    file_path=str(file_path),
                    size=file_size,
                    row_count=stats["rows"],
                    column_count=stats["columns"],
                    extra_metadata={
                        "uploaded_at": datetime.now().isoformat(),
                        "original_filename": file.filename
                    }
                )
                db.add(dataset)
                db.flush()  # Flush to get the ID
                dataset_id = dataset.id
                
                print(f"[Upload] Dataset saved to database with ID: {dataset_id}")
        except Exception as db_error:
            # Log error but don't fail the upload
            print(f"[Upload] Warning: Failed to save to database: {db_error}")
            import traceback
            traceback.print_exc()

        return {
            "dataset_path": str(file_path),
            "filename": file.filename,
            "size": file_size,
            "rows": stats["rows"],
            "columns": stats["columns"],
            "id": str(dataset_id) if dataset_id else file_path.stem  # Return database ID if available
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[Upload] Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/validate/dataset")
async def validate_dataset_endpoint(req: ValidationRequest):
    """Run comprehensive dataset validation (legacy endpoint)"""
    try:
        if not Path(req.dataset_path).exists():
            raise HTTPException(status_code=404, detail=f"Dataset file not found: {req.dataset_path}")
        
        validation_result = validate_dataset(
            dataset_path=req.dataset_path,
            target_column=req.target_column
        )
        
        if "error" in validation_result:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        return validation_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating dataset: {str(e)}")

@router.post("/datasets/{dataset_id}/validate")
async def validate_dataset_by_id(dataset_id: str, req: ValidationRequestWithId):
    """Run comprehensive dataset validation by dataset ID - supports numerical, categorical, and mixed datasets"""
    try:
        dataset_id = unquote(dataset_id)
        print(f"[Validation] Received request for dataset_id={dataset_id}, path={req.dataset_path}")
        
        from database import get_db_context
        from models import Dataset, DatasetValidation
        
        dataset_path_obj = None
        db_dataset = None
        
        # Try to get dataset_path from database if not provided
        if not req.dataset_path:
            try:
                with get_db_context() as db:
                    # Try numeric ID first
                    if dataset_id.isdigit():
                        db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
                    
                    # If not found, try to find by file stem
                    if not db_dataset:
                        if UPLOAD_DIR.exists():
                            for file_path in UPLOAD_DIR.glob("*.csv"):
                                if file_path.stem == dataset_id:
                                    db_dataset = db.query(Dataset).filter(Dataset.file_path == str(file_path)).first()
                                    if db_dataset:
                                        break
                    
                    if db_dataset:
                        dataset_path_obj = Path(db_dataset.file_path)
                        print(f"[Validation] Found dataset in database: {db_dataset.file_path}")
            except Exception as db_error:
                print(f"[Validation] Database error: {db_error}")
        
        # If still no path, try to get from file system
        if not dataset_path_obj:
            if req.dataset_path:
                # Use provided path
                try:
                    dataset_path_obj = resolve_dataset_path(req.dataset_path)
                except Exception as e:
                    print(f"[Validation] Path resolution error: {e}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid dataset path: {req.dataset_path}. Error: {str(e)}"
                    )
            else:
                # Try to find by file stem
                if UPLOAD_DIR.exists():
                    for file_path in UPLOAD_DIR.glob("*.csv"):
                        if file_path.stem == dataset_id:
                            dataset_path_obj = file_path
                            break
        
        if not dataset_path_obj or not dataset_path_obj.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Dataset not found: {dataset_id}. Please provide dataset_path or ensure dataset exists."
            )
        
        print(f"[Validation] Using dataset path: {dataset_path_obj}")
        
        # Run validation (works with numerical, categorical, and mixed datasets)
        validation_result = validate_dataset(
            dataset_path=str(dataset_path_obj),
            target_column=req.targetColumn
        )
        
        # Check for errors
        if not isinstance(validation_result, dict):
            raise HTTPException(status_code=500, detail="Invalid validation result format")
        
        if "error" in validation_result:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        # Format report (formatter already cleans NaN values)
        formatted_report = format_validation_report(validation_result, dataset_id)
        print(f"[Validation] Validation completed successfully for dataset_id={dataset_id}")
        
        # Final safety check - ensure no NaN values remain
        import json
        try:
            # Try to serialize to JSON to catch any remaining NaN values
            json.dumps(formatted_report)
        except (ValueError, TypeError) as e:
            print(f"[Validation] Warning: JSON serialization issue, cleaning values: {e}")
            # Import the clean function from formatter
            from validation.formatter import clean_nan_values
            formatted_report = clean_nan_values(formatted_report)
        
        # Store validation result in database
        validation_id = None
        try:
            with get_db_context() as db:
                validation_record = DatasetValidation(
                    dataset_id=dataset_id,
                    target_column=req.targetColumn,
                    validation_result=formatted_report,
                    validation_status="completed"
                )
                db.add(validation_record)
                db.flush()
                validation_id = validation_record.id
                print(f"[Validation] Validation result saved to database with ID: {validation_id}")
        except Exception as db_error:
            # Log error but don't fail the validation
            print(f"[Validation] Warning: Failed to save validation to database: {db_error}")
            import traceback
            traceback.print_exc()
        
        return formatted_report
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error validating dataset: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error validating dataset: {str(e)}")

@router.get("/datasets/{dataset_id}/validations")
def get_dataset_validations(dataset_id: str):
    """Get validation history for a dataset"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import DatasetValidation
        
        try:
            with get_db_context() as db:
                validations = db.query(DatasetValidation).filter(
                    DatasetValidation.dataset_id == dataset_id
                ).order_by(DatasetValidation.created_at.desc()).all()
                
                return [
                    {
                        "id": val.id,
                        "dataset_id": val.dataset_id,
                        "target_column": val.target_column,
                        "validation_status": val.validation_status,
                        "created_at": val.created_at.isoformat() if val.created_at else None,
                        "summary": {
                            "total_columns": len(val.validation_result.get("columns", [])) if isinstance(val.validation_result, dict) else 0,
                            "total_rows": val.validation_result.get("dataset_info", {}).get("total_rows", 0) if isinstance(val.validation_result, dict) else 0,
                        } if isinstance(val.validation_result, dict) else {}
                    }
                    for val in validations
                ]
        except Exception as db_error:
            print(f"[Get Validations] Database error: {db_error}")
            return []
    except Exception as e:
        import traceback
        print(f"Error getting validations: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return []

@router.get("/datasets/{dataset_id}/validations/{validation_id}")
def get_validation_detail(dataset_id: str, validation_id: int):
    """Get detailed validation result by validation ID"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import DatasetValidation
        
        try:
            with get_db_context() as db:
                validation = db.query(DatasetValidation).filter(
                    DatasetValidation.id == validation_id,
                    DatasetValidation.dataset_id == dataset_id
                ).first()
                
                if not validation:
                    raise HTTPException(status_code=404, detail=f"Validation not found: {validation_id}")
                
                return {
                    "id": validation.id,
                    "dataset_id": validation.dataset_id,
                    "target_column": validation.target_column,
                    "validation_status": validation.validation_status,
                    "created_at": validation.created_at.isoformat() if validation.created_at else None,
                    "validation_result": validation.validation_result
                }
        except HTTPException:
            raise
        except Exception as db_error:
            print(f"[Get Validation Detail] Database error: {db_error}")
            raise HTTPException(status_code=500, detail=f"Error getting validation detail: {str(db_error)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting validation detail: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting validation detail: {str(e)}")

@router.get("/datasets/{dataset_id}/preprocessing")
def get_dataset_preprocessing_steps(dataset_id: str):
    """Get preprocessing history for a dataset"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import PreprocessingStep
        
        try:
            with get_db_context() as db:
                steps = db.query(PreprocessingStep).filter(
                    PreprocessingStep.dataset_id == dataset_id
                ).order_by(PreprocessingStep.created_at.desc()).all()
                
                return [
                    {
                        "id": step.id,
                        "dataset_id": step.dataset_id,
                        "step_type": step.step_type,
                        "step_name": step.step_name,
                        "config": step.config,
                        "output_path": step.output_path,
                        "status": step.status,
                        "created_at": step.created_at.isoformat() if step.created_at else None
                    }
                    for step in steps
                ]
        except Exception as db_error:
            print(f"[Get Preprocessing Steps] Database error: {db_error}")
            return []
    except Exception as e:
        import traceback
        print(f"Error getting preprocessing steps: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return []

@router.get("/datasets/{dataset_id}/preprocessing/{step_id}")
def get_preprocessing_step_detail(dataset_id: str, step_id: int):
    """Get detailed preprocessing step by step ID"""
    try:
        dataset_id = unquote(dataset_id)
        
        from database import get_db_context
        from models import PreprocessingStep
        
        try:
            with get_db_context() as db:
                step = db.query(PreprocessingStep).filter(
                    PreprocessingStep.id == step_id,
                    PreprocessingStep.dataset_id == dataset_id
                ).first()
                
                if not step:
                    raise HTTPException(status_code=404, detail=f"Preprocessing step not found: {step_id}")
                
                return {
                    "id": step.id,
                    "dataset_id": step.dataset_id,
                    "step_type": step.step_type,
                    "step_name": step.step_name,
                    "config": step.config,
                    "output_path": step.output_path,
                    "status": step.status,
                    "created_at": step.created_at.isoformat() if step.created_at else None
                }
        except HTTPException:
            raise
        except Exception as db_error:
            print(f"[Get Preprocessing Step Detail] Database error: {db_error}")
            raise HTTPException(status_code=500, detail=f"Error getting preprocessing step detail: {str(db_error)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting preprocessing step detail: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting preprocessing step detail: {str(e)}")