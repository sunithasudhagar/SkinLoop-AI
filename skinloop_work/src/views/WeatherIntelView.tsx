import React, { useState, useEffect } from 'react';
import { UserProfile, ShelfProduct } from '../types';
import {
  WeatherService,
  EnvironmentalData,
  SkincareEnvironmentalAdvice,
  PRESET_CITIES,
} from '../services/weather';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  ShieldAlert,
  Compass,
  RefreshCw,
  MapPin,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface WeatherIntelViewProps {
  profile: UserProfile;
  shelf: ShelfProduct[];
  onNavigate: (view: string) => void;
}

export const WeatherIntelView: React.FC<WeatherIntelViewProps> = ({
  profile,
  shelf,
  onNavigate,
}) => {
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [envData, setEnvData] = useState<EnvironmentalData | null>(() => WeatherService.getCachedData());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [advice, setAdvice] = useState<SkincareEnvironmentalAdvice | null>(() => {
    const cached = WeatherService.getCachedData();
    return cached ? WeatherService.generateSkincareAdvice(cached) : null;
  });

  const loadData = async (lat: number, lon: number, cityName: string, countryName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await WeatherService.fetchEnvironmentalData(lat, lon, cityName, countryName);
      setEnvData(data);
      setAdvice(WeatherService.generateSkincareAdvice(data));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch live environmental data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!envData) {
      loadData(selectedCity.lat, selectedCity.lon, selectedCity.name, selectedCity.country);
    }
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = PRESET_CITIES.find((c) => c.name === e.target.value) || PRESET_CITIES[0];
    setSelectedCity(chosen);
    loadData(chosen.lat, chosen.lon, chosen.name, chosen.country);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your current browser.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadData(pos.coords.latitude, pos.coords.longitude, 'Your Local Coordinates', 'GPS Detected');
      },
      (err) => {
        setIsLoading(false);
        setErrorMessage(`Location access was denied or timed out (${err.message}). Select a regional city instead.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
          <Wind className="w-3.5 h-3.5 text-rose-600" />
          <span>Real-Time Environmental Intelligence</span>
          <span>·</span>
          <span>Weather, UV & Pollution Adaptation</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Atmospheric Skincare Index
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Sync your daily skincare application with live UV radiation levels, ambient relative humidity, and air quality index (AQI) particulate matter.
        </p>
      </div>

      {/* City Selector & Geolocation Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
            <MapPin className="w-4 h-4 text-stone-800" />
            <span>Target Location:</span>
          </div>
          <select
            value={selectedCity.name}
            onChange={handleCityChange}
            className="p-2 text-xs border border-stone-200 rounded-lg bg-stone-50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-medium"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
          <button
            onClick={handleDetectLocation}
            className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Use My GPS</span>
          </button>
        </div>

        <button
          onClick={() =>
            loadData(selectedCity.lat, selectedCity.lon, selectedCity.name, selectedCity.country)
          }
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Sensor Data</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Environmental Service Notice:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Cached / Offline Alert Banner */}
      {envData && (envData.isCached || !envData.isLive) && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold">Cached Sensor Data:</span> Saved reading from {new Date(envData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Live environmental sensor feed is currently unreachable; showing last recorded data without fabrication.
          </div>
        </div>
      )}

      {/* 4 Core Environmental Reading Cards */}
      {envData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. UV Index */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                UV Radiation Index
              </span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-stone-900">
                {envData.uvIndex !== null ? envData.uvIndex : 'Unavailable'}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${
                  envData.uvIndex === null
                    ? 'bg-stone-100 text-stone-600'
                    : envData.uvIndex >= 8
                    ? 'bg-rose-100 text-rose-900'
                    : envData.uvIndex >= 6
                    ? 'bg-orange-100 text-orange-900'
                    : envData.uvIndex >= 3
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {envData.uvIndex === null
                  ? 'Unavailable'
                  : envData.uvIndex >= 8
                  ? 'Very High / Extreme'
                  : envData.uvIndex >= 6
                  ? 'High'
                  : envData.uvIndex >= 3
                  ? 'Moderate'
                  : 'Low'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {advice?.sunscreenAlert.spfRecommendation}
            </p>
          </div>

          {/* 2. Humidity */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Relative Humidity
              </span>
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-stone-900">
                {envData.humidityPct !== null ? `${envData.humidityPct}%` : 'Unavailable'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block bg-stone-100 text-stone-800">
                {envData.humidityPct === null
                  ? 'Unavailable'
                  : envData.humidityPct < 40
                  ? 'Dry Atmosphere'
                  : envData.humidityPct > 68
                  ? 'Humid / Muggy'
                  : 'Balanced Moisture'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {envData.humidityPct === null
                ? 'Atmospheric moisture reading unavailable'
                : envData.humidityPct < 40
                ? 'High transepidermal water loss risk'
                : 'Balanced ambient vapor pressure'}
            </p>
          </div>

          {/* 3. Air Quality Index (US EPA & Indian CPCB NAQI) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Air Quality Index (AQI)
              </span>
              <Wind className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-stone-900">
                  {envData.aqiUs !== null ? envData.aqiUs : 'Unavailable'}
                </span>
                <span className="text-xs text-stone-400 font-mono">US EPA</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {envData.aqiUs !== null ? (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      envData.aqiUs > 150
                        ? 'bg-rose-100 text-rose-900'
                        : envData.aqiUs > 100
                        ? 'bg-orange-100 text-orange-900'
                        : envData.aqiUs > 50
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    US: {envData.aqiUsCategory}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                    US AQI: Offline
                  </span>
                )}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200/60"
                  title="Central Pollution Control Board (CPCB) India National Air Quality Standard"
                >
                  CPCB: {envData.cpcbCategory}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              PM2.5: <strong>{envData.pm25 !== null ? `${envData.pm25} µg/m³` : 'Unavailable'}</strong> · PM10: <strong>{envData.pm10 !== null ? `${envData.pm10} µg/m³` : 'Unavailable'}</strong>
            </p>
          </div>

          {/* 4. Temperature & Sky */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Local Temperature
              </span>
              <CloudRain className="w-4 h-4 text-stone-500" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-stone-900">
                {envData.temperatureC !== null ? `${envData.temperatureC}°C` : 'Unavailable'}
              </div>
              <span className="text-[10px] font-medium text-stone-600 block mt-1 truncate">
                {envData.weatherDescription}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              {envData.city}
            </p>
          </div>
        </div>
      )}

      {/* Evidence-Based Daily Skincare Suggestions based on actual data */}
      {advice && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-0.5">
              <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Atmospheric Skincare Adaptation Strategy</span>
              </h2>
              <p className="text-xs text-stone-500">
                Formulated directly from retrieved meteorological readings for {envData?.city}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sunscreen Recommendation */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">
                    Photoprotection Protocol
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    Reapply ~{advice.sunscreenAlert.reapplicationIntervalHours} hrs
                  </span>
                </div>
                <h3 className="font-bold text-xs text-stone-900">
                  {advice.sunscreenAlert.spfRecommendation}
                </h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {advice.sunscreenAlert.guidance}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200/80">
                <button
                  onClick={() => onNavigate('sunscreen')}
                  className="text-stone-900 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Browse SPF 50+ Formulas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Moisture Formulation Suggestion */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                    Moisture & Texture Adaptation
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 capitalize">
                    {advice.moistureAlert.condition}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-stone-900">
                  {advice.moistureAlert.productRecommendation}
                </h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {advice.moistureAlert.formulationTip}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200/80">
                <button
                  onClick={() => onNavigate('shelf')}
                  className="text-stone-900 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Check My Shelf Moisturizers</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Pollution & Cleansing Strategy */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 uppercase text-[10px] tracking-wider">
                    Anti-Pollution & Cleansing
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 capitalize">
                    {advice.pollutionAlert.severity.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-stone-900">
                  PM Double Cleanse Protocol
                </h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {advice.pollutionAlert.cleansingGuidance}
                </p>
                <p className="text-stone-500 leading-relaxed text-[10px] pt-1">
                  <strong>Antioxidant defense: </strong>
                  {advice.pollutionAlert.antioxidantTip}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200/80">
                <button
                  onClick={() => onNavigate('routine')}
                  className="text-stone-900 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Review Evening Routine</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Data Provenance & Timestamp Transparency */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-400">
            <span>
              Source: <strong>{envData?.dataSource}</strong>
            </span>
            <span className="font-mono">
              Timestamp: {envData ? new Date(envData.timestamp).toLocaleTimeString() : 'N/A'} (
              {envData?.latitude.toFixed(2)}°, {envData?.longitude.toFixed(2)}°)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
