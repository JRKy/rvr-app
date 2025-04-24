# RVR App

A Progressive Web App (PWA) for truck payload calculations and trip tracking, designed specifically for RV owners and truck operators.

## Features

### Payload Calculator
- Calculate your truck's payload weight and ensure it's within safe towing capacities
- Support for multiple truck classes (Class 1-4, Class A-C RVs)
- Real-time weight distribution calculations
- Visual weight distribution diagram
- Automatic GVWR and payload calculations

### Trip Tracker
- Plan and track trips with interactive map integration
- Calculate estimated fuel consumption and costs
- Support for various vehicle configurations:
  - Pickup Trucks (Class 1-4)
  - Drivable RVs (Class A, B, B+, C, Super C)
  - Single Rear Wheel (SRW) and Dual Rear Wheel (DRW) configurations
- Real-time route planning with distance and duration estimates
- Automatic MPG adjustments based on:
  - Vehicle class and configuration
  - Load status (empty, loaded, towing)
  - Trailer weight
- Comprehensive trip statistics:
  - Total miles and hours
  - Fuel consumption and costs
  - Average MPG
  - Cost per mile
- Trip history with sortable data
- Visual analytics with MPG and cost trends
- Current location integration for easy route planning
- Support for round trips

### General Features
- PWA Support: Install the app on your device for offline access
- Responsive Design: Works seamlessly on both desktop and mobile devices
- Real-time fuel price updates via EIA API
- Modern, intuitive interface with Material-UI
- Interactive maps with OpenStreetMap integration
- Automatic geolocation support
- Location search with autocomplete

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- EIA API key (optional, for fuel price updates)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rvr-app.git
   cd rvr-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   VITE_EIA_API_KEY=your_eia_api_key_here  # Optional, for fuel price updates
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Technologies Used

- React 18
- TypeScript
- Vite
- Material-UI (MUI)
- React Router
- Leaflet/React-Leaflet for maps
- Recharts for data visualization
- OpenStreetMap for geocoding and routing
- EIA API for fuel prices

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  │   ├── PayloadCalculator.tsx  # Payload calculation page
  │   └── TripTracker.tsx       # Trip tracking page
  ├── hooks/         # Custom React hooks
  ├── services/      # API and service functions
  │   ├── geocoding.ts    # Location services
  │   └── vehicleApi.ts   # Vehicle data services
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── styles/        # CSS and style files
  └── context/       # React context providers
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenStreetMap for mapping data
- EIA for fuel price data
- Material-UI team for the component library
