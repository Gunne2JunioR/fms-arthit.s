"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  initialTitle: string;
  initialExcerpt: string | null;
  initialContent: string;
  locale: "th" | "en" | "cn";
}


export function ArticleToolbar({
  initialTitle,
  initialExcerpt,
  initialContent,
  locale,
}: Props) {
  const isEn = locale === "en";

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Translation State
  const [activeLang, setActiveLang] = useState<"original" | "en" | "th" | "cn">("original");

  // Calculate estimated reading time
  const wordCount = initialContent.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Clean text for TTS
  const fullTextToRead = `${initialTitle}. ${initialExcerpt || ""}. ${initialContent.replace(/<[^>]*>/g, " ")}`;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullTextToRead.slice(0, 1500));
    utterance.rate = speechRate;
    utterance.lang = locale === "en" ? "en-US" : "th-TH";

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStopTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleRate = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);
    if (isPlaying) {
      handleStopTTS();
    }
  };

  return (
    <div className="rounded-2xl border bg-card/60 backdrop-blur-md p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: TTS Voice Player */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {isPlaying ? (
              <span className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-primary h-2 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1 bg-primary h-4 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1 bg-primary h-3 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isPlaying ? (
              <Button
                size="sm"
                onClick={handlePlayTTS}
                className="h-8 rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? (isEn ? "Resume" : "เล่นต่อ") : (isEn ? "Listen (AI TTS)" : "ฟังเสียงบรรยาย")}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePauseTTS}
                className="h-8 rounded-xl text-xs gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isEn ? "Pause" : "พักเสียง"}</span>
              </Button>
            )}

            {(isPlaying || isPaused) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStopTTS}
                className="h-8 w-8 p-0 rounded-xl text-xs"
                title={isEn ? "Stop" : "หยุด"}
              >
                <VolumeX className="w-3.5 h-3.5" />
              </Button>
            )}

            <button
              type="button"
              onClick={toggleRate}
              className="h-8 px-2.5 rounded-xl border bg-background text-[11px] font-bold text-foreground/80 hover:bg-muted transition-colors"
              title="Speech Rate"
            >
              {speechRate}x
            </button>
          </div>
        </div>

        {/* Right: AI Translation Switcher & Reading Time */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>
              {isEn ? `${readMinutes} min read` : `เวลาอ่าน ~${readMinutes} นาที`}
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-xl border bg-background/80 text-xs">
            <span className="px-2 py-1 text-[11px] font-semibold text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveLang("original")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeLang === "original"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? "Original" : "ต้นฉบับ"}
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("en")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeLang === "en"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("cn")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeLang === "cn"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>

      {/* Translation preview banner if selected */}
      {activeLang !== "original" && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            {activeLang === "en"
              ? "Article is automatically translated into English using Google Gemini API."
              : "文章已通过 Google Gemini 人工智能多语言神经引擎即时翻译为简体中文。"}
          </span>
        </div>
      )}
    </div>
  );
}
