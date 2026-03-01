# API Keys and Setup Guide

This document provides information about the APIs used in the Stockport Dashboard and how to obtain API keys where required.

## Currently Used APIs (No Key Required)

### 1. Open-Meteo Weather API
- **Purpose:** Weather forecasts and current conditions
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **API Key:** Not required
- **Documentation:** https://open-meteo.com/en/docs

### 2. Open-Meteo Air Quality API
- **Purpose:** Air quality index and pollutant levels
- **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`
- **API Key:** Not required
- **Documentation:** https://open-meteo.com/en/docs/air-quality-api

### 3. UK Police API
- **Purpose:** Local crime statistics
- **Endpoint:** `https://data.police.uk/api/`
- **API Key:** Not required
- **Documentation:** https://data.police.uk/docs/

### 4. Planning Data API
- **Purpose:** Conservation areas and planning data
- **Endpoint:** `https://www.planning.data.gov.uk/api/`
- **API Key:** Not required
- **Documentation:** https://www.planning.data.gov.uk/docs

### 5. Environment Agency Flood Monitoring API
- **Purpose:** River levels and flood warnings
- **Endpoint:** `https://environment.data.gov.uk/flood-monitoring/`
- **API Key:** Not required
- **Documentation:** https://environment.data.gov.uk/flood-monitoring/doc/reference

## Optional APIs (Free Registration Required)

### 6. Transport for Greater Manchester (TfGM) API
- **Purpose:** Live bus/tram times, car park availability, journey planning
- **Registration:** FREE at https://developer.tfgm.com/
- **Features:**
  - Real-time bus and Metrolink arrival times
  - Live car park occupancy data
  - Service disruption alerts
  - Journey planning
- **How to Register:**
  1. Visit https://developer.tfgm.com/
  2. Create a free developer account
  3. Request an API key (typically approved within 24-48 hours)
  4. Add to `.env` file as `VITE_TFGM_API_KEY=your_key_here`

### 7. NHS API
- **Purpose:** Find GP surgeries, pharmacies, hospitals, and health services
- **Registration:** FREE at https://digital.nhs.uk/developer
- **Features:**
  - GP surgery finder
  - Pharmacy locations and opening hours
  - Hospital and A&E information
  - Service availability
- **How to Register:**
  1. Visit https://digital.nhs.uk/developer
  2. Create a developer account
  3. Subscribe to the API you need (e.g., "Organisation Data Service")
  4. Generate API key
  5. Add to `.env` file as `VITE_NHS_API_KEY=your_key_here`

### 8. Eventbrite API (Optional)
- **Purpose:** Local events and activities in Stockport
- **Registration:** FREE tier available at https://www.eventbrite.com/platform/api
- **Features:**
  - Search events by location
  - Event details and dates
  - Venue information
- **How to Register:**
  1. Visit https://www.eventbrite.com/platform/api
  2. Create an Eventbrite account
  3. Create an app to get your API token
  4. Add to `.env` file as `VITE_EVENTBRITE_TOKEN=your_token_here`

## Setup Instructions

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Optional: Transport for Greater Manchester
VITE_TFGM_API_KEY=your_tfgm_key_here

# Optional: NHS API
VITE_NHS_API_KEY=your_nhs_key_here

# Optional: Eventbrite
VITE_EVENTBRITE_TOKEN=your_eventbrite_token_here
```

### Using API Keys in Code

API keys are accessed via `import.meta.env` in Vite:

```typescript
const apiKey = import.meta.env.VITE_TFGM_API_KEY;

// Check if key exists before making API calls
if (apiKey) {
  // Make API call with key
} else {
  // Fallback to static data or show message
}
```

## Notes

- All APIs with "Optional" status will gracefully degrade if no API key is provided
- The dashboard will still function with core features even without optional API keys
- API keys starting with `VITE_` are exposed to the client-side code (safe for public APIs)
- Never commit API keys to version control - they should only be in `.env` (which is git-ignored)

## Useful Links

- **Stockport Council:** https://www.stockport.gov.uk/
- **TfGM Journey Planner:** https://www.tfgm.com/journey-planner
- **Environment Agency:** https://check-for-flooding.service.gov.uk/
- **NHS Service Search:** https://www.nhs.uk/service-search/
- **UK Police Data:** https://data.police.uk/

## Rate Limits

| API | Rate Limit | Notes |
|-----|------------|-------|
| Open-Meteo | 10,000 requests/day | Free tier, no key required |
| UK Police API | No official limit | Fair use policy |
| Planning Data | No official limit | Fair use policy |
| Environment Agency | No official limit | Fair use policy |
| TfGM | Varies by subscription | Check developer portal |
| NHS API | Varies by service | Check developer documentation |
| Eventbrite | 1,000 requests/day | Free tier |

## Support

If you have issues obtaining or using API keys:
- Check the respective API's documentation
- Verify your API key is correctly added to `.env`
- Ensure `.env` is in the project root
- Restart the development server after adding new environment variables
