const express = require('express');
const router = express.Router();
const { validateSolarRequest } = require('../middleware/validation');

// AI-powered solar prediction algorithm
router.post('/predict', validateSolarRequest, async (req, res) => {
    try {
        const {
            location,
            weatherData,
            panelCapacity,
            panelEfficiency,
            tiltAngle,
            azimuth
        } = req.body;

        // Validate input parameters
        if (!weatherData || !panelCapacity || !panelEfficiency) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Calculate solar predictions using AI algorithms
        const predictions = calculateSolarPredictions({
            weatherData,
            panelCapacity: parseFloat(panelCapacity),
            panelEfficiency: parseFloat(panelEfficiency),
            tiltAngle: parseFloat(tiltAngle) || 30,
            azimuth: parseFloat(azimuth) || 180
        });

        res.json({
            success: true,
            data: {
                location,
                predictions,
                timestamp: new Date().toISOString(),
                algorithm: 'AI-Enhanced Solar Prediction v1.0'
            }
        });

    } catch (error) {
        console.error('Solar Prediction Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error calculating solar predictions'
        });
    }
});

// Calculate solar requirements for appliances
router.post('/calculator-requirements', async (req, res) => {
    try {
        const { location, dailyConsumption, appliances } = req.body;

        if (!location || !dailyConsumption || !appliances) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Calculate solar requirements based on location and consumption
        const requirements = calculateSolarRequirements(location, dailyConsumption, appliances);

        res.json({
            success: true,
            data: requirements
        });

    } catch (error) {
        console.error('Solar Calculator Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error calculating solar requirements'
        });
    }
});

// Calculate solar requirements
function calculateSolarRequirements(location, dailyConsumption, appliances) {
    // Maharashtra solar potential data
    const locationData = {
        'Mumbai': { peakSunHours: 5.2, efficiency: 0.75, costPerWatt: 50 },
        'Pune': { peakSunHours: 5.5, efficiency: 0.78, costPerWatt: 48 },
        'Nagpur': { peakSunHours: 5.8, efficiency: 0.82, costPerWatt: 45 },
        'Nashik': { peakSunHours: 5.3, efficiency: 0.76, costPerWatt: 49 },
        'Aurangabad': { peakSunHours: 5.4, efficiency: 0.79, costPerWatt: 47 },
        'Solapur': { peakSunHours: 5.9, efficiency: 0.84, costPerWatt: 44 },
        'Kolhapur': { peakSunHours: 5.1, efficiency: 0.73, costPerWatt: 51 },
        'Amravati': { peakSunHours: 5.6, efficiency: 0.80, costPerWatt: 46 }
    };

    const data = locationData[location] || locationData['Mumbai'];
    
    // Calculate required solar capacity
    const requiredCapacity = dailyConsumption / (data.peakSunHours * data.efficiency);
    const panelCapacity = 400; // W per panel
    const numberOfPanels = Math.ceil(requiredCapacity * 1000 / panelCapacity);
    const actualCapacity = (numberOfPanels * panelCapacity) / 1000; // kW

    // Calculate financial metrics
    const totalCost = numberOfPanels * panelCapacity * data.costPerWatt;
    const dailySavings = dailyConsumption * 8; // 8 INR per kWh
    const paybackPeriod = totalCost / (dailySavings * 365);

    // Calculate appliance breakdown
    const applianceBreakdown = appliances.map(appliance => ({
        name: appliance.name,
        wattage: appliance.wattage,
        quantity: appliance.quantity,
        dailyConsumption: appliance.dailyConsumption,
        percentage: ((appliance.wattage * appliance.quantity) / (appliances.reduce((sum, a) => sum + (a.wattage * a.quantity), 0))) * 100
    }));

    return {
        location: location,
        dailyConsumption: dailyConsumption,
        requiredCapacity: requiredCapacity,
        numberOfPanels: numberOfPanels,
        panelCapacity: panelCapacity,
        actualCapacity: actualCapacity,
        peakSunHours: data.peakSunHours,
        efficiency: data.efficiency,
        estimatedGeneration: actualCapacity * data.peakSunHours * data.efficiency,
        costEstimate: totalCost,
        dailySavings: dailySavings,
        paybackPeriod: paybackPeriod,
        applianceBreakdown: applianceBreakdown
    };
}

