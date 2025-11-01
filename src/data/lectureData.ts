// ============================================================
// TEXTBOOK: Rules of the Road - Table of Contents
// This is the actual textbook organized by chapters
// ============================================================

export interface TextbookChapter {
  chapter: number;
  step: "First Step" | "Second Step";
  pages: string;
  title: string;
  subsections: string[];
}

export const textbookChapters: TextbookChapter[] = [
  // First Step
  { chapter: 1, step: "First Step", pages: "6-16", title: "Before you get behind the wheel", subsections: [
    "Morals and responsibilities as a member of the motoring society",
    "Driving while intoxicated is prohibited",
    "Observation of traffic regulations",
    "Necessary preparations for driving"
  ]},
  { chapter: 2, step: "First Step", pages: "17-24", title: "Observation of traffic signals", subsections: [
    "Types and meanings of traffic signals",
    "Caution at traffic signals"
  ]},
  { chapter: 3, step: "First Step", pages: "30-34", title: "Observation of signs and markings", subsections: [
    "Types and meanings of signs and markings",
    "Instructions by a police officer, etc."
  ]},
  { chapter: 4, step: "First Step", pages: "50-58", title: "Where vehicles can and cannot drive", subsections: [
    "General rules for driving on roadways and exceptions",
    "General rules for keeping left and exceptions",
    "Traffic on roads without vehicle lanes",
    "Traffic on roads with vehicle lanes",
    "Avoiding unnecessary lane changes"
  ]},
  { chapter: 5, step: "First Step", pages: "61-65", title: "Priority for Emergency Vehicles, etc.", subsections: [
    "Priority for emergency vehicles",
    "Priority for buses, etc."
  ]},
  { chapter: 6, step: "First Step", pages: "66-78", title: "Driving through an intersection/railway crossing", subsections: [
    "Driving through an intersection",
    "Caution when driving through an intersection (excluding roundabout)",
    "How to drive through an uncontrolled intersection (excluding roundabout)",
    "How to drive through a roundabout",
    "Railway crossings - How to cross",
    "Procedures in the event of a break down on a railway crossing"
  ]},
  { chapter: 7, step: "First Step", pages: "82-88", title: "Safe Speed and Distance Between Vehicles", subsections: [
    "Maximum speed",
    "Speed and stopping distances",
    "Safe and adequate distance between vehicles",
    "How to apply the brakes",
    "Slowing down"
  ]},
  { chapter: 8, step: "First Step", pages: "", title: "Be on the alert for pedestrians", subsections: [
    "Be on the alert for pedestrians when driving near pedestrian crossings",
    "Be on the alert for bicycles when driving near bicycle crossings",
    "Be on the alert for children and the physically disabled",
    "Be on the alert for beginner drivers, senior drivers, hearing impairment drivers",
    "Do not obstruct others while driving"
  ]},
  { chapter: 9, step: "First Step", pages: "", title: "Safety Checks and Use of Signals and Horn", subsections: [
    "Safety checks and signals",
    "Safety checks methods",
    "Situations where signals are required",
    "Do not use unnecessary signals",
    "Use of the horn - When to use",
    "Restrictions on horn use"
  ]},
  { chapter: 10, step: "First Step", pages: "", title: "Changing Lanes, etc", subsections: [
    "When drivers cannot change lanes",
    "When drivers cannot cross or make U-turns",
    "Prohibition of cutting-in and crossing"
  ]},
  { chapter: 11, step: "First Step", pages: "", title: "Overtaking and passing", subsections: [
    "When drivers should not overtake",
    "Method for overtaking",
    "Caution when being overtaken"
  ]},
  { chapter: 12, step: "First Step", pages: "", title: "Passing-by", subsections: [
    "Maintaining side distance",
    "Measures when obstacles are present"
  ]},
  { chapter: 13, step: "First Step", pages: "", title: "Driver's License System/Traffic Violation Notification System", subsections: [
    "Driver's license system",
    "Renewal of the drivers license, etc.",
    "Outline of the penalty point system",
    "Cancellation/suspension of driver's license",
    "Beginner's system",
    "Lecture system for drivers with a canceled license",
    "Outline of the traffic violation notification system"
  ]},
  { chapter: 14, step: "First Step", pages: "", title: "Driving Vehicles with Automatic Transmission, etc.", subsections: [
    "Driving vehicles with automatic transmission",
    "Driving vehicles with advanced safety vehicles",
    "Self-driving vehicles"
  ]},
  // Second Step
  { chapter: 1, step: "Second Step", pages: "151-153", title: "Anticipating Danger: A Discussion", subsections: [
    "Importance of anticipating danger",
    "Dangerous scenarios when driving",
    "Anticipation of possible danger",
    "Driving actions to reduce danger"
  ]},
  { chapter: 4, step: "Second Step", pages: "162-168", title: "Blind Spots and Driving", subsections: [
    "Examples of blind spots",
    "How to see from motorcycles/four-wheeled vehicles",
    "Defensive driving",
    "How to communicate with other vehicles"
  ]},
  { chapter: 5, step: "Second Step", pages: "172-173", title: "Behavior Analysis Based on the Result of Aptitude Tests", subsections: [
    "Driving and personality",
    "Driving aptitude test",
    "Utilization of the result of aptitude tests in driving, etc."
  ]},
  { chapter: 6, step: "Second Step", pages: "182-187", title: "Human Ability and Driving", subsections: [
    "Recognition, judgment and action",
    "Factors that influence recognition, judgment and action",
    "(Influences caused by drinking)"
  ]},
  { chapter: 7, step: "Second Step", pages: "192-200", title: "Natural Forces that Act on a Vehicles and Driving", subsections: [
    "The force that tries to keep a vehicle in motion and the force that tries to stop the vehicle",
    "How to load and vehicle's stability",
    "Driving on curves and slopes",
    "Speed and impact",
    "Prevention of traffic pollution and global warming, etc.",
    "Overloaded, dangerous and other unique vans/wagons"
  ]},
  { chapter: 8, step: "Second Step", pages: "210-224", title: "Driving in Adverse Environments", subsections: [
    "Driving at night",
    "Situations where you must use headlights",
    "Light restrictions, etc.",
    "Driving in the rain",
    "Driving in the fog, etc.",
    "Driving on iced road conditions",
    "Emergency measures, etc.",
    "Large earthquakes, etc."
  ]},
  { chapter: 9, step: "Second Step", pages: "230-239", title: "Characteristics of Traffic Accidents and Tragic Results", subsections: [
    "The reality of characteristic of traffic accidents",
    "Exposure of motorcycles rider's body and injury",
    "Tragic results of traffic accidents",
    "Respect for human lives",
    "The importance of seat belt"
  ]},
  { chapter: 10, step: "Second Step", pages: "242-248", title: "Maintenance/Management of Motor Vehicles", subsections: [
    "Maintenance and care of motor vehicle parts",
    "Inspection and how to use equipment and tools",
    "Changing tires",
    "Inspection by a driver"
  ]},
  { chapter: 11, step: "Second Step", pages: "258-269", title: "Parking and Stopping", subsections: [
    "Definition of parking and stopping",
    "Prohibition of parking and stopping and exceptions",
    "How to park or stop a vehicle",
    "Restrictions on parking hours",
    "Measures when drivers leave their vehicles",
    "Ensuring a stopping space",
    "Problems caused by parking"
  ]},
  { chapter: 12, step: "Second Step", pages: "272-274", title: "Vehicle seating capacity and loading", subsections: [
    "Vehicle seating capacity and loading methods",
    "Exceptions on vehicle seating capacity and loading",
    "Restrictions on vehicle seating capacity and loading",
    "Prevention of loads falling or slipping",
    "Transportation of dangerous items"
  ]},
  { chapter: 13, step: "Second Step", pages: "276-277", title: "Towing", subsections: [
    "How to tow a broken down vehicle",
    "Restrictions on towing"
  ]},
  { chapter: 14, step: "Second Step", pages: "280-281", title: "Traffic Accidents", subsections: [
    "Driver's duties are",
    "When you become a victim",
    "When you are present at the scene of an accident"
  ]},
  { chapter: 15, step: "Second Step", pages: "284-288", title: "Motor vehicle owners requirements and insurance system", subsections: [
    "Motor vehicle registration and inspection",
    "Necessity of insurance",
    "Classification and system of motor vehicle insurance"
  ]},
  { chapter: 16, step: "Second Step", pages: "296-300", title: "Route Determination", subsections: [
    "Read information on a map",
    "How to determine your route",
    "Use of guide signs",
    "When taking the wrong route",
    "When touring"
  ]},
  { chapter: 17, step: "Second Step", pages: "304-322", title: "Expressway Driving", subsections: [
    "Vehicles not allowed",
    "Speed and distance between vehicles",
    "Lane classifications, etc.",
    "Prohibited items",
    "Measures during a break down",
    "Before using the expressway",
    "Driving plan",
    "Entering the main traffic lane",
    "Driving in the main traffic lane",
    "Leaving the main traffic lane"
  ]},
  { chapter: 18, step: "Second Step", pages: "326-331", title: "Preliminary Knowledge for Riding with a Passenger", subsections: [
    "Regulations regarding driving with a passenger on motorcycles",
    "Characteristics of driving with a passenger"
  ]},
];

