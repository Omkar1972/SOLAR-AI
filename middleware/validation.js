const Joi = require('joi');

// Weather request validation
const validateWeatherRequest = (req, res, next) => {
    const schema = Joi.object({
        location: Joi.string().min(2).max(50).required()
    });

    const { error } = schema.validate(req.params);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid location parameter',
            error: error.details[0].message
        });
    }
    
    next();
};

// Solar prediction request validation
const validateSolarRequest = (req, res, next) => {
    const schema = Joi.object({
        location: Joi.string().min(2).max(50).required(),
        weatherData: Joi.object().required(),
        panelCapacity: Joi.number().min(0.1).max(100).required(),
        panelEfficiency: Joi.number().min(5).max(30).required(),
        tiltAngle: Joi.number().min(0).max(90).optional(),
        azimuth: Joi.number().min(0).max(360).optional()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request parameters',
            error: error.details[0].message
        });
    }
    
    next();
};

// User registration validation
const validateUserRegistration = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        location: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user data',
            error: error.details[0].message
        });
    }
    
    next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid login credentials',
            error: error.details[0].message
        });
    }
    
    next();
};

module.exports = {
    validateWeatherRequest,
    validateSolarRequest,
    validateUserRegistration,
    validateUserLogin
}; 