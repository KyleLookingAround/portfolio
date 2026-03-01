# Stockport Information Dashboard

A modern, real-time information dashboard for Stockport, Greater Manchester. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### Live Data Widgets

- **🌤️ Weather** - Current conditions and 3-day forecast for Stockport (Open-Meteo API)
- **💨 Air Quality** - European AQI and pollutant levels (Open-Meteo API)
- **🚔 Crime Statistics** - Monthly crime data by category (UK Police API)
- **🌊 River Monitoring** - River Mersey water levels and flood warnings (Environment Agency API)
- **📞 Local Services** - Emergency contacts, council services, and useful links
- **🏗️ Planning & Development** - Conservation areas and notable planning applications
- **🚆 Transport** - Rail services and public transport links
- **📊 Stockport by Numbers** - Local facts, statistics, and rotating trivia

### Technical Features

- Real-time data from multiple public APIs
- Responsive design that works on mobile, tablet, and desktop
- Graceful error handling with retry functionality
- Loading states for better UX
- No backend required - all API calls from the browser
- TypeScript for type safety
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KyleLookingAround/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up API keys for enhanced features:
```bash
cp .env.example .env
# Edit .env and add your API keys (see API_KEYS.md for details)
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Keys

Most features work without any API keys. For enhanced features (live transport data, extended health services), see [API_KEYS.md](./API_KEYS.md) for instructions on obtaining free API keys.

### APIs Used (No Key Required)
- Open-Meteo Weather & Air Quality
- UK Police Data
- Environment Agency Flood Monitoring
- Planning Data (planning.data.gov.uk)

### Optional APIs (Free Registration)
- Transport for Greater Manchester (TfGM) - Live transport data
- NHS API - Extended health services
- Eventbrite - Local events

## Project Structure

```
src/
├── components/         # React components
│   ├── Header.tsx
│   ├── WeatherWidget.tsx
│   ├── AirQualityWidget.tsx
│   ├── CrimeWidget.tsx
│   ├── FloodWidget.tsx
│   ├── LocalServicesWidget.tsx
│   ├── PlanningWidget.tsx
│   ├── TransportWidget.tsx
│   ├── FactsWidget.tsx
│   └── WidgetCard.tsx
├── lib/               # API functions and utilities
│   ├── api.ts
│   └── weatherCodes.ts
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Customization

### Changing Location

To use this dashboard for a different location, update the coordinates in `src/lib/api.ts`:

```typescript
const LAT = 53.4083;  // Your latitude
const LNG = -2.1494;  // Your longitude
```

### Adding New Widgets

1. Create a new component in `src/components/`
2. Add any new types to `src/types.ts`
3. Add API functions to `src/lib/api.ts`
4. Import and add the widget to `src/App.tsx`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Weather data from [Open-Meteo](https://open-meteo.com/)
- Crime statistics from [UK Police Data API](https://data.police.uk/)
- Planning data from [Planning Data](https://www.planning.data.gov.uk/)
- Flood monitoring from [Environment Agency](https://environment.data.gov.uk/)
- Local information from [Stockport Council](https://www.stockport.gov.uk/)

---

Built with ❤️ for the people of Stockport
