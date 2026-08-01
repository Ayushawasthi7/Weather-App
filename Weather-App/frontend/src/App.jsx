import React, { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, RefreshCw, AlertCircle, CloudOff } from 'lucide-react';
import { useWeather } from './hooks/useWeather';
import { useSpeech } from './hooks/useSpeech';
import { getTranslation } from './utils/translations';
import { getWeatherIcon, getWeatherGradients } from './utils/weatherCodeHelper';

import WeatherBackground from './components/WeatherBackground';
import SearchBar from './components/SearchBar';
import WeatherMetrics from './components/WeatherMetrics';
import AirQualityCard from './components/AirQualityCard';
import ForecastCharts from './components/ForecastCharts';
import DailyForecast from './components/DailyForecast';
import WeatherMap from './components/WeatherMap';
import SmartAlerts from './components/SmartAlerts';
import Recommendations from './components/Recommendations';
import SettingsPanel from './components/SettingsPanel';

// Default starter city (Mumbai)
const DEFAULT_CITY = {
  name: "Mumbai",
  latitude: 19.0760,
  longitude: 72.8777,
  country: "India",
  countryCode: "IN",
  timezone: "Asia/Kolkata"
};

export default function App() {
  // Settings States
  const [lang, setLang] = useState(() => localStorage.getItem('aerosky_lang') || 'en');
  const [tempUnit, setTempUnit] = useState(() => localStorage.getItem('aerosky_temp_unit') || '°C');
  const [windUnit, setWindUnit] = useState(() => localStorage.getItem('aerosky_wind_unit') || 'km/h');
  const [pressureUnit, setPressureUnit] = useState(() => localStorage.getItem('aerosky_pressure_unit') || 'hPa');
  
  // Search & Navigation States
  const [currentCity, setCurrentCity] = useState(() => {
    const saved = localStorage.getItem('aerosky_current_city');
    return saved ? JSON.parse(saved) : DEFAULT_CITY;
  });
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('aerosky_favs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('aerosky_recent');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Weather Custom Hook
  const { loading, error, weatherData, fetchWeatherData } = useWeather();

  // Speech Custom Hook
  const { isSpeaking, narrateWeather, stopSpeaking } = useSpeech();

  // Synchronize Settings with LocalStorage
  useEffect(() => {
    localStorage.setItem('aerosky_lang', lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem('aerosky_temp_unit', tempUnit);
  }, [tempUnit]);
  useEffect(() => {
    localStorage.setItem('aerosky_wind_unit', windUnit);
  }, [windUnit]);
  useEffect(() => {
    localStorage.setItem('aerosky_pressure_unit', pressureUnit);
  }, [pressureUnit]);
  useEffect(() => {
    localStorage.setItem('aerosky_current_city', JSON.stringify(currentCity));
  }, [currentCity]);
  useEffect(() => {
    localStorage.setItem('aerosky_favs', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('aerosky_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch Weather on Mount / City change
  useEffect(() => {
    if (currentCity) {
      fetchWeatherData(currentCity);
    }
  }, [currentCity, fetchWeatherData]);

  // Handle Voice Speak Toggles
  const handleSpeakToggle = () => {
    if (!weatherData) return;
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const summaryData = {
        city: currentCity.name,
        temp: Math.round(weatherData.current.temp),
        tempUnit,
        condition: getTranslation(lang, 'weatherCodes')[weatherData.current.weatherCode],
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        windUnit
      };
      narrateWeather(summaryData, lang);
    }
  };

  // Add/Remove City Bookmarks
  const handleToggleFavorite = (city) => {
    const exists = favorites.some(f => f.name.toLowerCase() === city.name.toLowerCase());
    if (exists) {
      setFavorites(favorites.filter(f => f.name.toLowerCase() !== city.name.toLowerCase()));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  // Select City from autocomplete / bookmarks
  const handleSelectCity = (city) => {
    setCurrentCity(city);
    stopSpeaking(); // stop any audio if running

    // Add to Recent searches
    const filtered = recentSearches.filter(r => r.name.toLowerCase() !== city.name.toLowerCase());
    const updated = [city, ...filtered].slice(0, 5); // limit to 5 searches
    setRecentSearches(updated);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto relative select-none">
      {/* Weather Background animation layers */}
      <WeatherBackground code={weatherData?.current?.weatherCode ?? 0} />

      {/* Top App Header & Controls */}
      <header className="w-full flex items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6 z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 tracking-tight leading-none">
            {getTranslation(lang, 'title')}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">
            {lang === 'hi' ? 'स्मार्ट और इमर्सिव' : 'Interactive Portals Engine'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio reader toggle button */}
          {weatherData && (
            <button
              onClick={handleSpeakToggle}
              className={`p-2.5 rounded-xl border transition-all ${isSpeaking ? 'bg-rose-500/25 border-rose-400/30 text-rose-300 animate-pulse' : 'glass-panel border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
              title={getTranslation(lang, 'toggleTextToSpeech')}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}

          {/* Settings Trigger Gear */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Settings Drawer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="w-full flex flex-col gap-6 z-10 flex-1">
        {/* Search Bar section */}
        <section className="w-full">
          <SearchBar
            lang={lang}
            onSelectCity={handleSelectCity}
            currentCity={currentCity}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            recentSearches={recentSearches}
            onClearRecent={handleClearRecent}
          />
        </section>

        {loading ? (
          /* LOADING SKELETON STATES */
          <div className="w-full flex flex-col gap-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 bg-white/5 rounded-3xl" />
              <div className="h-72 bg-white/5 rounded-3xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 bg-white/5 rounded-3xl" />
              <div className="h-80 bg-white/5 rounded-3xl" />
            </div>
            <div className="h-96 bg-white/5 rounded-3xl" />
          </div>
        ) : error ? (
          /* DETAILED ERROR PAGE */
          <div className="w-full flex flex-col items-center justify-center py-16 px-6 glass-panel rounded-3xl border border-rose-500/20 text-center gap-5">
            <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-400">
              <CloudOff className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {getTranslation(lang, 'cityNotFound')}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-md">
                {error}. Please check the internet connection or spelling.
              </p>
            </div>
            <button
              onClick={() => fetchWeatherData(currentCity)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-400/25 rounded-2xl text-sm font-bold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Load</span>
            </button>
          </div>
        ) : weatherData ? (
          /* ACTUAL LOADED DASHBOARD VIEW */
          <div className="w-full flex flex-col gap-6">
            
            {/* Top Section: Main Temperature Card + Air Quality Index */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary Weather Widget */}
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                
                {/* Visual Glow behind card */}
                <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-white/[0.01] blur-2xl pointer-events-none" />

                <div className="flex flex-col h-full justify-between gap-4 z-10">
                  <div>
                    {/* City details */}
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{currentCity.name}</h2>
                      {currentCity.country && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {currentCity.country}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                      {getTranslation(lang, 'weatherCodes')[weatherData.current.weatherCode]}
                    </p>
                  </div>

                  {/* High display temperature */}
                  <div className="flex items-baseline mt-2">
                    <h1 className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight">
                      {tempUnit === '°F'
                        ? `${Math.round((weatherData.current.temp * 9) / 5 + 32)}°`
                        : `${Math.round(weatherData.current.temp)}°`}
                    </h1>
                    <span className="text-3xl sm:text-4xl text-sky-400 font-extrabold ml-1">{tempUnit}</span>
                  </div>

                  {/* Speak Narrate weather banner */}
                  <button
                    onClick={handleSpeakToggle}
                    className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 transition-all rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                    <span>{getTranslation(lang, 'toggleTextToSpeech')}</span>
                  </button>
                </div>

                {/* Condition Icon Column */}
                <div className="flex flex-col items-center sm:items-end justify-between h-full z-10 self-stretch sm:self-auto gap-4">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                    {getWeatherIcon(weatherData.current.weatherCode, "w-16 h-16 sm:w-20 sm:h-20")}
                  </div>
                  
                  {/* Feels Like & High/Min */}
                  <div className="text-center sm:text-right">
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      {getTranslation(lang, 'feelsLike')}: <strong className="text-white">
                        {tempUnit === '°F'
                          ? `${Math.round((weatherData.current.feelsLike * 9) / 5 + 32)}°F`
                          : `${Math.round(weatherData.current.feelsLike)}°C`}
                      </strong>
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Min/Max:{' '}
                      <span className="text-slate-400 font-semibold">
                        {tempUnit === '°F'
                          ? `${Math.round((weatherData.daily[0].tempMin * 9) / 5 + 32)}°`
                          : `${Math.round(weatherData.daily[0].tempMin)}°`}
                      </span>{' '}
                      /{' '}
                      <span className="text-white font-extrabold">
                        {tempUnit === '°F'
                          ? `${Math.round((weatherData.daily[0].tempMax * 9) / 5 + 32)}°`
                          : `${Math.round(weatherData.daily[0].tempMax)}°`}
                      </span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Dynamic Air Quality Panel */}
              <div className="lg:col-span-1">
                <AirQualityCard aqiData={weatherData.aqi} lang={lang} />
              </div>

            </div>

            {/* Middle Section: Hourly Recharts + 7-Day Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ForecastCharts
                hourlyData={weatherData.hourly}
                lang={lang}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />
              <DailyForecast
                dailyData={weatherData.daily}
                lang={lang}
                tempUnit={tempUnit}
              />
            </div>

            {/* Weather Map Layer (Leaflet Map) */}
            <section className="w-full">
              <WeatherMap
                latitude={weatherData.current.latitude}
                longitude={weatherData.current.longitude}
                cityName={currentCity.name}
                temp={weatherData.current.temp}
                tempUnit={tempUnit}
                weatherCode={weatherData.current.weatherCode}
                lang={lang}
              />
            </section>

            {/* Bottom Grid: Metrics Cards, Alerts, Recommendations */}
            <section className="w-full flex flex-col gap-6">
              
              {/* Detailed Metrics Panel */}
              <WeatherMetrics
                data={weatherData.current}
                lang={lang}
                tempUnit={tempUnit}
                windUnit={windUnit}
                pressureUnit={pressureUnit}
              />

              {/* Alert banner warnings & Agricultural Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartAlerts currentData={weatherData.current} aqiData={weatherData.aqi} lang={lang} />
                <Recommendations currentData={weatherData.current} lang={lang} />
              </div>

            </section>

          </div>
        ) : null}
      </main>

      {/* Floating Settings Side Drawer Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        windUnit={windUnit}
        setWindUnit={setWindUnit}
        pressureUnit={pressureUnit}
        setPressureUnit={setPressureUnit}
      />
    </div>
  );
}
