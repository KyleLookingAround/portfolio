import type {
  WeatherData, AirQualityData, CrimeRecord, PlanningResponse, FloodData,
  TfGMData, NHSResponse, EventbriteResponse,
} from '../types';

const LAT = 53.4083;
const LNG = -2.1494;

// ---------------------------------------------------------------------------
// Cache helpers — store API responses in sessionStorage with a timestamp.
// ---------------------------------------------------------------------------

const CACHE_PREFIX = 'st_cache_';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  ts: number;
  data: T;
}

function cacheGet<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > ttlMs) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // sessionStorage quota exceeded — silently skip caching
  }
}

/** Clear all cached API responses (call before a manual refresh). */
export function clearApiCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // no-op if sessionStorage is unavailable
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function cachedFetch<T>(cacheKey: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = cacheGet<T>(cacheKey, ttlMs);
  if (cached !== null) return cached;
  const data = await fn();
  cacheSet(cacheKey, data);
  return data;
}

export async function fetchWeather(): Promise<WeatherData> {
  return cachedFetch('weather', () => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LAT}&longitude=${LNG}` +
      `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation,relative_humidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
      `&timezone=Europe%2FLondon&forecast_days=3`;
    return fetchJson<WeatherData>(url);
  });
}

export async function fetchAirQuality(): Promise<AirQualityData> {
  return cachedFetch('airQuality', () => {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${LAT}&longitude=${LNG}` +
      `&current=european_aqi,pm10,pm2_5,nitrogen_dioxide` +
      `&timezone=Europe%2FLondon`;
    return fetchJson<AirQualityData>(url);
  });
}

function getMonthString(monthsBack: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function fetchCrime(): Promise<CrimeRecord[]> {
  return cachedFetch('crime', async () => {
    for (const offset of [2, 3, 4]) {
      const date = getMonthString(offset);
      const url =
        `https://data.police.uk/api/crimes-street/all-crime` +
        `?lat=${LAT}&lng=${LNG}&date=${date}`;
      const data = await fetchJson<CrimeRecord[]>(url);
      if (data.length > 0) return data;
    }
    return [];
  });
}

export async function fetchPlanning(): Promise<PlanningResponse> {
  return cachedFetch('planning', () => {
    const url =
      `https://www.planning.data.gov.uk/api/search.json` +
      `?dataset=conservation-area&geometry_reference=E08000007&limit=8`;
    return fetchJson<PlanningResponse>(url);
  });
}

export async function fetchFloodData(): Promise<FloodData> {
  return cachedFetch('flood', () => {
    const url =
      `https://environment.data.gov.uk/flood-monitoring/id/measures` +
      `?lat=${LAT}&long=${LNG}&dist=15&parameter=level`;
    return fetchJson<FloodData>(url);
  });
}

// ---------------------------------------------------------------------------
// TfGM — Metrolink & bus departures (requires VITE_TFGM_API_KEY)
// ---------------------------------------------------------------------------

export async function fetchTfGMDepartures(apiKey: string): Promise<TfGMData> {
  // Stockport Interchange ATCO code: 1800SB49291
  // TfGM OData API — subscription key in header
  const url = `https://api.tfgm.com/odata/StopDepartures('1800SB49291')`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as TfGMData;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// NHS Service Search (requires VITE_NHS_API_KEY)
// ---------------------------------------------------------------------------

export async function fetchNHSServices(apiKey: string): Promise<NHSResponse> {
  const url =
    `https://api.nhs.uk/service-search/search` +
    `?api-version=2&ServiceType=gp&Latitude=${LAT}&Longitude=${LNG}&Distance=3&top=5`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NHSResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Eventbrite local events (requires VITE_EVENTBRITE_TOKEN)
// ---------------------------------------------------------------------------

export async function fetchEventbriteEvents(token: string): Promise<EventbriteResponse> {
  // Search for events within 10km of Stockport town centre
  const url =
    `https://www.eventbriteapi.com/v3/events/search/` +
    `?location.latitude=${LAT}&location.longitude=${LNG}` +
    `&location.within=10km&expand=venue&sort_by=date&time_filter=current_future&page_size=8`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as EventbriteResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
