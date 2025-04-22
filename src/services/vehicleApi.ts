export interface VehicleMake {
  Make_ID: number;
  Make_Name: string;
}

export interface VehicleModel {
  Model_ID: number;
  Model_Name: string;
}

export interface VehicleTrim {
  Trim_ID: number;
  Trim_Name: string;
}

export interface VehicleData {
  make: string;
  model: string;
  trim: string;
  year: number;
  specifications: {
    curbWeight: number;
    maxPayload: number;
    towingCapacity: number;
    gvwr: number;
    gcvwr: number;
  };
}

export interface VehicleSpecs {
  curbWeight: number;
  maxPayload: number;
  towingCapacity: number;
  gvwr: number;
  gcvwr: number;
}

export interface MakeModels {
  [key: string]: VehicleSpecs;
}

export interface DefaultSpecs {
  [key: string]: MakeModels;
}

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api';

const TRUCK_MANUFACTURERS = [
  'CHEVROLET', 'FORD', 'RAM', 'GMC', 'TOYOTA', 'NISSAN', 'DODGE', 
  'JEEP', 'HONDA', 'HUMMER', 'RIVIAN', 'INTERNATIONAL', 'FREIGHTLINER'
];

export const fetchMakes = async (year: number): Promise<VehicleMake[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/vehicles/GetAllMakes?format=json`
    );
    const data = await response.json();
    console.log('All makes:', data.Results);
    
    // Filter for truck manufacturers
    const truckMakes = (data.Results || []).filter((make: VehicleMake) => 
      TRUCK_MANUFACTURERS.includes(make.Make_Name.toUpperCase())
    );
    
    console.log('Filtered truck makes:', truckMakes);
    return truckMakes;
  } catch (error) {
    console.error('Error fetching makes:', error);
    return [];
  }
};

export const fetchModels = async (makeId: number, year: number): Promise<VehicleModel[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/vehicles/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`
    );
    const data = await response.json();
    console.log('Models response:', data);
    if (data.Results) {
      console.log('Available models:', data.Results.map((m: VehicleModel) => m.Model_Name));
    }
    return data.Results || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

export const fetchTrims = async (makeName: string, modelName: string, year: number): Promise<Array<{ Trim_ID: number; Trim_Name: string }>> => {
  try {
    console.log(`Fetching trims for ${makeName} ${modelName} ${year}`);
    
    // First get the make ID
    const makesResponse = await fetch(
      `${BASE_URL}/vehicles/GetAllMakes?format=json`
    );
    const makesData = await makesResponse.json();
    const make = makesData.Results.find((m: any) => m.Make_Name.toUpperCase() === makeName.toUpperCase());
    
    if (!make) {
      throw new Error(`Make ${makeName} not found`);
    }
    
    // Get models with trim information using make ID
    const modelResponse = await fetch(
      `${BASE_URL}/vehicles/GetModelsForMakeIdYear/makeId/${make.Make_ID}/modelyear/${year}?format=json`
    );
    const modelData = await modelResponse.json();
    console.log('Full model data:', modelData.Results);
    
    if (!modelData.Results || modelData.Results.length === 0) {
      throw new Error(`No models found for ${makeName} ${year}`);
    }

    // Filter for our specific model and extract trims
    const modelResults = modelData.Results.filter((m: any) => 
      m.Model_Name.toUpperCase().includes(modelName.toUpperCase())
    );
    
    console.log('Filtered model results:', modelResults);
    
    if (modelResults.length === 0) {
      throw new Error(`Model ${modelName} not found for year ${year}`);
    }

    // Return common trim levels for trucks
    const commonTrims = [
      'XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited',
      'Base', 'STX', 'FX4', 'Tremor', 'Raptor'
    ];
    
    const trims = commonTrims.map((trimName, index) => ({
      Trim_ID: index + 1,
      Trim_Name: trimName
    }));

    console.log('Found trims:', trims);
    return trims;
  } catch (error) {
    console.error('Error fetching trims:', error);
    return [];
  }
};

export const fetchVehicleData = async (
  make: string,
  model: string,
  trim: string,
  year: number
): Promise<VehicleData> => {
  try {
    console.log(`Fetching specs for ${year} ${make} ${model} ${trim}`);
    
    // Return empty values for manual input
    return {
      make,
      model,
      trim,
      year,
      specifications: {
        curbWeight: 0,
        maxPayload: 0,
        towingCapacity: 0,
        gvwr: 0,
        gcvwr: 0
      }
    };
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    throw error;
  }
}; 