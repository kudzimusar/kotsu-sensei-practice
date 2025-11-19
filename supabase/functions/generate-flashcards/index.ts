import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Sign data interface
interface SignData {
  id: string;
  category: string;
  number: string;
  japanese: string;
  romaji: string;
  english: string;
  meaning: string;
  exam_note: string;
}

// Generate image using Google AI Studio (Gemini Imagen API)
async function generateImageWithGoogleAI(sign: SignData): Promise<string | null> {
  try {
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
    
    if (!GOOGLE_AI_STUDIO_API_KEY) {
      console.log('GOOGLE_AI_STUDIO_API_KEY not configured, skipping image generation');
      return null;
    }

    // Build prompt for image generation
    const prompt = `A clear, educational illustration of a Japanese road sign for a driving test flashcard: ${sign.english} (${sign.japanese}). 
    Style: Clean vector graphic suitable for a driving test flashcard, high contrast, professional, accurate colors (red circle, blue symbols, etc.), 
    educational material. Make it clear and recognizable as a Japanese traffic sign.`;

    // Use Gemini API with image generation capabilities
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_STUDIO_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Google AI Studio API error:', response.status);
      return null;
    }

    // Note: Gemini API may not directly return images in this format
    // For now, fall back to using Serper API or alternative method
    // This is a placeholder - actual implementation may need Imagen API
    return null;
  } catch (error) {
    console.error('Error generating image with Google AI Studio:', error);
    return null;
  }
}

