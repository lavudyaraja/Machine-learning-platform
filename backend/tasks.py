import json
import os
import time
import joblib
import redis
from redis.exceptions import ConnectionError as RedisConnectionError, TimeoutError as RedisTimeoutError
import pandas as pd
import psutil
import logging
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.metrics import (
    accuracy_score, classification_report, 
    mean_squared_error, r2_score, mean_absolute_error
)

from celery_app import celery_app
from config import Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s: %(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Export celery_app
app = celery_app

# Redis connection pool for better performance with error handling
redis_pool = None
redis_client = None

def get_redis_client():
    """Get or create Redis client with connection retry"""
    global redis_pool, redis_client
    
    if redis_client is not None:
        try:
            # Test connection
            redis_client.ping()
            return redis_client
        except (RedisConnectionError, RedisTimeoutError, Exception) as e:
            logger.warning(f"Redis connection lost, reconnecting: {e}")
            redis_pool = None
            redis_client = None
    
    # Create new connection
    try:
        redis_pool = redis.ConnectionPool(
            host=Config.REDIS_HOST,
            port=Config.REDIS_PORT,
            db=Config.REDIS_DB,
            decode_responses=True,
            max_connections=50,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        redis_client = redis.Redis(connection_pool=redis_pool)
        
        # Test connection
        redis_client.ping()
        logger.info(f"✅ Redis connected: {Config.REDIS_HOST}:{Config.REDIS_PORT}")
        return redis_client
    except (RedisConnectionError, RedisTimeoutError) as e:
        logger.error(f"❌ Redis connection failed: {e}")
        logger.error(f"   Make sure Redis is running on {Config.REDIS_HOST}:{Config.REDIS_PORT}")
        raise
    except Exception as e:
        logger.error(f"❌ Redis initialization error: {e}")
        raise

# Initialize Redis client on module import
try:
    redis_client = get_redis_client()
except Exception as e:
    logger.warning(f"Redis not available at startup: {e}")
    logger.warning("Redis operations will fail until connection is established")


def update_job_status(job_id: str, data: Dict[str, Any]) -> None:
    """Update job status in Redis with TTL"""
    try:
        client = get_redis_client()
        client.setex(
            f"job_status:{job_id}",
            3600,  # Expire after 1 hour
            json.dumps(data)
        )
    except (RedisConnectionError, RedisTimeoutError) as e:
        logger.error(f"Redis connection error updating job {job_id}: {e}")
    except redis.RedisError as e:
        logger.error(f"Redis error updating job {job_id}: {e}")
    except Exception as e:
        logger.error(f"Error updating job status {job_id}: {e}")


def publish_update(job_id: str, data: Dict[str, Any]) -> None:
    """Publish real-time update to Redis pubsub"""
    try:
        client = get_redis_client()
        client.publish(
            f"job_{job_id}",
            json.dumps(data)
        )
    except (RedisConnectionError, RedisTimeoutError) as e:
        logger.error(f"Redis connection error publishing for {job_id}: {e}")
    except redis.RedisError as e:
        logger.error(f"Redis error publishing for {job_id}: {e}")
    except Exception as e:
        logger.error(f"Error publishing update for {job_id}: {e}")


def get_real_gpu_usage() -> float:
    """Get real GPU usage if available, otherwise return 0"""
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus and len(gpus) > 0:
            return round(gpus[0].load * 100, 2)
    except ImportError:
        pass
    except Exception as e:
        logger.debug(f"GPU monitoring unavailable: {e}")
    return 0.0


def get_resource_usage() -> Dict[str, float]:
    """Get real system resource usage"""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        ram_gb = memory.used / (1024 ** 3)
        gpu_percent = get_real_gpu_usage()
        
        return {
            "timestamp": int(time.time() * 1000),
            "cpu": round(cpu_percent, 2),
            "ram": round(ram_gb, 2),
            "gpu": round(gpu_percent, 2)
        }
    except Exception as e:
        logger.error(f"Error getting resource usage: {e}")
        return {
            "timestamp": int(time.time() * 1000),
            "cpu": 0.0,
            "ram": 0.0,
            "gpu": 0.0
        }


def check_cancellation(self, job_id: str) -> bool:
    """Check if task is cancelled via Redis or Celery"""
    try:
        # Check Redis cancellation flag
        try:
            client = get_redis_client()
            if client.get(f"job_cancel:{job_id}") == "true":
                return True
        except (RedisConnectionError, RedisTimeoutError):
            # If Redis is not available, continue with Celery check
            pass
        
        # Check Celery revocation
        is_aborted = getattr(self.request, 'is_aborted', False) or getattr(self.request, 'revoked', False)
        return is_aborted
    except Exception as e:
        logger.error(f"Error checking cancellation for {job_id}: {e}")
        return False


def handle_pause(self, job_id: str) -> bool:
    """Handle pause/resume logic. Returns True if cancelled."""
    try:
        try:
            client = get_redis_client()
            pause_flag = client.get(f"job_pause:{job_id}")
        except (RedisConnectionError, RedisTimeoutError):
            # If Redis is not available, don't pause
            return False
        
        if pause_flag != "true":
            return False
        
        # Notify pause
        update_job_status(job_id, {
            "job_id": job_id,
            "status": "paused",
            "message": "Training paused"
        })
        publish_update(job_id, {
            "type": "status",
            "status": "paused",
            "message": "Training paused. Click Resume to continue."
        })
        
        # Wait for resume or cancel
        while True:
            try:
                client = get_redis_client()
                if client.get(f"job_pause:{job_id}") != "true":
                    break
            except (RedisConnectionError, RedisTimeoutError):
                # If Redis connection lost during pause, continue training
                logger.warning(f"Redis connection lost during pause for {job_id}, resuming training")
                break
            
            if check_cancellation(self, job_id):
                return True
            time.sleep(0.3)
        
        # Notify resume
        update_job_status(job_id, {
            "job_id": job_id,
            "status": "running",
            "message": "Training resumed"
        })
        publish_update(job_id, {
            "type": "status",
            "status": "running",
            "message": "Training resumed"
        })
        
        return False
    except Exception as e:
        logger.error(f"Error handling pause for {job_id}: {e}")
        return False


def create_model(task_type: str, model_config: Dict[str, Any]):
    """Factory to create ML model based on config"""
    model_type = model_config.get("model_type", "random_forest").lower()
    
    # Common params
    max_depth = model_config.get("max_depth")
    random_state = model_config.get("random_state", 42)
    
    if task_type == "classification":
        if model_type in ["knn", "k_nearest_neighbors"]:
            return KNeighborsClassifier(
                n_neighbors=model_config.get("n_neighbors", 5),
                weights=model_config.get("weights", "uniform"),
                algorithm=model_config.get("algorithm", "auto"),
                metric=model_config.get("metric", "minkowski"),
                p=model_config.get("p", 2),
                n_jobs=-1
            )
        elif model_type in ["decision_tree", "dt"]:
            return DecisionTreeClassifier(
                max_depth=max_depth,
                random_state=random_state,
                min_samples_split=model_config.get("min_samples_split", 2),
                min_samples_leaf=model_config.get("min_samples_leaf", 1)
            )
        elif model_type in ["svm", "support_vector_machine"]:
            return SVC(
                C=model_config.get("C", 1.0),
                kernel=model_config.get("kernel", "rbf"),
                random_state=random_state,
                probability=True,
                cache_size=500
            )
        else:  # random_forest
            return RandomForestClassifier(
                n_estimators=model_config.get("n_estimators", 100),
                max_depth=max_depth,
                random_state=random_state,
                n_jobs=-1,
                min_samples_split=model_config.get("min_samples_split", 2),
                min_samples_leaf=model_config.get("min_samples_leaf", 1),
                verbose=0
            )
    else:  # regression
        if model_type in ["knn", "k_nearest_neighbors"]:
            return KNeighborsRegressor(
                n_neighbors=model_config.get("n_neighbors", 5),
                weights=model_config.get("weights", "uniform"),
                algorithm=model_config.get("algorithm", "auto"),
                metric=model_config.get("metric", "minkowski"),
                p=model_config.get("p", 2),
                n_jobs=-1
            )
        elif model_type in ["decision_tree", "dt"]:
            return DecisionTreeRegressor(
                max_depth=max_depth,
                random_state=random_state,
                min_samples_split=model_config.get("min_samples_split", 2),
                min_samples_leaf=model_config.get("min_samples_leaf", 1)
            )
        elif model_type in ["svm", "support_vector_machine"]:
            return SVR(
                C=model_config.get("C", 1.0),
                kernel=model_config.get("kernel", "rbf"),
                cache_size=500
            )
        else:  # random_forest
            return RandomForestRegressor(
                n_estimators=model_config.get("n_estimators", 100),
                max_depth=max_depth,
                random_state=random_state,
                n_jobs=-1,
                min_samples_split=model_config.get("min_samples_split", 2),
                min_samples_leaf=model_config.get("min_samples_leaf", 1),
                verbose=0
            )


def get_model_display_name(model_type: str) -> str:
    """Get user-friendly model name"""
    model_names = {
        "knn": "K-Nearest Neighbors (KNN)",
        "k_nearest_neighbors": "K-Nearest Neighbors (KNN)",
        "random_forest": "Random Forest",
        "svm": "Support Vector Machine (SVM)",
        "support_vector_machine": "Support Vector Machine (SVM)",
        "decision_tree": "Decision Tree",
        "dt": "Decision Tree"
    }
    return model_names.get(model_type.lower(), model_type)


def calculate_epochs(dataset_size: int, user_epochs: Optional[int]) -> int:
    """Calculate epochs based on dataset size"""
    if user_epochs and user_epochs > 0:
        return user_epochs
    
    if dataset_size < 1000:
        return 50
    elif dataset_size < 10000:
        return 20
    else:
        return 10


@celery_app.task(bind=True, max_retries=3)
def train_model_task(self, dataset_path: str, model_config: Dict[str, Any], 
                     target_column: str, job_id: str, task_type: str) -> Dict[str, Any]:
    """
    Train ML model with real-time progress updates
    
    Args:
        dataset_path: Path to CSV dataset
        model_config: Model hyperparameters
        target_column: Target column name
        job_id: Unique job ID
        task_type: 'classification' or 'regression'
    
    Returns:
        Training results dictionary
    """
    start_time = time.time()
    training_history = []
    
    try:
        logger.info(f"[JOB {job_id}] Training started")
        logger.info(f"[JOB {job_id}] Dataset: {dataset_path}")
        logger.info(f"[JOB {job_id}] Model: {model_config.get('model_type', 'random_forest')}")
        logger.info(f"[JOB {job_id}] Task: {task_type}")
        
        # Initialize status
        update_job_status(job_id, {
            "job_id": job_id,
            "status": "running",
            "progress": 0,
            "message": "Training started"
        })
        
        publish_update(job_id, {
            "type": "status",
            "status": "running",
            "progress": 0,
            "message": "Training started - Loading dataset..."
        })
        
        # Load dataset
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")
        
        df = pd.read_csv(dataset_path)
        
        if df.empty:
            raise ValueError("Dataset is empty")
        
        if target_column not in df.columns:
            raise ValueError(
                f"Target column '{target_column}' not found. "
                f"Available: {list(df.columns)}"
            )
        
        # Handle missing values
        initial_rows = len(df)
        df = df.dropna()
        if len(df) < initial_rows:
            logger.warning(f"[JOB {job_id}] Dropped {initial_rows - len(df)} rows with missing values")
        
        publish_update(job_id, {
            "type": "progress",
            "progress": 10,
            "message": f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns"
        })
        
        # Prepare data
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Check for non-numeric features
        non_numeric = X.select_dtypes(exclude=['number']).columns.tolist()
        if non_numeric:
            raise ValueError(
                f"Non-numeric columns found: {non_numeric}. "
                "Please encode categorical variables."
            )
        
        # Split data with stratification for classification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=0.2, 
            random_state=42,
            stratify=y if task_type == "classification" else None
        )
        
        publish_update(job_id, {
            "type": "progress",
            "progress": 20,
            "message": f"Data split: Train={len(X_train)}, Test={len(X_test)}"
        })
        
        # Create model
        model = create_model(task_type, model_config)
        model_type = model_config.get("model_type", "random_forest")
        model_display_name = get_model_display_name(model_type)
        
        publish_update(job_id, {
            "type": "progress",
            "progress": 30,
            "message": f"Model initialized: {model_display_name} ({task_type})"
        })
        
        # Calculate epochs
        total_epochs = calculate_epochs(len(X_train), model_config.get("epochs"))
        logger.info(f"[JOB {job_id}] Training for {total_epochs} epochs")
        
        # Check cancellation before training
        if check_cancellation(self, job_id):
            raise Exception("Training cancelled by user")
        
        # Check pause before training
        if handle_pause(self, job_id):
            raise Exception("Training cancelled during pause")
        
        # Train model (sklearn trains in one go)
        logger.info(f"[JOB {job_id}] Starting model training...")
        model.fit(X_train, y_train)
        logger.info(f"[JOB {job_id}] Model training completed")
        
        # Check cancellation after training
        if check_cancellation(self, job_id):
            raise Exception("Training cancelled by user")
        
        # Simulate epoch-by-epoch progress for UX
        for epoch in range(total_epochs):
            # Check cancellation
            if check_cancellation(self, job_id):
                update_job_status(job_id, {
                    "job_id": job_id,
                    "status": "cancelled",
                    "message": "Training cancelled"
                })
                publish_update(job_id, {
                    "type": "error",
                    "error": "Cancelled",
                    "message": "Training cancelled by user"
                })
                return {"status": "cancelled", "job_id": job_id}
            
            # Check pause
            if handle_pause(self, job_id):
                raise Exception("Training cancelled during pause")
            
            # Calculate progress (30% to 80%)
            progress = 30 + int((epoch + 1) / total_epochs * 50)
            
            # Get predictions
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)
            
            # Calculate metrics
            elapsed_time = time.time() - start_time
            
            if task_type == "classification":
                train_acc = accuracy_score(y_train, y_pred_train)
                val_acc = accuracy_score(y_test, y_pred_test)
                
                metrics = {
                    "accuracy": float(val_acc),
                    "valAccuracy": float(val_acc),
                    "trainAccuracy": float(train_acc),
                    "loss": float(1.0 - val_acc),
                    "valLoss": float(1.0 - val_acc),
                    "trainLoss": float(1.0 - train_acc)
                }
                
                message = f"Epoch {epoch + 1}/{total_epochs} - Val Acc: {val_acc:.4f}, Loss: {1.0-val_acc:.4f}"
            else:
                train_mse = mean_squared_error(y_train, y_pred_train)
                val_mse = mean_squared_error(y_test, y_pred_test)
                val_mae = mean_absolute_error(y_test, y_pred_test)
                val_r2 = r2_score(y_test, y_pred_test)
                
                metrics = {
                    "mse": float(val_mse),
                    "mae": float(val_mae),
                    "r2_score": float(val_r2),
                    "loss": float(val_mse),
                    "valLoss": float(val_mse),
                    "trainLoss": float(train_mse)
                }
                
                message = f"Epoch {epoch + 1}/{total_epochs} - MSE: {val_mse:.4f}, R²: {val_r2:.4f}"
            
            # Store history
            history_entry = {
                "epoch": epoch + 1,
                "trainLoss": metrics.get("trainLoss", 0),
                "valLoss": metrics.get("valLoss", 0),
                "trainAccuracy": metrics.get("trainAccuracy"),
                "valAccuracy": metrics.get("valAccuracy"),
                "mse": metrics.get("mse"),
                "r2": metrics.get("r2_score")
            }
            training_history.append(history_entry)
            
            # Get real resource usage
            resource_usage = get_resource_usage()
            
            # Publish real-time update
            publish_update(job_id, {
                "type": "progress",
                "progress": progress,
                "epoch": epoch + 1,
                "total_epochs": total_epochs,
                "metrics": metrics,
                "resource_usage": resource_usage,
                "elapsed_time": elapsed_time,
                "message": message,
                "training_history": training_history
            })
            
            # Update job status
            update_job_status(job_id, {
                "job_id": job_id,
                "status": "running",
                "progress": progress,
                "epoch": epoch + 1,
                "total_epochs": total_epochs,
                "metrics": metrics,
                "elapsed_time": elapsed_time,
                "training_history": training_history
            })
            
            # Small delay for real-time updates (minimal)
            time.sleep(0.1)
        
        # Final evaluation
        y_pred = model.predict(X_test)
        training_time = time.time() - start_time
        
        if task_type == "classification":
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
            weighted_avg = report.get("weighted avg", {})
            
            result = {
                "status": "completed",
                "task_type": "classification",
                "accuracy": float(accuracy),
                "precision": weighted_avg.get("precision", 0),
                "recall": weighted_avg.get("recall", 0),
                "f1": weighted_avg.get("f1-score", 0),
                "classification_report": report,
                "training_time": round(training_time, 2),
                "training_history": training_history
            }
        else:
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            result = {
                "status": "completed",
                "task_type": "regression",
                "mse": float(mse),
                "mae": float(mae),
                "r2_score": float(r2),
                "training_time": round(training_time, 2),
                "training_history": training_history
            }
        
        # Save model
        os.makedirs("models", exist_ok=True)
        model_path = f"models/{job_id}_model.pkl"
        joblib.dump(model, model_path)
        
        result.update({
            "model_path": model_path,
            "completed_at": datetime.utcnow().isoformat(),
            "job_id": job_id
        })
        
        # Final status update
        update_job_status(job_id, result)
        
        publish_update(job_id, {
            "type": "complete",
            "progress": 100,
            "elapsed_time": training_time,
            "results": result,
            "message": f"Training completed in {training_time:.2f}s!"
        })
        
        logger.info(f"[JOB {job_id}] Completed in {training_time:.2f}s")
        
        return result
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"[JOB {job_id}] Failed: {error_msg}", exc_info=True)
        
        update_job_status(job_id, {
            "job_id": job_id,
            "status": "failed",
            "error": error_msg
        })
        
        publish_update(job_id, {
            "type": "error",
            "error": error_msg,
            "message": f"Training failed: {error_msg}"
        })
        
        raise