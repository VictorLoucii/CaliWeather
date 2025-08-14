// app/(drawer)/index.tsx:

import { fetchLocations, fetchWeatherAndPollutionData } from '@/api/weather';
import { weatherImages } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useUpdate } from '@/context/UpdateContext';
import { getData, storeData } from '@/utils/asyncStorage.js';
import { convertPm25ToUsaAqi, getUsaAqiColor } from '@/utils/weatherAnalysis.js';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Link, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeScreen() {

  const [showSearch, toggleSearch] = useState(false);
  // const [locations, setLocations] = useState([1, 2, 3]);  //dummy array data for testing at start
  const [locations, setLocations] = useState([]);  //actual data array
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { updateAvailable } = useUpdate(); // Get the shared state from context


  const navigation = useNavigation(); // Hook to get access to navigation actions


  const handleLocation = async (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);

    // loc from OWM(open weather map) geocoding already has lat, lon, name, and country
    const { lat, lon, name, country } = loc;

    const data = await fetchWeatherAndPollutionData({ lat, lon });

    if (data) {
      // Add the location name and country to the final data object
      data.location = { name, country };
      setWeather(data);
      // Pass the raw object directly to storeData. It will handle the stringification.
      storeData('city', { name, lat, lon, country });
    }

    setLoading(false);
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value })
        .then(data => {
          // Only set locations if data is a valid array
          if (Array.isArray(data)) {
            setLocations(data);
          } else {
            setLocations([]);
          }
        })
        .catch(error => {
          console.error("Error in fetchLocations:", error);
          setLocations([]); // Clear previous results on error
        });
    }
  };


  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []); //note: only call the handleSearch after it's been defined, also [] → means the function will be created once and never re-created unless the component unmounts/remounts

  // const { current, location } = weather;  //destructuring

  const handleCurrentLocation = async () => {
    setLoading(true); // Spinner ON
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // If permission is denied, we can stop and show an alert.
        throw new Error('Permission to access location was denied');
      }

      const locationCoords = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationCoords.coords;

      // Use the new unified fetch function
      const data = await fetchWeatherAndPollutionData({ lat: latitude, lon: longitude });
      const geocodedAddress = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (data && geocodedAddress?.[0]) {
        const addr = geocodedAddress[0];
        const customLocationName = [addr.district, addr.city].filter(Boolean).join(', ');

        data.location = { name: customLocationName, country: addr.country };
        setWeather(data);
        // Pass the raw object directly to storeData:
        storeData('city', { name: customLocationName, lat: latitude, lon: longitude, country: addr.country });
      } else {
        // If the API calls return null or empty data, this is another failure case.
        throw new Error('Failed to fetch weather or address data.');
      }
    } catch (error) {
      // Log the error so you can see what went wrong in your console.
      console.error("An error occurred in handleCurrentLocation:", error);
      // Optionally, show an alert to the user.
      // alert('Could not fetch current location weather. Please try again.');
    } finally {
      // This will ALWAYS run, ensuring the spinner is turned off.
      setLoading(false); // Spinner OFF
    }
  };



  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true); // Spinner ON
      try {
        const storedCity = await getData('city');
        if (storedCity) {
          const data = await fetchWeatherAndPollutionData({ lat: storedCity.lat, lon: storedCity.lon });
          if (data) {
            data.location = { name: storedCity.name, country: storedCity.country };
            setWeather(data);
          } else {
            // If API fails for the stored city, throw an error to be caught
            throw new Error("Failed to fetch data for the stored city.");
          }
        }
      }
      // If there is no stored city, we do nothing and the finally block will turn off loading.
      catch (error) {
        // Log the error for debugging
        console.error("Error during initial data load:", error);
        // The app will show the "Search for a city" screen, which is correct behavior on error.
      } finally {
        // This ALWAYS runs, ensuring the spinner is turned off, even if there's no stored city.
        setLoading(false); // Spinner OFF
      }
    };

    loadInitialData();
  }, []); // The empty dependency array means this runs only once on mount.


  return (
    <View className='flex-1 relative'>
      <StatusBar style="light" />
      {/* Background Image */}
      <Image
        blurRadius={70}   //this applies a heavy Gaussian blur to it
        source={require('../../assets/images/bg.png')}
        className="absolute h-full w-full"
      />
      <SafeAreaView
        className='flex-1'
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >

        {/* search and drawer section */}
        <View
          style={{ height: '7%' }}
          className={`mx-4 relative z-50 mb-3 flex-row items-center ${showSearch ? 'justify-end' : 'justify-between'}`}>

          {/* DRAWER MENU ICON - Conditionally Rendered */}
          {!showSearch && (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              className="rounded-full p-3 align-center justify-center"
              style={{ backgroundColor: Colors.theme.bgWhite(0.3) }}
            >
              <Ionicons name="menu" size={25} color="white" />
            {/* THIS LOGIC NOW USES THE CONTEXT STATE */}
            {updateAvailable && (
                <View className="absolute right-2 top-2 bg-red-500 rounded-full w-4 h-4 justify-center items-center">
                  <Text className="text-white text-xs font-extrabold">!</Text>
                </View>
              )}
            </TouchableOpacity>
          )}




          {/* The Search Bar Itself (<View>) which contains text input field and the icon */}
          <View className="flex-row justify-end items-center rounded-full overflow-hidden"
            // By adding overflow-hidden to the parent container, we are enforcing its rounded-full shape onto all of its children. The sharp corners of the TextInput that were previously spilling out will now be clipped, revealing the beautiful rounded corners of your search bar.
            style={{ backgroundColor: showSearch ? Colors.theme.bgWhite(0.2) : 'transparent' }}
          >
            {/* conditional rendering of the search input field */}
            {
              showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder='enter the city name here'
                  placeholderTextColor={'lightgray'}
                  className='pl-6 h-10 flex-1 text-base text-white rounded-full'
                />
              ) : null
            }

            {/* search icon */}
            <TouchableOpacity
              onPress={() => toggleSearch(!showSearch)}
              style={{ backgroundColor: Colors.theme.bgWhite(0.3) }}
              className='rounded-full p-3 m-1'
            >
              <MagnifyingGlassIcon size={25} color={'white'} />
            </TouchableOpacity>
          </View>

          {/* below is 'search results' statements make it sibling of the search container otherwise it won't be visible due to native wind styling prop : oveflow-hidden */}
          {
            locations.length > 0 && showSearch ? (
              <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>

                {
                  locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : ''
                    return (
                      // Add prop 'key' to the TouchableOpacity for proper list rendering when using with map function
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={'flex-row items-center p-3 px-4 mb-1 ' + borderClass}
                      >
                        <MapPinIcon size={20} color={'gray'} />

                        <Text className='text-black text-lg ml-2'>
                          {loc?.name + ", " + loc?.country}
                        </Text>
                      </TouchableOpacity>

                    )
                  })

                }
              </View>

            ) : null
          }
        </View>
        {/* search section ends here */}

        <TouchableWithoutFeedback
          onPress={() => {
            toggleSearch(false); // Close the search bar
            Keyboard.dismiss();   // Dismiss the keyboard
          }}
          disabled={!showSearch} // Only enable this listener when search is active
        >
          {/* This wrapper View is necessary for the Touchable to cover the whole area */}
          <View className="flex-1">
            {
              loading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>

              ) : weather ? (
                //note: Use a React Fragment <> to wrap multiple components 

                <>
                  {/* forecast section */}
                  < View className='mx-4 justify-around mb-2'>

                    {/* location */}
                    <Text className='text-white text-center text-2xl font-bold'>
                      {weather?.location?.name + ", "}
                      <Text className='text-lg font-semibold text-gray-300'>
                        {weather?.location?.country}
                      </Text>
                    </Text>

                    {/* Clickable Weather Image and Details Button */}
                    <View className='flex-row justify-center'>
                      <Link href={{ pathname: "/details", params: { city: weather?.location?.name } }} asChild>
                        {/* This TouchableOpacity wraps both the image and the button, making them a single large touch target */}
                        <TouchableOpacity className="items-center">

                          {/* The Weather Image */}
                          <Image
                            source={weatherImages[weather?.current?.weather[0]?.main] || weatherImages['other']}
                            className='w-52 h-52'
                          />

                          {/* The "View Details" Button */}
                          <View
                            className='justify-center items-center rounded-full px-4 py-2 mt-4' // Using padding (py-2) and margin-top (mt-4)
                            style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}
                          >
                            <Text className="text-white text-base font-semibold">
                              View Details
                            </Text>
                          </View>

                        </TouchableOpacity>
                      </Link>
                    </View>

                    {/* Geolocation Icon, positioned absolutely */}
                    <TouchableOpacity
                      onPress={handleCurrentLocation}
                      className="absolute top-1/3 right-2 rounded-full p-1" // Position relative to the parent View
                      style={{ transform: [{ translateY: -15 },], backgroundColor: Colors.theme.bgWhite(0.3) }} // Fine-tune vertical centering

                    >
                      <MapPinIcon size={30} color={'white'} />
                    </TouchableOpacity>

                    {/* degreee/celsius/aqi data */}
                    <View className='space-y-2 mb-2 mx-4'>

                      {/* Wrapper to place Temperature and AQI side-by-side */}
                      <View className="flex-row justify-between items-end">
                        {/* Temperature */}
                        <Text className='text-center font-bold text-white text-6xl'>
                          {weather?.current?.temp?.toFixed(0)}&#176;
                        </Text>

                        {/*AQI Block, rendered only if data exists */}
                        {weather?.pollution?.list[0] && (
                          <View className="items-center">
                            <View className="flex-row items-end">
                              <Text className="text-white font-semibold text-lg text-center mr-2">AQI:</Text>
                              <Text
                                style={{
                                  color: getUsaAqiColor(convertPm25ToUsaAqi(weather.pollution.list[0].components.pm2_5)),
                                  fontWeight: 'bold',
                                  fontSize: 30,
                                  textAlign: 'center',
                                }}
                              >
                                {convertPm25ToUsaAqi(weather.pollution.list[0].components.pm2_5)}
                              </Text>
                            </View>
                            <Text className="text-white text-xs mt-1">
                              (PM2.5: {weather.pollution.list[0].components.pm2_5.toFixed(1)} µg/m³)
                            </Text>
                          </View>
                        )}

                      </View>

                      {/* Weather condition text remains below */}
                      <Text className='text-center text-white text-xl tracking-widest font-bold pt-2'>
                        {weather?.current?.weather[0]?.main}
                      </Text>
                    </View>

                    {/* other statistics (wind speed and humidity)*/}
                    <View className='flex-row justify-between mx-4 mt-1'>

                      <View className='flex-row space-x-2 items-center'>
                        <Image
                          source={require('../../assets/icons/wind.png')}
                          className='h-6 w-6'
                        />
                        <Text className='text-white font-semibold text-base ml-2'>
                          {(weather?.current?.wind_speed * 3.6).toFixed(1)} km/h
                        </Text>
                      </View>
                      <View className='flex-row space-x-2 items-center'>
                        <Image
                          source={require('../../assets/icons/humidity.png')}
                          className='h-6 w-6'
                        />
                        <Text className='text-white font-semibold text-base ml-2'>
                          {weather?.current?.humidity}%
                        </Text>
                      </View>
                    </View>

                    {/* other statistics (sunrise and sunset)*/}
                    <View className='flex-row justify-between mx-4'>

                      <View className='flex-row space-x-2 items-center'>
                        <Image
                          source={require('../../assets/icons/sunrise.png')}
                          className='h-10 w-10'
                        />
                        {/* Sunrise */}
                        <Text className='text-white font-semibold text-base ml-2'>
                          {new Date(weather?.current?.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </Text>
                      </View>
                      <View className='flex-row space-x-2 items-center'>
                        <Image
                          source={require('../../assets/icons/sunset-.png')}
                          className='h-10 w-10'
                        />
                        {/* Sunset */}
                        <Text className='text-white font-semibold text-base ml-2'>
                          {new Date(weather?.current?.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </Text>
                      </View>
                    </View>

                  </View>

                  {/* forecast section for future days */}
                  <View className='mb-2 space-y-3 mt-2'>
                    <View className='flex-row justify-center'>
                      <View
                        className='flex-row items-center mx-5 space-x-2 justify-center h-9 rounded-full px-4'
                        style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}
                      >
                        <CalendarDaysIcon size={22} color={'white'} />
                        <Text className='text-white text-base ml-2'>
                          Daily Forecast
                        </Text>
                      </View>

                    </View>

                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{
                        paddingHorizontal: 15,
                        marginTop: 20,
                      }}
                      showsHorizontalScrollIndicator={false}
                    >

                      {
                        weather?.daily?.slice(0, 7).map((item, index) => { // Use slice to show only 7 days
                          const date = new Date(item.dt * 1000);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                          const dayOfMonth = date.getDate();
                          const month = date.getMonth() + 1; // getMonth() is zero-based, so we add 1
                          const year = date.getFullYear();
                          const formattedDate = `${dayOfMonth}/${month}/${year}`;

                          return (
                            <View
                              key={index}
                              className='justify-center items-center w-28 rounded-3xl py-3 spacing-y-1 mr-4' style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}
                            >
                              <Image
                                source={weatherImages[item?.weather[0]?.main] || weatherImages['other']}
                                className='h-11 w-11'
                              />
                              <Text className='text-white'>
                                {dayName}
                              </Text>

                              {/* New Text component to display the date */}
                              <Text className='text-white text-xs'>
                                {formattedDate}
                              </Text>


                              <Text className='text-white text-xl font-semibold'>
                                {item?.temp?.day?.toFixed(0)}&#176;
                              </Text>
                            </View>
                          )
                        })
                      }

                    </ScrollView>

                  </View>
                </>
              ) : (
                // Welcome/Initial State View when no weather data is loaded:
                <View className="flex-1 justify-center items-center px-4">
                  <Text className="text-white text-center text-2xl font-semibold mb-6">
                    Search for a city or use your location to get started
                  </Text>

                  <TouchableOpacity
                    onPress={handleCurrentLocation}
                    className="p-4 rounded-full"
                    style={{ backgroundColor: Colors.theme.bgWhite(0.3) }}
                  >
                    <MapPinIcon size={45} color={'white'} />
                  </TouchableOpacity>
                </View>
              )
            }

          </View>


        </TouchableWithoutFeedback>




      </SafeAreaView >


    </View >

  );
}

