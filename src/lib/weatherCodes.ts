export interface WeatherInfo {
  label: string;
  icon: string;
}

const WMO_CODES: Record<number, WeatherInfo> = {
  0:  { label: 'Clear sky',              icon: '☀️' },
  1:  { label: 'Mainly clear',           icon: '🌤️' },
  2:  { label: 'Partly cloudy',          icon: '⛅' },
  3:  { label: 'Overcast',               icon: '☁️' },
  45: { label: 'Fog',                    icon: '🌫️' },
  48: { label: 'Icy fog',                icon: '🌫️' },
  51: { label: 'Light drizzle',          icon: '🌦️' },
  53: { label: 'Moderate drizzle',       icon: '🌦️' },
  55: { label: 'Dense drizzle',          icon: '🌧️' },
  61: { label: 'Light rain',             icon: '🌦️' },
  63: { label: 'Moderate rain',          icon: '🌧️' },
  65: { label: 'Heavy rain',             icon: '🌧️' },
  71: { label: 'Light snow',             icon: '🌨️' },
  73: { label: 'Moderate snow',          icon: '❄️' },
  75: { label: 'Heavy snow',             icon: '❄️' },
  77: { label: 'Snow grains',            icon: '🌨️' },
  80: { label: 'Light showers',          icon: '🌦️' },
  81: { label: 'Moderate showers',       icon: '🌧️' },
  82: { label: 'Violent showers',        icon: '⛈️' },
  85: { label: 'Light snow showers',     icon: '🌨️' },
  86: { label: 'Heavy snow showers',     icon: '❄️' },
  95: { label: 'Thunderstorm',           icon: '⛈️' },
  96: { label: 'Thunderstorm w/ hail',   icon: '⛈️' },
  99: { label: 'Thunderstorm, heavy hail', icon: '⛈️' },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: '🌡️' };
}
