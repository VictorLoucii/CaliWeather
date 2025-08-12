import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid'
import { useNavigation } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { useLocalSearchParams } from 'expo-router';
import { fetchWeatherAndPollutionData, fetchLocations } from '@/api/weather';
import { getTempExtremes, getMostHumid, getMostPolluted, getBestWorkoutTimes, getRainiestHour, getLeastPolluted, convertPm25ToUsaAqi } from '@/utils/weatherAnalysis'



// reusable component for displaying detail items
const DetailItem = ({ icon, title, value, time }) => (
  <View className="flex-row items-center justify-between p-4 rounded-xl mb-3" style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}>

    {/* Left Side we ensure it doesn't grow or shrink unnecessarily */}
    <View className="flex-row items-center flex-shrink">
      <Image source={icon} className="w-8 h-8 mr-3" />
      <Text className="text-white text-lg">{title}</Text>
    </View>

    {/* Right Side*/}
    <View className="items-end flex-1 ml-4">
      <Text className="text-white font-bold text-lg text-right">
        {/*text-right: Ensures the text stays aligned to the right, even when it wraps */}
        {value}
      </Text>
      {time && <Text className="text-gray-300">{new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</Text>}
    </View>

  </View>
);


const detailScreen = () => {

  const { city } = useLocalSearchParams();  // Get city for e.g: { city: 'New Delhi' }

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [weatherDetails, setWeatherDetails] = useState(null);

  useEffect(() => {
    if (city) {
      fetchWeatherDetails();
    }
  }, [city]);

  const fetchWeatherDetails = async () => {
    setLoading(true);
    // Geocode the city name to get lat/lon
    const locations = await fetchLocations({ cityName: city });
    if (locations && locations.length > 0) {
      const { lat, lon } = locations[0];
      //Fetch all data using lat/lon
      const data = await fetchWeatherAndPollutionData({ lat, lon });
      setWeatherDetails(data);
    }
    setLoading(false);
  };

  const processedData = useMemo(() => {
    if (!weatherDetails) return null;

    // MAP DATA STRUCTURE
    const hourlyWeather = weatherDetails.hourly;
    const hourlyPollution = weatherDetails.pollution.list;

    // We need to merge the weather and pollution hourly arrays
    const combinedHourlyData = hourlyWeather.map(weatherHour => {
      // Find the corresponding pollution data for this hour
      const pollutionHour = hourlyPollution.find(p => p.dt === weatherHour.dt);
      return {
        time: new Date(weatherHour.dt * 1000),
        temp_c: weatherHour.temp,
        humidity: weatherHour.humidity,
        chance_of_rain: (weatherHour.pop || 0) * 100, // 'pop' is probability of precipitation
        air_quality: {
          // OWM provides components, including pm2_5
          pm2_5: pollutionHour ? pollutionHour.components.pm2_5 : null
        }
      };
    });

    if (!combinedHourlyData) return null;

    return {
      extremes: getTempExtremes(combinedHourlyData),
      humid: getMostHumid(combinedHourlyData),
      polluted: getMostPolluted(combinedHourlyData), // This will now be consistent
      workout: getBestWorkoutTimes(combinedHourlyData),
      rainiest: getRainiestHour(combinedHourlyData),
      leastPolluted: getLeastPolluted(combinedHourlyData), // This too
    };
  }, [weatherDetails]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // HELPER FUNCTION for US AQI Categories 
  const getUsaAqiCategoryText = (aqi) => {
    const aqiValue = parseInt(aqi);
    if (aqiValue <= 50) return 'Good';
    if (aqiValue <= 100) return 'Moderate';
    if (aqiValue <= 150) return 'Unhealthy for Sensitive';
    if (aqiValue <= 200) return 'Unhealthy';
    if (aqiValue <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };


  return (
    <View className='flex-1 relative'>
      <StatusBar style="light" />
      {/* Background Image */}
      <Image
        blurRadius={70}   //this applies a heavy Gaussian blur to it
        source={require('../assets/images/bg.png')}
        className="absolute h-full w-full"
      />
      <SafeAreaView
        className='flex-1'
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >

        {/* Back Button */}
        <View className="px-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-full h-10 w-10 justify-center items-center"
            style={{ backgroundColor: Colors.theme.bgWhite(0.1) }}
          >
            <ArrowUturnLeftIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className='justify-center items-center px-4'>
          <Text className='text-white font-bold text-2xl text-center'>

            {/* First part of the string */}
            {"Today's weather details for:\n"}

            {/* The nested Text component applies the underline style only to the city */}
            <Text className='underline'>
              {city}
            </Text>
          </Text>

        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, marginTop: 15, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {processedData && (
            <>
              <DetailItem icon={require('../assets/icons/hot(1).png')} title="Hottest" value={`${processedData.extremes.hottest?.temp_c?.toFixed(0)}°C`} time={processedData.extremes.hottest?.time} />

              <DetailItem icon={require('../assets/icons/cold(1).png')} title="Coldest" value={`${processedData.extremes.coldest?.temp_c?.toFixed(0)}°C`} time={processedData.extremes.coldest?.time} />

              <DetailItem icon={require('../assets/icons/humidity.png')} title="Most Humid" value={`${processedData.humid?.humidity}%`} time={processedData.humid?.time} />

              <DetailItem
                icon={require('../assets/icons/rain.png')} // Make sure you have rain.png in your assets!
                title="Highest Rain Chance"
                value={`${processedData.rainiest?.chance_of_rain.toFixed(1)}%`}
                time={processedData.rainiest?.time}
              />

              <DetailItem
                icon={require('../assets/icons/healthy-life.png')}
                title="Best Air Quality"
                value={
                  processedData.leastPolluted?.air_quality?.pm2_5 ?
                    `${convertPm25ToUsaAqi(processedData.leastPolluted.air_quality.pm2_5)} - ${getUsaAqiCategoryText(convertPm25ToUsaAqi(processedData.leastPolluted.air_quality.pm2_5))}`
                    : 'N/A'
                }
                time={processedData.leastPolluted?.time}
              />

              <DetailItem
                icon={require('../assets/icons/factory.png')}
                title="Peak Pollution"
                value={
                  processedData.polluted?.air_quality?.pm2_5 ?
                    `${convertPm25ToUsaAqi(processedData.polluted.air_quality.pm2_5)} - ${getUsaAqiCategoryText(convertPm25ToUsaAqi(processedData.polluted.air_quality.pm2_5))}`
                    : 'N/A'
                }
                time={processedData.polluted?.time}
              />

              <Text className="text-white text-xl font-bold mt-5 mb-3 text-center mb-15">
                Best Workout Time
              </Text>

              <DetailItem icon={require('../assets/icons/sunrise.png')} title="Morning" value={`${processedData.workout.morning?.temp_c?.toFixed(0)}°C`} time={processedData.workout.morning?.time} />

              <DetailItem icon={require('../assets/icons/sunset-.png')} title="Evening" value={`${processedData.workout.evening?.temp_c?.toFixed(0)}°C`} time={processedData.workout.evening?.time} />

            </>
          )}
        </ScrollView>





      </SafeAreaView>


    </View>

  )
}

export default detailScreen

const styles = StyleSheet.create({})