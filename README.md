🌦️ CaliWeather - A React Native Weather App
<p align="center">
<img alt="Platform - Expo" src="https://img.shields.io/badge/platform-Expo-808080.svg?style=flat-square">


CaliWeather is a sleek, modern, and intuitive weather forecast application built with React Native and Expo. It provides real-time weather data, a 7-day forecast, and a dynamic, location-aware user experience. The app features a beautiful, blurred-glassmorphism interface that changes to reflect the current weather conditions.

✨ Features

Dynamic UI: A beautiful, immersive user interface with a blurred background that provides a modern, clean look.

Current Weather: Get instant access to the current temperature, weather conditions (e.g., "Partly Cloudy"), wind speed, humidity, and sunrise/sunset times.

7-Day Forecast: Plan your week ahead with a detailed 7-day forecast, including daily average temperatures, weather conditions, and dates.

Location-Based Weather:

Auto-Detection: Automatically fetches weather data for your current physical location using the device's GPS.

City Search: A powerful search functionality allows you to find and view weather for any city in the world.

Detailed Hourly Insights: (Coming Soon!) A dedicated screen to view detailed hourly forecasts, including:

Hottest and coldest times of the day.

Precipitation probability by the hour.

Recommendations for the best time to be outdoors.

Persistent State: Your last searched location is saved locally, so the app always opens with relevant data, providing a seamless user experience.

Loading & Empty States: Smooth loading indicators and helpful messages guide the user during data fetching or when no location is selected.

🛠️ Tech Stack & Tools

Framework: React Native with Expo

Navigation: Expo Router for file-based, native navigation.

Styling: NativeWind (Tailwind CSS for React Native) for rapid and consistent UI development.

State Management: React Hooks (useState, useEffect, useCallback).

API Client: Axios for making requests to the weather API.

Data API: WeatherAPI.com for all weather and location data.

Icons: Heroicons for crisp, modern iconography.

Local Storage: AsyncStorage for persisting the user's last-viewed city.

Utilities: Lodash (for debouncing search input).
