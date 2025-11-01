-- Create table for curriculum lesson materials
CREATE TABLE IF NOT EXISTS public.curriculum_lesson_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lecture_number integer NOT NULL UNIQUE,
  stage text NOT NULL CHECK (stage IN ('First Stage', 'Second Stage')),
  
  -- Study materials
  textbook_references text[],
  key_concepts text[],
  practice_questions jsonb DEFAULT '[]'::jsonb,
  
  -- Additional metadata
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.curriculum_lesson_materials ENABLE ROW LEVEL SECURITY;

-- Everyone can read lesson materials
CREATE POLICY "Lesson materials are publicly readable"
ON public.curriculum_lesson_materials
FOR SELECT
USING (true);

-- Only admins can modify lesson materials
CREATE POLICY "Admins can manage lesson materials"
ON public.curriculum_lesson_materials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_curriculum_materials_updated_at
BEFORE UPDATE ON public.curriculum_lesson_materials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for all 26 lectures with driving-related content
INSERT INTO public.curriculum_lesson_materials (lecture_number, stage, textbook_references, key_concepts, practice_questions) VALUES
(1, 'First Stage', 
 ARRAY['Chapter 1: Basic Traffic Rules (p.10-25)', 'Chapter 2: Road Signs Introduction (p.26-45)'],
 ARRAY['Understanding Japanese traffic flow (left-side driving)', 'Basic right-of-way principles', 'Introduction to traffic signs and markings'],
 '[{"question": "In Japan, vehicles drive on which side of the road?", "answer": "Left side. Japan follows left-hand traffic rules.", "explanation": "This is fundamental to Japanese driving and differs from many countries."},
   {"question": "What does a red octagonal sign typically indicate?", "answer": "STOP. Drivers must come to a complete stop and check for traffic.", "explanation": "The stop sign is one of the most critical safety signs."},
   {"question": "Who has priority at an unmarked intersection?", "answer": "The vehicle approaching from the left has priority (opposite in right-hand traffic countries).", "explanation": "This is a key difference in left-hand traffic systems."}]'::jsonb),

(2, 'First Stage',
 ARRAY['Chapter 3: Traffic Signals (p.46-68)', 'Chapter 4: Road Markings (p.69-88)'],
 ARRAY['Traffic light sequences and meanings', 'Flashing signals interpretation', 'Lane markings and their significance'],
 '[{"question": "What should you do when approaching a yellow traffic light?", "answer": "Prepare to stop safely if possible. Only proceed if stopping would be dangerous.", "explanation": "Yellow means caution and prepare to stop, not speed up."},
   {"question": "What does a white solid line on the road indicate?", "answer": "Lane boundary that should not be crossed except in emergencies.", "explanation": "Solid lines indicate restricted lane changes."}]'::jsonb),

(3, 'First Stage',
 ARRAY['Chapter 5: Pedestrian Safety (p.89-110)', 'Chapter 6: Crosswalks and Zebra Crossings (p.111-125)'],
 ARRAY['Pedestrian right-of-way rules', 'Crosswalk regulations', 'School zone safety'],
 '[{"question": "Must you stop for pedestrians at a crosswalk in Japan?", "answer": "Yes, absolutely. Pedestrians have absolute priority at crosswalks.", "explanation": "Failing to stop for pedestrians is a serious violation."},
   {"question": "What is the speed limit in school zones during school hours?", "answer": "Typically 30 km/h or as posted. Extra caution is required.", "explanation": "School zones require reduced speed and heightened awareness."}]'::jsonb),

(4, 'First Stage',
 ARRAY['Chapter 7: Speed Limits (p.126-148)', 'Chapter 8: Distance and Spacing (p.149-168)'],
 ARRAY['Default speed limits in Japan', 'Speed limit signs recognition', 'Safe following distance'],
 '[{"question": "What is the default speed limit in urban areas in Japan?", "answer": "40 km/h unless otherwise posted.", "explanation": "Urban areas have lower limits for safety."},
   {"question": "What is the recommended following distance at 60 km/h?", "answer": "At least 45 meters or 3 seconds behind the vehicle ahead.", "explanation": "Proper spacing prevents chain collisions."}]'::jsonb),

