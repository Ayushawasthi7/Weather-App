import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Sunset,
  Sunrise,
  Eye,
  Activity,
  Waves,
  Moon,
  Info,
  Calendar,
  Sun
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { getMoonPhaseName } from '../utils/weatherCodeHelper';

export const WeatherMetrics = ({
  data,
  lang,
  tempUnit,
  windUnit,
  pressureUnit
}) => {
  if (!data) return null;

  const {
    feelsLike,
    humidity,
    windSpeed,
    windDirection,
    pressure,
    visibility,
    uvIndex,
    dewPoint,
    sunrise,
    sunset,
    moonPhase,
    latitude,
    longitude,
    timezone,
    country,
    lastUpdated
  } = data;

  // Conversion Helpers
  const formatTemp = (val) => {
    if (tempUnit === '°F') {
      return `${Math.round((val * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(val)}°C`;
  };

  const formatWind = (speedKmh) => {
    if (windUnit === 'mph') {
      return `${Math.round(speedKmh * 0.621371)} mph`;
    }
    if (windUnit === 'm/s') {
      return `${Math.round(speedKmh * 0.277778)} m/s`;
    }
    return `${Math.round(speedKmh)} km/h`;
  };

  const formatPressure = (hpaVal) => {
    if (pressureUnit === 'inHg') {
      return `${(hpaVal * 0.02953).toFixed(2)} inHg`;
    }
    return `${Math.round(hpaVal)} hPa`;
  };

  const formatVisibility = (valKm) => {
    // Open-Meteo gives visibility in meters or km. Let's assume input is in km.
    if (lang === 'hi') {
      return `${valKm} किमी`;
    }
    return `${valKm} km`;
  };

  // Helper to format Sunrise / Sunset ISO strings to readable local clock times
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  // UV index scale descriptions
  const getUvLevel = (uv) => {
    if (uv <= 2) return lang === 'hi' ? 'कम' : 'Low';
    if (uv <= 5) return lang === 'hi' ? 'मध्यम' : 'Moderate';
    if (uv <= 7) return lang === 'hi' ? 'उच्च' : 'High';
    if (uv <= 10) return lang === 'hi' ? 'बहुत उच्च' : 'Very High';
    return lang === 'hi' ? 'अत्यधिक' : 'Extreme';
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 3x3 Grid of weather metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {/* Feels Like Temp */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'feelsLike')}</span>
            <Thermometer className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatTemp(feelsLike)}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {lang === 'hi' ? 'शरीर द्वारा महसूस' : 'Temperature perceived by body'}
            </p>
          </div>
        </div>

        {/* Humidity */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'humidity')}</span>
            <Droplets className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{humidity}%</h3>
            {/* Simple visual indicator bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full" style={{ width: `${humidity}%` }} />
            </div>
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'windSpeed')}</span>
            <Wind className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatWind(windSpeed)}</h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" style={{ transform: `rotate(${windDirection}deg)` }} />
              <span>{windDirection}° ({lang === 'hi' ? 'दिशा' : 'dir'})</span>
            </div>
          </div>
        </div>

        {/* Air Pressure */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'pressure')}</span>
            <Activity className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatPressure(pressure)}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {pressure > 1013 ? (lang === 'hi' ? 'उच्च दाब' : 'High pressure') : (lang === 'hi' ? 'कम दाब' : 'Low/Normal pressure')}
            </p>
          </div>
        </div>

        {/* Visibility */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'visibility')}</span>
            <Eye className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatVisibility(visibility)}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {visibility > 8 ? (lang === 'hi' ? 'साफ दृश्यता' : 'Clear conditions') : (lang === 'hi' ? 'धुंधली स्थिति' : 'Foggy/hazy')}
            </p>
          </div>
        </div>

        {/* UV Index */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'uvIndex')}</span>
            <Sun className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{uvIndex}</h3>
            <div className="text-xs mt-1.5 flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full font-semibold ${uvIndex <= 2 ? 'bg-emerald-500/10 text-emerald-400' : uvIndex <= 5 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                {getUvLevel(uvIndex)}
              </span>
            </div>
          </div>
        </div>

        {/* Dew Point */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'dewPoint')}</span>
            <Waves className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatTemp(dewPoint)}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {lang === 'hi' ? 'ओस संघनन बिंदु' : 'Atmospheric condensation temp'}
            </p>
          </div>
        </div>

        {/* Moon Phase */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-medium">{getTranslation(lang, 'moonPhase')}</span>
            <Moon className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-lg sm:text-xl font-bold text-white">{getMoonPhaseName(moonPhase, lang)}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {lang === 'hi' ? 'मासिक चंद्र चक्र' : 'Monthly lunar cycle progress'}
            </p>
          </div>
        </div>

      </div>

      {/* Sunrise & Sunset Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-4.5 flex items-center justify-between hover:bg-white/10 transition-all border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-400/20 text-amber-400">
              <Sunrise className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">{getTranslation(lang, 'sunrise')}</p>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">{formatTime(sunrise)}</h4>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            {lang === 'hi' ? 'दिन की शुरुआत' : 'Daybreak'}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4.5 flex items-center justify-between hover:bg-white/10 transition-all border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-400/20 text-indigo-400">
              <Sunset className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">{getTranslation(lang, 'sunset')}</p>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">{formatTime(sunset)}</h4>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            {lang === 'hi' ? 'गोधूलि वेला' : 'Nightfall'}
          </div>
        </div>
      </div>

      {/* Info details footer card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 text-slate-400 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          <span>
            <strong>{getTranslation(lang, 'timezone')}:</strong> {timezone} ({country || 'N/A'})
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="block sm:inline">
            <strong>{getTranslation(lang, 'coordinates')}:</strong> {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 self-end sm:self-auto font-medium">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>
            {getTranslation(lang, 'lastUpdated')}: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
export default WeatherMetrics;
