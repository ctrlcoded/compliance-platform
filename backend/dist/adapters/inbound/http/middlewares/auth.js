"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../../infrastructure/config/env");
// For simplicity in this architectural demo, use a fixed secret or fallback
const JWT_SECRET = env_1.env.NODE_ENV === 'test' ? 'test-secret' : 'super-secure-production-secret';
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Missing or invalid authorization header',
            },
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Token is invalid or expired',
            },
        });
    }
};
exports.requireAuth = requireAuth;
