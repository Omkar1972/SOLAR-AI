



```bash
npm install
```




`.env` 
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
OPENWEATHER_API_KEY=f00346dad1f16ffed5cc6f0aa50bd53b
FRONTEND_URL=http://localhost:3000
```


```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 **API Endpoints**

### **Weather Routes** (`/api/weather`)
- `GET /current/:location` - Current weather data
- `GET /forecast/:location` - Weather forecast
- `GET /maharashtra-cities` - Maharashtra cities list

### **Solar Routes** (`/api/solar`)
- `POST /predict` - AI solar predictions
- `GET /maharashtra-potential` - Maharashtra solar potential
- `GET /optimal-config/:location` - Optimal panel configuration

### **User Routes** (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### **Prediction Routes** (`/api/predictions`)
- `POST /save` - Save prediction
- `GET /my-predictions` - Get user predictions
- `GET /:id` - Get specific prediction
- `DELETE /:id` - Delete prediction
- `GET /stats/overview` - Prediction statistics

## 🔧 **Features**

### **🌤️ Weather Integration**
- Real-time weather data from OpenWeatherMap
- Maharashtra cities with specific coordinates
- Monsoon season detection
- Solar irradiance calculations

### **🤖 AI Solar Predictions**
- Advanced algorithms for power generation
- Weather impact analysis
- Panel efficiency calculations
- Financial ROI calculations

### **👤 User Management**
- JWT authentication
- User registration and login
- Profile management
- Prediction history

### **📊 Data Management**
- Prediction storage and retrieval
- User statistics
- Historical data analysis

## 🏗️ **Project Structure**
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── env.example           # Environment variables template
├── routes/
│   ├── weather.js        # Weather API routes
│   ├── solar.js          # Solar prediction routes
│   ├── users.js          # User management routes
│   └── predictions.js    # Prediction storage routes
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── validation.js     # Request validation
│   └── errorHandler.js   # Error handling
└── public/               # Frontend files
    ├── index.html
    ├── styles.css
    ├── script.js
    └── config.js
```

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Create .env File**
```bash
cp env.example .env
```

### **3. Start Server**
```bash
npm run dev
```

### **4. Test API**
```bash
# Health check
curl http://localhost:5000/health

# Weather data
curl http://localhost:5000/api/weather/current/Mumbai

# Maharashtra cities
curl http://localhost:5000/api/weather/maharashtra-cities
```

## 🔒 **Security Features**

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request limiting
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Request data validation
- **Error Handling** - Centralized error management

## 📈 **Performance Features**

- **Compression** - Response compression
- **Morgan** - Request logging
- **Rate Limiting** - API protection
- **Caching** - Response caching (can be added)

## 🧪 **Testing**

```bash
# Run tests
npm test

# Test specific endpoint
curl -X POST http://localhost:5000/api/solar/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Mumbai",
    "weatherData": {"main": {"temp": 25, "humidity": 60}},
    "panelCapacity": 5,
    "panelEfficiency": 20
  }'
```

## 🌐 **Production Deployment**

### **1. Environment Setup**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_production_jwt_secret
OPENWEATHER_API_KEY=f00346dad1f16ffed5cc6f0aa50bd53b
```

### **2. Database Setup** (Optional)
MongoDB connection string add करें:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solar_ai_db
```

### **3. PM2 Deployment**
```bash
npm install -g pm2
pm2 start server.js --name "solar-ai-backend"
pm2 save
pm2 startup
```

## 🔧 **Configuration**

### **Rate Limiting**
```javascript
// 15 minutes में 100 requests
windowMs: 15 * 60 * 1000,
max: 100
```

### **CORS Settings**
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:3000',
credentials: true
```

## 📊 **Monitoring**

### **Health Check**
```bash
curl http://localhost:5000/health
```

### **Logs**
```bash
# Development logs
npm run dev

# Production logs
pm2 logs solar-ai-backend
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Port Already in Use**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. **API Key Issues**
   - Check if API key is valid
   - Verify OpenWeatherMap account

3. **CORS Errors**
   - Check FRONTEND_URL in .env
   - Verify CORS configuration

## 📞 **Support**

- **Documentation**: Check this README
- **Issues**: Create GitHub issue
- **API Docs**: Check individual route files

---

