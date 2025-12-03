-- Insert original high-quality questions based on Japanese Road Traffic Act (道路交通法)
INSERT INTO ai_generated_questions (question, answer, explanation, test_category, difficulty_level, language, status, source_concept) VALUES
-- Speed Regulations
('The maximum speed limit for regular passenger vehicles on expressways (高速道路) is 100 km/h unless otherwise posted.', true, 'Article 22 of the Road Traffic Act sets the standard maximum speed on expressways at 100 km/h for regular vehicles, though some sections allow 120 km/h where posted.', 'traffic-rules', 'easy', 'en', 'approved', 'Speed Regulations'),
('Mopeds (原動機付自転車) with 50cc or less engines can travel at up to 40 km/h on regular roads.', false, 'Mopeds with 50cc or less are limited to 30 km/h maximum, not 40 km/h. This is specified in Article 22 of the Road Traffic Act.', 'traffic-rules', 'medium', 'en', 'approved', 'Speed Regulations'),

-- Parking Rules  
('Parking within 1 meter of a fire hydrant (消火栓) is prohibited.', false, 'Parking is prohibited within 5 meters of a fire hydrant, not 1 meter. This ensures emergency access. (Article 45)', 'traffic-rules', 'hard', 'en', 'approved', 'Parking Rules'),
('You may stop temporarily to pick up or drop off passengers in a no-parking zone (駐車禁止区域).', true, 'No-parking zones prohibit parking but allow brief stopping for passenger pickup/dropoff. No-stopping zones (駐停車禁止) prohibit both.', 'traffic-rules', 'medium', 'en', 'approved', 'Parking Rules'),
('Parking is prohibited within 10 meters of an intersection without traffic signals.', false, 'Parking is prohibited within 5 meters of intersections and crosswalks, not 10 meters. The 10-meter rule applies to bus stops.', 'traffic-rules', 'hard', 'en', 'approved', 'Parking Rules'),

-- Right of Way
('When two vehicles approach an intersection without traffic signals, the vehicle on the left must yield to the vehicle on the right.', true, 'In Japan, at intersections without signals or priority signs, vehicles must yield to traffic approaching from the right (左方優先).', 'traffic-rules', 'medium', 'en', 'approved', 'Right of Way'),
('Emergency vehicles (緊急自動車) with sirens and lights always have right of way regardless of traffic signals.', true, 'Drivers must yield to emergency vehicles operating with sirens and emergency lights, even if the driver has a green light.', 'safety', 'easy', 'en', 'approved', 'Emergency Vehicles'),
('On narrow roads where two vehicles cannot pass, the vehicle going uphill always has priority.', false, 'Generally, the vehicle going downhill should yield because it is easier to restart. However, if there is a passing place closer to the downhill vehicle, that vehicle should reverse.', 'traffic-rules', 'hard', 'en', 'approved', 'Right of Way'),

-- Railroad Crossings
('All vehicles must stop before railroad crossings (踏切) that have neither gates nor warning devices.', true, 'Article 33 requires all vehicles to stop immediately before railroad crossings without gates or warning signals to confirm safety.', 'safety', 'easy', 'en', 'approved', 'Railroad Crossings'),
('If a railroad crossing gate begins to descend while you are already crossing, you should stop immediately and wait.', false, 'If gates begin descending while on the crossing, continue and exit quickly. Never stop on railroad tracks.', 'safety', 'medium', 'en', 'approved', 'Railroad Crossings'),

-- Moped Rules
('Mopeds must perform a two-stage right turn (二段階右折) at all intersections with three or more lanes.', false, 'Two-stage right turns are required only at intersections with specific signs indicating this requirement, not all 3+ lane intersections.', 'traffic-rules', 'hard', 'en', 'approved', 'Moped Rules'),

-- Safety
('Having even a small amount of alcohol in your system while driving is a violation of Japanese law.', true, 'Japan has zero tolerance for drunk driving. Any detectable blood alcohol level (0.03% or above) is illegal.', 'safety', 'easy', 'en', 'approved', 'Alcohol Rules'),
('Drivers must always stop for pedestrians waiting at crosswalks, even if the crosswalk has no traffic signal.', true, 'Article 38 requires vehicles to stop for pedestrians who are crossing or about to cross at pedestrian crossings.', 'safety', 'easy', 'en', 'approved', 'Pedestrian Safety'),

-- Lane Changes
('You may change lanes within an intersection if you signal properly.', false, 'Lane changes are generally prohibited within intersections in Japan. Plan your lane position before entering.', 'traffic-rules', 'medium', 'en', 'approved', 'Lane Rules'),
('When changing lanes, you must signal at least 3 seconds before changing.', true, 'Proper signaling requires activating turn signals at least 3 seconds (approximately 30 meters at normal speed) before the lane change.', 'traffic-rules', 'easy', 'en', 'approved', 'Lane Rules');