import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MapPin, Star, History, X } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { useSpeech } from '../hooks/useSpeech';

export const SearchBar = ({
  lang,
  onSelectCity,
  currentCity,
  favorites,
  onToggleFavorite,
  recentSearches,
  onClearRecent
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const { isListening, startVoiceSearch } = useSpeech();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch geocoding autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setErrorMsg('');
      try {
        const res = await fetch(
          `/api/search?name=${encodeURIComponent(query)}&lang=${lang}`
        );
        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query, lang]);

  // Handle selecting a city from suggestions
  const handleSelect = (city) => {
    onSelectCity({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country || '',
      countryCode: city.country_code || '',
      timezone: city.timezone || 'auto'
    });
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  // GPS Location Trigger
  const handleGPSLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg(getTranslation(lang, 'allowLocation'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using Open-Meteo or standard reverse geocode mock
          // Open-Meteo doesn't have a direct free reverse geocoding API, so we can
          // read coordinates and request weather directly, setting Name to "Current Position"
          onSelectCity({
            name: lang === 'hi' ? "मेरा स्थान" : "Current Location",
            latitude,
            longitude,
            country: '',
            timezone: 'auto'
          });
        } catch (err) {
          console.error("GPS Reverse lookup failed:", err);
        }
      },
      (err) => {
        console.warn("GPS access denied:", err);
        setErrorMsg(getTranslation(lang, 'allowLocation'));
      }
    );
  };

  // Voice Search triggers
  const handleVoiceSearch = () => {
    startVoiceSearch(
      lang,
      (result) => {
        setQuery(result);
        setShowDropdown(true);
      },
      (error) => {
        console.error(error);
        setErrorMsg(getTranslation(lang, 'voiceSearchError'));
      }
    );
  };

  const isFavorite = currentCity && favorites.some(f => f.name.toLowerCase() === currentCity.name.toLowerCase());

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Input Container */}
      <div className="relative w-full flex items-center gap-2" ref={dropdownRef}>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={getTranslation(lang, 'searchPlaceholder')}
            className="w-full h-14 pl-12 pr-24 rounded-2xl glass-panel text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-400/50 hover:bg-white/[0.08] transition-all text-base sm:text-lg shadow-lg"
          />
          <Search className="absolute left-4 top-4 w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />

          <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
            {/* Voice Search Button */}
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${isListening ? 'bg-rose-500/30 text-rose-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title={getTranslation(lang, 'voiceSearchActive')}
            >
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {/* GPS Locate button */}
            <button
              onClick={handleGPSLocation}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
              title={getTranslation(lang, 'locateMe')}
            >
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Favorite Bookmark Button */}
        {currentCity && (
          <button
            onClick={() => onToggleFavorite(currentCity)}
            className={`h-14 w-14 flex shrink-0 items-center justify-center rounded-2xl border transition-all hover:scale-105 active:scale-95 ${isFavorite ? 'bg-amber-500/20 border-amber-400/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'glass-panel border-white/10 text-slate-400 hover:text-white hover:bg-white/10 shadow-lg'}`}
            title={getTranslation(lang, 'favorites')}
          >
            <Star className={`w-6 h-6 ${isFavorite ? 'fill-amber-300' : ''}`} />
          </button>
        )}

        {/* Autocomplete Dropdown */}
        {showDropdown && (suggestions.length > 0 || isSearching) && (
          <div className="absolute top-16 left-0 right-0 z-50 glass-panel border border-white/10 rounded-2xl p-2 max-h-[50vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] scrollbar-hide">
            {isSearching ? (
              <div className="p-4 text-slate-400 text-sm animate-pulse text-center font-medium">
                {lang === 'hi' ? 'खोज रहे हैं...' : 'Searching...'}
              </div>
            ) : (
              suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.08] text-white text-base transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 group"
                >
                  <span className="truncate pr-4 flex-1">
                    <span className="font-semibold text-sky-100 group-hover:text-white transition-colors">{item.name}</span>
                    {item.admin1 && <span className="text-slate-400 text-sm hidden sm:inline-block">, {item.admin1}</span>}
                    {item.admin1 && <span className="text-slate-400 text-xs block sm:hidden">{item.admin1}</span>}
                  </span>
                  <span className="text-slate-400 text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-center">
                    {item.country}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Voice listening status indicator */}
      {isListening && (
        <div className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 self-start animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {getTranslation(lang, 'voiceSearchActive')}
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="text-rose-300 text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Favorites & Recent Searches Bar */}
      {(favorites.length > 0 || recentSearches.length > 0) && (
        <div className="flex flex-col gap-2.5">
          {/* Bookmarked Cities */}
          {favorites.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400/70 text-amber-400/70" />
                {getTranslation(lang, 'favorites')}:
              </span>
              {favorites.map((fav, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCity(fav)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-amber-500/10 border border-amber-400/20 text-amber-200 hover:bg-amber-500/20 transition-all font-medium"
                >
                  {fav.name}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-slate-400" />
                {getTranslation(lang, 'recentSearches')}:
              </span>
              {recentSearches.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCity(rec)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 transition-all"
                >
                  {rec.name}
                </button>
              ))}
              <button
                onClick={onClearRecent}
                className="text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors"
                title="Clear All History"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchBar;
