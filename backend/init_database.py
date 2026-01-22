"""
Script to initialize the database tables
Run this script to create all database tables in Neon PostgreSQL
"""
from database import check_db_connection, init_db

if __name__ == "__main__":
    print("=" * 50)
    print("Database Initialization Script")
    print("=" * 50)
    
    # Check connection first
    print("\n1. Checking database connection...")
    if not check_db_connection():
        print("ERROR: Cannot connect to database. Please check your DATABASE_URL in .env file")
        exit(1)
    
    print("   Connection successful!")
    
    # Initialize tables
    print("\n2. Creating database tables...")
    try:
        init_db()
        print("   Tables created successfully!")
        
        print("\n" + "=" * 50)
        print("Database initialization completed!")
        print("=" * 50)
        print("\nCreated tables:")
        print("  - datasets")
        print("  - training_jobs")
        print("  - preprocessing_steps")
        print("  - dataset_validations")
        
    except Exception as e:
        print(f"ERROR: Failed to create tables: {e}")
        exit(1)
