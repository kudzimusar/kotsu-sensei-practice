import { ArrowLeft, AlertTriangle, BookOpen, FileText, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Tips = () => {
  const navigate = useNavigate();

  const keyTerms = [
    { phrase: "must / must not", importance: "Indicates a legal obligation or prohibition. These are often absolute, so confirm whether there are exceptions." },
    { phrase: "always / never / absolutely", importance: "Very strong wording — such statements are more likely to be false if there are any exceptions under Japanese traffic law." },
    { phrase: "may / may not", importance: "More permissive — you need to check if it's \"allowed\" vs \"required.\" Sometimes \"may\" means you are permitted but not required." },
    { phrase: "required to", importance: "Similar to \"must\"; shows a legal requirement." },
    { phrase: "unless", importance: "Watch this carefully. If the sentence has \"unless …,\" that's often where the exception lies." },
    { phrase: "if / when / as long as", importance: "Conditional phrasing — you need to read the full condition to know whether the rule applies in that situation." },
    { phrase: "within 5 m, for more than 30 seconds, at least 50 km/h", importance: "Very precise. These numeric conditions often come up in traffic-law questions, so don't skim; misreading \"within\" vs \"at least\" can flip the answer." },
    { phrase: "only when / only if", importance: "Restricts the condition; often used to test whether you understand exactly when a rule applies." },
    { phrase: "stopping distance, reaction distance, hydroplaning, skid", importance: "These might appear in safe-driving / risk-management questions. Know what they mean and how they apply." },
  ];

  const japaneseVocab = [
    { japanese: "止まれ", romaji: "Tomare", meaning: "\"Stop\" sign. Important to know for stop-line rules." },
    { japanese: "駐車禁止", romaji: "Chūsha kinshi", meaning: "No parking." },
    { japanese: "駐停車禁止", romaji: "Chūteisha kinshi", meaning: "No stopping / parking (stopping is prohibited)." },
    { japanese: "優先", romaji: "Yūsen", meaning: "Priority / right-of-way (often used on signs marking priority roads)." },
    { japanese: "一時停止", romaji: "Ichiji teishi", meaning: "Temporary stop (\"stop for a moment\"); used in stop-line / yield contexts." },
    { japanese: "徐行", romaji: "Jokō", meaning: "Slow go / proceed slowly. Means you must slow down (not full stop) in certain areas." },
    { japanese: "追越し禁止", romaji: "Oikoshi kinshi", meaning: "No overtaking / passing." },
    { japanese: "踏切", romaji: "Fumikiri", meaning: "Railroad / level crossing. 踏切注意 often indicates a crossing ahead." },
    { japanese: "速度制限", romaji: "Sokudo seigen", meaning: "Speed limit." },
    { japanese: "方向指示", romaji: "Hōkō shiji", meaning: "Direction indication / turn signal signs." },
    { japanese: "危険", romaji: "Kiken", meaning: "Danger / warning (appears on warning signs)." },
  ];

  const exampleQuestions = [
    { question: "When passing another vehicle, you may exceed the posted speed limit for a short time.", answer: false, explanation: "You are never allowed to exceed the speed limit, even when overtaking." },
    { question: "When driving through a tunnel, you must always turn on your headlights.", answer: true, explanation: "This is a required safety behavior. In Japan, headlights must be on in tunnels." },
    { question: "You may stop temporarily in a \"no parking\" zone to let passengers in or out.", answer: true, explanation: "Short stops (\"drop-off / pick-up\") are permitted in many \"no parking\" (駐車禁止) zones, but you can't leave the vehicle unattended." },
    { question: "At an intersection without signals or signs, the car on the left has the right of way.", answer: false, explanation: "In Japan, when there is no traffic light or sign, the vehicle on the right generally has priority." },
    { question: "When an emergency vehicle is approaching with its siren on, you must move to the left side of the road and stop.", answer: true, explanation: "This is a common rule: pull over left and stop to let the emergency vehicle pass." },
    { question: "You must not stop or park within 5 meters of a pedestrian crossing.", answer: true, explanation: "Parking or stopping too close to crosswalks (横断歩道) is illegal because it blocks visibility." },
  ];

  const testTakingTips = [
    { title: "Read the full sentence", description: "Because some English translations are direct / awkward, make sure you parse the entire meaning, not just the first few words. Practice-test sources mention \"weird or confusing English\" in some questions." },
    { title: "Understand Japanese sign names", description: "Even if the question is in English, knowing the Japanese terms for signs helps a lot (especially on diagram-based questions)." },
    { title: "Use up-to-date study material", description: "The test format changed recently — as of October 2025, it's 50 true/false questions with a 90% passing rate for license conversion." },
    { title: "Practice with English + Japanese", description: "Try to practice with materials that show both English and Japanese versions; this helps you understand nuance and reduces confusion on translation." },
    { title: "Be wary of \"strong\" words", description: "Pay extra attention when a question says \"always,\" \"never,\" \"must,\" or \"only if.\" These often indicate legal absolutes, but real laws might have exceptions, so test questions could be false depending on context." },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-2">Test Tips & Strategies</h1>
        </div>
      </header>

      <main className="px-4 pt-16 pb-6">
        {/* Intro Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-emerald-900 mb-1">Pass Your Test!</h2>
              <p className="text-sm text-emerald-700">
                Since you're taking the test in English but need to know Japanese traffic signs, here are key tips to help you succeed.
              </p>
            </div>
          </div>
        </Card>

        <Accordion type="single" collapsible className="space-y-3">
          {/* Key English Terms */}
          <AccordionItem value="terms" className="bg-white rounded-xl shadow-sm border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Key English Terms to Watch</h3>
                  <p className="text-xs text-gray-500">Tricky wording in test questions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {keyTerms.map((term, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-2">
                      {term.phrase}
                    </Badge>
                    <p className="text-xs text-gray-600">{term.importance}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Japanese Vocabulary */}
          <AccordionItem value="vocab" className="bg-white rounded-xl shadow-sm border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-red-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Japanese Sign Vocabulary</h3>
                  <p className="text-xs text-gray-500">Essential terms to know</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {japaneseVocab.map((vocab, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg font-bold text-red-700">{vocab.japanese}</span>
                      <span className="text-xs text-gray-500">({vocab.romaji})</span>
                    </div>
                    <p className="text-xs text-gray-600">{vocab.meaning}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Example Questions */}
          <AccordionItem value="examples" className="bg-white rounded-xl shadow-sm border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Example True/False Questions</h3>
                  <p className="text-xs text-gray-500">Practice with real test-style questions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {exampleQuestions.map((q, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-800 mb-3">{index + 1}. {q.question}</p>
                    <div className="flex items-center gap-2 mb-2">
                      {q.answer ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          TRUE
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="w-3 h-3 mr-1" />
                          FALSE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-blue-400">
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Test-Taking Tips */}
          <AccordionItem value="tips" className="bg-white rounded-xl shadow-sm border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="text-amber-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Test-Taking Strategies</h3>
                  <p className="text-xs text-gray-500">Tips for exam day success</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {testTakingTips.map((tip, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-amber-800">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-800 mb-1">{tip.title}</h4>
                        <p className="text-xs text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Quick Reference Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 mt-6">
          <h3 className="font-bold mb-3">Quick Reference: Test Format</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-xs mb-1">Questions</p>
              <p className="font-bold">50 True/False</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-xs mb-1">Passing Score</p>
              <p className="font-bold">90% (45/50)</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-xs mb-1">Time Limit</p>
              <p className="font-bold">30 minutes</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-xs mb-1">Language</p>
              <p className="font-bold">English available</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Tips;
