# 🤖 Machine Learning Framework Setup

A comprehensive full-stack machine learning framework built with Next.js 16, TypeScript, and FastAPI. This project provides a complete ML pipeline with data preprocessing, model training, evaluation, and deployment capabilities.

## 🚀 Features

### 📊 Data Management
- **Dataset Upload & Management**: Upload CSV, JSON, TXT files with validation
- **Data Preprocessing**: Complete pipeline with 7 preprocessing steps
- **Data Validation**: Automated data quality checks and validation
- **Preview & Exploration**: Interactive data preview with pagination

### 🔧 Preprocessing Pipeline
1. **Missing Values Handling**: Multiple imputation strategies (mean, median, mode, constant, etc.)
2. **Data Cleaning**: Remove duplicates and handle outliers
3. **Categorical Encoding**: Convert categories to numeric values (One-Hot, Label Encoding)
4. **Feature Scaling**: Normalize and standardize numerical features
5. **Feature Selection**: Select most relevant features using various algorithms
6. **Feature Extraction**: Apply dimensionality reduction (PCA, LDA)
7. **Dataset Splitting**: Create train/test/validation splits

### 🎯 Model Selection & Training
- **Multiple Algorithms**: Support for various ML algorithms
- **Hyperparameter Tuning**: Automated hyperparameter optimization
- **Cross-Validation**: K-fold cross-validation support
- **Model Comparison**: Compare multiple models side-by-side

### 📈 Evaluation & Deployment
- **Performance Metrics**: Comprehensive evaluation metrics
- **ROC/AUC Analysis**: ROC curves and AUC scores
- **Model Deployment**: Deploy trained models for predictions
- **Real-time Inference**: API endpoints for model predictions

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations
- **Sonner** for toast notifications

### Backend
- **FastAPI** (Python) for REST API
- **Pandas** for data manipulation
- **Scikit-learn** for ML algorithms
- **NumPy** for numerical operations
- **Joblib** for model serialization

### UI Components
- **Shadcn/ui** component library
- **Custom components** for ML-specific workflows
- **Responsive design** with mobile support

## 📁 Project Structure

