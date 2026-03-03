"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteComparisonService = void 0;
class RouteComparisonService {
    /**
     * Compares the target baseline intensity to a candidate route.
     * Returns negative percentDiff if compliant, positive if worse.
     */
    static compare(baselineGhg, compareGhg) {
        if (baselineGhg === 0)
            return { percentDiff: 0, compliant: compareGhg <= 0 };
        const rawDiff = ((compareGhg / baselineGhg) - 1) * 100;
        const percentDiff = this.round2(rawDiff);
        return {
            percentDiff,
            compliant: percentDiff <= 0,
        };
    }
    static round2(value) {
        return Math.round(value * 100) / 100;
    }
}
exports.RouteComparisonService = RouteComparisonService;
