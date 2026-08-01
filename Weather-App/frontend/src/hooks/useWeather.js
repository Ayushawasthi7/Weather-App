import { useState, useCallback } from 'react';

// Offline astronomical calculator for Moon Phase index (0 to 1)
const calculateMoonPhase = (dateStr) => {
  const date = new Date(dateStr);
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const diffDays = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.530588853;
  const phase = (diffDays / lunarCycle) % 1;
  return phase < 0 ? phase + 1 : phase;
};

export const useWeather = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeatherData = useCallback(async ({ latitude, longitude, name, country, timezone }) => {
    setLoading(true);
    setError(null);

    const lat = latitude.toFixed(4);
    const lon = longitude.longitude ? longitude.longitude.toFixed(4) : longitude.toFixed(4);
    const zone = timezone || 'auto';

    try {
      // Fetch combined details from our own backend proxy
      const proxyUrl = `/api/weather?lat=${lat}&lon=${lon}&timezone=${encodeURIComponent(zone)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Backend API failed to respond");

      const resData = await response.json();
      const forecastData = resData.forecast;
      const aqiData = resData.aqi;

      if (!forecastData) {
        throw new Error("Unable to read weather payload structure");
      }

      // Compile current values
      const current = {
        name,
        country: country || '',
        temp: forecastData.current.temperature_2m,
        feelsLike: forecastData.current.apparent_temperature,
        humidity: forecastData.current.relative_humidity_2m,
        windSpeed: forecastData.current.wind_speed_10m,
        windDirection: forecastData.current.wind_direction_10m,
        pressure: forecastData.current.pressure_msl,
        weatherCode: forecastData.current.weather_code,
        isDay: forecastData.current.is_day,

        // Take details from hourly index [0]
        rainProbability: forecastData.hourly.precipitation_probability[0] || 0,
        visibility: (forecastData.hourly.visibility[0] || 10000) / 1000, // convert m to km
        uvIndex: forecastData.hourly.uv_index[0] || 0,
        dewPoint: forecastData.hourly.dew_point_2m[0] || 0,

        sunrise: forecastData.daily.sunrise[0],
        sunset: forecastData.daily.sunset[0],
        moonPhase: calculateMoonPhase(new Date()),

        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        timezone: forecastData.timezone,
        lastUpdated: new Date().toISOString()
      };

      // Compile 24 Hourly records (taking the next 24 elements from forecast timestamps)
      const hourly = [];
      const currentHour = new Date().getHours();
      for (let i = currentHour; i < currentHour + 24; i++) {
        if (forecastData.hourly.time[i]) {
          hourly.push({
            time: forecastData.hourly.time[i],
            temp: forecastData.hourly.temperature_2m[i],
            apparentTemp: forecastData.hourly.apparent_temperature[i],
            rainProbability: forecastData.hourly.precipitation_probability[i],
            windSpeed: forecastData.hourly.wind_speed_10m[i],
            weatherCode: forecastData.hourly.weather_code[i]
          });
        }
      }

      // Compile 7 Daily records
      const daily = forecastData.daily.time.map((time, idx) => ({
        time,
        weatherCode: forecastData.daily.weather_code[idx],
        tempMax: forecastData.daily.temperature_2m_max[idx],
        tempMin: forecastData.daily.temperature_2m_min[idx],
        sunrise: forecastData.daily.sunrise[idx],
        sunset: forecastData.daily.sunset[idx],
        uvIndex: forecastData.daily.uv_index_max[idx],
        rainProbability: forecastData.daily.precipitation_probability_max[idx]
      }));

      setWeatherData({
        current,
        hourly,
        daily,
        aqi: aqiData
      });

    } catch (err) {
      console.error("useWeather hook error:", err);
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    weatherData,
    fetchWeatherData
  };
};
export default useWeather;