```
framework-setup/
├── 📂 src/
│   ├── 📂 app/                          # Next.js App Router
│   │   ├── 📂 api/                      # API Routes
│   │   │   ├── 📂 datasets/             # Dataset management APIs
│   │   │   │   ├── route.ts             # GET/POST datasets
│   │   │   │   ├── 📂 [id]/             # Individual dataset operations
│   │   │   │   │   ├── route.ts         # GET/PUT/DELETE dataset
│   │   │   │   │   ├── data.ts          # Dataset data endpoint
│   │   │   │   │   ├── download.ts      # Download dataset
│   │   │   │   │   ├── preview.ts       # Dataset preview
│   │   │   │   │   ├── validate.ts      # Validate dataset
│   │   │   │   │   └── 📂 preprocessing/ # Preprocessing steps
│   │   │   │   ├── upload.ts            # File upload endpoint
│   │   │   │   └── 📂 [id]/             # Dataset-specific routes
│   │   │   ├── 📂 model-selection/      # Model selection API
│   │   │   ├── 📂 preprocessing/        # Preprocessing APIs
│   │   │   │   ├── categorical-encoding.ts
│   │   │   │   ├── data-cleaning.ts
│   │   │   │   ├── dataset-splitting.ts
│   │   │   │   ├── feature-extraction.ts
│   │   │   │   ├── feature-scaling.ts
│   │   │   │   ├── feature-selection.ts
│   │   │   │   └── missing-values.ts
│   │   │   ├── 📂 training/             # Model training APIs
│   │   │   │   ├── route.ts
│   │   │   │   └── 📂 [jobId]/          # Training job management
│   │   │   └── upload.ts                # File upload
│   │   ├── 📂 datasets/                 # Dataset pages
│   │   │   ├── page.tsx                 # Dataset listing
│   │   │   └── 📂 [id]/                 # Individual dataset
│   │   │       ├── page.tsx             # Dataset details
│   │   │       ├── 📂 preprocessing/    # Preprocessing workflow
│   │   │       │   └── page.tsx         # Preprocessing interface
│   │   │       ├── deploy.tsx           # Model deployment
│   │   │       ├── deployment.tsx       # Deployment management
│   │   │       ├── evaluation.tsx       # Model evaluation
│   │   │       └── roc-auc.tsx          # ROC analysis
│   │   ├── 📂 notei/                    # Notes/Documentation
│   │   ├── 📂 validate/                 # Data validation
│   │   │   └── page.tsx
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   └── favicon.ico
│   ├── 📂 components/                   # React components
│   │   ├── 📂 common/                   # Shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Navigation.tsx
│   │   ├── 📂 dataset/                  # Dataset components
│   │   │   ├── DatasetCard.tsx
│   │   │   ├── DatasetList.tsx
│   │   │   ├── DatasetUpload.tsx        # Upload component
│   │   │   └── DatasetPreview.tsx
│   │   ├── 📂 model-selection/          # Model selection UI
│   │   │   ├── ModelComparison.tsx
│   │   │   ├── ModelConfig.tsx
│   │   │   └── ModelResults.tsx
│   │   └── 📂 preprocessing/            # Preprocessing components
│   │       ├── PreprocessingLayout.tsx  # Main layout
│   │       ├── StepNavigation.tsx       # Step navigation
│   │       ├── 📂 missing-value-handling/
│   │       │   ├── MissingValueHandler.tsx
│   │       │   ├── 📂 components/
│   │       │   │   ├── SelectColumnsTab.tsx
│   │       │   │   ├── ConfigureTab.tsx
│   │       │   │   └── ResultsTab.tsx
│   │       │   ├── types.ts
│   │       │   └── constants.ts
│   │       ├── 📂 data-cleaning/
│   │       ├── 📂 categorical-encoding/
│   │       ├── 📂 feature-scaling/
│   │       ├── 📂 feature-selection/
│   │       ├── 📂 feature-extraction/
│   │       └── 📂 dataset-splitting/
│   ├── 📂 config/                       # Configuration files
│   │   ├── algorithms.ts                # ML algorithm configs
│   │   ├── api.config.ts                # API endpoints
│   │   └── preprocessing.ts             # Preprocessing configs
│   ├── 📂 hooks/                        # Custom React hooks
│   │   ├── useDataset.ts                # Dataset management
│   │   ├── useDatasetDetail.ts          # Dataset details
│   │   ├── useModelSelection.ts         # Model selection
│   │   ├── usePreprocessing.ts          # Preprocessing state
│   │   └── usePreprocessingStateRestoration.ts
│   ├── 📂 lib/                          # Utility libraries
│   │   ├── api.ts                       # API client
│   │   ├── utils.ts                     # General utilities
│   │   ├── formatters.ts                # Data formatting
│   │   └── validations.ts               # Form validations
│   ├── 📂 types/                        # TypeScript type definitions
│   │   ├── dataset.ts                   # Dataset types
│   │   ├── model.ts                     # Model types
│   │   ├── preprocessing.ts             # Preprocessing types
│   │   └── api.ts                       # API response types
│   └── 📂 utils/                        # Utility functions
│       ├── clearCache.ts                # Cache management
│       ├── datasetDebug.ts              # Dataset debugging
│       ├── datasetValidation.ts         # Dataset validation
│       └── datasetUtils.ts              # Dataset utilities
├── 📂 backend/                          # Python backend
│   ├── 📂 Model Selection/              # Model selection algorithms
│   │   ├── __init__.py
│   │   ├── knn.py
│   │   ├── model_selection_main.py
│   │   └── 📂 algorithms/
│   ├── 📂 preprocessing/                # Preprocessing modules
│   │   ├── 📂 Apply dimensionality reduction/
│   │   ├── 📂 Categorical Encoding/
│   │   ├── 📂 Data Cleaning/
│   │   └── 📂 other preprocessing steps/
│   ├── 📂 routes/                       # FastAPI routes
│   │   ├── __init__.py
│   │   ├── datasets.py                  # Dataset endpoints
│   │   ├── dependencies.py              # Dependencies
│   │   └── other route files...
│   ├── 📂 validation/                   # Data validation
│   │   ├── __init__.py
│   │   ├── class_distribution.py
│   │   ├── consistency.py
│   │   └── other validation modules...
│   ├── main.py                          # FastAPI application entry
│   ├── requirements.txt                 # Python dependencies
│   └── README.md                        # Backend documentation
├── 📂 public/                           # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── vercel.svg
├── 📄 .gitignore                        # Git ignore file
├── 📄 README.md                         # This file
├── 📄 backend.md                        # Backend setup guide
├── 📄 package.json                      # Node.js dependencies
├── 📄 package-lock.json                 # Locked dependencies
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 next.config.ts                    # Next.js configuration
├── 📄 tailwind.config.js                # Tailwind CSS config
├── 📄 components.json                   # Shadcn/ui config
├── 📄 eslint.config.mjs                 # ESLint configuration
├── 📄 postcss.config.mjs                # PostCSS configuration
└── 📄 openapi.json                      # API documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **Python** 3.8 or higher
- **pip** (Python package manager)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd framework-setup
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # FastAPI Backend URL
   FASTAPI_URL=http://localhost:8000
   NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
   
   # Optional: Database configuration (if using database)
   # DATABASE_URL=postgresql://user:password@localhost:5432/ml_framework
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python main.py
   ```
   The backend will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The API documentation is available at `http://localhost:8000/docs`

