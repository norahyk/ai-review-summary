UPDATE items
SET icon_name = CASE icon_name
  WHEN 'droplet' THEN 'Droplet'
  WHEN 'droplets' THEN 'Droplets'
  WHEN 'box' THEN 'Box'
  WHEN 'flask-conical' THEN 'FlaskConical'
  WHEN 'scroll' THEN 'Scroll'
  WHEN 'shower-head' THEN 'ShowerHead'
  WHEN 'sparkles' THEN 'Sparkles'
  WHEN 'bath' THEN 'Bath'
  WHEN 'hand' THEN 'Hand'
  WHEN 'washing-machine' THEN 'WashingMachine'
  WHEN 'shirt' THEN 'Shirt'
  WHEN 'spray-can' THEN 'SprayCan'
  WHEN 'wand-2' THEN 'Wand2'
  WHEN 'battery-full' THEN 'BatteryFull'
  WHEN 'battery-medium' THEN 'BatteryMedium'
  ELSE icon_name
END
WHERE icon_name IN (
  'droplet',
  'droplets',
  'box',
  'flask-conical',
  'scroll',
  'shower-head',
  'sparkles',
  'bath',
  'hand',
  'washing-machine',
  'shirt',
  'spray-can',
  'wand-2',
  'battery-full',
  'battery-medium'
);
