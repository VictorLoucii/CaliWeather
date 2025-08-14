// constants/index.js

export const weatherImages = {
    // Main conditions from OpenWeatherMap
    'Clouds': require('../assets/images/cloud.png'),
    'Rain': require('../assets/images/heavyrain.png'),
    'Drizzle': require('../assets/images/moderaterain.png'),
    'Clear': require('../assets/images/sun.png'),
    'Snow': require('../assets/images/snow.png'),
    'Thunderstorm': require('../assets/images/heavyrain.png'),
    'Mist': require('../assets/images/mist.png'),
    'Smoke': require('../assets/images/smoke.png'),
    'Haze': require('../assets/images/haze.png'),
    'Fog': require('../assets/images/fog.png'),
    
    // Fallback image
    'other': require('../assets/images/moderaterain.png')
}

// The file index.js (or index.tsx) has a special purpose in JavaScript/TypeScript projects. When you create an index file inside a folder, you are essentially turning that entire folder into a single "module."
// The bundler (Metro) is specifically designed to know this rule:
// When you write import { ... } from '@/constants';, the bundler sees you're pointing to a directory.
// It then automatically looks inside that directory for a file named index.js (or .ts, .tsx, etc.).
// It then imports the exports from that index file.
// So, both of these lines do the exact same thing:
// // This works, but it's redundant.
// // You are explicitly telling the bundler to do what it would have done automatically.
// import { weatherImages } from '@/constants/index';

// // This is the standard, idiomatic, and cleaner way.
// // It treats the 'constants' folder itself as the module.
// import { weatherImages } from '@/constants';