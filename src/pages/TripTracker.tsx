import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  useTheme,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Autocomplete,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  ListSubheader,
  InputAdornment,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpward, ArrowDownward, CalendarToday, MyLocation, LocalGasStation, Route, History } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet.css';
import { createFilterOptions } from '@mui/material/Autocomplete';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Trip {
  id: string;
  date: string;
  startOdometer: number;
  endOdometer: number;
  fuelAmount: number;
  fuelCost: number;
  notes: string;
  mpg: number;
  costPerMile: number;
  vehicleDetails: {
    vehicleClass: string;
    wheelConfig?: string;
    fuelType: string;
    loadStatus: string;
    trailerWeight?: string;
    currentFuelPrice: string;
  };
  route?: {
    origin: string;
    destination: string;
    distance: number;
    oneWayDistance: number;
    duration: string;
    coordinates: {
      origin: [number, number];
      destination: [number, number];
    };
    routeGeometry: {
      type: string;
      coordinates: [number, number][];
    };
    isRoundTrip: boolean;
  };
}

type SortField = 'date' | 'mpg' | 'costPerMile' | 'miles';
type SortOrder = 'asc' | 'desc';

interface Location {
  label: string;
  value: string;
  coordinates: [number, number];
  inputValue?: string;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  // Add other error fields as needed
}

interface TruckDetails {
  fuelTankSize: string;
  fuelType: 'gas' | 'diesel';
  vehicleClass: 'class1' | 'class2' | 'class3' | 'class4' | 'classA' | 'classB' | 'classBPlus' | 'classC' | 'superC';
  wheelConfig: 'srw' | 'drw';
  loadStatus: 'empty' | 'loaded' | 'towing';
  trailerWeight: string;
  currentFuelPrice: string;
  averageMPG: string;
}

interface TripFormData {
  date: string;
  origin: string;
  destination: string;
  distance: string;
  isRoundTrip: boolean;
  elevation: {
    ascent: string;
    descent: string;
  } | null;
  estimatedMPG: string;
  fuelAmount: string;
  fuelCost: string;
  startOdometer?: string;
  endOdometer?: string;
}

const DEFAULT_FUEL_PRICES = {
  gas: 3.50,
  diesel: 4.00,
};

const EIA_API_BASE_URL = 'https://api.eia.gov/v2';
const EIA_API_KEY = import.meta.env.VITE_EIA_API_KEY;
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';
const API_BASE_URL = '/api';
const CORS_PROXY = 'https://corsproxy.io/?';
const CORS_KEY = import.meta.env.VITE_CORS_KEY;

// Add rate limiting constants
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Add cache interface
interface GeocodeCache {
  [key: string]: {
    coordinates: [number, number];
    timestamp: number;
  };
}

interface ElevationData {
  elevation: number;
  distance: number;
}

// Base MPG values for different vehicle configurations
const BASE_MPG = {
  // Pickup Trucks
  class1: {
    srw: {
      gas: {
        empty: 18,
        loaded: 15,
        towing: 10
      },
      diesel: {
        empty: 22,
        loaded: 18,
        towing: 12
      }
    },
    drw: {
      gas: {
        empty: 17,
        loaded: 14,
        towing: 9
      },
      diesel: {
        empty: 21,
        loaded: 17,
        towing: 11
      }
    }
  },
  class2: {
    srw: {
      gas: {
        empty: 16,
        loaded: 13,
        towing: 8
      },
      diesel: {
        empty: 20,
        loaded: 16,
        towing: 10
      }
    },
    drw: {
      gas: {
        empty: 15,
        loaded: 12,
        towing: 7
      },
      diesel: {
        empty: 19,
        loaded: 15,
        towing: 9
      }
    }
  },
  class3: {
    srw: {
      gas: {
        empty: 14,
        loaded: 11,
        towing: 7
      },
      diesel: {
        empty: 18,
        loaded: 14,
        towing: 9
      }
    },
    drw: {
      gas: {
        empty: 13,
        loaded: 10,
        towing: 6
      },
      diesel: {
        empty: 17,
        loaded: 13,
        towing: 8
      }
    }
  },
  class4: {
    srw: {
      gas: {
        empty: 12,
        loaded: 9,
        towing: 6
      },
      diesel: {
        empty: 16,
        loaded: 12,
        towing: 8
      }
    },
    drw: {
      gas: {
        empty: 11,
        loaded: 8,
        towing: 5
      },
      diesel: {
        empty: 15,
        loaded: 11,
        towing: 7
      }
    }
  },
  // Drivable RVs
  classA: {
    gas: {
      empty: 8,
      loaded: 6,
      towing: 4
    },
    diesel: {
      empty: 10,
      loaded: 8,
      towing: 5
    }
  },
  classB: {
    gas: {
      empty: 15,
      loaded: 12,
      towing: 8
    },
    diesel: {
      empty: 18,
      loaded: 15,
      towing: 10
    }
  },
  classBPlus: {
    gas: {
      empty: 13,
      loaded: 10,
      towing: 7
    },
    diesel: {
      empty: 16,
      loaded: 13,
      towing: 9
    }
  },
  classC: {
    gas: {
      empty: 12,
      loaded: 9,
      towing: 6
    },
    diesel: {
      empty: 15,
      loaded: 12,
      towing: 8
    }
  },
  superC: {
    gas: {
      empty: 10,
      loaded: 8,
      towing: 5
    },
    diesel: {
      empty: 13,
      loaded: 10,
      towing: 7
    }
  }
};

