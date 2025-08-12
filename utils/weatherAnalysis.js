
/**
 * Converts a raw PM2.5 concentration value to the US EPA's AQI.
 */
export const convertPm25ToUsaAqi = (pm25) => {
    const c = parseFloat(pm25);
    if (isNaN(c)) return null;

    const breakpoints = [
        { aqi: [0, 50],     pm: [0.0, 12.0] },
        { aqi: [51, 100],    pm: [12.1, 35.4] },
        { aqi: [101, 150],   pm: [35.5, 55.4] },
        { aqi: [151, 200],   pm: [55.5, 150.4] },
        { aqi: [201, 300],   pm: [150.5, 250.4] },
        { aqi: [301, 500],   pm: [250.5, 500.4] }
    ];

    const breakpoint = breakpoints.find(b => c >= b.pm[0] && c <= b.pm[1]);
    if (!breakpoint) return 301; 

    const [I_low, I_high] = breakpoint.aqi;
    const [C_low, C_high] = breakpoint.pm;

    return Math.round(((I_high - I_low) / (C_high - C_low)) * (c - C_low) + I_low);
};

/**
 * Finds the hour with the highest and lowest temperature.
 */
export const getTempExtremes = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return { hottest: null, coldest: null };
    const hottest = hourlyData.reduce((max, hour) => hour.temp_c > max.temp_c ? hour : max);
    const coldest = hourlyData.reduce((min, hour) => hour.temp_c < min.temp_c ? hour : min);
    return { hottest, coldest };
};

/**
 * Finds the hour with the highest humidity.
 */
export const getMostHumid = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return null;
    return hourlyData.reduce((max, hour) => hour.humidity > max.humidity ? hour : max);
};

/**
 * Finds the hour with the BEST air quality (lowest US AQI).
 */
export const getLeastPolluted = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return null;

    return hourlyData.reduce((minHour, currentHour) => {
        const minAqi = convertPm25ToUsaAqi(minHour.air_quality?.pm2_5);
        const currentAqi = convertPm25ToUsaAqi(currentHour.air_quality?.pm2_5);

        if (currentAqi !== null && (minAqi === null || currentAqi < minAqi)) {
            return currentHour;
        }
        return minHour;
    });
};

/**
 * Finds the hour with the WORST air quality (highest US AQI).
 */
export const getMostPolluted = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return null;
    
    return hourlyData.reduce((maxHour, currentHour) => {
        const maxAqi = convertPm25ToUsaAqi(maxHour.air_quality?.pm2_5);
        const currentAqi = convertPm25ToUsaAqi(currentHour.air_quality?.pm2_5);

        if (currentAqi !== null && (maxAqi === null || currentAqi > maxAqi)) {
            return currentHour;
        }
        return maxHour;
    });
};

/**
 * Finds the hour with the highest probability of rain.
 */
export const getRainiestHour = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return null;
    return hourlyData.reduce((max, hour) => (hour.chance_of_rain > max.chance_of_rain ? hour : max));
};

/**
 * Determines the best time for a workout in the morning and evening using US AQI.
 */
export const getBestWorkoutTimes = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) return { morning: null, evening: null };

    const scoreHour = (hour) => {
        let score = 0;
        const temp = hour.temp_c;
        const aqi = convertPm25ToUsaAqi(hour.air_quality?.pm2_5) || 201; // Use US AQI
        const rain = hour.chance_of_rain;

        if (temp > 15 && temp < 22) score += 3;
        else if (temp > 10 && temp < 28) score += 1;

        if (aqi <= 100) score += 3; // Ideal: Good or Moderate
        else if (aqi <= 150) score += 1; // Acceptable: Unhealthy for Sensitive

        if (rain < 25) score += 2;
        return { ...hour, score };
    };

    const morningHours = hourlyData.filter(h => new Date(h.time).getHours() >= 6 && new Date(h.time).getHours() <= 10).map(scoreHour);
    const eveningHours = hourlyData.filter(h => new Date(h.time).getHours() >= 17 && new Date(h.time).getHours() <= 20).map(scoreHour);

    const bestMorning = morningHours.length > 0 ? morningHours.reduce((max, hour) => hour.score > max.score ? hour : max) : null;
    const bestEvening = eveningHours.length > 0 ? eveningHours.reduce((max, hour) => hour.score > max.score ? hour : max) : null;

    return { morning: bestMorning, evening: bestEvening };
};

// These functions are kept for legacy or other potential uses, but are not used on the main screens.
// We also need convertUsaAqiToPm25 for the home screen.

/**
 * Converts a US AQI value back to an approximate raw PM2.5 concentration
 */
export const convertUsaAqiToPm25 = (aqius) => {
    const aqi = parseInt(aqius);
    if (isNaN(aqi)) return null;

    const breakpoints = [
        { aqi: [0, 50],     pm: [0.0, 12.0] },
        { aqi: [51, 100],    pm: [12.1, 35.4] },
        { aqi: [101, 150],   pm: [35.5, 55.4] },
        { aqi: [151, 200],   pm: [55.5, 150.4] },
        { aqi: [201, 300],   pm: [150.5, 250.4] },
        { aqi: [301, 500],   pm: [250.5, 500.4] }
    ];

    const breakpoint = breakpoints.find(b => aqi >= b.aqi[0] && aqi <= b.aqi[1]);
    if (!breakpoint) return null;

    const [I_low, I_high] = breakpoint.aqi;
    const [C_low, C_high] = breakpoint.pm;

    return ((aqi - I_low) * (C_high - C_low)) / (I_high - I_low) + C_low;
};

/**
 * Returns a color code based on the US EPA's AQI value.
 */
export const getUsaAqiColor = (aqi) => {
    const aqiValue = parseInt(aqi);
    if (aqiValue <= 50) return '#00E400';   // Good
    if (aqiValue <= 100) return '#FFFF00';  // Moderate
    if (aqiValue <= 150) return '#FF7E00';  // Unhealthy for Sensitive
    if (aqiValue <= 200) return '#FF0000';  // Unhealthy
    if (aqiValue <= 300) return '#8F3F97';  // Very Unhealthy
    return '#7E0023'; // Hazardous
};