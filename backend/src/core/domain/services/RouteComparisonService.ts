export class RouteComparisonService {
    /**
     * Compares the target baseline intensity to a candidate route.
     * Returns negative percentDiff if compliant, positive if worse.
     */
    public static compare(baselineGhg: number, compareGhg: number): { percentDiff: number; compliant: boolean } {
        if (baselineGhg === 0) return { percentDiff: 0, compliant: compareGhg <= 0 };

        const rawDiff = ((compareGhg / baselineGhg) - 1) * 100;
        const percentDiff = this.round2(rawDiff);

        return {
            percentDiff,
            compliant: percentDiff <= 0,
        };
    }

    private static round2(value: number): number {
        return Math.round(value * 100) / 100;
    }
}
