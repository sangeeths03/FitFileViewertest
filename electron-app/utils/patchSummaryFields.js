import { formatDistance } from './formatDistance.js';
import { formatDuration } from './formatDuration.js';

/**
 * Updates the fields of a summary object to ensure they are in a human-readable format.
 * Handles various metrics such as distance, time, speed, power, heart rate, and more.
 *
 * @param {Object} obj - The summary object containing various metrics to be patched.
 * @returns {void} This function has side effects as it modifies the input object directly.
 */
export function patchSummaryFields(obj) {
	patchDistance(obj);
	patchTime(obj);
	patchSpeed(obj);
	patchPower(obj);
	patchCalories(obj);
	patchHeartRate(obj);
	patchCadence(obj);
	patchRespirationRate(obj);
	patchTemperature(obj);
	patchGritFlow(obj);
	patchTrainingLoad(obj);
	patchStrokes(obj);
	patchFractionalCadence(obj);
	patchTorquePedal(obj);
	patchPCO(obj);
	patchArrays(obj);
	patchTimestamps(obj);
	patchDecimals(obj);
}

// --- Helper functions ---

function patchDistance(obj) {
	if (obj.total_distance != null) {
		const totalDistance = Number(obj.total_distance);
		if (totalDistance != null && !isNaN(totalDistance)) {
			obj.total_distance = formatDistance(totalDistance);
		} else {
			console.warn(`Invalid total_distance: ${obj.total_distance}`);
		}
	}
	if (obj.totalDistance != null) {
		const totalDistance = Number(obj.totalDistance);
		obj.totalDistance = formatDistance(totalDistance);
	}
}

function patchTime(obj) {
	if (obj.total_timer_time != null)
		obj.total_timer_time = formatDuration(Number(obj.total_timer_time));
	if (obj.totalTimerTime != null)
		obj.totalTimerTime = formatDuration(Number(obj.totalTimerTime));
	if (obj.total_elapsed_time != null)
		obj.total_elapsed_time = formatDuration(Number(obj.total_elapsed_time));
	if (obj.totalElapsedTime != null)
		obj.totalElapsedTime = formatDuration(Number(obj.totalElapsedTime));
	if (obj.duration != null) obj.duration = formatDuration(Number(obj.duration));
}

function formatSpeed(val) {
	return (
		(Number(val) * 3.6).toFixed(2) +
		' km/h / ' +
		(Number(val) * 2.23694).toFixed(2) +
		' mph'
	);
}
function patchSpeed(obj) {
	if (obj.avg_speed != null) obj.avg_speed = formatSpeed(obj.avg_speed);
	if (obj.avgSpeed != null) obj.avgSpeed = formatSpeed(obj.avgSpeed);
	if (obj.max_speed != null) obj.max_speed = formatSpeed(obj.max_speed);
	if (obj.maxSpeed != null) obj.maxSpeed = formatSpeed(obj.maxSpeed);
	if (obj.enhanced_avg_speed != null)
		obj.enhanced_avg_speed = formatSpeed(obj.enhanced_avg_speed);
	if (obj.enhancedAvgSpeed != null)
		obj.enhancedAvgSpeed = formatSpeed(obj.enhancedAvgSpeed);
	if (obj.enhanced_max_speed != null)
		obj.enhanced_max_speed = formatSpeed(obj.enhanced_max_speed);
	if (obj.enhancedMaxSpeed != null)
		obj.enhancedMaxSpeed = formatSpeed(obj.enhancedMaxSpeed);
}

function patchPower(obj) {
	if (obj.avg_power != null) obj.avg_power = Math.round(Number(obj.avg_power));
	if (obj.avgPower != null) obj.avgPower = Math.round(Number(obj.avgPower));
	if (obj.max_power != null) obj.max_power = Math.round(Number(obj.max_power));
	if (obj.maxPower != null) obj.maxPower = Math.round(Number(obj.maxPower));
	if (obj.normalized_power != null)
		obj.normalized_power = Math.round(Number(obj.normalized_power));
	if (obj.normalizedPower != null)
		obj.normalizedPower = Math.round(Number(obj.normalizedPower));
	if (obj.threshold_power != null)
		obj.threshold_power = Math.round(Number(obj.threshold_power));
	if (obj.thresholdPower != null)
		obj.thresholdPower = Math.round(Number(obj.thresholdPower));
}

function patchCalories(obj) {
	if (obj.total_calories != null)
		obj.total_calories = Math.round(Number(obj.total_calories));
	if (obj.totalCalories != null)
		obj.totalCalories = Math.round(Number(obj.totalCalories));
}

function patchHeartRate(obj) {
	if (obj.avg_heart_rate != null)
		obj.avg_heart_rate = Math.round(Number(obj.avg_heart_rate));
	if (obj.avgHeartRate != null)
		obj.avgHeartRate = Math.round(Number(obj.avgHeartRate));
	if (obj.max_heart_rate != null)
		obj.max_heart_rate = Math.round(Number(obj.max_heart_rate));
	if (obj.maxHeartRate != null)
		obj.maxHeartRate = Math.round(Number(obj.maxHeartRate));
}

