export interface Lecture {
  number: number;
  pages: string;
  subject: string;
  stage: "First Stage" | "Second Stage";
  note?: string;
}

export const lectures: Lecture[] = [
  // First Stage
  { number: 1, pages: "11-22", subject: "Before you get behind the wheel (Morals and responsibilities as a driver; Driving while intoxicated; Observation of traffic regulations)", stage: "First Stage" },
  { number: 2, pages: "23-32", subject: "Observation of traffic signals (Types and observation of traffic signals; Caution at traffic signals)", stage: "First Stage" },
  { number: 3, pages: "33-52", subject: "Observation of signs and markings (Types and observation of signs and markings; Instructions by police officers, etc.)", stage: "First Stage" },
  { number: 4, pages: "53-62", subject: "Where vehicles can and cannot drive (General rules for driving on roads and exceptions; General rules for keeping on lanes and exceptions)", stage: "First Stage" },
  { number: 5, pages: "67-80", subject: "Driving through an intersection / railway crossing", stage: "First Stage" },
  { number: 6, pages: "81-90, 145-148", subject: "Safe Speeds and Distances Between Vehicles", stage: "First Stage" },
  { number: 7, pages: "91-100", subject: "Be on the alert for pedestrians", stage: "First Stage" },
  { number: 8, pages: "101-112", subject: "Safety Checks and Use of Signals and Horn / Changing Lanes, etc.", stage: "First Stage" },
  { number: 9, pages: "63-66, 113-124", subject: "Priority for Emergency Vehicles, etc. / Overtaking and passing / Passing-by", stage: "First Stage" },
  { number: 10, pages: "125-144", subject: "Driver's License System / Traffic Violation Notification System", stage: "First Stage" },
  
  // Second Stage
  { number: 11, pages: "161-170", subject: "Blind Spots and Driving", stage: "Second Stage" },
  { number: 12, pages: "171-180", subject: "Behavior Analysis Based on the Result of Aptitude Test", stage: "Second Stage" },
  { number: 13, pages: "181-190", subject: "Human Ability and Driving", stage: "Second Stage" },
  { number: 14, pages: "191-208", subject: "Natural Forces that Act on a Vehicle and Driving", stage: "Second Stage" },
  { number: 15, pages: "209-228", subject: "Driving in Adverse Environments", stage: "Second Stage" },
  { number: 16, pages: "229-240", subject: "Characteristics of Traffic Accidents and Tragic Results", stage: "Second Stage" },
  { number: 17, pages: "241-256", subject: "Maintenance / Management of Motor Vehicles", stage: "Second Stage" },
  { number: 18, pages: "257-270", subject: "Parking and Stopping", stage: "Second Stage" },
  { number: 19, pages: "271-278", subject: "Vehicle seating capacity and loading / Towing", stage: "Second Stage" },
  { number: 20, pages: "279-294", subject: "Traffic accidents", stage: "Second Stage" },
  { number: 21, pages: "149-160", subject: "Anticipating Danger: A discussion", stage: "Second Stage", note: "Not on timetable - scheduled with driving lesson (Set-kyoshu)" },
  { number: 22, pages: "295-302", subject: "Route Determination", stage: "Second Stage", note: "Must be taken before expressway driving lesson" },
  { number: 23, pages: "303-324", subject: "Expressway driving", stage: "Second Stage", note: "Must be taken before expressway driving lesson" },
  { number: 24, pages: "-", subject: "First Aid I (Emergency First Aid textbook)", stage: "Second Stage", note: "At classroom No.4 - Requires reservation at counter No.5" },
  { number: 25, pages: "-", subject: "First Aid II (1) (Emergency First Aid textbook)", stage: "Second Stage", note: "At classroom No.4 - Must take 24, 25, 26 in succession" },
  { number: 26, pages: "-", subject: "First Aid II (2) (Emergency First Aid textbook)", stage: "Second Stage", note: "At classroom No.4 - Wear comfortable clothes (long trousers)" },
];

export const howToTakeLectures = [
  "Classroom lectures are divided into two stages.",
  "You must take the orientation, aptitude test and lecture No.1 first.",
  "After the orientation, you must take the aptitude test and lecture No.1. When you finish taking them, you may take lectures No.2-10. (It does not have to be in order)",
  "Lecture No.11-26 can be taken after you have finished the first stage.",
  "Lecture No.21 is not on the timetable. This will be set with the driving lesson (Set-kyoshu).",
  "Lecture No.22 and 23 must be taken before the driving lesson going for the expressway.",
  "Lecture No.24, 25 and 26 are First aid classes (At classroom No.4):",
  "① You must take three classes in succession.",
  "② You must wear comfortable clothes such as long trousers.",
  "③ This class needs a reservation. Please go to counter No.5."
];