## 📖 Usage Guide

### 1. Dataset Upload and Management

1. **Navigate to Datasets Page**
   - Click on "Datasets" in the navigation
   - Click "New Dataset" to upload a file

2. **Supported File Formats**
   - CSV files (.csv)
   - JSON files (.json)
   - Text files (.txt)
   - Maximum file size: 100MB

3. **Upload Process**
   - Drag and drop or click to browse
   - Select your file
   - Click "Execute Upload"
   - Wait for processing to complete

### 2. Data Preprocessing

1. **Select a Dataset**
   - Click on any dataset from the list
   - Click "Preprocess" to start the pipeline

2. **Preprocessing Steps**
   - **Step 1: Missing Values** - Handle missing data with various strategies
   - **Step 2: Data Cleaning** - Remove duplicates and outliers
   - **Step 3: Categorical Encoding** - Convert categorical variables
   - **Step 4: Feature Scaling** - Normalize numerical features
   - **Step 5: Feature Selection** - Select important features
   - **Step 6: Feature Extraction** - Reduce dimensionality
   - **Step 7: Dataset Splitting** - Create train/test splits

3. **Navigation**
   - Use "Previous" and "Next" buttons to navigate between steps
   - Progress is automatically saved
   - You can exit and return later to continue

### 3. Model Training

1. **After Preprocessing**
   - Navigate to the "Train" section
   - Select algorithms to compare
   - Configure hyperparameters

2. **Training Process**
   - Click "Start Training"
   - Monitor progress in real-time
   - View results and comparisons

### 4. Model Evaluation

1. **Performance Metrics**
   - Accuracy, Precision, Recall, F1-Score
   - ROC curves and AUC scores
   - Confusion matrices
   - Feature importance

2. **Model Comparison**
   - Side-by-side comparison of multiple models
   - Statistical significance tests
   - Best model recommendation

## 🔧 Configuration

### Frontend Configuration

**API Configuration** (`src/config/api.config.ts`):
```typescript
export const API_ENDPOINTS = {
  datasets: buildApiUrl("/datasets"),
  upload: buildApiUrl("/upload"),
  preprocessing: {
    missingValues: buildApiUrl("/preprocess/missing-values"),
    // ... other endpoints
  }
};
```