// Get solar potential for Maharashtra cities
router.get('/maharashtra-potential', (req, res) => {
    const maharashtraPotential = {
        'Mumbai': {
            annualIrradiance: '5.8 kWh/m²/day',
            peakSunHours: '5.2 hours/day',
            monsoonImpact: '35% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Excellent'
        },
        'Pune': {
            annualIrradiance: '6.1 kWh/m²/day',
            peakSunHours: '5.5 hours/day',
            monsoonImpact: '30% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Excellent'
        },
        'Nagpur': {
            annualIrradiance: '6.3 kWh/m²/day',
            peakSunHours: '5.8 hours/day',
            monsoonImpact: '25% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Outstanding'
        },
        'Nashik': {
            annualIrradiance: '5.9 kWh/m²/day',
            peakSunHours: '5.3 hours/day',
            monsoonImpact: '32% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Excellent'
        },
        'Aurangabad': {
            annualIrradiance: '6.0 kWh/m²/day',
            peakSunHours: '5.4 hours/day',
            monsoonImpact: '28% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Excellent'
        },
        'Solapur': {
            annualIrradiance: '6.4 kWh/m²/day',
            peakSunHours: '5.9 hours/day',
            monsoonImpact: '22% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Outstanding'
        },
        'Kolhapur': {
            annualIrradiance: '5.7 kWh/m²/day',
            peakSunHours: '5.1 hours/day',
            monsoonImpact: '38% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Very Good'
        },
        'Amravati': {
            annualIrradiance: '6.2 kWh/m²/day',
            peakSunHours: '5.6 hours/day',
            monsoonImpact: '27% reduction',
            bestSeason: 'Oct-May',
            solarClass: 'Excellent'
        }
    };

    res.json({
        success: true,
        data: maharashtraPotential
    });
});

// Get optimal panel configuration for location
router.get('/optimal-config/:location', (req, res) => {
    const { location } = req.params;
    
    // Maharashtra-specific optimal configurations
    const optimalConfigs = {
        'Mumbai': {
            tiltAngle: 25,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Coastal climate, consider salt resistance'
        },
        'Pune': {
            tiltAngle: 28,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Moderate climate, excellent solar potential'
        },
        'Nagpur': {
            tiltAngle: 32,
            azimuth: 180,
            recommendedCapacity: 6,
            notes: 'Hot climate, consider cooling systems'
        },
        'Nashik': {
            tiltAngle: 30,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Pleasant climate, good for solar'
        },
        'Aurangabad': {
            tiltAngle: 29,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Moderate climate, stable performance'
        },
        'Solapur': {
            tiltAngle: 33,
            azimuth: 180,
            recommendedCapacity: 6,
            notes: 'Hot climate, high solar potential'
        },
        'Kolhapur': {
            tiltAngle: 26,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Humid climate, consider ventilation'
        },
        'Amravati': {
            tiltAngle: 31,
            azimuth: 180,
            recommendedCapacity: 5,
            notes: 'Moderate climate, good solar potential'
        }
    };

    const config = optimalConfigs[location] || {
        tiltAngle: 30,
        azimuth: 180,
        recommendedCapacity: 5,
        notes: 'Standard configuration'
    };

    res.json({
        success: true,
        data: {
            location,
            ...config
        }
    });
});

// Get historical solar data for a location
router.get('/historical/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const { days = 30 } = req.query;
        
        // Generate realistic historical data for Maharashtra cities
        const historicalData = generateHistoricalSolarData(location, parseInt(days));
        
        res.json({
            success: true,
            data: {
                location,
                days: parseInt(days),
                data: historicalData
            }
        });
        
    } catch (error) {
        console.error('Historical Data Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error generating historical data'
        });
    }
});

// AI-powered solar prediction calculation
function calculateSolarPredictions(params) {
    const { weatherData, panelCapacity, panelEfficiency, tiltAngle, azimuth } = params;
    
    // Extract weather parameters
    const temperature = weatherData.main?.temp || 25;
    const humidity = weatherData.main?.humidity || 60;
    const cloudCover = weatherData.clouds?.all || 0;
    const windSpeed = weatherData.wind?.speed || 2;
    const solarIrradiance = weatherData.solarIrradiance || 500;
    
    // Weather impact factors
    const cloudFactor = 1 - (cloudCover / 100) * 0.7;
    const tempFactor = 1 + (temperature - 25) * 0.004; // Temperature coefficient
    const humidityFactor = 1 - (humidity / 100) * 0.1;
    
    // Panel efficiency factors
    const tiltEfficiency = calculateTiltEfficiency(tiltAngle, temperature);
    const azimuthEfficiency = calculateAzimuthEfficiency(azimuth);
    
    // Calculate effective irradiance
    const effectiveIrradiance = solarIrradiance * cloudFactor * tempFactor * humidityFactor;
    
    // Calculate power generation
    const panelArea = panelCapacity * 1000 / (panelEfficiency / 100) / 1000; // m²
    const theoreticalPower = effectiveIrradiance * panelArea * (panelEfficiency / 100) / 1000; // kW
    const actualPower = theoreticalPower * tiltEfficiency * azimuthEfficiency;
    
    // Daily energy production
    const peakSunHours = calculatePeakSunHours(cloudCover);
    const dailyEnergy = actualPower * peakSunHours;
    
    // Monthly and yearly estimates
    const monthlyEnergy = dailyEnergy * 30;
    const yearlyEnergy = dailyEnergy * 365;
    
    // Efficiency percentage
    const efficiency = (actualPower / (panelCapacity * 0.8)) * 100;
    
    // ROI calculations
    const costPerWatt = 50; // INR per watt
    const electricityRate = 8; // INR per kWh
    const totalCost = panelCapacity * 1000 * costPerWatt;
    const yearlySavings = yearlyEnergy * electricityRate;
    const paybackPeriod = totalCost / yearlySavings;
    
    return {
        currentPower: Math.round(actualPower * 1000) / 1000,
        dailyEnergy: Math.round(dailyEnergy * 100) / 100,
        monthlyEnergy: Math.round(monthlyEnergy),
        yearlyEnergy: Math.round(yearlyEnergy),
        efficiency: Math.round(efficiency * 10) / 10,
        peakSunHours: Math.round(peakSunHours * 10) / 10,
        effectiveIrradiance: Math.round(effectiveIrradiance),
        financials: {
            totalCost: Math.round(totalCost),
            yearlySavings: Math.round(yearlySavings),
            paybackPeriod: Math.round(paybackPeriod * 10) / 10,
            roi: Math.round((yearlySavings / totalCost) * 100 * 10) / 10
        },
        weatherFactors: {
            cloudFactor: Math.round(cloudFactor * 100),
            tempFactor: Math.round(tempFactor * 100) / 100,
            humidityFactor: Math.round(humidityFactor * 100) / 100,
            tiltEfficiency: Math.round(tiltEfficiency * 100),
            azimuthEfficiency: Math.round(azimuthEfficiency * 100)
        }
    };
}

