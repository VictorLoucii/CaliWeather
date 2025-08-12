// api/weather.ts

import axios from 'axios';

const openWeatherApiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;


//OPENWEATHERMAP ENDPOINTS:

// Geocoding Endpoint: Converts a city name to latitude and longitude.
const geocodingEndpoint = (cityName) => `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${openWeatherApiKey}`;

//One Call API Endpoint: Gets all weather data (current, hourly, daily) using lat/lon.
const oneCallEndpoint = (lat, lon) => `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${openWeatherApiKey}`;

// Air Pollution Endpoint: Gets current and hourly forecasted AQI data.
const airPollutionEndpoint = (lat, lon) => `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;

// ENERIC API CALL FUNCTION
const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    };
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (e) {
        console.error('API call failed:', e);
        return null;
    }
};

// UNIFIED FETCH FUNCTIONS:

/**
 * Fetches location suggestions based on a city name.
 * This replaces the old fetchLocations.
 */
export const fetchLocations = (params) => {
    return apiCall(geocodingEndpoint(params.cityName));
};

/**
 * Fetches all weather and air quality data from OpenWeatherMap.
 * This is the main function that will replace almost everything else.
 * @param {{ lat: number, lon: number }} params - Requires latitude and longitude.
 */
export const fetchWeatherAndPollutionData = async (params) => {
    const { lat, lon } = params;
    if (!lat || !lon) {
        console.error("Latitude and Longitude are required for OpenWeatherMap calls.");
        return null;
    }

    // Make two parallel API calls to get both weather and pollution data
    try {
        const [weatherData, pollutionData] = await Promise.all([
            apiCall(oneCallEndpoint(lat, lon)),
            apiCall(airPollutionEndpoint(lat, lon))
        ]);

        if (weatherData && pollutionData) {
            // Combine the results into a single, convenient object
            return {
                ...weatherData, // Contains current, hourly, daily weather
                pollution: pollutionData // Contains current and forecast pollution
            };
        }
        return null;

    } catch(error) {
        console.error("Failed to fetch combined weather and pollution data", error);
        return null;
    }
};