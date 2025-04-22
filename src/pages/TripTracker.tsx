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
import { ArrowUpward, ArrowDownward, CalendarToday, MyLocation } from '@mui/icons-material';
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
  trailerWeight?: string; // in pounds
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

const OPENROUTE_API_URL = 'https://api.openrouteservice.org';

const CORS_PROXY = 'https://corsproxy.io/?';
const CORS_KEY = import.meta.env.VITE_CORS_KEY;

interface RouteSegment {
  distance: number;
  duration: number;
  steps: Array<{
    distance: number;
    duration: number;
    type: number;
    instruction: string;
    name: string;
    way_points: [number, number];
  }>;
  elevation: number[];
}

interface OpenRouteResponse {
  routes: Array<{
    segments: RouteSegment[];
    summary: {
      distance: number;
      duration: number;
      ascent: number;
      descent: number;
    };
    geometry: {
      coordinates: [number, number][];
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

interface ElevationData {
  elevation: number;
  distance: number;
}

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
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

const TripTracker: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [truckDetails, setTruckDetails] = useState<TruckDetails>({
    fuelTankSize: '',
    fuelType: 'gas',
    vehicleClass: 'class1',
    wheelConfig: 'srw',
    loadStatus: 'empty',
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
      const targetUrl = `${OPENROUTE_API_URL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(testLocation)}&layers=address,street,venue&size=1&boundary.country=US`;

      console.log('Testing API connection with URL:', targetUrl);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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

  const handleTruckDetailsChange = (field: keyof TruckDetails, value: string) => {
    setTruckDetails(prev => {
      const newDetails = { ...prev, [field]: value };
      
      // When fuel type changes, automatically fetch the latest price
      if (field === 'fuelType') {
        setIsLoadingFuelPrice(true);
        setFuelPriceError(null);
        
        // EIA series IDs for national average prices
        const seriesId = value === 'gas' 
          ? 'PET.EMM_EPM0_PTE_NUS_DPG.W'  // Weekly U.S. All Grades All Formulations Retail Gasoline Prices
          : 'PET.EMD_EPD2D_PTE_NUS_DPG.W'; // Weekly U.S. No 2 Diesel Retail Prices

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
              newDetails.currentFuelPrice = price.toString();
              setPriceSource('EIA');
            } else {
              throw new Error('No price data available');
            }
          })
          .catch(error => {
            console.error('Error fetching fuel price:', error);
            setFuelPriceError('Failed to fetch current fuel price. Using default value.');
            newDetails.currentFuelPrice = DEFAULT_FUEL_PRICES[value as 'gas' | 'diesel'].toString();
            setPriceSource('default');
          })
          .finally(() => {
            setIsLoadingFuelPrice(false);
          });
      }
      
      return newDetails;
    });
  };

  // Update the input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    if (value.trim()) {
      debouncedFetchSuggestions(value.trim());
    } else {
      setSuggestions([]);
    }
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
      const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouteService API key is missing');
      }

      const targetUrl = `${OPENROUTE_API_URL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(location)}&layers=address,street,venue&size=1&boundary.country=US`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'RVR-App/1.0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Geocoding API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.features?.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return [lat, lon];
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
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
      setRouteLoading(true);
      setRouteError(null);

      const [originCoords, destCoords] = await Promise.all([
        geocodeLocation(origin),
        geocodeLocation(destination)
      ]);

      if (!originCoords || !destCoords) {
        throw new Error('Could not find one or both locations');
      }

      // Get the road route using OpenRouteService
      const [lat1, lon1] = originCoords;
      const [lat2, lon2] = destCoords;
      
      const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouteService API key is missing. Please check your environment variables.');
      }

      // Try to find a route with the original coordinates
      const targetUrl = `${OPENROUTE_API_URL}/directions/driving-hgv?api_key=${apiKey}&start=${lon1},${lat1}&end=${lon2},${lat2}`;
      console.log('Calculating route with URL:', targetUrl);
      
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json',
          'User-Agent': 'rvr-app'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to calculate route. Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response structure from route service');
      }

      // Handle specific OpenRouteService error codes
      if (data.error) {
        const errorCode = data.error.code;
        const errorMessage = data.error.message;
        
        switch (errorCode) {
          case 2010: // No routable point found
            throw new Error(
              `Could not find a valid route near ${destination}. This usually means the location is slightly off the road network. ` +
              `Try using a nearby landmark, intersection, or a more general location.`
            );
          case 2004: // Invalid coordinates
            throw new Error('Invalid location coordinates. Please check the addresses and try again.');
          case 2003: // No route found
            throw new Error('No route could be found between these locations. Please try different start or end points.');
          default:
            throw new Error(`Route calculation failed: ${errorMessage}`);
        }
      }
      
      if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
        console.error('No routes in response:', data);
        throw new Error('No routes found in the response. Please check your locations and try again.');
      }

      const route = data.routes[0];
      if (!route || !route.summary || !route.geometry) {
        console.error('Invalid route data:', route);
        throw new Error('Invalid route data received. Please try again.');
      }

      const oneWayDistance = route.summary.distance * 0.000621371;
      const totalDistance = isRoundTrip ? oneWayDistance * 2 : oneWayDistance;

      // Calculate base MPG based on vehicle configuration
      const baseMPG = truckDetails.vehicleClass === 'class1' || 
                     truckDetails.vehicleClass === 'class2' || 
                     truckDetails.vehicleClass === 'class3' || 
                     truckDetails.vehicleClass === 'class4'
        ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
        : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
      
      // Adjust MPG based on route characteristics
      let mpgAdjustment = 1.0;
      
      // Adjust for elevation changes
      const elevationFactor = 1 - (route.summary.ascent * 0.00005); // 5% reduction per 100m ascent
      mpgAdjustment *= elevationFactor;

      // Adjust for road types
      const highwayPercentage = route.segments.reduce((acc: number, segment: { steps: Array<{ type: number }> }) => {
        const highwaySteps = segment.steps.filter((step: { type: number }) => 
          step.type >= 0 && step.type <= 3 // Highway types
        ).length;
        return acc + (highwaySteps / segment.steps.length);
      }, 0) / route.segments.length;

      // Better MPG on highways
      mpgAdjustment *= (1 + (highwayPercentage * 0.1)); // 10% better on highways

      // Additional adjustment for towing weight
      if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
        const trailerWeight = parseFloat(truckDetails.trailerWeight);
        // Reduce MPG by 0.1% per 1000 lbs of trailer weight
        mpgAdjustment *= (1 - (trailerWeight * 0.000001));
      }

      // Calculate adjusted MPG
      const estimatedMPG = baseMPG * mpgAdjustment;

      // Calculate fuel usage and cost
      const gallonsNeeded = totalDistance / estimatedMPG;
      const currentFuelPrice = parseFloat(truckDetails.currentFuelPrice) || 0;
      const fuelCost = gallonsNeeded * currentFuelPrice;

      // Update form data with calculated values
      setFormData(prev => ({
        ...prev,
        distance: totalDistance.toFixed(1),
        fuelAmount: gallonsNeeded.toFixed(1),
        fuelCost: fuelCost.toFixed(2),
        isRoundTrip,
        elevation: {
          ascent: route.summary.ascent.toFixed(0),
          descent: route.summary.descent.toFixed(0)
        },
        estimatedMPG: estimatedMPG.toFixed(1)
      }));

      const originCoord: [number, number] = [lat1, lon1];
      const destCoord: [number, number] = [lat2, lon2];

      // Convert route coordinates to [lat, lon] format for Leaflet
      const routeCoordinates = route.geometry.coordinates.reduce((acc: [[number, number], [number, number]], coord: [number, number]) => {
        return [
          [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
          [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
        ];
      }, [[lat1, lon1], [lat2, lon2]]);

      setMarkers({
        origin: originCoord,
        destination: destCoord,
        route: routeCoordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number])
      });

      // Calculate bounds to fit the entire route
      const bounds = routeCoordinates.reduce((acc: [[number, number], [number, number]], coord: [number, number]) => {
        return [
          [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
          [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
        ];
      }, [[lat1, lon1], [lat2, lon2]]);

      // Center map on the route
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLon = (bounds[0][1] + bounds[1][1]) / 2;
      setMapCenter([centerLat, centerLon]);

      return {
        distance: totalDistance,
        oneWayDistance,
        duration: `${Math.floor(route.summary.duration / 3600)}h ${Math.round((route.summary.duration % 3600) / 60)}m`,
        coordinates: {
          origin: originCoord,
          destination: destCoord
        },
        routeGeometry: {
          type: "LineString",
          coordinates: route.geometry.coordinates
        },
        elevation: {
          ascent: route.summary.ascent,
          descent: route.summary.descent
        },
        estimatedMPG
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError(error instanceof Error ? error.message : 'Failed to calculate route. Please check your locations and try again.');
      return null;
    } finally {
      setRouteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let routeInfo = null;
    if (formData.origin && formData.destination) {
      routeInfo = await calculateRouteDetails(formData.origin, formData.destination, formData.isRoundTrip);
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      date: formData.date,
      startOdometer: 0,
      endOdometer: 0,
      fuelAmount: parseFloat(formData.fuelAmount) || 0,
      fuelCost: parseFloat(formData.fuelCost) || 0,
      notes: '',
      mpg: truckDetails.averageMPG ? parseFloat(truckDetails.averageMPG) : 0,
      costPerMile: formData.distance ? (parseFloat(formData.fuelCost) / parseFloat(formData.distance)) : 0,
      route: routeInfo ? {
        origin: formData.origin,
        destination: formData.destination,
        distance: routeInfo.distance,
        oneWayDistance: routeInfo.oneWayDistance,
        duration: routeInfo.duration,
        coordinates: routeInfo.coordinates,
        routeGeometry: routeInfo.routeGeometry,
        isRoundTrip: formData.isRoundTrip
      } : undefined
    };
    
    setTrips(prev => [...prev, newTrip]);
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
    return sortedTrips.map(trip => ({
      date: new Date(trip.date).toLocaleDateString(),
      mpg: trip.mpg,
      costPerMile: trip.costPerMile,
    }));
  }, [sortedTrips]);

  // Update the debounced fetch suggestions function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${import.meta.env.VITE_OPENROUTE_API_KEY}&text=${encodeURIComponent(input)}`,
          {
            headers: {
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
              'Content-Type': 'application/json',
              'User-Agent': 'rvr-app'
            }
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Add current location function
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
          if (!apiKey) {
            throw new Error('OpenRouteService API key is missing');
          }

          try {
            const targetUrl = `${OPENROUTE_API_URL}/geocode/reverse?api_key=${apiKey}&point.lon=${longitude}&point.lat=${latitude}&layers=address,street,venue&size=1`;
            
            const response = await fetch(targetUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'RVR-App/1.0'
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Reverse geocoding API error:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data?.features?.length > 0) {
              const feature = data.features[0];
              const location: Location = {
                label: feature.properties.label,
                value: feature.properties.label,
                coordinates: feature.geometry.coordinates
              };
              handleLocationSelect(location, 'origin');
            }
          } catch (error) {
            console.error('Error getting current location:', error);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  // Function to handle location selection
  const handleLocationSelect = async (
    location: Location | null,
    type: 'origin' | 'destination'
  ) => {
    if (!location) return;

    const newFormData = { ...formData };
    if (type === 'origin') {
      newFormData.origin = location.label;
      setMarkers(prev => ({ ...prev, origin: location.coordinates }));
    } else {
      newFormData.destination = location.label;
      setMarkers(prev => ({ ...prev, destination: location.coordinates }));
    }
    setFormData(newFormData);

    // If both locations are set, calculate the route and update all fields
    if (newFormData.origin && newFormData.destination) {
      const routeInfo = await calculateRouteDetails(
        newFormData.origin,
        newFormData.destination,
        newFormData.isRoundTrip
      );
      if (routeInfo) {
        const gallonsNeeded = routeInfo.distance / (parseFloat(truckDetails.averageMPG) || 0);
        const fuelCost = gallonsNeeded * (parseFloat(truckDetails.currentFuelPrice) || 0);

        setFormData(prev => ({
          ...prev,
          fuelAmount: gallonsNeeded.toFixed(1),
          fuelCost: fuelCost.toFixed(2)
        }));
      }
    }
  };

  // Calculate estimated trip cost
  const calculateTripCost = (miles: number) => {
    if (!parseFloat(truckDetails.averageMPG)) return 0;
    const gallonsNeeded = miles / (parseFloat(truckDetails.averageMPG) || 0);
    return gallonsNeeded * (parseFloat(truckDetails.currentFuelPrice) || 0);
  };

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
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Truck Details" />
          <Tab label="Trip Log" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Truck Specifications
            </Typography>
            
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
                value={truckDetails.trailerWeight || ''}
                onChange={(e) => handleTruckDetailsChange('trailerWeight', e.target.value)}
                inputProps={{ min: 0, step: 100 }}
                helperText="Enter weight in pounds"
              />
            )}

            <TextField
              label="Fuel Tank Size (gallons)"
              type="number"
              value={truckDetails.fuelTankSize}
              onChange={(e) => handleTruckDetailsChange('fuelTankSize', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
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
                onChange={(e) => handleTruckDetailsChange('currentFuelPrice', e.target.value)}
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
                    
                    // EIA series IDs for national average prices
                    const seriesId = truckDetails.fuelType === 'gas' 
                      ? 'PET.EMM_EPM0_PTE_NUS_DPG.W'  // Weekly U.S. All Grades All Formulations Retail Gasoline Prices
                      : 'PET.EMD_EPD2D_PTE_NUS_DPG.W'; // Weekly U.S. No 2 Diesel Retail Prices

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

            <Box sx={{ mt: 2 }}>
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
                  
                  // Adjust for trailer weight if towing
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(truckDetails.trailerWeight);
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001)); // 0.1% reduction per 1000 lbs
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `${adjustedMPG.toFixed(1)} MPG`;
                })()}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Estimated Range
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const fuelTankSize = parseFloat(truckDetails.fuelTankSize);
                  if (isNaN(fuelTankSize) || fuelTankSize <= 0) return 'Enter fuel tank size';
                  
                  const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                 truckDetails.vehicleClass === 'class2' || 
                                 truckDetails.vehicleClass === 'class3' || 
                                 truckDetails.vehicleClass === 'class4'
                    ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                    : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                  
                  let mpgAdjustment = 1.0;
                  
                  // Adjust for trailer weight if towing
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(truckDetails.trailerWeight);
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001)); // 0.1% reduction per 1000 lbs
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `${(fuelTankSize * adjustedMPG).toFixed(0)} miles`;
                })()}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Cost per Mile
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const currentFuelPrice = parseFloat(truckDetails.currentFuelPrice);
                  if (isNaN(currentFuelPrice) || currentFuelPrice <= 0) return 'Enter fuel price';
                  
                  const baseMPG = truckDetails.vehicleClass === 'class1' || 
                                 truckDetails.vehicleClass === 'class2' || 
                                 truckDetails.vehicleClass === 'class3' || 
                                 truckDetails.vehicleClass === 'class4'
                    ? BASE_MPG[truckDetails.vehicleClass][truckDetails.wheelConfig][truckDetails.fuelType][truckDetails.loadStatus]
                    : BASE_MPG[truckDetails.vehicleClass][truckDetails.fuelType][truckDetails.loadStatus];
                  
                  let mpgAdjustment = 1.0;
                  
                  // Adjust for trailer weight if towing
                  if (truckDetails.loadStatus === 'towing' && truckDetails.trailerWeight) {
                    const trailerWeight = parseFloat(truckDetails.trailerWeight);
                    mpgAdjustment *= (1 - (trailerWeight * 0.000001)); // 0.1% reduction per 1000 lbs
                  }
                  
                  const adjustedMPG = baseMPG * mpgAdjustment;
                  return `$${(currentFuelPrice / adjustedMPG).toFixed(2)}`;
                })()}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Cost per Tank
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {(() => {
                  const fuelTankSize = parseFloat(truckDetails.fuelTankSize);
                  const currentFuelPrice = parseFloat(truckDetails.currentFuelPrice);
                  if (isNaN(fuelTankSize) || fuelTankSize <= 0) return 'Enter fuel tank size';
                  if (isNaN(currentFuelPrice) || currentFuelPrice <= 0) return 'Enter fuel price';
                  
                  return `$${(fuelTankSize * currentFuelPrice).toFixed(2)}`;
                })()}
              </Typography>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 3 }}>
              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange(e)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                  max: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                          if (input) {
                            input.showPicker();
                          }
                        }}
                        edge="end"
                      >
                        <CalendarToday />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                  }
                }}
              />
            </Box>

            {/* Route Planning Section */}
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
                Route Planning
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                    value={formData.origin}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        setFormData(prev => ({ ...prev, origin: newValue }));
                      } else if (newValue) {
                        setFormData(prev => ({ ...prev, origin: newValue.label }));
                        if (newValue.coordinates) {
                          setOriginCoordinates(newValue.coordinates);
                        }
                      }
                    }}
                    onInputChange={(_, newInputValue) => {
                      setFormData(prev => ({ ...prev, origin: newInputValue }));
                      debouncedFetchSuggestions(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Origin"
                        required
                        fullWidth
                        margin="normal"
                        error={!!errors.origin}
                        helperText={errors.origin}
                      />
                    )}
                    filterOptions={(options, params) => {
                      const filter = createFilterOptions<Location>();
                      const filtered = filter(options, params);
                      if (params.inputValue !== '') {
                        filtered.push({
                          inputValue: params.inputValue,
                          label: `Add "${params.inputValue}"`,
                          value: params.inputValue,
                          coordinates: [0, 0] // Default coordinates for custom input
                        });
                      }
                      return filtered;
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    id="origin-autocomplete"
                  />
                  <Button
                    variant="outlined"
                    onClick={getCurrentLocation}
                    sx={{ minWidth: 'auto' }}
                    title="Use current location"
                  >
                    <MyLocation />
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                    value={formData.destination}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        setFormData(prev => ({ ...prev, destination: newValue }));
                      } else if (newValue) {
                        setFormData(prev => ({ ...prev, destination: newValue.label }));
                        if (newValue.coordinates) {
                          setDestinationCoordinates(newValue.coordinates);
                        }
                      }
                    }}
                    onInputChange={(_, newInputValue) => {
                      setFormData(prev => ({ ...prev, destination: newInputValue }));
                      debouncedFetchSuggestions(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Destination"
                        required
                        fullWidth
                        margin="normal"
                        error={!!errors.destination}
                        helperText={errors.destination}
                      />
                    )}
                    filterOptions={(options, params) => {
                      const filter = createFilterOptions<Location>();
                      const filtered = filter(options, params);
                      if (params.inputValue !== '') {
                        filtered.push({
                          inputValue: params.inputValue,
                          label: `Add "${params.inputValue}"`,
                          value: params.inputValue,
                          coordinates: [0, 0] // Default coordinates for custom input
                        });
                      }
                      return filtered;
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    id="destination-autocomplete"
                  />
                  <Button
                    variant="outlined"
                    onClick={getCurrentLocation}
                    sx={{ minWidth: 'auto' }}
                    title="Use current location"
                  >
                    <MyLocation />
                  </Button>
                </Box>
                {routeError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {routeError}
                  </Alert>
                )}
                {(markers.origin || markers.destination) && (
                  <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
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
                      {markers.origin && (
                        <Marker position={markers.origin}>
                          <Popup>Origin: {formData.origin}</Popup>
                        </Marker>
                      )}
                      {markers.destination && (
                        <Marker position={markers.destination}>
                          <Popup>Destination: {formData.destination}</Popup>
                        </Marker>
                      )}
                      {markers.route && markers.route.length > 0 && (
                        <Polyline
                          positions={markers.route}
                          color={theme.palette.primary.main}
                          weight={3}
                          opacity={0.7}
                        />
                      )}
                    </MapContainer>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Trip Summary Card */}
            {formData.origin && formData.destination && (
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Trip Summary
                  </Typography>
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
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Miles</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formData.distance || '0.0'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Elevation Change</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formData.elevation ? `+${formData.elevation.ascent}ft / -${formData.elevation.descent}ft` : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Estimated MPG</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formData.estimatedMPG}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Estimated Fuel Needed</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formData.fuelAmount} gal
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Estimated Cost</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ${formData.fuelCost}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

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
        )}

        {trips.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {/* Total Statistics */}
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
                Total Statistics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
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
              </Box>
            </Paper>

            {/* Average Statistics */}
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
                Average Statistics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Average MPG</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {parseFloat(truckDetails.averageMPG).toFixed(1)} MPG
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Average Cost per Mile</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ${parseFloat(truckDetails.currentFuelPrice).toFixed(3)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Chart */}
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
                  <RechartsTooltip />
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

            {/* Trip History Table */}
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Trip History
            </Typography>

            {/* Sorting Controls */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
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
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TripTracker; 