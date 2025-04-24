/* eslint-env node */
const { Buffer } = require('buffer');

/**
 * Custom error for FIT file decoding issues.
 */
class FitDecodeError extends Error {
	constructor(message, details) {
		super(message);
		this.name = 'FitDecodeError';
		this.details = details;
	}
}

/**
 * Decodes a FIT file buffer using the Garmin FIT SDK.
 * @param {Buffer|Uint8Array} fileBuffer - The FIT file buffer to decode.
 * @param {Object} [options] - Optional decoder.read options.
 * @param {Object} [fitsdk] - Optional fitsdk dependency for testing/mocking.
 * @returns {Promise<Object>} Decoded messages or error object.
 */
async function decodeFitFile(fileBuffer, options = {}, fitsdk = null) {
	// Input validation
	if (
		!fileBuffer ||
		!(fileBuffer instanceof Buffer || fileBuffer instanceof Uint8Array)
	) {
		const msg = 'Input is not a valid Buffer or Uint8Array.';
		console.error(msg);
		throw new FitDecodeError(msg);
	}
	try {
		const sdk = fitsdk || (await import('@garmin/fitsdk'));
		const { Decoder, Stream } = sdk;
		const buffer = Buffer.from(fileBuffer);
		const stream = Stream.fromBuffer(buffer);
		const decoder = new Decoder(stream);
		if (!decoder.checkIntegrity()) {
			const msg = 'FIT file integrity check failed';
			console.error(msg);
			throw new FitDecodeError(msg);
		}
		// Default decoder options
		const defaultOptions = {
			applyScaleAndOffset: true,
			expandSubFields: true,
			expandComponents: true,
			convertTypesToStrings: true,
			convertDateTimesToDates: true,
			includeUnknownData: false,
			mergeHeartRates: true,
		};
		const readOptions = { ...defaultOptions, ...options };
		const { messages, errors } = decoder.read(readOptions);
		if (errors && errors.length > 0) {
			const msg = 'Decoding errors occurred';
			console.error(msg, errors);
			throw new FitDecodeError(msg, errors);
		}
		if (!messages || Object.keys(messages).length === 0) {
			const msg = 'No valid messages decoded, FIT file might be corrupted.';
			console.error(msg);
			throw new FitDecodeError(msg);
		}
		console.log('FIT file decoded successfully.');
		return messages;
	} catch (error) {
		if (error instanceof FitDecodeError) {
			return { error: error.message, details: error.details };
		}
		console.error('Failed to decode file', error);
		return { error: 'Failed to decode file', details: error.toString() };
	}
}

module.exports = { decodeFitFile, FitDecodeError };
