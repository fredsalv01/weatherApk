import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { debounce } from "lodash";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { fetchLocation, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../utils/asyncStorage";

const HomeScreen = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleSearch = async (text) => {
    if (text.length > 2) {
      const response = await fetchLocation({ cityName: text });
      setLocations(response);
    }
  };

  const handleLocation = async (location) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    const response = await fetchWeatherForecast({
      cityName: location.name,
      days: "7",
    });
    setWeather(response);
    setTimeout(() => {
      setLoading(false);
      storeData("city", location.name);
    }, 2200);
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = myCity ? myCity : "Chinandega";
    const response = await fetchWeatherForecast({
      cityName,
      days: "7",
    });
    setWeather(response);
    setTimeout(() => {
      setLoading(false);
    }, 2200);
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={80}
        source={require("../assets/images/bg.png")}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          {/* <Text className="absolute justify-center items-center text-white">
            Loading...
          </Text> */}
          <Progress.CircleSnail color="#0bb3b2" size={100} thickness={5} />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <View style={{ height: "7%" }} className="mx-4 relative z-50">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={"lightgray"}
                  className="pl-6 h-10 pb-1  flex-1 text-base text-white"
                  textAlign="left"
                />
              ) : null}
              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((location, index) => {
                  let showBorder = index + 1 !== locations.length;
                  let borderClass = showBorder
                    ? "border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(location)}
                      key={index}
                      className={
                        "flex-row items-center border-0 p-3 px-4 mb-1 " +
                        borderClass
                      }
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text className="text-black text-lg ml-2">
                        {location.name}, {location.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
            {/* weather image */}
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition.text]}
                className="h-52 w-52"
              />
            </View>
            {/* degree celcius */}
            <View className="space-y-2">
              <Text className="text-center text-white text-6xl font-bold ml-5 drop-shadow-lg shadow-white">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition.text}
              </Text>
            </View>
            {/* other stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}Km/h
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {/* sunrise */}
                  {weather?.forecast?.forecastday?.[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/* forecast for next days */}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-white text-base">Daily forecast</Text>
            </View>
            <ScrollView
              horizontal={true}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date
                  .toLocaleDateString("en-US", options)
                  .split(",")[0];

                return (
                  <View
                    key={index}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      className="h-11 w-11"
                    />
                    <Text className="text-white capitalize text-center">
                      {dayName}
                    </Text>
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default HomeScreen;
