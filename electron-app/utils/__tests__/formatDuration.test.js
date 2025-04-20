import { formatDuration } from '../formatDuration.js';

describe('formatDuration', () => {
  it('formats seconds < 60', () => {
    expect(formatDuration(0)).toBe('0 sec');
    expect(formatDuration(59)).toBe('59 sec');
  });

  it('formats seconds < 3600', () => {
    expect(formatDuration(60)).toBe('1 min 0 sec');
    expect(formatDuration(125)).toBe('2 min 5 sec');
    expect(formatDuration(3599)).toBe('59 min 59 sec');
  });

  it('formats 1 hour or more', () => {
    expect(formatDuration(3600)).toBe('1 hr 0 min');
    expect(formatDuration(3661)).toBe('1 hr 1 min');
    expect(formatDuration(7200)).toBe('2 hrs 0 min');
  });

  it('returns empty string for null or undefined', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
  });

  it('throws for non-integer input', () => {
    expect(() => formatDuration(1.5)).toThrow();
    expect(() => formatDuration('foo')).toThrow();
  });
});
