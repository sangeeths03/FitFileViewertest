const { FitDecodeError } = require('../../fitParser');

describe('FitDecodeError', () => {
    it('should set the message property', () => {
        const error = new FitDecodeError('Test message');
        expect(error.message).toBe('Test message');
    });

    it('should set the name property to "FitDecodeError"', () => {
        const error = new FitDecodeError('Some error');
        expect(error.name).toBe('FitDecodeError');
    });

    it('should set the details property if provided', () => {
        const details = { code: 123, info: 'Extra info' };
        const error = new FitDecodeError('Error with details', details);
        expect(error.details).toBe(details);
    });

    it('should set the details property to undefined if not provided', () => {
        const error = new FitDecodeError('No details');
        expect(error.details).toBeUndefined();
    });

    it('should be an instance of Error', () => {
        const error = new FitDecodeError('Instance check');
        expect(error instanceof Error).toBe(true);
    });
});