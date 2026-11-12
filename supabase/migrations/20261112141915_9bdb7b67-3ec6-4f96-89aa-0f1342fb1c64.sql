CREATE OR REPLACE FUNCTION public.reel_town_region(_address text)
RETURNS TABLE(town text, region text) LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  WITH towns(t, r) AS (VALUES
    ('Port of Spain','North West Trinidad'),('Diego Martin','North West Trinidad'),('Petit Valley','North West Trinidad'),('Maraval','North West Trinidad'),('Westmoorings','North West Trinidad'),('Carenage','North West Trinidad'),('St. James','North West Trinidad'),('Belmont','North West Trinidad'),('Laventille','North West Trinidad'),('Morvant','North West Trinidad'),('San Juan','North West Trinidad'),('Barataria','North West Trinidad'),('Santa Cruz','North West Trinidad'),
    ('St. Augustine','East-West Corridor'),('Curepe','East-West Corridor'),('Tunapuna','East-West Corridor'),('Tacarigua','East-West Corridor'),('Arouca','East-West Corridor'),('Maloney','East-West Corridor'),('D''Abadie','East-West Corridor'),('Arima','East-West Corridor'),('Trincity','East-West Corridor'),('Piarco','East-West Corridor'),('El Dorado','East-West Corridor'),('Macoya','East-West Corridor'),
    ('Valencia','East Trinidad'),('Sangre Grande','East Trinidad'),('Toco','East Trinidad'),('Manzanilla','East Trinidad'),('Matura','East Trinidad'),
    ('Chaguanas','Central Trinidad'),('Cunupia','Central Trinidad'),('Freeport','Central Trinidad'),('Couva','Central Trinidad'),('Carapichaima','Central Trinidad'),('Claxton Bay','Central Trinidad'),('Longdenville','Central Trinidad'),('Enterprise','Central Trinidad'),('Felicity','Central Trinidad'),('Tabaquite','Central Trinidad'),
    ('San Fernando','South Trinidad'),('Marabella','South Trinidad'),('Palmiste','South Trinidad'),('Gasparillo','South Trinidad'),('Princes Town','South Trinidad'),('Penal','South Trinidad'),('Siparia','South Trinidad'),('Fyzabad','South Trinidad'),('Point Fortin','South Trinidad'),('La Romaine','South Trinidad'),('Debe','South Trinidad'),('Rio Claro','South Trinidad'),('Pointe-a-Pierre','South Trinidad'),('Gulf View','South Trinidad'),
    ('Scarborough','Tobago'),('Tobago','Tobago'),('Crown Point','Tobago'),('Roxborough','Tobago')
  )
  SELECT t, r FROM towns WHERE _address ILIKE '%' || replace(t,'.','') || '%' OR _address ILIKE '%' || t || '%'
  UNION ALL SELECT NULL, 'Trinidad & Tobago'
  LIMIT 1;
$$;