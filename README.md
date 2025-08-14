# 🌦️ CaliWeather - A React Native Weather App

CaliWeather is a sleek, modern, and intuitive weather forecast application built with React Native and Expo. It provides real-time weather data, a 7-day forecast, and a dynamic, location-aware user experience. The app features a beautiful, blurred-glassmorphism interface that changes to reflect the current weather conditions.

### App Demo

![CaliWeather App Demo](./assets/demo/demo.gif)

---

## ✨ Features

-   **Dynamic UI**: A beautiful, immersive user interface with a blurred background that provides a modern, clean look.
-   **Current Weather**: Get instant access to the current temperature, weather conditions (e.g., "Partly Cloudy"), wind speed, humidity, and sunrise/sunset times.
-   **7-Day Forecast**: Plan your week ahead with a detailed 7-day forecast, including daily average temperatures, weather conditions, and dates.
-   **Location-Based Weather**:
    -   **Auto-Detection**: Automatically fetches weather data for your current physical location using the device's GPS.
    -   **City Search**: A powerful search functionality to find and view weather for any city in the world.
-   **Persistent State**: Your last searched location is saved locally, so the app always opens with relevant data for a seamless user experience.
-   **Over-the-Air Updates**: Seamlessly receive updates and new features without needing to reinstall the app from the app store.
-   **Loading & Empty States**: Smooth loading indicators and helpful messages guide the user during data fetching or when no location is selected.

---

## 📸 Screenshots

| Home Screen                                | 7-Day Forecast                               | Location Search                             | Side Menu                                  |
| :----------------------------------------- | :------------------------------------------- | :------------------------------------------ | :----------------------------------------- |
| ![Home Screen](./assets/demo/1.jpeg)       | ![7-Day Forecast](./assets/demo/2.jpeg)      | ![Location Search](./assets/demo/3.jpeg)    | ![Side Menu](./assets/demo/4.jpeg)         |

---

## 🛠️ Tech Stack & Tools

-   **Framework**: React Native with Expo
-   **Weather Data API**: OpenWeatherMap API
-   **Build & Updates**: Expo Application Services (EAS) for builds and OTA updates.
-   **Update Manifest Hosting**: GitHub Gist for hosting the OTA update manifest.
-   **Navigation**: Expo Router for file-based, native navigation.
-   **Styling**: NativeWind (Tailwind CSS for React Native).
-   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`).
-   **API Client**: Axios for making requests to the weather API.
-   **Icons**: Heroicons for crisp, modern iconography.
-   **Local Storage**: AsyncStorage for persisting the user's last-viewed city.
-   **Utilities**: Lodash (for debouncing search input).

---

## OTA Update Mechanism

This app implements **Over-the-Air (OTA)** updates using **Expo's EAS Update** service. This allows for instant bug fixes and feature rollouts without requiring users to download a new version from the app store.

The update manifest, which tells the app if a new version is available, is hosted on a public **GitHub Gist**. The app fetches this manifest on launch to check for new updates and downloads them in the background.