import { useState, useEffect } from 'react';
import { fetchWeather } from '../lib/api';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { WeatherData } from '../types';
import WidgetCard from './WidgetCard';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

export default function WeatherWidget({ onStatusChange }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    onStatusChange?.('loading');
    fetchWeather()
      .then((d) => {
        setData(d);
        onStatusChange?.('ready');
      })
      .catch(() => {
        setError('Unable to load weather data.');
        onStatusChange?.('error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = data?.current;
  const daily = data?.daily;
  const info = current ? getWeatherInfo(current.weathercode) : null;

  return (
    <WidgetCard
      title="Weather"
      icon="🌤️"
      meta="Stockport, SK1"
      isLoading={loading}
      error={error}
      onRetry={load}
    >
      {current && info && (
        <div>
          {/* Current conditions */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{info.icon}</span>
            <div>
              <div className="text-5xl font-light text-[#003A70] leading-none">
                {Math.round(current.temperature_2m)}
                <span className="text-2xl align-top">°C</span>
              </div>
              <div className="text-gray-500 mt-1">{info.label}</div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-2 text-sm border-t border-blue-100 pt-4 mb-4">
            <div>
              <div className="text-gray-400 uppercase text-xs tracking-wide">Feels like</div>
              <div className="font-semibold text-[#003A70]">{Math.round(current.apparent_temperature)}°C</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase text-xs tracking-wide">Wind</div>
              <div className="font-semibold text-[#003A70]">{Math.round(current.windspeed_10m)} km/h</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase text-xs tracking-wide">Humidity</div>
              <div className="font-semibold text-[#003A70]">{current.relative_humidity_2m}%</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase text-xs tracking-wide">Precipitation</div>
              <div className="font-semibold text-[#003A70]">{current.precipitation} mm</div>
            </div>
          </div>

          {/* 3-day forecast */}
          {daily && (
            <div className="flex gap-2 border-t border-blue-100 pt-4">
              {daily.time.map((dateStr, i) => {
                const dayInfo = getWeatherInfo(daily.weathercode[i]);
                const dayName = i === 0 ? 'Today' : DAY_NAMES[new Date(dateStr).getDay()];
                return (
                  <div key={dateStr} className="flex-1 text-center bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 font-medium">{dayName}</div>
                    <div className="text-xl my-1">{dayInfo.icon}</div>
                    <div className="text-xs font-semibold text-[#003A70]">
                      {Math.round(daily.temperature_2m_max[i])}°
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round(daily.temperature_2m_min[i])}°
                    </div>
                    <div className="text-xs text-[#009FE3] mt-1">
                      💧 {daily.precipitation_probability_max[i]}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
