import React, { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export const SmartAlerts = ({ currentData, aqiData, lang }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!currentData) return;

    const activeAlerts = [];
    const { temp, windSpeed, rainProbability, weatherCode } = currentData;

    // 1. Storm Warning
    if (windSpeed > 50) {
      activeAlerts.push({
        id: 'storm',
        type: 'warning',
        title: getTranslation(lang, 'stormWarning'),
        desc: lang === 'hi'
          ? `चेतावनी: हवा की गति ${Math.round(windSpeed)} किमी/घंटा है। कृपया बाहर सुरक्षित रहें।`
          : `High winds observed at ${Math.round(windSpeed)} km/h. Secure loose objects and avoid outdoor travel.`
      });
    }

    // 2. Heatwave Alert
    if (temp > 40) {
      activeAlerts.push({
        id: 'heatwave',
        type: 'danger',
        title: getTranslation(lang, 'heatwaveAlert'),
        desc: lang === 'hi'
          ? `लू (हीटवेव) की चेतावनी: तापमान ${Math.round(temp)}°C तक पहुँच गया है। हाइड्रेटेड रहें।`
          : `Dangerously high temperatures of ${Math.round(temp)}°C. Avoid sun exposure and stay hydrated.`
      });
    }

    // 3. Freeze Warning
    if (temp < 2) {
      activeAlerts.push({
        id: 'freeze',
        type: 'warning',
        title: getTranslation(lang, 'freezeAlert'),
        desc: lang === 'hi'
          ? `अत्यधिक ठंड की चेतावनी: तापमान ${Math.round(temp)}°C है। ठंड से बचने के उपाय करें।`
          : `Freezing warning. Temperatures are near freezing point (${Math.round(temp)}°C). Dress warmly.`
      });
    }

    // 4. Heavy Rain Alert
    if (rainProbability > 80 && [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
      activeAlerts.push({
        id: 'rain',
        type: 'info',
        title: getTranslation(lang, 'heavyRainAlert'),
        desc: lang === 'hi'
          ? `भारी वर्षा की चेतावनी: तेज वर्षा के साथ बौछारें पड़ने की ${rainProbability}% संभावना है।`
          : `Heavy rain forecast. High probability (${rainProbability}%) of continuous downpours.`
      });
    }

    // 5. Air Quality Warning
    if (aqiData && aqiData.aqi > 100) {
      activeAlerts.push({
        id: 'aqi',
        type: 'warning',
        title: getTranslation(lang, 'poorAqiAlert'),
        desc: lang === 'hi'
          ? `खराब हवा की गुणवत्ता: वायु गुणवत्ता सूचकांक (AQI) ${aqiData.aqi} है। मास्क पहनें।`
          : `Poor Air Quality Alert. AQI is at ${aqiData.aqi}. Sensitive groups should limit outdoor time.`
      });
    }

    setAlerts(activeAlerts);
  }, [currentData, aqiData, lang]);

  const getAlertClasses = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'info':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-300';
      default:
        return 'bg-white/5 border-white/10 text-slate-300';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
        <h3 className="text-white font-extrabold text-base sm:text-lg">
          {getTranslation(lang, 'smartAlerts')}
        </h3>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl">
          <Sparkles className="w-5 h-5 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">
            {getTranslation(lang, 'noAlerts')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${getAlertClasses(alert.type)}`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold leading-none">{alert.title}</h4>
                <p className="text-xs font-medium leading-relaxed mt-2">{alert.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SmartAlerts;
