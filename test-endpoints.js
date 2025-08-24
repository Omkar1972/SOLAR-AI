// Test script to verify all new weather API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
    console.log('🧪 Testing Maharashtra Weather API Endpoints...\n');

    try {
        // Test 1: Get all Maharashtra districts
        console.log('1. Testing /api/weather/maharashtra-districts');
        const districtsResponse = await axios.get(`${BASE_URL}/api/weather/maharashtra-districts`);
        console.log(`✅ Success: Found ${districtsResponse.data.data.length} districts`);
        console.log(`   First district: ${districtsResponse.data.data[0].name} (${districtsResponse.data.data[0].district})\n`);

        // Test 2: Get all districts weather data
        console.log('2. Testing /api/weather/all-districts-weather');
        const weatherResponse = await axios.get(`${BASE_URL}/api/weather/all-districts-weather`);
        console.log(`✅ Success: Weather data for ${weatherResponse.data.totalDistricts} districts`);
        console.log(`   Timestamp: ${weatherResponse.data.timestamp}\n`);

        // Test 3: Test individual district weather
        console.log('3. Testing individual district weather (Mumbai)');
        const mumbaiResponse = await axios.get(`${BASE_URL}/api/weather/current/Mumbai`);
        console.log(`✅ Success: Mumbai weather data`);
        console.log(`   Temperature: ${mumbaiResponse.data.data.main.temp}°C`);
        console.log(`   Humidity: ${mumbaiResponse.data.data.main.humidity}%`);
        console.log(`   Solar Irradiance: ${mumbaiResponse.data.data.solarIrradiance} W/m²\n`);

        // Test 4: Test new district (Ahmednagar)
        console.log('4. Testing new district weather (Ahmednagar)');
        const ahmednagarResponse = await axios.get(`${BASE_URL}/api/weather/current/Ahmednagar`);
        console.log(`✅ Success: Ahmednagar weather data`);
        console.log(`   Temperature: ${ahmednagarResponse.data.data.main.temp}°C`);
        console.log(`   Humidity: ${ahmednagarResponse.data.data.main.humidity}%`);
        console.log(`   Solar Irradiance: ${ahmednagarResponse.data.data.solarIrradiance} W/m²\n`);

        // Test 5: Test solar calculator endpoint
        console.log('5. Testing solar calculator requirements endpoint');
        const solarResponse = await axios.post(`${BASE_URL}/api/solar/calculator-requirements`, {
            location: 'Nagpur',
            dailyConsumption: 15.5,
            appliances: []
        });
        console.log(`✅ Success: Solar calculator working`);
        console.log(`   Location: ${solarResponse.data.data.location}`);
        console.log(`   Required Capacity: ${solarResponse.data.data.requiredCapacity} kW\n`);

        console.log('🎉 All tests passed! The Maharashtra Weather API is working correctly.');
        console.log('\n📊 Summary:');
        console.log(`   - Total districts: ${districtsResponse.data.data.length}`);
        console.log(`   - Weather API: ✅ Working`);
        console.log(`   - Solar Calculator: ✅ Working`);
        console.log(`   - All districts endpoint: ✅ Working`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run tests
testEndpoints();
