import { fraudDetectionModel } from '../model/fraudDetection';

class FraudDetectionService {
    constructor() {
        this.model = fraudDetectionModel;
        this.initialize();
    }

    async initialize() {
        try {
            await this.model.loadModel();
            console.log('Fraud detection service initialized');
        } catch (error) {
            console.error('Failed to initialize fraud detection service:', error);
        }
    }

    async analyzeTransaction(transaction) {
        try {
            const analysis = await this.model.analyzeTransaction(transaction);
            return {
                ...analysis,
                recommendations: this.generateRecommendations(analysis)
            };
        } catch (error) {
            console.error('Error analyzing transaction:', error);
            throw error;
        }
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.isFraudulent) {
            recommendations.push({
                type: 'warning',
                message: 'This transaction shows signs of potential fraud. Please review carefully.',
                action: 'Review transaction details and recipient information'
            });
        }

        if (analysis.confidence > 0.8) {
            recommendations.push({
                type: 'high_risk',
                message: 'High confidence of fraudulent activity detected.',
                action: 'Consider blocking this transaction'
            });
        }

        if (analysis.confidence < 0.3) {
            recommendations.push({
                type: 'low_risk',
                message: 'Transaction appears to be secure.',
                action: 'Proceed with normal processing'
            });
        }

        return recommendations;
    }

    async analyzeContractCode(code) {
        try {
            const analysis = await this.model.predict(code);
            return {
                ...analysis,
                recommendations: this.generateContractRecommendations(analysis)
            };
        } catch (error) {
            console.error('Error analyzing contract code:', error);
            throw error;
        }
    }

    generateContractRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.isFraudulent) {
            recommendations.push({
                type: 'warning',
                message: 'This contract contains potentially vulnerable code.',
                action: 'Review contract security measures'
            });
        }

        if (analysis.confidence > 0.8) {
            recommendations.push({
                type: 'high_risk',
                message: 'High confidence of contract vulnerability detected.',
                action: 'Consider additional security audits'
            });
        }

        return recommendations;
    }
}

export const fraudDetectionService = new FraudDetectionService(); 