function calculateTiltEfficiency(tiltAngle, temperature) {
    const optimalTilt = 30;
    const tiltDiff = Math.abs(tiltAngle - optimalTilt);
    const tiltEfficiency = 1 - (tiltDiff / 90) * 0.3;
    const tempEfficiency = 1 - (temperature - 25) * 0.004;
    return Math.max(0.5, tiltEfficiency * tempEfficiency);
}

function calculateAzimuthEfficiency(azimuth) {
    const optimalAzimuth = 180;
    const azimuthDiff = Math.abs(azimuth - optimalAzimuth);
    return 1 - (azimuthDiff / 180) * 0.2;
}

function calculatePeakSunHours(cloudCover) {
    const baseSunHours = 5.5;
    const cloudReduction = (cloudCover / 100) * 0.6;
    return baseSunHours * (1 - cloudReduction);
}

// Generate realistic historical solar data
function generateHistoricalSolarData(location, days) {
    const data = [];
    const now = new Date();
    
    // Maharashtra city-specific solar potential
    const citySolarPotential = {
        'Mumbai': { baseEnergy: 12, efficiency: 75, monsoonImpact: 0.35 },
        'Pune': { baseEnergy: 14, efficiency: 78, monsoonImpact: 0.30 },
        'Nagpur': { baseEnergy: 16, efficiency: 82, monsoonImpact: 0.25 },
        'Nashik': { baseEnergy: 13, efficiency: 76, monsoonImpact: 0.32 },
        'Aurangabad': { baseEnergy: 15, efficiency: 79, monsoonImpact: 0.28 },
        'Solapur': { baseEnergy: 17, efficiency: 84, monsoonImpact: 0.22 },
        'Kolhapur': { baseEnergy: 11, efficiency: 73, monsoonImpact: 0.38 },
        'Amravati': { baseEnergy: 15, efficiency: 80, monsoonImpact: 0.27 }
    };
    
    const cityData = citySolarPotential[location] || citySolarPotential['Mumbai'];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Calculate seasonal factors
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const seasonalFactor = 0.6 + 0.4 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
        
        // Monsoon season impact (June-September)
        const month = date.getMonth();
        const isMonsoon = month >= 5 && month <= 8;
        const monsoonFactor = isMonsoon ? (1 - cityData.monsoonImpact) : 1;
        
        // Weather variation
        const weatherVariation = 0.8 + Math.random() * 0.4;
        
        // Calculate daily energy production
        const dailyEnergy = cityData.baseEnergy * seasonalFactor * monsoonFactor * weatherVariation;
        
        // Calculate efficiency with realistic variations
        const baseEfficiency = cityData.efficiency;
        const efficiencyVariation = -5 + Math.random() * 10;
        const efficiency = Math.max(60, Math.min(95, baseEfficiency + efficiencyVariation));
        
        // Calculate solar irradiance
        const baseIrradiance = 1000;
        const irradianceVariation = 0.7 + Math.random() * 0.6;
        const solarIrradiance = baseIrradiance * seasonalFactor * monsoonFactor * irradianceVariation;
        
        data.push({
            date: date.toISOString().split('T')[0],
            energy: Math.round(dailyEnergy * 100) / 100,
            efficiency: Math.round(efficiency * 10) / 10,
            solarIrradiance: Math.round(solarIrradiance),
            isMonsoon: isMonsoon,
            weatherCondition: getWeatherCondition(month, Math.random())
        });
    }
    
    return data;
}

function getWeatherCondition(month, random) {
    const isMonsoon = month >= 5 && month <= 8;
    
    if (isMonsoon) {
        if (random < 0.4) return 'Rainy';
        if (random < 0.7) return 'Cloudy';
        return 'Partly Cloudy';
    } else {
        if (random < 0.6) return 'Clear';
        if (random < 0.8) return 'Partly Cloudy';
        return 'Cloudy';
    }
}

module.exports = router; 