
/**
 * Comprehensive locations for Trinidad and Tobago
 * Used across registration forms and matching logic
 */

export interface Location {
  value: string;
  label: string;
  region: 'trinidad' | 'tobago';
  administrative_region?: string;
}

export const TRINIDAD_AND_TOBAGO_LOCATIONS: Location[] = [
  // Trinidad - Port of Spain
  { value: 'port_of_spain', label: 'Port of Spain', region: 'trinidad', administrative_region: 'City of Port of Spain' },
  { value: 'belmont', label: 'Belmont', region: 'trinidad', administrative_region: 'Port of Spain' },
  { value: 'beetham_estate_gardens', label: 'Beetham Estate Gardens', region: 'trinidad', administrative_region: 'Port of Spain' },
  { value: 'john_john', label: 'John John', region: 'trinidad', administrative_region: 'City of Port of Spain' },
  { value: 'mucurapo', label: 'Mucurapo', region: 'trinidad', administrative_region: 'City of Port of Spain' },
  { value: 'st_clair', label: 'St. Clair', region: 'trinidad', administrative_region: 'Port of Spain' },
  { value: 'st_james', label: 'St. James', region: 'trinidad', administrative_region: 'Port of Spain' },
  { value: 'woodbrook', label: 'Woodbrook', region: 'trinidad', administrative_region: 'Port of Spain' },

  // Trinidad - San Juan–Laventille
  { value: 'aranguez', label: 'Aranguez', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'bamboo_no_1_3', label: 'Bamboo (No. 1 & No. 3)', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'barataria', label: 'Barataria', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'bourg_mulatresse', label: 'Bourg Mulatresse', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'cantaro', label: 'Cantaro', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'cascade', label: 'Cascade', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'champs_fleurs', label: 'Champs Fleurs', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'febeau_village', label: 'Febeau Village', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'gonzales', label: 'Gonzales', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'la_canoa', label: 'La Canoa', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'las_cuevas', label: 'Las Cuevas', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'laventille', label: 'Laventille', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'malick', label: 'Malick', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'maracas', label: 'Maracas', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'mohammedville', label: 'Mohammedville', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'morvant', label: 'Morvant', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'mount_dor', label: 'Mount D\'Or', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'mount_lambert', label: 'Mount Lambert', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'san_juan', label: 'San Juan', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'santa_cruz', label: 'Santa Cruz', region: 'trinidad', administrative_region: 'San Juan–Laventille' },
  { value: 'st_anns', label: 'St. Ann\'s', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'st_barbs', label: 'St. Barb\'s', region: 'trinidad', administrative_region: 'San Juan-Laventille' },
  { value: 'trou_macaque', label: 'Trou Macaque', region: 'trinidad', administrative_region: 'San Juan-Laventille' },

  // Trinidad - Tunapuna–Piarco
  { value: 'arouca', label: 'Arouca', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'auzonville', label: 'Auzonville', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'bamboo_no_2', label: 'Bamboo No. 2', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'bangladesh', label: 'Bangladesh', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'blanchisseuse', label: 'Blanchisseuse', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'bon_air_development', label: 'Bon Air Development', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'brasso_seco', label: 'Brasso Seco', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'caura', label: 'Caura', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'centeno', label: 'Centeno', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'curepe', label: 'Curepe', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'dabadie', label: 'D\'Abadie', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'dinsley', label: 'Dinsley', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'el_dorado', label: 'El Dorado', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'el_socorro', label: 'El Socorro', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'frederick_settlement', label: 'Frederick Settlement', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'kelly_village', label: 'Kelly Village', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'la_horquetta', label: 'La Horquetta', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'la_paille', label: 'La Paille', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'las_lomas', label: 'Las Lomas', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'lopinot', label: 'Lopinot', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'macoya', label: 'Macoya', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'mausica', label: 'Mausica', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'morang', label: 'Morang', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'oropune_village', label: 'Oropune Village', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'piarco', label: 'Piarco', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'santa_margarita', label: 'Santa Margarita', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'spring_village', label: 'Spring Village', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'st_augustine', label: 'St. Augustine', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'st_helena', label: 'St. Helena', region: 'trinidad', administrative_region: 'Tunapuna-Piarco' },
  { value: 'st_joseph', label: 'St. Joseph', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'tacarigua', label: 'Tacarigua', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'trincity', label: 'Trincity', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'tunapuna', label: 'Tunapuna', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },
  { value: 'valsayn', label: 'Valsayn', region: 'trinidad', administrative_region: 'Tunapuna–Piarco' },

  // Trinidad - Diego Martin Region
  { value: 'boissiere_village', label: 'Boissiere Village', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'carenage', label: 'Carenage', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'chaguaramas', label: 'Chaguaramas', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'cocorite', label: 'Cocorite', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'dibe', label: 'Dibe', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'diego_martin', label: 'Diego Martin', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'four_roads', label: 'Four Roads', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'glencoe', label: 'Glencoe', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'goodwood_park', label: 'Goodwood Park', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'lanse_mitan', label: 'L\'Anse Mitan', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'maraval', label: 'Maraval', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'patna_village', label: 'Patna Village', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'petit_valley', label: 'Petit Valley', region: 'trinidad', administrative_region: 'Diego Martin region' },
  { value: 'westmoorings', label: 'Westmoorings', region: 'trinidad', administrative_region: 'Diego Martin region' },

  // Trinidad - Borough of Chaguanas
  { value: 'chaguanas', label: 'Chaguanas', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'cunupia', label: 'Cunupia', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'datsunville', label: 'Datsunville', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'edinburgh', label: 'Edinburgh', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'endeavour', label: 'Endeavour', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'enterprise', label: 'Enterprise', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'felicity', label: 'Felicity', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'jerningham_junction', label: 'Jerningham Junction', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'longdenville', label: 'Longdenville', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },
  { value: 'montrose', label: 'Montrose', region: 'trinidad', administrative_region: 'Borough of Chaguanas' },

  // Trinidad - Couva–Tabaquite–Talparo
  { value: 'arena', label: 'Arena', region: 'trinidad', administrative_region: 'Couva-Tabaquite-Talparo' },
  { value: 'balmain', label: 'Balmain', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'basta_hall', label: 'Basta Hall', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'ben_lomond', label: 'Ben Lomond', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'bonne_aventure', label: 'Bonne Aventure', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'brasso', label: 'Brasso', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'brazil', label: 'Brazil', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'brickfield', label: 'Brickfield', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'calcutta_settlement', label: 'Calcutta Settlement', region: 'trinidad', administrative_region: 'Couva-Tabaquite-Talparo' },
  { value: 'california', label: 'California', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'carapichaima', label: 'Carapichaima', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'carli_bay', label: 'Carli Bay', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'carlsen_field', label: 'Carlsen Field', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'chandernagore_village', label: 'Chandernagore Village', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'chase_village', label: 'Chase Village', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'claxton_bay', label: 'Claxton Bay', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'couva', label: 'Couva', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'dow_village_couva', label: 'Dow Village, Couva', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'eckel_village', label: 'Eckel Village', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'exchange', label: 'Exchange', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'flanigin_town', label: 'Flanigin Town', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'forres_park', label: 'Forres Park', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'freeport', label: 'Freeport', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'gasparillo', label: 'Gasparillo', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'gran_couva', label: 'Gran Couva', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'indian_chain', label: 'Indian Chain', region: 'trinidad', administrative_region: 'Couva-Tabaquite-Talparo' },
  { value: 'madras_settlement', label: 'Madras Settlement', region: 'trinidad', administrative_region: 'Couva-Tabaquite-Talparo' },
  { value: 'mayo', label: 'Mayo', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'mc_bean', label: 'Mc Bean', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'montserrat', label: 'Montserrat', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'navet', label: 'Navet', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'orange_valley', label: 'Orange Valley', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'phoenix_park', label: 'Phoenix Park', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'piparo', label: 'Piparo', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'plaisance_park', label: 'Plaisance Park', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'point_lisas', label: 'Point Lisas', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'pointe_a_pierre', label: 'Pointe-à-Pierre', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'preysal', label: 'Preysal', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'san_raphael', label: 'San Raphael', region: 'trinidad', administrative_region: 'Couva-Tabaquite-Talparo' },
  { value: 'savonetta', label: 'Savonetta', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'st_marys', label: 'St. Mary\'s', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'tabaquite', label: 'Tabaquite', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'talparo', label: 'Talparo', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'tortuga', label: 'Tortuga', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'union_village', label: 'Union Village', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'waterloo', label: 'Waterloo', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },
  { value: 'whiteland', label: 'Whiteland', region: 'trinidad', administrative_region: 'Couva–Tabaquite–Talparo' },

  // Trinidad - City of San Fernando
  { value: 'san_fernando', label: 'San Fernando', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'cocoyea_village', label: 'Cocoyea Village', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'gopaul_lands', label: 'Gopaul Lands', region: 'trinidad', administrative_region: 'San Fernando' },
  { value: 'gulf_view', label: 'Gulf View', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'la_romaine', label: 'La Romaine', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'marabella', label: 'Marabella', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'mon_repos', label: 'Mon Repos', region: 'trinidad', administrative_region: 'City of San Fernando' },
  { value: 'vistabella', label: 'Vistabella', region: 'trinidad', administrative_region: 'San Fernando' },

  // Trinidad - Borough of Arima
  { value: 'arima', label: 'Arima', region: 'trinidad', administrative_region: 'Borough of Arima' },
  { value: 'malabar', label: 'Malabar', region: 'trinidad', administrative_region: 'Borough of Arima' },
  { value: 'omeara', label: 'O\'Meara', region: 'trinidad', administrative_region: 'Borough of Arima' },
  { value: 'santa_rosa', label: 'Santa Rosa', region: 'trinidad', administrative_region: 'Arima' },

  // Trinidad - Sangre Grande Region
  { value: 'caigual', label: 'Caigual', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'coryal', label: 'Coryal', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'cumaca', label: 'Cumaca', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'cumuto', label: 'Cumuto', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'fishing_pond', label: 'Fishing Pond', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'grande_riviere', label: 'Grande Riviere', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'guaico', label: 'Guaico', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'guanapo', label: 'Guanapo', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'manzanilla', label: 'Manzanilla', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'matelot', label: 'Matelot', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'matura', label: 'Matura', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'petit_trou', label: 'Petit Trou', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'rampanalgas', label: 'Rampanalgas', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'ravin_anglais', label: 'Ravin Anglais', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'redhead', label: 'Redhead', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'sans_souci', label: 'Sans Souci', region: 'trinidad', administrative_region: 'Sangre Grande' },
  { value: 'sangre_chiquito', label: 'Sangre Chiquito', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'sangre_grande', label: 'Sangre Grande', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'toco', label: 'Toco', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'valencia', label: 'Valencia', region: 'trinidad', administrative_region: 'Sangre Grande region' },
  { value: 'vega_de_oropouche', label: 'Vega de Oropouche', region: 'trinidad', administrative_region: 'Sangre Grande region' },

  // Trinidad - Rio Claro–Mayaro
  { value: 'biche', label: 'Biche', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'charuma', label: 'Charuma', region: 'trinidad', administrative_region: 'Mayaro-Rio Claro' },
  { value: 'cushe', label: 'Cushe', region: 'trinidad', administrative_region: 'Mayaro-Rio Claro' },
  { value: 'ecclesville', label: 'Ecclesville', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'guayaguayare', label: 'Guayaguayare', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'kernaham', label: 'Kernaham (or Kernahan)', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'mairao_village', label: 'Mairao Village', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'mayaro', label: 'Mayaro', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'ortoire', label: 'Ortoire', region: 'trinidad', administrative_region: 'Mayaro–Rio Claro' },
  { value: 'pierreville', label: 'Pierreville', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'plaisance', label: 'Plaisance', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },
  { value: 'poole', label: 'Poole', region: 'trinidad', administrative_region: 'Mayaro-Rio Claro' },
  { value: 'rio_claro', label: 'Rio Claro', region: 'trinidad', administrative_region: 'Rio Claro–Mayaro' },

  // Trinidad - Penal–Debe
  { value: 'arquart_village', label: 'Arquart (Aquat, Aquart, or Urquart) Village', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'barrackpore', label: 'Barrackpore', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'canaan_trinidad', label: 'Canaan, Trinidad', region: 'trinidad', administrative_region: 'Penal-Debe' },
  { value: 'congo_village', label: 'Congo Village', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'debe', label: 'Debe', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'diamond_village', label: 'Diamond Village', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'duncan_village', label: 'Duncan Village', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'monkey_town', label: 'Monkey Town', region: 'trinidad', administrative_region: 'Penal-Debe' },
  { value: 'morne_diablo', label: 'Morne Diablo', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'penal', label: 'Penal', region: 'trinidad', administrative_region: 'Penal–Debe' },
  { value: 'san_francique', label: 'San Francique', region: 'trinidad', administrative_region: 'Penal-Debe' },

  // Trinidad - Siparia Region
  { value: 'avocat', label: 'Avocat', region: 'trinidad', administrative_region: 'Siparia' },
  { value: 'bonasse', label: 'Bonasse', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'brighton', label: 'Brighton', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'buenos_ayres', label: 'Buenos Ayres', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'cedros', label: 'Cedros', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'chatham', label: 'Chatham', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'dow_village_siparia', label: 'Dow Village, Siparia', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'erin', label: 'Erin', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'fullarton', label: 'Fullarton', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'fyzabad', label: 'Fyzabad', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'icacos', label: 'Icacos', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'la_brea', label: 'La Brea', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'los_bajos', label: 'Los Bajos', region: 'trinidad', administrative_region: 'Siparia' },
  { value: 'oropouche', label: 'Oropouche', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'otaheite', label: 'Otaheite', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'palo_seco', label: 'Palo Seco', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'quarry_village', label: 'Quarry Village', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'quinam', label: 'Quinam', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'rancho_quemado', label: 'Rancho Quemado', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'roussillac', label: 'Roussillac', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'santa_flora', label: 'Santa Flora', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'siparia', label: 'Siparia', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'south_oropouche', label: 'South Oropouche', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'syne_village', label: 'Syne Village', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'thick_village', label: 'Thick Village', region: 'trinidad', administrative_region: 'Siparia region' },
  { value: 'vessigny', label: 'Vessigny', region: 'trinidad', administrative_region: 'Siparia region' },

  // Trinidad - Borough of Point Fortin
  { value: 'point_fortin', label: 'Point Fortin', region: 'trinidad', administrative_region: 'Borough of Point Fortin' },
  { value: 'guapo', label: 'Guapo', region: 'trinidad', administrative_region: 'Borough of Point Fortin' },
  { value: 'techier_village', label: 'Techier Village', region: 'trinidad', administrative_region: 'Point Fortin' },

  // Trinidad - Princes Town Region
  { value: 'borde_narve_village', label: 'Borde Narve Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'buen_intento_village', label: 'Buen Intento Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'cedar_hill_village', label: 'Cedar Hill Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'churkoo_village', label: 'Churkoo Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'fifth_company', label: 'Fifth Company', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'friendship_village', label: 'Friendship Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'golconda', label: 'Golconda', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'hardbargain', label: 'Hardbargain', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'hindustan', label: 'Hindustan', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'iere_village', label: 'Iere Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'indian_walk', label: 'Indian Walk', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'jordan_hill', label: 'Jordan Hill', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'kumar_village', label: 'Kumar Village', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'lengua', label: 'Lengua', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'moruga', label: 'Moruga', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'mount_stewart', label: 'Mount Stewart', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'new_grant', label: 'New Grant', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'palmyra', label: 'Palmyra', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'penal_rock', label: 'Penal Rock', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'princes_town', label: 'Princes Town', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'saint_madeleine', label: 'Saint Madeleine', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'tableland', label: 'Tableland', region: 'trinidad', administrative_region: 'Princes Town Region' },
  { value: 'third_company', label: 'Third Company', region: 'trinidad', administrative_region: 'Princes Town region' },
  { value: 'williamsville', label: 'Williamsville', region: 'trinidad', administrative_region: 'Princes Town region' },

  // Tobago
  { value: 'arnos_vale', label: 'Arnos Vale', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'auchenskeoch', label: 'Auchenskeoch', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'bacolet', label: 'Bacolet', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'belle_garden', label: 'Belle Garden', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'bethel', label: 'Bethel', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'black_rock', label: 'Black Rock', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'bon_accord', label: 'Bon Accord', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'buccoo', label: 'Buccoo', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'calder_hall', label: 'Calder Hall', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'canaan_tobago', label: 'Canaan, Tobago', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'carnbee', label: 'Carnbee', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'castara', label: 'Castara', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'charlotteville', label: 'Charlotteville', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'crown_point', label: 'Crown Point', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'culloden', label: 'Culloden', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'delaford', label: 'Delaford', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'glamorgan', label: 'Glamorgan', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'goodwood', label: 'Goodwood', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'hope', label: 'Hope', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'john_dial', label: 'John Dial', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'lambeau', label: 'Lambeau, Tobago', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'lanse_fourmi', label: 'L\'Anse Fourmi', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'les_coteaux', label: 'Les Coteaux', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'louis_dor', label: 'Louis D\'Or', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'lowlands', label: 'Lowlands', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'mason_hall', label: 'Mason Hall', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'moriah', label: 'Moriah', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'morne_quinton', label: 'Morne Quinton', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'mount_saint_george', label: 'Mount Saint George', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'orange_hill', label: 'Orange Hill', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'pembroke', label: 'Pembroke', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'plymouth', label: 'Plymouth', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'rockly_vale', label: 'Rockly Vale', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'roxborough', label: 'Roxborough', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'scarborough', label: 'Scarborough', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'signal_hill', label: 'Signal Hill', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'speyside', label: 'Speyside', region: 'tobago', administrative_region: 'Tobago' },
  { value: 'studley_park', label: 'Studley Park', region: 'tobago', administrative_region: 'Tobago' }
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

/**
 * Get locations grouped by administrative region for Trinidad
 */
export const getTrinidadLocationsByAdministrativeRegion = () => {
  const trinidadLocations = TRINIDAD_AND_TOBAGO_LOCATIONS.filter(loc => loc.region === 'trinidad');
  
  const groupedByAdmin = trinidadLocations.reduce((acc, location) => {
    const adminRegion = location.administrative_region || 'Other';
    if (!acc[adminRegion]) {
      acc[adminRegion] = [];
    }
    acc[adminRegion].push(location);
    return acc;
  }, {} as Record<string, Location[]>);
  
  return groupedByAdmin;
};