// Fetch a single image for a specific query using Serper API (fallback)
async function fetchImage(query: string): Promise<string | null> {
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('SERPER_API_KEY not configured, skipping image search');
      return null;
    }

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} japan driving traffic road sign`,
        num: 1
      })
    });

    if (!response.ok) {
      console.error('Serper API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.images?.[0]?.imageUrl || null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Use Lovable gateway with Gemini image generation (primary method)
async function generateImageWithLovableGateway(sign: SignData): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      return null;
    }

    const imagePrompt = `Generate a clear, educational illustration of a Japanese road sign for a driving test flashcard: ${sign.english} (${sign.japanese}). 
    Style: Clean vector graphic suitable for a driving test, high contrast, educational, accurate colors.`;
    
    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: imagePrompt
        }],
        modalities: ['image', 'text']
      })
    });

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      return imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating image with Lovable gateway:', error);
    return null;
  }
}

// Regulatory Signs Data (59 signs)
const REGULATORY_SIGNS: SignData[] = [
  {
    id: "reg-01",
    category: "Regulatory Signs",
    number: "1",
    japanese: "車両進入禁止",
    romaji: "Sharyō shinnyū kinshi",
    english: "Road closed to all vehicles",
    meaning: "The road is closed to all vehicles (i.e. motor vehicles, mopeds, light vehicles).",
    exam_note: "Very common in written test"
  },
  {
    id: "reg-02",
    category: "Regulatory Signs",
    number: "2",
    japanese: "閉鎖",
    romaji: "Heisa",
    english: "Closed to all vehicles",
    meaning: "The road is closed to all motor vehicles.",
    exam_note: ""
  },
  {
    id: "reg-03",
    category: "Regulatory Signs",
    number: "3",
    japanese: "車両進入禁止",
    romaji: "Sharyō shinnyū kinshi",
    english: "No entry for vehicles",
    meaning: "Placed at the exit of a one-way street and vehicles are prohibited to enter.",
    exam_note: ""
  },
  {
    id: "reg-04",
    category: "Regulatory Signs",
    number: "4",
    japanese: "大型貨物自動車等通行止め",
    romaji: "Ōgata kamotsu jidōsha tō tsūkōdome",
    english: "Closed to all vehicles except motorcycles",
    meaning: "The road is closed to all motor vehicles except motorcycles (large or regular motorcycles, etc.).",
    exam_note: ""
  },
  {
    id: "reg-05",
    category: "Regulatory Signs",
    number: "5",
    japanese: "大型貨物自動車等通行止め",
    romaji: "Ōgata kamotsu jidōsha tō tsūkōdome",
    english: "Closed to large-size trucks, etc.",
    meaning: "The road is closed to large-size trucks, specific middle-size trucks and special heavy equipment (Refer to P.44 for the specific middle motor vehicle).",
    exam_note: ""
  },
  {
    id: "reg-06",
    category: "Regulatory Signs",
    number: "6",
    japanese: "大型貨物自動車等通行止め",
    romaji: "Ōgata kamotsu jidōsha tō tsūkōdome",
    english: "Closed to trucks, etc. exceeding a specific maximum load capacity",
    meaning: "This road is closed to trucks exceeding the load capacity shown by the auxiliary sign, and special heavy equipment.",
    exam_note: ""
  },
  {
    id: "reg-07",
    category: "Regulatory Signs",
    number: "7",
    japanese: "大型乗用自動車等通行止め",
    romaji: "Ōgata jōyō jidōsha tō tsūkōdome",
    english: "Closed to large-size passenger vehicles, etc.",
    meaning: "The road is closed to large-size passenger vehicles and specific middle-size passenger vehicles (Refer to P.44 for the specific middle motor vehicle).",
    exam_note: ""
  },
  {
    id: "reg-08",
    category: "Regulatory Signs",
    number: "8",
    japanese: "二輪の自動車以外の自動車通行止め",
    romaji: "Nirin no jidōsha igai no jidōsha tsūkōdome",
    english: "Closed to motorcycles and general motorized bicycle",
    meaning: "This road is closed to motorcycles and general motorized bicycle.",
    exam_note: ""
  },
  {
    id: "reg-09",
    category: "Regulatory Signs",
    number: "9",
    japanese: "軽車両以外の自動車通行止め",
    romaji: "Kei sharyō igai no jidōsha tsūkōdome",
    english: "Closed to light vehicles except bicycles",
    meaning: "This road is closed to light vehicles (carts and rear cars) except for bicycles.",
    exam_note: ""
  },
  {
    id: "reg-10",
    category: "Regulatory Signs",
    number: "10",
    japanese: "特定中小型貨物自動車等通行止め",
    romaji: "Tokutei chū/kogata kamotsu jidōsha tō tsūkōdome",
    english: "Closed to specified small motorized bicycle and bicycles",
    meaning: "This road is closed to specified small motorized bicycle and bicycles.",
    exam_note: ""
  },
  {
    id: "reg-11",
    category: "Regulatory Signs",
    number: "11",
    japanese: "自動車・原動機付自転車以外通行止め",
    romaji: "Jidōsha · genbaiki tsuki jidōsha igai tsūkōdome",
    english: "Closed to vehicles",
    meaning: "This road is closed to vehicles indicated by the sign (in this case, closed to motor vehicles including 2-wheelers and general motorized bicycle).",
    exam_note: ""
  },
  {
    id: "reg-12",
    category: "Regulatory Signs",
    number: "12",
    japanese: "大型自動二輪・普通自動二輪通行止め（同乗者あり）",
    romaji: "Ōgata jidō nirin · futsū jidō nirin tsūkōdome (dōjōsha ari)",
    english: "Riding with a passenger on all large and regular motorcycles prohibited",
    meaning: "Riding with a passenger is prohibited when driving through on a large or regular motorcycle (this does not apply to motorcycles with sidecar attachments).",
    exam_note: ""
  },
  {
    id: "reg-13",
    category: "Regulatory Signs",
    number: "13",
    japanese: "タイヤチェーンを取り付けていない車両通行止め",
    romaji: "Taiya chēn o toritsukete inai sharyō tsūkōdome",
    english: "Closed to all vehicles without tire chains",
    meaning: "Vehicles without tire chains are not allowed to pass.",
    exam_note: ""
  },
  {
    id: "reg-14",
    category: "Regulatory Signs",
    number: "14",
    japanese: "指定方向外進行禁止",
    romaji: "Shitei hōkō gai shinkō kinshi",
    english: "Only designated direction permitted",
    meaning: "Vehicles cannot proceed except in the direction indicated by the arrow.",
    exam_note: ""
  },
  {
    id: "reg-15",
    category: "Regulatory Signs",
    number: "15",
    japanese: "横断禁止",
    romaji: "Ōdan kinshi",
    english: "No crossing",
    meaning: "Vehicles are prohibited from crossing the road (except for vehicles turning left to enter or exit a roadside facility).",
    exam_note: "Very frequently tested – remember the exception for left turns to roadside facilities"
  },
  {
    id: "reg-16",
    category: "Regulatory Signs",
    number: "16",
    japanese: "転回禁止",
    romaji: "Tenkai kinshi",
    english: "No U-turn",
    meaning: "Vehicles are prohibited from making a U-turn.",
    exam_note: "The number inside indicates the time period when the U-turn ban applies"
  },
  {
    id: "reg-17",
    category: "Regulatory Signs",
    number: "17",
    japanese: "右折車線からの追越し禁止",
    romaji: "Migi-sen kara no oikoshi kinshi",
    english: "No overtaking on the right-hand side of the road",
    meaning: "Vehicles are prohibited from overtaking on the right-hand side of the road.",
    exam_note: ""
  },
  {
    id: "reg-18",
    category: "Regulatory Signs",
    number: "18",
    japanese: "追越し禁止",
    romaji: "Oikoshi kinshi",
    english: "No overtaking",
    meaning: "Vehicles are prohibited from overtaking.",
    exam_note: ""
  },
  {
    id: "reg-19",
    category: "Regulatory Signs",
    number: "19",
    japanese: "駐車及び停車禁止",
    romaji: "Chūsha oyobi teisha kinshi",
    english: "No parking or stopping",
    meaning: "Vehicles are prohibited from parking or stopping (the number indicates the time period; in this case parking prohibited between 8 a.m. to 8 p.m.).",
    exam_note: "Common question: difference between parking and stopping"
  },
  {
    id: "reg-20",
    category: "Regulatory Signs",
    number: "20",
    japanese: "駐車禁止",
    romaji: "Chūsha kinshi",
    english: "No parking",
    meaning: "Vehicles are prohibited from parking.",
    exam_note: ""
  },
  {
    id: "reg-21",
    category: "Regulatory Signs",
    number: "21",
    japanese: "駐車余地確保",
    romaji: "Chūsha yochi kakuho",
    english: "Designated remaining distance",
    meaning: "Vehicles must not park unless the remaining open distance shown in the auxiliary sign (in this case 6 m) on the right-hand side of the vehicle is secured.",
    exam_note: ""
  },
  {
    id: "reg-22",
    category: "Regulatory Signs",
    number: "22",
    japanese: "時間制限駐車区間",
    romaji: "Jikan seigen chūsha kukan",
    english: "Time-limited parking zone",
    meaning: "Parking is permitted in zones where signs are displayed up to the indicated period (in this case, parking must not exceed 60 minutes between 8 a.m. to 8 p.m.).",
    exam_note: "Parking meters or ticket machines are sometimes installed"
  },
  {
    id: "reg-23",
    category: "Regulatory Signs",
    number: "23",
    japanese: "危険物積載車両通行禁止",
    romaji: "Kikenbutsu sekisai sharyō tsūkō kinshi",
    english: "No carrying of dangerous materials",
    meaning: "The road is closed to vehicles carrying dangerous materials, i.e. gunpowder, explosives, poisons, toxins, etc.",
    exam_note: ""
  },
  {
    id: "reg-24",
    category: "Regulatory Signs",
    number: "24",
    japanese: "総重量制限",
    romaji: "Sō-jūryō seigen",
    english: "Weight limit",
    meaning: "The road is closed to vehicles whose total weight (total weight of vehicle, load and driver/passengers) exceeds the number indicated by the sign.",
    exam_note: ""
  },
  {
    id: "reg-25",
    category: "Regulatory Signs",
    number: "25",
    japanese: "高さ制限",
    romaji: "Takasa seigen",
    english: "Height limit",
    meaning: "The road is closed to vehicles whose height (including height of the load) exceeds the number indicated by the sign.",
    exam_note: ""
  },
  {
    id: "reg-26",
    category: "Regulatory Signs",
    number: "26",
    japanese: "幅員制限",
    romaji: "Fukuin seigen",
    english: "Width limit",
    meaning: "The road is closed to vehicles whose width (including width of the load) exceeds the number indicated by the sign.",
    exam_note: ""
  },
  {
    id: "reg-27",
    category: "Regulatory Signs",
    number: "27",
    japanese: "最高速度",
    romaji: "Saikō sokudo",
    english: "Maximum speed limit",
    meaning: "Vehicles and streetcars must not exceed the indicated speed limit. General motorized bicycle and motor vehicles towing another vehicle by rope must not exceed the legal speed limit even when the posted speed is higher than the legal speed limit.",
    exam_note: "Very high-frequency question"
  },
  {
    id: "reg-28",
    category: "Regulatory Signs",
    number: "28",
    japanese: "特定の種類の車両の最高速度",
    romaji: "Tokutei no shurui no sharyō no saikō sokudo",
    english: "Maximum speed limit for specific types of vehicles",
    meaning: "Vehicles specified by the auxiliary sign must not exceed the speed indicated by the main sign.",
    exam_note: ""
  },
  {
    id: "reg-29",
    category: "Regulatory Signs",
    number: "29",
    japanese: "最低速度",
    romaji: "Saitei sokudo",
    english: "Minimum speed limit",
    meaning: "Motor vehicles must not drive below the minimum speed indicated by the sign.",
    exam_note: "Only appears on expressways"
  },
  {
    id: "reg-30",
    category: "Regulatory Signs",
    number: "30",
    japanese: "自動車専用",
    romaji: "Jidōsha sen'yō",
    english: "Motor vehicles only",
    meaning: "Designated as national expressways or motorways for motor vehicles only.",
    exam_note: "Mopeds and light vehicles are NOT allowed"
  },
  {
    id: "reg-31",
    category: "Regulatory Signs",
    number: "31",
    japanese: "特定小型原動機付自転車及び普通自転車専用",
    romaji: "Tokutei kogata genbaiki-tsuki jitensha oyobi futsū jitensha sen'yō",
    english: "Specified small motorized bicycle and bicycles only",
    meaning: "① Designated as a cycle track or road exclusively for bicycles (road constructed for the passage of bicycles only).\n② Vehicles other than general motorized bicycles and regular bicycles, pedestrian and remote-control small-sized vehicle are prohibited.",
    exam_note: "Very new sign (2023 law change) – appears on recent tests"
  },
  {
    id: "reg-32",
    category: "Regulatory Signs",
    number: "32",
    japanese: "普通自転車及び歩行者専用",
    romaji: "Futsū jitensha oyobi hokōsha sen'yō",
    english: "Regular bicycles and pedestrians only",
    meaning: "① Designated exclusively for bicycles and pedestrians.\n② Vehicle other than specified small motorized bicycles and bicycles that are allowed to pass on bicycle road cannot drive.\n③ Designated sidewalk where specified motorized bicycle are permitted. (Refer to p.27 for regular bicycle)",
    exam_note: "Often paired with the blue bicycle/pedestrian symbol"
  },
  {
    id: "reg-33",
    category: "Regulatory Signs",
    number: "33",
    japanese: "歩行者専用",
    romaji: "Hokōsha sen'yō",
    english: "Pedestrians only",
    meaning: "① Road constructed exclusively for pedestrians.\n② Road designated for pedestrians.",
    exam_note: "Bicycles are NOT allowed unless a separate sign permits"
  },
  {
    id: "reg-34",
    category: "Regulatory Signs",
    number: "34",
    japanese: "許可車両のみ通行可",
    romaji: "Kyoka sharyō nomi tsūkō ka",
    english: "Permitted vehicles only",
    meaning: "Indicates the vehicle stop facility (terminal) of the displayed motor vehicle with the permission of the road administrator.",
    exam_note: "Shows pictures of route bus, chartered bus, taxi, truck, etc."
  },
  {
    id: "reg-35",
    category: "Regulatory Signs",
    number: "35",
    japanese: "許可車両のみ通行可（組み合わせ）",
    romaji: "Kyoka sharyō nomi tsūkō ka (kumiawase)",
    english: "Permitted vehicles only (combination)",
    meaning: "Indicates the vehicle stop facility for the displayed motor vehicles (in this case bus and taxi) with the road administrator's permission.",
    exam_note: ""
  },
  {
    id: "reg-36",
    category: "Regulatory Signs",
    number: "36",
    japanese: "大規模災害時緊急車両のみ",
    romaji: "Daikibo saigai-ji kinkyū sharyō nomi",
    english: "Wide-area disaster emergency response vehicle only",
    meaning: "It can only be used by vehicles and people that the road administrator deems necessary to implement wide-area disaster emergency response.",
    exam_note: "Rare but appears on newer tests"
  },
  {
    id: "reg-37",
    category: "Regulatory Signs",
    number: "37",
    japanese: "一方通行",
    romaji: "Ippō tsūkō",
    english: "One-way",
    meaning: "Vehicles must travel only in the direction indicated by the arrow.",
    exam_note: "Extremely common – know you can't enter against the arrow"
  },
  {
    id: "reg-38",
    category: "Regulatory Signs",
    number: "38",
    japanese: "特定小型原動機付自転車及び普通自転車の一方通行",
    romaji: "Tokutei kogata genbaiki-tsuki jitensha oyobi futsū jitensha no ippō tsūkō",
    english: "Specified small motorized bicycle and bicycle's one-way",
    meaning: "Specified small motorized bicycle and bicycle must travel only in the direction indicated by the arrow.",
    exam_note: "New 2023 sign"
  },
  {
    id: "reg-39",
    category: "Regulatory Signs",
    number: "39",
    japanese: "車線",
    romaji: "Shasen",
    english: "Lane designation",
    meaning: "Vehicles must travel in the lane indicated by the lane designation sign.",
    exam_note: ""
  },
  {
    id: "reg-40",
    category: "Regulatory Signs",
    number: "40",
    japanese: "特定の種類の車両の車線",
    romaji: "Tokutei no shurui no sharyō no shasen",
    english: "Lane designation for specific types of vehicles",
    meaning: "Large-size trucks, specific medium-size trucks and special heavy equipment must travel in the far left-hand lane.",
    exam_note: "Very common on expressways"
  },
  {
    id: "reg-41",
    category: "Regulatory Signs",
    number: "41",
    japanese: "牽引自動車の車線",
    romaji: "Ken'in jidōsha no shasen",
    english: "National expressway lane designation for towing motor vehicles",
    meaning: "Towing motor vehicles must travel in the lane indicated by the lane designation sign.",
    exam_note: "Towing vehicles = trucks pulling trailers"
  },
  {
    id: "reg-42",
    category: "Regulatory Signs",
    number: "42",
    japanese: "専用通行帯",
    romaji: "Sen'yō tsūkō-tai",
    english: "Exclusive lane",
    meaning: "Exclusive lane for vehicles indicated by the sign.",
    exam_note: "Examples shown: bus lane, taxi lane, etc."
  },
  {
    id: "reg-43",
    category: "Regulatory Signs",
    number: "43",
    japanese: "普通自転車専用通行帯",
    romaji: "Futsū jitensha sen'yō tsūkō-tai",
    english: "Exclusive lane for regular bicycles",
    meaning: "Indicates exclusive lane for regular bicycles.",
    exam_note: ""
  },
  {
    id: "reg-44",
    category: "Regulatory Signs",
    number: "44",
    japanese: "路線バス等優先通行帯",
    romaji: "Rosen basu tō yūsen tsūkō-tai",
    english: "Priority lane for buses",
    meaning: "Indicates a lane where route buses, etc. have priority.",
    exam_note: "Cars may use it but must yield to buses"
  },
  {
    id: "reg-45",
    category: "Regulatory Signs",
    number: "45",
    japanese: "進行方向別通行区分",
    romaji: "Shinkō hōkō-betsu tsūkō kubun",
    english: "Direction-specific lane control",
    meaning: "Vehicles must proceed only in the direction(s) indicated by the arrow(s) in each lane.",
    exam_note: "One of the most frequently tested regulatory signs"
  },
  {
    id: "reg-46",
    category: "Regulatory Signs",
    number: "46",
    japanese: "原動機付自転車二段階右折",
    romaji: "Gendōki-tsuki jitensha ni-dankai migi-kōten",
    english: "Two-stage right turn for motorized bicycles",
    meaning: "Class-1 motorized bicycles (50cc and under) must make a two-stage right turn at intersections.",
    exam_note: "Extremely common question"
  },
  {
    id: "reg-47",
    category: "Regulatory Signs",
    number: "47",
    japanese: "原動機付自転車二段階右折（小）",
    romaji: "Gendōki-tsuki jitensha ni-dankai migi-kōten (shō)",
    english: "Two-stage right turn for motorized bicycles (small)",
    meaning: "Same meaning as No.46 but smaller auxiliary version.",
    exam_note: ""
  },
  {
    id: "reg-48",
    category: "Regulatory Signs",
    number: "48",
    japanese: "原付通行可（小）",
    romaji: "Gen-tsuki tsūkō ka (shō)",
    english: "Motorized bicycles permitted (small)",
    meaning: "Motorized bicycles are permitted to pass even when pedestrian-only or bicycle-only signs are displayed.",
    exam_note: "Auxiliary sign"
  },
  {
    id: "reg-49",
    category: "Regulatory Signs",
    number: "49",
    japanese: "徐行",
    romaji: "Jokō",
    english: "Slow down",
    meaning: "Drivers must slow down and be ready to stop immediately if necessary.",
    exam_note: "Very common – often appears with school zones"
  },
  {
    id: "reg-50",
    category: "Regulatory Signs",
    number: "50",
    japanese: "一時停止",
    romaji: "Ichiji teishi",
    english: "Stop",
    meaning: "Drivers must come to a complete stop at the stop line or just before entering the intersection.",
    exam_note: "Highest priority regulatory sign – must stop even if no one is coming"
  },
  {
    id: "reg-51",
    category: "Regulatory Signs",
    number: "51",
    japanese: "優先道路",
    romaji: "Yūsen dōro",
    english: "Priority road",
    meaning: "The road you are on has priority over intersecting roads.",
    exam_note: "Vehicles on the priority road do NOT need to yield"
  },
  {
    id: "reg-52",
    category: "Regulatory Signs",
    number: "52",
    japanese: "幅員減少",
    romaji: "Fukuin genshō",
    english: "Road narrows",
    meaning: "The width of the roadway ahead becomes narrower.",
    exam_note: ""
  },
  {
    id: "reg-53",
    category: "Regulatory Signs",
    number: "53",
    japanese: "環状交差点進行可",
    romaji: "Kanjō kōsaten shinkō ka",
    english: "Roundabout – proceed",
    meaning: "Vehicles may proceed through the roundabout.",
    exam_note: "Blue circle with white circular arrow"
  },
  {
    id: "reg-54",
    category: "Regulatory Signs",
    number: "54",
    japanese: "環状の交差点における右回り通行",
    romaji: "Kanjō no kōsaten ni okeru migi-mawari tsūkō",
    english: "Circulate clockwise in roundabout",
    meaning: "Vehicles inside the roundabout must travel clockwise.",
    exam_note: ""
  },
  {
    id: "reg-55",
    category: "Regulatory Signs",
    number: "55",
    japanese: "指定方向外進行禁止",
    romaji: "Shitei hōkō-gai shinkō kinshi",
    english: "No entry except in designated direction",
    meaning: "Vehicles must not proceed in any direction other than the one indicated by the arrow.",
    exam_note: "Red circle with white horizontal bar"
  },
  // Add remaining regulatory signs (56-59) - placeholder structure
  {
    id: "reg-56",
    category: "Regulatory Signs",
    number: "56",
    japanese: "指定方向外進行禁止（左折可）",
    romaji: "Shitei hōkō-gai shinkō kinshi (sasetsu ka)",
    english: "No entry except straight and left turn",
    meaning: "Vehicles must proceed straight or turn left only.",
    exam_note: ""
  },
  {
    id: "reg-57",
    category: "Regulatory Signs",
    number: "57",
    japanese: "指定方向外進行禁止（右折可）",
    romaji: "Shitei hōkō-gai shinkō kinshi (migi-setsu ka)",
    english: "No entry except straight and right turn",
    meaning: "Vehicles must proceed straight or turn right only.",
    exam_note: ""
  },
  {
    id: "reg-58",
    category: "Regulatory Signs",
    number: "58",
    japanese: "指定方向外進行禁止（直進可）",
    romaji: "Shitei hōkō-gai shinkō kinshi (chokushin ka)",
    english: "No entry except straight",
    meaning: "Vehicles must proceed straight only. Left and right turns are prohibited.",
    exam_note: ""
  },
  {
    id: "reg-59",
    category: "Regulatory Signs",
    number: "59",
    japanese: "指定方向外進行禁止（左右可）",
    romaji: "Shitei hōkō-gai shinkō kinshi (sayū ka)",
    english: "Either direction O.K.",
    meaning: "Vehicles may proceed in either direction (left or right).",
    exam_note: ""
  }
];

// Indication Signs Data (14 signs)
const INDICATION_SIGNS: SignData[] = [
  {
    id: "ind-01",
    category: "Indication Signs",
    number: "1",
    japanese: "並進可",
    romaji: "Heishin ka",
    english: "Riding abreast permitted",
    meaning: "Bicycles are permitted to travel side by side.",
    exam_note: ""
  },
  {
    id: "ind-02",
    category: "Indication Signs",
    number: "2",
    japanese: "軌道敷内通行可",
    romaji: "Kidōjiki-nai tsūkō ka",
    english: "Driving on streetcar tracks permitted",
    meaning: "Motor vehicles can drive on the streetcar tracks (restricted to motor vehicles designated by auxiliary sign).",
    exam_note: ""
  },
  {
    id: "ind-03",
    category: "Indication Signs",
    number: "3",
    japanese: "高齢運転者等標章自動車駐車可",
    romaji: "Kōrei untensha-tō hyōshō jidōsha chūsha ka",
    english: "Parking permitted for motor vehicles with senior driver's sign, etc.",
    meaning: "Motor vehicles with senior driver's sign, etc. are permitted to park. (Refer to p262 for motor vehicles with senior driver's sign, etc.)",
    exam_note: ""
  },
  {
    id: "ind-04",
    category: "Indication Signs",
    number: "4",
    japanese: "駐車可",
    romaji: "Chūsha ka",
    english: "Parking permitted",
    meaning: "Vehicles are permitted to park.",
    exam_note: ""
  },
  {
    id: "ind-05",
    category: "Indication Signs",
    number: "5",
    japanese: "高齢運転者等標章自動車停車可",
    romaji: "Kōrei untensha-tō hyōshō jidōsha teisha ka",
    english: "Stopping permitted for motor vehicles with senior driver's sign, etc.",
    meaning: "Motor vehicles with senior driver's sign, etc. are permitted to stop. (Refer to p262 for motor vehicles with senior driver's sign, etc.)",
    exam_note: ""
  },
  {
    id: "ind-06",
    category: "Indication Signs",
    number: "6",
    japanese: "停車可",
    romaji: "Teisha ka",
    english: "Stopping permitted",
    meaning: "Vehicles are permitted to stop.",
    exam_note: ""
  },
  {
    id: "ind-07",
    category: "Indication Signs",
    number: "7",
    japanese: "優先道路",
    romaji: "Yūsen dōro",
    english: "Right-of-way",
    meaning: "Indicates the road has the right of way.",
    exam_note: ""
  },
  {
    id: "ind-08",
    category: "Indication Signs",
    number: "8",
    japanese: "中央線",
    romaji: "Chūōsen",
    english: "Centerline",
    meaning: "Indicates the center of the road or centerline.",
    exam_note: ""
  },
  {
    id: "ind-09",
    category: "Indication Signs",
    number: "9",
    japanese: "停止線",
    romaji: "Teishi-sen",
    english: "Stop line",
    meaning: "Indicates the line where vehicles are required to stop.",
    exam_note: ""
  },
  {
    id: "ind-10",
    category: "Indication Signs",
    number: "10",
    japanese: "横断歩道",
    romaji: "Ōdan hodō",
    english: "Pedestrian crossing",
    meaning: "Indicates the pedestrian crossing.",
    exam_note: ""
  },
  {
    id: "ind-11",
    category: "Indication Signs",
    number: "11",
    japanese: "自転車横断帯",
    romaji: "Jitensha ōdan-tai",
    english: "Bicycle crossing zone",
    meaning: "Indicates the bicycle crossing zone.",
    exam_note: ""
  },
  {
    id: "ind-12",
    category: "Indication Signs",
    number: "12",
    japanese: "横断歩道・自転車横断帯",
    romaji: "Ōdan hodō / Jitensha ōdan-tai",
    english: "Pedestrian crossing and bicycle crossing zone",
    meaning: "Indicates the pedestrian crossing and the bicycle crossing zone.",
    exam_note: ""
  },
  {
    id: "ind-13",
    category: "Indication Signs",
    number: "13",
    japanese: "安全地帯",
    romaji: "Anzen chitai",
    english: "Safety zone",
    meaning: "Indicates a safety zone.",
    exam_note: ""
  },
  {
    id: "ind-14",
    category: "Indication Signs",
    number: "14",
    japanese: "規制予告",
    romaji: "Kisei yokoku",
    english: "Advance warning",
    meaning: "Indicates advance warning that there is a traffic regulation ahead on the road.",
    exam_note: ""
  }
];

// Warning Signs Data (26 signs provided, 52 total expected)
const WARNING_SIGNS: SignData[] = [
  {
    id: "warn-01",
    category: "Warning Signs",
    number: "1",
    japanese: "交差点あり",
    romaji: "Kōsaten ari",
    english: "Intersection",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-02",
    category: "Warning Signs",
    number: "2",
    japanese: "右（左）方道路合流",
    romaji: "Migi (hidari) hō dōro gōryū",
    english: "Road Branch Right (or Left)",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-03",
    category: "Warning Signs",
    number: "3",
    japanese: "Ｔ字路",
    romaji: "T-jirō",
    english: "T Intersection",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-04",
    category: "Warning Signs",
    number: "4",
    japanese: "Ｙ字路",
    romaji: "Y-jirō",
    english: "Y-Junction",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-05",
    category: "Warning Signs",
    number: "5",
    japanese: "ロータリーあり",
    romaji: "Rōtari ari",
    english: "Rotary",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-06",
    category: "Warning Signs",
    number: "6",
    japanese: "右（左）方屈曲",
    romaji: "Migi (hidari) hō kukyoku",
    english: "Right (Left) Bend",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-07",
    category: "Warning Signs",
    number: "7",
    japanese: "右（左）方屈折",
    romaji: "Migi (hidari) hō kussetsu",
    english: "Sharp Right (Left) Turn",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-08",
    category: "Warning Signs",
    number: "8",
    japanese: "右（左）連続屈曲",
    romaji: "Migi (hidari) renzoku kukyoku",
    english: "Right (Left) Double Bend",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-09",
    category: "Warning Signs",
    number: "9",
    japanese: "右（左）方鋭角屈曲",
    romaji: "Migi (hidari) hō eikaku kukyoku",
    english: "Sharp Right (Left) Double Turn",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-10",
    category: "Warning Signs",
    number: "10",
    japanese: "蛇行道路",
    romaji: "Jakō dōro",
    english: "Zigzag Road",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-11",
    category: "Warning Signs",
    number: "11",
    japanese: "踏切あり",
    romaji: "Fumikiri ari",
    english: "Railway Crossing",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-12",
    category: "Warning Signs",
    number: "12",
    japanese: "学校、幼稚園、保育園あり",
    romaji: "Gakkō, yōchien, hoikuen ari",
    english: "School, Kindergarten, Nursery",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-13",
    category: "Warning Signs",
    number: "13",
    japanese: "信号機あり",
    romaji: "Shingōki ari",
    english: "Traffic Signal",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-14",
    category: "Warning Signs",
    number: "14",
    japanese: "すべりやすい",
    romaji: "Suberiyasui",
    english: "Slippery Road",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-15",
    category: "Warning Signs",
    number: "15",
    japanese: "落石のおそれあり",
    romaji: "Rakuseki no osore ari",
    english: "Falling or fallen rock",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-16",
    category: "Warning Signs",
    number: "16",
    japanese: "くぼみあり",
    romaji: "Kubomi ari",
    english: "Hump or Dip",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-17",
    category: "Warning Signs",
    number: "17",
    japanese: "左（右）方道路進入",
    romaji: "Hidari (migi) hō dōro shinnyū",
    english: "Road Entry Left",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-18",
    category: "Warning Signs",
    number: "18",
    japanese: "車線減少",
    romaji: "Shasen genshō",
    english: "Fewer Lanes",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-19",
    category: "Warning Signs",
    number: "19",
    japanese: "幅員減少",
    romaji: "Fukuin genshō",
    english: "Road Narrows",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-20",
    category: "Warning Signs",
    number: "20",
    japanese: "二方向交通",
    romaji: "Ni-hōkō kōtsū",
    english: "Two-way Traffic",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-21",
    category: "Warning Signs",
    number: "21",
    japanese: "上り急勾配",
    romaji: "Nobori kyū kōhai",
    english: "Steep Upgrade",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-22",
    category: "Warning Signs",
    number: "22",
    japanese: "下り急勾配",
    romaji: "Kudari kyū kōhai",
    english: "Steep Downgrade",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-23",
    category: "Warning Signs",
    number: "23",
    japanese: "工事中",
    romaji: "Kōji-chū",
    english: "Road Construction",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-24",
    category: "Warning Signs",
    number: "24",
    japanese: "横風注意",
    romaji: "Yokofū chūi",
    english: "Side Winds",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-25",
    category: "Warning Signs",
    number: "25",
    japanese: "動物横断",
    romaji: "Dōbutsu ōdan",
    english: "Animal Crossing",
    meaning: "",
    exam_note: ""
  },
  {
    id: "warn-26",
    category: "Warning Signs",
    number: "26",
    japanese: "その他の危険",
    romaji: "Sono hoka no kiken",
    english: "Other Dangers",
    meaning: "",
    exam_note: ""
  }
];

// Guidance Signs Data (39 signs)
const GUIDANCE_SIGNS: SignData[] = [
  {
    id: "guide-01",
    category: "Guidance Signs",
    number: "1",
    japanese: "市町村",
    romaji: "Shichōson",
    english: "Municipality",
    meaning: "Indicates the name of the city, town or village",
    exam_note: ""
  },
  {
    id: "guide-02",
    category: "Guidance Signs",
    number: "2",
    japanese: "都道府県",
    romaji: "Todōfuken",
    english: "Prefecture",
    meaning: "Indicates the name of the prefecture",
    exam_note: ""
  },
  {
    id: "guide-03",
    category: "Guidance Signs",
    number: "3",
    japanese: "都道府県",
    romaji: "Todōfuken",
    english: "Prefecture",
    meaning: "Indicates the name of the prefecture (different design)",
    exam_note: ""
  },
  {
    id: "guide-04",
    category: "Guidance Signs",
    number: "4",
    japanese: "高速自動車国道等方面",
    romaji: "Kōsoku jidōsha kokudō-tō hōmen",
    english: "Direction to Expressway",
    meaning: "Shows direction and distance to expressway entrance",
    exam_note: ""
  },
  {
    id: "guide-05",
    category: "Guidance Signs",
    number: "5",
    japanese: "高速自動車国道等予告",
    romaji: "Kōsoku jidōsha kokudō-tō yokoku",
    english: "Advance notice of entrance to Expressway",
    meaning: "Advance notice of upcoming expressway entrance",
    exam_note: ""
  },
  {
    id: "guide-06",
    category: "Guidance Signs",
    number: "6",
    japanese: "総重量緩和指定道路",
    romaji: "Sōjūryō kanwa shitei dōro",
    english: "Designated road with alleviated total weight limit",
    meaning: "Road where higher total vehicle weight is permitted",
    exam_note: ""
  },
  {
    id: "guide-07",
    category: "Guidance Signs",
    number: "7",
    japanese: "高さ制限なし道路",
    romaji: "Takasa seigen nashi dōro",
    english: "No height restriction road",
    meaning: "Road with no height restriction",
    exam_note: ""
  },
  {
    id: "guide-08",
    category: "Guidance Signs",
    number: "8",
    japanese: "方面及び距離",
    romaji: "Hōmen oyobi kyori",
    english: "Direction and distance",
    meaning: "Shows direction and distance to destinations",
    exam_note: ""
  },
  {
    id: "guide-09",
    category: "Guidance Signs",
    number: "9",
    japanese: "方面及び車線",
    romaji: "Hōmen oyobi shasen",
    english: "Direction and lane",
    meaning: "Shows direction and recommended lane",
    exam_note: ""
  },
  {
    id: "guide-10",
    category: "Guidance Signs",
    number: "10",
    japanese: "出口予告",
    romaji: "Deguchi yokoku",
    english: "Advance notice of exit",
    meaning: "Advance notice of upcoming exit",
    exam_note: ""
  },
  {
    id: "guide-11",
    category: "Guidance Signs",
    number: "11",
    japanese: "方面、方向及び道路の予告",
    romaji: "Hōmen, hōkō oyobi dōro no yokoku",
    english: "Advance notice of destination and direction",
    meaning: "Advance notice of destination and direction",
    exam_note: ""
  },
  {
    id: "guide-12",
    category: "Guidance Signs",
    number: "12",
    japanese: "方面及び方向",
    romaji: "Hōmen oyobi hōkō",
    english: "Destination and direction",
    meaning: "Shows destination and direction",
    exam_note: ""
  },
  {
    id: "guide-13",
    category: "Guidance Signs",
    number: "13",
    japanese: "方面、方向及び距離",
    romaji: "Hōmen, hōkō oyobi kyori",
    english: "Direction, bearings and distance",
    meaning: "Shows direction, bearings and distance to places",
    exam_note: ""
  },
  {
    id: "guide-14",
    category: "Guidance Signs",
    number: "14",
    japanese: "方面及び方向の予告",
    romaji: "Hōmen oyobi hōkō no yokoku",
    english: "Advance notice of direction and road name",
    meaning: "Advance notice of direction and road name",
    exam_note: ""
  },
  {
    id: "guide-15",
    category: "Guidance Signs",
    number: "15",
    japanese: "方面及び道路名",
    romaji: "Hōmen oyobi dōromei",
    english: "Direction and road name",
    meaning: "Shows direction and road name",
    exam_note: ""
  },
  {
    id: "guide-16",
    category: "Guidance Signs",
    number: "16",
    japanese: "方向及び出口の予告",
    romaji: "Hōkō oyobi deguchi no yokoku",
    english: "Advance notice of direction and exit",
    meaning: "Advance notice of direction and exit",
    exam_note: ""
  },
  {
    id: "guide-17",
    category: "Guidance Signs",
    number: "17",
    japanese: "方面、車線及び出口の予告",
    romaji: "Hōmen, shasen oyobi deguchi no yokoku",
    english: "Advance notice of direction, lane and exit",
    meaning: "Advance notice of direction, lane and exit",
    exam_note: ""
  },
  {
    id: "guide-18",
    category: "Guidance Signs",
    number: "18",
    japanese: "方面及び出口",
    romaji: "Hōmen oyobi deguchi",
    english: "Direction and exit",
    meaning: "Shows direction and exit",
    exam_note: ""
  },
  {
    id: "guide-19",
    category: "Guidance Signs",
    number: "19",
    japanese: "出口",
    romaji: "Deguchi",
    english: "Exit",
    meaning: "Indicates the exit",
    exam_note: ""
  },
  {
    id: "guide-20",
    category: "Guidance Signs",
    number: "20",
    japanese: "著名地点",
    romaji: "Chomei chiten",
    english: "Landmark",
    meaning: "Shows famous or important locations",
    exam_note: ""
  },
  {
    id: "guide-21",
    category: "Guidance Signs",
    number: "21",
    japanese: "著名地点",
    romaji: "Chomei chiten",
    english: "Major location",
    meaning: "Shows major locations",
    exam_note: ""
  },
  {
    id: "guide-22",
    category: "Guidance Signs",
    number: "22",
    japanese: "料金所",
    romaji: "Ryōkinjo",
    english: "Toll gate",
    meaning: "Indicates toll gate ahead",
    exam_note: ""
  },
  {
    id: "guide-23",
    category: "Guidance Signs",
    number: "23",
    japanese: "非常施設・路側駅等までの距離",
    romaji: "Hijō shisetsu, rosoku-eki-tō made no kyori",
    english: "Distances to Service areas, Roadside stations",
    meaning: "Shows distances to service areas and roadside stations",
    exam_note: ""
  },
  {
    id: "guide-24",
    category: "Guidance Signs",
    number: "24",
    japanese: "非常施設・路側駅等予告",
    romaji: "Hijō shisetsu, rosoku-eki-tō yokoku",
    english: "Advance notice of Service areas, Roadside stations",
    meaning: "Advance notice of service areas and roadside stations",
    exam_note: ""
  },
  {
    id: "guide-25",
    category: "Guidance Signs",
    number: "25",
    japanese: "サービスエリア",
    romaji: "Sābisu eria",
    english: "Service area",
    meaning: "Indicates service area (rest area on expressway)",
    exam_note: ""
  },
  {
    id: "guide-26",
    category: "Guidance Signs",
    number: "26",
    japanese: "非常電話",
    romaji: "Hijō denwa",
    english: "Emergency telephone",
    meaning: "Indicates location of emergency telephone",
    exam_note: ""
  },
  {
    id: "guide-27",
    category: "Guidance Signs",
    number: "27",
    japanese: "待避所",
    romaji: "Taihisho",
    english: "Shelter",
    meaning: "Indicates shelter or turnout",
    exam_note: ""
  },
  {
    id: "guide-28",
    category: "Guidance Signs",
    number: "28",
    japanese: "非常駐車帯",
    romaji: "Hijō chūshatai",
    english: "Emergency parking zone",
    meaning: "Emergency parking zone on expressway",
    exam_note: ""
  },
  {
    id: "guide-29",
    category: "Guidance Signs",
    number: "29",
    japanese: "駐車場",
    romaji: "Chūshajō",
    english: "Parking",
    meaning: "Indicates parking area",
    exam_note: ""
  },
  {
    id: "guide-30",
    category: "Guidance Signs",
    number: "30",
    japanese: "本線車道への入口",
    romaji: "Honsen shadō e no iriguchi",
    english: "Entrance to main traffic lane from a service area or a parking lot",
    meaning: "Entrance to main traffic lane from service area/parking lot",
    exam_note: ""
  },
  {
    id: "guide-31",
    category: "Guidance Signs",
    number: "31",
    japanese: "登坂車線",
    romaji: "Tōhan shasen",
    english: "Slower traffic / Climbing lane",
    meaning: "Indicates slower traffic or climbing lane",
    exam_note: ""
  },
  {
    id: "guide-32",
    category: "Guidance Signs",
    number: "32",
    japanese: "国道番号",
    romaji: "Kokudō bangō",
    english: "National route number",
    meaning: "Shows national route number",
    exam_note: ""
  },
  {
    id: "guide-33",
    category: "Guidance Signs",
    number: "33",
    japanese: "都道府県道番号",
    romaji: "Todōfuken-dō bangō",
    english: "Prefectural route number",
    meaning: "Shows prefectural route number",
    exam_note: ""
  },
  {
    id: "guide-34",
    category: "Guidance Signs",
    number: "34",
    japanese: "高速自動車国道番号",
    romaji: "Kōsoku jidōsha kokudō bangō",
    english: "Number of the expressway",
    meaning: "Expressway route number (E + number or C + number)",
    exam_note: ""
  },
  {
    id: "guide-35",
    category: "Guidance Signs",
    number: "35",
    japanese: "道路名",
    romaji: "Dōromei",
    english: "Road name",
    meaning: "Shows the name of the road",
    exam_note: ""
  },
  {
    id: "guide-36",
    category: "Guidance Signs",
    number: "36",
    japanese: "う回",
    romaji: "Ukai",
    english: "Detour",
    meaning: "Indicates detour route",
    exam_note: ""
  },
  {
    id: "guide-37",
    category: "Guidance Signs",
    number: "37",
    japanese: "勾配",
    romaji: "Kōbai",
    english: "Sloping road",
    meaning: "Indicates sloping road (gradient)",
    exam_note: ""
  },
  {
    id: "guide-38",
    category: "Guidance Signs",
    number: "38",
    japanese: "バス停",
    romaji: "Basu-tei",
    english: "Bus stop",
    meaning: "Indicates bus stop",
    exam_note: ""
  },
  {
    id: "guide-39",
    category: "Guidance Signs",
    number: "39",
    japanese: "電車停留場",
    romaji: "Densha teiryūjo",
    english: "Train stop / Tram stop",
    meaning: "Indicates train or tram stop",
    exam_note: ""
  }
];

// Flashcard categories with sign data
const FLASHCARD_CATEGORIES = {
  'regulatory-signs': {
    name: 'Regulatory Signs (規制標識)',
    description: 'Traffic signs and regulatory signs',
    signs: REGULATORY_SIGNS
  },
  'warning-signs': {
    name: 'Warning Signs (警戒標識)',
    description: 'Warning and caution signs',
    signs: WARNING_SIGNS
  },
  'indication-signs': {
    name: 'Indication Signs (指示標識)',
    description: 'Directional and informational signs',
    signs: INDICATION_SIGNS
  },
  'road-markings': {
    name: 'Road Markings (道路標示)',
    description: 'Pavement markings and lane indicators',
    signs: [] // Will be populated with 29 regulatory markings
  },
  'traffic-signals': {
    name: 'Traffic Signals (信号機)',
    description: 'Traffic lights and signal meanings',
    signs: [] // Will be populated
  },
  'guidance-signs': {
    name: 'Guidance Signs (案内標識)',
    description: 'Guidance and information signs',
    signs: GUIDANCE_SIGNS
  },
  'auxiliary-signs': {
    name: 'Auxiliary Signs (補助標識)',
    description: 'Auxiliary plates and supplementary signs',
    signs: [] // Will be populated with 21 signs
  },
  'instruction-signs': {
    name: 'Instruction Signs (指示標識)',
    description: 'Directional and informational signs',
    signs: [] // Will be populated
  }
};

// Build image query from sign data
function buildImageQuery(sign: SignData): string {
  return `${sign.english.toLowerCase()} japan ${sign.japanese}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 10 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${count} flashcards for category: ${category}`);

    // Get category info
    const categoryInfo = FLASHCARD_CATEGORIES[category as keyof typeof FLASHCARD_CATEGORIES];
    if (!categoryInfo) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Get signs for this category
    const availableSigns = categoryInfo.signs || [];
    
    if (availableSigns.length === 0) {
      throw new Error(`No signs available for category: ${category}. Please ensure sign data is loaded.`);
    }

    // Select random signs from the category
    const shuffledSigns = [...availableSigns].sort(() => Math.random() - 0.5);
    const selectedSigns = shuffledSigns.slice(0, Math.min(count, availableSigns.length));

    console.log(`Selected ${selectedSigns.length} signs from ${availableSigns.length} available`);

    // Generate flashcards from sign data
    const flashcards = selectedSigns.map((sign) => {
      const imageQuery = buildImageQuery(sign);
      
      return {
        imageQuery,
        question: `What does this sign mean? (${sign.japanese})`,
        answer: `${sign.english} (${sign.japanese} - ${sign.romaji}). ${sign.meaning}`,
        explanation: sign.exam_note 
          ? `${sign.meaning}\n\n📝 Exam Note: ${sign.exam_note}`
          : sign.meaning,
        signData: sign
      };
    });

    // Fetch/generate images for each flashcard
    console.log(`Fetching/generating images for ${flashcards.length} flashcards...`);
    const flashcardsWithImages = await Promise.all(
      flashcards.map(async (flashcard) => {
        let imageUrl = null;
        
        // Try Google AI Studio first (via Lovable gateway)
        imageUrl = await generateImageWithLovableGateway(flashcard.signData);
        
        // Fallback to Serper API if Google AI Studio fails
        if (!imageUrl) {
          imageUrl = await fetchImage(flashcard.imageQuery);
        }

        return {
          ...flashcard,
          imageUrl
        };
      })
    );

    console.log(`Generated ${flashcardsWithImages.length} flashcards with ${flashcardsWithImages.filter(f => f.imageUrl).length} images`);

    return new Response(
      JSON.stringify({ 
        flashcards: flashcardsWithImages,
        category: categoryInfo.name,
        count: flashcardsWithImages.length,
        totalAvailable: availableSigns.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-flashcards function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
