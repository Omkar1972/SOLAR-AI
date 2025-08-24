const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateWeatherRequest } = require('../middleware/validation');

// API Key - Direct configuration
const OPENWEATHER_API_KEY = 'f00346dad1f16ffed5cc6f0aa50bd53b';

// Maharashtra cities data - All 36 Districts
const maharashtraCities = {
    // Major Cities
    'Mumbai': { lat: 19.0760, lon: 72.8777, district: 'Mumbai City' },
    'Pune': { lat: 18.5204, lon: 73.8567, district: 'Pune' },
    'Nagpur': { lat: 21.1458, lon: 79.0882, district: 'Nagpur' },
    'Nashik': { lat: 19.9975, lon: 73.7898, district: 'Nashik' },
    'Aurangabad': { lat: 19.8762, lon: 75.3433, district: 'Aurangabad' },
    'Solapur': { lat: 17.6599, lon: 75.9064, district: 'Solapur' },
    'Kolhapur': { lat: 16.7050, lon: 74.2433, district: 'Kolhapur' },
    'Amravati': { lat: 20.9374, lon: 77.7796, district: 'Amravati' },
    
    // Additional Districts
    'Ahmednagar': { lat: 19.0952, lon: 74.7499, district: 'Ahmednagar' },
    'Akola': { lat: 20.7076, lon: 77.0026, district: 'Akola' },
    'Bhandara': { lat: 21.6447, lon: 79.6062, district: 'Bhandara' },
    'Beed': { lat: 18.9894, lon: 75.7563, district: 'Beed' },
    'Buldhana': { lat: 20.5313, lon: 76.1828, district: 'Buldhana' },
    'Chandrapur': { lat: 19.9615, lon: 79.2961, district: 'Chandrapur' },
    'Dhule': { lat: 20.9024, lon: 74.7733, district: 'Dhule' },
    'Gadchiroli': { lat: 19.4111, lon: 80.0033, district: 'Gadchiroli' },
    'Gondia': { lat: 21.6597, lon: 80.4995, district: 'Gondia' },
    'Hingoli': { lat: 19.7156, lon: 77.1480, district: 'Hingoli' },
    'Jalgaon': { lat: 21.0077, lon: 75.5626, district: 'Jalgaon' },
    'Jalna': { lat: 19.8413, lon: 75.8864, district: 'Jalna' },
    'Latur': { lat: 18.4088, lon: 76.5604, district: 'Latur' },
    'Mumbai Suburban': { lat: 19.2468, lon: 72.8511, district: 'Mumbai Suburban' },
    'Nanded': { lat: 19.1383, lon: 77.3210, district: 'Nanded' },
    'Nashik Rural': { lat: 20.0059, lon: 73.7918, district: 'Nashik Rural' },
    'Osmanabad': { lat: 18.1871, lon: 76.0400, district: 'Osmanabad' },
    'Palghar': { lat: 19.6915, lon: 72.7648, district: 'Palghar' },
    'Parbhani': { lat: 19.1550, lon: 76.6550, district: 'Parbhani' },
    'Raigad': { lat: 18.5784, lon: 73.1193, district: 'Raigad' },
    'Ratnagiri': { lat: 16.9902, lon: 73.3120, district: 'Ratnagiri' },
    'Sangli': { lat: 16.8524, lon: 74.5815, district: 'Sangli' },
    'Satara': { lat: 17.6868, lon: 74.0000, district: 'Satara' },
    'Sindhudurg': { lat: 16.1700, lon: 73.5000, district: 'Sindhudurg' },
    'Thane': { lat: 19.2183, lon: 72.9781, district: 'Thane' },
    'Wardha': { lat: 20.7453, lon: 78.6022, district: 'Wardha' },
    'Washim': { lat: 20.1058, lon: 77.1336, district: 'Washim' },
    'Yavatmal': { lat: 20.3888, lon: 78.1204, district: 'Yavatmal' },
    'Nandurbar': { lat: 21.3700, lon: 74.2400, district: 'Nandurbar' },
    'Gondia': { lat: 21.6597, lon: 80.4995, district: 'Gondia' }
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

// Get all Maharashtra districts with details
router.get('/maharashtra-districts', (req, res) => {
    const districts = Object.entries(maharashtraCities).map(([name, data]) => ({
        name: name,
        district: data.district,
        coordinates: {
            lat: data.lat,
            lon: data.lon
        }
    }));
    
    res.json({
        success: true,
        data: districts
    });
});

// Get weather data for all Maharashtra districts
router.get('/all-districts-weather', async (req, res) => {
    try {
        const weatherPromises = Object.entries(maharashtraCities).map(async ([name, data]) => {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
                const response = await axios.get(url);
                const weatherData = response.data;
                
                return {
                    name: name,
                    district: data.district,
                    coordinates: {
                        lat: data.lat,
                        lon: data.lon
                    },
                    weather: {
                        temperature: weatherData.main?.temp,
                        humidity: weatherData.main?.humidity,
                        description: weatherData.weather?.[0]?.description,
                        icon: weatherData.weather?.[0]?.icon,
                        windSpeed: weatherData.wind?.speed,
                        clouds: weatherData.clouds?.all
                    },
                    solarData: {
                        irradiance: calculateSolarIrradiance(weatherData),
                        potential: calculateSolarPotential(weatherData)
                    }
                };
            } catch (error) {
                console.error(`Error fetching weather for ${name}:`, error.message);
                return {
                    name: name,
                    district: data.district,
                    coordinates: {
                        lat: data.lat,
                        lon: data.lon
                    },
                    error: 'Weather data unavailable'
                };
            }
        });

        const results = await Promise.all(weatherPromises);
        
        res.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString(),
            totalDistricts: results.length
        });

    } catch (error) {
        console.error('All Districts Weather API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching weather data for all districts'
        });
    }
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