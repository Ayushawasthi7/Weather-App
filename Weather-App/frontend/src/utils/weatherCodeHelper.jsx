import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  HelpCircle
} from 'lucide-react';

/**
 * Maps WMO code to normalized categories: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'thunderstorm' | 'foggy'
 */
export const getWeatherCategory = (code) => {
  if (code === 0) return 'sunny';
  if ([1, 2].includes(code)) return 'mainly_sunny';
  if (code === 3) return 'cloudy';
  if ([45, 48].includes(code)) return 'foggy';
  if ([51, 53, 55, 56, 57, 80, 81, 82].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  return 'sunny'; // Fallback
};

/**
 * Returns appropriate styling gradients for each category
 */
export const getWeatherGradients = (code) => {
  const category = getWeatherCategory(code);
  switch (category) {
    case 'sunny':
      return 'from-amber-400 via-orange-500 to-rose-600';
    case 'mainly_sunny':
      return 'from-sky-400 via-amber-300 to-orange-400';
    case 'cloudy':
      return 'from-slate-500 via-blue-900 to-zinc-800';
    case 'foggy':
      return 'from-zinc-600 via-slate-700 to-slate-900';
    case 'drizzle':
      return 'from-blue-400 via-slate-600 to-indigo-900';
    case 'rainy':
      return 'from-blue-600 via-slate-800 to-cyan-900';
    case 'snowy':
      return 'from-indigo-300 via-sky-800 to-slate-900';
    case 'thunderstorm':
      return 'from-purple-950 via-slate-900 to-zinc-950';
    default:
      return 'from-sky-500 via-indigo-600 to-slate-900';
  }
};

/**
 * Returns the matching Lucide icon component
 */
export const getWeatherIcon = (code, className = "w-6 h-6") => {
  if (code === 0) return <Sun className={`${className} text-yellow-300 animate-spin-slow`} />;
  if ([1, 2].includes(code)) return <CloudSun className={`${className} text-amber-200`} />;
  if (code === 3) return <Cloud className={`${className} text-slate-300`} />;
  if ([45, 48].includes(code)) return <CloudFog className={`${className} text-zinc-400`} />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={`${className} text-blue-300`} />;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={`${className} text-blue-400`} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={`${className} text-sky-200`} />;
  if ([95, 96, 99].includes(code)) return <CloudLightning className={`${className} text-purple-400`} />;
  return <HelpCircle className={className} />;
};

/**
 * Maps WMO code to background style cards (glassmorphism overlay coloring)
 */
export const getGlassOverlayColor = (code) => {
  const category = getWeatherCategory(code);
  switch (category) {
    case 'sunny':
      return 'rgba(253, 224, 71, 0.08)'; // Sunny light gold tint
    case 'mainly_sunny':
      return 'rgba(244, 63, 94, 0.05)';
    case 'cloudy':
      return 'rgba(148, 163, 184, 0.08)'; // Slate
    case 'drizzle':
    case 'rainy':
      return 'rgba(59, 130, 246, 0.08)';  // Ocean blue tint
    case 'snowy':
      return 'rgba(255, 255, 255, 0.1)';   // Clean white glow
    case 'thunderstorm':
      return 'rgba(168, 85, 247, 0.08)';  // Electric purple tint
    default:
      return 'rgba(255, 255, 255, 0.05)';
  }
};

/**
 * Computes moon phase string based on decimal value (0 to 1)
 */
export const getMoonPhaseName = (val, lang = 'en') => {
  // val represents completion percentage of lunar cycle from 0 to 1
  // 0: New Moon, 0.25: First Quarter, 0.5: Full Moon, 0.75: Last Quarter
  const phasesEn = [
    "New Moon 🌑",
    "Waxing Crescent 🌒",
    "First Quarter 🌓",
    "Waxing Gibbous 🌔",
    "Full Moon 🌕",
    "Waning Gibbous 🌖",
    "Third Quarter 🌗",
    "Waning Crescent 🌘"
  ];
  const phasesHi = [
    "अमावस्या 🌑",
    "सफेद वर्धमान 🌒",
    "प्रथम तिमाही 🌓",
    "कुबड़ा चाँद 🌔",
    "पूर्णिमा 🌕",
    "घटता चाँद 🌖",
    "अंतिम तिमाही 🌗",
    "कृष्ण पक्ष वर्धमान 🌘"
  ];
  const phases = lang === 'hi' ? phasesHi : phasesEn;
  const idx = Math.min(Math.floor((val + 0.0625) * 8) % 8, 7);
  return phases[idx];
};
