//this is the enhanced version it can be used in all kinds of React Native projects that use AsyncStorage — whether storing strings, objects, user preferences, tokens, etc

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in AsyncStorage.
 * Automatically stringifies objects before saving.
 */
export const storeData = async (key, value) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
        console.error('Error storing data:', error);
    }
};

/**
 * Retrieve data from AsyncStorage.
 * Automatically parses JSON strings if possible.
 */
export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            try {
                return JSON.parse(value);
            } catch {
                return value; // Return raw string if it's not JSON
            }
        }
        return null;
    } catch (error) {
        console.error('Error retrieving data:', error);
    }
};

/**
 * Remove a key from AsyncStorage
 */
export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data:', error);
    }
};

/**
 * Clear all AsyncStorage data (use with caution)
 */
export const clearAllData = async () => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};


//note: AsyncStorage.setItem and getItem only store strings, so if you're storing objects, you must use JSON.stringify(value) and JSON.parse(value) when storing/retrieving.
