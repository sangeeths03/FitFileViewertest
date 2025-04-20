import { formatDistance } from '../formatDistance.js';

describe('formatDistance', () => {
  it('formats positive meters correctly', () => {
    expect(formatDistance(1000)).toBe('1.00 km / 0.62 mi');
    expect(formatDistance(1609.34)).toBe('1.61 km / 1.00 mi');
    expect(formatDistance(0)).toBe('0.00 km / 0.00 mi');
  });

  it('returns empty string for null, undefined, NaN, or negative', () => {
    expect(formatDistance(null)).toBe('');
    expect(formatDistance(undefined)).toBe('');
    expect(formatDistance(NaN)).toBe('');
    expect(formatDistance(-5)).toBe('');
  });
});