function patchCadence(obj) {
	if (obj.avg_cadence != null)
		obj.avg_cadence = Math.round(Number(obj.avg_cadence));
	if (obj.avgCadence != null)
		obj.avgCadence = Math.round(Number(obj.avgCadence));
	if (obj.max_cadence != null)
		obj.max_cadence = Math.round(Number(obj.max_cadence));
	if (obj.maxCadence != null)
		obj.maxCadence = Math.round(Number(obj.maxCadence));
}

function patchRespirationRate(obj) {
	if (obj.enhanced_avg_respiration_rate != null)
		obj.enhanced_avg_respiration_rate = Number(
			obj.enhanced_avg_respiration_rate,
		).toFixed(1);
	if (obj.enhancedAvgRespirationRate != null)
		obj.enhancedAvgRespirationRate = Number(
			obj.enhancedAvgRespirationRate,
		).toFixed(1);
	if (obj.enhanced_max_respiration_rate != null)
		obj.enhanced_max_respiration_rate = Number(
			obj.enhanced_max_respiration_rate,
		).toFixed(1);
	if (obj.enhancedMaxRespirationRate != null)
		obj.enhancedMaxRespirationRate = Number(
			obj.enhancedMaxRespirationRate,
		).toFixed(1);
	if (obj.enhanced_min_respiration_rate != null)
		obj.enhanced_min_respiration_rate = Number(
			obj.enhanced_min_respiration_rate,
		).toFixed(1);
	if (obj.enhancedMinRespirationRate != null)
		obj.enhancedMinRespirationRate = Number(
			obj.enhancedMinRespirationRate,
		).toFixed(1);
}

function patchTemperature(obj) {
	if (obj.avg_temperature != null)
		obj.avg_temperature = Number(obj.avg_temperature).toFixed(1);
	if (obj.avgTemperature != null)
		obj.avgTemperature = Number(obj.avgTemperature).toFixed(1);
	if (obj.max_temperature != null)
		obj.max_temperature = Number(obj.max_temperature).toFixed(1);
	if (obj.maxTemperature != null)
		obj.maxTemperature = Number(obj.maxTemperature).toFixed(1);
	if (obj.min_temperature != null)
		obj.min_temperature = Number(obj.min_temperature).toFixed(1);
	if (obj.minTemperature != null)
		obj.minTemperature = Number(obj.minTemperature).toFixed(1);
}

function patchGritFlow(obj) {
	if (obj.total_grit != null)
		obj.total_grit = Number(obj.total_grit).toFixed(2);
	if (obj.totalGrit != null) obj.totalGrit = Number(obj.totalGrit).toFixed(2);
	if (obj.avg_flow != null) obj.avg_flow = Number(obj.avg_flow).toFixed(2);
	if (obj.avgFlow != null) obj.avgFlow = Number(obj.avgFlow).toFixed(2);
}

function patchTrainingLoad(obj) {
	if (obj.training_load_peak != null)
		obj.training_load_peak = Math.round(Number(obj.training_load_peak));
	if (obj.trainingLoadPeak != null)
		obj.trainingLoadPeak = Math.round(Number(obj.trainingLoadPeak));
	if (obj.training_stress_score != null)
		obj.training_stress_score = Number(obj.training_stress_score).toFixed(1);
	if (obj.trainingStressScore != null)
		obj.trainingStressScore = Number(obj.trainingStressScore).toFixed(1);
	if (obj.intensity_factor != null)
		obj.intensity_factor = Number(obj.intensity_factor).toFixed(3);
	if (obj.intensityFactor != null)
		obj.intensityFactor = Number(obj.intensityFactor).toFixed(3);
	if (obj.total_training_effect != null)
		obj.total_training_effect = Number(obj.total_training_effect).toFixed(1);
	if (obj.totalTrainingEffect != null)
		obj.totalTrainingEffect = Number(obj.totalTrainingEffect).toFixed(1);
	if (obj.total_anaerobic_training_effect != null)
		obj.total_anaerobic_training_effect = Number(
			obj.total_anaerobic_training_effect,
		).toFixed(1);
	if (obj.totalAnaerobicTrainingEffect != null)
		obj.totalAnaerobicTrainingEffect = Number(
			obj.totalAnaerobicTrainingEffect,
		).toFixed(1);
}

function patchStrokes(obj) {
	if (obj.total_strokes != null)
		obj.total_strokes = Math.round(Number(obj.total_strokes));
	if (obj.totalStrokes != null)
		obj.totalStrokes = Math.round(Number(obj.totalStrokes));
}

