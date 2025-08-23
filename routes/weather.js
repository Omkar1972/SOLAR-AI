const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateWeatherRequest } = require('../middleware/validation');

// API Key - Direct configuration
const OPENWEATHER_API_KEY = 'f00346dad1f16ffed5cc6f0aa50bd53b';

// Maharashtra cities data
const maharashtraCities = {
    'Mumbai': { lat: 19.0760, lon: 72.8777 },
    'Pune': { lat: 18.5204, lon: 73.8567 },
    'Nagpur': { lat: 21.1458, lon: 79.0882 },
    'Nashik': { lat: 19.9975, lon: 73.7898 },
    'Aurangabad': { lat: 19.8762, lon: 75.3433 },
    'Solapur': { lat: 17.6599, lon: 75.9064 },
    'Kolhapur': { lat: 16.7050, lon: 74.2433 },
    'Amravati': { lat: 20.9374, lon: 77.7796 }
};

// Get current weather for a location
router.get('/current/:location', validateWeatherRequest, async (req, res) => {
    try {
        const { location } = req.params;

        // Check if it's a Maharashtra city
        const cityData = maharashtraCities[location];
        
        // Only allow Maharashtra cities
        if (!cityData) {
            return res.status(400).json({
                success: false,
                message: 'Only Maharashtra cities are supported. Please select a city from Maharashtra.'
            });
        }

        // Use coordinates for Maharashtra cities
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

        const response = await axios.get(url);
        const weatherData = response.data;

        // Add Maharashtra-specific data
        const enhancedData = {
            ...weatherData,
            isMaharashtraCity: true,
            solarIrradiance: calculateSolarIrradiance(weatherData),
            monsoonSeason: isMonsoonSeason(new Date())
        };

        res.json({
            success: true,
            data: enhancedData
        });

    } catch (error) {
        console.error('Weather API Error:', error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching weather data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get weather forecast for a location
router.get('/forecast/:location', validateWeatherRequest, async (req, res) => {
    try {
        const { location } = req.params;

        const cityData = maharashtraCities[location];
        
        // Only allow Maharashtra cities
        if (!cityData) {
            return res.status(400).json({
                success: false,
                message: 'Only Maharashtra cities are supported. Please select a city from Maharashtra.'
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.lat}&lon=${cityData.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

        const response = await axios.get(url);
        const forecastData = response.data;

        // Process forecast data for solar predictions
        const processedForecast = forecastData.list.map(item => ({
            ...item,
            solarIrradiance: calculateSolarIrradiance(item),
            solarPotential: calculateSolarPotential(item)
        }));

        res.json({
            success: true,
            data: {
                ...forecastData,
                list: processedForecast
            }
        });

    } catch (error) {
        console.error('Forecast API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching forecast data'
        });
    }
});

// Get Maharashtra cities list
router.get('/maharashtra-cities', (req, res) => {
    res.json({
        success: true,
        data: Object.keys(maharashtraCities)
    });
});

// Get weather by coordinates (for current location)
router.get('/coordinates/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        
        // Check if coordinates are in Maharashtra
        const isMaharashtra = checkIfMaharashtra(parseFloat(lat), parseFloat(lon));
        
        // Only allow Maharashtra coordinates
        if (!isMaharashtra) {
            return res.status(400).json({
                success: false,
                message: 'Only locations within Maharashtra are supported.'
            });
        }
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        
        const response = await axios.get(url);
        const weatherData = response.data;
        
        // Add Maharashtra-specific data
        const enhancedData = {
            ...weatherData,
            isMaharashtraCity: true,
            solarIrradiance: calculateSolarIrradiance(weatherData),
            monsoonSeason: isMonsoonSeason(new Date())
        };
        
        res.json({
            success: true,
            data: enhancedData
        });
        
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching weather data for coordinates'
        });
    }
});

// Helper functions
function calculateSolarIrradiance(weatherData) {
    const { clouds, weather } = weatherData;
    const cloudCover = clouds?.all || 0;
    
    // Base solar irradiance (W/m²)
    let baseIrradiance = 1000;
    
    // Reduce based on cloud cover
    const cloudFactor = 1 - (cloudCover / 100) * 0.7;
    
    // Reduce based on weather conditions
    let weatherFactor = 1;
    if (weather && weather.length > 0) {
        const mainWeather = weather[0].main.toLowerCase();
        if (mainWeather.includes('rain') || mainWeather.includes('snow')) {
            weatherFactor = 0.3;
        } else if (mainWeather.includes('clouds')) {
            weatherFactor = 0.6;
        } else if (mainWeather.includes('clear')) {
            weatherFactor = 1.0;
        }
    }
    
    return Math.round(baseIrradiance * cloudFactor * weatherFactor);
}

function calculateSolarPotential(weatherData) {
    const irradiance = calculateSolarIrradiance(weatherData);
    
    // Convert to kWh/m²/day (assuming 6 hours of peak sun)
    const dailyEnergy = (irradiance * 6) / 1000;
    
    return {
        irradiance,
        dailyEnergy: Math.round(dailyEnergy * 100) / 100,
        efficiency: Math.min(100, Math.max(0, (irradiance / 1000) * 100))
    };
}

function isMonsoonSeason(date) {
    const month = date.getMonth(); // 0-11
    return month >= 5 && month <= 8; // June to September
}

function checkIfMaharashtra(lat, lon) {
    // Maharashtra boundaries (approximate)
    const maharashtraBounds = {
        north: 22.0,  // Northern boundary
        south: 15.5,  // Southern boundary
        east: 80.5,   // Eastern boundary
        west: 72.5    // Western boundary
    };
    
    return lat >= maharashtraBounds.south && 
           lat <= maharashtraBounds.north && 
           lon >= maharashtraBounds.west && 
           lon <= maharashtraBounds.east;
}

module.exports = router;