"""Import all preprocessing modules"""
import importlib.util
from pathlib import Path

# Import missing values handler (handling space in folder name)
missing_values_path = Path(__file__).parent.parent / "preprocessing" / "Missing Values" / "missing_values.py"
spec = importlib.util.spec_from_file_location("missing_values", missing_values_path)
missing_values_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(missing_values_module)
handle_missing_values = missing_values_module.handle_missing_values

# Import data cleaning main module
data_cleaning_main_path = Path(__file__).parent.parent / "preprocessing" / "Data Cleaning" / "data_cleaning_main.py"
spec_data_cleaning = importlib.util.spec_from_file_location("data_cleaning_main", data_cleaning_main_path)
data_cleaning_module = importlib.util.module_from_spec(spec_data_cleaning)
spec_data_cleaning.loader.exec_module(data_cleaning_module)
process_data_cleaning = data_cleaning_module.process_data_cleaning

# Import categorical encoding module
categorical_encoding_path = Path(__file__).parent.parent / "preprocessing" / "Categorical Encoding" / "categorical_encoding.py"
spec_categorical = importlib.util.spec_from_file_location("categorical_encoding", categorical_encoding_path)
categorical_module = importlib.util.module_from_spec(spec_categorical)
spec_categorical.loader.exec_module(categorical_module)
process_categorical_encoding = categorical_module.process_categorical_encoding

# Import feature scaling module
feature_scaling_path = Path(__file__).parent.parent / "preprocessing" / "Feature Scaling" / "feature_scaling.py"
spec_feature_scaling = importlib.util.spec_from_file_location("feature_scaling", feature_scaling_path)
feature_scaling_module = importlib.util.module_from_spec(spec_feature_scaling)
spec_feature_scaling.loader.exec_module(feature_scaling_module)
process_feature_scaling = feature_scaling_module.process_feature_scaling

# Import feature selection module
feature_selection_path = Path(__file__).parent.parent / "preprocessing" / "Feature Selection" / "feature_selection_main.py"
spec_feature_selection = importlib.util.spec_from_file_location("feature_selection_main", feature_selection_path)
feature_selection_module = importlib.util.module_from_spec(spec_feature_selection)
spec_feature_selection.loader.exec_module(feature_selection_module)
process_feature_selection = feature_selection_module.process_feature_selection

# Import feature extraction module
feature_extraction_path = Path(__file__).parent.parent / "preprocessing" / "Feature Extraction" / "feature_extraction_main.py"
spec_feature_extraction = importlib.util.spec_from_file_location("feature_extraction_main", feature_extraction_path)
feature_extraction_module = importlib.util.module_from_spec(spec_feature_extraction)
spec_feature_extraction.loader.exec_module(feature_extraction_module)
process_feature_extraction = feature_extraction_module.process_feature_extraction

# Import dataset splitting module
dataset_splitting_path = Path(__file__).parent.parent / "preprocessing" / "Dataset Splitting" / "dataset_splitting_main.py"
spec_dataset_splitting = importlib.util.spec_from_file_location("dataset_splitting_main", dataset_splitting_path)
dataset_splitting_module = importlib.util.module_from_spec(spec_dataset_splitting)
spec_dataset_splitting.loader.exec_module(dataset_splitting_module)
process_dataset_splitting = dataset_splitting_module.process_dataset_splitting

# Import model selection module
model_selection_path = Path(__file__).parent.parent / "Model Selection" / "model_selection_main.py"
spec_model_selection = importlib.util.spec_from_file_location("model_selection_main", model_selection_path)
model_selection_module = importlib.util.module_from_spec(spec_model_selection)
spec_model_selection.loader.exec_module(model_selection_module)
process_model_selection = model_selection_module.process_model_selection
