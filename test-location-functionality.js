// Test script for location functionality
// Run this in the browser console to test location features

console.log('🧪 Testing Solar AI Location Functionality...');

// Test 1: Check if geolocation is available
function testGeolocationSupport() {
    console.log('📍 Testing geolocation support...');
    
    if (navigator.geolocation) {
        console.log('✅ Geolocation is supported');
        return true;
    } else {
        console.log('❌ Geolocation is not supported');
        return false;
    }
}

// Test 2: Check permission status
async function testPermissionStatus() {
    console.log('🔐 Testing permission status...');
    
    if (navigator.permissions) {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            console.log(`📋 Permission status: ${permission.state}`);
            return permission.state;
        } catch (error) {
            console.log('❌ Permission API error:', error);
            return 'unknown';
        }
    } else {
        console.log('⚠️ Permission API not supported');
        return 'not-supported';
    }
}

// Test 3: Test location accuracy
function testLocationAccuracy() {
    console.log('🎯 Testing location accuracy...');
    
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation not supported');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accuracy = position.coords.accuracy;
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                console.log(`✅ Location obtained:`);
                console.log(`   Coordinates: ${lat}, ${lon}`);
                console.log(`   Accuracy: ${accuracy} meters`);
                console.log(`   Timestamp: ${new Date(position.timestamp)}`);
                
                // Check if within Maharashtra
                const isMaharashtra = checkMaharashtraBounds(lat, lon);
                console.log(`   Within Maharashtra: ${isMaharashtra ? '✅ Yes' : '❌ No'}`);
                
                resolve({
                    accuracy,
                    coordinates: { lat, lon },
                    isMaharashtra,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                console.log('❌ Location error:', error.message);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

// Test 4: Check Maharashtra boundaries
function checkMaharashtraBounds(lat, lon) {
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

// Test 5: Test API endpoints
async function testAPIEndpoints() {
    console.log('🌐 Testing API endpoints...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:5000/health');
        if (healthResponse.ok) {
            console.log('✅ Health endpoint working');
        } else {
            console.log('❌ Health endpoint failed');
        }
        
        // Test weather API
        const weatherResponse = await fetch('http://localhost:5000/api/weather/current/Mumbai');
        if (weatherResponse.ok) {
            console.log('✅ Weather API working');
        } else {
            console.log('❌ Weather API failed');
        }
        
        // Test solar API
        const solarResponse = await fetch('http://localhost:5000/api/solar/maharashtra-potential');
        if (solarResponse.ok) {
            console.log('✅ Solar API working');
        } else {
            console.log('❌ Solar API failed');
        }
        
    } catch (error) {
        console.log('❌ API test error:', error.message);
    }
}

// Test 6: Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive location tests...\n');
    
    try {
        // Test 1: Geolocation support
        const geolocationSupported = testGeolocationSupport();
        console.log('');
        
        if (geolocationSupported) {
            // Test 2: Permission status
            const permissionStatus = await testPermissionStatus();
            console.log('');
            
            // Test 3: Location accuracy (only if permission granted)
            if (permissionStatus === 'granted') {
                try {
                    const locationData = await testLocationAccuracy();
                    console.log('');
                } catch (error) {
                    console.log('⚠️ Location accuracy test skipped due to error');
                }
            } else {
                console.log('⚠️ Location accuracy test skipped - permission not granted');
            }
        }
        
        // Test 4: API endpoints
        await testAPIEndpoints();
        console.log('');
        
        console.log('🎉 All tests completed!');
        
    } catch (error) {
        console.log('❌ Test suite error:', error);
    }
}

// Helper function to simulate location
function simulateLocation() {
    console.log('🎭 Simulating location for testing...');
    
    // Simulate Mumbai coordinates
    const mockPosition = {
        coords: {
            latitude: 19.0760,
            longitude: 72.8777,
            accuracy: 15,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
        },
        timestamp: Date.now()
    };
    
    console.log('📍 Simulated location: Mumbai, Maharashtra');
    console.log(`   Coordinates: ${mockPosition.coords.latitude}, ${mockPosition.coords.longitude}`);
    console.log(`   Accuracy: ${mockPosition.coords.accuracy} meters`);
    
    return mockPosition;
}

// Export functions for manual testing
window.locationTests = {
    testGeolocationSupport,
    testPermissionStatus,
    testLocationAccuracy,
    checkMaharashtraBounds,
    testAPIEndpoints,
    runAllTests,
    simulateLocation
};

console.log('📚 Location test functions loaded. Use locationTests.runAllTests() to run all tests.');
console.log('🔧 Available functions:');
console.log('   - locationTests.runAllTests() - Run all tests');
console.log('   - locationTests.testGeolocationSupport() - Test geolocation support');
console.log('   - locationTests.testPermissionStatus() - Test permission status');
console.log('   - locationTests.testLocationAccuracy() - Test location accuracy');
console.log('   - locationTests.simulateLocation() - Simulate location for testing');