function patchFractionalCadence(obj) {
	if (obj.avg_fractional_cadence != null)
		obj.avg_fractional_cadence = Number(obj.avg_fractional_cadence).toFixed(2);
	if (obj.avgFractionalCadence != null)
		obj.avgFractionalCadence = Number(obj.avgFractionalCadence).toFixed(2);
	if (obj.max_fractional_cadence != null)
		obj.max_fractional_cadence = Number(obj.max_fractional_cadence).toFixed(2);
	if (obj.maxFractionalCadence != null)
		obj.maxFractionalCadence = Number(obj.maxFractionalCadence).toFixed(2);
}

function patchTorquePedal(obj) {
	if (obj.avg_left_torque_effectiveness != null)
		obj.avg_left_torque_effectiveness = Number(
			obj.avg_left_torque_effectiveness,
		).toFixed(1);
	if (obj.avgLeftTorqueEffectiveness != null)
		obj.avgLeftTorqueEffectiveness = Number(
			obj.avgLeftTorqueEffectiveness,
		).toFixed(1);
	if (obj.avg_right_torque_effectiveness != null)
		obj.avg_right_torque_effectiveness = Number(
			obj.avg_right_torque_effectiveness,
		).toFixed(1);
	if (obj.avgRightTorqueEffectiveness != null)
		obj.avgRightTorqueEffectiveness = Number(
			obj.avgRightTorqueEffectiveness,
		).toFixed(1);
	if (obj.avg_left_pedal_smoothness != null)
		obj.avg_left_pedal_smoothness = Number(
			obj.avg_left_pedal_smoothness,
		).toFixed(1);
	if (obj.avgLeftPedalSmoothness != null)
		obj.avgLeftPedalSmoothness = Number(obj.avgLeftPedalSmoothness).toFixed(1);
	if (obj.avg_right_pedal_smoothness != null)
		obj.avg_right_pedal_smoothness = Number(
			obj.avg_right_pedal_smoothness,
		).toFixed(1);
	if (obj.avgRightPedalSmoothness != null)
		obj.avgRightPedalSmoothness = Number(obj.avgRightPedalSmoothness).toFixed(
			1,
		);
}

function patchPCO(obj) {
	if (obj.avg_left_pco != null)
		obj.avg_left_pco = Math.round(Number(obj.avg_left_pco));
	if (obj.avgLeftPco != null)
		obj.avgLeftPco = Math.round(Number(obj.avgLeftPco));
	if (obj.avg_right_pco != null)
		obj.avg_right_pco = Math.round(Number(obj.avg_right_pco));
	if (obj.avgRightPco != null)
		obj.avgRightPco = Math.round(Number(obj.avgRightPco));
}

function formatArray(val, digits = 2) {
	if (Array.isArray(val))
		return val.map((v) => Number(v).toFixed(digits)).join(', ');
	if (typeof val === 'string' && val.includes(','))
		return val
			.split(',')
			.map((v) => Number(v).toFixed(digits))
			.join(', ');
	return val;
}
function patchArrays(obj) {
	if (obj.avg_left_power_phase != null)
		obj.avg_left_power_phase = formatArray(obj.avg_left_power_phase, 2);
	if (obj.avgLeftPowerPhase != null)
		obj.avgLeftPowerPhase = formatArray(obj.avgLeftPowerPhase, 2);
	if (obj.avg_left_power_phase_peak != null)
		obj.avg_left_power_phase_peak = formatArray(
			obj.avg_left_power_phase_peak,
			2,
		);
	if (obj.avgLeftPowerPhasePeak != null)
		obj.avgLeftPowerPhasePeak = formatArray(obj.avgLeftPowerPhasePeak, 2);
	if (obj.avg_right_power_phase != null)
		obj.avg_right_power_phase = formatArray(obj.avg_right_power_phase, 2);
	if (obj.avgRightPowerPhase != null)
		obj.avgRightPowerPhase = formatArray(obj.avgRightPowerPhase, 2);
	if (obj.avg_right_power_phase_peak != null)
		obj.avg_right_power_phase_peak = formatArray(
			obj.avg_right_power_phase_peak,
			2,
		);
	if (obj.avgRightPowerPhasePeak != null)
		obj.avgRightPowerPhasePeak = formatArray(obj.avgRightPowerPhasePeak, 2);
}

function patchTimestamps(obj) {
	if (obj.timestamp != null && typeof obj.timestamp === 'number')
		obj.timestamp = new Date(obj.timestamp * 1000).toString();
	if (obj.start_time != null && typeof obj.start_time === 'number')
		obj.start_time = new Date(obj.start_time * 1000).toString();
	if (obj.startTime != null && typeof obj.startTime === 'number')
		obj.startTime = new Date(obj.startTime * 1000).toString();
}

function patchDecimals(obj) {
	Object.keys(obj)
		.filter(
			(key) => typeof obj[key] === 'number' && !Number.isInteger(obj[key]),
		)
		.forEach((key) => {
			obj[key] = Number(obj[key]).toFixed(2);
		});
}
