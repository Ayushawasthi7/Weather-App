import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export const AirQualityCard = ({ aqiData, lang }) => {
  if (!aqiData) {
    return (
      <div className="glass-panel rounded-3xl p-6 border border-white/5 animate-pulse flex flex-col justify-center items-center h-48">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="h-10 w-48 bg-white/10 rounded" />
      </div>
    );
  }

  const { aqi, pm25, pm10, co, no2, o3 } = aqiData;

  // Determine AQI category & colors (using US EPA thresholds as standard)
  const getAqiDetails = (val) => {
    if (val <= 50) {
      return {
        label: getTranslation(lang, 'aqiGood'),
        colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        strokeColor: '#34d399',
        desc: lang === 'hi' ? 'हवा स्वच्छ है और स्वास्थ्य जोखिम बहुत कम है।' : 'Air quality is satisfactory, and air pollution poses little or no risk.',
        safe: true
      };
    } else if (val <= 100) {
      return {
        label: getTranslation(lang, 'aqiFair'),
        colorClass: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        strokeColor: '#facc15',
        desc: lang === 'hi' ? 'वायु गुणवत्ता स्वीकार्य है, संवेदनशील लोगों को सावधानी बरतनी चाहिए।' : 'Air quality is acceptable; however, sensitive groups may experience minor effects.',
        safe: true
      };
    } else if (val <= 150) {
      return {
        label: getTranslation(lang, 'aqiModerate'),
        colorClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
        strokeColor: '#fb923c',
        desc: lang === 'hi' ? 'संवेदनशील समूहों के लिए हवा अस्वस्थ है, खुली हवा में व्यायाम कम करें।' : 'Members of sensitive groups may experience health effects. Limit prolonged outdoor exposure.',
        safe: false
      };
    } else if (val <= 200) {
      return {
        label: getTranslation(lang, 'aqiPoor'),
        colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
        strokeColor: '#f87171',
        desc: lang === 'hi' ? 'हवा अस्वस्थ है, सभी को बाहरी गतिविधियों को सीमित करना चाहिए।' : 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
        safe: false
      };
    } else {
      return {
        label: getTranslation(lang, 'aqiVeryPoor'),
        colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        strokeColor: '#c084fc',
        desc: lang === 'hi' ? 'वायु गुणवत्ता खतरनाक है! तत्काल स्वास्थ्य चेतावनी जारी की जाती है।' : 'Health alert: everyone may experience more serious health effects. Avoid outdoor exertion.',
        safe: false
      };
    }
  };

  const details = getAqiDetails(aqi);

  // SVG circular gauge configuration
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Cap gauge visually at AQI 300
  const maxAqiGauge = 300;
  const strokeDashoffset = circumference - (Math.min(aqi, maxAqiGauge) / maxAqiGauge) * circumference;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-center">
      
      {/* Circular Gauge */}
      <div className="flex flex-col items-center gap-2.5">
        <h3 className="text-slate-300 font-semibold text-sm sm:text-base tracking-wide flex items-center gap-1.5 self-start md:self-auto">
          {getTranslation(lang, 'aqi')}
        </h3>
        
        <div className="relative flex items-center justify-center mt-2">
          {/* Gauge SVG */}
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background track circle */}
            <circle
              stroke="rgba(255, 255, 255, 0.05)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Value stroke circle */}
            <circle
              stroke={details.strokeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Text inside gauge */}
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-white block leading-none">{aqi}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">US AQI</span>
          </div>
        </div>

        {/* Warning Indicator Flag */}
        <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${details.colorClass}`}>
          {details.safe ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{details.label}</span>
        </div>
      </div>

      {/* Description and Pollutants Breakdown */}
      <div className="flex-1 flex flex-col justify-between w-full h-full gap-4">
        <div>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            {details.desc}
          </p>
        </div>

        {/* Pollutants Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-2">
          {/* PM2.5 */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block">{getTranslation(lang, 'pm25')}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-base font-extrabold text-white">{pm25.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-medium">µg/m³</span>
            </div>
            {/* Small status line */}
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${pm25 <= 12 ? 'bg-emerald-400' : pm25 <= 35.4 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min((pm25 / 75) * 100, 100)}%` }} />
            </div>
          </div>

          {/* PM10 */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block">{getTranslation(lang, 'pm10')}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-base font-extrabold text-white">{pm10.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-medium">µg/m³</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${pm10 <= 54 ? 'bg-emerald-400' : pm10 <= 154 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min((pm10 / 250) * 100, 100)}%` }} />
            </div>
          </div>

          {/* CO */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block">{getTranslation(lang, 'co')}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-base font-extrabold text-white">{(co / 1000).toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 font-medium">mg/m³</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${co <= 4400 ? 'bg-emerald-400' : co <= 9400 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min((co / 15000) * 100, 100)}%` }} />
            </div>
          </div>

          {/* NO2 */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block">{getTranslation(lang, 'no2')}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-base font-extrabold text-white">{no2.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-medium">µg/m³</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${no2 <= 53 ? 'bg-emerald-400' : no2 <= 100 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min((no2 / 200) * 100, 100)}%` }} />
            </div>
          </div>

          {/* O3 */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-bold block">{getTranslation(lang, 'o3')}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-base font-extrabold text-white">{o3.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-medium">µg/m³</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${o3 <= 54 ? 'bg-emerald-400' : o3 <= 70 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min((o3 / 120) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AirQualityCard;
