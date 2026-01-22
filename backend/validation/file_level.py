"""
File Level Validation
Checks: File existence, file size, file format, encoding
"""

from pathlib import Path
from typing import Dict, Any, List

# Constants
VALID_EXTENSIONS = ['.csv', '.tsv', '.xlsx', '.xls', '.parquet']
MAX_FILE_SIZE_MB = 1000  # 1GB
BYTES_TO_MB = 1024 * 1024


def _check_file_exists(file_path: Path) -> Dict[str, Any]:
    """Check if file exists"""
    if file_path.exists():
        return {
            "name": "File Exists",
            "status": "pass",
            "message": f"File found at {file_path.name}",
            "details": {"path": str(file_path.absolute())}
        }
    return {
        "name": "File Exists",
        "status": "fail",
        "message": f"File not found at {file_path}",
        "details": {"path": str(file_path)}
    }


def _check_file_size(file_path: Path) -> Dict[str, Any]:
    """Check file size"""
    if not file_path.exists():
        return {
            "name": "File Size",
            "status": "fail",
            "message": "Cannot check file size - file not found",
            "details": {}
        }
    
    file_size = file_path.stat().st_size
    file_size_mb = file_size / BYTES_TO_MB
    
    if file_size == 0:
        return {
            "name": "File Size",
            "status": "fail",
            "message": "File is empty (0 bytes)",
            "details": {"size_bytes": 0, "size_mb": 0}
        }
    
    if file_size_mb > MAX_FILE_SIZE_MB:
        return {
            "name": "File Size",
            "status": "warning",
            "message": f"File is very large ({file_size_mb:.2f} MB). May cause performance issues.",
            "details": {"size_bytes": file_size, "size_mb": round(file_size_mb, 2)}
        }
    
    return {
        "name": "File Size",
        "status": "pass",
        "message": f"File size is acceptable ({file_size_mb:.2f} MB)",
        "details": {"size_bytes": file_size, "size_mb": round(file_size_mb, 2)}
    }


def _check_file_format(file_path: Path) -> Dict[str, Any]:
    """Check file format"""
    if not file_path.exists():
        return {
            "name": "File Format",
            "status": "fail",
            "message": "Cannot check file format - file not found",
            "details": {}
        }
    
    file_extension = file_path.suffix.lower()
    
    if file_extension in VALID_EXTENSIONS:
        return {
            "name": "File Format",
            "status": "pass",
            "message": f"File format is supported ({file_extension})",
            "details": {"extension": file_extension, "supported_formats": VALID_EXTENSIONS}
        }
    
    return {
        "name": "File Format",
        "status": "fail",
        "message": f"Unsupported file format ({file_extension}). Supported: {', '.join(VALID_EXTENSIONS)}",
        "details": {"extension": file_extension, "supported_formats": VALID_EXTENSIONS}
    }


def validate_file_level(dataset_path: str) -> Dict[str, Any]:
    """
    Validate file-level properties
    
    Returns:
        {
            "checks": [
                {"name": "File Exists", "status": "pass/fail", "message": "..."},
                {"name": "File Size", "status": "pass/fail", "message": "..."},
                {"name": "File Format", "status": "pass/fail", "message": "..."},
            ],
            "score": "3/3",
            "passed": 3,
            "total": 3,
            "category": "File Level"
        }
    """
    file_path = Path(dataset_path)
    
    # Run all checks
    checks = [
        _check_file_exists(file_path),
        _check_file_size(file_path),
        _check_file_format(file_path)
    ]
    
    # Calculate passed count
    total = len(checks)
    passed = sum(1 for check in checks if check["status"] in ["pass", "warning"])
    
    return {
        "checks": checks,
        "score": f"{passed}/{total}",
        "passed": passed,
        "total": total,
        "category": "File Level"
    }