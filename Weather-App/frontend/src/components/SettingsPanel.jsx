import React from 'react';
import { X, Settings, Thermometer, Wind, Activity, Globe } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export const SettingsPanel = ({
  isOpen,
  onClose,
  lang,
  setLang,
  tempUnit,
  setTempUnit,
  windUnit,
  setWindUnit,
  pressureUnit,
  setPressureUnit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slider panel content */}
      <div className="relative w-full max-w-sm h-full bg-slate-900/90 border-l border-white/10 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-6 text-white transform transition-transform duration-300 ease-out z-10">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400 animate-spin-slow" />
            <h3 className="text-lg font-extrabold tracking-wide">{getTranslation(lang, 'settings')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Stack */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1 flex-1">
          
          {/* Temperature Unit */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              {getTranslation(lang, 'tempUnit')}
            </label>
            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setTempUnit('°C')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${tempUnit === '°C' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => setTempUnit('°F')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${tempUnit === '°F' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-400" />
              {getTranslation(lang, 'windUnit')}
            </label>
            <div className="grid grid-cols-3 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setWindUnit('km/h')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${windUnit === 'km/h' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                km/h
              </button>
              <button
                onClick={() => setWindUnit('mph')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${windUnit === 'mph' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                mph
              </button>
              <button
                onClick={() => setWindUnit('m/s')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${windUnit === 'm/s' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                m/s
              </button>
            </div>
          </div>

          {/* Pressure Unit */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              {getTranslation(lang, 'pressureUnit')}
            </label>
            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setPressureUnit('hPa')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${pressureUnit === 'hPa' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                hPa
              </button>
              <button
                onClick={() => setPressureUnit('inHg')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${pressureUnit === 'inHg' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                inHg
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              {getTranslation(lang, 'language')}
            </label>
            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setLang('en')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${lang === 'en' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${lang === 'hi' ? 'bg-sky-500/20 text-sky-400 border border-sky-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

        </div>

        {/* Footer Brand */}
        <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-500">
          <span>AeroSky Weather App v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
export default SettingsPanel;
