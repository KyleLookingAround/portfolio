# Stockport Today - Local Dashboard

A live local dashboard for Stockport, UK featuring real-time information about weather, air quality, crime statistics, planning applications, and transport.

## Features

- **Weather Widget**: Current conditions and 3-day forecast from Open-Meteo
- **Air Quality Widget**: European AQI and pollutant readings
- **Crime Statistics**: Recent crime data from UK Police API
- **Planning & Development**: Conservation areas and notable planning applications
- **Transport**: Rail services and quick links to journey planners
- **Stockport Facts**: Interesting statistics and rotating trivia about Stockport

## Tech Stack

- React 19 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- ESLint for code quality

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Data Sources

- Weather: [Open-Meteo API](https://open-meteo.com/)
- Air Quality: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
- Crime: [UK Police API](https://data.police.uk/)
- Planning: [Planning Data Gov UK](https://www.planning.data.gov.uk/)
- Transport: Static data and links to National Rail & TfGM

## Development

This project uses:
- **React 19** with hooks and strict mode
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **Vite** for fast development and optimized builds
- **ESLint** with React hooks rules for code quality
