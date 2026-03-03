import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from '../logger';
import { complianceRouter } from '../../adapters/inbound/http/routes/compliance.routes';
import { routesRouter } from '../../adapters/inbound/http/routes/routes.routes';
import { bankingRouter } from '../../adapters/inbound/http/routes/banking.routes';
import { poolsRouter } from '../../adapters/inbound/http/routes/pools.routes';
import { errorHandler } from '../../adapters/inbound/http/middlewares/errorHandler';
import { globalRateLimiter } from '../../adapters/inbound/http/middlewares/rateLimiter';

import { env } from '../config/env';

export const app = express();

app.use(helmet());

// Secure CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
if (env.FRONTEND_URL) {
    allowedOrigins.push(env.FRONTEND_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests) if desired, 
        // or restrict strictly. Here we allow no origin or explicitly allowed origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(pinoHttp({ logger }));

// Global Rate Limiting
app.use(globalRateLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// API Routes
app.use('/api/v1/compliance', complianceRouter);
app.use('/api/v1/routes', routesRouter);
app.use('/api/v1/banking', bankingRouter);
app.use('/api/v1/pools', poolsRouter);

// Error Handling (Must be last)
app.use(errorHandler);