(5, 'First Stage',
 ARRAY['Chapter 9: Turning and Changing Lanes (p.169-195)', 'Chapter 10: Signaling Requirements (p.196-215)'],
 ARRAY['Proper turning procedures', 'Lane change safety checks', 'Turn signal timing'],
 '[{"question": "When should you activate your turn signal?", "answer": "At least 30 meters (3 seconds) before turning or changing lanes.", "explanation": "Early signaling gives other drivers time to react."},
   {"question": "What is the blind spot check?", "answer": "A quick shoulder check to see what mirrors cannot show before changing lanes or turning.", "explanation": "Blind spots can hide motorcycles and bicycles."}]'::jsonb),

(6, 'First Stage',
 ARRAY['Chapter 11: Intersections (p.216-245)', 'Chapter 12: Right-of-Way Rules (p.246-268)'],
 ARRAY['Intersection approach procedures', 'Priority rules at intersections', 'Handling complex intersections'],
 '[{"question": "When turning right at an intersection, who must you yield to?", "answer": "Oncoming traffic going straight or turning left, and all pedestrians.", "explanation": "Right turns must yield to most other traffic."},
   {"question": "What should you do at an intersection with traffic lights out?", "answer": "Treat it as an all-way stop and proceed with extreme caution.", "explanation": "Non-functioning lights require extra vigilance."}]'::jsonb),

(7, 'First Stage',
 ARRAY['Chapter 13: Parking Regulations (p.269-295)', 'Chapter 14: Emergency Stopping (p.296-318)'],
 ARRAY['Legal parking requirements', 'Prohibited parking zones', 'Emergency vehicle procedures'],
 '[{"question": "How far from an intersection must you park?", "answer": "At least 5 meters from the intersection.", "explanation": "This ensures clear sightlines for all drivers."},
   {"question": "What should you do when you see an emergency vehicle with flashing lights?", "answer": "Pull to the left side of the road and stop to allow it to pass.", "explanation": "Emergency vehicles always have priority."}]'::jsonb),

(8, 'First Stage',
 ARRAY['Chapter 1-7 Review', 'Practice Test Materials'],
 ARRAY['Comprehensive review of first 7 lectures', 'Common mistakes to avoid', 'Test-taking strategies'],
 '[{"question": "Review: What are the three key elements of safe driving?", "answer": "Recognition (seeing hazards), Judgment (deciding action), Operation (executing safely).", "explanation": "These form the foundation of defensive driving."}]'::jsonb),

(9, 'First Stage',
 ARRAY['Chapter 15: Highway and Expressway Rules (p.319-348)', 'Chapter 16: Merging and Exit Procedures (p.349-368)'],
 ARRAY['Expressway entry/exit procedures', 'Lane discipline on highways', 'Minimum and maximum speeds'],
 '[{"question": "What is the minimum speed on Japanese expressways?", "answer": "50 km/h in most cases, but check posted signs.", "explanation": "Driving too slowly can be as dangerous as speeding."},
   {"question": "Which lane should you use for normal highway driving?", "answer": "Keep to the left lane; right lanes are for overtaking only.", "explanation": "Lane discipline improves traffic flow and safety."}]'::jsonb),

(10, 'First Stage',
 ARRAY['Comprehensive First Stage Review', 'Mock Test Preparation'],
 ARRAY['All First Stage topics reviewed', 'Weak areas identification', 'Test simulation practice'],
 '[{"question": "What percentage must you score to pass the written test?", "answer": "90% or higher (9 out of 10 correct in each section).", "explanation": "The Japanese driving test has high standards."}]'::jsonb),