// Add debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Add MapUpdater component
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

// Add type for the BASE_MPG indexing
type VehicleClass = 'class1' | 'class2' | 'class3' | 'class4' | 'classA' | 'classB' | 'classBPlus' | 'classC' | 'superC';
type WheelConfig = 'srw' | 'drw';
type FuelType = 'gas' | 'diesel';
type LoadStatus = 'empty' | 'loaded' | 'towing';

const TripTracker: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [truckDetails, setTruckDetails] = useState<TruckDetails>({
    fuelTankSize: '',
    fuelType: 'gas',
    vehicleClass: 'class1',
    wheelConfig: 'srw',
    loadStatus: 'empty',
    trailerWeight: '',
    currentFuelPrice: DEFAULT_FUEL_PRICES.gas.toString(),
    averageMPG: '',
  });
  const [priceSource, setPriceSource] = useState<'EIA' | 'default'>('default');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState<TripFormData>({
    date: '',
    origin: '',
    destination: '',
    distance: '',
    isRoundTrip: false,
    elevation: null,
    estimatedMPG: '',
    fuelAmount: '',
    fuelCost: '',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US
  const [markers, setMarkers] = useState<{
    origin?: [number, number];
    destination?: [number, number];
    route?: [number, number][];
  }>({});
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingFuelPrice, setIsLoadingFuelPrice] = useState(false);
  const [fuelPriceError, setFuelPriceError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [originCoordinates, setOriginCoordinates] = useState<[number, number] | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<[number, number] | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [geocodeCache, setGeocodeCache] = useState<GeocodeCache>({});

  // Add cache for recent searches
  const searchCache = useRef<Map<string, Location[]>>(new Map());

  // Add test function inside component
  const testApiConnection = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouteService API key is missing');
      }

      // Test with a simple geocoding request
      const testLocation = 'New York, NY';
      const targetUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(testLocation)}&limit=1&countrycodes=us`;

      console.log('Testing API connection with URL:', targetUrl);
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'RVR-App/1.0'
        }
      });

      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      
      return data;
    } catch (error) {
      console.error('API Test Error:', error);
      throw error;
    }
  };

  // Add useEffect inside component
  useEffect(() => {
    testApiConnection().catch(console.error);
  }, []);

  // Update the renderAutocomplete function
  const renderAutocomplete = (type: 'origin' | 'destination') => (
    <Autocomplete<Location | string>
      value={formData[type] ? suggestions.find(opt => opt.value === formData[type]) || null : null}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue !== 'string') {
          handleLocationSelect(newValue, type);
        }
      }}
      onInputChange={(_, newInputValue) => {
        setFormData(prev => ({ ...prev, [type]: newInputValue }));
        debouncedFetchSuggestions(newInputValue);
      }}
      options={suggestions}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option?.label || '';
      }}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        if (typeof option === 'string' && typeof value === 'string') {
          return option === value;
        }
        if (typeof option === 'object' && typeof value === 'object') {
          return option.value === value.value;
        }
        return false;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={type === 'origin' ? 'Starting Location' : 'Destination'}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '64px',
              fontSize: '1.2rem',
              '& input': {
                padding: '8px 14px',
                height: '48px',
                fontSize: '1.2rem'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderRadius: 2
              }
            },
            '& .MuiInputLabel-root': {
              fontSize: '1.2rem',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)'
              }
            },
            '& .MuiAutocomplete-endAdornment': {
              top: 'calc(50% - 16px)'
            }
          }}
        />
      )}
      filterOptions={(options) => options}
      filterSelectedOptions={false}
      blurOnSelect={false}
      clearOnBlur={false}
      ListboxProps={{
        sx: { 
          fontSize: '1.2rem',
          '& li': {
            padding: '12px 16px'
          }
        }
      }}
    />
  );

  // Update the BASE_MPG calculation
  const getBaseMPG = (vehicleClass: VehicleClass, wheelConfig: WheelConfig | undefined, fuelType: FuelType, loadStatus: LoadStatus): number => {
    if (vehicleClass === 'class1' || vehicleClass === 'class2' || vehicleClass === 'class3' || vehicleClass === 'class4') {
      return wheelConfig ? BASE_MPG[vehicleClass][wheelConfig][fuelType][loadStatus] : 0;
    } else {
      return BASE_MPG[vehicleClass][fuelType][loadStatus];
    }
  };

  const handleTruckDetailsChange = (field: keyof TruckDetails, value: string) => {
    setTruckDetails(prev => {
      const newDetails = { ...prev };
      
      // Update the field value
      if (field === 'trailerWeight' || field === 'fuelTankSize' || field === 'currentFuelPrice') {
        newDetails[field] = value;
      } else if (field === 'fuelType') {
        newDetails.fuelType = value as 'gas' | 'diesel';
      } else if (field === 'vehicleClass') {
        newDetails.vehicleClass = value as TruckDetails['vehicleClass'];
      } else if (field === 'wheelConfig') {
        newDetails.wheelConfig = value as 'srw' | 'drw';
      } else if (field === 'loadStatus') {
        newDetails.loadStatus = value as 'empty' | 'loaded' | 'towing';
      }
      
      if (['vehicleClass', 'wheelConfig', 'fuelType', 'loadStatus'].includes(field)) {
        const baseMPG = getBaseMPG(
          newDetails.vehicleClass,
          newDetails.wheelConfig,
          newDetails.fuelType,
          newDetails.loadStatus
        );
        
        let mpgAdjustment = 1.0;
        
        if (newDetails.loadStatus === 'towing' && newDetails.trailerWeight) {
          const trailerWeight = parseFloat(newDetails.trailerWeight);
          mpgAdjustment *= (1 - (trailerWeight * 0.000001));
        }
        
        const adjustedMPG = baseMPG * mpgAdjustment;
        newDetails.averageMPG = adjustedMPG.toFixed(1);
      }
      
      return newDetails;
    });
  };

  // Update the input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateMPG = (startMiles: number, endMiles: number, fuelAmount: number): number => {
    const miles = endMiles - startMiles;
    return fuelAmount > 0 ? miles / fuelAmount : 0;
  };

  const calculateCostPerMile = (miles: number, cost: number): number => {
    return miles > 0 ? cost / miles : 0;
  };

  const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
    try {
      // Check cache first
      const cachedResult = geocodeCache[location];
      if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
        return cachedResult.coordinates;
      }

      // Implement rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
      }
      setLastRequestTime(Date.now());

      const response = await fetch(
        `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=us`,
        {
          headers: {
            'User-Agent': 'RVR-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const coordinates: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        
        // Update cache
        setGeocodeCache(prev => ({
          ...prev,
          [location]: {
            coordinates,
            timestamp: Date.now()
          }
        }));
        
        return coordinates;
      }
      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  };

  const getElevationData = async (coordinates: [number, number][]): Promise<ElevationData[]> => {
    try {
      // Convert coordinates to the format expected by the elevation API
      const coordinateString = coordinates.map(coord => `${coord[1]},${coord[0]}`).join('|');
      
      const response = await fetch(
        `https://api.open-elevation.com/api/v1/lookup?locations=${coordinateString}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((result: any, index: number) => ({
        elevation: result.elevation,
        distance: index * 100 // Approximate distance between points (in meters)
      }));
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      return [];
    }
  };

  const calculateRouteDetails = async (origin: string, destination: string, isRoundTrip: boolean) => {
    try {
      console.log('Calculating route from', origin, 'to', destination);
      setRouteLoading(true);
      setRouteError(null);

      const [originCoords, destCoords] = await Promise.all([
        geocodeLocation(origin),
        geocodeLocation(destination)
      ]);

      console.log('Geocoded coordinates:', { origin: originCoords, destination: destCoords });

      if (!originCoords || !destCoords) {
        throw new Error('Could not find one or both locations');
      }

      // Use OSRM's public API for routing
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=full&geometries=geojson`;
      console.log('OSRM URL:', routeUrl);
      
      const response = await fetch(routeUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OSRM Error:', errorText);
        throw new Error('Failed to calculate route');
      }

      const data = await response.json();
      console.log('OSRM Response:', data);
      
      if (!data.routes || !data.routes[0]) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const oneWayDistance = route.distance / 1000 * 0.621371; // Convert meters to miles
      const totalDistance = isRoundTrip ? oneWayDistance * 2 : oneWayDistance;
      const duration = route.duration;

      console.log('Route details:', { oneWayDistance, totalDistance, duration });

      // Convert route coordinates to [lat, lon] format for Leaflet
      const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      console.log('Route coordinates:', routeCoordinates.length, 'points');

      // Update markers and map center
      setMarkers({
        origin: [originCoords[1], originCoords[0]],
        destination: [destCoords[1], destCoords[0]],
        route: routeCoordinates
      });

      // Calculate bounds to fit the entire route
      const bounds = routeCoordinates.reduce((acc: [[number, number], [number, number]], coord: [number, number]) => {
        return [
          [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
          [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
        ];
      }, [[originCoords[1], originCoords[0]], [destCoords[1], destCoords[0]]]);

      // Center map on the route
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLon = (bounds[0][1] + bounds[1][1]) / 2;
      setMapCenter([centerLat, centerLon]);

      // Calculate base MPG based on vehicle configuration
      const baseMPG = getBaseMPG(
        truckDetails.vehicleClass,
        truckDetails.wheelConfig,
        truckDetails.fuelType,
        truckDetails.loadStatus
      );
      
      // Adjust MPG based on route characteristics
      let mpgAdjustment = 1.0;
      
      // Additional adjustment for towing weight
      if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
        const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
        mpgAdjustment *= (1 - (trailerWeight * 0.000001));
      }

      // Calculate adjusted MPG
      const estimatedMPG = baseMPG * mpgAdjustment;

      // Calculate fuel usage and cost
      const gallonsNeeded = totalDistance / estimatedMPG;
      const currentFuelPrice = parseFloat(String(truckDetails.currentFuelPrice)) || 0;
      const fuelCost = gallonsNeeded * currentFuelPrice;

      // Update form data with calculated values
      setFormData(prev => ({
        ...prev,
        distance: totalDistance.toFixed(1),
        fuelAmount: gallonsNeeded.toFixed(1),
        fuelCost: fuelCost.toFixed(2),
        isRoundTrip,
        estimatedMPG: estimatedMPG.toFixed(1)
      }));

      return {
        distance: totalDistance,
        oneWayDistance,
        duration: `${Math.floor(duration / 3600)}h ${Math.round((duration % 3600) / 60)}m`,
        coordinates: {
          origin: [originCoords[1], originCoords[0]] as [number, number],
          destination: [destCoords[1], destCoords[0]] as [number, number]
        },
        routeGeometry: route.geometry,
        estimatedMPG
      };

    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError(error instanceof Error ? error.message : 'Failed to calculate route');
      return null;
    } finally {
      setRouteLoading(false);
    }
  };

  // Update the debounced fetch suggestions function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second between retries
      const RATE_LIMIT_DELAY = 1000; // 1 second between requests

      let retryCount = 0;
      let lastRequestTime = 0;

      const fetchWithRetry = async (): Promise<Location[]> => {
        try {
          // Implement rate limiting
          const now = Date.now();
          const timeSinceLastRequest = now - lastRequestTime;
          if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
          }
          lastRequestTime = Date.now();

          const response = await fetch(
            `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(input)}&limit=5&countrycodes=us`,
            {
              headers: {
                'User-Agent': 'RVR-App/1.0'
              }
            }
          );

          if (!response.ok) {
            if (response.status === 503 && retryCount < MAX_RETRIES) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
              return fetchWithRetry();
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data && data.length > 0) {
            // Create a map to track unique locations
            const uniqueLocations = new Map<string, Location>();
            
            data.forEach((feature: any) => {
              const key = `${feature.display_name}-${feature.lat}-${feature.lon}`;
              if (!uniqueLocations.has(key)) {
                uniqueLocations.set(key, {
                  label: feature.display_name,
                  value: feature.display_name,
                  coordinates: [parseFloat(feature.lon), parseFloat(feature.lat)]
                });
              }
            });
            
            return Array.from(uniqueLocations.values());
          }
          return [];
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
            return fetchWithRetry();
          }
          return [];
        }
      };

      try {
        const formattedSuggestions = await fetchWithRetry();
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Error in debouncedFetchSuggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Add current location function
  const getCurrentLocation = (type: 'origin' | 'destination') => {
    if (!navigator.geolocation) {
      setErrors(prev => ({
        ...prev,
        [type]: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `${NOMINATIM_API_URL}/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'RVR-App/1.0'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data) {
            // Create location object with correct coordinate order [lat, lon]
            const location: Location = {
              label: data.display_name,
              value: data.display_name,
              coordinates: [parseFloat(data.lat), parseFloat(data.lon)] // Note: [lat, lon] order
            };
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              [type]: location.value
            }));
            
            // Update markers with correct coordinate order
            setMarkers(prev => ({
              ...prev,
              [type]: [parseFloat(data.lat), parseFloat(data.lon)] // Note: [lat, lon] order
            }));
            
            // Update map center
            setMapCenter([parseFloat(data.lat), parseFloat(data.lon)]); // Note: [lat, lon] order
            
            // Update suggestions to include the current location
            setSuggestions(prev => {
              const existing = prev.find(s => s.value === location.value);
              if (!existing) {
                return [...prev, location];
              }
              return prev;
            });
            
            // Only calculate route if both locations are set and different
            const otherLocation = type === 'origin' ? formData.destination : formData.origin;
            if (otherLocation && otherLocation !== location.value) {
              calculateRouteDetails(
                type === 'origin' ? location.value : otherLocation,
                type === 'destination' ? location.value : otherLocation,
                formData.isRoundTrip
              );
            }
          }
        } catch (error) {
          console.error('Error getting current location:', error);
          setErrors(prev => ({
            ...prev,
            [type]: 'Could not determine your location. Please enter it manually.'
          }));
        } finally {
          setRouteLoading(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        let errorMessage = 'Could not determine your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your connection and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        setErrors(prev => ({
          ...prev,
          [type]: errorMessage
        }));
        setRouteLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Function to handle location selection
  const handleLocationSelect = async (
    location: Location | null,
    type: 'origin' | 'destination'
  ) => {
    if (!location) return;

    try {
      const coordinates = await geocodeLocation(location.value);
      if (coordinates) {
        setMarkers(prev => ({
          ...prev,
          [type]: {
            position: coordinates,
            label: location.label
          }
        }));
        setFormData(prev => ({
          ...prev,
          [type]: location.value
        }));

        // Only calculate route if both locations are selected and they are different
        const otherLocation = type === 'origin' ? formData.destination : formData.origin;
        if (otherLocation && otherLocation !== location.value) {
          calculateRouteDetails(
            type === 'origin' ? location.value : otherLocation,
            type === 'destination' ? location.value : otherLocation,
            formData.isRoundTrip
          );
        }
      }
    } catch (error) {
      console.error('Error handling location select:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination || !formData.date) {
      setErrors({ origin: 'Please fill in all required fields', destination: 'Please fill in all required fields' });
      return;
    }

    try {
      setRouteLoading(true);
      setRouteError(null);

      // Calculate route details
      const routeDetails = await calculateRouteDetails(formData.origin, formData.destination, formData.isRoundTrip);
      
      if (!routeDetails) {
        throw new Error('Could not calculate route details');
      }

      // Calculate base MPG based on vehicle configuration
      const baseMPG = getBaseMPG(
        truckDetails.vehicleClass,
        truckDetails.wheelConfig,
        truckDetails.fuelType,
        truckDetails.loadStatus
      );

      // Calculate MPG adjustment for trailer weight if towing
      let mpgAdjustment = 1;
      if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
        const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
        mpgAdjustment = Math.max(0, 1 - (trailerWeight / 10000)); // Adjust MPG based on trailer weight
      }

      // Calculate adjusted MPG
      const adjustedMPG = baseMPG * mpgAdjustment;

      // Calculate fuel amount and cost
      const fuelAmount = routeDetails.distance / adjustedMPG;
      const fuelCost = fuelAmount * parseFloat(String(truckDetails.currentFuelPrice));
      const costPerMile = fuelCost / routeDetails.distance;

      // Create new trip object with calculated values
      const newTrip: Trip = {
        id: Date.now().toString(),
        date: formData.date,
        startOdometer: 0,
        endOdometer: 0,
        fuelAmount,
        fuelCost,
        notes: '',
        mpg: adjustedMPG,
        costPerMile,
        vehicleDetails: {
          vehicleClass: truckDetails.vehicleClass,
          wheelConfig: truckDetails.wheelConfig,
          fuelType: truckDetails.fuelType,
          loadStatus: truckDetails.loadStatus,
          trailerWeight: String(truckDetails.trailerWeight),
          currentFuelPrice: String(truckDetails.currentFuelPrice)
        },
        route: {
          origin: formData.origin,
          destination: formData.destination,
          distance: routeDetails.distance,
          oneWayDistance: routeDetails.oneWayDistance,
          duration: routeDetails.duration,
          coordinates: routeDetails.coordinates,
          routeGeometry: routeDetails.routeGeometry,
          isRoundTrip: formData.isRoundTrip,
        }
      };

      // Add trip to history
      setTrips(prevTrips => [...prevTrips, newTrip]);

      // Reset form
      setFormData({
        date: '',
        origin: '',
        destination: '',
        distance: '',
        isRoundTrip: false,
        elevation: null,
        estimatedMPG: '',
        fuelAmount: '',
        fuelCost: '',
      });
      setMarkers({});

    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'An error occurred while processing the trip');
    } finally {
      setRouteLoading(false);
    }
  };

  // Calculate total statistics
  const totalStats = useMemo(() => {
    return trips.reduce((acc, trip) => {
      const miles = trip.route?.distance || 0;
      return {
        totalMiles: acc.totalMiles + miles,
        totalFuelCost: acc.totalFuelCost + trip.fuelCost,
        totalFuelAmount: acc.totalFuelAmount + trip.fuelAmount,
      };
    }, { totalMiles: 0, totalFuelCost: 0, totalFuelAmount: 0 });
  }, [trips]);

  // Calculate average statistics
  const averageStats = useMemo(() => {
    if (trips.length === 0) return { mpg: 0, costPerMile: 0 };
    return {
      mpg: totalStats.totalMiles / totalStats.totalFuelAmount,
      costPerMile: totalStats.totalFuelCost / totalStats.totalMiles,
    };
  }, [totalStats]);

  // Sort trips
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'mpg':
          comparison = a.mpg - b.mpg;
          break;
        case 'costPerMile':
          comparison = a.costPerMile - b.costPerMile;
          break;
        case 'miles':
          comparison = (a.route?.distance || 0) - (b.route?.distance || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [trips, sortField, sortOrder]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return sortedTrips.map(trip => {
      // Ensure we have valid numbers for MPG and cost per mile
      const mpg = isNaN(trip.mpg) || !isFinite(trip.mpg) ? 0 : trip.mpg;
      const costPerMile = isNaN(trip.costPerMile) || !isFinite(trip.costPerMile) ? 0 : trip.costPerMile;
      
      return {
        date: new Date(trip.date).toLocaleDateString(),
        mpg: Number(mpg.toFixed(1)),
        costPerMile: Number(costPerMile.toFixed(3))
      };
    });
  }, [sortedTrips]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 800,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4,
          textAlign: 'center',
          letterSpacing: '-1px',
          fontSize: { xs: '2rem', md: '2.5rem' }
        }}
      >
        Trip Tracker
      </Typography>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        {/* Always visible fuel estimates section */}
        <Paper 
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Vehicle Specifications
          </Typography>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={truckDetails.vehicleClass}
                label="Vehicle Type"
                onChange={(e) => handleTruckDetailsChange('vehicleClass', e.target.value)}
              >
                <ListSubheader>Pickup Trucks</ListSubheader>
                <MenuItem value="class1">Class 1 (½ Ton - F-150, Silverado 1500, Ram 1500)</MenuItem>
                <MenuItem value="class2">Class 2 (¾ Ton - F-250, Silverado 2500, Ram 2500)</MenuItem>
                <MenuItem value="class3">Class 3 (1 Ton - F-350, Silverado 3500, Ram 3500)</MenuItem>
                <MenuItem value="class4">Class 4 (1¼ Ton - F-450, Silverado 4500, Ram 4500)</MenuItem>
                
                <ListSubheader>Drivable RVs</ListSubheader>
                <MenuItem value="classA">Class A (Large Motorhome, 30-45ft)</MenuItem>
                <MenuItem value="classB">Class B (Van Camper, 18-24ft)</MenuItem>
                <MenuItem value="classBPlus">Class B+ (Extended Van, 24-28ft)</MenuItem>
                <MenuItem value="classC">Class C (Cab-Over, 25-35ft)</MenuItem>
                <MenuItem value="superC">Super C (Truck Chassis, 30-40ft)</MenuItem>
              </Select>
            </FormControl>

            {truckDetails.vehicleClass === 'class1' || 
             truckDetails.vehicleClass === 'class2' || 
             truckDetails.vehicleClass === 'class3' || 
             truckDetails.vehicleClass === 'class4' ? (
              <FormControl fullWidth>
                <InputLabel>Wheel Configuration</InputLabel>
                <Select
                  value={truckDetails.wheelConfig}
                  label="Wheel Configuration"
                  onChange={(e) => handleTruckDetailsChange('wheelConfig', e.target.value)}
                >
                  <MenuItem value="srw">Single Rear Wheel (SRW)</MenuItem>
                  <MenuItem value="drw">Dual Rear Wheel (DRW)</MenuItem>
                </Select>
              </FormControl>
            ) : null}

            <FormControl fullWidth>
              <InputLabel>Load Status</InputLabel>
              <Select
                value={truckDetails.loadStatus}
                label="Load Status"
                onChange={(e) => handleTruckDetailsChange('loadStatus', e.target.value)}
              >
                <MenuItem value="empty">Empty</MenuItem>
                <MenuItem value="loaded">Loaded</MenuItem>
                <MenuItem value="towing">Towing</MenuItem>
              </Select>
            </FormControl>

            {truckDetails.loadStatus === 'towing' && (
                    <TextField
                label="Trailer Weight (lbs)"
                      type="number"
                value={truckDetails.trailerWeight}
                onChange={(e) => {
                  const value = e.target.value;
                  handleTruckDetailsChange('trailerWeight', value);
                }}
                inputProps={{ 
                  min: 0, 
                  step: 100
                }}
                helperText="Enter weight in pounds"
              />
            )}

                    <TextField
              label="Fuel Tank Size (gallons)"
                      type="number"
              value={truckDetails.fuelTankSize}
              onChange={(e) => {
                const value = e.target.value;
                handleTruckDetailsChange('fuelTankSize', value);
              }}
              inputProps={{ 
                min: 0, 
                step: 1
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={truckDetails.fuelType}
                label="Fuel Type"
                onChange={(e) => handleTruckDetailsChange('fuelType', e.target.value)}
              >
                <MenuItem value="gas">Gasoline</MenuItem>
                <MenuItem value="diesel">Diesel</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                label="Current Fuel Price ($/gallon)"
                      type="number"
                value={truckDetails.currentFuelPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  handleTruckDetailsChange('currentFuelPrice', value);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                  }
                }}
                inputProps={{ 
                  step: "0.01",
                  min: "0"
                }}
                helperText={`Source: ${priceSource === 'EIA' ? 'EIA Weekly Average' : 'Default Price'}`}
              />
              <Tooltip title="Fetch latest weekly average price from U.S. Energy Information Administration">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsLoadingFuelPrice(true);
                    setFuelPriceError(null);
                    
                    const seriesId = truckDetails.fuelType === 'gas' 
                      ? 'PET.EMM_EPM0_PTE_NUS_DPG.W'
                      : 'PET.EMD_EPD2D_PTE_NUS_DPG.W';

                    fetch(`${EIA_API_BASE_URL}/seriesid/${seriesId}?api_key=${EIA_API_KEY}`)
                      .then(response => {
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                      })
                      .then(data => {
                        if (data.response?.data?.[0]?.value) {
                          const price = data.response.data[0].value;
                          setTruckDetails(prev => ({ ...prev, currentFuelPrice: price.toString() }));
                          setPriceSource('EIA');
                        } else {
                          throw new Error('No price data available');
                        }
                      })
                      .catch(error => {
                        console.error('Error fetching fuel price:', error);
                        setFuelPriceError('Failed to fetch current fuel price. Using default value.');
                        setTruckDetails(prev => ({
                          ...prev,
                          currentFuelPrice: DEFAULT_FUEL_PRICES[prev.fuelType].toString()
                        }));
                        setPriceSource('default');
                      })
                      .finally(() => {
                        setIsLoadingFuelPrice(false);
                      });
                  }}
                  disabled={isLoadingFuelPrice}
                >
                  {isLoadingFuelPrice ? 'Updating...' : 'Get Latest Price'}
                </Button>
              </Tooltip>
            </Box>

            {fuelPriceError && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {fuelPriceError}
              </Alert>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Estimated MPG
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                 truckDetails.vehicleClass === 'class2' || 
                                 truckDetails.vehicleClass === 'class3' || 
                                 truckDetails.vehicleClass === 'class4'
                    ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                    : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                  
                  let mpgAdjustment = 1.0;
                  
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `${adjustedMPG.toFixed(1)} MPG`;
                })()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Estimated Range
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const fuelTankSize = parseFloat(String(truckDetails.fuelTankSize));
                  if (isNaN(fuelTankSize) || fuelTankSize <= 0) return 'Enter fuel tank size';
                  
                  const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                 truckDetails.vehicleClass === 'class2' || 
                                 truckDetails.vehicleClass === 'class3' || 
                                 truckDetails.vehicleClass === 'class4'
                    ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                    : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                  
                  let mpgAdjustment = 1.0;
                  
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `${(fuelTankSize * adjustedMPG).toFixed(0)} miles`;
                })()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Cost per Mile
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const currentFuelPrice = parseFloat(String(truckDetails.currentFuelPrice));
                  if (isNaN(currentFuelPrice) || currentFuelPrice <= 0) return 'Enter fuel price';
                  
                  const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                 truckDetails.vehicleClass === 'class2' || 
                                 truckDetails.vehicleClass === 'class3' || 
                                 truckDetails.vehicleClass === 'class4'
                    ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                    : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                  
                  let mpgAdjustment = 1.0;
                  
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `$${(currentFuelPrice / adjustedMPG).toFixed(2)}`;
                })()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Tank Refill Cost
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const fuelTankSize = parseFloat(String(truckDetails.fuelTankSize));
                  const currentFuelPrice = parseFloat(String(truckDetails.currentFuelPrice));
                  if (isNaN(fuelTankSize) || fuelTankSize <= 0) return 'Enter fuel tank size';
                  if (isNaN(currentFuelPrice) || currentFuelPrice <= 0) return 'Enter fuel price';
                  return `$${(fuelTankSize * currentFuelPrice).toFixed(2)}`;
                })()}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          centered
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              height: 3,
              borderRadius: 1.5,
            }
          }}
        >
          <Tab 
            icon={<Route />} 
            label="Plan Trip" 
            iconPosition="start"
            sx={{
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
              }
            }}
          />
          <Tab 
            icon={<History />} 
            label="Trip History" 
            iconPosition="start"
            sx={{
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
              }
            }}
          />
        </Tabs>

        {activeTab === 0 && (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
            {/* Trip Planning Form */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Trip Details
              </Typography>
              <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        name="date"
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '64px',
                            fontSize: '1.2rem'
                          }
                        }}
                        inputProps={{
                          min: new Date().toISOString().split('T')[0],
                          max: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                        }}
                      />
                      <IconButton
                        onClick={() => {
                          const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                          if (dateInput) dateInput.showPicker();
                        }}
                        sx={{ 
                          height: '64px',
                          width: '64px',
                          color: 'primary.main'
                        }}
                      >
                        <CalendarToday />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {renderAutocomplete('origin')}
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => getCurrentLocation('origin')}
                          sx={{ 
                            minWidth: '64px',
                            width: '64px',
                            height: '64px',
                            borderRadius: 2
                          }}
                          title="Use current location"
                        >
                          <MyLocation />
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {renderAutocomplete('destination')}
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => getCurrentLocation('destination')}
                          sx={{ 
                            minWidth: '64px',
                            width: '64px',
                            height: '64px',
                            borderRadius: 2
                          }}
                          title="Use current location"
                        >
                          <MyLocation />
                        </Button>
                      </Box>
                    </Box>

                {routeError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {routeError}
                  </Alert>
                )}

                {(markers.origin || markers.destination) && (
                  <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden', position: 'relative', mb: 3 }}>
                    <MapContainer
                      center={mapCenter}
                      zoom={6}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <ZoomControl position="topright" />
                      <MapUpdater center={mapCenter} />
                      {markers.origin && markers.origin[0] && markers.origin[1] && (
                        <Marker position={markers.origin}>
                          <Popup>Origin: {formData.origin}</Popup>
                        </Marker>
                      )}
                      {markers.destination && markers.destination[0] && markers.destination[1] && (
                        <Marker position={markers.destination}>
                          <Popup>Destination: {formData.destination}</Popup>
                        </Marker>
                      )}
                      {markers.route && markers.route.length > 0 && (
                        <Polyline
                          positions={markers.route}
                          pathOptions={{
                            color: theme.palette.primary.main,
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '5, 10'
                          }}
                        />
                      )}
                    </MapContainer>
                  </Box>
                )}

                {formData.origin && formData.destination && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Total Miles</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formData.distance || '0.0'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Estimated Fuel Needed</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {(() => {
                          const distance = parseFloat(formData.distance) || 0;
                          const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                         truckDetails.vehicleClass === 'class2' || 
                                         truckDetails.vehicleClass === 'class3' || 
                                         truckDetails.vehicleClass === 'class4'
                            ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                            : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                          
                          let mpgAdjustment = 1.0;
                          
                          if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                            const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                            mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                          }
                          
                          const adjustedMPG = baseMPG * mpgAdjustment;
                          return `${(distance / adjustedMPG).toFixed(1)} gal`;
                        })()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Estimated Cost</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {(() => {
                          const distance = parseFloat(formData.distance) || 0;
                          const currentFuelPrice = parseFloat(String(truckDetails.currentFuelPrice)) || 0;
                          const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                         truckDetails.vehicleClass === 'class2' || 
                                         truckDetails.vehicleClass === 'class3' || 
                                         truckDetails.vehicleClass === 'class4'
                            ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                            : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                          
                          let mpgAdjustment = 1.0;
                          
                          if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                            const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                            mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                          }
                          
                          const adjustedMPG = baseMPG * mpgAdjustment;
                          const gallonsNeeded = distance / adjustedMPG;
                          return `$${(gallonsNeeded * currentFuelPrice).toFixed(2)}`;
                        })()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Cost per Mile</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {(() => {
                          const currentFuelPrice = parseFloat(String(truckDetails.currentFuelPrice)) || 0;
                          const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                         truckDetails.vehicleClass === 'class2' || 
                                         truckDetails.vehicleClass === 'class3' || 
                                         truckDetails.vehicleClass === 'class4'
                            ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                            : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                          
                          let mpgAdjustment = 1.0;
                          
                          if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                            const trailerWeight = parseFloat(String(truckDetails.trailerWeight));
                            mpgAdjustment *= (1 - (trailerWeight * 0.000001));
                          }
                          
                          const adjustedMPG = baseMPG * mpgAdjustment;
                          return `$${(currentFuelPrice / adjustedMPG).toFixed(2)}`;
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isRoundTrip}
                        onChange={(e) => {
                          const isRoundTrip = e.target.checked;
                          calculateRouteDetails(formData.origin, formData.destination, isRoundTrip);
                        }}
                      />
                    }
                    label="Round Trip"
                  />
                    <Button
                      type="submit"
                      variant="contained"
                    size="large"
                    disabled={!formData.date || !formData.origin || !formData.destination}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      }
                    }}
                    >
                      Add Trip
                    </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 4 }}>
            {/* Trip History Table */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Trip History
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortField}
                      label="Sort By"
                      onChange={(e) => setSortField(e.target.value as SortField)}
                    >
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="mpg">MPG</MenuItem>
                      <MenuItem value="costPerMile">Cost per Mile</MenuItem>
                      <MenuItem value="miles">Miles</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}>
                    <IconButton onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                      {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="right">Miles</TableCell>
                  <TableCell align="right">Fuel (gal)</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">MPG</TableCell>
                  <TableCell align="right">Cost/Mile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {sortedTrips.map((trip) => (
                  <TableRow key={trip.id}>
                      <TableCell>{trip.date}</TableCell>
                    <TableCell>
                        {trip.route ? (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {trip.route.origin} → {trip.route.destination}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trip.route.distance.toFixed(1)} miles • {trip.route.duration}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Vehicle: {trip.vehicleDetails.vehicleClass.replace('class', 'Class ').toUpperCase()}
                              {trip.vehicleDetails.wheelConfig ? ` (${trip.vehicleDetails.wheelConfig.toUpperCase()})` : ''}
                              {trip.vehicleDetails.loadStatus === 'towing' && trip.vehicleDetails.trailerWeight ? 
                                ` • Towing ${trip.vehicleDetails.trailerWeight} lbs` : ''}
                            </Typography>
                          </Box>
                        ) : (
                          'Manual Entry'
                        )}
                    </TableCell>
                      <TableCell align="right">
                        {trip.route ? trip.route.distance.toFixed(1) : '0.0'} miles
                      </TableCell>
                      <TableCell align="right">
                        {trip.fuelAmount.toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        ${trip.fuelCost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {trip.mpg.toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        ${trip.costPerMile.toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </Paper>

            {/* Statistics and Chart */}
            <Box sx={{ mt: 4, display: 'grid', gap: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Trip Statistics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Miles</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalStats.totalMiles.toFixed(1)}
                    </Typography>
    </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Fuel Cost</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ${totalStats.totalFuelCost.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Fuel Used</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalStats.totalFuelAmount.toFixed(1)} gal
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Average MPG</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {averageStats.mpg.toFixed(1)} MPG
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  height: 300
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Fuel Economy Trend
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'MPG') {
                          return [`${value.toFixed(1)} MPG`, name];
                        } else {
                          return [`$${value.toFixed(3)}`, name];
                        }
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="mpg"
                      stroke={theme.palette.primary.main}
                      name="MPG"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="costPerMile"
                      stroke={theme.palette.secondary.main}
                      name="Cost per Mile"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TripTracker; 