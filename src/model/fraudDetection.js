import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

class FraudDetectionModel {
    constructor() {
        this.model = null;
        this.vectorizer = null;
        this.isLoaded = false;
    }

    async loadModel() {
        try {
            // Load the pre-trained model and vectorizer data
            const [modelResponse, vectorizerResponse] = await Promise.all([
                fetch('/model/model.json'),
                fetch('/model/vectorizer.json')
            ]);
            
            const modelData = await modelResponse.json();
            const vectorizerData = await vectorizerResponse.json();
            
            // Initialize the model with the loaded data
            this.model = {
                trees: modelData.trees,
                featureImportance: modelData.feature_importance
            };
            
            // Initialize the vectorizer
            this.vectorizer = {
                vocabulary: new Set(vectorizerData.vocabulary),
                idf: new Map(Object.entries(vectorizerData.idf))
            };

            this.isLoaded = true;
            console.log('Pre-trained model loaded successfully');
        } catch (error) {
            console.error('Error loading pre-trained model:', error);
            this.isLoaded = false;
        }
    }

    cleanText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        // Remove special characters and convert to lowercase
        return text.replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase().trim();
    }

    vectorizeText(text) {
        const cleanedText = this.cleanText(text);
        const words = cleanedText.split(/\s+/);
        
        // Create TF-IDF vector
        const vector = new Float32Array(this.vectorizer.vocabulary.size).fill(0);
        
        // Calculate term frequencies
        const termFreq = new Map();
        for (const word of words) {
            termFreq.set(word, (termFreq.get(word) || 0) + 1);
        }
        
        // Apply TF-IDF
        for (const [word, freq] of termFreq) {
            if (this.vectorizer.vocabulary.has(word)) {
                const index = Array.from(this.vectorizer.vocabulary).indexOf(word);
                const tf = freq / words.length;
                const idf = this.vectorizer.idf.get(word);
                vector[index] = tf * idf;
            }
        }
        
        return vector;
    }

    predict(inputText) {
        if (!this.isLoaded) {
            console.warn('Model not loaded');
            return {
                isFraudulent: false,
                confidence: 0.5,
                status: 'Model not loaded'
            };
        }

        try {
            // Vectorize the input text
            const vector = this.vectorizeText(inputText);
            
            // Make prediction using the Random Forest model
            let positiveVotes = 0;
            for (const tree of this.model.trees) {
                const prediction = this.predictWithTree(vector, tree);
                if (prediction === 1) positiveVotes++;
            }
            
            const confidence = positiveVotes / this.model.trees.length;
            const isFraudulent = confidence > 0.5;
            
            return {
                isFraudulent,
                confidence,
                status: isFraudulent ? 'Vulnerable (Fraudulent)' : 'Secure'
            };
        } catch (error) {
            console.error('Error making prediction:', error);
            throw error;
        }
    }

    predictWithTree(vector, tree) {
        let node = tree;
        while (node.children) {
            const featureValue = vector[node.feature];
            if (featureValue <= node.threshold) {
                node = node.children[0];
            } else {
                node = node.children[1];
            }
        }
        return node.value;
    }

    async analyzeTransaction(transaction) {
        try {
            // Combine relevant transaction data for analysis
            const analysisText = `
                ${transaction.amount || ''} 
                ${transaction.recipient || ''} 
                ${transaction.type || ''} 
                ${transaction.timestamp || ''}
            `;

            const prediction = this.predict(analysisText);

            return {
                ...prediction,
                transactionId: transaction.hash,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error analyzing transaction:', error);
            throw error;
        }
    }
}

export const fraudDetectionModel = new FraudDetectionModel(); 