(11, 'Second Stage',
 ARRAY['Chapter 17: Adverse Weather Driving (p.369-395)', 'Chapter 18: Night Driving (p.396-418)'],
 ARRAY['Rain and wet road techniques', 'Fog driving procedures', 'Night vision and headlight use'],
 '[{"question": "How should you adjust your speed in rain?", "answer": "Reduce speed by at least 20-30% and increase following distance.", "explanation": "Wet roads double stopping distances."},
   {"question": "When must you use headlights in Japan?", "answer": "30 minutes after sunset until 30 minutes before sunrise, and in poor visibility.", "explanation": "Proper lighting is both a legal requirement and safety measure."}]'::jsonb),

(12, 'Second Stage',
 ARRAY['Chapter 19: Mountain and Hill Driving (p.419-445)', 'Chapter 20: Narrow Road Techniques (p.446-468)'],
 ARRAY['Uphill and downhill procedures', 'Engine braking techniques', 'Narrow road right-of-way'],
 '[{"question": "When should you use engine braking?", "answer": "On long downhill sections to prevent brake fade and overheating.", "explanation": "Continuous braking can cause brake failure on steep hills."}]'::jsonb),

(13, 'Second Stage',
 ARRAY['Chapter 21: Accident Response (p.469-495)', 'Chapter 22: Emergency Procedures (p.496-518)'],
 ARRAY['Post-accident obligations', 'Emergency contact procedures', 'First aid basics'],
 '[{"question": "What are your three legal obligations after an accident?", "answer": "1) Stop immediately 2) Provide aid to injured 3) Report to police.", "explanation": "Leaving an accident scene is a serious crime."}]'::jsonb),

(14, 'Second Stage',
 ARRAY['Chapter 23: Motorcycles and Bicycles (p.519-545)', 'Chapter 24: Large Vehicle Awareness (p.546-568)'],
 ARRAY['Motorcycle blind spots', 'Bicycle safety considerations', 'Truck turning radius awareness'],
 '[{"question": "Why are motorcycles particularly vulnerable?", "answer": "They are smaller, harder to see, and have no protective structure.", "explanation": "Always do a complete shoulder check for motorcycles."}]'::jsonb),

(15, 'Second Stage',
 ARRAY['Chapter 25: Alcohol and Drug Effects (p.569-595)', 'Chapter 26: Fatigue Management (p.596-618)'],
 ARRAY['Zero-tolerance alcohol policy', 'Drug impairment recognition', 'Fatigue prevention strategies'],
 '[{"question": "What is the legal blood alcohol limit for driving in Japan?", "answer": "0.03% - effectively zero tolerance. Any amount can result in prosecution.", "explanation": "Japan has some of the strictest DUI laws in the world."}]'::jsonb),

(16, 'Second Stage',
 ARRAY['Chapter 27: Vehicle Maintenance (p.619-645)', 'Chapter 28: Tire and Brake Safety (p.646-668)'],
 ARRAY['Pre-drive inspection requirements', 'Tire tread depth regulations', 'Brake system basics'],
 '[{"question": "What is the minimum legal tire tread depth?", "answer": "1.6mm across the main grooves.", "explanation": "Worn tires significantly reduce grip and safety."}]'::jsonb),

(17, 'Second Stage',
 ARRAY['Chapter 29: Environmental Driving (p.669-690)', 'Chapter 30: Eco-Driving Techniques (p.691-710)'],
 ARRAY['Fuel-efficient driving methods', 'Emission reduction techniques', 'Eco-friendly practices'],
 '[{"question": "What is eco-driving?", "answer": "Driving techniques that reduce fuel consumption and emissions, such as smooth acceleration and anticipating stops.", "explanation": "Eco-driving saves money and protects the environment."}]'::jsonb),

(18, 'Second Stage',
 ARRAY['Review Chapters 11-17', 'Mid-Stage Assessment'],
 ARRAY['Second stage concepts reinforcement', 'Advanced scenario practice'],
 '[{"question": "Review: What are the key differences between highway and urban driving?", "answer": "Higher speeds, longer sight distances, different merging rules, and stricter lane discipline.", "explanation": "Highway driving requires different skills than city driving."}]'::jsonb),

