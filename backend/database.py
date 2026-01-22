"""
Database connection and session management for Neon PostgreSQL
"""
import os
from sqlalchemy import create_engine, pool, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
from config import Config

# Create database engine with connection pooling
engine = create_engine(
    Config.DATABASE_URL,
    poolclass=pool.QueuePool,
    pool_size=Config.DB_POOL_SIZE,
    max_overflow=Config.DB_MAX_OVERFLOW,
    pool_timeout=Config.DB_POOL_TIMEOUT,
    pool_recycle=Config.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # Verify connections before using them
    echo=False,  # Set to True for SQL query logging
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
    }
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Use this in FastAPI route dependencies.
    
    Example:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Use this for manual session management.
    
    Example:
        with get_db_context() as db:
            item = db.query(Item).first()
            db.commit()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Call this to create all tables defined in your models.
    """
    # Import models to ensure they are registered with Base
    from models import Dataset, TrainingJob, PreprocessingStep, DatasetValidation
    
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully")


def check_db_connection() -> bool:
    """
    Check if database connection is working.
    Returns True if connection is successful, False otherwise.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


if __name__ == "__main__":
    # Test database connection
    print("Testing database connection...")
    if check_db_connection():
        print("Database connection successful!")
        # Initialize tables
        print("Initializing database tables...")
        init_db()
    else:
        print("Database connection failed!")
