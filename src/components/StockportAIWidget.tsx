import { useState, useEffect } from 'react';
import { fetchWeather, fetchAirQuality, fetchCrime, fetchFloodData } from '../lib/api';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { WeatherData, AirQualityData, CrimeRecord, FloodData } from '../types';
import WidgetCard from './WidgetCard';

function aqiLabel(aqi: number): string {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}

function buildPrompt(
  weather: WeatherData | null,
  airQuality: AirQualityData | null,
  crime: CrimeRecord[] | null,
  flood: FloodData | null,
): string {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const sections: string[] = [];

  if (weather) {
    const info = getWeatherInfo(weather.current.weathercode);
    sections.push(
      `Weather: ${info.label}, ${Math.round(weather.current.temperature_2m)}°C ` +
      `(feels like ${Math.round(weather.current.apparent_temperature)}°C), ` +
      `wind ${Math.round(weather.current.windspeed_10m)} km/h, ` +
      `humidity ${weather.current.relative_humidity_2m}%, ` +
      `precipitation ${weather.current.precipitation} mm`,
    );
    if (weather.daily.time.length > 0) {
      const dayInfo = getWeatherInfo(weather.daily.weathercode[0]);
      sections.push(
        `Today's forecast: High ${Math.round(weather.daily.temperature_2m_max[0])}°C / ` +
        `Low ${Math.round(weather.daily.temperature_2m_min[0])}°C, ` +
        `${dayInfo.label}, ${weather.daily.precipitation_probability_max[0]}% chance of rain`,
      );
    }
  }

  if (airQuality) {
    const aq = airQuality.current;
    sections.push(
      `Air quality: ${aqiLabel(aq.european_aqi)} (AQI ${aq.european_aqi}), ` +
      `PM10 ${aq.pm10.toFixed(1)} µg/m³, PM2.5 ${aq.pm2_5.toFixed(1)} µg/m³, ` +
      `NO₂ ${aq.nitrogen_dioxide.toFixed(1)} µg/m³`,
    );
  }

  if (flood?.items.length) {
    const readings = flood.items
      .filter(m => m.latestReading)
      .slice(0, 3)
      .map(m => `${m.label.split(' - ')[0]} at ${m.latestReading!.value.toFixed(2)} m`)
      .join(', ');
    if (readings) sections.push(`River Mersey levels near Stockport: ${readings}`);
  }

  if (crime?.length) {
    const counts: Record<string, number> = {};
    crime.forEach(r => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, n]) => `${cat.replace(/-/g, ' ')} (${n})`)
      .join(', ');
    sections.push(`Recent local crime summary (context only): ${top}`);
  }

  return (
    `You are a friendly local guide for Stockport, Greater Manchester, UK. ` +
    `Based on the real-time data below for ${today}, suggest an enjoyable, ` +
    `practical short day out itinerary for someone spending the day in Stockport. ` +
    `Tailor all suggestions to the current conditions.\n\n` +
    `LIVE STOCKPORT DATA:\n${sections.map(s => `• ${s}`).join('\n')}\n\n` +
    `Please suggest 4–5 activities covering morning, lunch, afternoon, and optionally evening. ` +
    `Use real Stockport locations (e.g. Merseyway Shopping Centre, Stockport Market Place, ` +
    `Stockport Museum & Art Gallery, Staircase House, Robinsons Brewery, Stockport Plaza cinema, ` +
    `Vernon Park, Bramall Hall, the Hat Works, Edgeley Park, local cafés and restaurants). ` +
    `Choose indoor or outdoor venues appropriately for the weather. ` +
    `Format as a clear itinerary with time slots and a brief tip at the end. Keep it under 300 words.`
  );
}

export default function StockportAIWidget({ className = '' }: { className?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [crime, setCrime] = useState<CrimeRecord[] | null>(null);
  const [flood, setFlood] = useState<FloodData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetchWeather(),
      fetchAirQuality(),
      fetchCrime(),
      fetchFloodData(),
    ]).then(([w, aq, cr, fl]) => {
      if (w.status === 'fulfilled') setWeather(w.value);
      if (aq.status === 'fulfilled') setAirQuality(aq.value);
      if (cr.status === 'fulfilled') setCrime(cr.value);
      if (fl.status === 'fulfilled') setFlood(fl.value);
    }).finally(() => setDataLoading(false));
  }, []);

  const copyPrompt = async () => {
    setCopyError(false);
    const prompt = buildPrompt(weather, airQuality, crime, flood);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const dataCount = [weather, airQuality, crime, flood].filter(Boolean).length;

  return (
    <WidgetCard
      title="Plan Your Day Out"
      icon="📋"
      meta={dataLoading ? 'Loading data…' : `${dataCount}/4 sources ready`}
      className={className}
    >
      <div className="flex flex-col items-center text-center py-4 gap-4">
        <p className="text-sm text-gray-500 max-w-md">
          Copies a ready-made AI prompt loaded with today's live Stockport data — weather,
          air quality, river levels &amp; crime stats. Paste it into your favourite AI to
          get a personalised day out itinerary.
        </p>

        {/* Data source chips */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {[
            { label: 'Weather', ready: !!weather },
            { label: 'Air Quality', ready: !!airQuality },
            { label: 'Crime', ready: !!crime },
            { label: 'River Levels', ready: !!flood },
          ].map(({ label, ready }) => (
            <span
              key={label}
              className={`px-2 py-1 rounded-full border text-xs font-medium ${
                dataLoading
                  ? 'border-gray-200 text-gray-400 bg-gray-50'
                  : ready
                  ? 'border-green-200 text-green-700 bg-green-50'
                  : 'border-amber-200 text-amber-700 bg-amber-50'
              }`}
            >
              {dataLoading ? '⏳' : ready ? '✓' : '–'} {label}
            </span>
          ))}
        </div>

        <button
          onClick={copyPrompt}
          disabled={dataLoading}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            copied
              ? 'bg-green-600 text-white hover:bg-green-700'
              : copyError
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-[#003A70] text-white hover:bg-[#005A9E]'
          }`}
        >
          <span aria-hidden="true">{copied ? '✓' : copyError ? '✗' : '📋'}</span>
          {copied ? 'Copied to clipboard!' : copyError ? 'Copy failed — try again' : 'Copy AI Prompt'}
        </button>

        {!copyError && !copied && (
          <p className="text-xs text-gray-400 max-w-sm">
            Paste into ChatGPT, Claude, Gemini, or any AI assistant to plan your Stockport day out.
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
