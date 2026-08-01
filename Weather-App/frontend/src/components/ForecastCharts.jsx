import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { getTranslation } from '../utils/translations';
import { Thermometer, CloudRain, Wind } from 'lucide-react';

export const ForecastCharts = ({ hourlyData, lang, tempUnit, windUnit }) => {
  const [activeTab, setActiveTab] = useState('temp'); // 'temp' | 'rain' | 'wind'

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 border border-white/5 animate-pulse h-64 flex justify-center items-center">
        <div className="h-full w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  // Format data for chart
  const chartData = hourlyData.map(item => {
    // Convert temperature based on active tempUnit
    const displayTemp = tempUnit === '°F' ? Math.round((item.temp * 9) / 5 + 32) : Math.round(item.temp);
    const displayWind = windUnit === 'mph' ? Math.round(item.windSpeed * 0.621371) : windUnit === 'm/s' ? Math.round(item.windSpeed * 0.277778) : Math.round(item.windSpeed);

    // Format ISO string to readable clock time
    const timeLabel = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
      time: timeLabel,
      temp: displayTemp,
      rain: item.rainProbability,
      wind: displayWind
    };
  });

  // Dynamic axis and label values
  const getTabLabel = () => {
    if (activeTab === 'temp') return tempUnit;
    if (activeTab === 'rain') return '%';
    if (activeTab === 'wind') return windUnit;
    return '';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel-dark border border-white/10 rounded-xl p-3 text-xs shadow-xl">
          <p className="font-bold text-white mb-1.5">{data.time}</p>
          {activeTab === 'temp' && (
            <p className="text-amber-400 font-semibold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'तापमान' : 'Temperature'}: {data.temp}{tempUnit}</span>
            </p>
          )}
          {activeTab === 'rain' && (
            <p className="text-sky-400 font-semibold flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'बारिश की संभावना' : 'Rain Prob.'}: {data.rain}%</span>
            </p>
          )}
          {activeTab === 'wind' && (
            <p className="text-emerald-400 font-semibold flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'हवा की गति' : 'Wind Speed'}: {data.wind} {windUnit}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4">
      {/* Chart Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
        <div>
          <h3 className="text-white font-extrabold text-base sm:text-lg">
            {getTranslation(lang, 'hourlyForecast')}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {lang === 'hi' ? 'आगामी मौसम चक्र और बदलाव' : 'Weather trends for the upcoming cycle'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'temp' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'तापमान' : 'Temp'}</span>
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'rain' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'बारिश %' : 'Rain %'}</span>
          </button>
          <button
            onClick={() => setActiveTab('wind')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'wind' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'हवा' : 'Wind'}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temp' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} unit={getTabLabel()} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          ) : activeTab === 'rain' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} unit={getTabLabel()} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rain" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.4)" fontSize={10} tickLine={false} unit={` ${getTabLabel()}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="wind" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default ForecastCharts;
