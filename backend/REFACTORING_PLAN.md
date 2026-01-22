# Backend Main.py Refactoring Plan

## Structure
```
backend/
├── main.py (simplified - ~200 lines)
└── routes/
    ├── __init__.py
    ├── dependencies.py (Redis, constants)
    ├── utils.py (helper functions)
    ├── health.py (health check endpoints)
    ├── datasets.py (all dataset endpoints)
    ├── preprocessing.py (all preprocessing endpoints)
    ├── training.py (training endpoints)
    ├── model_selection.py (model selection)
    ├── websocket.py (websocket endpoint)
    └── preprocessing_imports.py (preprocessing module imports)
```

## Files to Create:
1. ✅ routes/dependencies.py - Redis client, UPLOAD_DIR, MODELS_DIR
2. ✅ routes/utils.py - get_dataset_stats, resolve_dataset_path, create_error_response
3. ✅ routes/health.py - root, health_check
4. ✅ routes/preprocessing_imports.py - All preprocessing module imports
5. ⏳ routes/datasets.py - All dataset endpoints
6. ⏳ routes/preprocessing.py - All preprocessing endpoints
7. ⏳ routes/training.py - Training endpoints
8. ⏳ routes/model_selection.py - Model selection
9. ⏳ routes/websocket.py - WebSocket endpoint
10. ⏳ Update main.py to import and register all routes
