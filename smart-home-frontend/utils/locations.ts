export const STORAGE_LOCATIONS = {
  FRIDGE: 'Fridge',
  FREEZER: 'Freezer',
  PANTRY: 'Pantry',
  CABINET: 'Cabinet',
  COUNTER: 'Counter',
  CONTAINER: 'Container',
  SPICE_RACK: 'Spice Rack',
  WINE_RACK: 'Wine Rack',
  BASEMENT: 'Basement',
  GARAGE: 'Garage',
  OTHER: 'Other',
} as const;

export type StorageLocation = keyof typeof STORAGE_LOCATIONS;

export const getLocationDisplayName = (location: string | null | undefined): string => {
  if (!location) return 'Unknown';
  
  const upperLocation = location.toUpperCase() as StorageLocation;
  return STORAGE_LOCATIONS[upperLocation] || location;
};

export const getDefaultLocationForCategory = (category: string | null | undefined): string => {
  if (!category) return 'PANTRY';
  
  const cat = category.toLowerCase();
  
  switch (cat) {
    case 'dairy':
    case 'meat':
    case 'vegetables':
    case 'fruits':
      return 'FRIDGE';
    case 'frozen':
      return 'FREEZER';
    case 'beverages':
      return 'FRIDGE';
    case 'condiments':
    case 'spices':
      return 'SPICE_RACK';
    case 'grains':
    case 'snacks':
    default:
      return 'PANTRY';
  }
};

export const LOCATION_OPTIONS = Object.entries(STORAGE_LOCATIONS).map(([key, value]) => ({
  value: key,
  label: value,
}));

export const getCategoryDisplayName = (category: string | null | undefined): string => {
  if (!category) return 'Other';
  
  // Capitalize first letter
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};