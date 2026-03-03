"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainError = DomainError;
