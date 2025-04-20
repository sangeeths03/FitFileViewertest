import { formatArray } from '../formatUtils';

describe('formatArray', () => {
    it('formats an array of numbers to a string with 2 decimal digits by default', () => {
        expect(formatArray([1, 2.345, 3.6789])).toBe('1.00, 2.35, 3.68');
    });

    it('formats an array of numbers to a string with specified decimal digits', () => {
        expect(formatArray([1, 2.345, 3.6789], 1)).toBe('1.0, 2.3, 3.7');
        expect(formatArray([1, 2.345, 3.6789], 3)).toBe('1.000, 2.345, 3.679');
    });

    it('formats an array of numeric strings', () => {
        expect(formatArray(['1', '2.345', '3.6789'])).toBe('1.00, 2.35, 3.68');
    });

    it('throws an error if array contains invalid numbers', () => {
        expect(() => formatArray([1, 'foo', 3])).toThrow('Invalid number: foo');
    });

    it('formats a comma-separated string of numbers', () => {
        expect(formatArray('1,2.345,3.6789')).toBe('1.00, 2.35, 3.68');
    });

    it('formats a comma-separated string of numbers with specified digits', () => {
        expect(formatArray('1,2.345,3.6789', 1)).toBe('1.0, 2.3, 3.7');
    });

    it('throws an error if comma-separated string contains invalid numbers', () => {
        expect(() => formatArray('1,foo,3')).toThrow('Invalid number: foo');
    });

    it('returns the original value if not an array or comma-separated string', () => {
        expect(formatArray('123')).toBe('123');
        expect(formatArray(123)).toBe(123);
        expect(formatArray({})).toEqual({});
        expect(formatArray(null)).toBe(null);
        expect(formatArray(undefined)).toBe(undefined);
    });

    it('handles empty array and empty string', () => {
        expect(formatArray([])).toBe('');
        expect(formatArray('')).toBe('');
    });
});