
/**
 * Standardized locations for Trinidad and Tobago
 * Used across registration forms and matching logic
 */

export interface Location {
  value: string;
  label: string;
  region: 'trinidad' | 'tobago';
}

export const TRINIDAD_AND_TOBAGO_LOCATIONS: Location[] = [
  // Trinidad - Port of Spain Region
  { value: 'port_of_spain', label: 'Port of Spain', region: 'trinidad' },
  { value: 'st_clair', label: 'St. Clair', region: 'trinidad' },
  { value: 'woodbrook', label: 'Woodbrook', region: 'trinidad' },
  { value: 'newtown', label: 'Newtown', region: 'trinidad' },
  { value: 'belmont', label: 'Belmont', region: 'trinidad' },
  { value: 'laventille', label: 'Laventille', region: 'trinidad' },
  
  // Trinidad - San Fernando Region
  { value: 'san_fernando', label: 'San Fernando', region: 'trinidad' },
  { value: 'marabella', label: 'Marabella', region: 'trinidad' },
  { value: 'la_romaine', label: 'La Romaine', region: 'trinidad' },
  { value: 'gasparillo', label: 'Gasparillo', region: 'trinidad' },
  
  // Trinidad - Chaguanas Region
  { value: 'chaguanas', label: 'Chaguanas', region: 'trinidad' },
  { value: 'longdenville', label: 'Longdenville', region: 'trinidad' },
  { value: 'caroni', label: 'Caroni', region: 'trinidad' },
  { value: 'couva', label: 'Couva', region: 'trinidad' },
  
  // Trinidad - Eastern Region
  { value: 'arima', label: 'Arima', region: 'trinidad' },
  { value: 'sangre_grande', label: 'Sangre Grande', region: 'trinidad' },
  { value: 'tunapuna', label: 'Tunapuna', region: 'trinidad' },
  { value: 'st_augustine', label: 'St. Augustine', region: 'trinidad' },
  { value: 'curepe', label: 'Curepe', region: 'trinidad' },
  { value: 'trincity', label: 'Trincity', region: 'trinidad' },
  
  // Trinidad - Northern Region
  { value: 'piarco', label: 'Piarco', region: 'trinidad' },
  { value: 'arouca', label: 'Arouca', region: 'trinidad' },
  { value: 'maloney', label: 'Maloney', region: 'trinidad' },
  { value: 'diego_martin', label: 'Diego Martin', region: 'trinidad' },
  { value: 'petit_valley', label: 'Petit Valley', region: 'trinidad' },
  { value: 'glencoe', label: 'Glencoe', region: 'trinidad' },
  
  // Trinidad - Western Region
  { value: 'point_fortin', label: 'Point Fortin', region: 'trinidad' },
  { value: 'siparia', label: 'Siparia', region: 'trinidad' },
  { value: 'penal', label: 'Penal', region: 'trinidad' },
  { value: 'debe', label: 'Debe', region: 'trinidad' },
  { value: 'fyzabad', label: 'Fyzabad', region: 'trinidad' },
  { value: 'rio_claro', label: 'Rio Claro', region: 'trinidad' },
  
  // Trinidad - South Central
  { value: 'princess_town', label: 'Princess Town', region: 'trinidad' },
  { value: 'tabaquite', label: 'Tabaquite', region: 'trinidad' },
  { value: 'mayaro', label: 'Mayaro', region: 'trinidad' },
  { value: 'moruga', label: 'Moruga', region: 'trinidad' },
  
  // Trinidad - Eastern Coast
  { value: 'manzanilla', label: 'Manzanilla', region: 'trinidad' },
  { value: 'toco', label: 'Toco', region: 'trinidad' },
  { value: 'valencia', label: 'Valencia', region: 'trinidad' },
  
  // Trinidad - Special Areas
  { value: 'freeport', label: 'Freeport', region: 'trinidad' },
  { value: 'st_james', label: 'St. James', region: 'trinidad' },
  { value: 'barataria', label: 'Barataria', region: 'trinidad' },
  { value: 'santa_cruz', label: 'Santa Cruz', region: 'trinidad' },
  { value: 'maracas', label: 'Maracas', region: 'trinidad' },
  
  // Tobago
  { value: 'scarborough', label: 'Scarborough', region: 'tobago' },
  { value: 'crown_point', label: 'Crown Point', region: 'tobago' },
  { value: 'charlotteville', label: 'Charlotteville', region: 'tobago' },
  { value: 'roxborough', label: 'Roxborough', region: 'tobago' },
  { value: 'speyside', label: 'Speyside', region: 'tobago' },
  { value: 'plymouth', label: 'Plymouth', region: 'tobago' },
  { value: 'signal_hill', label: 'Signal Hill', region: 'tobago' },
  { value: 'canaan', label: 'Canaan', region: 'tobago' },
  { value: 'bon_accord', label: 'Bon Accord', region: 'tobago' }
];

/**
 * Get location label by value
 */
export const getLocationLabel = (value: string): string => {
  const location = TRINIDAD_AND_TOBAGO_LOCATIONS.find(loc => loc.value === value);
  return location?.label || value;
};

/**
 * Get locations grouped by region
 */
export const getLocationsByRegion = () => {
  const trinidad = TRINIDAD_AND_TOBAGO_LOCATIONS.filter(loc => loc.region === 'trinidad');
  const tobago = TRINIDAD_AND_TOBAGO_LOCATIONS.filter(loc => loc.region === 'tobago');
  
  return { trinidad, tobago };
};
