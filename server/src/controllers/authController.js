const authService = require('../services/authService');

class AuthController {
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            // Validate required fields
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            }

            // Validate email format
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            const result = await authService.register({ username, email, password });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await authService.login({ email, password });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = req.user;

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { username } = req.body;
            const userId = req.user._id;

            // Update user profile logic here
            // For now, just return current user
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: req.user }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