(19, 'Second Stage',
 ARRAY['Chapter 31: Advanced Intersection Scenarios (p.711-740)', 'Chapter 32: Complex Traffic Situations (p.741-765)'],
 ARRAY['Multi-lane intersection navigation', 'Railroad crossing procedures', 'School bus rules'],
 '[{"question": "What must you do at a railroad crossing?", "answer": "Slow down, look both ways, listen for trains, and never stop on the tracks.", "explanation": "Railroad crossings are high-risk locations."}]'::jsonb),

(20, 'Second Stage',
 ARRAY['Chapter 33: Defensive Driving (p.766-795)', 'Chapter 34: Hazard Perception (p.796-820)'],
 ARRAY['Anticipating other drivers', 'Scanning techniques', 'Space management'],
 '[{"question": "What is the key principle of defensive driving?", "answer": "Assume other drivers will make mistakes and always have an escape plan.", "explanation": "Defensive driving prevents accidents caused by others."}]'::jsonb),

(21, 'Second Stage',
 ARRAY['Chapter 35: Special Vehicle Types (p.821-845)', 'Chapter 36: Towing and Cargo (p.846-868)'],
 ARRAY['Bus and taxi interaction', 'Trailer handling basics', 'Load security requirements'],
 '[{"question": "What extra precautions are needed when following a truck?", "answer": "Stay back further for visibility, anticipate wider turns, and never move into blind spots.", "explanation": "Large vehicles have significant blind spots and limitations."}]'::jsonb),

(22, 'Second Stage',
 ARRAY['Chapter 37: Urban Driving Challenges (p.869-895)', 'Chapter 38: Rural Driving (p.896-918)'],
 ARRAY['City traffic navigation', 'One-way street systems', 'Rural road hazards'],
 '[{"question": "What are common rural road hazards?", "answer": "Animals, agricultural vehicles, poor lighting, narrow roads, and unexpected turns.", "explanation": "Rural driving requires different hazards awareness than urban."}]'::jsonb),

(23, 'Second Stage',
 ARRAY['Chapter 39: Advanced Parking (p.919-945)', 'Chapter 40: Reversing Techniques (p.946-968)'],
 ARRAY['Parallel parking mastery', 'Reverse parking precision', 'Bay parking methods'],
 '[{"question": "What is the proper sequence for parallel parking?", "answer": "Signal, position alongside space, reverse while turning wheel, straighten, adjust position.", "explanation": "Proper technique makes parallel parking easier and safer."}]'::jsonb),

(24, 'Second Stage',
 ARRAY['Comprehensive Review Chapters 11-23', 'Advanced Practice Tests'],
 ARRAY['All Second Stage topics reviewed', 'Complex scenarios practice'],
 '[{"question": "Review: How do you handle an emergency vehicle approach from behind?", "answer": "Pull to the left, slow down or stop, and allow it to pass safely.", "explanation": "Emergency vehicle protocol is critical knowledge."}]'::jsonb),

(25, 'Second Stage',
 ARRAY['Final Comprehensive Review - All Chapters', 'Test Strategy and Tips'],
 ARRAY['Complete curriculum review', 'Test-day preparation', 'Common mistakes to avoid'],
 '[{"question": "What is the most important thing on test day?", "answer": "Stay calm, read questions carefully, and trust your preparation.", "explanation": "Test anxiety can cause unnecessary mistakes."}]'::jsonb),

(26, 'Second Stage',
 ARRAY['Mock Exam and Final Assessment', 'Practical Test Preparation'],
 ARRAY['Full-length practice test', 'Weak area final review', 'Practical test tips'],
 '[{"question": "What should you focus on for the practical driving test?", "answer": "Safety checks, smooth operation, proper procedures, and calm confidence.", "explanation": "The practical test evaluates your actual driving ability and safety awareness."}]'::jsonb)

ON CONFLICT (lecture_number) DO NOTHING;