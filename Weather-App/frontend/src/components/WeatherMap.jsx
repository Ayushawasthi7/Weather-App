import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTranslation } from '../utils/translations';
import { getWeatherIcon } from '../utils/weatherCodeHelper';
import { Navigation } from 'lucide-react';

// Custom Map View controller to handle dynamic panning
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 9, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
};

export const WeatherMap = ({ latitude, longitude, cityName, temp, tempUnit, weatherCode, lang }) => {
  const [radarTileUrl, setRadarTileUrl] = useState('');
  const position = [latitude || 20.5937, longitude || 78.9629]; // Default to India center

  // Fetch latest RainViewer radar tiles (No key required)
  useEffect(() => {
    const fetchRadarTime = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const host = data.host;
          // Get the latest timestamp object
          const latestRadar = data.radar.past[data.radar.past.length - 1];
          const tilePath = latestRadar.path;
          
          // Formulate tile url
          const url = `${host}${tilePath}/256/{z}/{x}/{y}/2/1_1.png`;
          setRadarTileUrl(url);
        }
      } catch (err) {
        console.warn("Could not fetch RainViewer radar details, falling back:", err);
        // Fallback to standard rainviewer path (approximated, or just don't load radar)
      }
    };

    fetchRadarTime();
  }, [latitude, longitude]);

  // Create a stunning custom glowing marker instead of default leaflet pin
  const customGlowIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex w-full h-full rounded-full bg-sky-400/30 animate-ping"></span>
        <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-sky-500 border border-white shadow-lg"></span>
      </div>
    `,
    className: 'custom-gps-glow-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-extrabold text-base sm:text-lg">
            {getTranslation(lang, 'weatherMap')}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {lang === 'hi' ? 'वास्तविक समय वर्षा रडार और स्थिति' : 'Real-time rainfall radar overlays & location details'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-3 py-1 rounded-xl text-xs font-semibold">
          <Navigation className="w-3.5 h-3.5" />
          <span>{cityName}</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-72 sm:h-96 relative rounded-2xl overflow-hidden border border-white/10 z-0">
        <MapContainer
          center={position}
          zoom={9}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          {/* Change map viewport dynamically */}
          <ChangeMapView center={position} />

          {/* CartoDB Sleek Dark Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* RainViewer Radar Overlay Layer */}
          {radarTileUrl && (
            <TileLayer
              attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
              url={radarTileUrl}
              opacity={0.65}
            />
          )}

          {/* Pin Marker on City center */}
          <Marker position={position} icon={customGlowIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="flex items-center gap-2.5 p-1">
                {getWeatherIcon(weatherCode, "w-6 h-6")}
                <div>
                  <h4 className="font-extrabold text-sm text-white leading-none">{cityName}</h4>
                  <p className="text-xs text-sky-400 mt-1 font-bold">
                    {Math.round(temp)}{tempUnit}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Map Legend */}
      {radarTileUrl && (
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 px-1 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-sky-500 opacity-60" />
            <span>{lang === 'hi' ? 'वर्षा रडार सक्रिय' : 'Rain radar active'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>{lang === 'hi' ? 'नीला / हरा: हल्की वर्षा' : 'Blue / Green: Light rain'}</span>
            <span className="text-slate-600">|</span>
            <span>{lang === 'hi' ? 'लाल: भारी वर्षा' : 'Red: Heavy rain'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default WeatherMap;