**Algorithm Configuration** (`src/config/algorithms.ts`):
```typescript
export const ALGORITHMS = {
  classification: [
    { id: 'random_forest', name: 'Random Forest' },
    { id: 'svm', name: 'Support Vector Machine' },
    // ... more algorithms
  ]
};
```

### Backend Configuration

**FastAPI Settings** (`backend/main.py`):
```python
app = FastAPI(
    title="ML Framework API",
    description="Machine Learning Framework Backend",
    version="1.0.0"
)
```

**Model Settings** (`backend/config.py`):
```python
MODEL_CONFIG = {
    'max_file_size': 100 * 1024 * 1024,  # 100MB
    'supported_formats': ['.csv', '.json', '.txt'],
    'default_test_size': 0.2,
}
```

## 🧪 Testing

### Frontend Tests
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Backend Tests
```bash
# Run Python tests
cd backend
python -m pytest

# Run with coverage
python -m pytest --cov=.
```

## 📦 Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Set `NEXT_PUBLIC_FASTAPI_URL` in Vercel dashboard
   - Point to your deployed backend URL

### Backend Deployment (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   COPY . .
   EXPOSE 8000
   
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and Run**
   ```bash
   docker build -t ml-framework-backend .
   docker run -p 8000:8000 ml-framework-backend
   ```

## 🔗 API Documentation

### Main Endpoints

#### Dataset Management
- `GET /api/datasets` - List all datasets
- `POST /api/datasets` - Upload new dataset
- `GET /api/datasets/{id}` - Get dataset details
- `PUT /api/datasets/{id}` - Update dataset
- `DELETE /api/datasets/{id}` - Delete dataset

#### Preprocessing
- `POST /api/preprocess/missing-values` - Handle missing values
- `POST /api/preprocess/data-cleaning` - Clean data
- `POST /api/preprocess/categorical-encoding` - Encode categories
- `POST /api/preprocess/feature-scaling` - Scale features
- `POST /api/preprocess/feature-selection` - Select features
- `POST /api/preprocess/feature-extraction` - Extract features
- `POST /api/preprocess/dataset-splitting` - Split dataset

#### Model Training
- `POST /api/model-selection` - Select and compare models
- `POST /api/training` - Train models
- `GET /api/training/{jobId}` - Get training status
- `POST /api/training/{jobId}/pause` - Pause training
- `POST /api/training/{jobId}/resume` - Resume training

### Interactive Documentation
Visit `http://localhost:8000/docs` for interactive API documentation with Swagger UI.

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   ```
   Error: Failed to connect to backend server
   ```
   **Solution**: Ensure FastAPI server is running on port 8000

2. **File Upload Fails**
   ```
   Error: File size exceeds limit
   ```
   **Solution**: Check file size is under 100MB

3. **Preprocessing State Issues**
   ```
   Error: Dataset not found
   ```
   **Solution**: Click "Force Clear Cache" button in preprocessing page

4. **TypeScript Build Errors**
   ```bash
   npm run build
   ```
   **Solution**: Check for type errors in console and fix imports

### Debug Tools

1. **Dataset Debug Button**
   - Click "Debug Datasets" in preprocessing header
   - Shows available datasets and current dataset ID

2. **Cache Clearing**
   - Click "Force Clear Cache" to reset all state
   - Clears localStorage and sessionStorage

3. **Console Logs**
   - Open browser dev tools (F12)
   - Check console for detailed error messages

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Use for code formatting
- **Components**: Use functional components with hooks
- **API**: Follow RESTful conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Excellent React framework
- **FastAPI Team** - Modern Python web framework
- **Scikit-learn** - Machine learning library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful component library

## 📞 Support

For support and questions:

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 📖 Documentation: [Full docs](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/example/issues)

---

**Built with ❤️ by the ML Framework Team**#   M a c h i n e - l e a r n i n g - p l a t f o r m  
 