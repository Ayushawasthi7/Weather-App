import React, { useEffect, useState } from 'react';
import { getWeatherCategory } from '../utils/weatherCodeHelper';

export const WeatherBackground = ({ code }) => {
  const [elements, setElements] = useState([]);
  const category = getWeatherCategory(code);

  // Generate rain drops or snowflakes dynamically on code change
  useEffect(() => {
    if (category === 'rainy' || category === 'drizzle' || category === 'thunderstorm') {
      // Generate 40 raindrops with randomized offsets
      const drops = Array.from({ length: 40 }).map((_, idx) => ({
        id: idx,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${0.8 + Math.random() * 0.7}s`,
        opacity: 0.15 + Math.random() * 0.4,
        scale: 0.5 + Math.random() * 1
      }));
      setElements(drops);
    } else if (category === 'snowy') {
      // Generate 35 snowflakes with randomized offsets
      const flakes = Array.from({ length: 35 }).map((_, idx) => ({
        id: idx,
        left: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 5}px`,
        delay: `${Math.random() * 6}s`,
        duration: `${4 + Math.random() * 4}s`,
        opacity: 0.3 + Math.random() * 0.6
      }));
      setElements(flakes);
    } else {
      setElements([]);
    }
  }, [category]);

  // Compute ambient background gradient
  const getGradientStyles = () => {
    switch (category) {
      case 'sunny':
        return 'from-amber-900/60 via-orange-950/40 to-slate-950';
      case 'mainly_sunny':
        return 'from-sky-950/50 via-amber-950/30 to-slate-950';
      case 'cloudy':
        return 'from-slate-800/60 via-blue-950/40 to-slate-950';
      case 'foggy':
        return 'from-zinc-800/60 via-slate-900/50 to-slate-950';
      case 'drizzle':
        return 'from-sky-950/60 via-indigo-950/50 to-slate-950';
      case 'rainy':
        return 'from-blue-950/80 via-slate-900/60 to-slate-950';
      case 'snowy':
        return 'from-indigo-900/40 via-slate-900/60 to-slate-950';
      case 'thunderstorm':
        return 'from-purple-950/70 via-slate-950/80 to-zinc-950';
      default:
        return 'from-slate-950 via-indigo-950/30 to-slate-950';
    }
  };

  return (
    <div className={`fixed inset-0 -z-50 w-full h-full overflow-hidden bg-gradient-to-br ${getGradientStyles()} transition-colors duration-1000`}>
      {/* Lightning Flash (for thunderstorms only) */}
      {category === 'thunderstorm' && (
        <div className="absolute inset-0 bg-white/25 pointer-events-none animate-lightning-flash" />
      )}

      {/* Sun Light Glow Effects (for sunny and mainly clear days) */}
      {(category === 'sunny' || category === 'mainly_sunny') && (
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/0 blur-3xl animate-sun-glow pointer-events-none" />
      )}

      {/* Drifting Clouds (for cloudy, mainly_sunny, foggy, and rainy days) */}
      {['cloudy', 'mainly_sunny', 'foggy', 'drizzle', 'rainy'].includes(category) && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-80 h-32 rounded-full bg-slate-400/30 blur-2xl animate-cloud-drift" />
          <div className="absolute top-1/3 right-10 w-96 h-36 rounded-full bg-slate-500/25 blur-3xl animate-cloud-drift" style={{ animationDelay: '-15s' }} />
          {category === 'cloudy' && (
            <div className="absolute bottom-20 left-1/4 w-[500px] h-48 rounded-full bg-zinc-700/25 blur-3xl animate-cloud-drift" style={{ animationDelay: '-30s' }} />
          )}
        </div>
      )}

      {/* Falling Rain drops */}
      {(category === 'rainy' || category === 'drizzle' || category === 'thunderstorm') && (
        <div className="absolute inset-0 pointer-events-none">
          {elements.map((drop) => (
            <div
              key={drop.id}
              className="drop-item"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
                opacity: drop.opacity,
                transform: `scale(${drop.scale})`,
              }}
            />
          ))}
        </div>
      )}

      {/* Falling Snow flakes */}
      {category === 'snowy' && (
        <div className="absolute inset-0 pointer-events-none">
          {elements.map((flake) => (
            <div
              key={flake.id}
              className="snow-item"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                opacity: flake.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Grid overlay for a premium tech texture look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
};
export default WeatherBackground;
