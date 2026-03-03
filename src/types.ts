export interface WeatherCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  weathercode: number;
  windspeed_10m: number;
  precipitation: number;
  relative_humidity_2m: number;
}

export interface WeatherDaily {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily;
}

export interface AirQualityCurrent {
  european_aqi: number;
  pm10: number;
  pm2_5: number;
  nitrogen_dioxide: number;
}

export interface AirQualityData {
  current: AirQualityCurrent;
}

export interface CrimeRecord {
  category: string;
  location: {
    street: { name: string };
    latitude: string;
    longitude: string;
  };
  month: string;
}

export interface PlanningRecord {
  entity: number;
  name: string;
  reference: string;
  'entry-date': string;
  'start-date'?: string;
  dataset: string;
}

export interface PlanningResponse {
  count: number;
  entities: PlanningRecord[];
}

export interface FloodStation {
  '@id': string;
  label: string;
  stationReference: string;
  riverName?: string;
}

export interface FloodMeasure {
  '@id': string;
  label: string;
  latestReading?: {
    '@id': string;
    dateTime: string;
    value: number;
  };
  parameter: string;
  parameterName: string;
  qualifier?: string;
  station: string;
  stageScale?: {
    '@id': string;
    highestRecent?: {
      '@id': string;
      dateTime: string;
      value: number;
    };
  };
  unit: string;
  unitName: string;
}

export interface FloodData {
  items: FloodMeasure[];
}

// ---------------------------------------------------------------------------
// TfGM (Transport for Greater Manchester)
// ---------------------------------------------------------------------------

export interface TfGMDeparture {
  atcoCode: string;
  stationName: string;
  destination: string;
  wait: number; // minutes
  status: string;
  type: 'tram' | 'bus';
}

export interface TfGMData {
  departures: TfGMDeparture[];
  stationName: string;
}

// ---------------------------------------------------------------------------
// NHS Services
// ---------------------------------------------------------------------------

export interface NHSService {
  organisationId: string;
  organisationName: string;
  address1?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  website?: string;
  serviceType: string;
}

export interface NHSResponse {
  value: NHSService[];
}

// ---------------------------------------------------------------------------
// Events (Eventbrite)
// ---------------------------------------------------------------------------

export interface EventbriteEvent {
  id: string;
  name: { text: string };
  start: { local: string };
  end: { local: string };
  url: string;
  venue?: { name: string; address?: { localized_address_display?: string } };
  description?: { text: string };
}

export interface EventbriteResponse {
  events: EventbriteEvent[];
}
