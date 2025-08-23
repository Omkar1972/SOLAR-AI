// Solar AI Predictor - Main JavaScript File

class SolarAIPredictor {
    constructor() {
        this.weatherData = null;
        this.solarConfig = {};
        this.chart = null;
        this.initializeEventListeners();
        this.loadDefaultConfig();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Weather data fetching
        document.getElementById('getWeatherBtn').addEventListener('click', () => this.fetchWeatherData());
        document.getElementById('useCurrentLocation').addEventListener('click', () => this.useCurrentLocation());
        
        // Prediction controls
        document.getElementById('predictBtn').addEventListener('click', () => this.generatePrediction());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearResults());
        
        // Historical data
        document.getElementById('loadHistoricalBtn').addEventListener('click', () => this.loadHistoricalData());
        
        // Maharashtra city buttons
        document.querySelectorAll('.city-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const city = btn.getAttribute('data-city');
                document.getElementById('locationInput').value = `${city}, Maharashtra`;
                this.fetchWeatherData();
                
                // Update active button
                document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Auto-load historical data for the selected city immediately
                this.loadHistoricalData();
            });
        });
        
        // Enter key support for location input
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchWeatherData();
            }
        });
        
        // Solar Calculator button
        document.getElementById('solarCalculatorBtn').addEventListener('click', () => {
            window.location.href = '/solar-calculator.html';
        });
        
        // Location permission request button
        document.getElementById('requestLocationPermission').addEventListener('click', () => {
            this.requestLocationPermission();
        });
        
        // Note: Maharashtra Map feature removed as file doesn't exist
    }

    // Load default solar panel configuration
    loadDefaultConfig() {
        this.solarConfig = {
            capacity: parseFloat(document.getElementById('panelCapacity').value),
            efficiency: parseFloat(document.getElementById('panelEfficiency').value),
            tiltAngle: parseFloat(document.getElementById('panelAngle').value),
            azimuth: parseFloat(document.getElementById('panelAzimuth').value)
        };
    }

    // Update location status indicator
    updateLocationStatus(status, message) {
        const statusIndicator = document.getElementById('locationStatus');
        const icon = statusIndicator.querySelector('i');
        const text = statusIndicator.querySelector('span');
        
        // Remove all status classes
        statusIndicator.classList.remove('active', 'error', 'loading', 'improving');
        
        switch (status) {
            case 'loading':
                statusIndicator.classList.add('loading');
                icon.className = 'fas fa-spinner fa-spin';
                break;
            case 'active':
                statusIndicator.classList.add('active');
                icon.className = 'fas fa-map-marker-alt';
                break;
            case 'improving':
                statusIndicator.classList.add('improving');
                icon.className = 'fas fa-crosshairs';
                break;
            case 'error':
                statusIndicator.classList.add('error');
                icon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                icon.className = 'fas fa-map-marker-alt';
        }
        
        text.textContent = message;
    }

    // Request location permission
    async requestLocationPermission() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('error', 'Geolocation not supported');
            this.showMessage('Geolocation is not supported by this browser.', 'error');
            return;
        }

        this.updateLocationStatus('loading', 'Requesting permission...');
        
        try {
            // Check if permission API is available
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                
                if (permission.state === 'granted') {
                    this.updateLocationStatus('active', 'Permission granted');
                    this.showMessage('Location permission already granted!', 'success');
                    return;
                } else if (permission.state === 'denied') {
                    this.updateLocationStatus('error', 'Permission denied');
                    this.showMessage('Location permission is denied. Please enable it in your browser settings.', 'error');
                    return;
                }
            }
            
            // Request permission by trying to get position
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 60000
                });
            });
            
            this.updateLocationStatus('active', 'Permission granted');
            this.showMessage('Location permission granted successfully!', 'success');
            
            // Store the position for later use
            this.lastKnownPosition = position;
            this.updateLocationInfo(position);
            
        } catch (error) {
            console.error('Permission request error:', error);
            
            let errorMessage = 'Permission request failed. ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please enable location permissions in your browser settings.';
                    this.updateLocationStatus('error', 'Permission denied');
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    this.updateLocationStatus('error', 'Location unavailable');
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Request timed out.';
                    this.updateLocationStatus('error', 'Request timeout');
                    break;
                default:
                    errorMessage += 'Please try again.';
                    this.updateLocationStatus('error', 'Request failed');
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    // Update location information display
    updateLocationInfo(position) {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date(position.timestamp);
        
        document.getElementById('coordinates').textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        document.getElementById('accuracy').textContent = `${Math.round(accuracy)} meters`;
        document.getElementById('lastUpdated').textContent = timestamp.toLocaleString();
        
        // Show the location info section
        document.getElementById('locationInfo').style.display = 'block';
        
        // Store the best position (highest accuracy)
        if (!this.bestPosition || accuracy < this.bestPosition.coords.accuracy) {
            this.bestPosition = position;
            console.log(`Better accuracy achieved: ${Math.round(accuracy)}m`);
        }
    }

    // Start continuous location watching for better accuracy
    startLocationWatching() {
        if (!navigator.geolocation) return;
        
        this.locationWatcher = navigator.geolocation.watchPosition(
            (position) => {
                this.updateLocationInfo(position);
                
                // Update status based on accuracy
                const accuracy = position.coords.accuracy;
                if (accuracy < 10) {
                    this.updateLocationStatus('active', `High accuracy: ${Math.round(accuracy)}m`);
                    this.stopLocationWatching();
                    this.showMessage('High accuracy location obtained!', 'success');
                } else if (accuracy < 50) {
                    this.updateLocationStatus('improving', `Good accuracy: ${Math.round(accuracy)}m`);
                } else {
                    this.updateLocationStatus('improving', `Improving: ${Math.round(accuracy)}m`);
                }
            },
            (error) => {
                console.log('Location watching error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );
    }

    // Stop location watching
    stopLocationWatching() {
        if (this.locationWatcher) {
            navigator.geolocation.clearWatch(this.locationWatcher);
            this.locationWatcher = null;
            console.log('Location watching stopped');
        }
    }

    // Get high accuracy location using multiple attempts
    async getHighAccuracyLocation() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 3;
            let bestPosition = null;
            
            const tryGetPosition = () => {
                attempts++;
                console.log(`Location attempt ${attempts}/${maxAttempts}`);
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
                            bestPosition = position;
                        }
                        
                        // If we have good accuracy or max attempts reached, resolve
                        if (position.coords.accuracy < 20 || attempts >= maxAttempts) {
                            console.log(`Final accuracy: ${Math.round(bestPosition.coords.accuracy)}m`);
                            resolve(bestPosition);
                        } else {
                            // Try again after a short delay
                            setTimeout(tryGetPosition, 1000);
                        }
                    },
                    (error) => {
                        if (attempts >= maxAttempts) {
                            reject(error);
                        } else {
                            setTimeout(tryGetPosition, 1000);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            };
            
            tryGetPosition();
        });
    }

    // Check location permission status on page load
    async checkLocationPermissionStatus() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('error', 'Geolocation not supported');
            return;
        }

        if (navigator.permissions) {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                
                switch (permission.state) {
                    case 'granted':
                        this.updateLocationStatus('active', 'Permission granted');
                        break;
                    case 'denied':
                        this.updateLocationStatus('error', 'Permission denied');
                        break;
                    case 'prompt':
                        this.updateLocationStatus('default', 'Click to request permission');
                        break;
                }
                
                // Listen for permission changes
                permission.addEventListener('change', () => {
                    this.checkLocationPermissionStatus();
                });
                
            } catch (error) {
                console.log('Permission API not supported');
                this.updateLocationStatus('default', 'Click to request permission');
            }
        } else {
            this.updateLocationStatus('default', 'Click to request permission');
        }
    }

    // Show loading modal
    showLoading() {
        document.getElementById('loadingModal').style.display = 'block';
    }

    // Hide loading modal
    hideLoading() {
        document.getElementById('loadingModal').style.display = 'none';
    }

    // Show message with enhanced styling
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Add icon based on message type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
        }
        
        messageDiv.innerHTML = `${icon} <span>${message}</span>`;
        
        // Insert after header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after appropriate time
        const duration = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }, duration);
    }

    // Use current location with enhanced error handling
    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('error', 'Geolocation not supported');
            this.showMessage('Geolocation is not supported by this browser. Please enter your location manually.', 'error');
            return;
        }

        // Check if location permission is already granted
        if (navigator.permissions) {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === 'denied') {
                    this.updateLocationStatus('error', 'Permission denied');
                    this.showMessage('Location access is denied. Please enable location permissions in your browser settings or enter location manually.', 'error');
                    return;
                }
            } catch (error) {
                console.log('Permission API not supported, proceeding with geolocation request');
            }
        }

        this.showLoading();
        this.updateLocationStatus('loading', 'Getting location...');
        
        try {
            // Show user-friendly loading message
            this.showMessage('Getting high accuracy location...', 'info');
            
            const position = await this.getHighAccuracyLocation();

            const { latitude, longitude } = position.coords;
            const accuracy = position.coords.accuracy;
            
            console.log(`Location obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
            
            // Start continuous location watching for better accuracy
            this.startLocationWatching();
            
            // Update location info display
            this.updateLocationInfo(position);
            this.updateLocationStatus('improving', 'Improving accuracy...');
            
            // Try to get weather data using coordinates
            try {
                const response = await fetch(`http://localhost:5000/api/weather/coordinates/${latitude}/${longitude}`);
                
                if (response.ok) {
                    const result = await response.json();
                    this.weatherData = result.data;
                    
                    // Update location input with city name if available
                    const cityName = this.weatherData.name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    document.getElementById('locationInput').value = cityName;
                    
                    this.displayWeatherData();
                    this.hideLoading();
                    this.showMessage(`✅ Location detected: ${cityName} (Accuracy: ${Math.round(accuracy)}m)`, 'success');
                    
                    // Auto-load historical data immediately
                    this.loadHistoricalData();
                    return;
                }
            } catch (apiError) {
                console.log('Backend API not available, using reverse geocoding fallback');
            }
            
            // Fallback: Use reverse geocoding to get city name
            try {
                const reverseGeocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=YOUR_API_KEY`);
                
                if (reverseGeocodeResponse.ok) {
                    const geoData = await reverseGeocodeResponse.json();
                    if (geoData.length > 0) {
                        const cityName = geoData[0].name;
                        document.getElementById('locationInput').value = `${cityName}, ${geoData[0].country}`;
                        
                        // Generate mock weather data for the detected location
                        this.weatherData = this.generateMockWeatherData(`${cityName}, ${geoData[0].country}`);
                        this.displayWeatherData();
                        this.hideLoading();
                        this.showMessage(`✅ Location detected: ${cityName} (Accuracy: ${Math.round(accuracy)}m)`, 'success');
                        
                        // Auto-load historical data immediately
                        this.loadHistoricalData();
                        return;
                    }
                }
            } catch (geoError) {
                console.log('Reverse geocoding failed, using coordinates directly');
            }
            
            // Final fallback: Use coordinates directly
            document.getElementById('locationInput').value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            this.weatherData = this.generateMockWeatherData(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            this.displayWeatherData();
            this.hideLoading();
            this.showMessage(`✅ Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Accuracy: ${Math.round(accuracy)}m)`, 'success');
            
            // Auto-load historical data immediately
            this.loadHistoricalData();
            
        } catch (error) {
            this.hideLoading();
            console.error('Current location error:', error);
            
            let errorMessage = 'Unable to get your current location. ';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location access was denied. Please enable location permissions in your browser settings.';
                    this.updateLocationStatus('error', 'Permission denied');
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable. Please check your device settings.';
                    this.updateLocationStatus('error', 'Location unavailable');
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Please try again or enter location manually.';
                    this.updateLocationStatus('error', 'Request timeout');
                    break;
                default:
                    errorMessage += 'Please enter your location manually.';
                    this.updateLocationStatus('error', 'Request failed');
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    // Fetch weather data from Backend API
    async fetchWeatherData() {
        const location = document.getElementById('locationInput').value.trim();
        if (!location) {
            this.showMessage('Please enter a location.', 'error');
            return;
        }

        this.showLoading();

        try {
            // Use backend API instead of direct OpenWeatherMap
            const cityName = location.split(',')[0].trim();
            const response = await fetch(`http://localhost:5000/api/weather/current/${encodeURIComponent(cityName)}`);
            
            if (!response.ok) {
                throw new Error('Weather data not available for this location');
            }

            const result = await response.json();
            this.weatherData = result.data;
            this.displayWeatherData();
            this.hideLoading();
            this.showMessage('Weather data loaded successfully from backend!');
            
            // Auto-load historical data immediately
            this.loadHistoricalData();
            
        } catch (error) {
            this.hideLoading();
            console.error('Error fetching weather data:', error);
            
            // Fallback to mock data if backend is not available
            this.weatherData = this.generateMockWeatherData(location);
            this.displayWeatherData();
            this.showMessage('Backend not available. Using demo data.', 'error');
            
            // Auto-load historical data even for demo data
            this.loadHistoricalData();
        }
    }

    // Generate mock weather data for Maharashtra cities
    generateMockWeatherData(location) {
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth(); // 0-11
        
        // Maharashtra climate data (approximate)
        const maharashtraClimate = {
            'Mumbai': { tempRange: [22, 35], humidityRange: [60, 85], monsoon: [6, 9] },
            'Pune': { tempRange: [18, 32], humidityRange: [45, 75], monsoon: [6, 9] },
            'Nagpur': { tempRange: [20, 38], humidityRange: [40, 70], monsoon: [6, 9] },
            'Nashik': { tempRange: [16, 30], humidityRange: [50, 80], monsoon: [6, 9] },
            'Aurangabad': { tempRange: [18, 35], humidityRange: [45, 75], monsoon: [6, 9] },
            'Solapur': { tempRange: [22, 38], humidityRange: [35, 65], monsoon: [6, 9] },
            'Kolhapur': { tempRange: [20, 32], humidityRange: [55, 85], monsoon: [6, 9] },
            'Amravati': { tempRange: [19, 36], humidityRange: [40, 70], monsoon: [6, 9] }
        };
        
        // Get city-specific climate data
        const cityName = location.split(',')[0].trim();
        const climate = maharashtraClimate[cityName] || maharashtraClimate['Mumbai'];
        
        // Check if it's monsoon season (June-September)
        const isMonsoon = month >= climate.monsoon[0] && month <= climate.monsoon[1];
        
        // Simulate weather conditions based on time and season
        let temperature, humidity, windSpeed, cloudCover, solarIrradiance;
        
        if (hour >= 6 && hour <= 18) {
            // Daytime
            const tempMin = climate.tempRange[0];
            const tempMax = climate.tempRange[1];
            temperature = tempMin + Math.random() * (tempMax - tempMin);
            
            if (isMonsoon) {
                humidity = climate.humidityRange[1] - 10 + Math.random() * 20;
                cloudCover = 60 + Math.random() * 40;
                windSpeed = 3 + Math.random() * 7;
                solarIrradiance = 200 + Math.random() * 400; // Reduced during monsoon
            } else {
                humidity = climate.humidityRange[0] + Math.random() * (climate.humidityRange[1] - climate.humidityRange[0]);
                cloudCover = Math.random() * 40;
                windSpeed = 2 + Math.random() * 6;
                solarIrradiance = 500 + Math.random() * 700; // Higher during non-monsoon
            }
        } else {
            // Nighttime
            temperature = climate.tempRange[0] - 5 + Math.random() * 8;
            humidity = climate.humidityRange[1] - 15 + Math.random() * 20;
            windSpeed = 1 + Math.random() * 4;
            cloudCover = isMonsoon ? 40 + Math.random() * 30 : 20 + Math.random() * 30;
            solarIrradiance = 0;
        }

        // Weather description based on conditions
        let weatherMain, weatherDesc;
        if (isMonsoon && cloudCover > 70) {
            weatherMain = 'Rain';
            weatherDesc = 'light rain';
        } else if (cloudCover > 70) {
            weatherMain = 'Clouds';
            weatherDesc = 'scattered clouds';
        } else {
            weatherMain = 'Clear';
            weatherDesc = 'clear sky';
        }

        return {
            name: location,
            main: {
                temp: temperature,
                humidity: humidity,
                pressure: 1013 + Math.random() * 20
            },
            wind: {
                speed: windSpeed
            },
            clouds: {
                all: cloudCover
            },
            weather: [{
                main: weatherMain,
                description: weatherDesc
            }],
            sys: {
                sunrise: Date.now() - 6 * 60 * 60 * 1000,
                sunset: Date.now() + 6 * 60 * 60 * 1000
            },
            solarIrradiance: solarIrradiance,
            isMonsoon: isMonsoon
        };
    }

    // Display weather data in the UI
    displayWeatherData() {
        const weatherDataDiv = document.getElementById('weatherData');
        
        if (!this.weatherData) {
            weatherDataDiv.innerHTML = `
                <div class="weather-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No weather data available</p>
                </div>
            `;
            return;
        }

        const weather = this.weatherData;
        const temp = weather.main.temp;
        const humidity = weather.main.humidity;
        const windSpeed = weather.wind.speed;
        const cloudCover = weather.clouds.all;
        const solarIrradiance = weather.solarIrradiance || 0;

        weatherDataDiv.innerHTML = `
            <div class="weather-info">
                <div class="weather-item">
                    <h3>Temperature</h3>
                    <div class="value">${temp.toFixed(1)}</div>
                    <div class="unit">°C</div>
                </div>
                <div class="weather-item">
                    <h3>Humidity</h3>
                    <div class="value">${humidity}%</div>
                    <div class="unit"></div>
                </div>
                <div class="weather-item">
                    <h3>Wind Speed</h3>
                    <div class="value">${windSpeed.toFixed(1)}</div>
                    <div class="unit">m/s</div>
                </div>
                <div class="weather-item">
                    <h3>Cloud Cover</h3>
                    <div class="value">${cloudCover}%</div>
                    <div class="unit"></div>
                </div>
                <div class="weather-item">
                    <h3>Solar Irradiance</h3>
                    <div class="value">${solarIrradiance.toFixed(0)}</div>
                    <div class="unit">W/m²</div>
                </div>
                <div class="weather-item">
                    <h3>Weather</h3>
                    <div class="value">${weather.weather[0].main}</div>
                    <div class="unit">${weather.weather[0].description}</div>
                </div>
                ${weather.isMonsoon ? `
                <div class="weather-item monsoon-alert">
                    <h3>Monsoon Season</h3>
                    <div class="value">Active</div>
                    <div class="unit">June-September</div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // AI-powered solar power generation prediction using Backend
    async generatePrediction() {
        if (!this.weatherData) {
            this.showMessage('Please fetch weather data first.', 'error');
            return;
        }

        this.showLoading();
        
        // Update solar configuration from form
        this.loadDefaultConfig();

        try {
            // Use backend API for solar predictions
            const response = await fetch('http://localhost:5000/api/solar/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: document.getElementById('locationInput').value.trim(),
                    weatherData: this.weatherData,
                    panelCapacity: this.solarConfig.capacity,
                    panelEfficiency: this.solarConfig.efficiency,
                    tiltAngle: this.solarConfig.tiltAngle,
                    azimuth: this.solarConfig.azimuth
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate prediction');
            }

            const result = await response.json();
            this.displayPredictions(result.data.predictions);
            this.hideLoading();
            this.showMessage('AI-powered solar prediction generated successfully!');
            
        } catch (error) {
            this.hideLoading();
            console.error('Prediction Error:', error);
            
            // Fallback to local calculations
            const predictions = this.calculateSolarPredictions();
            this.displayPredictions(predictions);
            this.showMessage('Backend not available. Using local calculations.', 'error');
        }
    }

    // Calculate solar power predictions using AI algorithms
    calculateSolarPredictions() {
        const weather = this.weatherData;
        const config = this.solarConfig;

        // Base solar irradiance (W/m²)
        let baseIrradiance = weather.solarIrradiance || 500;

        // Weather impact factors
        const cloudFactor = 1 - (weather.clouds.all / 100) * 0.7; // Clouds reduce irradiance by up to 70%
        const tempFactor = 1 + (weather.main.temp - 25) * 0.004; // Temperature coefficient
        const humidityFactor = 1 - (weather.main.humidity / 100) * 0.1; // Humidity reduces efficiency slightly

        // Panel efficiency factors
        const tiltEfficiency = this.calculateTiltEfficiency(config.tiltAngle, weather.main.temp);
        const azimuthEfficiency = this.calculateAzimuthEfficiency(config.azimuth);

        // Calculate effective irradiance
        const effectiveIrradiance = baseIrradiance * cloudFactor * tempFactor * humidityFactor;

        // Calculate power generation (kW)
        const panelArea = config.capacity * 1000 / (config.efficiency / 100) / 1000; // m²
        const theoreticalPower = effectiveIrradiance * panelArea * (config.efficiency / 100) / 1000; // kW
        const actualPower = theoreticalPower * tiltEfficiency * azimuthEfficiency;

        // Daily energy production (kWh)
        const peakSunHours = this.calculatePeakSunHours(weather.clouds.all);
        const dailyEnergy = actualPower * peakSunHours;

        // Monthly and yearly estimates
        const monthlyEnergy = dailyEnergy * 30;
        const yearlyEnergy = dailyEnergy * 365;

        // Efficiency percentage
        const efficiency = (actualPower / (config.capacity * 0.8)) * 100; // 80% is typical peak capacity

        return {
            currentPower: actualPower,
            dailyEnergy: dailyEnergy,
            monthlyEnergy: monthlyEnergy,
            yearlyEnergy: yearlyEnergy,
            efficiency: efficiency,
            peakSunHours: peakSunHours,
            effectiveIrradiance: effectiveIrradiance
        };
    }

    // Calculate tilt efficiency based on panel angle and temperature
    calculateTiltEfficiency(tiltAngle, temperature) {
        // Optimal tilt angle varies by latitude and season
        const optimalTilt = 30; // Simplified for demo
        const tiltDiff = Math.abs(tiltAngle - optimalTilt);
        const tiltEfficiency = 1 - (tiltDiff / 90) * 0.3; // Up to 30% loss for extreme angles
        
        // Temperature effect on efficiency
        const tempEfficiency = 1 - (temperature - 25) * 0.004; // -0.4% per °C above 25°C
        
        return Math.max(0.5, tiltEfficiency * tempEfficiency);
    }

    // Calculate azimuth efficiency
    calculateAzimuthEfficiency(azimuth) {
        // Optimal azimuth is 180° (south) in northern hemisphere
        const optimalAzimuth = 180;
        const azimuthDiff = Math.abs(azimuth - optimalAzimuth);
        return 1 - (azimuthDiff / 180) * 0.2; // Up to 20% loss for extreme azimuth
    }

    // Calculate peak sun hours based on cloud cover
    calculatePeakSunHours(cloudCover) {
        const baseSunHours = 5.5; // Average peak sun hours
        const cloudReduction = (cloudCover / 100) * 0.6; // Up to 60% reduction for heavy clouds
        return baseSunHours * (1 - cloudReduction);
    }

    // Display prediction results
    displayPredictions(predictions) {
        const resultsDiv = document.getElementById('predictionResults');
        
        resultsDiv.innerHTML = `
            <div class="prediction-grid">
                <div class="prediction-card">
                    <h3>Current Power Output</h3>
                    <div class="value">${predictions.currentPower.toFixed(2)}</div>
                    <div class="unit">kW</div>
                </div>
                <div class="prediction-card">
                    <h3>Daily Energy Production</h3>
                    <div class="value">${predictions.dailyEnergy.toFixed(1)}</div>
                    <div class="unit">kWh</div>
                </div>
                <div class="prediction-card">
                    <h3>Monthly Energy Production</h3>
                    <div class="value">${predictions.monthlyEnergy.toFixed(0)}</div>
                    <div class="unit">kWh</div>
                </div>
                <div class="prediction-card">
                    <h3>Yearly Energy Production</h3>
                    <div class="value">${predictions.yearlyEnergy.toFixed(0)}</div>
                    <div class="unit">kWh</div>
                </div>
                <div class="prediction-card">
                    <h3>System Efficiency</h3>
                    <div class="value">${predictions.efficiency.toFixed(1)}</div>
                    <div class="unit">%</div>
                </div>
                <div class="prediction-card">
                    <h3>Peak Sun Hours</h3>
                    <div class="value">${predictions.peakSunHours.toFixed(1)}</div>
                    <div class="unit">hours</div>
                </div>
            </div>
        `;
    }

    // Clear prediction results
    clearResults() {
        document.getElementById('predictionResults').innerHTML = `
            <div class="prediction-placeholder">
                <i class="fas fa-chart-bar"></i>
                <p>Click "Generate Prediction" to see results</p>
            </div>
        `;
    }

    // Load historical data and create chart
    async loadHistoricalData() {
        this.showLoading();
        
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const location = document.getElementById('locationInput').value.split(',')[0].trim();
        
        try {
            // Fetch historical data from backend API
            const response = await fetch(`http://localhost:5000/api/solar/historical/${encodeURIComponent(location)}?days=${timeRange}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch historical data');
            }
            
            const result = await response.json();
            const historicalData = result.data.data;
            
            this.createHistoricalChart(historicalData);
            this.hideLoading();
            this.showMessage(`Historical data loaded for ${location}!`);
            
        } catch (error) {
            this.hideLoading();
            console.error('Historical Data Error:', error);
            
            // Fallback to local generation if backend fails
            const historicalData = this.generateHistoricalData(timeRange, location);
            this.createHistoricalChart(historicalData);
            this.showMessage('Backend not available. Using local data.', 'error');
        }
    }

    // Generate fallback historical data
    generateHistoricalData(days, location = 'Mumbai') {
        const data = [];
        const now = new Date();
        
        // City-specific base values
        const cityData = {
            'Mumbai': { baseEnergy: 12, efficiency: 75 },
            'Pune': { baseEnergy: 14, efficiency: 78 },
            'Nagpur': { baseEnergy: 16, efficiency: 82 },
            'Nashik': { baseEnergy: 13, efficiency: 76 },
            'Aurangabad': { baseEnergy: 15, efficiency: 79 },
            'Solapur': { baseEnergy: 17, efficiency: 84 },
            'Kolhapur': { baseEnergy: 11, efficiency: 73 },
            'Amravati': { baseEnergy: 15, efficiency: 80 }
        };
        
        const cityConfig = cityData[location] || cityData['Mumbai'];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Simulate seasonal and weather variations
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const seasonalFactor = 0.6 + 0.4 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
            const weatherVariation = 0.8 + Math.random() * 0.4;
            
            const dailyEnergy = cityConfig.baseEnergy * seasonalFactor * weatherVariation;
            const efficiency = cityConfig.efficiency + (Math.random() - 0.5) * 10;
            
            data.push({
                date: date.toISOString().split('T')[0],
                energy: Math.round(dailyEnergy * 100) / 100,
                efficiency: Math.max(60, Math.min(95, Math.round(efficiency * 10) / 10))
            });
        }
        
        return data;
    }

    // Update Maharashtra solar potential from backend data
    updateMaharashtraPotential(data) {
        const potentialSection = document.querySelector('.maharashtra-potential-section');
        if (potentialSection) {
            const potentialGrid = potentialSection.querySelector('.potential-grid');
            if (potentialGrid) {
                // Update with real data from backend
                const cityName = document.getElementById('locationInput').value.split(',')[0].trim();
                const cityData = data[cityName] || data['Mumbai'];
                
                if (cityData) {
                    potentialGrid.innerHTML = `
                        <div class="potential-item">
                            <h3>Annual Solar Irradiance</h3>
                            <div class="value">${cityData.annualIrradiance}</div>
                            <div class="unit">kWh/m²/day</div>
                        </div>
                        <div class="potential-item">
                            <h3>Peak Sun Hours</h3>
                            <div class="value">${cityData.peakSunHours}</div>
                            <div class="unit">hours/day</div>
                        </div>
                        <div class="potential-item">
                            <h3>Monsoon Impact</h3>
                            <div class="value">${cityData.monsoonImpact}</div>
                            <div class="unit">reduction</div>
                        </div>
                        <div class="potential-item">
                            <h3>Solar Class</h3>
                            <div class="value">${cityData.solarClass}</div>
                            <div class="unit">${cityData.bestSeason}</div>
                        </div>
                    `;
                }
            }
        }
    }

    // Create historical chart using Chart.js
    createHistoricalChart(data) {
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Calculate statistics
        const totalEnergy = data.reduce((sum, d) => sum + d.energy, 0);
        const avgEfficiency = data.reduce((sum, d) => sum + d.efficiency, 0) / data.length;
        const maxEnergy = Math.max(...data.map(d => d.energy));
        const minEnergy = Math.min(...data.map(d => d.energy));
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Daily Energy Production (kWh)',
                    data: data.map(d => d.energy),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'System Efficiency (%)',
                    data: data.map(d => d.efficiency),
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Historical Solar Power Generation - ${data.length} Days`,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Energy Production (kWh)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Efficiency (%)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
        
        // Update chart container with statistics
        this.updateHistoricalStats(data, totalEnergy, avgEfficiency, maxEnergy, minEnergy);
    }
    
    // Update historical statistics display
    updateHistoricalStats(data, totalEnergy, avgEfficiency, maxEnergy, minEnergy) {
        const chartContainer = document.getElementById('historicalChart');
        if (chartContainer) {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'historical-stats';
            statsDiv.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>Total Energy</h4>
                        <div class="value">${totalEnergy.toFixed(1)} kWh</div>
                    </div>
                    <div class="stat-item">
                        <h4>Average Efficiency</h4>
                        <div class="value">${avgEfficiency.toFixed(1)}%</div>
                    </div>
                    <div class="stat-item">
                        <h4>Peak Production</h4>
                        <div class="value">${maxEnergy.toFixed(1)} kWh</div>
                    </div>
                    <div class="stat-item">
                        <h4>Lowest Production</h4>
                        <div class="value">${minEnergy.toFixed(1)} kWh</div>
                    </div>
                </div>
            `;
            
            // Remove existing stats if any
            const existingStats = chartContainer.querySelector('.historical-stats');
            if (existingStats) {
                existingStats.remove();
            }
            
            // Insert stats before the chart
            const canvas = chartContainer.querySelector('canvas');
            chartContainer.insertBefore(statsDiv, canvas);
        }
    }
}

    // Initialize the application when DOM is loaded
    document.addEventListener('DOMContentLoaded', async () => {
        const app = new SolarAIPredictor();
        
        // Check location permission status on page load
        app.checkLocationPermissionStatus();
        
        // Load Maharashtra solar potential from backend
        try {
            const response = await fetch('http://localhost:5000/api/solar/maharashtra-potential');
            if (response.ok) {
                const result = await response.json();
                app.updateMaharashtraPotential(result.data);
            }
        } catch (error) {
            console.log('Could not load Maharashtra potential from backend');
        }
        
        // Auto-load historical data for default location (Mumbai) with better timing
        setTimeout(() => {
            app.loadHistoricalData();
        }, 2000);
    });

// Add some utility functions for better user experience
window.addEventListener('load', () => {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 

function calculateConsumption() {
    let totalConsumption = 0;

    document.querySelectorAll('.appliance-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const qtyInput = item.querySelector('.quantity');
        const customWattInput = item.querySelector('.custom-watt');

        if (checkbox.checked) {
            let qty = parseInt(qtyInput.value) || 0;
            let watt = parseFloat(customWattInput.value) || parseFloat(checkbox.dataset.wattage);
            let hours = parseFloat(checkbox.dataset.hours);

            totalConsumption += qty * watt * hours; // Watt-Hours
        }
    });

    alert("Total Consumption: " + totalConsumption + " Wh");
}
