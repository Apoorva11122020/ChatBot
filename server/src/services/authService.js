const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    async register(userData) {
        try {
            const { username, email, password } = userData;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }

            // Create new user
            const user = new User({
                username,
                email,
                password
            });

            await user.save();

            // Generate JWT token
            const token = this.generateToken(user._id);

            return {
                success: true,
                user: user.toJSON(),
                token
            };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async login(credentials) {
        try {
            const { email, password } = credentials;

            // Find user by email
            const user = await User.findOne({ email, isActive: true });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = this.generateToken(user._id);

            return {
                success: true,
                user: user.toJSON(),
                token
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    generateToken(userId) {
        return jwt.sign(
            { userId },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }
}

module.exports = new AuthService();
