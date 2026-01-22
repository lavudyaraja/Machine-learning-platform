from celery import Celery
from celery.signals import worker_ready, worker_shutdown
from config import Config
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create Celery instance
celery_app = Celery(
    "ml_tasks",
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)

# Celery Configuration
celery_app.conf.update(
    # Task tracking and events
    task_track_started=True,
    task_send_sent_event=True,
    worker_send_task_events=True,
    
    # Result backend
    result_expires=3600,  # Results expire after 1 hour
    result_backend_transport_options={
        'visibility_timeout': 3600,
        'retry_policy': {
            'timeout': 5.0
        }
    },
    result_persistent=True,
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Task discovery and imports
    include=['tasks'],
    imports=['tasks'],
    
    # Task execution settings
    task_always_eager=False,  # Never execute tasks synchronously
    task_eager_propagates=False,
    task_ignore_result=False,
    task_store_errors_even_if_ignored=True,
    
    # Worker configuration
    worker_prefetch_multiplier=1,  # Fetch one task at a time
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks
    worker_disable_rate_limits=False,
    worker_pool='prefork',  # Use prefork pool for CPU-bound tasks
    
    # Task acknowledgment
    task_acks_late=True,  # Acknowledge after task completion
    task_reject_on_worker_lost=True,  # Requeue if worker crashes
    
    # Serialization (JSON only for security)
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    
    # Time limits
    task_soft_time_limit=3600,  # Soft limit: 1 hour
    task_time_limit=3900,  # Hard limit: 1 hour 5 minutes
    
    # Broker configuration
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    broker_pool_limit=10,
    broker_heartbeat=30,
    broker_heartbeat_checkrate=2,
    
    # Result backend retry
    result_backend_always_retry=True,
    result_backend_max_retries=10,
    
    # Logging
    worker_hijack_root_logger=False,
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s',
    
    # Task routing (optional)
    task_routes={
        'tasks.train_model_task': {'queue': 'ml_training'},
    },
    
    # Task default queue
    task_default_queue='ml_training',
    task_default_exchange='ml_tasks',
    task_default_routing_key='ml_training',
    
    # Beat schedule (if using Celery Beat for periodic tasks)
    beat_schedule={},
    
    # Performance tuning
    task_compression='gzip',  # Compress large task payloads
    result_compression='gzip',  # Compress results
    
    # Error handling
    task_soft_time_limit_on_startup=True,
    task_publish_retry=True,
    task_publish_retry_policy={
        'max_retries': 3,
        'interval_start': 0,
        'interval_step': 0.2,
        'interval_max': 0.5,
    },
)


@worker_ready.connect
def on_worker_ready(**kwargs):
    """Called when worker is ready"""
    logger.info("=" * 60)
    logger.info("Celery Worker Started Successfully")
    logger.info("=" * 60)
    logger.info(f"Broker: {Config.CELERY_BROKER_URL}")
    logger.info(f"Backend: {Config.CELERY_RESULT_BACKEND}")
    logger.info("Worker is ready to accept tasks")
    logger.info("=" * 60)


@worker_shutdown.connect
def on_worker_shutdown(**kwargs):
    """Called when worker is shutting down"""
    logger.info("=" * 60)
    logger.info("Celery Worker Shutting Down")
    logger.info("=" * 60)


# Import tasks to register them
try:
    from tasks import train_model_task
    logger.info(f"Successfully registered tasks: {list(celery_app.tasks.keys())}")
except ImportError as e:
    logger.error(f"Failed to import tasks: {e}")
except Exception as e:
    logger.error(f"Error during task registration: {e}")