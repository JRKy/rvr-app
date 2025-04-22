# RVR App

A Progressive Web App (PWA) for truck payload calculations and trip tracking.

## Features

- **Payload Calculator**: Calculate your truck's payload weight and ensure it's within safe towing capacities
- **Trip Tracker**: Track your trips, fuel consumption, and calculate MPG statistics
- **PWA Support**: Install the app on your device for offline access
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- React Query
- Firebase (for future authentication)
- Google Maps API (for future route integration)

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── hooks/         # Custom React hooks
  ├── services/      # API and service functions
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
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