// ============================================================
// CURRICULUM: Classroom Lectures Schedule
// This is the actual lecture schedule students follow
// ============================================================

export interface CurriculumLecture {
  number: number;
  stage: "First Stage" | "Second Stage";
  pages: string;
  subject: string;
  note?: string;
}

export const curriculumLectures: CurriculumLecture[] = [
  // First Stage
  { number: 1, stage: "First Stage", pages: "11-22", subject: "Before you get behind the wheel" },
  { number: 2, stage: "First Stage", pages: "23-32", subject: "Observation of traffic signals" },
  { number: 3, stage: "First Stage", pages: "33-52", subject: "Observation of signs and markings" },
  { number: 4, stage: "First Stage", pages: "53-62", subject: "Where vehicles can and cannot drive" },
  { number: 5, stage: "First Stage", pages: "67-80", subject: "Driving through an intersection / railway crossing" },
  { number: 6, stage: "First Stage", pages: "81-90, 145-148", subject: "Safe Speeds and Distances Between Vehicles" },
  { number: 7, stage: "First Stage", pages: "91-100", subject: "Be on the alert for pedestrians" },
  { number: 8, stage: "First Stage", pages: "101-112", subject: "Safety Checks and Use of Signals and Horn / Changing Lanes, etc." },
  { number: 9, stage: "First Stage", pages: "63-66, 113-124", subject: "Priority for Emergency Vehicles, etc. / Overtaking and passing / Passing-by" },
  { number: 10, stage: "First Stage", pages: "125-144", subject: "Driver's License System / Traffic Violation Notification System" },
  // Second Stage
  { number: 11, stage: "Second Stage", pages: "161-170", subject: "Blind Spots and Driving" },
  { number: 12, stage: "Second Stage", pages: "171-180", subject: "Behavior Analysis Based on the Result of Aptitude Test" },
  { number: 13, stage: "Second Stage", pages: "181-190", subject: "Human Ability and Driving" },
  { number: 14, stage: "Second Stage", pages: "191-208", subject: "Natural Forces that Act on a Vehicle and Driving" },
  { number: 15, stage: "Second Stage", pages: "209-228", subject: "Driving in Adverse Environments" },
  { number: 16, stage: "Second Stage", pages: "229-240", subject: "Characteristics of Traffic Accidents and Tragic Results" },
  { number: 17, stage: "Second Stage", pages: "241-256", subject: "Maintenance / Management of Motor Vehicles" },
  { number: 18, stage: "Second Stage", pages: "257-270", subject: "Parking and Stopping" },
  { number: 19, stage: "Second Stage", pages: "271-278", subject: "Vehicle seating capacity and loading / Towing" },
  { number: 20, stage: "Second Stage", pages: "279-294", subject: "Traffic accidents" },
  { number: 21, stage: "Second Stage", pages: "149-160", subject: "Anticipating Danger: A discussion", note: "Not on timetable - scheduled with driving lesson" },
  { number: 22, stage: "Second Stage", pages: "295-302", subject: "Route Determination", note: "Must be taken before expressway driving lesson" },
  { number: 23, stage: "Second Stage", pages: "303-324", subject: "Expressway driving", note: "Must be taken before expressway driving lesson" },
  { number: 24, stage: "Second Stage", pages: "", subject: "First Aid I", note: "Uses Emergency First Aid textbook - At classroom No.4" },
  { number: 25, stage: "Second Stage", pages: "", subject: "First Aid II (1)", note: "Uses Emergency First Aid textbook - At classroom No.4" },
  { number: 26, stage: "Second Stage", pages: "", subject: "First Aid II (2)", note: "Uses Emergency First Aid textbook - At classroom No.4" },
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

// ============================================================
// TERMINOLOGY: Major terms from textbook
// ============================================================

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
  { term: "Priority Road", definition: "Road sign or roads where vehicle lane is marked through the centerline.", category: "Signs" },
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

// ============================================================
// THREE ELEMENTS: Core driving principles
// ============================================================

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
