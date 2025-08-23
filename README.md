# Solar AI Predictor 🌞

An AI-powered solar power generation predictor that uses weather data to forecast solar energy production. This web application provides real-time weather-based predictions for solar panel efficiency and energy generation.

## Features ✨

### 🌤️ Weather Integration
- Real-time weather data from OpenWeatherMap API
- Current location detection using geolocation
- Weather parameters: temperature, humidity, wind speed, cloud cover, solar irradiance

### 🤖 AI-Powered Predictions
- Advanced solar power generation algorithms
- Weather impact analysis (clouds, temperature, humidity)
- Panel efficiency calculations based on tilt and azimuth
- Real-time power output predictions

### 📊 Comprehensive Analytics
- Current power output (kW)
- Daily, monthly, and yearly energy production (kWh)
- System efficiency percentage
- Peak sun hours calculation
- Historical data visualization with interactive charts

### ⚙️ Solar Panel Configuration
- Customizable panel capacity (kW)
- Panel efficiency settings (%)
- Tilt angle optimization (°)
- Azimuth orientation (°)

### 📱 Modern UI/UX
- Responsive design for all devices
- Beautiful gradient backgrounds
- Interactive cards with hover effects
- Loading animations and user feedback
- Chart.js integration for data visualization

## Setup Instructions 🚀

### 1. Get Weather API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key
4. Replace `'YOUR_API_KEY'` in `script.js` line 95 with your actual API key

### 2. Run the Application
1. Download all files to a folder
2. Open `index.html` in a web browser
3. Or serve using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### 3. Usage
1. **Enter Location**: Type a city name or coordinates
2. **Get Weather**: Click "Get Weather Data" or use current location
3. **Configure Panels**: Adjust solar panel settings
4. **Generate Prediction**: Click "Generate Prediction" for AI-powered forecasts
5. **View History**: Load historical data and charts

## File Structure 📁

```
Solar-AI/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details 🔧

### Weather API Integration
- **Provider**: OpenWeatherMap API
- **Data**: Temperature, humidity, wind speed, cloud cover
- **Fallback**: Mock data generation for demonstration

### AI Prediction Algorithm
The prediction system uses multiple factors:

1. **Weather Impact**:
   - Cloud cover reduction (up to 70%)
   - Temperature coefficient (-0.4% per °C above 25°C)
   - Humidity effects (up to 10% reduction)

2. **Panel Efficiency**:
   - Tilt angle optimization
   - Azimuth orientation
   - Temperature effects on panel performance

3. **Solar Irradiance**:
   - Base irradiance calculation
   - Weather-adjusted effective irradiance
   - Peak sun hours estimation

### Mathematical Models
- **Power Output**: `P = Irradiance × Area × Efficiency × Weather_Factors`
- **Daily Energy**: `E = Power × Peak_Sun_Hours`
- **Efficiency**: `η = Actual_Power / Theoretical_Power × 100`

## Customization 🎨

### Adding New Weather Parameters
1. Update the weather data fetching in `fetchWeatherData()`
2. Add new parameters to `displayWeatherData()`
3. Include in prediction calculations

### Modifying Prediction Algorithms
1. Edit `calculateSolarPredictions()` function
2. Adjust efficiency factors in helper functions
3. Update display methods for new metrics

### Styling Changes
1. Modify `styles.css` for visual changes
2. Update color schemes and gradients
3. Adjust responsive breakpoints

## Browser Compatibility 🌐

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## API Limitations ⚠️

- OpenWeatherMap free tier: 60 calls/minute
- Geolocation requires HTTPS in production
- Chart.js requires internet connection for CDN

## Future Enhancements 🚀

- [ ] Machine learning model integration
- [ ] Real-time solar irradiance data
- [ ] Multiple panel type support
- [ ] Seasonal optimization algorithms
- [ ] Export functionality (PDF/CSV)
- [ ] Mobile app version
- [ ] Cloud storage for historical data
- [ ] Advanced weather forecasting

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Support 💬

For questions or issues:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Made with ❤️ for sustainable energy solutions** 