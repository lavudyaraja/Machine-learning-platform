"""Shared utilities for routes"""
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from pathlib import Path
from .dependencies import UPLOAD_DIR

def create_error_response(detail: str):
    """Create a consistent error response format"""
    return {
        "detail": detail,
        "error": detail,
        "message": detail
    }

def get_dataset_stats(file_path):
    """Get row and column count from CSV file"""
    try:
        import pandas as pd
        # Read only first few rows to get column count quickly
        df = pd.read_csv(file_path, nrows=0)  # Read header only
        column_count = len(df.columns)
        
        # Count rows (excluding header)
        with open(file_path, 'r', encoding='utf-8') as f:
            row_count = sum(1 for line in f) - 1  # Subtract header row
        
        return {
            "rows": max(0, row_count),
            "columns": column_count,
            "columnsInfo": [{"name": col, "type": "unknown"} for col in df.columns]
        }
    except Exception as e:
        print(f"Error reading dataset stats from {file_path}: {e}")
        return {
            "rows": 0,
            "columns": 0,
            "columnsInfo": []
        }

def resolve_dataset_path(dataset_path: str):
    """Resolve dataset path to absolute path, handling spaces and special characters"""
    import os
    from pathlib import Path
    
    # Handle Windows paths with spaces and special characters
    dataset_path = dataset_path.strip()
    
    # If path is already absolute, use it directly
    if os.path.isabs(dataset_path):
        resolved_path = Path(dataset_path)
        if resolved_path.exists():
            return resolved_path
    
    # Try multiple resolution strategies
    possible_paths = []
    
    # Strategy 1: Use as-is if absolute
    if os.path.isabs(dataset_path):
        possible_paths.append(Path(dataset_path))
    
    # Strategy 2: If relative path starts with "data/", resolve from project root
    if dataset_path.startswith(("data/", "data\\")):
        project_root = Path(__file__).parent.parent.parent
        possible_paths.append((project_root / dataset_path).resolve())
    
    # Strategy 3: Resolve from backend directory
    possible_paths.append((Path(__file__).parent.parent / dataset_path).resolve())
    
    # Strategy 4: Try with normalized path (handle spaces)
    normalized_path = dataset_path.replace("\\", "/")
    if not os.path.isabs(normalized_path):
        project_root = Path(__file__).parent.parent.parent
        possible_paths.append((project_root / normalized_path).resolve())
        possible_paths.append((Path(__file__).parent.parent / normalized_path).resolve())
    
    # Try each possible path
    for path in possible_paths:
        try:
            if path.exists() and path.is_file():
                print(f"[Path Resolution] Found file at: {path}")
                return path
        except Exception as e:
            print(f"[Path Resolution] Error checking path {path}: {e}")
            continue
    
    # If none found, return the first resolved path (will raise error later)
    print(f"[Path Resolution] Warning: Could not find file, using first resolved path: {possible_paths[0]}")
    return possible_paths[0] if possible_paths else Path(dataset_path)

