const { Buffer } = require('buffer');

async function decodeFitFile(fileBuffer) {
	try {
		const { Decoder, Stream } = require('@garmin/fitsdk');
		const buffer = Buffer.from(fileBuffer);
		const stream = Stream.fromBuffer(buffer);
		const decoder = new Decoder(stream);
		if (!decoder.checkIntegrity()) {
			return { error: 'FIT file integrity check failed' };
		}
		const { messages, errors } = decoder.read({
			applyScaleAndOffset: true,
			expandSubFields: true,
			expandComponents: true,
			convertTypesToStrings: true,
			convertDateTimesToDates: true,
			includeUnknownData: false,
			mergeHeartRates: true,
		});
		if (errors.length > 0) {
			return {
				error: 'Decoding errors occurred',
				details: JSON.stringify(errors, null, 2),
			};
		}
		if (!messages || Object.keys(messages).length === 0) {
			return {
				error: 'No valid messages decoded, FIT file might be corrupted.',
			};
		}
		return messages;
	} catch (error) {
		return { error: 'Failed to decode file', details: error.toString() };
	}
}

module.exports = { decodeFitFile };
