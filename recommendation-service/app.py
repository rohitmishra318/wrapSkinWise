from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from scipy.sparse import hstack, csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

def get_recommendations(target_property_id, properties_df):
    # --- 1. Data Preprocessing ---
    properties_df = properties_df.copy()
    properties_df['description'] = properties_df['description'].fillna('')
    properties_df['title'] = properties_df['title'].fillna('')
    
    # --- 2. Text Feature Engineering ---
    text_features = properties_df['title'] + ' ' + properties_df['description']
    vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
    text_matrix = vectorizer.fit_transform(text_features)
    
    # --- 3. Numerical Feature Engineering ---
    numerical_cols = ['price', 'bedrooms', 'bathrooms']
    for col in numerical_cols:
        if col not in properties_df.columns:
            properties_df[col] = 0
        properties_df[col] = properties_df[col].fillna(0)
    scaler = MinMaxScaler()
    numerical_matrix = scaler.fit_transform(properties_df[numerical_cols])
    numerical_matrix = csr_matrix(numerical_matrix)
    
    # --- 4. Feature Engineering: Categorical Features ---
    if 'type' in properties_df.columns:
        properties_df['type'] = properties_df['type'].fillna('Unknown')
        encoder = OneHotEncoder(handle_unknown='ignore')
        categorical_matrix = encoder.fit_transform(properties_df[['type']])
    else:
        categorical_matrix = csr_matrix((len(properties_df), 0))

    # --- 5. Combine All Features ---
    combined_features = hstack([
        text_matrix,
        numerical_matrix,
        categorical_matrix
    ]).tocsr()
    
    # --- 6. Calculate Similarity ---
    target_idx = properties_df.index[properties_df['_id'] == target_property_id].tolist()
    if not target_idx:
        return []
    target_idx = target_idx[0]
    similarities = cosine_similarity(combined_features[target_idx], combined_features).flatten()
    
    properties_df['similarity'] = similarities
    recommendations = properties_df[properties_df['_id'] != target_property_id]
    recommendations = recommendations.sort_values(by='similarity', ascending=False)
    
    # Return top 5 recommended property IDs
    return recommendations.head(5)['_id'].tolist()

@app.route('/recommend', methods=['POST'])
def recommend():
    print("Received request for recommendations")
    data = request.get_json()
    
    # --- THIS IS THE FIX ---
    # Change 'property_id' to 'target_id' to match what the Node.js server is sending
    target_property_id = data.get('target_id')
    properties_list = data.get('properties', [])

    if not properties_list or not target_property_id:
        return jsonify({"error": "Missing 'properties' list or 'target_id'"}), 400

    properties_df = pd.DataFrame(properties_list)
    recos = get_recommendations(target_property_id, properties_df)
    print("Recommendations:", recos)
    return jsonify({"recommended_ids": recos})

if __name__ == '__main__':
    app.run(debug=True, port=5001)