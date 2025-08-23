// Configuration file for API keys
const config = {
    // OpenWeatherMap API Key
    // Get your free API key from: https://openweathermap.org/api
    OPENWEATHER_API_KEY: 'f00346dad1f16ffed5cc6f0aa50bd53b', // OpenWeatherMap API Key
    
    // Other API configurations can be added here
    // Example: GOOGLE_MAPS_API_KEY: 'your_google_maps_key',
    // Example: SOLAR_API_KEY: 'your_solar_api_key'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 