export const lectureTimetable = [
  { day: "Monday", time: "14:50-17:20" },
  { day: "Tuesday", time: "10:00-12:30" },
  { day: "Wednesday", time: "17:00-19:30" },
  { day: "Thursday", time: "17:00-19:30" },
  { day: "Friday", time: "17:00-19:30" },
  { day: "Saturday", time: "14:50-17:20" },
  { day: "Sunday", time: "14:50-17:20" },
];

export interface TerminologyItem {
  term: string;
  definition: string;
  category: "Road" | "Vehicle" | "Signs" | "Driving";
}

export const terminology: TerminologyItem[] = [
  { term: "Road", definition: "(1) National expressways, general national roads, municipal roads stipulated by the Road Law (2) Motorways (general motorways stipulated by the Road Transport Law) (3) Areas where vehicles may pass freely (parks, school yards, squares, private roads, etc.)", category: "Road" },
  { term: "Sidewalk", definition: "Road portion divided by a curb, fence or guardrail for pedestrians.", category: "Road" },
  { term: "Hard Shoulder", definition: "Road portion for use when a vehicle breaks down or for emergencies.", category: "Road" },
  { term: "Vehicle Lane", definition: "Vehicle lane marked by road lines.", category: "Road" },
  { term: "Bus Lane", definition: "Exclusive bus lane / Exclusive bus lane for motorcycles and mopeds.", category: "Road" },
  { term: "Intersection", definition: "Roadway where side roads and roadways are divided.", category: "Road" },
  { term: "Priority Road", definition: "Road sign or roads where vehicle lane is marked through the centerline.", category: "Road" },
  { term: "Expressway", definition: "National expressways and motorways, i.e. roads designated for high-speed driving.", category: "Road" },
  { term: "Main Traffic Lane", definition: "The portion of an expressway designated for high-speed driving (excluding the acceleration lane, deceleration lane, slower traffic lane, side strip and hard shoulder).", category: "Road" },
  { term: "Motor Vehicle", definition: "Motor vehicle except for mopeds that do not rely on rails or power lines. Includes large, middle, semi-middle, regular motor vehicles, special heavy equipment, large and regular motorcycles and special light equipment.", category: "Vehicle" },
  { term: "Small-sized Middle Motor Vehicle", definition: "Middle motor vehicle with a load capacity of 3,500 kg or more but less than 5,000 kg or a capacity of more than 11 passengers.", category: "Vehicle" },
  { term: "Mini Car", definition: "Regular motor vehicle with a total engine displacement of less than 660 cc, or with a motor that develops rated power of less than 0.66 kW.", category: "Vehicle" },
  { term: "Light Motorcycle", definition: "Motorcycles with total engine displacement of less than 125 cc, and with a motor power rating of less than 1.00 kW.", category: "Vehicle" },
  { term: "General Motorized Bicycle", definition: "Two-wheeled vehicles with a total engine displacement of less than 50 cc.", category: "Vehicle" },
  { term: "Bicycle", definition: "Vehicles with two or more wheels and driven by human power.", category: "Vehicle" },
  { term: "Remote-Control Small Sized Vehicle", definition: "Small (compact) vehicles that use standards for safety and can be driven by remote control while being equipped with an emergency stop device.", category: "Vehicle" },
  { term: "Streetcar", definition: "Vehicles driven on the road on rails (metropolitan trains and city trains).", category: "Vehicle" },
];

export const threeElements = {
  title: "Three Elements of Driving",
  description: "Safe driving requires a continuous cycle of Recognition, Judgment, and Action with constant feedback.",
  elements: [
    {
      name: "Recognition",
      icon: "👁️",
      description: "Look and Listen",
      examples: [
        "Road conditions and surface",
        "Other traffic (vehicles, motorcycles, bicycles)",
        "Pedestrians and their behavior",
        "Traffic signals and their timing",
        "Signs and road markings",
        "Obstacles and hazards",
        "Weather and visibility conditions"
      ]
    },
    {
      name: "Judgment",
      icon: "🧠",
      description: "Think and Decide",
      examples: [
        "Check for errors in recognition",
        "Assess speed and distance",
        "Predict other traffic behavior",
        "Reduce speed on curves and bends",
        "Be careful not to skid in rain",
        "Determine safe following distance",
        "Evaluate when to overtake safely"
      ]
    },
    {
      name: "Action",
      icon: "🚗",
      description: "Execute and Move",
      examples: [
        "Brake smoothly and appropriately",
        "Accelerate gradually",
        "Steer with precision",
        "Use signals properly",
        "Change lanes safely",
        "Adjust speed for conditions",
        "Apply correct stopping technique"
      ]
    }
  ],
  feedback: "After each action, observe the results and adjust your next recognition accordingly. This creates a continuous improvement cycle for safe driving."
};
