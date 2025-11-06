import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndulrvfwcqyvutcviebk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdWxydmZ3Y3F5dnV0Y3ZpZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDA1MzcsImV4cCI6MjA3NzMxNjUzN30.0dM5c4ft7UIc7Uy6GmBthgNRcfqttvNs9EiR85OTVIo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample questions with images (from provided data)
const sampleQuestions = [
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "You are driving at 10km/h to make a right turn at the intersection. What should you pay attention to?",
    answer: false,
    explanation: "As a car who overtakes the bus may appear from behind it, proceed with caution. When turning right, a vehicle overtaking the bus from behind may suddenly appear.",
    image_type: 'scenario',
    image_storage_path: 'test1/q91.png',
    tags: ['right turn', 'bus', 'overtaking', 'blind spot'],
    difficulty: 'medium'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "You are following the car ahead at 10km/h to make a left turn. What should you pay attention to?",
    answer: true,
    explanation: "Because a pedestrian has started to cross the road, pay attention to the car in front as it may stop. The car ahead may stop suddenly for the pedestrian. Always maintain safe distance and be ready to brake.",
    image_type: 'scenario',
    image_storage_path: 'test1/q92.png',
    tags: ['left turn', 'pedestrian', 'following distance'],
    difficulty: 'medium'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "You are driving at 40km/h. What should you pay attention to?",
    answer: true,
    explanation: "As a bicycle is trying to cross the road, stop before the pedestrian crossing. Bicycles and pedestrians have priority at crossings. Always slow down and stop if needed.",
    image_type: 'scenario',
    image_storage_path: 'test1/q93.png',
    tags: ['bicycle', 'pedestrian crossing', 'priority'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "You are stopping in front of railway crossing. What should you pay attention to?",
    answer: true,
    explanation: "You should wait until there is enough room across the railway crossing. Never enter a railway crossing unless the entire vehicle can clear the tracks.",
    image_type: 'scenario',
    image_storage_path: 'test1/q94.png',
    tags: ['railway', 'stop', 'clearance'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "You are driving at 40km/h. What should you pay attention to?",
    answer: true,
    explanation: "Reduce your speed and drive on the left side of the road because an oncoming vehicle may cross over the centerline. Stay left to give the oncoming vehicle room to correct its path on a curve.",
    image_type: 'scenario',
    image_storage_path: 'test1/q95.png',
    tags: ['curve', 'centerline', 'oncoming'],
    difficulty: 'medium'
  },
  // Add some sign-based questions
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "The road sign shown indicates a STOP sign. You must come to a complete stop.",
    answer: true,
    explanation: "A STOP sign requires drivers to come to a complete stop at the designated line before proceeding.",
    image_type: 'sign',
    image_path: '/assets/sign-stop.png',
    tags: ['road signs', 'stop', 'regulatory'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "This sign indicates no parking is allowed in this area.",
    answer: true,
    explanation: "The no parking sign prohibits vehicles from stopping or parking in the designated area.",
    image_type: 'sign',
    image_path: '/assets/sign-no-parking.png',
    tags: ['road signs', 'parking', 'regulatory'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "This sign warns of a pedestrian crossing ahead.",
    answer: true,
    explanation: "This warning sign alerts drivers to slow down and watch for pedestrians who may be crossing.",
    image_type: 'sign',
    image_path: '/assets/sign-pedestrian.png',
    tags: ['road signs', 'pedestrian', 'warning'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "This sign indicates a railway crossing ahead.",
    answer: true,
    explanation: "Railway crossing signs warn drivers to slow down and be prepared to stop for trains.",
    image_type: 'sign',
    image_path: '/assets/sign-railway.png',
    tags: ['road signs', 'railway', 'warning'],
    difficulty: 'easy'
  },
  {
    test_category: "Driver's License Preliminary Final Written Test 1",
    question_text: "This sign indicates the speed limit is 50 km/h.",
    answer: true,
    explanation: "Speed limit signs display the maximum speed allowed on that road segment.",
    image_type: 'sign',
    image_path: '/assets/sign-speed-50.png',
    tags: ['road signs', 'speed limit', 'regulatory'],
    difficulty: 'easy'
  }
];

async function seedQuestions() {
  console.log('Starting to seed questions...');
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert(sampleQuestions)
      .select();
    
    if (error) {
      console.error('Error seeding questions:', error);
      throw error;
    }
    
    console.log(`✓ Successfully seeded ${data.length} questions`);
    console.log('Sample IDs:', data.map(q => q.id).join(', '));
  } catch (error) {
    console.error('Failed to seed questions:', error);
    process.exit(1);
  }
}

// Run the script
seedQuestions();
