const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// In-memory user storage (replace with database in production)
let users = [];

// Register user
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { name, email, password, location } = req.body;

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            location: location || 'Mumbai',
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    location: user.location
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    location: user.location
                },
                token
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

// Get user profile
router.get('/profile', (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                location: user.location,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Update user profile
router.put('/profile', (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userIndex = users.findIndex(u => u.id === decoded.userId);

        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { name, location } = req.body;
        
        if (name) users[userIndex].name = name;
        if (location) users[userIndex].location = location;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: users[userIndex].id,
                name: users[userIndex].name,
                email: users[userIndex].email,
                location: users[userIndex].location
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router; 