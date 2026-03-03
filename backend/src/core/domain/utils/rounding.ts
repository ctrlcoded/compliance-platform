/**
 * Deterministically rounds a floating-point number to exactly 4 decimal places.
 * Uses Number.EPSILON to correct for JavaScript's inherent binary floating-point 
 * representation errors.
 */
export function round4(value: number): number {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
