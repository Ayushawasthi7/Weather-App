import React from 'react';
import { getWeatherIcon } from '../utils/weatherCodeHelper';
import { getTranslation } from '../utils/translations';
import { CloudRain, Sun } from 'lucide-react';

export const DailyForecast = ({ dailyData, lang, tempUnit }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-5 border border-white/5 animate-pulse h-96 flex flex-col gap-4 justify-between">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-10 bg-white/5 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  // Format Date to Day Name
  const formatDayName = (dateStr) => {
    try {
      const date = new Date(dateStr);
      // Custom localized day names
      const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
      
      const dayIndex = date.getDay();
      return lang === 'hi' ? daysHi[dayIndex] : daysEn[dayIndex];
    } catch {
      return '';
    }
  };

  const formatDateLabel = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatTemp = (val) => {
    if (tempUnit === '°F') {
      return `${Math.round((val * 9) / 5 + 32)}°`;
    }
    return `${Math.round(val)}°`;
  };

  // Get UV Index Badge Color
  const getUvColor = (uv) => {
    if (uv <= 2) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (uv <= 5) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4 h-full justify-between">
      <div>
        <h3 className="text-white font-extrabold text-base sm:text-lg">
          {getTranslation(lang, 'dailyForecast')}
        </h3>
        <p className="text-slate-400 text-xs mt-0.5">
          {lang === 'hi' ? 'अगले 7 दिनों का विस्तृत पूर्वानुमान' : 'Detailed weather projections for the week ahead'}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-2">
        {dailyData.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isToday ? 'bg-sky-500/10 border-sky-400/20 shadow-md' : 'bg-white/20 hover:bg-white/5 border-transparent'}`}
            >
              {/* Day & Date */}
              <div className="w-24 sm:w-28 flex flex-col items-start">
                <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-sky-400' : 'text-white'}`}>
                  {isToday ? (lang === 'hi' ? 'आज' : 'Today') : formatDayName(day.time)}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{formatDateLabel(day.time)}</span>
              </div>

              {/* Weather Icon and status */}
              <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2">
                {getWeatherIcon(day.weatherCode, "w-6 h-6")}
                <span className="hidden md:inline text-xs text-slate-300 font-semibold max-w-[120px] truncate">
                  {getTranslation(lang, 'weatherCodes')[day.weatherCode] || ''}
                </span>
              </div>

              {/* Rain Probability */}
              <div className="w-14 sm:w-16 flex items-center justify-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/5 px-2 py-0.5 rounded-lg border border-sky-500/10">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{day.rainProbability}%</span>
              </div>

              {/* UV index badge */}
              <div className="hidden sm:flex w-14 items-center justify-center">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getUvColor(day.uvIndex)}`}>
                  UV {Math.round(day.uvIndex)}
                </span>
              </div>

              {/* Temp Min / Max */}
              <div className="w-16 sm:w-20 text-right flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <span className="font-medium text-slate-400">{formatTemp(day.tempMin)}</span>
                <span className="text-slate-600">/</span>
                <span className="font-extrabold text-white">{formatTemp(day.tempMax)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DailyForecast;
