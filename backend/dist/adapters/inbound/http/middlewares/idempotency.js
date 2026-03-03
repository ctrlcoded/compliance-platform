"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotency = void 0;
// In a real production system, this would be backed by Redis using the key `idempotency:${key}`.
// For this implementation, we use an in-memory Set as a stub.
const processedKeys = new Set();
const idempotency = (req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
        return next(); // Or return 400 if we want to strictly require it for POST/PUT.
    }
    if (processedKeys.has(idempotencyKey)) {
        return res.status(409).json({
            error: {
                code: 'IDEMPOTENCY_CONFLICT',
                message: 'A request with this Idempotency-Key has already been processed.',
            },
        });
    }
    // Mark the key as processed.
    processedKeys.add(idempotencyKey);
    // Cleanup to avoid memory leak in this stub
    setTimeout(() => {
        processedKeys.delete(idempotencyKey);
    }, 24 * 60 * 60 * 1000); // 24 hours
    next();
};
exports.idempotency = idempotency;
