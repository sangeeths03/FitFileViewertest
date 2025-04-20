import { patchSummaryFields } from '../patchSummaryFields.js';

// Mock the imported formatDistance and formatDuration
jest.mock('./formatDistance.js', () => ({
    formatDistance: jest.fn((val) => `${val} m`)
}));
jest.mock('./formatDuration.js', () => ({
    formatDuration: jest.fn((val) => `${val} s`)
}));

describe('patchSummaryFields', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('formats distance fields', () => {
        const obj = { total_distance: 1234.56, totalDistance: 7890.12 };
        patchSummaryFields(obj);
        expect(obj.total_distance).toBe('1234.56 m');
        expect(obj.totalDistance).toBe('7890.12 m');
    });

    it('formats time fields', () => {
        const obj = {
            total_timer_time: 100,
            totalTimerTime: 200,
            total_elapsed_time: 300,
            totalElapsedTime: 400,
            duration: 500
        };
        patchSummaryFields(obj);
        expect(obj.total_timer_time).toBe('100 s');
        expect(obj.totalTimerTime).toBe('200 s');
        expect(obj.total_elapsed_time).toBe('300 s');
        expect(obj.totalElapsedTime).toBe('400 s');
        expect(obj.duration).toBe('500 s');
    });

    it('formats speed fields', () => {
        const obj = {
            avg_speed: 5,
            avgSpeed: 6,
            max_speed: 7,
            maxSpeed: 8,
            enhanced_avg_speed: 9,
            enhancedAvgSpeed: 10,
            enhanced_max_speed: 11,
            enhancedMaxSpeed: 12
        };
        patchSummaryFields(obj);
        expect(obj.avg_speed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.avgSpeed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.max_speed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.maxSpeed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.enhanced_avg_speed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.enhancedAvgSpeed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.enhanced_max_speed).toMatch(/km\/h \/ [\d.]+ mph/);
        expect(obj.enhancedMaxSpeed).toMatch(/km\/h \/ [\d.]+ mph/);
    });

    it('rounds power fields', () => {
        const obj = {
            avg_power: 123.7,
            avgPower: 234.2,
            max_power: 345.9,
            maxPower: 456.1,
            normalized_power: 567.5,
            normalizedPower: 678.8,
            threshold_power: 789.3,
            thresholdPower: 890.6
        };
        patchSummaryFields(obj);
        expect(obj.avg_power).toBe(124);
        expect(obj.avgPower).toBe(234);
        expect(obj.max_power).toBe(346);
        expect(obj.maxPower).toBe(456);
        expect(obj.normalized_power).toBe(568);
        expect(obj.normalizedPower).toBe(679);
        expect(obj.threshold_power).toBe(789);
        expect(obj.thresholdPower).toBe(891);
    });

    it('rounds calories fields', () => {
        const obj = { total_calories: 123.4, totalCalories: 456.6 };
        patchSummaryFields(obj);
        expect(obj.total_calories).toBe(123);
        expect(obj.totalCalories).toBe(457);
    });

    it('rounds heart rate fields', () => {
        const obj = {
            avg_heart_rate: 120.7,
            avgHeartRate: 130.2,
            max_heart_rate: 180.9,
            maxHeartRate: 190.1
        };
        patchSummaryFields(obj);
        expect(obj.avg_heart_rate).toBe(121);
        expect(obj.avgHeartRate).toBe(130);
        expect(obj.max_heart_rate).toBe(181);
        expect(obj.maxHeartRate).toBe(190);
    });

    it('rounds cadence fields', () => {
        const obj = {
            avg_cadence: 80.6,
            avgCadence: 81.2,
            max_cadence: 120.9,
            maxCadence: 121.1
        };
        patchSummaryFields(obj);
        expect(obj.avg_cadence).toBe(81);
        expect(obj.avgCadence).toBe(81);
        expect(obj.max_cadence).toBe(121);
        expect(obj.maxCadence).toBe(121);
    });

    it('formats respiration rate fields to 1 decimal', () => {
        const obj = {
            enhanced_avg_respiration_rate: 15.123,
            enhancedAvgRespirationRate: 16.456,
            enhanced_max_respiration_rate: 17.789,
            enhancedMaxRespirationRate: 18.987,
            enhanced_min_respiration_rate: 13.333,
            enhancedMinRespirationRate: 12.222
        };
        patchSummaryFields(obj);
        expect(obj.enhanced_avg_respiration_rate).toBe('15.1');
        expect(obj.enhancedAvgRespirationRate).toBe('16.5');
        expect(obj.enhanced_max_respiration_rate).toBe('17.8');
        expect(obj.enhancedMaxRespirationRate).toBe('19.0');
        expect(obj.enhanced_min_respiration_rate).toBe('13.3');
        expect(obj.enhancedMinRespirationRate).toBe('12.2');
    });

    it('formats temperature fields to 1 decimal', () => {
        const obj = {
            avg_temperature: 21.456,
            avgTemperature: 22.789,
            max_temperature: 30.123,
            maxTemperature: 31.987,
            min_temperature: 10.111,
            minTemperature: 11.999
        };
        patchSummaryFields(obj);
        expect(obj.avg_temperature).toBe('21.5');
        expect(obj.avgTemperature).toBe('22.8');
        expect(obj.max_temperature).toBe('30.1');
        expect(obj.maxTemperature).toBe('32.0');
        expect(obj.min_temperature).toBe('10.1');
        expect(obj.minTemperature).toBe('12.0');
    });

    it('formats grit and flow fields to 2 decimals', () => {
        const obj = {
            total_grit: 1.2345,
            totalGrit: 2.3456,
            avg_flow: 3.4567,
            avgFlow: 4.5678
        };
        patchSummaryFields(obj);
        expect(obj.total_grit).toBe('1.23');
        expect(obj.totalGrit).toBe('2.35');
        expect(obj.avg_flow).toBe('3.46');
        expect(obj.avgFlow).toBe('4.57');
    });

    it('formats training load fields', () => {
        const obj = {
            training_load_peak: 123.7,
            trainingLoadPeak: 234.2,
            training_stress_score: 56.789,
            trainingStressScore: 67.891,
            intensity_factor: 0.87654,
            intensityFactor: 0.98765,
            total_training_effect: 2.345,
            totalTrainingEffect: 3.456,
            total_anaerobic_training_effect: 1.234,
            totalAnaerobicTrainingEffect: 2.345
        };
        patchSummaryFields(obj);
        expect(obj.training_load_peak).toBe(124);
        expect(obj.trainingLoadPeak).toBe(234);
        expect(obj.training_stress_score).toBe('56.8');
        expect(obj.trainingStressScore).toBe('67.9');
        expect(obj.intensity_factor).toBe('0.877');
        expect(obj.intensityFactor).toBe('0.988');
        expect(obj.total_training_effect).toBe('2.3');
        expect(obj.totalTrainingEffect).toBe('3.5');
        expect(obj.total_anaerobic_training_effect).toBe('1.2');
        expect(obj.totalAnaerobicTrainingEffect).toBe('2.3');
    });

    it('rounds strokes fields', () => {
        const obj = { total_strokes: 123.4, totalStrokes: 456.6 };
        patchSummaryFields(obj);
        expect(obj.total_strokes).toBe(123);
        expect(obj.totalStrokes).toBe(457);
    });

    it('formats fractional cadence fields to 2 decimals', () => {
        const obj = {
            avg_fractional_cadence: 0.12345,
            avgFractionalCadence: 0.23456,
            max_fractional_cadence: 0.34567,
            maxFractionalCadence: 0.45678
        };
        patchSummaryFields(obj);
        expect(obj.avg_fractional_cadence).toBe('0.12');
        expect(obj.avgFractionalCadence).toBe('0.23');
        expect(obj.max_fractional_cadence).toBe('0.35');
        expect(obj.maxFractionalCadence).toBe('0.46');
    });

    it('formats torque and pedal fields to 1 decimal', () => {
        const obj = {
            avg_left_torque_effectiveness: 80.123,
            avgLeftTorqueEffectiveness: 81.456,
            avg_right_torque_effectiveness: 82.789,
            avgRightTorqueEffectiveness: 83.987,
            avg_left_pedal_smoothness: 84.333,
            avgLeftPedalSmoothness: 85.222,
            avg_right_pedal_smoothness: 86.111,
            avgRightPedalSmoothness: 87.999
        };
        patchSummaryFields(obj);
        expect(obj.avg_left_torque_effectiveness).toBe('80.1');
        expect(obj.avgLeftTorqueEffectiveness).toBe('81.5');
        expect(obj.avg_right_torque_effectiveness).toBe('82.8');
        expect(obj.avgRightTorqueEffectiveness).toBe('84.0');
        expect(obj.avg_left_pedal_smoothness).toBe('84.3');
        expect(obj.avgLeftPedalSmoothness).toBe('85.2');
        expect(obj.avg_right_pedal_smoothness).toBe('86.1');
        expect(obj.avgRightPedalSmoothness).toBe('88.0');
    });

    it('rounds PCO fields', () => {
        const obj = {
            avg_left_pco: 1.7,
            avgLeftPco: 2.2,
            avg_right_pco: 3.9,
            avgRightPco: 4.1
        };
        patchSummaryFields(obj);
        expect(obj.avg_left_pco).toBe(2);
        expect(obj.avgLeftPco).toBe(2);
        expect(obj.avg_right_pco).toBe(4);
        expect(obj.avgRightPco).toBe(4);
    });

    // patchArrays, patchTimestamps, patchDecimals are not fully implemented in the provided code,
    // so we skip those or add a placeholder test if needed.
});