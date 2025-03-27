import joblib
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import os

def tree_to_dict(tree, feature_names):
    """Convert a decision tree to a dictionary format."""
    def _tree_to_dict(node_id):
        node = tree.tree_
        if node.children_left[node_id] == -1:  # Leaf node
            return {
                'value': node.value[node_id][0][0]
            }
        return {
            'feature': feature_names[node.feature[node_id]],
            'threshold': node.threshold[node_id],
            'children': [
                _tree_to_dict(node.children_left[node_id]),
                _tree_to_dict(node.children_right[node_id])
            ]
        }
    
    return _tree_to_dict(0)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Define paths to the dataset files
secure_path = "C:/Users/BCCC-VolSCs-2023_Secure.csv"
vulnerable_path = "C:/Users/BCCC-VolSCs-2023_Vulnerable.csv"

print(f"Looking for files in:")
print(f"Secure dataset path: {secure_path}")
print(f"Vulnerable dataset path: {vulnerable_path}")

try:
    # Check if files exist
    if not os.path.exists(secure_path):
        raise FileNotFoundError(f"Secure dataset not found at: {secure_path}")
    if not os.path.exists(vulnerable_path):
        raise FileNotFoundError(f"Vulnerable dataset not found at: {vulnerable_path}")
    
    # Load the datasets
    print("Loading secure dataset...")
    secure_df = pd.read_csv(secure_path)
    print("Loading vulnerable dataset...")
    vulnerable_df = pd.read_csv(vulnerable_path)
    
    # Print column names to help identify the correct column
    print("\nColumns in secure dataset:")
    print(secure_df.columns.tolist())
    print("\nColumns in vulnerable dataset:")
    print(vulnerable_df.columns.tolist())
    
    # Add labels
    secure_df['label'] = 0  # 0 for secure
    vulnerable_df['label'] = 1  # 1 for vulnerable
    
    # Combine datasets
    df = pd.concat([secure_df, vulnerable_df], ignore_index=True)
    
    # Try to find the code column (it might be named differently)
    possible_code_columns = ['code', 'source_code', 'contract_code', 'solidity_code', 'text']
    code_column = None
    
    for col in possible_code_columns:
        if col in df.columns:
            code_column = col
            break
    
    if code_column is None:
        raise ValueError("Could not find the code column. Available columns are: " + ", ".join(df.columns))
    
    print(f"\nUsing column '{code_column}' for code analysis")
    
    # Prepare features and labels
    X = df[code_column]
    y = df['label']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and fit the vectorizer
    vectorizer = TfidfVectorizer(max_features=1000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Create and train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_vec, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Convert the model to a dictionary format
    model_dict = {
        'trees': [tree_to_dict(tree, vectorizer.get_feature_names_out()) for tree in model.estimators_],
        'feature_importance': model.feature_importances_.tolist()
    }
    
    # Convert the vectorizer to a dictionary format
    vectorizer_dict = {
        'vocabulary': list(vectorizer.vocabulary_.keys()),
        'idf': vectorizer.idf_.tolist()
    }
    
    # Create public/model directory if it doesn't exist
    model_dir = os.path.join(current_dir, 'public', 'model')
    os.makedirs(model_dir, exist_ok=True)
    
    # Save to JSON files
    model_path = os.path.join(model_dir, 'model.json')
    vectorizer_path = os.path.join(model_dir, 'vectorizer.json')
    
    print(f"\nSaving model to: {model_path}")
    with open(model_path, 'w') as f:
        json.dump(model_dict, f)
    
    print(f"Saving vectorizer to: {vectorizer_path}")
    with open(vectorizer_path, 'w') as f:
        json.dump(vectorizer_dict, f)
    
    print("\nModel and vectorizer exported successfully!")

except FileNotFoundError as e:
    print(f"\nError: {str(e)}")
    print("\nPlease make sure your dataset files are in the correct location:")
    print("1. C:/Users/BCCC-VolSCs-2023_Secure.csv")
    print("2. C:/Users/BCCC-VolSCs-2023_Vulnerable.csv")
except Exception as e:
    print(f"\nAn error occurred: {str(e)}") 