"""
Example database models for the ML Platform
You can extend these models based on your requirements.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from database import Base


class Dataset(Base):
    """Model for storing dataset metadata"""
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    size = Column(Integer)  # File size in bytes
    row_count = Column(Integer)
    column_count = Column(Integer)
    extra_metadata = Column(JSON)  # Store additional metadata as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Dataset(id={self.id}, name='{self.name}')>"


class TrainingJob(Base):
    """Model for storing training job information"""
    __tablename__ = "training_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(100), unique=True, nullable=False, index=True)
    dataset_id = Column(String(100), nullable=False, index=True)
    model_type = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    config = Column(JSON)  # Store model configuration
    metrics = Column(JSON)  # Store training metrics
    model_path = Column(String(500))  # Path to saved model file
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<TrainingJob(job_id='{self.job_id}', status='{self.status}')>"


class PreprocessingStep(Base):
    """Model for storing preprocessing step information"""
    __tablename__ = "preprocessing_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(String(100), nullable=False, index=True)
    step_type = Column(String(100), nullable=False)  # missing_values, scaling, encoding, etc.
    step_name = Column(String(255), nullable=False)
    config = Column(JSON)  # Store preprocessing configuration
    output_path = Column(String(500))  # Path to processed dataset
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<PreprocessingStep(dataset_id='{self.dataset_id}', step_type='{self.step_type}')>"


class DatasetValidation(Base):
    """Model for storing dataset validation results"""
    __tablename__ = "dataset_validations"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(String(100), nullable=False, index=True)
    target_column = Column(String(255), nullable=True)
    validation_result = Column(JSON, nullable=False)  # Store full validation report
    validation_status = Column(String(50), default="completed")  # completed, failed, pending
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<DatasetValidation(dataset_id='{self.dataset_id}', status='{self.validation_status}')>"
