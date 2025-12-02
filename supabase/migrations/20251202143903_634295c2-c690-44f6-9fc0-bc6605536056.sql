-- Phase 1: Fix Database Metadata

-- Step 1.1: Fix sign_number_map entries (stop sign is 330, NOT 326)
-- First, delete incorrect mappings
DELETE FROM sign_number_map WHERE keyword IN ('stop', 'stop sign', 'tomare', '一時停止') AND sign_number = '326';

-- Insert correct mappings for stop sign (330 is the official Japanese stop sign number)
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('stop', '330'),
  ('stop sign', '330'),
  ('tomare', '330'),
  ('止まれ', '330'),
  ('一時停止', '330'),
  ('ichiji teishi', '330'),
  ('停止', '330')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- Step 1.2: Update tomare.png metadata to have correct sign_number
UPDATE road_sign_images 
SET sign_number = '330',
    sign_name_en = COALESCE(sign_name_en, 'Stop'),
    sign_meaning = COALESCE(sign_meaning, 'Drivers must come to a complete stop before proceeding. Check all directions before continuing.')
WHERE file_name ILIKE '%tomare%' OR file_name ILIKE '%stop%';

-- Step 1.3: Fix any other common mappings that might be wrong
-- One Way is 326 (not stop)
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('one way', '326'),
  ('一方通行', '326')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- No Entry is 302
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('no entry', '302'),
  ('進入禁止', '302')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- Speed Limit is 323
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('speed limit', '323'),
  ('最高速度', '323')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- Yield/Give Way is 329  
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('yield', '329'),
  ('give way', '329'),
  ('徐行', '329')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- No Parking is 316
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('no parking', '316'),
  ('駐車禁止', '316')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;

-- Pedestrian Crossing is 407
INSERT INTO sign_number_map (keyword, sign_number) VALUES 
  ('pedestrian crossing', '407'),
  ('横断歩道', '407'),
  ('crosswalk', '407')
ON CONFLICT (keyword) DO UPDATE SET sign_number = EXCLUDED.sign_number;