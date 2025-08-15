// app/(drawer)/update.tsx:
import * as Application from 'expo-application';
import { Button, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUpdate } from '../../context/UpdateContext';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Setting to null when not yet available for production or when sideloading/testing
// const APP_STORE_URL = null; // 'https://apps.apple.com/us/app/your-app/id1234567890';
// const PLAY_STORE_URL = null; // 'https://play.google.com/store/apps/details?id=com.yourapp.id';


export default function UpdateScreen() {

    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // const { updateAvailable, latestVersion } = useUpdate();
    const { updateAvailable, latestVersion, downloadUrl } = useUpdate();
    const currentVersion = Application.nativeApplicationVersion;

    // DEBUG LINE: Add this log to see what the component receives
    console.log('[UpdateScreen] Rendering with values:', JSON.stringify({ updateAvailable, latestVersion, downloadUrl }, null, 2));

    // Determine the correct update URL based on the OS
    // const updateUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

    // THIS IS THE EVENT HANDLER. IT ONLY CONTAINS LOGIC.
    const handleUpdate = () => {
        try {
            // Only try to open a link if the URL is valid
            if (downloadUrl) {
                Linking.openURL(downloadUrl);
            }
        }
        catch (error) {
            // warning for debugging, in case the URL is missing
            console.warn("Update button was pressed, but no downloadUrl is available.");
        }
    }

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                blurRadius={70}   //this applies a heavy Gaussian blur to it
                source={require('../../assets/images/bg.png')}
                className="absolute h-full w-full"
            />
            <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                // onPress={() => navigation.goBack()}
                style={[styles.backButton, { top: insets.top + 10 }]} // Position safely from the top
            >
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Update Information</Text>
            <Text style={styles.text}>Current Version: {currentVersion}</Text>
            <Text style={styles.text}>Latest Version: {latestVersion}</Text>
            {updateAvailable ? (
                <View>
                    <Text style={[styles.text, styles.updateText]}>An update is available!</Text>
                    <Button title="Update Now" onPress={handleUpdate} />
                </View>
            ) : (
                <Text style={styles.text}>You are using the latest version.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10, // Ensure it's on top
    },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: 'white' },
    text: { fontSize: 16, marginBottom: 10, color: 'white' },
    updateText: { color: 'white', fontWeight: 'bold' },
});