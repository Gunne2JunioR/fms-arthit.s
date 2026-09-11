"use client";

import { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Download, 
  ExternalLink, 
  Search, 
  Clock, 
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AcademicEvent {
  id: string;
  titleTh: string;
  titleEn: string;
  category: "admission" | "registration" | "exam" | "event";
  term: "1/2567" | "2/2567" | "summer/2567";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  dateBeTextTh: string;
  dateBeTextEn: string;
  descriptionTh: string;
  descriptionEn: string;
  status: "upcoming" | "active" | "passed";
}

const SAMPLE_EVENTS: AcademicEvent[] = [
  {
    id: "tcas-1",
    titleTh: "รับสมัครคัดเลือก TCAS รอบที่ 1 Portfolio",
    titleEn: "TCAS Round 1: Portfolio Application",
    category: "admission",
    term: "1/2567",
    startDate: "2024-10-01",
    endDate: "2024-12-15",
    dateBeTextTh: "1 ต.ค. - 15 ธ.ค. 2567",
    dateBeTextEn: "1 Oct - 15 Dec 2024 (BE 2567)",
    descriptionTh: "เปิดรับสมัครนักเรียนชั้น ม.6 ยื่นแฟ้มสะสมผลงาน ทุกสาขาวิชา",
    descriptionEn: "Portfolio submission for High School seniors across all undergraduate programs",
    status: "upcoming",
  },
  {
    id: "reg-1",
    titleTh: "ลงทะเบียนเรียนและชำระค่าธรรมเนียมการศึกษา ภาค 1/2567",
    titleEn: "Course Registration & Tuition Payment Term 1/2024",
    category: "registration",
    term: "1/2567",
    startDate: "2024-07-15",
    endDate: "2024-07-28",
    dateBeTextTh: "15 - 28 ก.ค. 2567",
    dateBeTextEn: "15 - 28 Jul 2024 (BE 2567)",
    descriptionTh: "ลงทะเบียนออนไลน์ผ่านระบบทะเบียนนักศึกษา และชำระค่าเทอมผ่าน Mobile Banking",
    descriptionEn: "Online registration through student portal and tuition payment via Mobile Banking",
    status: "passed",
  },
  {
    id: "add-drop-1",
    titleTh: "ขอเพิ่ม-ถอนรายวิชา (Add/Drop) โดยไม่บันทึก W",
    titleEn: "Course Add/Drop Period (Without Record W)",
    category: "registration",
    term: "1/2567",
    startDate: "2024-08-05",
    endDate: "2024-08-18",
    dateBeTextTh: "5 - 18 ส.ค. 2567",
    dateBeTextEn: "5 - 18 Aug 2024 (BE 2567)",
    descriptionTh: "ปรับเปลี่ยนรายวิชาได้โดยไม่มีค่าปรับและไม่บันทึกอักษร W บนใบทรานสคริปต์",
    descriptionEn: "Adjust enrolled courses without academic penalty",
    status: "passed",
  },
  {
    id: "midterm-1",
    titleTh: "การสอบกลางภาค ภาคการศึกษาที่ 1/2567",
    titleEn: "Midterm Examinations Term 1/2024",
    category: "exam",
    term: "1/2567",
    startDate: "2024-09-23",
    endDate: "2024-09-29",
    dateBeTextTh: "23 - 29 ก.ย. 2567",
    dateBeTextEn: "23 - 29 Sep 2024 (BE 2567)",
    descriptionTh: "การสอบวัดผลกลางภาค ณ ห้องเรียนประจำคณะและออนไลน์ตามประกาศ",
    descriptionEn: "On-site and hybrid midterm evaluation sessions according to faculty timetable",
    status: "active",
  },
  {
    id: "final-1",
    titleTh: "การสอบปลายภาค ภาคการศึกษาที่ 1/2567",
    titleEn: "Final Examinations Term 1/2024",
    category: "exam",
    term: "1/2567",
    startDate: "2024-11-18",
    endDate: "2024-11-30",
    dateBeTextTh: "18 - 30 พ.ย. 2567",
    dateBeTextEn: "18 - 30 Nov 2024 (BE 2567)",
    descriptionTh: "การสอบวัดผลปลายภาคการศึกษา พร้อมประกาศผลการเรียนภายใน 15 วัน",
    descriptionEn: "Final evaluations; grades will be published within 15 days following completion",
    status: "upcoming",
  },
  {
    id: "tcas-2",
    titleTh: "รับสมัครคัดเลือก TCAS รอบที่ 2 Quota โควตาภาคและโรงเรียน",
    titleEn: "TCAS Round 2: Quota Application",
    category: "admission",
    term: "2/2567",
    startDate: "2025-02-15",
    endDate: "2025-03-31",
    dateBeTextTh: "15 ก.พ. - 31 มี.ค. 2568",
    dateBeTextEn: "15 Feb - 31 Mar 2025 (BE 2568)",
    descriptionTh: "โควตานักเรียนเรียนดี โควตากีฬา และโควตาโรงเรียนเครือข่ายความร่วมมือ",
    descriptionEn: "Regional quota, athletic scholarships, and partner high school quota",
    status: "upcoming",
  },
  {
    id: "commence-1",
    titleTh: "พิธีพระราชทานปริญญาบัตร ประจำปีการศึกษา 2567",
    titleEn: "Commencement Ceremony Academic Year 2024 (BE 2567)",
    category: "event",
    term: "2/2567",
    startDate: "2025-01-20",
    endDate: "2025-01-22",
    dateBeTextTh: "20 - 22 ม.ค. 2568",
    dateBeTextEn: "20 - 22 Jan 2025 (BE 2568)",
    descriptionTh: "พิธีพระราชทานปริญญาบัตรแก่ดุษฎีบัณฑิต มหาบัณฑิต และบัณฑิตคณะ",
    descriptionEn: "Commencement and degree conferral ceremony for graduating classes",
    status: "upcoming",
  }
];

export function CalendarClient({ locale }: { locale: "th" | "en" | "cn" }) {

  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isEn = locale === "en";

  const filteredEvents = useMemo(() => {
    return SAMPLE_EVENTS.filter((e) => {
      if (selectedTerm !== "all" && e.term !== selectedTerm) return false;
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTh = e.titleTh.toLowerCase().includes(q) || e.descriptionTh.toLowerCase().includes(q);
        const matchEn = e.titleEn.toLowerCase().includes(q) || e.descriptionEn.toLowerCase().includes(q);
        return matchTh || matchEn;
      }
      return true;
    });
  }, [selectedTerm, selectedCategory, searchQuery]);

  // Generate .ICS file for Apple/Outlook/Google Calendar
  const downloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Faculty of Management and IT//Academic Calendar 2567//TH",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    SAMPLE_EVENTS.forEach((e) => {
      const dtStart = e.startDate.replace(/-/g, "") + "T090000";
      const dtEnd = e.endDate.replace(/-/g, "") + "T170000";
      const summary = isEn ? e.titleEn : e.titleTh;
      const desc = isEn ? e.descriptionEn : e.descriptionTh;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:fms-${e.id}@faculty.university.ac.th`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc} [BE: ${e.dateBeTextTh}]`,
        "LOCATION:Faculty of Management and Information Technology",
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `academic-calendar-${new Date().getFullYear()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = (e: AcademicEvent) => {
    const title = encodeURIComponent(isEn ? e.titleEn : e.titleTh);
    const details = encodeURIComponent(
      (isEn ? e.descriptionEn : e.descriptionTh) + `\n(พ.ศ.: ${e.dateBeTextTh})`
    );
    const dtStart = e.startDate.replace(/-/g, "") + "T090000";
    const dtEnd = e.endDate.replace(/-/g, "") + "T170000";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=Faculty+of+Management+and+IT`;
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "admission":
        return {
          label: isEn ? "Admissions" : "การรับสมัคร",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "registration":
        return {
          label: isEn ? "Registration" : "การลงทะเบียน",
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "exam":
        return {
          label: isEn ? "Exams" : "การสอบ",
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "event":
      default:
        return {
          label: isEn ? "Events & Ceremony" : "กิจกรรม & พิธีการ",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {isEn ? "In Progress" : "กำลังดำเนินการ"}
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {isEn ? "Upcoming" : "เร็วๆ นี้"}
          </span>
        );
      case "passed":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {isEn ? "Completed" : "สิ้นสุดแล้ว"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar: Sync & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isEn ? "Sync to Your Personal Calendar" : "เชื่อมต่อปฏิทินส่วนตัวของคุณ"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEn
                ? "Download .ICS file for Apple Calendar, Outlook, or sync events into Google Calendar"
                : "ดาวน์โหลดไฟล์ .ICS สำหรับ Apple Calendar, Outlook หรือส่งข้อมูลตรงเข้า Google Calendar"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={downloadIcs} variant="outline" size="sm" className="gap-2 text-xs h-9">
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{isEn ? "Export .ICS" : "ดาวน์โหลดปฏิทิน (.ics)"}</span>
          </Button>
          <Button
            onClick={() => window.open("https://calendar.google.com", "_blank")}
            size="sm"
            className="gap-2 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isEn ? "Open Google Calendar" : "เปิด Google Calendar"}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isEn ? "Search calendar events..." : "ค้นหากำหนดการ, TCAS, สอบ..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Term and Category Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {/* Term Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-muted/40 text-xs">
            {["all", "1/2567", "2/2567"].map((tId) => (
              <button
                key={tId}
                onClick={() => setSelectedTerm(tId)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  selectedTerm === tId
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tId === "all" ? (isEn ? "All Terms" : "ทุกภาค") : tId}
              </button>
            ))}
          </div>

          {[
            { id: "all", labelTh: "ทั้งหมด", labelEn: "All" },
            { id: "admission", labelTh: "การรับสมัคร", labelEn: "Admissions" },
            { id: "registration", labelTh: "การลงทะเบียน", labelEn: "Registration" },
            { id: "exam", labelTh: "การสอบ", labelEn: "Exams" },
            { id: "event", labelTh: "กิจกรรม", labelEn: "Events" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? cat.labelEn : cat.labelTh}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed bg-card/40 space-y-2">
            <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground font-medium">
              {isEn ? "No matching academic events found" : "ไม่พบกำหนดการที่ค้นหา"}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const catBadge = getCategoryBadge(event.category);
            return (
              <div
                key={event.id}
                className="group relative rounded-2xl border bg-card p-5 sm:p-6 transition-all hover:shadow-md hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Date Badge */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 shrink-0 text-center p-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {event.startDate.split("-")[1]} / {event.startDate.split("-")[0]}
                    </span>
                    <span className="text-xl font-black text-foreground">
                      {event.startDate.split("-")[2]}
                    </span>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {isEn ? "START" : "เริ่ม"}
                    </span>
                  </div>

                  {/* Middle: Details */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${catBadge.color}`}
                      >
                        {catBadge.label}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {isEn ? `Term ${event.term}` : `ภาค ${event.term}`}
                      </span>
                      {getStatusPill(event.status)}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {isEn ? event.titleEn : event.titleTh}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {isEn ? event.descriptionEn : event.descriptionTh}
                    </p>

                    {/* Buddhist Era & CE Date indicator */}
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 pt-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? event.dateBeTextEn : `พ.ศ. ${event.dateBeTextTh}`}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors shadow-xs"
                    title={isEn ? "Add event to Google Calendar" : "เพิ่มรายการนี้ลงใน Google Calendar"}
                  >
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span>{isEn ? "Add to G-Cal" : "บันทึกใน G-Cal"}</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
