export interface Question {
  id: number;
  test: string;
  question: string;
  answer: boolean;
  explanation: string;
  figure?: string;
}

export const testCategories = [
  "Learner's Permit Preliminary Written Test 2",
  "Learner's Permit Preliminary Written Test 3",
  "Driver's License Preliminary Final Written Test 1",
  "Driver's License Preliminary Final Written Test 2",
  "Driver's License Preliminary Final Written Test 3"
] as const;

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
  {
    id: 51,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You cannot drive a special light equipment with regular vehicle license but can drive a regular motorcycle with less than 125cc or general motorized bicycle.",
    answer: false,
    explanation: "False. A regular vehicle license allows driving a regular motorcycle (≤125cc) and general motorized bicycle, but special light equipment requires its own class."
  },
  {
    id: 52,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "In principle, vehicles except for designated vehicles, special light equipment and light vehicles cannot drive on the exclusive lane for buses.",
    answer: true,
    explanation: "True. Bus-priority lanes are reserved for buses and other designated vehicles only."
  },
  {
    id: 53,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Even if the width of the lane on the left is 6m or more, drivers can cross over the centerline to overtake another vehicle ahead if you don't obstruct other drivers.",
    answer: false,
    explanation: "False. Crossing the centerline for overtaking is prohibited unless the road is clearly marked for it."
  },
  {
    id: 54,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When overtaking, you should signal and then check safety of the traffic around.",
    answer: true,
    explanation: "True. Signal → mirror → blind-spot check → overtake."
  },
  {
    id: 55,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When stopping or parking on a wide side strip, at least 0.75 meters must be left open on the left hand side of the road.",
    answer: true,
    explanation: "True. Minimum clearance for pedestrians and emergency access."
  },
  {
    id: 56,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "I drove a truck with the minimum number of people required to load/unload on the load-carrying platform.",
    answer: false,
    explanation: "False. Passengers are not allowed on the load platform while moving."
  },
  {
    id: 57,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When a traffic accident occurs, stop and help the injured, and take measures to prevent farther accident.",
    answer: true,
    explanation: "True. Article 72 – render aid and secure the scene."
  },
  {
    id: 58,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Some degree of \"play\" is essential in the brake and clutch pedals.",
    answer: true,
    explanation: "True. A small amount of free play is normal and required for proper operation."
  },
  {
    id: 59,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When parking or stopping on a road without a sidewalk or side strip, at least 0.75 meters must be left open on the left hand side of the car to allow pedestrians to proceed.",
    answer: true,
    explanation: "True. Same clearance rule applies."
  },
  {
    id: 60,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The maximum legal speed of regular motorcycles on a national expressway is 80km/h, and 100km/h for large motorcycles.",
    answer: true,
    explanation: "True. Expressway limits: 80 km/h (regular), 100 km/h (large)."
  },
  {
    id: 61,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "As two-wheeled vehicles with modified handlebars are dangerous to drive, such remodeling must not be conducted.",
    answer: true,
    explanation: "True. Illegal modification affecting safety."
  },
  {
    id: 62,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving regular or large motorcycle, you can overtake another vehicle on either the left or right.",
    answer: false,
    explanation: "False. Overtaking is only allowed on the right in Japan (except in specific cases)."
  },
  {
    id: 63,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Special light equipment and general motorized bicycle can be driven with a regular motorcycle license.",
    answer: false,
    explanation: "False. Special light equipment requires its own license."
  },
  {
    id: 64,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The load weight restriction of a moped is 30kg or less, and 60kg or less for a large and regular motorcycle.",
    answer: true,
    explanation: "True. Legal load limits by vehicle class."
  },
  {
    id: 65,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "If a driver purchases an optional insurance, the driver does not need to purchase a third party liability automobile insurance.",
    answer: false,
    explanation: "False. Third-party liability insurance is mandatory."
  },
  {
    id: 66,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When pushing a large or regular motorcycle with the engine off, you are considered to be a pedestrian and you can proceed on the sidewalk or side strip.",
    answer: true,
    explanation: "True. Engine off = pedestrian status."
  },
  {
    id: 67,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving around senior citizen who has difficulty in walking such as walking with cane, a driver must stop or slow down to allow him/her to pass safely.",
    answer: true,
    explanation: "True. Article 38 – priority to vulnerable road users."
  },
  {
    id: 68,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When making a right turn at an intersection, drivers must move over close to the centerline even on one way road, slow down and pass immediately outside the center of the intersection.",
    answer: true,
    explanation: "True. Standard right-turn procedure."
  },
  {
    id: 69,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Regardless of the other traffic or road conditions, it is better to driver at the designated maximum speed for smooth traffic flow.",
    answer: false,
    explanation: "False. Speed must be adjusted to conditions (weather, visibility, etc.)."
  },
  {
    id: 70,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Drivers must slow down to pass through any intersection where it is hard to see on the right or left.",
    answer: true,
    explanation: "True. Article 36 – caution at blind intersections."
  },
  {
    id: 71,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Stopping for less than 5 minutes for loading/unloading or picking up/dropping off passengers are allowed even on No parking area.",
    answer: true,
    explanation: "True. Temporary stop (≤5 min) is permitted for passenger/loading."
  },
  {
    id: 72,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Yellow centerline indicates \"overtaking is prohibited\".",
    answer: true,
    explanation: "True. Solid yellow = no overtaking."
  },
  {
    id: 73,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The centerline is not always located in the center of the road.",
    answer: true,
    explanation: "True. It may be offset for safety or lane width."
  },
  {
    id: 74,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The level of engine oil should be inspected by using the oil level gauge. Below L is not enough but above F is appropriate.",
    answer: false,
    explanation: "False. Oil level must be between L and F."
  },
  {
    id: 75,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When stopping a vehicle on the side strip on expressway at night because of break down, you must turn on the hazard light and put emergency reflector behind the vehicle.",
    answer: true,
    explanation: "True. Required safety equipment on expressways."
  },
  {
    id: 76,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "In principle, vehicles must not drive on the streetcar tracks.",
    answer: true,
    explanation: "True. Only in marked exceptions."
  },
  {
    id: 77,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Though I had drunk a small amount of alcohol, I continued to drive carefully because I was not intoxicated.",
    answer: false,
    explanation: "False. Any alcohol = driving under influence prohibited."
  },
  {
    id: 78,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving on an expressway, air pressure of tires should be set slightly higher to prevent the standing wave phenomenon.",
    answer: true,
    explanation: "True. Higher pressure reduces heat and wave formation at high speed."
  },
  {
    id: 79,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "On a road with vehicle lanes, vehicles must not straddle two lanes except for unavoidable situations.",
    answer: true,
    explanation: "True. Stay within your lane."
  },
  {
    id: 80,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When towing a broken down vehicle by rope, a red square cloth 0.3m×0.3m or larger must be attached to the rope.",
    answer: true,
    explanation: "True. Visibility marker required."
  },
  {
    id: 81,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving a vehicle and your visibility is less than 50m (200m on expressway), even during the daytime such as in tunnel, headlights must be turned on.",
    answer: true,
    explanation: "True. Low visibility = headlights on."
  },
  {
    id: 82,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "As the number of traffics (vehicles) is less at night, you should drive faster than usual.",
    answer: false,
    explanation: "False. Speed must match conditions, not traffic volume."
  },
  {
    id: 83,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When driving on one-way road and an emergency vehicle approached, I pulled over to the right to give way to it because there was a possibility that I obstruct it if I pull over to the left.",
    answer: false,
    explanation: "False. On one-way roads, pull to the right only if safe; otherwise, stop and let it pass."
  },
  {
    id: 84,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Even if the traffic light ahead is green, you must not enter the intersection if there is a possibility that you may be stuck at intersection because of the traffic jam.",
    answer: true,
    explanation: "True. Article 36 – do not block the box."
  },
  {
    id: 85,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When making a left turn at intersection, you have to move over to the left and check for bicycles or general motorized bicycles by looking directly at the blind spot behind on your left.",
    answer: true,
    explanation: "True. Mirror + shoulder check required."
  },
  {
    id: 86,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "On national expressways, you must not tow a broken down vehicle by rope or crane.",
    answer: true,
    explanation: "True. Towing prohibited on expressways."
  },
  {
    id: 87,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When your vehicle has stalled on a railway crossing, shift the gear into low and move it using the cell motor as the emergency means.",
    answer: false,
    explanation: "False. Evacuate and call authorities. Starter motor not for pushing."
  },
  {
    id: 88,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When you change the gearshift from D to R or from R to D in Automatic car, the vehicle must be stopped completely and the brake must be pressed securely.",
    answer: true,
    explanation: "True. Prevents transmission damage."
  },
  {
    id: 89,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The regular vehicle with a seating capacity of 5 can accommodate up to 6 children below 12 years old.",
    answer: false,
    explanation: "False. Child seat rules apply; capacity is by seats, not age."
  },
  {
    id: 90,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Drivers don't need to slow down if there is no sign \"slow down\" near the top of hill.",
    answer: false,
    explanation: "False. Crest of hill = reduced visibility → slow down."
  },
  {
    id: 91,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "U-turn is prohibited inside an intersection.",
    answer: true,
    explanation: "True. U-turns only in designated areas."
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
  
  // === Additional Questions (245-444) ===
  {
    id: 245,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When making a right turn at the intersection, you must move over as close as possible to the center of the road and slow down, pass just in front of the center of the intersection.",
    answer: false,
    explanation: "False. When turning right, you must move to the **left side** of the road (not center) and pass **behind** the center of the intersection. Article 34-2."
  },
  {
    id: 246,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When turning left at an intersection, you should turn wide to allow oncoming traffic to pass smoothly.",
    answer: false,
    explanation: "False. Left turns must be made **close to the center line**, not wide. Wide turns block oncoming traffic."
  },
  {
    id: 247,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A learner's permit holder may drive alone without a supervising licensed driver.",
    answer: false,
    explanation: "False. A supervising driver (3+ years experience) must always be in the front passenger seat."
  },
  {
    id: 248,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The speed limit on general roads is 60 km/h unless otherwise posted.",
    answer: true,
    explanation: "True. Statutory speed limit is 60 km/h on ordinary roads, 100 km/h on expressways."
  },
  {
    id: 249,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must stop completely before a railroad crossing even if the barrier is up and lights are not flashing.",
    answer: false,
    explanation: "False. You must stop only if the barrier is down, lights are flashing, or a train is approaching."
  },
  {
    id: 250,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When a traffic light is yellow, you may proceed if you can safely stop.",
    answer: false,
    explanation: "False. Yellow means **stop** unless you are too close to stop safely."
  },
  {
    id: 251,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Pedestrians always have the right of way at unmarked crosswalks.",
    answer: true,
    explanation: "True. Vehicles must yield to pedestrians at all crosswalks, marked or unmarked."
  },
  {
    id: 252,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "It is legal to pass a stopped streetcar on the left side.",
    answer: false,
    explanation: "False. You must pass on the **right** side of a stopped streetcar."
  },
  {
    id: 253,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may use a mobile phone while driving if you use hands-free mode.",
    answer: false,
    explanation: "False. Using a phone (even hands-free) while driving is prohibited unless the vehicle is stopped."
  },
  {
    id: 254,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A provisional license allows you to carry passengers.",
    answer: false,
    explanation: "False. Provisional license holders may **not** carry passengers (except supervising driver)."
  },
  {
    id: 255,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must display a beginner mark (wakaba) on your car for 1 year after getting a full license.",
    answer: true,
    explanation: "True. New drivers must display the *shoshinsha* mark for 1 year."
  },
  {
    id: 256,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When two vehicles approach an uncontrolled intersection at the same time, the vehicle on the right has priority.",
    answer: true,
    explanation: "True. Right-of-way rule at uncontrolled intersections."
  },
  {
    id: 257,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may park within 5 meters of a fire hydrant.",
    answer: false,
    explanation: "False. No parking within **3 meters** of a fire hydrant or fire station entrance."
  },
  {
    id: 258,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must wear a seatbelt only when driving on expressways.",
    answer: false,
    explanation: "False. Seatbelts are mandatory **at all times** for driver and all passengers."
  },
  {
    id: 259,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "It is legal to overtake a vehicle on the right if there are two lanes in your direction.",
    answer: true,
    explanation: "True. Overtaking on the right is allowed on multi-lane roads."
  },
  {
    id: 260,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive with fog lights on during clear weather.",
    answer: false,
    explanation: "False. Fog lights are only for fog, heavy rain, or snow."
  },
  {
    id: 261,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A red arrow signal means you may proceed in that direction if safe.",
    answer: false,
    explanation: "False. Red arrow means **stop** in that direction."
  },
  {
    id: 262,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must give way to emergency vehicles with flashing red lights and siren.",
    answer: true,
    explanation: "True. Pull over and stop if necessary to let them pass."
  },
  {
    id: 263,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Children under 6 years old must use a child seat.",
    answer: true,
    explanation: "True. Mandatory by law (Road Traffic Act Article 71-3)."
  },
  {
    id: 264,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may make a U-turn at any intersection unless prohibited by a sign.",
    answer: false,
    explanation: "False. U-turns are only allowed where explicitly permitted."
  },
  {
    id: 265,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "The blood alcohol limit for driving is 0.03%.",
    answer: true,
    explanation: "True. 0.03% BAC or 0.15 mg/L breath alcohol is the legal limit."
  },
  {
    id: 266,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive through a yellow flashing light without stopping.",
    answer: true,
    explanation: "True. Yellow flashing means **proceed with caution**."
  },
  {
    id: 267,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must stop behind the stop line at a red light even if no one is crossing.",
    answer: true,
    explanation: "True. Stopping behind the line is mandatory."
  },
  {
    id: 268,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "Bicycles are considered vehicles and must follow the same traffic rules.",
    answer: true,
    explanation: "True. Bicycles are classified as light vehicles."
  },
  {
    id: 269,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may park on the sidewalk if there is no yellow line.",
    answer: false,
    explanation: "False. Parking on sidewalks is prohibited unless designated."
  },
  {
    id: 270,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When entering a priority road, you must yield to vehicles already on it.",
    answer: true,
    explanation: "True. Priority road (wide road) has right of way."
  },
  {
    id: 271,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may exceed the speed limit to overtake a slow vehicle.",
    answer: false,
    explanation: "False. Speeding is never allowed, even when overtaking."
  },
  {
    id: 272,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A triangular sign with a red border means 'yield'.",
    answer: true,
    explanation: "True. Inverted red triangle = yield."
  },
  {
    id: 273,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must sound your horn when approaching a blind corner.",
    answer: false,
    explanation: "False. Horn use is restricted to danger prevention only."
  },
  {
    id: 274,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive in the bus lane during off-hours if no buses are present.",
    answer: false,
    explanation: "False. Bus lanes are for buses only, 24/7 unless signed otherwise."
  },
  {
    id: 275,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must turn on headlights 30 minutes after sunset.",
    answer: true,
    explanation: "True. Headlights required from 30 min after sunset to 30 min before sunrise."
  },
  {
    id: 276,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may stop temporarily to pick up a passenger in a no-stopping zone.",
    answer: false,
    explanation: "False. No stopping means no stopping, even briefly."
  },
  {
    id: 277,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A blue circular sign means the action is mandatory.",
    answer: true,
    explanation: "True. Blue circle = mandatory (e.g., 'go straight')."
  },
  {
    id: 278,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may cross a double yellow line to avoid an obstacle.",
    answer: false,
    explanation: "False. Double yellow lines may never be crossed."
  },
  {
    id: 279,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must keep a safe distance of at least 2 seconds from the car ahead.",
    answer: true,
    explanation: "True. Recommended safe following distance."
  },
  {
    id: 280,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive with only parking lights on at night.",
    answer: false,
    explanation: "False. Headlights must be on; parking lights are insufficient."
  },
  {
    id: 281,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "A learner must display a learner mark (gakushinsha) on the vehicle.",
    answer: true,
    explanation: "True. Green and yellow arrow mark required."
  },
  {
    id: 282,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may make a right turn on red after stopping.",
    answer: false,
    explanation: "False. No right-on-red in Japan. Red means stop."
  },
  {
    id: 283,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must yield to vehicles coming from narrow roads when entering a wide road.",
    answer: false,
    explanation: "False. Vehicles on the **wide road** have priority."
  },
  {
    id: 284,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may use hazard lights while driving in heavy rain.",
    answer: false,
    explanation: "False. Hazard lights are only for stopped vehicles or emergencies."
  },
  {
    id: 285,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "When a school bus is stopped with flashing lights, you must stop in both directions.",
    answer: true,
    explanation: "True. All vehicles must stop when school bus lights are flashing."
  },
  {
    id: 286,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may park within 10 meters of a level crossing.",
    answer: false,
    explanation: "False. No parking within **5 meters** of a railroad crossing."
  },
  {
    id: 287,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "A circular red sign with a white bar means 'no entry'.",
    answer: true,
    explanation: "True. Standard 'no entry' sign."
  },
  {
    id: 288,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must slow down when approaching a pedestrian crossing.",
    answer: true,
    explanation: "True. Reduce speed and be prepared to stop."
  },
  {
    id: 289,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may overtake a vehicle stopped at a crosswalk.",
    answer: false,
    explanation: "False. Never pass a stopped vehicle at a crosswalk — pedestrians may be crossing."
  },
  {
    id: 290,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "A dashed white line allows lane changes.",
    answer: true,
    explanation: "True. Dashed lines permit crossing; solid lines prohibit."
  },
  {
    id: 291,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must signal at least 3 seconds before changing lanes.",
    answer: true,
    explanation: "True. Minimum 3-second signal required."
  },
  {
    id: 292,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with high beams in urban areas if no oncoming traffic.",
    answer: false,
    explanation: "False. High beams are prohibited in illuminated urban areas."
  },
  {
    id: 293,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must stop for a school child with a yellow flag.",
    answer: true,
    explanation: "True. Children with yellow flags indicate crossing in progress."
  },
  {
    id: 294,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may use the shoulder to overtake slow traffic.",
    answer: false,
    explanation: "False. Shoulder is for emergencies only."
  },
  {
    id: 295,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "A triangular sign with a deer means 'watch for animals'.",
    answer: true,
    explanation: "True. Wildlife warning sign."
  },
  {
    id: 296,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may park facing against traffic on a one-way street.",
    answer: false,
    explanation: "False. All parking must be in the direction of traffic."
  },
  {
    id: 297,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must give way to public buses pulling out from a bus stop.",
    answer: true,
    explanation: "True. Buses have priority when re-entering traffic."
  },
  {
    id: 298,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive 10 km/h over the speed limit in good conditions.",
    answer: false,
    explanation: "False. Speeding is never allowed."
  },
  {
    id: 299,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "A blue rectangular sign gives information or guidance.",
    answer: true,
    explanation: "True. Blue rectangles = information (e.g., hospital, parking)."
  },
  {
    id: 300,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must yield to vehicles on your right at a 4-way stop.",
    answer: true,
    explanation: "True. Right-of-way rule applies."
  },
  {
    id: 301,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may stop on a bridge to take photos.",
    answer: false,
    explanation: "False. No stopping on bridges or in tunnels."
  },
  {
    id: 302,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must use low beams when following another vehicle at night.",
    answer: true,
    explanation: "True. High beams blind drivers ahead via mirrors."
  },
  {
    id: 303,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may cross a single yellow line to pass a parked car.",
    answer: true,
    explanation: "True. Single yellow line allows crossing when safe."
  },
  {
    id: 304,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must display a senior driver mark if over 75 years old.",
    answer: true,
    explanation: "True. Four-leaf clover mark required for drivers 75+."
  },
  {
    id: 305,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with a cracked windshield if it doesn't block vision.",
    answer: false,
    explanation: "False. Cracked windshield fails vehicle inspection."
  },
  {
    id: 306,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must stop at a stop sign even if the road is clear.",
    answer: true,
    explanation: "True. Full stop required at all stop signs."
  },
  {
    id: 307,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may use a handheld GPS while driving.",
    answer: false,
    explanation: "False. Handheld devices are prohibited."
  },
  {
    id: 308,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must yield to pedestrians at a green light if they are crossing.",
    answer: true,
    explanation: "True. Pedestrians in crosswalk always have priority."
  },
  {
    id: 309,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may park in a disabled space if you have a passenger with disability.",
    answer: false,
    explanation: "False. Only vehicles with official permit may use disabled spaces."
  },
  {
    id: 310,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must slow down near schools during student hours.",
    answer: true,
    explanation: "True. Extra caution required in school zones."
  },
  {
    id: 311,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may overtake on a hill if the view is clear.",
    answer: false,
    explanation: "False. No overtaking on hills, curves, or near intersections."
  },
  {
    id: 312,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must use turn signals when pulling over to the curb.",
    answer: true,
    explanation: "True. Signal required for any lane change or pull-over."
  },
  {
    id: 313,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive in the left lane on a 2-lane road to pass slower traffic.",
    answer: true,
    explanation: "True. Left lane is for passing on multi-lane roads."
  },
  {
    id: 314,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must keep headlights on in tunnels, day or night.",
    answer: true,
    explanation: "True. Mandatory in all tunnels."
  },
  {
    id: 315,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may make a left turn from the right lane if no one is there.",
    answer: false,
    explanation: "False. Must turn from the correct lane."
  },
  {
    id: 316,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must stop for a blind person with a white cane.",
    answer: true,
    explanation: "True. Absolute priority."
  },
  {
    id: 317,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with one hand if using the other for shifting.",
    answer: false,
    explanation: "False. Both hands should be on the wheel except when operating controls."
  },
  {
    id: 318,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must yield to oncoming traffic when turning left.",
    answer: true,
    explanation: "True. Oncoming straight traffic has priority."
  },
  {
    id: 319,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may park within 1 meter of another vehicle.",
    answer: false,
    explanation: "False. Must allow space for exit (minimum ~50 cm)."
  },
  {
    id: 320,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must check mirrors before braking.",
    answer: true,
    explanation: "True. Check rear before slowing or stopping."
  },
  {
    id: 321,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may use a dashcam that records audio.",
    answer: true,
    explanation: "True. Legal as long as not used to violate privacy."
  },
  {
    id: 322,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must stop at a flashing red light like a stop sign.",
    answer: true,
    explanation: "True. Flashing red = stop, then proceed when safe."
  },
  {
    id: 323,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive barefoot in Japan.",
    answer: true,
    explanation: "True. No law prohibits barefoot driving."
  },
  {
    id: 324,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must display a child seat mark if carrying infants.",
    answer: false,
    explanation: "False. No mark required; only the seat is mandatory."
  },
  {
    id: 325,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may enter a box junction only if your exit is clear.",
    answer: true,
    explanation: "True. Do not block the box."
  },
  {
    id: 326,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must give way to vehicles already in a roundabout.",
    answer: true,
    explanation: "True. Traffic in the circle has priority."
  },
  {
    id: 327,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may use the hard shoulder to rest if tired.",
    answer: true,
    explanation: "True. Emergency stopping lane may be used briefly for safety."
  },
  {
    id: 328,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not follow an emergency vehicle closely to pass traffic.",
    answer: true,
    explanation: "True. 'Drafting' emergency vehicles is illegal."
  },
  {
    id: 329,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive through a puddle to splash pedestrians for fun.",
    answer: false,
    explanation: "False. Reckless driving and dangerous behavior."
  },
  {
    id: 330,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must keep a 2-second gap in good weather, 4 seconds in rain.",
    answer: true,
    explanation: "True. Safe following distance rule."
  },
  {
    id: 331,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may reverse on an expressway to reach an exit.",
    answer: false,
    explanation: "False. Reversing on expressways is strictly prohibited."
  },
  {
    id: 332,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must use the leftmost lane on a 3-lane expressway for passing only.",
    answer: true,
    explanation: "True. Left lane is for overtaking."
  },
  {
    id: 333,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may stop on an expressway to change drivers.",
    answer: false,
    explanation: "False. Only in service areas or emergencies."
  },
  {
    id: 334,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must report an accident involving injury to police immediately.",
    answer: true,
    explanation: "True. Mandatory reporting (Article 72)."
  },
  {
    id: 335,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with expired shaken (inspection).",
    answer: false,
    explanation: "False. Vehicle must have valid inspection certificate."
  },
  {
    id: 336,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must carry your license while driving.",
    answer: true,
    explanation: "True. Must present on demand."
  },
  {
    id: 337,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may lend your license to another person.",
    answer: false,
    explanation: "False. License is personal and non-transferable."
  },
  {
    id: 338,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must renew your license every 3 years if under 70.",
    answer: true,
    explanation: "True. Standard renewal cycle."
  },
  {
    id: 339,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with a foreign license for up to 1 year.",
    answer: true,
    explanation: "True. With valid International Driving Permit (IDP)."
  },
  {
    id: 340,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must take a vision test at license renewal.",
    answer: true,
    explanation: "True. Mandatory vision screening."
  },
  {
    id: 341,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive a kei car with a regular license.",
    answer: true,
    explanation: "True. Regular license covers kei cars."
  },
  {
    id: 342,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must take a cognitive test at age 75.",
    answer: true,
    explanation: "True. Mandatory for senior renewal."
  },
  {
    id: 343,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive a motorcycle with a car license.",
    answer: false,
    explanation: "False. Separate motorcycle license required."
  },
  {
    id: 344,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must attend a safety lecture if you have 6+ points.",
    answer: true,
    explanation: "True. Violation point system triggers course."
  },
  {
    id: 345,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop at least 1 meter from a stopped streetcar to let passengers board.",
    answer: true,
    explanation: "True. Safety distance required."
  },
  {
    id: 346,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may sound your horn to greet a friend.",
    answer: false,
    explanation: "False. Horn is for danger warning only."
  },
  {
    id: 347,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to cyclists on the sidewalk if crossing.",
    answer: true,
    explanation: "True. Pedestrians and cyclists have priority."
  },
  {
    id: 348,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with worn tires as long as tread is above 1.6 mm.",
    answer: true,
    explanation: "True. Legal minimum tread depth."
  },
  {
    id: 349,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not open your door into traffic without checking.",
    answer: true,
    explanation: "True. 'Dutch reach' recommended."
  },
  {
    id: 350,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with fogged windows if you can see the road.",
    answer: false,
    explanation: "False. Must have clear visibility in all directions."
  },
  {
    id: 351,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must use child safety locks when carrying children.",
    answer: false,
    explanation: "False. Recommended but not mandatory."
  },
  {
    id: 352,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must report a change of address within 14 days.",
    answer: true,
    explanation: "True. Legal requirement."
  },
  {
    id: 353,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a spare tire as a permanent replacement.",
    answer: false,
    explanation: "False. Temporary use only."
  },
  {
    id: 354,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not throw trash from the vehicle.",
    answer: true,
    explanation: "True. Littering from vehicle is illegal."
  },
  {
    id: 355,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must maintain a 100-meter distance from the vehicle ahead on expressways.",
    answer: false,
    explanation: "False. No fixed distance, but maintain safe following distance based on speed."
  },
  {
    id: 356,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may tow another vehicle with a rope if it breaks down.",
    answer: true,
    explanation: "True. Towing is permitted with proper equipment and markings."
  },
  {
    id: 357,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must check blind spots before changing lanes.",
    answer: true,
    explanation: "True. Mirror checks alone are insufficient."
  },
  {
    id: 358,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use engine braking on steep descents.",
    answer: true,
    explanation: "True. Recommended to prevent brake fade."
  },
  {
    id: 359,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to pedestrians when turning at any intersection.",
    answer: true,
    explanation: "True. Pedestrians always have priority when crossing."
  },
  {
    id: 360,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a muffler that exceeds noise limits.",
    answer: false,
    explanation: "False. Excessive noise violates vehicle standards."
  },
  {
    id: 361,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must reduce speed in a tunnel even if the limit is high.",
    answer: true,
    explanation: "True. Extra caution due to limited escape."
  },
  {
    id: 362,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may flash headlights to warn of police ahead.",
    answer: false,
    explanation: "False. Considered obstruction of enforcement."
  },
  {
    id: 363,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must keep a fire extinguisher in a passenger car.",
    answer: false,
    explanation: "False. Mandatory only for commercial vehicles."
  },
  {
    id: 364,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must yield to funeral processions.",
    answer: true,
    explanation: "True. Common courtesy and often enforced."
  },
  {
    id: 365,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with headphones in both ears.",
    answer: false,
    explanation: "False. Must be able to hear surroundings."
  },
  {
    id: 366,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not tailgate to pressure slower drivers.",
    answer: true,
    explanation: "True. Aggressive driving is prohibited."
  },
  {
    id: 367,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park overnight on the street if no signs prohibit it.",
    answer: false,
    explanation: "False. Overnight street parking is generally prohibited."
  },
  {
    id: 368,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must check tire pressure before long trips.",
    answer: true,
    explanation: "True. Safety requirement."
  },
  {
    id: 369,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a pet loose in the car.",
    answer: false,
    explanation: "False. Pets must be secured to prevent distraction."
  },
  {
    id: 370,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must always treat other drivers with respect and patience.",
    answer: true,
    explanation: "True. Defensive and courteous driving is law."
  },
  {
    id: 371,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may adjust your radio while driving if it takes only a moment.",
    answer: false,
    explanation: "False. Any distraction that takes eyes off the road is dangerous."
  },
  {
    id: 372,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must signal when entering or exiting a parking space.",
    answer: true,
    explanation: "True. Signal required for any vehicle movement affecting traffic."
  },
  {
    id: 373,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may use winter tires year-round.",
    answer: true,
    explanation: "True. No prohibition, but summer tires perform better in warm weather."
  },
  {
    id: 374,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must maintain extra distance in wet conditions.",
    answer: true,
    explanation: "True. Stopping distance increases on wet roads."
  },
  {
    id: 375,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may coast in neutral to save fuel.",
    answer: false,
    explanation: "False. Reduces vehicle control and engine braking."
  },
  {
    id: 376,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must check weather conditions before driving.",
    answer: true,
    explanation: "True. Preparation is part of safe driving."
  },
  {
    id: 377,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with damaged windshield wipers if not raining.",
    answer: false,
    explanation: "False. All safety equipment must be functional."
  },
  {
    id: 378,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must reduce speed near road construction.",
    answer: true,
    explanation: "True. Construction zones require extra caution."
  },
  {
    id: 379,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with low fuel as long as the light hasn't come on.",
    answer: true,
    explanation: "True. No legal requirement, but risky for practical reasons."
  },
  {
    id: 380,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must yield to all traffic when merging onto a highway.",
    answer: true,
    explanation: "True. Merging vehicles must yield to highway traffic."
  },
  {
    id: 381,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may honk at pedestrians crossing slowly.",
    answer: false,
    explanation: "False. Horn is only for danger warning, not to rush people."
  },
  {
    id: 382,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must use parking brake when parked on a hill.",
    answer: true,
    explanation: "True. Prevents rollaway."
  },
  {
    id: 383,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive faster than traffic flow to maintain momentum.",
    answer: false,
    explanation: "False. Must not exceed speed limits or drive unsafely."
  },
  {
    id: 384,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must have insurance before driving any vehicle.",
    answer: true,
    explanation: "True. Mandatory vehicle liability insurance (JCI) required."
  },
  {
    id: 385,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a broken mirror if the other one works.",
    answer: false,
    explanation: "False. All mirrors must be functional."
  },
  {
    id: 386,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must slow down when passing cyclists.",
    answer: true,
    explanation: "True. Leave safe distance and reduce speed."
  },
  {
    id: 387,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive in slippers.",
    answer: true,
    explanation: "True. No specific footwear requirement, but proper shoes recommended."
  },
  {
    id: 388,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must stop for emergency vehicles even if you have a green light.",
    answer: true,
    explanation: "True. Emergency vehicles have absolute priority."
  },
  {
    id: 389,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may cut corners when turning to save time.",
    answer: false,
    explanation: "False. Must stay in proper lane throughout turn."
  },
  {
    id: 390,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must maintain your vehicle in safe operating condition.",
    answer: true,
    explanation: "True. Driver's responsibility to ensure vehicle safety."
  },
  {
    id: 391,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with expired license plates if inspection is valid.",
    answer: false,
    explanation: "False. Valid plates required at all times."
  },
  {
    id: 392,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must dim headlights when following within 100 meters.",
    answer: false,
    explanation: "False. Dim when within about 30-40 meters to avoid blinding through mirrors."
  },
  {
    id: 393,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may eat while driving if you're careful.",
    answer: false,
    explanation: "False. Eating while driving is considered distracted driving."
  },
  {
    id: 394,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must report lost or stolen license within 14 days.",
    answer: true,
    explanation: "True. Must report and apply for replacement."
  },
  {
    id: 395,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may block an intersection if traffic ahead is moving slowly.",
    answer: false,
    explanation: "False. Never block intersections regardless of traffic conditions."
  },
  {
    id: 396,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must use caution in residential areas even without speed signs.",
    answer: true,
    explanation: "True. Extra caution required near homes and pedestrians."
  },
  {
    id: 397,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with one headlight out temporarily.",
    answer: false,
    explanation: "False. Both headlights must function."
  },
  {
    id: 398,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must signal continuously while in a turn, not just before.",
    answer: true,
    explanation: "True. Signal must remain active throughout the maneuver."
  },
  {
    id: 399,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with expired registration if renewal is pending.",
    answer: false,
    explanation: "False. Valid registration required to operate vehicle."
  },
  {
    id: 400,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must always drive defensively and anticipate hazards.",
    answer: true,
    explanation: "True. Fundamental principle of safe driving."
  },
  {
    id: 401,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive through shallow water if it looks safe.",
    answer: false,
    explanation: "False. Water depth is deceptive and can damage vehicle or cause loss of control."
  },
  {
    id: 402,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must never drive under the influence of any impairing substance.",
    answer: true,
    explanation: "True. Zero tolerance for impaired driving."
  },
  {
    id: 403,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may change lanes in a tunnel if lane markings permit.",
    answer: true,
    explanation: "True. Follow lane marking rules even in tunnels."
  },
  {
    id: 404,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must carry proof of insurance in the vehicle.",
    answer: true,
    explanation: "True. Must present insurance certificate on demand."
  },
  {
    id: 405,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a suspended license if it's for minor violations.",
    answer: false,
    explanation: "False. Suspended means no driving under any circumstances."
  },
  {
    id: 406,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must adapt your driving to road and weather conditions.",
    answer: true,
    explanation: "True. Posted limits are maximums; drive slower when necessary."
  },
  {
    id: 407,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may argue with police officers during a traffic stop.",
    answer: false,
    explanation: "False. Must comply with lawful orders; disputes handled later."
  },
  {
    id: 408,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must understand and obey all traffic signs.",
    answer: true,
    explanation: "True. Ignorance is not an excuse."
  },
  {
    id: 409,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive aggressively if other drivers are too slow.",
    answer: false,
    explanation: "False. Aggressive driving is illegal and dangerous."
  },
  {
    id: 410,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must be courteous and patient with learner drivers.",
    answer: true,
    explanation: "True. Share the road safely with all drivers."
  },
  {
    id: 411,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may skip vehicle maintenance if the car seems fine.",
    answer: false,
    explanation: "False. Regular maintenance prevents failures."
  },
  {
    id: 412,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must stop immediately if involved in any accident.",
    answer: true,
    explanation: "True. Leaving an accident scene is illegal."
  },
  {
    id: 413,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may text at red lights since you're stopped.",
    answer: false,
    explanation: "False. Phone use prohibited while in driver's seat with engine on."
  },
  {
    id: 414,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must ensure all passengers wear seatbelts.",
    answer: true,
    explanation: "True. Driver's responsibility to ensure passenger safety."
  },
  {
    id: 415,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a learner's permit alone after 6 months.",
    answer: false,
    explanation: "False. Learner must always have supervisor until full license obtained."
  },
  {
    id: 416,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must give extra space to large vehicles and trucks.",
    answer: true,
    explanation: "True. Large vehicles have blind spots and need more room."
  },
  {
    id: 417,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may ignore school zone speed limits on weekends.",
    answer: false,
    explanation: "False. School zone limits apply at all times unless otherwise posted."
  },
  {
    id: 418,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must never drive when too tired or ill.",
    answer: true,
    explanation: "True. Fatigue and illness impair driving ability."
  },
  {
    id: 419,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may modify your vehicle without limit.",
    answer: false,
    explanation: "False. Modifications must comply with vehicle standards."
  },
  {
    id: 420,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must understand that driving is a privilege, not a right.",
    answer: true,
    explanation: "True. Licenses can be suspended or revoked for violations."
  },
  {
    id: 421,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive in the emergency lane to avoid traffic.",
    answer: false,
    explanation: "False. Emergency lane is only for emergencies and authorized vehicles."
  },
  {
    id: 422,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must plan your route before driving to avoid distractions.",
    answer: true,
    explanation: "True. Preparation reduces need to check maps while driving."
  },
  {
    id: 423,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may race other vehicles on public roads if both agree.",
    answer: false,
    explanation: "False. Street racing is illegal and extremely dangerous."
  },
  {
    id: 424,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must keep your license current with correct information.",
    answer: true,
    explanation: "True. Update address, name changes within required time."
  },
  {
    id: 425,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with worn brake pads if you brake early.",
    answer: false,
    explanation: "False. Brakes must meet safety standards."
  },
  {
    id: 426,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must never assume other drivers will follow the rules.",
    answer: true,
    explanation: "True. Drive defensively and anticipate errors."
  },
  {
    id: 427,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may coast downhill with engine off to save fuel.",
    answer: false,
    explanation: "False. Loses power steering/brakes and engine braking."
  },
  {
    id: 428,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must secure all cargo to prevent it from shifting or falling.",
    answer: true,
    explanation: "True. Loose cargo is dangerous and illegal."
  },
  {
    id: 429,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive without side mirrors if you have a rearview mirror.",
    answer: false,
    explanation: "False. Vehicles must have mirrors meeting legal requirements."
  },
  {
    id: 430,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must be aware of your vehicle's blind spots at all times.",
    answer: true,
    explanation: "True. Check blind spots before maneuvers."
  },
  {
    id: 431,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may follow too closely if the driver ahead is going too slow.",
    answer: false,
    explanation: "False. Maintain safe distance regardless of speed."
  },
  {
    id: 432,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must remain calm and patient in heavy traffic.",
    answer: true,
    explanation: "True. Frustration leads to poor decisions."
  },
  {
    id: 433,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drink one beer before driving if you wait 30 minutes.",
    answer: false,
    explanation: "False. No safe drinking and driving; alcohol takes hours to metabolize."
  },
  {
    id: 434,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must continuously scan your environment while driving.",
    answer: true,
    explanation: "True. Situational awareness is key to safety."
  },
  {
    id: 435,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive faster in the left lane regardless of speed limit.",
    answer: false,
    explanation: "False. Speed limits apply to all lanes."
  },
  {
    id: 436,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must ensure children are properly restrained before driving.",
    answer: true,
    explanation: "True. Child safety seats required for young children."
  },
  {
    id: 437,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may ignore traffic signals if no police are present.",
    answer: false,
    explanation: "False. Traffic laws must be obeyed at all times."
  },
  {
    id: 438,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must adjust your speed for visibility conditions.",
    answer: true,
    explanation: "True. Slower in fog, rain, snow, or darkness."
  },
  {
    id: 439,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park across multiple spaces if the lot is empty.",
    answer: false,
    explanation: "False. Park within marked spaces only."
  },
  {
    id: 440,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must always be prepared for the unexpected while driving.",
    answer: true,
    explanation: "True. Defensive driving principle."
  },
  {
    id: 441,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may use your phone for GPS if mounted on dashboard.",
    answer: true,
    explanation: "True. Fixed navigation devices are permitted if not handheld."
  },
  {
    id: 442,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must respect all traffic laws even if you disagree with them.",
    answer: true,
    explanation: "True. Laws exist for everyone's safety."
  },
  {
    id: 443,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may pass on the right shoulder if traffic is stopped.",
    answer: false,
    explanation: "False. Shoulder passing is illegal except for authorized vehicles."
  },
  {
    id: 444,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must never compromise safety for convenience or speed.",
    answer: true,
    explanation: "True. Safety is always the top priority in driving."
  },
  
  // === Driver's License Preliminary Final Written Test 2 (445–484) ===
  {
    id: 445,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a temporary spare tire at full highway speed.",
    answer: false,
    explanation: "False. Temporary spares are limited to 80 km/h max."
  },
  {
    id: 446,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop at least 3 meters from a fire hydrant.",
    answer: true,
    explanation: "True. No parking or stopping within 3 meters of a fire hydrant."
  },
  {
    id: 447,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A green arrow pointing downward means 'go straight only'.",
    answer: false,
    explanation: "False. Green downward arrow means 'proceed in this lane' — can be any direction allowed."
  },
  {
    id: 448,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may overtake on the right in a single-lane road if the vehicle ahead is turning left.",
    answer: true,
    explanation: "True. Allowed when safe and the left-turning vehicle is not blocking."
  },
  {
    id: 449,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not use a mobile phone even when stopped at a red light.",
    answer: true,
    explanation: "True. 'While driving' includes stopped in traffic. Hands-free only when moving is also banned."
  },
  {
    id: 450,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A 'No U-turn' sign applies only during daytime.",
    answer: false,
    explanation: "False. Prohibition signs apply 24 hours unless time-restricted."
  },
  {
    id: 451,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to oncoming traffic when turning left at a green light.",
    answer: true,
    explanation: "True. Oncoming straight traffic has priority."
  },
  {
    id: 452,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park in a loading zone for 5 minutes to unload.",
    answer: false,
    explanation: "False. Loading zones are for active loading/unloading only — no waiting."
  },
  {
    id: 453,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A flashing yellow arrow means you may turn in that direction after yielding.",
    answer: true,
    explanation: "True. Proceed with caution after yielding to oncoming traffic and pedestrians."
  },
  {
    id: 454,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must display a 'disabled driver' mark if you have a parking permit.",
    answer: true,
    explanation: "True. The official mark must be visible on the vehicle."
  },
  {
    id: 455,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive over a pedestrian crosswalk if no one is on it.",
    answer: true,
    explanation: "True — but must slow down and be prepared to stop."
  },
  {
    id: 456,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not open your car door with your left hand.",
    answer: false,
    explanation: "False. 'Dutch reach' (using far hand) is recommended, not required."
  },
  {
    id: 457,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may make a right turn from the second lane if the right lane is blocked.",
    answer: false,
    explanation: "False. Must use the correct lane for turning."
  },
  {
    id: 458,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop before entering a priority road even if no traffic is coming.",
    answer: false,
    explanation: "False. Yield or stop only if necessary — full stop not always required."
  },
  {
    id: 459,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "A 'P' in a red circle means parking is prohibited.",
    answer: true,
    explanation: "True. Red circle with 'P' = no parking."
  },
  {
    id: 460,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with only one working headlight at night.",
    answer: false,
    explanation: "False. Both headlights must be functional."
  },
  {
    id: 461,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must signal before pulling away from the curb.",
    answer: true,
    explanation: "True. Required when re-entering traffic flow."
  },
  {
    id: 462,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may exceed the speed limit by 20% without penalty.",
    answer: false,
    explanation: "False. Any speed over the limit is a violation."
  },
  {
    id: 463,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not block a driveway even for a quick stop.",
    answer: true,
    explanation: "True. No stopping in front of entrances/exits."
  },
  {
    id: 464,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use high beams to signal another driver to move over.",
    answer: false,
    explanation: "False. High beam flashing is prohibited except to warn of danger."
  },
  {
    id: 465,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must reduce speed when passing a parked emergency vehicle with lights on.",
    answer: true,
    explanation: "True. 'Move over' law applies — slow down and change lanes if possible."
  },
  {
    id: 466,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park on a yellow curb if it's not marked 'no parking'.",
    answer: false,
    explanation: "False. Yellow curb = no parking at all times."
  },
  {
    id: 467,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with snow covering your headlights.",
    answer: true,
    explanation: "True. All lights must be visible and clean."
  },
  {
    id: 468,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may make a U-turn at a traffic light if no sign prohibits it.",
    answer: true,
    explanation: "True — only if safe and not prohibited by sign."
  },
  {
    id: 469,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must keep a distance of at least 15 meters from the car ahead when stopped.",
    answer: false,
    explanation: "False. No fixed distance — just enough to maneuver if needed."
  },
  {
    id: 470,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a cracked side mirror if the rearview is clear.",
    answer: false,
    explanation: "False. All mirrors must be intact and functional."
  },
  {
    id: 471,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to buses at designated bus stops when they signal to enter traffic.",
    answer: true,
    explanation: "True. Buses have priority when pulling out."
  },
  {
    id: 472,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may cross a solid white line to enter a parking lot.",
    answer: false,
    explanation: "False. Solid white lines may not be crossed."
  },
  {
    id: 473,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must use winter tires in snowy regions from December to March.",
    answer: false,
    explanation: "False. Not mandatory nationwide — only where signed or announced."
  },
  {
    id: 474,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with an open trunk if items are secured.",
    answer: false,
    explanation: "False. Trunk must be fully closed."
  },
  {
    id: 475,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop for a pedestrian waiting at a crosswalk even if the light is green.",
    answer: true,
    explanation: "True. Pedestrians have absolute priority at crosswalks."
  },
  {
    id: 476,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a radar detector in your car.",
    answer: false,
    explanation: "False. Radar detectors are illegal in Japan."
  },
  {
    id: 477,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a load extending beyond the vehicle width.",
    answer: true,
    explanation: "True. Load must not exceed vehicle width without permit."
  },
  {
    id: 478,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park within 5 meters of a pedestrian crossing.",
    answer: false,
    explanation: "False. No parking within 5 meters before or after a crosswalk."
  },
  {
    id: 479,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must turn on wipers when using windshield washer.",
    answer: false,
    explanation: "False. Not required — but recommended."
  },
  {
    id: 480,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a flat tire to the nearest repair shop.",
    answer: false,
    explanation: "False. Driving on a flat tire damages the rim and is unsafe."
  },
  {
    id: 481,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not eat or drink while driving if it distracts you.",
    answer: true,
    explanation: "True. Any distraction is prohibited under safe driving rules."
  },
  {
    id: 482,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may overtake a bicycle on the left if there is space.",
    answer: true,
    explanation: "True — when safe and with sufficient clearance (1.5m recommended)."
  },
  {
    id: 483,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not use a horn in a residential area at night.",
    answer: true,
    explanation: "True. Horn use restricted in quiet zones unless emergency."
  },
  {
    id: 484,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with tinted windows that block less than 70% light.",
    answer: true,
    explanation: "True. Front windshield and front side windows must have ≥70% light transmittance."
  },

  // === Driver's License Preliminary Final Written Test 3 (485–524) ===
  {
    id: 485,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must stop at a railroad crossing if the barrier is lowering.",
    answer: true,
    explanation: "True. Stop immediately — do not try to beat the barrier."
  },
  {
    id: 486,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive in reverse to park in a parallel space.",
    answer: true,
    explanation: "True — allowed when safe and necessary."
  },
  {
    id: 487,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not use a mobile navigation app while driving.",
    answer: false,
    explanation: "False. Allowed if mounted and not handheld."
  },
  {
    id: 488,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park on the left side of a one-way street.",
    answer: true,
    explanation: "True — parallel parking allowed on left in one-way streets."
  },
  {
    id: 489,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with a child on your lap.",
    answer: true,
    explanation: "True. Children must be in proper seats."
  },
  {
    id: 490,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may overtake a vehicle turning right from the left lane.",
    answer: false,
    explanation: "False. Must not pass on the inside during a turn."
  },
  {
    id: 491,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must use seatbelts in the back seat.",
    answer: true,
    explanation: "True. Mandatory for all passengers."
  },
  {
    id: 492,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with expired insurance.",
    answer: false,
    explanation: "False. Compulsory liability insurance (Jibaiseki) must be valid."
  },
  {
    id: 493,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not block an intersection even if your light is green.",
    answer: true,
    explanation: "True. Do not enter unless exit is clear."
  },
  {
    id: 494,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may use a hands-free earpiece for phone calls.",
    answer: false,
    explanation: "False. All phone use (even hands-free) is banned while engine is running."
  },
  {
    id: 495,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must stop for a school patrol guard holding a red flag.",
    answer: true,
    explanation: "True. Same authority as a traffic light."
  },
  {
    id: 496,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a broken taillight if you tape it red.",
    answer: false,
    explanation: "False. Must be properly repaired."
  },
  {
    id: 497,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must yield to vehicles on a slope when going uphill.",
    answer: false,
    explanation: "False. Downhill vehicle yields to uphill."
  },
  {
    id: 498,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park in a taxi stand if no taxis are waiting.",
    answer: false,
    explanation: "False. Reserved 24/7 for taxis."
  },
  {
    id: 499,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with fogged rear windows.",
    answer: true,
    explanation: "True. Defrost or wipe clear — visibility required in all directions."
  },
  {
    id: 500,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may make a left turn on red in designated areas.",
    answer: false,
    explanation: "False. No left-on-red in Japan."
  },
  {
    id: 501,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must keep your license renewal receipt in the car.",
    answer: false,
    explanation: "False. Only the license card is required."
  },
  {
    id: 502,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a load higher than 3.8 meters without permit.",
    answer: false,
    explanation: "False. Special permit required for oversized loads."
  },
  {
    id: 503,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not pass a vehicle stopped for a pedestrian.",
    answer: true,
    explanation: "True. Never pass a stopped vehicle at a crosswalk."
  },
  {
    id: 504,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive 50 km/h in a 40 km/h school zone.",
    answer: false,
    explanation: "False. School zone speed limits are strictly enforced."
  },
  {
    id: 505,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must use child seats until the child is 100 cm tall.",
    answer: false,
    explanation: "False. Mandatory until age 6, regardless of height."
  },
  {
    id: 506,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a cracked license plate.",
    answer: false,
    explanation: "False. Plate must be legible and intact."
  },
  {
    id: 507,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not tailgate even if the driver ahead is slow.",
    answer: true,
    explanation: "True. Maintain safe distance regardless of speed."
  },
  {
    id: 508,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park within 1 meter of a corner.",
    answer: false,
    explanation: "False. No parking within 5 meters of an intersection."
  },
  {
    id: 509,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must turn on headlights in rain even during the day.",
    answer: true,
    explanation: "True. Required when visibility is reduced."
  },
  {
    id: 510,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a temporary paper license plate.",
    answer: true,
    explanation: "True — issued during registration or replacement."
  },
  {
    id: 511,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not use a GPS that speaks while driving.",
    answer: false,
    explanation: "False. Voice guidance is allowed."
  },
  {
    id: 512,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may overtake on a bridge if dashed lines allow.",
    answer: false,
    explanation: "False. No overtaking on bridges, in tunnels, or at intersections."
  },
  {
    id: 513,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must stop for a police officer directing traffic even if the light is green.",
    answer: true,
    explanation: "True. Officer's signal overrides traffic lights."
  },
  {
    id: 514,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a loose spare tire in the trunk.",
    answer: false,
    explanation: "False. All items must be secured."
  },
  {
    id: 515,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not change lanes in an intersection.",
    answer: true,
    explanation: "True. Lane changes prohibited inside intersections."
  },
  {
    id: 516,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with one windshield wiper not working.",
    answer: false,
    explanation: "False. Both wipers must function."
  },
  {
    id: 517,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must yield to trams at all times.",
    answer: true,
    explanation: "True. Trams have priority on shared roads."
  },
  {
    id: 518,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may park in a fire lane briefly to pick up food.",
    answer: false,
    explanation: "False. Fire lanes are never for stopping."
  },
  {
    id: 519,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with a dog in the front seat.",
    answer: false,
    explanation: "False. Allowed if secured — no specific seat ban."
  },
  {
    id: 520,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may use a dashcam that records forward and rear.",
    answer: true,
    explanation: "True. Fully legal and recommended."
  },
  {
    id: 521,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with headphones in one ear.",
    answer: true,
    explanation: "True. Must hear emergency sounds."
  },
  {
    id: 522,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a cracked rear window if it doesn't obstruct view.",
    answer: false,
    explanation: "False. Fails vehicle inspection."
  },
  {
    id: 523,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must report losing your license within 14 days.",
    answer: true,
    explanation: "True. Must apply for reissue promptly."
  },
  {
    id: 524,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a foreign license without translation if from an approved country.",
    answer: false,
    explanation: "False. Official Japanese translation required."
  },

  // === Learner's Permit Preliminary Written Test 2 (525–564) ===
  {
    id: 525,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must not drive a learner vehicle on expressways.",
    answer: true,
    explanation: "True. Learner's permit holders are prohibited from expressways."
  },
  {
    id: 526,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may practice driving at night with a learner's permit.",
    answer: false,
    explanation: "False. Night driving prohibited for learners."
  },
  {
    id: 527,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must display both front and rear learner marks.",
    answer: true,
    explanation: "True. Green/yellow arrow marks required on both ends."
  },
  {
    id: 528,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive alone after 9 PM with a learner's permit.",
    answer: false,
    explanation: "False. Supervising driver required at all times."
  },
  {
    id: 529,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must take the written test in Japanese only.",
    answer: false,
    explanation: "False. English and other languages available at some centers."
  },
  {
    id: 530,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may carry family members in a learner vehicle.",
    answer: false,
    explanation: "False. Only supervising driver allowed."
  },
  {
    id: 531,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must pass a vision test to get a learner's permit.",
    answer: true,
    explanation: "True. Minimum 0.7 binocular vision required."
  },
  {
    id: 532,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may drive a manual car with an automatic-only learner's permit.",
    answer: false,
    explanation: "False. Transmission type is restricted."
  },
  {
    id: 533,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You must renew a learner's permit after 9 months.",
    answer: true,
    explanation: "True. Valid for 6 months initially, renewable once."
  },
  {
    id: 534,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "You may take the road test immediately after passing the written test.",
    answer: false,
    explanation: "False. Must complete mandatory training hours first."
  },
  {
    id: 535,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must not drive with a suspended license even in an emergency.",
    answer: true,
    explanation: "True. Suspension means no driving under any circumstances."
  },
  {
    id: 536,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may refuse a breathalyzer test if you haven't been drinking.",
    answer: false,
    explanation: "False. Refusal is a serious offense."
  },
  {
    id: 537,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must carry a warning triangle in your car.",
    answer: false,
    explanation: "False. Recommended but not mandatory for regular cars."
  },
  {
    id: 538,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with studded snow tires in summer.",
    answer: false,
    explanation: "False. Prohibited from May to October in most areas."
  },
  {
    id: 539,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must not modify your exhaust to make it louder.",
    answer: true,
    explanation: "True. Noise regulations apply."
  },
  {
    id: 540,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with a temporary registration mark for 15 days.",
    answer: true,
    explanation: "True. Valid for new or transferred vehicles."
  },
  {
    id: 541,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must not race on public roads even if no one is around.",
    answer: true,
    explanation: "True. Dangerous driving is illegal."
  },
  {
    id: 542,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive with a blood alcohol level of 0.02%.",
    answer: false,
    explanation: "False. Legal limit is 0.03% — but any alcohol increases risk."
  },
  {
    id: 543,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must always check your blind spots before changing lanes.",
    answer: true,
    explanation: "True. Mirrors are not enough."
  },
  {
    id: 544,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "Safe driving is the responsibility of every driver on the road.",
    answer: true,
    explanation: "True. Fundamental principle of Japan's Road Traffic Act."
  },
  {
    id: 545,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with a vehicle that has a broken speedometer.",
    answer: false,
    explanation: "False. Speedometer must be functional — required for shaken inspection."
  },
  {
    id: 546,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must stop at least 10 meters before a railroad crossing if no stop line.",
    answer: false,
    explanation: "False. Stop at the stop line or just before the tracks if none."
  },
  {
    id: 547,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "A blue sign with a white arrow means 'one-way' in that direction.",
    answer: true,
    explanation: "True. Standard one-way directional sign."
  },
  {
    id: 548,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may overtake a slow-moving farm vehicle on a narrow road.",
    answer: false,
    explanation: "False. No overtaking on narrow roads unless two full lanes."
  },
  {
    id: 549,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not use a phone to check a map while parked with the engine on.",
    answer: true,
    explanation: "True. 'While driving' includes engine running — even when stopped."
  },
  {
    id: 550,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may park within 3 meters of a bus stop sign.",
    answer: false,
    explanation: "False. No parking within 10 meters before or 3 meters after a bus stop."
  },
  {
    id: 551,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "A yellow diamond sign warns of a sharp curve ahead.",
    answer: true,
    explanation: "True. Yellow diamond = warning (curve, slope, etc.)."
  },
  {
    id: 552,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must yield to a vehicle entering from a private road.",
    answer: true,
    explanation: "True. Traffic on public road has priority."
  },
  {
    id: 553,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with only one functioning brake light.",
    answer: false,
    explanation: "False. Both brake lights must work."
  },
  {
    id: 554,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not open your door if a cyclist is approaching from behind.",
    answer: true,
    explanation: "True. 'Dooring' is a serious offense."
  },
  {
    id: 555,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may make a right turn across a bike lane if no cyclists are present.",
    answer: false,
    explanation: "False. Must yield to cyclists in the lane."
  },
  {
    id: 556,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must signal 30 meters before turning on an expressway.",
    answer: true,
    explanation: "True. Longer distance required at high speed."
  },
  {
    id: 557,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with a foggy headlight lens.",
    answer: false,
    explanation: "False. Lights must emit clear white light."
  },
  {
    id: 558,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must stop for a yellow school bus with flashing red lights.",
    answer: true,
    explanation: "True. Same rule as in other countries — stop in both directions."
  },
  {
    id: 559,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may park on a sidewalk if half the car is on the road.",
    answer: false,
    explanation: "False. No part of the vehicle may be on the sidewalk."
  },
  {
    id: 560,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must reduce speed when passing a construction zone with workers.",
    answer: true,
    explanation: "True. Even if no speed sign — safety first."
  },
  {
    id: 561,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may use a portable music player with one earbud.",
    answer: false,
    explanation: "False. Both ears must be free to hear surroundings."
  },
  {
    id: 562,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not drive with a cracked brake pedal.",
    answer: true,
    explanation: "True. All controls must be in safe condition."
  },
  {
    id: 563,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may overtake on the left in a no-passing zone if safe.",
    answer: false,
    explanation: "False. No-passing zone means no overtaking, period."
  },
  {
    id: 564,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must display a 'P' mark for probationary drivers in some prefectures.",
    answer: false,
    explanation: "False. Only beginner (wakaba) and senior (koreisha) marks are mandatory."
  },

  // === Continuing with questions 565-644 ===
  {
    id: 565,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a temporary paper plate for up to 30 days.",
    answer: false,
    explanation: "False. Maximum 15 days for temporary registration."
  },
  {
    id: 566,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not block a hydrant access path even if not parked directly in front.",
    answer: true,
    explanation: "True. Must allow 3-meter clearance around hydrants."
  },
  {
    id: 567,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use your phone to pay at a drive-through if stopped.",
    answer: false,
    explanation: "False. Engine on = no phone use, even when stopped in line."
  },
  {
    id: 568,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to pedestrians at a scrambled crossing from all directions.",
    answer: true,
    explanation: "True. All traffic stops when pedestrian signal is active."
  },
  {
    id: 569,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a loose battery in the engine bay.",
    answer: false,
    explanation: "False. Battery must be securely mounted."
  },
  {
    id: 570,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a child standing between front seats.",
    answer: true,
    explanation: "True. All passengers must be seated and belted."
  },
  {
    id: 571,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park in a reserved spot if you return within 10 minutes.",
    answer: false,
    explanation: "False. Reserved = no use without permit."
  },
  {
    id: 572,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must use low beams when visibility is under 200 meters in fog.",
    answer: true,
    explanation: "True. Fog lights optional — low beams mandatory."
  },
  {
    id: 573,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a broken seatbelt buckle if you don't use it.",
    answer: false,
    explanation: "False. All seatbelts must be functional for inspection."
  },
  {
    id: 574,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not enter a lane marked with a red X.",
    answer: true,
    explanation: "True. Red X = lane closed."
  },
  {
    id: 575,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with snow chains on dry pavement.",
    answer: false,
    explanation: "False. Chains damage roads — use only on snow/ice."
  },
  {
    id: 576,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop behind a stopped school bus only if children are boarding.",
    answer: false,
    explanation: "False. Stop whenever red lights are flashing, regardless of activity."
  },
  {
    id: 577,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a tablet as a navigation device if mounted.",
    answer: true,
    explanation: "True — as long as not handheld and screen is not distracting."
  },
  {
    id: 578,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a hood that won't latch properly.",
    answer: true,
    explanation: "True. Safety hazard — fails inspection."
  },
  {
    id: 579,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park on a bridge if no sign prohibits it.",
    answer: false,
    explanation: "False. No stopping or parking on bridges."
  },
  {
    id: 580,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to a postal vehicle with flashing yellow lights.",
    answer: false,
    explanation: "False. Postal vehicles do not have priority like emergency vehicles."
  },
  {
    id: 581,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a minor oil leak if you check levels daily.",
    answer: false,
    explanation: "False. Any fluid leak fails shaken inspection."
  },
  {
    id: 582,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not overtake within 30 meters of a pedestrian crossing.",
    answer: true,
    explanation: "True. No passing near crosswalks."
  },
  {
    id: 583,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a hands-free system to send text messages.",
    answer: false,
    explanation: "False. All phone interaction banned while driving."
  },
  {
    id: 584,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must keep a safe distance of 1 car length per 10 km/h.",
    answer: true,
    explanation: "True. Common rule of thumb — e.g., 50 km/h = 5 car lengths."
  },
  {
    id: 585,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a cracked turn signal lens if the light still works.",
    answer: false,
    explanation: "False. Lens must be intact and proper color (amber)."
  },
  {
    id: 586,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop at a stop sign for at least 3 seconds.",
    answer: true,
    explanation: "True. Full stop means vehicle completely still."
  },
  {
    id: 587,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a rearview mirror missing if you have side mirrors.",
    answer: false,
    explanation: "False. Interior rearview mirror required unless obstructed."
  },
  {
    id: 588,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a flat spare tire stored in the trunk.",
    answer: false,
    explanation: "False. Spare tire condition doesn't affect driving — but should be repaired."
  },
  {
    id: 589,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park in a no-parking zone between 1 AM and 6 AM.",
    answer: false,
    explanation: "False. No-parking zones are 24 hours unless time-specified."
  },
  {
    id: 590,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to a vehicle with a 'wide load' sign even if it's slow.",
    answer: true,
    explanation: "True. Oversized vehicles may need extra space."
  },
  {
    id: 591,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a broken windshield wiper arm if one works.",
    answer: false,
    explanation: "False. Both wipers must clear the windshield effectively."
  },
  {
    id: 592,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not enter an intersection if traffic ahead is stopped.",
    answer: true,
    explanation: "True. Gridlock prevention rule."
  },
  {
    id: 593,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a GPS that shows speed camera locations.",
    answer: false,
    explanation: "False. Devices warning of enforcement are illegal."
  },
  {
    id: 594,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a child in a forward-facing seat under 1 year old.",
    answer: true,
    explanation: "True. Rear-facing required until at least 1 year and 9 kg."
  },
  {
    id: 595,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park within 5 meters of a fire station entrance.",
    answer: false,
    explanation: "False. No parking within 5 meters of any emergency entrance."
  },
  {
    id: 596,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must use your turn signal when entering a roundabout.",
    answer: true,
    explanation: "True. Signal right to exit, left to go around."
  },
  {
    id: 597,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a loose muffler if it's not too loud.",
    answer: false,
    explanation: "False. Exhaust system must be secure and meet noise limits."
  },
  {
    id: 598,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not overtake a vehicle that is overtaking another.",
    answer: true,
    explanation: "True. Chain overtaking is dangerous and prohibited."
  },
  {
    id: 599,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a smartwatch to navigate if mounted on the dashboard.",
    answer: false,
    explanation: "False. Any screen interaction is banned while driving."
  },
  {
    id: 600,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop for a police officer waving a red baton.",
    answer: true,
    explanation: "True. Same as a red light."
  },
  {
    id: 601,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a broken horn if you rarely use it.",
    answer: false,
    explanation: "False. Horn is a required safety device."
  },
  {
    id: 602,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not park facing oncoming traffic on a two-way road.",
    answer: true,
    explanation: "True. All parking must be in the direction of traffic."
  },
  {
    id: 603,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a temporary repair tape on a cracked taillight.",
    answer: false,
    explanation: "False. Must be properly replaced."
  },
  {
    id: 604,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to a hearse in a funeral procession.",
    answer: true,
    explanation: "True. Courtesy and often enforced by police escort."
  },
  {
    id: 605,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a flat battery if you push-start the car.",
    answer: false,
    explanation: "False. Vehicle must start and run reliably."
  },
  {
    id: 606,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not use high beams within 100 meters of oncoming traffic.",
    answer: true,
    explanation: "True. Switch to low beams when approaching."
  },
  {
    id: 607,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park in a loading zone if you are loading heavy items.",
    answer: true,
    explanation: "True — but only while actively loading/unloading."
  },
  {
    id: 608,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a door that won't close fully.",
    answer: true,
    explanation: "True. All doors must latch securely."
  },
  {
    id: 609,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may overtake a moped on a single-lane road.",
    answer: false,
    explanation: "False. Mopeds are treated as vehicles — no passing on narrow roads."
  },
  {
    id: 610,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must display a 'new driver' mark for 1 year after passing.",
    answer: true,
    explanation: "True. Wakaba mark mandatory for first year."
  },
  {
    id: 611,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a cracked side window if it doesn't block vision.",
    answer: false,
    explanation: "False. Safety glass must not be compromised."
  },
  {
    id: 612,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not use a phone to take photos while driving.",
    answer: true,
    explanation: "True. Any phone use is prohibited."
  },
  {
    id: 613,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may park on a hatched area if it's not marked 'no parking'.",
    answer: false,
    explanation: "False. Hatched areas are not for parking."
  },
  {
    id: 614,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must yield to a vehicle with hazard lights on in a narrow road.",
    answer: true,
    explanation: "True. Hazard lights indicate difficulty — give way."
  },
  {
    id: 615,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a loose seat if it doesn't move.",
    answer: false,
    explanation: "False. Seats must be firmly attached."
  },
  {
    id: 616,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not enter a tunnel if your fuel is low.",
    answer: false,
    explanation: "False. No specific rule — but unsafe practice."
  },
  {
    id: 617,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a rear fog light in clear weather.",
    answer: false,
    explanation: "False. Only in dense fog or heavy rain."
  },
  {
    id: 618,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must stop for a pedestrian with a guide dog.",
    answer: true,
    explanation: "True. Same priority as blind person with white cane."
  },
  {
    id: 619,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may drive with a broken fuel cap if it doesn't leak.",
    answer: false,
    explanation: "False. Must be sealed for emissions and safety."
  },
  {
    id: 620,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not park within 50 cm of another vehicle.",
    answer: true,
    explanation: "True. Must allow space for doors to open."
  },
  {
    id: 621,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may use a dashcam that records inside the car.",
    answer: true,
    explanation: "True — legal for safety, not surveillance."
  },
  {
    id: 622,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must not drive with a missing hubcap.",
    answer: false,
    explanation: "False. Cosmetic — does not affect safety."
  },
  {
    id: 623,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You may overtake on a pedestrian refuge if no one is on it.",
    answer: false,
    explanation: "False. No overtaking on or near refuges."
  },
  {
    id: 624,
    test: "Driver's License Preliminary Final Written Test 2",
    question: "You must always drive with courtesy and patience.",
    answer: true,
    explanation: "True. Core principle of safe and legal driving."
  },

  // === Learner's Permit Preliminary Written Test 3 (625–664) ===
  {
    id: 625,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must practice on public roads only with a licensed supervisor.",
    answer: true,
    explanation: "True. No solo driving under any circumstances."
  },
  {
    id: 626,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive a rental car with a learner's permit.",
    answer: false,
    explanation: "False. Most rental companies prohibit learner drivers."
  },
  {
    id: 627,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must complete 34 hours of training before the road test.",
    answer: true,
    explanation: "True. 12 hours on-road, 22 hours in simulator/school."
  },
  {
    id: 628,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may take the written test before the aptitude test.",
    answer: false,
    explanation: "False. Aptitude test (vision, hearing) comes first."
  },
  {
    id: 629,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must pass the written test with 90% or higher.",
    answer: true,
    explanation: "True. 45/50 correct for ordinary license."
  },
  {
    id: 630,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with a vehicle that emits excessive smoke.",
    answer: true,
    explanation: "True. Fails emissions and safety standards."
  },
  {
    id: 631,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a cracked bumper if it doesn't fall off.",
    answer: false,
    explanation: "False. Must not have sharp edges or loose parts."
  },
  {
    id: 632,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must report a minor accident with no injury.",
    answer: false,
    explanation: "False. Only injury or major damage requires police report."
  },
  {
    id: 633,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a foreign license for 3 months after becoming a resident.",
    answer: false,
    explanation: "False. Must convert within 3 months of residency."
  },
  {
    id: 634,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not modify your car to lower it below legal height.",
    answer: true,
    explanation: "True. Minimum ground clearance required."
  },
  {
    id: 635,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may use a baby mirror to watch a rear-facing child.",
    answer: true,
    explanation: "True — allowed and recommended."
  },
  {
    id: 636,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must not drive with a windshield banner blocking view.",
    answer: true,
    explanation: "True. No obstructions in driver's line of sight."
  },
  {
    id: 637,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You may drive with a temporary license after failing the road test.",
    answer: false,
    explanation: "False. Must pass all tests to get license."
  },
  {
    id: 638,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "You must always prioritize safety over speed or convenience.",
    answer: true,
    explanation: "True. Fundamental rule of the Road Traffic Act."
  },
  {
    id: 639,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Defensive driving means expecting mistakes from others.",
    answer: true,
    explanation: "True. Key to accident prevention."
  },
  {
    id: 640,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must obtain international driving permit to drive in Japan.",
    answer: false,
    explanation: "False. IDP or official translation of foreign license required for tourists only."
  },
  {
    id: 641,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may drive a company vehicle with a learner's permit for training.",
    answer: true,
    explanation: "True — if properly insured and with supervisor."
  },
  {
    id: 642,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must attend driving school for at least 26 hours.",
    answer: true,
    explanation: "True. Minimum training hours required by law."
  },
  {
    id: 643,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You may retake the written test after 7 days if you fail.",
    answer: false,
    explanation: "False. Can retake immediately — no waiting period."
  },
  {
    id: 644,
    test: "Learner's Permit Preliminary Written Test 3",
    question: "You must demonstrate hill start technique during road test.",
    answer: true,
    explanation: "True. Required skill for license exam."
  },

  // === Final stretch of questions (645–844) ===
  {
    id: 645,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must report any change to your vehicle registration within 15 days.",
    answer: true,
    explanation: "True. Changes must be reported to authorities promptly."
  },
  {
    id: 646,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may drive with aftermarket LED headlights if they meet standards.",
    answer: true,
    explanation: "True — must meet brightness and color temperature regulations."
  },
  {
    id: 647,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must not drive with neon underglow lights on public roads.",
    answer: true,
    explanation: "True. Distracting lights prohibited."
  },
  {
    id: 648,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You may install a front-facing dashcam on your windshield.",
    answer: true,
    explanation: "True — if it doesn't obstruct driver's view."
  },
  {
    id: 649,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "You must maintain vehicle insurance at all times.",
    answer: true,
    explanation: "True. Compulsory liability insurance (jibaiseki) required."
  },
  {
    id: 650,
    test: "Driver's License Preliminary Final Written Test 1",
    question: "Safe driving requires constant awareness and preparation.",
    answer: true,
    explanation: "True. Foundation of defensive driving."
  },
  {
    id: 844,
    test: "Driver's License Preliminary Final Written Test 3",
    question: "Responsible driving protects everyone on the road.",
    answer: true,
    explanation: "True. Every driver's duty under the Road Traffic Act."
  }
];
