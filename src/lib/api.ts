import type { WeatherData, AirQualityData, CrimeRecord, PlanningResponse, FloodData } from '../types';

const LAT = 53.4083;
const LNG = -2.1494;

// TODO: Expose timeout vs. non-timeout errors from fetchJson so callers can show
//       specific messages. The AbortController fires with an AbortError (err.name === 'AbortError');
//       currently all errors reach widget catch blocks as the same opaque value. Consider
//       re-throwing a typed error, e.g.:
//         if (err instanceof DOMException && err.name === 'AbortError')
//           throw new Error('TIMEOUT')
//       so widgets can check error.message === 'TIMEOUT' and render 'Request timed out'
//       instead of a generic failure message.
async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWeather(): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}&longitude=${LNG}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
    `&timezone=Europe%2FLondon&forecast_days=3`;
  return fetchJson<WeatherData>(url);
}

export async function fetchAirQuality(): Promise<AirQualityData> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${LAT}&longitude=${LNG}` +
    `&current=european_aqi,pm10,pm2_5,nitrogen_dioxide` +
    `&timezone=Europe%2FLondon`;
  return fetchJson<AirQualityData>(url);
}

function getMonthString(monthsBack: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function fetchCrime(): Promise<CrimeRecord[]> {
  for (const offset of [2, 3, 4]) {
    const date = getMonthString(offset);
    const url =
      `https://data.police.uk/api/crimes-street/all-crime` +
      `?lat=${LAT}&lng=${LNG}&date=${date}`;
    const data = await fetchJson<CrimeRecord[]>(url);
    if (data.length > 0) return data;
  }
  return [];
}

export async function fetchPlanning(): Promise<PlanningResponse> {
  const url =
    `https://www.planning.data.gov.uk/api/search.json` +
    `?dataset=conservation-area&geometry_reference=E08000007&limit=8`;
  return fetchJson<PlanningResponse>(url);
}

export async function fetchFloodData(): Promise<FloodData> {
  // Get River Mersey flood monitoring stations near Stockport
  // Using a broader search around Stockport coordinates
  const url =
    `https://environment.data.gov.uk/flood-monitoring/id/measures` +
    `?lat=${LAT}&long=${LNG}&dist=15&parameter=level`;
  return fetchJson<FloodData>(url);
}
