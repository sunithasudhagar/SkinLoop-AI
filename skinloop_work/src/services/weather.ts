export interface EnvironmentalData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperatureC: number | null;
  humidityPct: number | null;
  uvIndex: number | null;
  aqiUs: number | null;
  aqiUsCategory: 'Good' | 'Moderate' | 'Unhealthy (Sens.)' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unavailable';
  aqiStandard: string;
  cpcbCategory: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Unavailable';
  pm25: number | null;
  pm10: number | null;
  weatherDescription: string;
  timestamp: string;
  dataSource: string;
  isLive: boolean;
  isCached: boolean;
}

export interface SkincareEnvironmentalAdvice {
  sunscreenAlert: {
    level: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
    spfRecommendation: string;
    reapplicationIntervalHours: number;
    guidance: string;
  };
  moistureAlert: {
    condition: 'dry' | 'balanced' | 'humid';
    formulationTip: string;
    productRecommendation: string;
  };
  pollutionAlert: {
    severity: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'hazardous';
    cleansingGuidance: string;
    antioxidantTip: string;
  };
}

export const PRESET_CITIES = [
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
];

export class WeatherService {
  private static readonly STORAGE_KEY = 'skinloop_cached_environmental_data';

  public static async fetchEnvironmentalData(
    lat: number,
    lon: number,
    cityName?: string,
    countryName?: string
  ): Promise<EnvironmentalData> {
    try {
      // 1. Fetch live meteorological & UV index data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index,weather_code&timezone=auto`;
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10&timezone=auto`;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl, { signal: AbortSignal.timeout(8000) }),
        fetch(airQualityUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null),
      ]);

      if (!weatherRes.ok) {
        throw new Error(`Weather service returned HTTP ${weatherRes.status}`);
      }

      const weatherJson = await weatherRes.json();
      const aqiJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

      const currentW = weatherJson.current || {};
      const currentA = aqiJson?.current || {};

      const weatherCode = currentW.weather_code ?? 0;
      const weatherDescription = this.decodeWeatherCode(weatherCode);

      // Real live readings - NEVER fabricate defaults when missing
      const pm25Val = typeof currentA.pm2_5 === 'number' ? Number(currentA.pm2_5.toFixed(1)) : null;
      const pm10Val = typeof currentA.pm10 === 'number' ? Number(currentA.pm10.toFixed(1)) : null;
      const aqiUsVal = typeof currentA.us_aqi === 'number' ? Math.round(currentA.us_aqi) : null;

      const temperatureC = typeof currentW.temperature_2m === 'number' ? Math.round(currentW.temperature_2m) : null;
      const humidityPct = typeof currentW.relative_humidity_2m === 'number' ? Math.round(currentW.relative_humidity_2m) : null;
      const uvIndex = typeof currentW.uv_index === 'number' ? Number(currentW.uv_index.toFixed(1)) : null;

      const cpcbCat = WeatherService.computeCpcbCategory(pm25Val, pm10Val);
      const aqiUsCat = WeatherService.computeAqiUsCategory(aqiUsVal);

      const result: EnvironmentalData = {
        city: cityName || 'Detected Location',
        country: countryName || '',
        latitude: lat,
        longitude: lon,
        temperatureC,
        humidityPct,
        uvIndex,
        aqiUs: aqiUsVal,
        aqiUsCategory: aqiUsCat,
        aqiStandard: 'US EPA AQI & Indian CPCB NAQI Standard',
        cpcbCategory: cpcbCat,
        pm25: pm25Val,
        pm10: pm10Val,
        weatherDescription,
        timestamp: new Date().toISOString(),
        dataSource: 'Open-Meteo Environmental Intelligence (Real-Time Sensor Feed)',
        isLive: true,
        isCached: false,
      };

      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(result));
      } catch {
        // localStorage error fallback
      }

      return result;
    } catch (err: any) {
      console.warn('Live environmental fetch error, checking cache:', err.message);
      const cached = this.getCachedData();
      if (cached) {
        // Enforce cache freshness: Never present stale cached data older than 2 hours as valid current data
        const ageHours = (Date.now() - new Date(cached.timestamp).getTime()) / (1000 * 60 * 60);
        if (ageHours > 2) {
          throw new Error('Live environmental feed unreachable. Cached readings are older than 2 hours and have expired.');
        }
        // Explicitly declare that this is cached/offline data and NOT live
        return {
          ...cached,
          isLive: false,
          isCached: true,
          dataSource: `Cached Atmospheric Reading (${new Date(cached.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) — Live Sensor Offline`,
        };
      }
      throw new Error(`Unable to retrieve live environmental intelligence: ${err.message}`);
    }
  }

  public static computeAqiUsCategory(
    aqi: number | null
  ): 'Good' | 'Moderate' | 'Unhealthy (Sens.)' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unavailable' {
    if (aqi === null || aqi === undefined) return 'Unavailable';
    if (aqi > 300) return 'Hazardous';
    if (aqi > 200) return 'Very Unhealthy';
    if (aqi > 150) return 'Unhealthy';
    if (aqi > 100) return 'Unhealthy (Sens.)';
    if (aqi > 50) return 'Moderate';
    return 'Good';
  }

  public static computeCpcbCategory(
    pm25: number | null,
    pm10: number | null
  ): 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Unavailable' {
    if (pm25 === null && pm10 === null) return 'Unavailable';
    const p25 = pm25 ?? 0;
    const p10 = pm10 ?? 0;
    // Official Central Pollution Control Board (CPCB) NAQI Breakpoints
    // PM2.5 (µg/m³): 0-30 Good, 31-60 Satisfactory, 61-90 Moderate, 91-120 Poor, 121-250 Very Poor, >250 Severe
    // PM10  (µg/m³): 0-50 Good, 51-100 Satisfactory, 101-250 Moderate, 251-350 Poor, 351-430 Very Poor, >430 Severe
    if (p25 > 250 || p10 > 430) return 'Severe';
    if (p25 > 120 || p10 > 350) return 'Very Poor';
    if (p25 > 90 || p10 > 250) return 'Poor';
    if (p25 > 60 || p10 > 100) return 'Moderate';
    if (p25 > 30 || p10 > 50) return 'Satisfactory';
    return 'Good';
  }

  public static getCachedData(): EnvironmentalData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static generateSkincareAdvice(data: EnvironmentalData): SkincareEnvironmentalAdvice {
    // 1. Sunscreen / UV Analysis
    let uvLevel: SkincareEnvironmentalAdvice['sunscreenAlert']['level'] = 'low';
    let spfRec = 'SPF 30+ Daily Defense';
    let interval = 4;
    let uvGuidance = 'Low ambient UV radiation. Standard morning sunscreen application protects against baseline photoaging.';

    if (data.uvIndex === null || data.uvIndex === undefined) {
      uvLevel = 'moderate';
      spfRec = 'SPF 50+ Broad Spectrum Photoprotection';
      interval = 3;
      uvGuidance = 'Live UV index currently unavailable for this location. Standard dermatological practice recommends broad-spectrum SPF 50+ as baseline daytime protection.';
    } else if (data.uvIndex >= 11) {
      uvLevel = 'extreme';
      spfRec = 'SPF 50+ PA++++ Broad Spectrum Required';
      interval = 2;
      uvGuidance = 'Extreme UV hazard. Unprotected skin can sustain cellular oxidative damage within 15 minutes. Reapply every 2 hours and avoid midday direct sun.';
    } else if (data.uvIndex >= 8) {
      uvLevel = 'very_high';
      spfRec = 'SPF 50+ PA++++ High Photoprotection';
      interval = 2;
      uvGuidance = 'Very high UV index. Wear 2 finger-lengths of broad-spectrum SPF 50+, wide-brim hat, and UV sunglasses.';
    } else if (data.uvIndex >= 6) {
      uvLevel = 'high';
      spfRec = 'SPF 50+ Broad Spectrum Photoprotection';
      interval = 2.5;
      uvGuidance = 'High UV level. Sun protection is essential outdoors. Reapply every 2 to 3 hours, especially when sweating.';
    } else if (data.uvIndex >= 3) {
      uvLevel = 'moderate';
      spfRec = 'SPF 50+ or SPF 40+ Daily Protective Shield';
      interval = 3;
      uvGuidance = 'Moderate UV radiation. Apply sunscreen 15 minutes before stepping out. Reapply if outdoors beyond 3 hours.';
    }

    // 2. Humidity / Barrier Moisture Analysis
    let condition: SkincareEnvironmentalAdvice['moistureAlert']['condition'] = 'balanced';
    let formTip = 'Normal humectant layering with lightweight moisturizer maintains healthy water content.';
    let prodTip = 'Lightweight gel-lotion or squalane cream.';

    if (data.humidityPct === null || data.humidityPct === undefined) {
      condition = 'balanced';
      formTip = 'Ambient humidity reading unavailable. Maintain balanced humectant and barrier moisturizer routine.';
      prodTip = 'Standard barrier moisturizer & daytime SPF.';
    } else if (data.humidityPct < 40) {
      condition = 'dry';
      formTip = `Low ambient humidity (${data.humidityPct}%) accelerates transepidermal water loss. Apply hydrating serums onto damp skin and seal immediately with a ceramide-rich barrier cushion.`;
      prodTip = 'Multi-molecular Hyaluronic acid + Ceramide NP barrier cream.';
    } else if (data.humidityPct > 68) {
      condition = 'humid';
      formTip = `High ambient humidity (${data.humidityPct}%) increases sweat and sebum production. Switch to an oil-free, non-comedogenic water gel to prevent congested pores.`;
      prodTip = 'Oil-free water jelly moisturizer & invisible gel sunscreen.';
    }

    // 3. Pollution / AQI Analysis
    let severity: SkincareEnvironmentalAdvice['pollutionAlert']['severity'] = 'good';
    let cleansing = 'Gentle single cleanse in the evening is sufficient to remove daily debris.';
    let antioxidant = 'Baseline hydration supports the skin barrier against ambient particulate matter.';

    if (data.aqiUs !== null && data.aqiUs !== undefined) {
      if (data.aqiUs > 150) {
        severity = 'unhealthy';
        cleansing = 'Double cleanse thoroughly this evening (oil-based balm followed by amino acid foaming wash) to dissolve micro-particulate soot and PM2.5 adhered to sebum.';
        antioxidant = 'Apply potent topical antioxidants (Centella, Niacinamide, or Vitamin E) before daytime moisturizer to neutralize airborne free-radical oxidation.';
      } else if (data.aqiUs > 100) {
        severity = 'unhealthy_sensitive';
        cleansing = 'Elevated air particulates. Make sure to cleanse your face thoroughly at the end of the day to avoid micro-inflammatory pore clogging.';
        antioxidant = 'Incorporate barrier-strengthening antioxidants (Silymarin, Ferulic, or Niacinamide).';
      } else if (data.aqiUs > 50) {
        severity = 'moderate';
        cleansing = 'Standard evening cleansing clears atmospheric dust without disrupting skin acid mantle.';
        antioxidant = 'Maintain daily moisturizer barrier seal to minimize environmental pollutant adhesion.';
      }
    } else {
      severity = 'moderate';
      cleansing = 'Live particulate measurements unavailable. Follow your standard double cleansing routine to clear daily sunscreen and environmental residue.';
      antioxidant = 'Maintain regular antioxidant application to support skin resilience against baseline pollutants.';
    }

    return {
      sunscreenAlert: {
        level: uvLevel,
        spfRecommendation: spfRec,
        reapplicationIntervalHours: interval,
        guidance: uvGuidance,
      },
      moistureAlert: {
        condition,
        formulationTip: formTip,
        productRecommendation: prodTip,
      },
      pollutionAlert: {
        severity,
        cleansingGuidance: cleansing,
        antioxidantTip: antioxidant,
      },
    };
  }

  private static decodeWeatherCode(code: number): string {
    if (code === 0) return 'Clear Sunny Skies';
    if (code === 1 || code === 2) return 'Mostly Clear with Mild Clouds';
    if (code === 3) return 'Overcast Skies';
    if (code >= 45 && code <= 48) return 'Hazy / Foggy Conditions';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 80 && code <= 82) return 'Scattered Rain Showers';
    if (code >= 95) return 'Thunderstorm Activity';
    return 'Clear Daylight Conditions';
  }
}
