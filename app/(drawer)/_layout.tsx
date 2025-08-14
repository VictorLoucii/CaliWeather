// app/(drawer)/_layout.tsx:
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { UpdateProvider } from '../../context/UpdateContext'; // Import provider and hook




export default function DrawerLayout() {

    // Wrap your Drawer with the provider and use the custom content
    return (
        <UpdateProvider>
            <Drawer
                // Use the imported component here:
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false, // Hides the default header
                    drawerStyle: {
                        backgroundColor: '#1E1E1E', // Dark background for the drawer
                        width: 240,
                    },
                }}
            >
                {/* Your screens are defined here. No changes needed inside. */}
                <Drawer.Screen name="index" />
                <Drawer.Screen name="update" />
            </Drawer>
        </UpdateProvider>
    );
}