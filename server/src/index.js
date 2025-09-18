const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// Load env based on NODE_ENV (defaults to development)
const env = process.env.NODE_ENV || 'development';
require('dotenv').config(); // base .env if present
require('dotenv').config({ path: `.env.${env}` });

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render/Proxy headers so client IP is read from X-Forwarded-For
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
// app.use(cors({
//     origin: 'https://chat-bot-kappa-tawny.vercel.app',
//     credentials: true
// }));
const allowedOrigins = 'https://chatbot-frontend-8s5i.onrender.com,http://localhost:5173,http://localhost:3000'
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests or same-origin (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// app.options('/*', cors(corsOptions));
// Rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100)
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AI Customer Support API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler (must come after routes)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
