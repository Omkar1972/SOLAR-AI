const express = require('express');
const router = express.Router();

// Get solar predictions
router.get('/solar', async (req, res) => {
    try {
        const { location, days = 7 } = req.query;
        
        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Location is required'
            });
        }

        // Mock prediction data
        const predictions = [];
        const today = new Date();
        
        for (let i = 0; i < parseInt(days); i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            predictions.push({
                date: date.toISOString().split('T')[0],
                solarIrradiance: Math.round(400 + Math.random() * 600),
                temperature: Math.round(20 + Math.random() * 15),
                humidity: Math.round(40 + Math.random() * 40),
                windSpeed: Math.round(5 + Math.random() * 15),
                cloudCover: Math.round(Math.random() * 100),
                expectedOutput: Math.round(3 + Math.random() * 4)
            });
        }

        res.json({
            success: true,
            data: {
                location,
                predictions,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Prediction Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error generating predictions'
        });
    }
});

// Get historical predictions
router.get('/historical', async (req, res) => {
    try {
        const { location, startDate, endDate } = req.query;
        
        if (!location || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Location, startDate, and endDate are required'
            });
        }

        // Mock historical data
        const historicalData = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            historicalData.push({
                date: d.toISOString().split('T')[0],
                actualOutput: Math.round(2 + Math.random() * 5),
                predictedOutput: Math.round(2.5 + Math.random() * 4.5),
                accuracy: Math.round(85 + Math.random() * 15)
            });
        }

        res.json({
            success: true,
            data: {
                location,
                historicalData,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Historical Prediction Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching historical predictions'
        });
    }
});

// Get AI model performance
router.get('/performance', async (req, res) => {
    try {
        const performanceData = {
            overallAccuracy: 92.5,
            mape: 7.3,
            rmse: 0.8,
            lastUpdated: new Date().toISOString(),
            modelVersion: 'v1.2.0',
            trainingDataPoints: 15000,
            validationScore: 0.91
        };

        res.json({
            success: true,
            data: performanceData
        });

    } catch (error) {
        console.error('Performance Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching model performance'
        });
    }
});

module.exports = router;