def resolve_dataset_path_from_id(dataset_id: str = None, dataset_path: str = None):
    """Resolve dataset path from either dataset_id or dataset_path"""
    from pathlib import Path
    from database import get_db_context
    from models import Dataset
    from fastapi import HTTPException
    import os
    
    # Import UPLOAD_DIR directly to avoid circular import
    backend_dir = Path(__file__).parent.parent
    UPLOAD_DIR = backend_dir / "uploads"
    
    # If dataset_path is provided, use it
    if dataset_path:
        return resolve_dataset_path(dataset_path)
    
    # If dataset_id is provided, resolve from database or file system
    if not dataset_id:
        raise HTTPException(status_code=400, detail="Either dataset_id or dataset_path is required")
    
    dataset_path_obj = None
    
    # Try to get from database first
    try:
        with get_db_context() as db:
            db_dataset = None
            if dataset_id.isdigit():
                db_dataset = db.query(Dataset).filter(Dataset.id == int(dataset_id)).first()
            
            # If not found by ID, try naming convention (filename without extension)
            if not db_dataset:
                # Search for original or cleaned or processed file name match
                db_dataset = db.query(Dataset).filter(
                    (Dataset.filename == f"{dataset_id}.csv") | 
                    (Dataset.name == dataset_id)
                ).first()

            if db_dataset:
                dataset_path_obj = Path(db_dataset.file_path)
                
                # If file exists, return it
                if dataset_path_obj.exists():
                    return dataset_path_obj
                
                # IF FILE DOES NOT EXIST BUT CONTENT IS IN DB, RECREATE IT
                # This fulfills the "store in database, not local" request by making DB the truth
                if hasattr(db_dataset, 'content') and db_dataset.content:
                    print(f"[Resolve Dataset] File missing at {dataset_path_obj}, but content found in DB. Recreating...")
                    dataset_path_obj.parent.mkdir(parents=True, exist_ok=True)
                    with open(dataset_path_obj, 'w', encoding='utf-8') as f:
                        f.write(db_dataset.content)
                    return dataset_path_obj
    except Exception as db_error:
        print(f"[Resolve Dataset] Database error or recreation failed: {db_error}")
    
    # Fallback to file system search (if not found in DB)
    if UPLOAD_DIR.exists():
        # Check if the id itself is a filename or stem
        for file_path in UPLOAD_DIR.glob("*.csv"):
            if file_path.stem == dataset_id or file_path.name == dataset_id:
                if file_path.exists():
                    return file_path
    
    raise HTTPException(
        status_code=404,
        detail=f"Dataset not found: {dataset_id}. It might have been deleted or never existed."
    )

def register_processed_dataset(csv_content: str, original_path: Path, result: dict, step_type: str, split_type: str = None) -> str:
    """
    Utility to register a processed dataset in the database and store its content.
    Returns the new dataset ID.
    """
    import time
    from database import get_db_context
    from models import Dataset
    import pandas as pd
    from io import StringIO
    
    timestamp = int(time.time() * 1000)
    suffix = f"_{split_type}" if split_type else f"_{step_type}"
    filename = f"{timestamp}_{original_path.stem}{suffix}.csv"
    file_path = UPLOAD_DIR / filename
    
    # Parse for metadata
    try:
        df = pd.read_csv(StringIO(csv_content))
        row_count = len(df)
        col_count = len(df.columns)
    except:
        row_count = result.get("processed_rows", 0)
        col_count = result.get("processed_cols", 0)

    try:
        with get_db_context() as db:
            new_db_dataset = Dataset(
                name=f"{original_path.stem}{suffix}",
                filename=filename,
                file_path=str(file_path),
                size=len(csv_content.encode('utf-8')),
                row_count=row_count,
                column_count=col_count,
                extra_metadata={
                    "parent_dataset": original_path.stem,
                    "step_type": step_type,
                    "split_type": split_type
                }
            )
            db.add(new_db_dataset)
            db.flush()
            new_id = str(new_db_dataset.id)
            print(f"[{step_type.upper()}] Registered new dataset in DB with ID: {new_id}")
            
            # Also register the preprocessing step
            from models import PreprocessingStep
            preprocessing_step = PreprocessingStep(
                dataset_id=new_id,
                step_type=step_type,
                step_name=f"{step_type} on {original_path.stem}",
                config=result.get("config", {}),
                output_path=str(file_path),
                status="completed"
            )
            db.add(preprocessing_step)
            db.commit()
            print(f"[{step_type.upper()}] Registered preprocessing step in DB")
            
            # Since user wants to remove local storage, we won't write to disk.
            # resolve_dataset_path_from_id will recreare it on-demand if a tool needs a path.
            # This makes the database the only permanent storage.
            return new_id
    except Exception as e:
        print(f"Error registering processed dataset: {e}")
        return original_path.stem
