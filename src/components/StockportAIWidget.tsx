import { useState, useEffect } from 'react';
import { fetchWeather, fetchAirQuality, fetchCrime, fetchFloodData } from '../lib/api';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { WeatherData, AirQualityData, CrimeRecord, FloodData } from '../types';
import WidgetCard from './WidgetCard';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

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

async function callClaude(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not configured. Add it to your .env file to enable AI generation.');
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}${body ? ': ' + body : ''}`);
  }
  const data = await res.json() as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? '';
}

export default function StockportAIWidget({ className = '' }: { className?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [crime, setCrime] = useState<CrimeRecord[] | null>(null);
  const [flood, setFlood] = useState<FloodData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [itinerary, setItinerary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

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

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    setItinerary(null);
    try {
      const prompt = buildPrompt(weather, airQuality, crime, flood);
      const result = await callClaude(prompt);
      setItinerary(result);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate itinerary.');
    } finally {
      setGenerating(false);
    }
  };

  const dataCount = [weather, airQuality, crime, flood].filter(Boolean).length;

  return (
    <WidgetCard
      title="AI Day Out Planner"
      icon="✨"
      meta={dataLoading ? 'Loading data…' : `${dataCount}/4 sources ready`}
      className={className}
    >
      {/* Pre-generate state */}
      {!itinerary && !generating && !genError && (
        <div className="flex flex-col items-center text-center py-4 gap-4">
          <p className="text-sm text-gray-500 max-w-md">
            Pulls live weather, air quality, river levels &amp; crime data from the dashboard
            to suggest a tailored day out in Stockport — right now, today.
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
            onClick={generate}
            disabled={dataLoading || generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#003A70] text-white rounded-lg font-semibold text-sm hover:bg-[#005A9E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span aria-hidden="true">✨</span>
            Generate My Day Out
          </button>

          {!API_KEY && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 max-w-sm">
              Add <code className="font-mono">VITE_ANTHROPIC_API_KEY</code> to your{' '}
              <code className="font-mono">.env</code> file to enable AI generation.
            </p>
          )}
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-8 h-8 border-[3px] border-[#009FE3] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Crafting your Stockport itinerary…</p>
        </div>
      )}

      {/* Error state */}
      {genError && !generating && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <p className="text-sm text-gray-600">{genError}</p>
          <button
            onClick={generate}
            className="px-4 py-1.5 bg-[#009FE3] text-white text-sm rounded hover:bg-[#007AB8] transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Itinerary result */}
      {itinerary && !generating && (
        <div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {itinerary}
          </div>
          <div className="mt-5 pt-4 border-t border-blue-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Generated from {dataCount} live Stockport data source{dataCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={generate}
              className="text-xs text-[#009FE3] hover:text-[#007AB8] transition-colors flex items-center gap-1"
            >
              ✨ Regenerate
            </button>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
