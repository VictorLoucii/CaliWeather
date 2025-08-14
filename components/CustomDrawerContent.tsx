// components/CustomDrawerContent.tsx:
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, View } from 'react-native';
import { Colors } from '../constants/Colors'; // Make sure this path is correct
import { useUpdate } from '../context/UpdateContext'; // Make sure this path is correct

export default function CustomDrawerContent(props: any) {
    const { updateAvailable } = useUpdate(); // Get update status from context

    return (
        <DrawerContentScrollView {...props}>
            {/*can add a header or logo here if you want */}

            {/* Home screen link with badge */}
            <DrawerItem
                label={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Home</Text>
                        {updateAvailable && (
                            <View style={{
                                marginLeft: 10,
                                backgroundColor: 'red',
                                borderRadius: 10,
                                width: 20,
                                height: 20,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>!</Text>
                            </View>
                        )}
                    </View>
                )}
                onPress={() => props.navigation.navigate('index')}
                style={{ backgroundColor: Colors.theme.bgWhite(0.2), borderRadius: 20, marginHorizontal: 10, marginBottom: 10 }}
            />

            {/* Update screen link */}
            <DrawerItem
                label="Update"
                labelStyle={{ color: '#ccc' }}
                onPress={() => props.navigation.navigate('update')}
                style={{ marginHorizontal: 10 }}
            />

            {/* Add other drawer items here */}
        </DrawerContentScrollView>
    );
}