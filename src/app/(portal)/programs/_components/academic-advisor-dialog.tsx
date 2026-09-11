"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Bot, 
  Target, 
  Award, 
  BrainCircuit, 
  Zap, 
  X,
  Send,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProgramDto } from "@/features/curriculum";

export function AcademicAdvisorDialog({
  programs,
  locale,
}: {
  programs: ProgramDto[];
  locale: "th" | "en" | "cn";
}) {

  const [isOpen, setIsOpen] = useState(false);
  const isEn = locale === "en";

  // Form State
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["ai", "software"]);
  const [gpax, setGpax] = useState<number>(3.2);

  // Chat conversation inside advisor
  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: isEn
        ? "Hello! I am your AI Academic Advisor for the 2026 academic year. Share your interests, GPAX, or career aspirations, and I will tailor the perfect curriculum path for you."
        : "สวัสดีครับ! ผมคือ AI ที่ปรึกษาการศึกษาและหลักสูตรประจำปี 2567 - 2568 บอกความสนใจ เกรดเฉลี่ย หรือเป้าหมายอาชีพของคุณ เพื่อให้ผมแนะนำหลักสูตรและทุนการศึกษาที่เหมาะสมที่สุดให้คุณได้เลยครับ",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendMessage = () => {
    if (!inputQuestion.trim()) return;
    const userText = inputQuestion.trim();
    setInputQuestion("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    // Simulated Agentic AI reasoning response
    setTimeout(() => {
      let reply = "";
      if (userText.includes("ทุน") || userText.toLowerCase().includes("scholarship")) {
        reply = isEn
          ? `With your current GPAX of ${gpax.toFixed(2)}, you qualify to apply for the "Faculty Excellence Scholarship", which offers up to 50% tuition fee reduction for the first academic year!`
          : `จากเกรดเฉลี่ยสะสม ${gpax.toFixed(2)} ของคุณ มีสิทธิ์ยื่นขอ "ทุนการศึกษาเรียนดีคณะการจัดการและเทคโนโลยีสารสนเทศ" ซึ่งครอบคลุมส่วนลดค่าธรรมเนียมการศึกษา 50% ตลอดปีการศึกษาแรกครับ!`;
      } else if (userText.includes("งาน") || userText.toLowerCase().includes("career") || userText.toLowerCase().includes("job")) {
        reply = isEn
          ? "Our graduates boast a 96.8% employment rate within 4 months of graduation, with average starting compensation starting at 35,000 - 55,000 THB in cloud software and AI industry sectors."
          : "บัณฑิตของหลักสูตรมีอัตราการได้งานทำสูงถึง 96.8% ภายใน 4 เดือนหลังสำเร็จการศึกษา โดยมีฐานเงินเดือนเริ่มต้นเฉลี่ย 35,000 - 55,000 บาท ในสายงานพัฒนานวัตกรรมซอฟต์แวร์ คลาวด์ และปัญญาประดิษฐ์ครับ";
      } else {
        reply = isEn
          ? `Based on your profile, I recommend enrolling in the Bachelor of Science in Information Technology and AI. It includes 4 specialized tracks: Cloud & DevOps, Full-Stack AI Engineering, and Data Intelligence.`
          : `จากการประเมินความสนใจของคุณ ผมขอแนะนำหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและปัญญาประดิษฐ์ ซึ่งมีการเรียนการสอนเน้นโปรเจกต์จริง พร้อมโอกาสฝึกงานสหกิจศึกษากับบริษัทเทคโนโลยีชั้นนำครับ`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  // Rank programs based on selected interests
  const scoredPrograms = programs.map((p, idx) => {
    let score = 85;
    if (selectedInterests.includes("ai") && (p.nameEn.toLowerCase().includes("information") || p.nameTh.includes("เทคโนโลยี"))) {
      score += 12;
    }
    if (selectedInterests.includes("software") && (p.nameEn.toLowerCase().includes("science") || p.nameTh.includes("วิทยาการ"))) {
      score += 10;
    }
    if (selectedInterests.includes("marketing") && (p.nameEn.toLowerCase().includes("business") || p.nameTh.includes("บริหาร"))) {
      score += 11;
    }
    if (gpax >= 3.0) score += 3;
    score = Math.min(99, score - (idx * 4));

    return {
      ...p,
      matchScore: score,
      scholarshipEligible: gpax >= 3.25,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <>
      {/* Advisor Top CTA Card on Programs Page */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? "Agentic AI Academic Advisor 2026" : "AI ที่ปรึกษาการเลือกหลักสูตรอัจฉริยะ 2026"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {isEn ? "Find Your Ideal Curriculum & Career Path" : "ค้นหาหลักสูตรและเส้นทางอาชีพที่ตอบโจทย์ตัวคุณ"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isEn
                ? "Let our intelligent advisor analyze your strengths, GPAX, and target career to recommend matching bachelor degrees with tuition and scholarship projections."
                : "ให้ระบบ AI ช่วยวิเคราะห์ความถนัด เกรดเฉลี่ยสะสม และเป้าหมาย เพื่อจับคู่หลักสูตรที่ตรงใจที่สุด พร้อมประมาณการค่าเล่าเรียนและสิทธิ์รับทุน"}
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-2xl gap-2 font-bold px-6 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shrink-0"
          >
            <Bot className="w-5 h-5" />
            <span>{isEn ? "Launch AI Advisor" : "เริ่มปรึกษา AI Advisor"}</span>
          </Button>
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-card shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">
                    {isEn ? "AI Academic & Admission Advisor" : "AI ที่ปรึกษาหลักสูตรและการรับสมัคร"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Personalized 2026 Program Recommendation Engine" : "ระบบจับคู่หลักสูตรอัจฉริยะแบบเฉพาะบุคคล"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Interests & Attributes Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-5 rounded-2xl border">
              {/* Interests */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "1. What are your field interests?" : "1. สาขาวิชาและความสนใจของคุณ"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "ai", label: isEn ? "AI & Data Science" : "ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล" },
                    { id: "software", label: isEn ? "Software & Cloud" : "วิศวกรรมซอฟต์แวร์และคลาวด์" },
                    { id: "biz", label: isEn ? "Digital Business" : "นวัตกรรมธุรกิจดิจิทัล" },
                    { id: "marketing", label: isEn ? "Digital Marketing" : "การตลาดดิจิทัลและอีคอมเมิร์ซ" },
                  ].map((field) => {
                    const active = selectedInterests.includes(field.id);
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => toggleInterest(field.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-card border text-foreground/80 hover:bg-muted"
                        }`}
                      >
                        {field.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GPAX */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    <span>{isEn ? "2. GPAX Score" : "2. เกรดเฉลี่ย (GPAX)"}</span>
                  </span>
                  <span className="text-sm font-bold text-primary">{gpax.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={2.0}
                  max={4.0}
                  step={0.05}
                  value={gpax}
                  onChange={(e) => setGpax(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>2.00</span>
                  <span>3.00</span>
                  <span>4.00</span>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span>{isEn ? "Top Recommended Programs for You" : "หลักสูตรที่เหมาะสมที่สุดสำหรับคุณ"}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scoredPrograms.slice(0, 2).map((p) => {
                  const title = isEn ? p.nameEn : p.nameTh;
                  const degree = isEn ? p.degreeNameEn : p.degreeNameTh;
                  return (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl border-2 border-primary/40 bg-card hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-bold">
                          {p.code}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          <span>{p.matchScore}% Match</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-bold text-base text-foreground line-clamp-1">{title}</h5>
                        <p className="text-xs text-muted-foreground">{degree}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-xs">
                        <div>
                          <span className="text-[11px] text-muted-foreground">{isEn ? "Tuition" : "ค่าเทอม"}:</span>
                          <span className="font-bold text-foreground ml-1">
                            {Number(p.tuitionFeeSemester).toLocaleString()} ฿ / {isEn ? "term" : "เทอม"}
                          </span>
                        </div>
                        {p.scholarshipEligible && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Award className="w-3.5 h-3.5" />
                            <span>{isEn ? "Scholarship Eligible" : "มีสิทธิ์รับทุน 50%"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Chat Prompt */}
            <div className="border rounded-2xl p-4 bg-muted/20 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-primary" />
                <span>{isEn ? "Live Advisor Guidance" : "สนทนาและขอคำปรึกษาเพิ่มเติมกับ AI"}</span>
              </span>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card border text-foreground rounded-bl-none shadow-2xs"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isEn ? "Ask about admissions, TCAS rounds, careers, or scholarships..." : "ถามเกี่ยวกับเกณฑ์ TCAS, โอกาสได้งาน, หรือการเทียบโอน..."}
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-3 py-2 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="h-9 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
