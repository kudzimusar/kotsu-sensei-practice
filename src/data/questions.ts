export interface Question {
  id: number;
  test: string;
  question: string;
  answer: boolean;
  explanation: string;
  figure?: string;
}

export const questions: Question[] = [
  // Learner's Permit Preliminary Written Test 2
  {
    id: 1,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When making a right turn at the intersection, you must move over as close as possible to the center of the road and slow down, pass just in front of the center of the intersection.",
    answer: true,
    explanation: "True. Article 34 requires vehicles to stay close to center line when turning right to allow other traffic to pass on left."
  },
  {
    id: 2,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The road sign shown in Figure No.1 refers that the road is closed to motor vehicles including motorcycles and general motorized bicycles.",
    answer: true,
    explanation: "True. This regulatory sign prohibits all motorized vehicles from entering."
  },
  {
    id: 3,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When the amber light is flashing, vehicle must proceed by slowing down.",
    answer: true,
    explanation: "True. Flashing amber means proceed with caution after slowing down and checking for traffic."
  },
  {
    id: 4,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Drivers must not pass another vehicle (except for light vehicles) on the pedestrian crossing and within 30 meters before it.",
    answer: true,
    explanation: "True. Article 30 prohibits overtaking within 30m of pedestrian crossings for safety."
  },
  {
    id: 5,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The road sign shown in Figure No.2 indicates \"closed to all vehicles\".",
    answer: true,
    explanation: "True. This sign prohibits entry for all vehicles including bicycles."
  },
  {
    id: 6,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Vehicles crossing a side walk to enter the road side facilities must slow down when there are pedestrians.",
    answer: false,
    explanation: "False. Vehicles must slow down or stop regardless of whether pedestrians are present when crossing sidewalks."
  },
  {
    id: 7,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When there is an obstacle ahead, drivers must stop or slow down and yield to the vehicle moving in the opposite direction.",
    answer: true,
    explanation: "True. The vehicle on the side with the obstacle must yield to oncoming traffic."
  },
  {
    id: 8,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When the road sign shown in Figure No.3 is posted on the road, streetcar and vehicles are prohibited from passing, but not pedestrians.",
    answer: true,
    explanation: "True. Vehicle prohibition signs apply to motorized vehicles, not pedestrians."
  },
  {
    id: 9,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The road marking shown in Figure No.4 indicates \"No entry zone\".",
    answer: true,
    explanation: "True. This marking designates areas vehicles cannot enter."
  },
  {
    id: 10,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Stopping distance refers to reaction distance and braking distance.",
    answer: true,
    explanation: "True. Total stopping distance = reaction distance + braking distance."
  },
  {
    id: 11,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When starting the engine of an automatic car, check the hand brake, press the brake pedal, and check that the change lever is in \"P\".",
    answer: true,
    explanation: "True. Proper startup procedure prevents unintended vehicle movement."
  },
  {
    id: 12,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Marking refers to lines, symbols and letters shown on the road by paint or road cat eyes and there are two types of marking which consists of regulatory and indication markings.",
    answer: true,
    explanation: "True. Road markings are divided into regulatory (mandatory) and indication (advisory) types."
  },
  {
    id: 13,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When fastening a seatbelt, secure it across your abdomen.",
    answer: false,
    explanation: "False. Seatbelts should be secured across the hips/pelvis, not the soft abdomen which can cause internal injuries."
  },
  {
    id: 14,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "On a road with the road marking shown in Figure 5, drivers must not change lanes as shown by the arrow.",
    answer: true,
    explanation: "True. Solid lane markings prohibit lane changes in the direction indicated."
  },
  {
    id: 15,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving a motor vehicle during a period of suspension, it is regarded driving without a license.",
    answer: true,
    explanation: "True. Driving during license suspension is treated as unlicensed driving with severe penalties."
  },
  {
    id: 16,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Lerner's permit is classified to three types which are Large vehicles, Regular vehicles and Special heavy equipments.",
    answer: true,
    explanation: "True. Learner permits are categorized by vehicle type: large, regular, and special heavy equipment."
  },
  {
    id: 17,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The road sign shown in Figure No.6 indicates \"only designated direction permitted\".",
    answer: true,
    explanation: "True. This sign restricts traffic to specific directions only."
  },
  {
    id: 18,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving on a road with the road sign shown in Figure 7, pay special attention to the surrounding situation as a child may dash out into the road.",
    answer: true,
    explanation: "True. School zone or children warning signs require heightened vigilance."
  },
  {
    id: 19,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The special light equipment and general motorized bicycle as well as regular motor vehicle can be driven with regular motor vehicle license.",
    answer: false,
    explanation: "False. Special light equipment requires separate license. Only certain motorized bicycles can be driven with regular license."
  },
  {
    id: 20,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Regular motor vehicle must proceed on the right hand side of the road when driving on the one-way road.",
    answer: false,
    explanation: "False. On one-way roads, vehicles can use any lane but generally keep left unless overtaking."
  },
  {
    id: 21,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When there are three or more vehicle lanes in each direction, the far right lane should be left open for overtaking and vehicles may drive in any vehicle lane other than the far right hand lane.",
    answer: true,
    explanation: "True. The rightmost lane is designated for overtaking; regular traffic uses other lanes."
  },
  {
    id: 22,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When passing near a safety zone, vehicles must slow down even if there is no pedestrian.",
    answer: true,
    explanation: "True. Article requires slowing near safety zones regardless of pedestrian presence."
  },
  {
    id: 23,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The timing of signal for right turn is 30 meters before the turn and continues it until the actions are completed.",
    answer: true,
    explanation: "True. Turn signals must be activated 30m before and maintained throughout the turn."
  },
  {
    id: 24,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When a police officer stretched his/her arms horizontally, it means same as the green light for traffic moving parallel to the police officer's body.",
    answer: true,
    explanation: "True. Horizontal arms = green light for parallel traffic; red light for traffic facing officer."
  },
  {
    id: 25,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Indication signs prohibit, restrict or designate specific regulations for traffic.",
    answer: false,
    explanation: "False. REGULATORY signs prohibit/restrict. Indication signs provide guidance and information."
  },
  {
    id: 26,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A motor vehicle are allowed to drive on the \"pedestrian-only road\" if they slow down to drive.",
    answer: false,
    explanation: "False. Motor vehicles are prohibited on pedestrian-only roads except for authorized vehicles (residents, deliveries with permits)."
  },
  {
    id: 27,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Vehicles must not enter the pedestrian crossing if there is a possibility of stopping within a crossing because the traffic ahead is congested.",
    answer: true,
    explanation: "True. Never enter a crossing if you may block it due to traffic congestion ahead."
  },
  {
    id: 28,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When a vehicle enters an intersection first, the vehicle has priority to make a right turn over oncoming vehicle turning left or moving straight.",
    answer: false,
    explanation: "False. Oncoming straight/left-turning traffic has priority over right-turning vehicles even if you entered first."
  },
  {
    id: 29,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must not obstruct a vehicle coming from right at the uncontrolled intersection where the width of both roads is similar.",
    answer: true,
    explanation: "True. At equal-width intersections without signals, yield to traffic from the right."
  },
  {
    id: 30,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Overtaking is prohibited in intersections and within 30 meters of the intersection.",
    answer: false,
    explanation: "False. Overtaking is prohibited IN intersections, but not necessarily within 30m. The 30m rule applies to pedestrian crossings."
  },
  {
    id: 31,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Wheelbase differential means a vehicle's front wheels move further inside than its rear wheels when turning.",
    answer: false,
    explanation: "False. Inner wheel differential means REAR wheels track inside of front wheels when turning."
  },
  {
    id: 32,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When making a right turn at an intersection, a driver should anticipate a motorcycle behind the motor vehicle approaching in the opposite direction.",
    answer: true,
    explanation: "True. Watch for motorcycles passing on right of oncoming vehicles turning left."
  },
  {
    id: 33,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The maximum legal speed of large and regular motorcycles on a general road are 60km/h regardless of the total engine displacement.",
    answer: true,
    explanation: "True. Maximum speed on general roads is 60km/h for all motorcycles."
  },
  {
    id: 34,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The reversing is also prohibited on a road where crossing and U-turns are prohibited by sign or marking.",
    answer: true,
    explanation: "True. If U-turns prohibited, reversing is also prohibited as it involves similar movements."
  },
  {
    id: 35,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving motorcycle and braking, you should maintain the motorcycle in a vertical position and make the steering bar straight, use the engine brake, front wheel brake and the rear wheel brakes simultaneously.",
    answer: true,
    explanation: "True. Proper motorcycle braking uses all three brake types with bike upright for maximum control."
  },
  {
    id: 36,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When you pass a school bus which is stopping to pick up or drop off pupils, drivers must slow down and check safety.",
    answer: false,
    explanation: "False. You must STOP (not just slow down) when passing stopped school buses picking up/dropping off children."
  },
  {
    id: 37,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When an emergency vehicle is approaching from behind other than on or near the intersection, a driver must pull over to the left hand side of the road and yield.",
    answer: true,
    explanation: "True. Pull to left and yield to emergency vehicles except at/near intersections where you clear the intersection first."
  },
  {
    id: 38,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You can proceed by slowing down when you pass the stationery vehicle in front of the pedestrian crossing if there are no pedestrians.",
    answer: false,
    explanation: "False. You must stop or slow significantly as the stopped vehicle may be yielding to pedestrians you cannot see."
  },
  {
    id: 39,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Slow down near streetcars stopped to pick up/drop off passengers when there is a safety zone.",
    answer: true,
    explanation: "True. Slow down when passing stopped streetcars at safety zones to protect passengers."
  },
  {
    id: 40,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When closing the door, pause once and close it firmly.",
    answer: true,
    explanation: "True. Proper door closing technique: pause to check clearance, then close firmly to ensure latch engages."
  },
  {
    id: 41,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Vehicle and pedestrian must stop at the stop line when facing a flashing red light.",
    answer: true,
    explanation: "True. Flashing red = same as stop sign. Must stop at line, check safety, then proceed."
  },
  {
    id: 42,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may overtake a vehicle in front which is trying to overtake a general motorized bicycle.",
    answer: false,
    explanation: "False. Do not overtake a vehicle that is already overtaking another vehicle."
  },
  {
    id: 43,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The timing of a signal to slow down or stop is 3 seconds before the action.",
    answer: false,
    explanation: "False. Brake lights activate automatically when braking. Hand signals vary but 3 seconds is not a specific requirement."
  },
  {
    id: 44,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Vehicle can change lanes across the yellow line for turning right or left even though the lane direction is designated by yellow line.",
    answer: true,
    explanation: "True. Can cross yellow lane designation lines when turning at intersections."
  },
  {
    id: 45,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Overtaking on the right hand side of the road is prohibited when the center line is designated by yellow.",
    answer: true,
    explanation: "True. Yellow center line prohibits crossing to right side for overtaking."
  },
  {
    id: 46,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must stop before crossing a priority road at the intersection without traffic light.",
    answer: true,
    explanation: "True. Must stop before entering priority road from side road at unmarked intersections."
  },
  {
    id: 47,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A learner's permit is not canceled even when violating traffic rules or causing a traffic accident.",
    answer: false,
    explanation: "False. Serious violations or accidents can result in permit cancellation."
  },
  {
    id: 48,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You do not have to fasten your seatbelt as long as you drive in vicinity.",
    answer: false,
    explanation: "False. Seatbelts must be worn at all times regardless of distance or location."
  },
  {
    id: 49,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must sound horn on the corner with poor visibility even when there is no \"sound horn\" sign.",
    answer: false,
    explanation: "False. Horn use is restricted to designated locations or emergency danger avoidance only."
  },
  {
    id: 50,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When I pass near a senior citizen who is using a cane, I stopped and let person go safely.",
    answer: true,
    explanation: "True. Must slow down or stop to ensure safety of elderly pedestrians with mobility aids."
  },

  // Learner's Permit Preliminary Written Test 3
  {
    id: 51,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must not lend your car to someone who has drunk alcohol and has possibility to drive it.",
    answer: true,
    explanation: "True. Lending vehicle to drunk person who may drive it is illegal and subject to penalties."
  },
  {
    id: 52,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When driving a car, you should turn off or use silent mode for your mobile phone.",
    answer: true,
    explanation: "True. Best practice to avoid distraction is turning off or silencing mobile phones while driving."
  },
  {
    id: 53,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Drivers and passengers must fasten their seatbelt at any situation.",
    answer: true,
    explanation: "True. Article 71-3 requires all occupants to wear seatbelts at all times."
  },
  {
    id: 54,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When turning right at an uncontrolled intersection with three or more vehicle lanes, general motorized bicycles must use square right turn method.",
    answer: true,
    explanation: "True. Motorized bicycles must use two-stage right turn at multi-lane intersections."
  },
  {
    id: 55,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Seat belts can reduce damage in case of a traffic accident and also enable you to maintain the correct posture, and are effective in reducing driving fatigue.",
    answer: true,
    explanation: "True. Seatbelts protect in crashes, help maintain posture, and reduce fatigue during long drives."
  },
  {
    id: 56,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When driving on a steep upgrade or steep downgrade, drivers must slow down.",
    answer: true,
    explanation: "True. Must reduce speed on steep grades for safety and vehicle control."
  },
  {
    id: 57,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "I drove a car without glasses in the vicinity despite of conditions on the license stated \"use of the glasses\".",
    answer: false,
    explanation: "False. License conditions (including corrective lenses) must be followed at all times and locations."
  },
  {
    id: 58,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You can ride a motorcycle easy because it is easier than driving a regular motor vehicle.",
    answer: false,
    explanation: "False. Motorcycles require specialized skills and are more challenging due to balance and vulnerability."
  },
  {
    id: 59,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Bicycles are also required to observe the traffic signals with the pedestrian symbols which is attached \"exclusively for pedestrians and bicycles\" sign.",
    answer: true,
    explanation: "True. Bicycles must follow pedestrian signals when marked as bicycle-applicable."
  },
  {
    id: 60,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "The stop position is immediately in front of the stop line, and if there is no stop line, the stop position is immediately before the intersection.",
    answer: true,
    explanation: "True. Stop at line if present; otherwise stop before entering intersection."
  },
  {
    id: 61,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Reaction distance is the distance from when a driver feels danger and applies the brake to when the brake actually begins to work.",
    answer: false,
    explanation: "False. Reaction distance is from perceiving danger to STARTING to apply brake. Time until brake engages is part of system response."
  },
  {
    id: 62,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When a traffic patrol officer is controlling the traffic, it is not necessary to observe his/her hand signals because he/she is not a police officer.",
    answer: false,
    explanation: "False. Traffic patrol officers have authority; their hand signals must be obeyed."
  },
  {
    id: 63,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When making a right turn at the intersection with the road sign shown Figure No.1, general motorized bicycle must move to the center of the road in advance.",
    answer: false,
    explanation: "False. Motorized bicycles typically use square/two-stage right turn, staying left."
  },
  {
    id: 64,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "General motorized bicycle is allowed to proceed at 50km/h when the road sign shown Figure No.2 is posted on a road.",
    answer: false,
    explanation: "False. Motorized bicycles have 30km/h maximum speed limit regardless of posted limits for cars."
  },
  {
    id: 65,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "The road sign in Figure 3 indicates closed to large-sized trucks, specific middle-sized trucks and special heavy equipment.",
    answer: true,
    explanation: "True. This sign restricts entry for large commercial vehicles."
  },
  {
    id: 66,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "On a road with a road sign in Figure 4 indicates riding with a passenger on general motorized bicycles is allowed.",
    answer: false,
    explanation: "False. This sign likely prohibits two-person riding on motorized bicycles."
  },
  {
    id: 67,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Auxiliary signs indicate the reason for the regulations shown on main signs, and also specify the time, day and type of vehicle to which these regulations apply.",
    answer: true,
    explanation: "True. Auxiliary signs provide additional details (times, vehicle types, distances) for main signs."
  },
  {
    id: 68,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Road markings refer to lines, symbols and letters shown on the road by paint or road cat eyes. There are two types of road markings, regulatory and indication markings.",
    answer: true,
    explanation: "True. Road markings are categorized as regulatory (mandatory) or indication (advisory)."
  },
  {
    id: 69,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "The road sign shown in Figure 5 indicates closed to motorcycles but not to general motorized bicycles.",
    answer: false,
    explanation: "False. Signs typically apply to all two-wheeled motorized vehicles unless specifically exempted."
  },
  {
    id: 70,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Because a 2-wheeler with the engines turned off being pushed is considered as a \"pedestrian\", it is allowed to be pushed on a sidewalk or side strip.",
    answer: true,
    explanation: "True. Motorcycles with engine off being pushed are classified as pedestrians."
  },
  {
    id: 71,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Special light equipment, moped and light vehicle can use the lane which is designated exclusive lane for buses.",
    answer: false,
    explanation: "False. Bus lanes are exclusive to buses and authorized vehicles only."
  },
  {
    id: 72,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Mopeds using priority lane for buses must exit the priority lane when a route bus is approaching.",
    answer: true,
    explanation: "True. If permitted in bus lane, must yield to actual buses by exiting lane."
  },
  {
    id: 73,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "The driver must move to the right hand side of the road when yielding to the emergency vehicle on the one-way road.",
    answer: false,
    explanation: "False. Always pull to LEFT to yield to emergency vehicles, even on one-way roads."
  },
  {
    id: 74,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Driver must not enter the priority lane for buses when it might be difficult to exit the priority lane due to traffic congestion when a route bus is approaching.",
    answer: true,
    explanation: "True. Do not enter bus lane if congestion may prevent you from exiting for approaching buses."
  },
  {
    id: 75,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When marking a left turn, vehicle must slow down and move as close as possible to the left hand side of the road.",
    answer: true,
    explanation: "True. Move left and slow down for left turns per Article 34."
  },
  {
    id: 76,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When driving a vehicle, you may throw cigarette buttes or waste paper since they are not dangerous.",
    answer: false,
    explanation: "False. Littering from vehicles is illegal and can cause fires or environmental damage."
  },
  {
    id: 77,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When pedestrians are crossing on or near an intersection without a pedestrian crossing, drivers must not obstruct them.",
    answer: true,
    explanation: "True. Must not obstruct pedestrians crossing at intersections even without marked crossings."
  },
  {
    id: 78,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "It is not necessary to slow down when entering a priority road at an intersection if there is no vehicle on the priority road.",
    answer: false,
    explanation: "False. Must slow down when entering priority roads regardless of visible traffic."
  },
  {
    id: 79,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Vehicles are permitted to proceed on the right side of a one-way road.",
    answer: true,
    explanation: "True. On one-way roads, vehicles may use right side lanes."
  },
  {
    id: 80,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "I stopped at the middle of the intersection since the traffic light is green even though the traffic ahead was congested.",
    answer: false,
    explanation: "False. Never enter intersection if congestion may cause you to block it, even with green light."
  },
  {
    id: 81,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "In order to prevent your vehicle from stalling on the railway crossing, you should change the gear immediately and cross it at a constant speed.",
    answer: false,
    explanation: "False. Select appropriate gear BEFORE crossing and maintain steady speed without shifting on tracks."
  },
  {
    id: 82,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "If you have a regular vehicle license, you are permitted to drive a general motorized bicycle but not a special light equipment.",
    answer: false,
    explanation: "False. Regular license allows general motorized bicycles but special light equipment requires separate license."
  },
  {
    id: 83,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "The maximum speed limit of a middle-sized motor vehicle on a regular road is 60km/h.",
    answer: true,
    explanation: "True. Middle-sized vehicles have 60km/h limit on general roads."
  },
  {
    id: 84,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When the traffic signal turns amber, pedestrians and vehicles are not allowed to proceed but the streetcars are allowed.",
    answer: false,
    explanation: "False. Amber means stop if safe for ALL traffic including streetcars."
  },
  {
    id: 85,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When driving with a heavy load, the breaking distance becomes longer compared to when driving without any load.",
    answer: true,
    explanation: "True. Heavier vehicles require longer braking distances due to increased momentum."
  },
  {
    id: 86,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "In places unmarked to prohibit crossing or U-turns, crossing and U-turns are prohibited when they obstruct pedestrians or other vehicles.",
    answer: true,
    explanation: "True. Even without signs, cannot make maneuvers that obstruct others."
  },
  {
    id: 87,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When driving Automatic transmission vehicle and stopping, you must keep your foot on the brake pedal firmly. Otherwise it may cause unexpected accidents, such as rear-end collisions, because the vehicle will move automatically even without stepping on the accelerator.",
    answer: true,
    explanation: "True. Automatic vehicles creep forward; must keep foot on brake when stopped."
  },
  {
    id: 88,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Bicycles are permitted to drive on a pedestrian only road.",
    answer: false,
    explanation: "False. Pedestrian-only roads prohibit bicycles unless specifically exempted."
  },
  {
    id: 89,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "All drivers who are age of 70 or older must display a senior driver's sign when driving a regular motor vehicle.",
    answer: true,
    explanation: "True. Drivers 70+ must display senior driver mark."
  },
  {
    id: 90,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When approaching a pedestrian crossing, drivers can proceed if it is clear that there are no pedestrians crossing on the street.",
    answer: false,
    explanation: "False. Must slow down to stop-ready speed even if no visible pedestrians."
  },
  {
    id: 91,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Drivers must give a signal 30 meters before changing lanes.",
    answer: true,
    explanation: "True. Lane change signals required 30m in advance."
  },
  {
    id: 92,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Drivers must not sound their horns except in designated locations or situations to avoid danger.",
    answer: true,
    explanation: "True. Horn use restricted to horn zones or emergency danger avoidance."
  },
  {
    id: 93,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When the green arrow light indicates a right turn, general motorized bicycles are permitted to turn right at any kind of intersection.",
    answer: false,
    explanation: "False. Motorized bicycles must use square/two-stage turn at certain intersections regardless of arrow."
  },
  {
    id: 94,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Even one year has passed since the driver obtains a regular motor vehicle license, it is considered as a beginner driver's period for regular motorcycles if it has not passed since he gets a regular motorcycle license.",
    answer: true,
    explanation: "True. Beginner period is separate for each license type obtained."
  },
  {
    id: 95,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Although the vehicle lane is marked with a yellow line, I changed lane by moving over the yellow line.",
    answer: false,
    explanation: "False. Yellow lane lines generally prohibit crossing/lane changes."
  },
  {
    id: 96,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Even though the sign \"No U-turn\" is posted on the road, vehicles can make a U-turn unless obstructing pedestrians or other traffic.",
    answer: false,
    explanation: "False. No U-turn signs must be obeyed regardless of traffic conditions."
  },
  {
    id: 97,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When the vehicle in front is overtaking the general motorized bicycle, you are allowed to overtake that vehicle in front.",
    answer: false,
    explanation: "False. Cannot overtake vehicle that is already overtaking another vehicle."
  },
  {
    id: 98,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When overtaking a vehicle by motorcycle, it can pass the left side of the vehicle.",
    answer: false,
    explanation: "False. Overtaking must be done on right side only in Japan."
  },
  {
    id: 99,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "During a flashing red light, I slowed down and drove through the intersection while paying attention to the other traffic.",
    answer: false,
    explanation: "False. Flashing red requires complete STOP, not just slowing down."
  },
  {
    id: 100,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When towing a broken down vehicle by rope or crane, towing license is not required regardless of the total vehicle weight of the broken down vehicle.",
    answer: false,
    explanation: "False. Towing vehicles over 750kg total weight requires towing license."
  },

  // Driver's License Preliminary Final Written Test 1
  {
    id: 101,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Road marking refers to lines, symbols and letters shown on the road by paint or something like that. There are two types of road markings: Regulatory markings and Indication markings.",
    answer: true,
    explanation: "True. Road markings are classified as regulatory (mandatory) or indication (advisory)."
  },
  {
    id: 102,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "If an emergency vehicle approaches while you are driving within the lane direction designation, you should yield / give way to it after the designated section.",
    answer: false,
    explanation: "False. Must yield immediately to emergency vehicles, not wait until after designated section."
  },
  {
    id: 103,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When driving a two wheels vehicle such as motorcycle at a bend, it is dangerous to disengage the clutch or shift to neutral.",
    answer: true,
    explanation: "True. Disengaging clutch in turns removes engine braking and reduces control."
  },
  {
    id: 104,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When driving a two wheels vehicle, put the arch of your right foot on the step and the toe should be under the brake pedal, the toe of your left feet should be under the gear-shift.",
    answer: false,
    explanation: "False. Right toe should be ON (not under) brake pedal; left toe on gear shift."
  },
  {
    id: 105,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not obstruct a vehicle coming from your left at an uncontrolled intersection if the width of both roads is similar.",
    answer: false,
    explanation: "False. Vehicles from RIGHT have priority at equal-width uncontrolled intersections."
  },
  {
    id: 106,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the traffic signal ahead was green, I turned left at the intersection because the police officer facing me extended his/her arms horizontally.",
    answer: false,
    explanation: "False. Traffic light takes priority over conflicting police signals in normal situations."
  },
  {
    id: 107,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not squeeze or cut in ahead of the motor vehicle with a beginner or senior driver's sign.",
    answer: true,
    explanation: "True. Prohibited to cut in front of vehicles displaying beginner or senior marks."
  },
  {
    id: 108,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The main traffic lane means the part of the road for cars to drive generally on expressway (excluding the acceleration lane, deceleration lane, slower traffic lane, side strip and hard shoulder).",
    answer: true,
    explanation: "True. Main traffic lane excludes auxiliary lanes and shoulders."
  },
  {
    id: 109,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "On national expressway, you must not drive below the minimum speed limit even when you avoid danger.",
    answer: false,
    explanation: "False. Can drive below minimum when necessary to avoid danger."
  },
  {
    id: 110,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road sign in Figure 1 indicates that a vehicle may turn left while paying attention to the surrounding traffic, even when the traffic signal ahead is red or amber.",
    answer: true,
    explanation: "True. This arrow sign allows left turn on red after stopping and checking."
  },
  {
    id: 111,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road sign in Figure 2 indicates \"one-way\".",
    answer: true,
    explanation: "True. One-way traffic sign indicating direction of permitted travel."
  },
  {
    id: 112,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road marking in Figure 3 indicates \"No stopping zone\".",
    answer: true,
    explanation: "True. This marking prohibits all stopping."
  },
  {
    id: 113,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road sign in Figure 4 indicates that the road ahead is wider.",
    answer: false,
    explanation: "False. This likely indicates road narrows, not widens."
  },
  {
    id: 114,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road sign in Figure 5 indicates \"road narrows\".",
    answer: true,
    explanation: "True. Warning sign indicating road width decreases ahead."
  },
  {
    id: 115,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The road with the road marking in Figure 6, parking is prohibited but stopping is allowed.",
    answer: true,
    explanation: "True. Yellow line typically allows stopping but prohibits parking."
  },
  {
    id: 116,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the side strip shown in Figure 7 is present, parking or stopping of vehicles and the passage of light vehicles are prohibited.",
    answer: false,
    explanation: "False. Side strips can typically be used by light vehicles and for emergency stops."
  },
  {
    id: 117,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The legal maximum speed for general motorized bicycles is 30km/h.",
    answer: true,
    explanation: "True. Motorized bicycles limited to 30km/h maximum."
  },
  {
    id: 118,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Seatbelts should be fastened across the stomach.",
    answer: false,
    explanation: "False. Seatbelts across hips/pelvis, not soft stomach tissue."
  },
  {
    id: 119,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When towing a broken vehicle by rope or crane, towing license is not required even if the total vehicle weight exceeds 750kg.",
    answer: false,
    explanation: "False. Towing license required for vehicles over 750kg total weight."
  },
  {
    id: 120,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When driving a vehicle, you must carry a regular motor vehicle license, inspection certificate and a third party liability automobile insurance certificate.",
    answer: true,
    explanation: "True. Must carry license, vehicle inspection (shaken) and insurance certificates."
  },
  {
    id: 121,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Stopping distance means that the total distance of reaction distance and braking distance.",
    answer: true,
    explanation: "True. Total stopping distance = reaction distance + braking distance."
  },
  {
    id: 122,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "A general motorized bicycle driver is not required to purchase third party liability automobile insurance.",
    answer: false,
    explanation: "False. ALL motorized vehicles including motorized bicycles require compulsory insurance."
  },
  {
    id: 123,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Because it is more difficult to start on an uphill, the drivers in the down hill should pull over and yield.",
    answer: true,
    explanation: "True. Downhill traffic yields to uphill traffic on narrow roads."
  },
  {
    id: 124,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When crossing a sidewalk with a child, you must use the proper child seat for him/her depending on the degree of his/her growth.",
    answer: false,
    explanation: "False. Child seats for IN vehicle, not when crossing sidewalk as pedestrian."
  },
  {
    id: 125,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When an obstacle is ahead, stop or slow down to yield to the vehicle approaching from the opposite direction.",
    answer: true,
    explanation: "True. Vehicle on side with obstacle must yield to oncoming traffic."
  },
  {
    id: 126,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "I stopped my vehicle less than 5m from a road construction to pick up or drop off passengers.",
    answer: false,
    explanation: "False. Stopping within 5m of construction is generally prohibited."
  },
  {
    id: 127,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "A passenger vehicle with a seating capacity of 5 allows 3 adults and 2 children below 12 years old, plus the driver.",
    answer: false,
    explanation: "False. 5-seat capacity includes driver; max is 5 people total (children count as 2/3)."
  },
  {
    id: 128,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Because the traffic signal at the intersection ahead turned amber/yellow, I accelerated and crossed the intersection.",
    answer: false,
    explanation: "False. Amber means stop if safe to do so, not accelerate through."
  },
  {
    id: 129,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When turning right at an intersection, you must not obstruct the oncoming vehicle even if your vehicle has entered the intersection first.",
    answer: true,
    explanation: "True. Straight/left traffic has priority over right-turning vehicles even if you entered first."
  },
  {
    id: 130,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Renewal of your driver's license must be completed within 2 months before the expiry date of your license.",
    answer: false,
    explanation: "False. Renewal window is typically 1 month before to 1 month after birthday."
  },
  {
    id: 131,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "If the speed of vehicle doubles, the braking distance and centrifugal force also double.",
    answer: false,
    explanation: "False. Braking distance increases by square (4x at 2x speed); centrifugal force also increases exponentially."
  },
  {
    id: 132,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the driver is tired, the reaction distance becomes longer because it takes longer time to recognize and judge.",
    answer: true,
    explanation: "True. Fatigue slows perception and reaction time, increasing reaction distance."
  },
  {
    id: 133,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Parking to wait for passengers is prohibited less than 1m from a fire alarm but stopping to pick up or drop off passengers is allowed.",
    answer: false,
    explanation: "False. Both parking and stopping prohibited within 1m of fire alarm/hydrant."
  },
  {
    id: 134,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Regular motorcycle with 125cc or less cannot be driven on national expressway but it can be driven on motorways.",
    answer: false,
    explanation: "False. Motorcycles 125cc or less prohibited on ALL expressways and motorways."
  },
  {
    id: 135,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "The timing of signal for left or right turn is approximately 3 seconds before the actions.",
    answer: true,
    explanation: "True. Turn signals should be given about 3 seconds before the turn."
  },
  {
    id: 136,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Parking is prohibited on road if there is a space of 3.5m or less on the right hand side of the vehicle.",
    answer: true,
    explanation: "True. Cannot park if less than 3.5m clearance remains for other vehicles."
  },
  {
    id: 137,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Vehicles cannot enter a safety zone except in unavoidable situations to avoid danger.",
    answer: true,
    explanation: "True. Safety zones for pedestrians; vehicles only enter in emergencies."
  },
  {
    id: 138,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the red traffic light is flashing, pedestrians can proceed while paying attention to other traffics.",
    answer: false,
    explanation: "False. Flashing red means stop for both vehicles AND pedestrians."
  },
  {
    id: 139,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not drive when you are exhausted because of overtime work, etc.",
    answer: true,
    explanation: "True. Driving while exhausted is prohibited and dangerous."
  },
  {
    id: 140,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Even if there is a road sign \"No crossing\" vehicle can turn left to enter a parking lot.",
    answer: true,
    explanation: "True. Can cross to enter roadside facilities despite no-crossing signs."
  },
  {
    id: 141,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "If the lines for vehicle lanes are yellow, drivers must not cross over the lines for changing lane to the right to make a right turn at an intersection.",
    answer: false,
    explanation: "False. Can cross yellow lane lines to position for turns at intersections."
  },
  {
    id: 142,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When driving around a bend, drivers must use their horn even if there is no \"Sound horn\" sign.",
    answer: false,
    explanation: "False. Horn only at designated horn zones or for danger avoidance."
  },
  {
    id: 143,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Carrying a passenger is prohibited on a regular motorcycle without a passenger seat on a general motorized bicycle.",
    answer: true,
    explanation: "True. Passenger riding requires proper passenger seat/footrests."
  },
  {
    id: 144,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "A bicycle was crossing on the bicycle crossing zone, so I reduced my speed to stop immediately then passed.",
    answer: true,
    explanation: "True. Must slow to stop-ready speed and yield to bicycles at bicycle crossings."
  },
  {
    id: 145,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When driving a vehicle, visual field becomes wider as the speed increases.",
    answer: false,
    explanation: "False. Visual field NARROWS as speed increases due to tunnel vision effect."
  },
  {
    id: 146,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the traffic light is green at a railway crossing, vehicles can pass without stopping after checking safety.",
    answer: true,
    explanation: "True. If crossing has signals and green light shows, can proceed after safety check."
  },
  {
    id: 147,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "When the headlights of an oncoming vehicle are too bright, you should turn your eyes slightly to the left.",
    answer: true,
    explanation: "True. Look slightly left to avoid glare while maintaining awareness of road."
  },

  // Driver's License Preliminary Final Written Test 2
  {
    id: 148,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Vehicles must slow down under the flashing amber light.",
    answer: true,
    explanation: "True. Flashing amber requires slowing down and proceeding with caution."
  },
  {
    id: 149,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "As the traffic wardens are not regarded as the policemen, drivers do not need to obey their hand signal.",
    answer: false,
    explanation: "False. Traffic wardens have authority; their signals must be obeyed."
  },
  {
    id: 150,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Although parking and stopping are prohibited on the railway crossings and within 10m of those places, vehicles are allowed to stop for your safety (for the prevention of accidents).",
    answer: false,
    explanation: "False. No stopping within 10m of railway crossings except to avoid collision in crossing itself."
  },
  {
    id: 151,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The longer the body of the car is, the larger the wheelbase differential becomes.",
    answer: true,
    explanation: "True. Longer wheelbase creates greater inner wheel differential in turns."
  },
  {
    id: 152,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When passing a stopped school bus, drivers must stop and check safety.",
    answer: true,
    explanation: "True. Must stop when passing school buses loading/unloading children."
  },
  {
    id: 153,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When driving near the safety zone without pedestrians, drivers do not need to slow down.",
    answer: false,
    explanation: "False. Must slow down near safety zones even without visible pedestrians."
  },
  {
    id: 154,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When a police officer stretches his/her arms horizontally as the hand signal, vehicles(traffic) facing the police officer's body cannot go straight, however it is possible to turn left and right.",
    answer: false,
    explanation: "False. Traffic facing officer with horizontal arms cannot proceed at all (like red light)."
  },
  {
    id: 155,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When you are driving in the intersection and an emergency vehicle is approaching, you must stop immediately.",
    answer: false,
    explanation: "False. In intersection, clear it first THEN pull over; don't stop in intersection."
  },
  {
    id: 156,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When the engine revolutions remain high while riding a two-wheeled vehicle, it is better to keep riding with half-clutch position.",
    answer: false,
    explanation: "False. Half-clutch causes wear; should adjust throttle or shift gears properly."
  },
  {
    id: 157,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When you pass a child walking alone or a person using the white or yellow cane, you must not obstruct their passage by slowing down or stopping.",
    answer: false,
    explanation: "False. MUST slow down or stop to protect vulnerable pedestrians; it helps not obstructs them."
  },
  {
    id: 158,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The maximum legal speed on a motorway is the same as on a general road.",
    answer: false,
    explanation: "False. Motorways typically allow higher speeds (100-120km/h) than general roads (60km/h)."
  },
  {
    id: 159,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road sign shown in Figure 1 indicates \"one way\".",
    answer: true,
    explanation: "True. One-way traffic sign."
  },
  {
    id: 160,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road sign shown in Figure 2 indicates \"No entry for vehicle\".",
    answer: true,
    explanation: "True. No entry/no vehicles allowed sign."
  },
  {
    id: 161,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road sign shown in Figure 3 indicates \"No overtaking\".",
    answer: true,
    explanation: "True. Overtaking prohibited sign."
  },
  {
    id: 162,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road marking shown in Figure 4 indicates vehicles are prohibited from entering this area.",
    answer: true,
    explanation: "True. No-entry zone road marking."
  },
  {
    id: 163,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road marking shown in Figure 5 indicates \"bicycle crossing zone\".",
    answer: true,
    explanation: "True. Bicycle crossing zone marking."
  },
  {
    id: 164,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "On a road with the road sign shown in Figure 6, vehicles with permission can pass, however in this case, they must slow down and pay special attention to pedestrians.",
    answer: true,
    explanation: "True. Restricted access sign; permitted vehicles must use extreme caution."
  },
  {
    id: 165,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The road sign shown in Figure 7 indicates \"no parking or stopping between 8:00 and 20:00\".",
    answer: true,
    explanation: "True. Time-restricted parking/stopping prohibition sign."
  },
  {
    id: 166,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "On a road with the road marking shown in Figure 8, vehicles must not change lanes as the arrow indicates.",
    answer: true,
    explanation: "True. Solid lane marking prohibits lane changes."
  },
  {
    id: 167,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When pushing a large or regular motorcycle with the engine off, you are considered to be a pedestrian.",
    answer: true,
    explanation: "True. Motorcycles with engine off being pushed are pedestrians."
  },
  {
    id: 168,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The width of a load on a general motorized bicycle or regular motorcycle can exceed up to 0.15m on both sides of the loading equipment.",
    answer: true,
    explanation: "True. Load width can extend 0.15m (15cm) on each side."
  },
  {
    id: 169,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When you check the chain of a two-wheeled vehicle, see whether it is too tight or too loose.",
    answer: true,
    explanation: "True. Chain tension must be checked - too tight or loose causes problems."
  },
  {
    id: 170,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A driver who has held a regular motorcycle license for 1 year or more can carry a passenger when riding a regular motorcycle on the expressway.",
    answer: true,
    explanation: "True. Need 1+ year experience before carrying passenger on expressways."
  },
  {
    id: 171,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The height restriction of a load on a large or regular motorcycle is 2m or lower from the loading equipment.",
    answer: true,
    explanation: "True. Maximum load height is 2m from loading surface."
  },
  {
    id: 172,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When riding a two-wheeled vehicle, it is advisable to wear the clothes which do not expose your body and the bright color cloths which can be seen clearly from other traffic.",
    answer: true,
    explanation: "True. Protective, visible clothing recommended for motorcycle safety."
  },
  {
    id: 173,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "It is better to apply the brake hard and lock the wheel to stop in the shorter stopping distance when you stop the motorcycle.",
    answer: false,
    explanation: "False. Locking wheels causes loss of control and increases stopping distance. Use progressive braking."
  },
  {
    id: 174,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "In a location where there is less than 3.5 meters on the right hand side of a parked vehicle, I loaded/unloaded within 10 minutes while I was able to move the vehicle immediately.",
    answer: false,
    explanation: "False. Cannot park where less than 3.5m clearance remains, even briefly."
  },
  {
    id: 175,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When I came into the priority road, I proceeded first because the other vehicles on the priority road were coming from right side.",
    answer: false,
    explanation: "False. Vehicles ON priority road have priority regardless of direction."
  },
  {
    id: 176,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Warning signs inform drivers of danger on the road or of conditions that require special attention.",
    answer: true,
    explanation: "True. Warning signs alert to hazards and conditions requiring caution."
  },
  {
    id: 177,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When the gear shift of Automatic vehicle is in other than \"P\" or \"N\", the vehicle moves automatically even without stepping on the accelerator. This is known as the \"Creep phenomenon\".",
    answer: true,
    explanation: "True. Creep phenomenon causes automatic vehicles to move forward in gear without accelerator."
  },
  {
    id: 178,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The vehicle must stop or slow down under the flashing red light.",
    answer: true,
    explanation: "True. Flashing red requires complete stop, check safety, then proceed."
  },
  {
    id: 179,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When the vehicle ahead is trying to overtake another motor vehicle, you should not attempt to overtake the vehicle.",
    answer: true,
    explanation: "True. Do not overtake vehicle that is already overtaking."
  },
  {
    id: 180,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "There was a pedestrian crossing the road near an intersection without a pedestrian crossing, I slowed down so as not to obstruct the pedestrian.",
    answer: true,
    explanation: "True. Must not obstruct pedestrians crossing at intersections even without marked crossings."
  },
  {
    id: 181,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Passengers as well as drivers must fasten their seatbelt.",
    answer: true,
    explanation: "True. All occupants must wear seatbelts."
  },
  {
    id: 182,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The engine brake of the high gear is more effective than the low gear.",
    answer: false,
    explanation: "False. LOW gear provides more effective engine braking than high gear."
  },
  {
    id: 183,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Brakes of a two-wheeled vehicle are front wheel braking by gripping the brake lever, rear wheel braking using brake pedal or brake lever and engine braking.",
    answer: true,
    explanation: "True. Motorcycles have three braking systems: front, rear, and engine brake."
  },
  {
    id: 184,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The square right turn for general motorized bicycle and the method of turning right for motor vehicle are same.",
    answer: false,
    explanation: "False. Motorized bicycles use two-stage square turn; cars turn directly."
  },
  {
    id: 185,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "I wore a construction helmet when driving a general motorized bicycle.",
    answer: false,
    explanation: "False. Must wear approved motorcycle helmet, not construction helmet."
  },
  {
    id: 186,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "It is better for a beginner driver to drive a vehicle with the interior light on because it becomes easier to see in the car.",
    answer: false,
    explanation: "False. Interior lights at night reduce visibility outside and cause glare on windshield."
  },
  {
    id: 187,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A driver must slow down when making a left turn and must stop when making a right turn.",
    answer: false,
    explanation: "False. Slow down for BOTH turns; stopping only required at stop signs/signals."
  },
  {
    id: 188,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When overtaking another vehicle, if the front vehicle is driving on the center of the road, drivers must pass on the left side of it.",
    answer: false,
    explanation: "False. Must overtake on RIGHT side. If vehicle is centered, cannot safely overtake."
  },
  {
    id: 189,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Even when driving on a right-of-way road, you must slow down at an intersection with poor left and right visibility.",
    answer: true,
    explanation: "True. Poor visibility requires slowing even on priority roads."
  },
  {
    id: 190,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When an emergency vehicle is approaching on or near an intersection, you must avoid the intersection, pull over to the left hand side of the road, and stop.",
    answer: true,
    explanation: "True. Clear intersection first, then pull left and stop for emergency vehicles."
  },
  {
    id: 191,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "Since the automobile inspection certification and the third party liability automobile insurance is important, you should keep them at home and store the copies in the vehicle.",
    answer: false,
    explanation: "False. Must carry ORIGINAL documents in vehicle at all times."
  },
  {
    id: 192,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When you change vehicle lanes, make a signal after checking safety with your rear view mirrors etc.",
    answer: false,
    explanation: "False. Signal BEFORE lane change (30m before), then check mirrors and blind spots."
  },
  {
    id: 193,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "When the engine is overheated, you should stop the engine immediately.",
    answer: false,
    explanation: "False. Let engine idle briefly to cool gradually; immediate shutdown can cause damage."
  },
  {
    id: 194,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "If a police officer is giving hand signal at a location other than an intersection where there is no pedestrian crossing or bicycle crossing zone, the proper place to stop is 2 meters in front of the police officer.",
    answer: false,
    explanation: "False. Stop 1 meter (not 2 meters) in front of officer."
  },
  {
    id: 195,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "The maximum legal speed of a large-sized truck on a general road is 60km/h.",
    answer: true,
    explanation: "True. Large trucks limited to 60km/h on general roads."
  },

  // Driver's License Preliminary Final Written Test 3
  {
    id: 196,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive when you are exhausted because of overtime work, etc.",
    answer: true,
    explanation: "True. Driving while exhausted is prohibited and extremely dangerous."
  },
  {
    id: 197,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Knees should be straightened when stepping on the clutch pedal as the correct driving posture for a regular motor vehicle.",
    answer: false,
    explanation: "False. Knees should be SLIGHTLY bent when pressing clutch fully for proper posture and control."
  },
  {
    id: 198,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When driving with an infant in the vehicle, drivers are required to use a child seat that corresponds to the physique of the infant.",
    answer: true,
    explanation: "True. Age/size-appropriate child restraints required for children under 6."
  },
  {
    id: 199,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When the traffic signal is amber, pedestrians, vehicles and streetcars can proceed through the intersection while paying attention to other traffic.",
    answer: false,
    explanation: "False. Amber means STOP if safe to do so; proceeding only if cannot stop safely."
  },
  {
    id: 200,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "If you are aware that the driver has consumed alcohol, you must not ask him/her to drive you home.",
    answer: true,
    explanation: "True. Asking drunk person to drive makes you complicit; both face penalties."
  },
  {
    id: 201,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "In a dense fog, drivers had better to use the horns when it is necessary to avoid danger.",
    answer: true,
    explanation: "True. Horn allowed in fog to avoid danger, though fog lights preferred."
  },
  {
    id: 202,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "At an amber arrow light, pedestrians and vehicles can proceed in the direction of the arrow.",
    answer: false,
    explanation: "False. Amber arrow typically not used; green arrow permits directional movement."
  },
  {
    id: 203,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "At a flashing red light, vehicles and streetcars must stop at the stop line and proceed after checking safety.",
    answer: true,
    explanation: "True. Flashing red = stop sign; must stop completely and check safety."
  },
  {
    id: 204,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The vehicles turning right at the intersection may continue to go without stopping even if the traffic signal on the right is red.",
    answer: false,
    explanation: "False. Must obey traffic signals; cannot proceed through red light when turning."
  },
  {
    id: 205,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "In case a sticker confirming left vehicle was placed on vehicle but the driver did not pay the fine for it and could not be identified, the user of that vehicle is ordered to pay the fine.",
    answer: true,
    explanation: "True. Registered owner responsible for parking violations if driver unidentified."
  },
  {
    id: 206,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The driver must slow down at the intersection when turning right or left even though it is controlled intersection.",
    answer: true,
    explanation: "True. Must slow for turns even at signalized intersections."
  },
  {
    id: 207,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "General motorized bicycles making a right turn at an intersection with the road sign shown in Figure 1 must use square right turn method.",
    answer: true,
    explanation: "True. Motorized bicycles use two-stage square turn at designated intersections."
  },
  {
    id: 208,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Road with the road sign shown in Figure 2 is closed to large-sized passenger vehicle and all kinds of middle-sized passenger vehicles.",
    answer: true,
    explanation: "True. Sign prohibits large and middle-sized passenger vehicles."
  },
  {
    id: 209,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Middle-sized trucks with total vehicle weight of 8 tons or more must drive on the far left lane on the road with the road sign shown in Figure No.3.",
    answer: true,
    explanation: "True. Heavy trucks required to use left lanes on multi-lane roads."
  },
  {
    id: 210,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The road sign shown in Figure 4 indicates that riding with a passenger is prohibited in case of driving on a large or regular motorcycle.",
    answer: true,
    explanation: "True. Two-person riding prohibition sign for motorcycles."
  },
  {
    id: 211,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Indication signs indicate specific traffic regulations and designated locations for road traffic.",
    answer: false,
    explanation: "False. REGULATORY signs indicate regulations. Indication signs provide guidance/information."
  },
  {
    id: 212,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Auxiliary sign shown on Figure 5 indicates the end of the section or zone where the traffic regulation shown by the main sign.",
    answer: true,
    explanation: "True. Auxiliary signs can indicate end of regulatory zone."
  },
  {
    id: 213,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The road sign shown in Figure 6 indicates that school, kindergarten, nursery etc. is in the vicinity.",
    answer: true,
    explanation: "True. School zone warning sign."
  },
  {
    id: 214,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Drivers can park their vehicles at places with the road sign shown in Figure 7.",
    answer: true,
    explanation: "True. Parking permitted sign indicates designated parking area."
  },
  {
    id: 215,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Regular motorcycles of 125cc or less are not allowed to use the roads with the road sign shown in Figure 8.",
    answer: true,
    explanation: "True. Expressway/motorway signs prohibit motorcycles under 125cc."
  },
  {
    id: 216,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The road sign shown in Figure 9 indicates a bus stop.",
    answer: true,
    explanation: "True. Bus stop indication sign."
  },
  {
    id: 217,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Drivers should accelerate sufficiently in the acceleration lane when entering the main traffic lane on the expressway.",
    answer: true,
    explanation: "True. Match highway speed in acceleration lane for safe merging."
  },
  {
    id: 218,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Although a police officer prohibited crossing the bridge because the river had risen, I crossed the bridge anyway since it was not prohibited by a road sign.",
    answer: false,
    explanation: "False. Police officer orders supersede lack of signs; must obey officer."
  },
  {
    id: 219,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "I notified a police officer of removing the road sign because it obstructs the road construction works.",
    answer: false,
    explanation: "False. Cannot remove traffic signs; contact authorities who will handle properly."
  },
  {
    id: 220,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Motor vehicles driving on a road without a sidewalk or side strip are prohibited from driving on the hard shoulder, but 2-wheelers are not prohibited.",
    answer: false,
    explanation: "False. Hard shoulder restrictions apply equally to all vehicles including motorcycles."
  },
  {
    id: 221,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When driving on a graveled or muddy road, drivers should use lower gear and keep constant speed.",
    answer: true,
    explanation: "True. Low gear and steady speed provide better traction on unpaved surfaces."
  },
  {
    id: 222,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "On a road in which the width of the left hand side is below 9m with good visibility and there is no possibility of obstructing other traffic moving in the opposite lane, drivers can overtake by entering the right hand side of the road.",
    answer: false,
    explanation: "False. Cannot cross to right side for overtaking when road width is limited or center line prohibits."
  },
  {
    id: 223,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "On roads where exclusive lanes for buses are designated, general motorized bicycles must not use the vehicle lane.",
    answer: false,
    explanation: "False. Motorized bicycles can use bus lanes in some jurisdictions or must use regular lanes."
  },
  {
    id: 224,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Inspection by a driver of regular sized passenger vehicle for private use must be carried out at appropriate intervals based on travel distances and the condition of the vehicle.",
    answer: false,
    explanation: "False. Shaken inspection required at MANDATED intervals (every 2 years), not just when convenient."
  },
  {
    id: 225,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The general motorized bicycles driving on the priority lane for buses can keep staying there even if the buses are approaching / coming from behind.",
    answer: false,
    explanation: "False. Must exit bus lane to allow buses to pass."
  },
  {
    id: 226,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Because I missed an exit on an expressway, I reversed until the exit while checking safety in the rear.",
    answer: false,
    explanation: "False. Reversing on expressways is extremely dangerous and illegal. Continue to next exit."
  },
  {
    id: 227,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Drivers must not obstruct streetcars and vehicles coming from left at the uncontrolled intersection where the width of both roads is similar.",
    answer: false,
    explanation: "False. Yield to traffic from RIGHT (not left) at equal intersections."
  },
  {
    id: 228,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When a vehicle ahead indicates to change lane in order to make a left or right turn, other vehicles must not obstruct the changing lane of that vehicle.",
    answer: true,
    explanation: "True. Must not obstruct vehicles signaling to change lanes for turns."
  },
  {
    id: 229,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When a green arrow light is on, streetcars can proceed in the direction indicated by the arrow.",
    answer: true,
    explanation: "True. Green arrows apply to streetcars, allowing directional movement."
  },
  {
    id: 230,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When crossing the railway crossing, driver should proceed along the left edge of it while paying attention to the pedestrians and oncoming vehicles.",
    answer: false,
    explanation: "False. Cross railway tracks as directly/perpendicularly as possible, not necessarily at left edge."
  },
  {
    id: 231,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "General motorized bicycle must not exceed 30km/h when there is no road sign \"Maximum speed limit\".",
    answer: true,
    explanation: "True. Motorized bicycles have 30km/h absolute limit regardless of posted limits."
  },
  {
    id: 232,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may tow the broken vehicle by rope on the national expressways.",
    answer: false,
    explanation: "False. Towing by rope prohibited on expressways; must use tow truck."
  },
  {
    id: 233,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Large or regular motorcycles are allowed to drive on the hard shoulder of an expressway.",
    answer: false,
    explanation: "False. Hard shoulders are emergency use only, not for regular motorcycle travel."
  },
  {
    id: 234,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "The daily inspection of brakes on motorcycles should be done to know whether the \"play\" in the brake pedal or brake lever is appropriate and the brakes work sufficiently.",
    answer: true,
    explanation: "True. Daily brake inspection includes checking free play and brake effectiveness."
  },
  {
    id: 235,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When driving near pedestrians, vehicles must maintain a safe distance or must slow down.",
    answer: true,
    explanation: "True. Must maintain safe distance or reduce speed when near pedestrians."
  },
  {
    id: 236,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "If there is a stationary vehicle in front of a pedestrian crossing, vehicles must slow down when passing that vehicle.",
    answer: false,
    explanation: "False. Must slow down or STOP, as vehicle may be yielding to pedestrians you cannot see."
  },
  {
    id: 237,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When driving near a stopped school bus, drivers must stop and check safety.",
    answer: true,
    explanation: "True. Must stop when passing school buses loading/unloading children."
  },
  {
    id: 238,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Driving below the minimum speed on the slower traffic lane of national expressways is allowed since the slower traffic lane is not the main vehicle lane.",
    answer: false,
    explanation: "False. Minimum speed applies to all lanes including slower traffic lane."
  },
  {
    id: 239,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When reversing is necessary to start to drive under an avoidable situation, it is highly recommended to ask someone, a passenger, etc. to check safety behind the vehicle.",
    answer: true,
    explanation: "True. Having spotter when reversing greatly improves safety."
  },
  {
    id: 240,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "When you park or stop your motor vehicle on the road at night, you must put on the lights such as hazard lights, parking lights or tail lights even if the streetlight makes your vehicle visible from 50 meters behind it.",
    answer: true,
    explanation: "True. Must use lights when parked at night regardless of street lighting."
  },
  {
    id: 241,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Sticking your right arm out of the vehicle with arm bent vertically at the elbow is a signal for making a U-turn.",
    answer: false,
    explanation: "False. This is right turn signal. U-turn signal is same as left turn or specific gestures depending on context."
  },
  {
    id: 242,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Drivers must not change lanes unnecessarily.",
    answer: true,
    explanation: "True. Excessive/unnecessary lane changes are prohibited and dangerous."
  },
  {
    id: 243,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Overtaking means that a vehicle changes lanes and drive along side and go ahead of that vehicle.",
    answer: true,
    explanation: "True. Overtaking involves lane change, passing alongside, and moving ahead."
  },
  {
    id: 244,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Overtaking is prohibited at railway crossing, pedestrian crossing and bicycle crossing zone and less than 50m of them.",
    answer: false,
    explanation: "False. Overtaking prohibited AT crossings and within 30m (not 50m) before them."
  },
];
