export interface Question {
  id: number;
  test: string;
  question: string;
  answer: boolean;
  explanation: string;
  figure?: string;
}

export const questions: Question[] = [
  {
    id: 1,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "When approaching a pedestrian crossing, I slow down so that I can stop in front of it. Because it is not clear that there are pedestrians or not crossing there.",
    answer: true,
    explanation: "True. Under Road Traffic Act Article 38, drivers must slow down at pedestrian crossings even if no one is visible. Visibility may be obstructed. Reduce speed to 10–20 km/h and be ready to stop.",
    figure: undefined
  },
  {
    id: 2,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "The reaction distance refers to the distance from when the brake begins to work to when the vehicle stops.",
    answer: false,
    explanation: "False. This is the braking distance. Reaction distance is from perception to brake application (0.5–2 sec). Total stopping distance = reaction + braking distance.",
    figure: undefined
  },
  {
    id: 3,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "When turning right or left at an intersection, I must turn on my direction indicator light at a point 30 meters before the intersection.",
    answer: true,
    explanation: "True. Road Traffic Act Article 53 requires signaling at least 30 meters before the turn point at intersections to alert other road users.",
    figure: undefined
  },
  {
    id: 4,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "The road sign shown indicates 'No entry for vehicles'.",
    answer: true,
    explanation: "True. This is regulatory sign 208: 'No entry for all vehicles including motorcycles and mopeds'. Violation results in penalties under Article 8.",
    figure: "/src/assets/sign-no-entry.png"
  },
  {
    id: 5,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "When driving on a road with a center line, I must keep to the left side of the center line.",
    answer: true,
    explanation: "True. Road Traffic Act Article 18 requires vehicles to drive on the left side of the road and stay to the left of the center line at all times, except when overtaking.",
    figure: undefined
  },
  {
    id: 6,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "At an intersection with traffic lights, if the light is yellow, I can proceed through the intersection at normal speed.",
    answer: false,
    explanation: "False. A yellow light means stop if you can do so safely. Proceeding at normal speed through a yellow light violates Article 7 and increases accident risk.",
    figure: undefined
  },
  {
    id: 7,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "The sign shown indicates a pedestrian crossing ahead.",
    answer: true,
    explanation: "True. This warning sign (sign 303) alerts drivers to a pedestrian crossing ahead. Slow down and be prepared to yield to pedestrians.",
    figure: "/src/assets/sign-pedestrian.png"
  },
  {
    id: 8,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "When passing a parked vehicle, I should maintain a distance of at least 0.5 meters from it.",
    answer: false,
    explanation: "False. You should maintain at least 1 meter (or more if safe) when passing parked vehicles to account for doors opening or pedestrians emerging.",
    figure: undefined
  },
  {
    id: 9,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "This sign indicates the maximum speed limit is 50 km/h.",
    answer: true,
    explanation: "True. Regulatory sign showing maximum permitted speed. Exceeding this limit violates Article 22 and results in fines or license points.",
    figure: "/src/assets/sign-speed-50.png"
  },
  {
    id: 10,
    test: "Learner's Permit Preliminary Written Test 1",
    question: "At an intersection without traffic signals, the vehicle approaching from the right has priority.",
    answer: false,
    explanation: "False. In Japan, vehicles on the wider road or main road have priority. If roads are equal width, vehicles approaching from the left must yield (Article 36).",
    figure: undefined
  },
  {
    id: 11,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When a vehicle in front suddenly applies brakes, I should immediately apply my brakes hard.",
    answer: false,
    explanation: "False. Sudden hard braking can cause loss of control or rear-end collisions. Brake progressively and check mirrors for vehicles behind you.",
    figure: undefined
  },
  {
    id: 12,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "This sign means vehicles must stop before proceeding.",
    answer: true,
    explanation: "True. This is the STOP sign (止まれ). You must come to a complete stop at the line, check for traffic, then proceed only when safe (Article 43).",
    figure: "/src/assets/sign-stop.png"
  },
  {
    id: 13,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "I can use my mobile phone while driving if I use a hands-free device.",
    answer: false,
    explanation: "False. While hands-free is less penalized, using any phone while driving reduces attention and is strongly discouraged. Texting/holding phone violates Article 71.",
    figure: undefined
  },
  {
    id: 14,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "When it starts raining, I should increase my following distance from other vehicles.",
    answer: true,
    explanation: "True. Wet roads increase braking distance significantly. Increase following distance to at least double the normal distance to allow for longer stopping times.",
    figure: undefined
  },
  {
    id: 15,
    test: "Learner's Permit Preliminary Written Test 2",
    question: "At a railroad crossing with flashing lights, I can proceed if I don't see a train approaching.",
    answer: false,
    explanation: "False. Flashing lights at a railroad crossing mean a train is approaching. You must stop and wait until the lights stop flashing (Article 33).",
    figure: undefined
  },
  {
    id: 16,
    test: "Standard Written Test 1",
    question: "When driving in fog with visibility less than 50 meters, I must turn on my hazard lights.",
    answer: false,
    explanation: "False. Use fog lights and low beam headlights, not hazard lights. Hazard lights are for stopped vehicles. Reduce speed and increase following distance.",
    figure: undefined
  },
  {
    id: 17,
    test: "Standard Written Test 1",
    question: "A driver's license is valid for 3 years for new drivers.",
    answer: true,
    explanation: "True. New drivers (green mark) receive a 3-year license. After that, depending on violations, licenses can be renewed for 3-5 year periods.",
    figure: undefined
  },
  {
    id: 18,
    test: "Standard Written Test 1",
    question: "When overtaking, I must complete the overtaking maneuver at least 30 meters before a pedestrian crossing.",
    answer: true,
    explanation: "True. Overtaking is prohibited within 30 meters of a pedestrian crossing (Article 30) to ensure pedestrian safety and adequate reaction time.",
    figure: undefined
  },
  {
    id: 19,
    test: "Standard Written Test 1",
    question: "Blood alcohol content must be 0.00% for all drivers in Japan.",
    answer: true,
    explanation: "True. Japan has a zero-tolerance policy. Any detectable alcohol (0.01% or higher) results in license suspension and criminal penalties (Article 65).",
    figure: undefined
  },
  {
    id: 20,
    test: "Standard Written Test 1",
    question: "I can park within 5 meters of a fire hydrant if I'm only stopping for a few minutes.",
    answer: false,
    explanation: "False. Parking within 5 meters of a fire hydrant is always prohibited (Article 45). Even brief stops can obstruct emergency access and result in towing/fines.",
    figure: undefined
  },
  {
    id: 21,
    test: "Standard Written Test 2",
    question: "When driving at night on a well-lit street, I can use low beam headlights only.",
    answer: true,
    explanation: "True. On well-lit streets, low beams are sufficient and prevent glare to other drivers. Switch to high beams only on dark roads with no oncoming traffic.",
    figure: undefined
  },
  {
    id: 22,
    test: "Standard Written Test 2",
    question: "If I am involved in an accident, I must report it to police within 24 hours.",
    answer: false,
    explanation: "False. You must report accidents to police immediately (Article 72). Leaving the scene or delayed reporting results in serious penalties including imprisonment.",
    figure: undefined
  },
  {
    id: 23,
    test: "Standard Written Test 2",
    question: "Children under 6 years old must use a child safety seat when riding in a car.",
    answer: true,
    explanation: "True. Road Traffic Act Article 71-3 requires appropriate child restraint systems for children under 6. Violations result in administrative points.",
    figure: undefined
  },
  {
    id: 24,
    test: "Standard Written Test 2",
    question: "The maximum speed on expressways for regular cars is 120 km/h on all sections.",
    answer: false,
    explanation: "False. Most expressways have a 100 km/h limit. Only designated new expressway sections allow 120 km/h (Articles 22, 27). Always check posted limits.",
    figure: undefined
  },
  {
    id: 25,
    test: "Standard Written Test 2",
    question: "When an emergency vehicle with siren approaches from behind, I should pull over to the left and stop.",
    answer: true,
    explanation: "True. Article 40 requires vehicles to yield to emergency vehicles. Pull to the left edge (not right), stop if necessary, and allow the emergency vehicle to pass.",
    figure: undefined
  },
  {
    id: 26,
    test: "Additional Practice Questions",
    question: "Motorcycles are prohibited from using the right-hand lane on highways with three or more lanes.",
    answer: false,
    explanation: "False. Motorcycles can use any lane but should avoid unnecessary lane changes. The far-right lane is for overtaking, regardless of vehicle type.",
    figure: undefined
  },
  {
    id: 27,
    test: "Additional Practice Questions",
    question: "I must yield to pedestrians who are waiting to cross at a pedestrian crossing without traffic lights.",
    answer: true,
    explanation: "True. Article 38 requires drivers to stop and allow pedestrians to cross at marked crossings. Failure to yield is a serious violation with penalties.",
    figure: undefined
  },
  {
    id: 28,
    test: "Additional Practice Questions",
    question: "Seat belts are only required for front seat passengers.",
    answer: false,
    explanation: "False. All passengers must wear seat belts (Article 71-3). Rear seat passengers must also buckle up. Driver is responsible for ensuring compliance.",
    figure: undefined
  },
  {
    id: 29,
    test: "Additional Practice Questions",
    question: "When turning right at an intersection, I should position my car close to the center line before turning.",
    answer: true,
    explanation: "True. Article 34 requires vehicles turning right to stay close to the center line (left side in Japan) to allow other vehicles to pass on the left.",
    figure: undefined
  },
  {
    id: 30,
    test: "Additional Practice Questions",
    question: "Honking the horn is required when passing through residential areas at night.",
    answer: false,
    explanation: "False. Unnecessary horn use, especially in residential areas at night, is prohibited (Article 54). Use horn only at designated points or in emergencies.",
    figure: undefined
  },
  {
    id: 31,
    test: "Additional Practice Questions",
    question: "Driving with worn tires that have less than 1.6mm tread depth is illegal.",
    answer: true,
    explanation: "True. Vehicle Safety Standards require minimum 1.6mm tread depth. Worn tires reduce grip and increase hydroplaning risk, especially in rain.",
    figure: undefined
  },
  {
    id: 32,
    test: "Additional Practice Questions",
    question: "When parallel parking, I can park up to 50cm from the curb.",
    answer: false,
    explanation: "False. Vehicles must park within 30cm of the curb (not 50cm) to avoid obstructing traffic flow and ensure pedestrian safety.",
    figure: undefined
  },
  {
    id: 33,
    test: "Additional Practice Questions",
    question: "Winter tires or tire chains are legally required when driving in designated snowy mountain areas.",
    answer: true,
    explanation: "True. Road Traffic Act allows prefectures to require winter equipment in hazardous conditions. Signs indicate when chains/winter tires are mandatory.",
    figure: undefined
  },
  {
    id: 34,
    test: "Additional Practice Questions",
    question: "A flashing yellow traffic light means I should proceed with caution after slowing down.",
    answer: true,
    explanation: "True. Flashing yellow means proceed with caution (Article 7). Slow down, check for cross traffic and pedestrians, but you may continue if safe.",
    figure: undefined
  },
  {
    id: 35,
    test: "Additional Practice Questions",
    question: "I can make a U-turn at any intersection unless there is a prohibiting sign.",
    answer: false,
    explanation: "False. U-turns are prohibited at many locations: pedestrian crossings, within 30m of intersections, on highways, and where visibility is poor (Article 25).",
    figure: undefined
  },
  {
    id: 36,
    test: "Additional Practice Questions",
    question: "When driving behind a large truck, I should maintain a greater following distance than with smaller vehicles.",
    answer: true,
    explanation: "True. Large vehicles obstruct visibility and require longer stopping distances. Increase following distance to at least 3 seconds or more.",
    figure: undefined
  },
  {
    id: 37,
    test: "Additional Practice Questions",
    question: "Bicycles have the right of way over cars at all intersections.",
    answer: false,
    explanation: "False. While bicycles are vulnerable, right-of-way rules apply equally. However, drivers must exercise extra caution around cyclists (Article 36).",
    figure: undefined
  },
  {
    id: 38,
    test: "Additional Practice Questions",
    question: "If my license expires, I have a 6-month grace period to renew it without retaking tests.",
    answer: false,
    explanation: "False. Licenses expired for more than 6 months require retaking tests. Renew within 1 month before to 1 month after birthday to avoid complications.",
    figure: undefined
  },
  {
    id: 39,
    test: "Additional Practice Questions",
    question: "Penalty points for traffic violations remain on my record for 3 years.",
    answer: false,
    explanation: "False. Points remain for 1 year if no violations occur. However, serious violations or accumulation can extend this period or result in license suspension.",
    figure: undefined
  },
  {
    id: 40,
    test: "Additional Practice Questions",
    question: "I must use headlights from sunset to sunrise, even in well-lit urban areas.",
    answer: true,
    explanation: "True. Article 52 requires headlights from sunset to sunrise regardless of street lighting. This ensures visibility to other road users and pedestrians.",
    figure: undefined
  },
  {
    id: 41,
    test: "Additional Practice Questions",
    question: "When approaching a school zone during school hours, I must slow down to 30 km/h or less.",
    answer: true,
    explanation: "True. School zones have 30 km/h limits during designated hours (typically 7-9am and 3-5pm). Watch for children and be prepared to stop suddenly.",
    figure: undefined
  },
  {
    id: 42,
    test: "Additional Practice Questions",
    question: "Electric scooters are classified as bicycles and can use bicycle lanes.",
    answer: false,
    explanation: "False. Motorized vehicles including e-scooters require registration and licenses. They must follow motor vehicle rules, not bicycle rules.",
    figure: undefined
  },
  {
    id: 43,
    test: "Additional Practice Questions",
    question: "Driving continuously for more than 4 hours without a break violates rest period regulations for commercial drivers.",
    answer: true,
    explanation: "True. Commercial drivers must take 30-minute breaks every 4 hours of continuous driving to prevent fatigue-related accidents (Labor Standards Act).",
    figure: undefined
  },
  {
    id: 44,
    test: "Additional Practice Questions",
    question: "GPS navigation devices can legally be mounted on the dashboard within the driver's field of vision.",
    answer: false,
    explanation: "False. Devices must not obstruct the driver's view (Article 55). Mount on dashboard edges or use windshield mounts outside the wiper sweep area.",
    figure: undefined
  },
  {
    id: 45,
    test: "Additional Practice Questions",
    question: "All vehicles must display a valid inspection sticker (shaken) on the windshield.",
    answer: true,
    explanation: "True. Road Transport Vehicle Act requires periodic inspections (shaken) every 1-3 years depending on vehicle age. Display certificate on windshield.",
    figure: undefined
  },
  {
    id: 46,
    test: "Additional Practice Questions",
    question: "Studded tires are permitted on all roads during winter months.",
    answer: false,
    explanation: "False. Studded tires are prohibited in most areas due to road damage (Studded Tire Regulation). Use studless winter tires instead except in designated regions.",
    figure: undefined
  },
  {
    id: 47,
    test: "Additional Practice Questions",
    question: "When merging onto an expressway, vehicles already on the expressway must yield to merging traffic.",
    answer: false,
    explanation: "False. Merging vehicles must yield to traffic already on the expressway (Article 75). Adjust speed to find a safe gap before merging.",
    figure: undefined
  },
  {
    id: 48,
    test: "Additional Practice Questions",
    question: "The maximum penalty for causing death by dangerous driving can include up to 20 years imprisonment.",
    answer: true,
    explanation: "True. Vehicular manslaughter under Article 208-2 (dangerous driving causing death) carries up to 20 years imprisonment, especially if alcohol or drugs involved.",
    figure: undefined
  },
  {
    id: 49,
    test: "Additional Practice Questions",
    question: "Foreign drivers with an International Driving Permit can drive in Japan for up to one year without obtaining a Japanese license.",
    answer: true,
    explanation: "True. IDP holders can drive for 1 year from entry date. After that, must convert to Japanese license or leave and re-enter (not recommended as regulation).",
    figure: undefined
  },
  {
    id: 50,
    test: "Additional Practice Questions",
    question: "Dashboard cameras recording while driving are illegal without passenger consent.",
    answer: false,
    explanation: "False. Dashboard cameras are legal and increasingly common in Japan. They record public spaces and can provide evidence in accidents. No consent needed.",
    figure: undefined
  }
];
