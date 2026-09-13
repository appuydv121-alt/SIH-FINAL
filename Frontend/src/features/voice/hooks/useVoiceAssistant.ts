import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import type { VoiceLanguageCode, VoiceStatusState, InterpretResult } from "../types/voice.types";
import { voiceApi } from "../services/voiceApi";

const ENTITY_ROUTE_MAP: Record<string, string> = {
  WATER_JUGS: "/games/water-jugs",
  TOWER_OF_HANOI: "/games/tower-of-hanoi",
  BALL_SORT: "/games/ball-sort",
  MEMORY_MATCH: "/games/card-matching",
  NUMBER_PUZZLE: "/games/number-sequence",
  WORD_PUZZLE: "/games/word-scramble",
  MAZE: "/games/maze",
  STROOP: "/games/stroop",
  QUICK_MATH: "/games/quick-math",
  SCHULTE_TABLE: "/games/schulte-table",
  DUAL_TASK: "/games/dual-task",
  VISUAL_SEARCH: "/games/visual-search",
  PATTERN_MATRIX: "/games/pattern-matrix",
  REACTION_TIME: "/games/reaction-time",
  SIMON_SAYS: "/games/simon-says",
  TRAIL_MAKING: "/games/trail-making",
  ANAGRAM_SOLVER: "/games/anagram-solver",
  DELAYED_RECALL: "/games/delayed-recall",
  LOGIC_PUZZLES: "/games/logic-puzzles",
  MENTAL_ROTATION: "/games/mental-rotation",
  N_BACK: "/games/n-back",
};

const ENTITY_NAME_MAP: Record<string, Record<string, string>> = {
  WATER_JUGS: {
    en: "Water Jugs",
    hi: "वॉटर जग",
    as: "পানীৰ জগ",
    bn: "ওয়াটার জাগ",
    ne: "पानीको जग",
  },
  TOWER_OF_HANOI: {
    en: "Tower of Hanoi",
    hi: "टावर ऑफ हनोई",
    as: "হানোই",
    bn: "হ্যানয়",
    ne: "टावर अफ हनोई",
  },
  BALL_SORT: {
    en: "Ball Sort Puzzle",
    hi: "बॉल सॉर्ट",
    as: "বল সৰ্ট",
    bn: "বল সাজানো",
    ne: "बल सर्ट",
  },
  MEMORY_MATCH: {
    en: "Card Matching Memory",
    hi: "मेमोरी कार्ड मैच",
    as: "মেমৰি কাৰ্ড",
    bn: "স্মৃতি মেমরি",
    ne: "मेमोरी म्याच",
  },
  NUMBER_PUZZLE: {
    en: "Number Sequence",
    hi: "नंबर पहेली",
    as: "সংখ্যা খেল",
    bn: "সংখ্যার ধাঁধা",
    ne: "नम्बर पजल",
  },
  WORD_PUZZLE: {
    en: "Word Scramble",
    hi: "शब्द पहेली",
    as: "শব্দ খেল",
    bn: "শব্দ ধাঁধা",
    ne: "शब्द पजल",
  },
  MAZE: { en: "Pathway Maze", hi: "भूलभुलैया", as: "রাস্তা খেল", bn: "গোলকধাঁধা", ne: "भुलभुलैया" },
  STROOP: {
    en: "Stroop Test",
    hi: "स्ट्रूप कलर टेस्ट",
    as: "ৰং পৰীক্ষা",
    bn: "রঙের খেলা",
    ne: "रङ्ग परीक्षण",
  },
  QUICK_MATH: {
    en: "Quick Math",
    hi: "क्विक मैथ",
    as: "দ্ৰুত অংক",
    bn: "দ্রুত গণিত",
    ne: "छिटो गणित",
  },
};

export function useVoiceAssistant(
  initialLanguage: VoiceLanguageCode = "en-IN",
  onAutoClose?: () => void,
) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const onAutoCloseRef = useRef(onAutoClose);
  useEffect(() => {
    onAutoCloseRef.current = onAutoClose;
  }, [onAutoClose]);

  const triggerAutoClose = useCallback((delay = 250) => {
    window.setTimeout(() => {
      try {
        onAutoCloseRef.current?.();
      } catch {
        // ignore
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("smritisetu:close-voice"));
      }
    }, delay);
  }, []);

  const [language, setLanguage] = useState<VoiceLanguageCode>(initialLanguage);
  const [status, setStatus] = useState<VoiceStatusState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready to listen. Tap the microphone.",
  );
  const [transcript, setTranscript] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [lastIntent, setLastIntent] = useState<InterpretResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const nativeTranscriptRef = useRef<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const monitorTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const shortLang = language.slice(0, 2);

  const speak = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;

      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
        } catch {
          // ignore
        }
        currentAudioRef.current = null;
      }

      setStatus("speaking");

      // 1. Try Sarvam TTS first for supported natural Indic languages
      const sarvamTtsLanguages = new Set([
        "en-IN", "hi-IN", "bn-IN", "ta-IN", "te-IN",
        "kn-IN", "ml-IN", "mr-IN", "gu-IN", "pa-IN", "od-IN"
      ]);

      if (sarvamTtsLanguages.has(language)) {
        try {
          const audioB64 = await voiceApi.synthesizeSpeech(text, language);
          if (audioB64 && audioB64.length > 500) {
            const binary = atob(audioB64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            currentAudioRef.current = audio;

            let isDone = false;
            const finish = () => {
              if (isDone) return;
              isDone = true;
              URL.revokeObjectURL(url);
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
              setStatus("idle");
            };

            const safetyTimeout = window.setTimeout(finish, 14000);

            audio.onended = () => {
              clearTimeout(safetyTimeout);
              finish();
            };
            audio.onerror = () => {
              clearTimeout(safetyTimeout);
              finish();
            };

            await audio.play();
            return;
          }
        } catch {
          // fallback to browser speech synthesis
        }
      }

      // 2. Browser SpeechSynthesis fallback
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          utterance.rate = 0.92;

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const langPrefix = language.slice(0, 2).toLowerCase();
            const matchedVoice =
              voices.find((v) => v.lang.toLowerCase() === language.toLowerCase()) ||
              voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
          }

          let synthDone = false;
          const finishSynth = () => {
            if (synthDone) return;
            synthDone = true;
            setStatus("idle");
          };

          const synthSafety = window.setTimeout(finishSynth, 10000);

          utterance.onend = () => {
            clearTimeout(synthSafety);
            finishSynth();
          };
          utterance.onerror = () => {
            clearTimeout(synthSafety);
            finishSynth();
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          setStatus("idle");
        }
      } else {
        setStatus("idle");
      }
    },
    [language],
  );

  const executeCommand = useCallback(
    async (result: InterpretResult) => {
      setLastIntent(result);
      const l = shortLang;

      switch (result.intent) {
        case "OPEN_GAMES": {
          const resp =
            l === "hi"
              ? "गेम्स ट्रेनिंग सेंटर खोल रहा हूँ।"
              : l === "as"
                ? "খেলসমূহ কেন্দ্ৰ খুলি আছোঁ।"
                : l === "bn"
                  ? "গেম সেন্টার খুলছি।"
                  : l === "ne"
                    ? "खेल केन्द्र खोल्दैछु।"
                    : "Opening Cognitive Training Centre with 22 exercises.";
          setLastResponse(resp);
          setStatusMessage(resp);
          navigate({ to: "/games" });
          triggerAutoClose();
          await speak(resp);
          break;
        }

        case "OPEN_GAME": {
          const entity = result.entity || "WATER_JUGS";
          const route = ENTITY_ROUTE_MAP[entity] || "/games/water-jugs";
          const names = ENTITY_NAME_MAP[entity] || { en: "Selected Game", hi: "चुना गया खेल" };
          const name = names[l] || names["en"] || "Game";
          const resp =
            l === "hi"
              ? `${name} गेम खोल रहा हूँ।`
              : l === "as"
                ? `${name} খুলি আছোঁ।`
                : l === "bn"
                  ? `${name} গেম খুলছি।`
                  : l === "ne"
                    ? `${name} खेल खोल्दैछु।`
                    : `Opening ${name}.`;
          setLastResponse(resp);
          setStatusMessage(resp);
          navigate({ to: route as never });
          triggerAutoClose();
          await speak(resp);
          break;
        }

        case "NEXT_GAME": {
          const gameList = Object.keys(ENTITY_ROUTE_MAP);
          const randomGame = gameList[Math.floor(Math.random() * gameList.length)] || "WATER_JUGS";
          const route = ENTITY_ROUTE_MAP[randomGame];
          const names = ENTITY_NAME_MAP[randomGame] || { en: "Selected Game", hi: "चुना गया खेल" };
          const name = names[l] || names["en"] || "Game";
          const resp =
            l === "hi"
              ? `अगला खेल: ${name} खोल रहा हूँ।`
              : `Opening next game: ${name}.`;
          setLastResponse(resp);
          setStatusMessage(resp);
          navigate({ to: route as never });
          triggerAutoClose();
          await speak(resp);
          break;
        }

        case "OPEN_REMINDERS":
        case "TODAY_REMINDERS": {
          // 1. Immediately navigate to the routine page so the user sees their schedule
          navigate({ to: "/routine" });
          triggerAutoClose();

          // 2. Fetch live reminders dictation in the user's selected language
          setStatus("processing");
          setStatusMessage(
            l === "hi"
              ? "आपके आज के रिमाइंडर की जानकारी ला रहे हैं…"
              : "Fetching your reminders schedule…",
          );

          try {
            const dict = await voiceApi.getRemindersDictation(language, user?.id);
            let resp = "";
            if (dict && dict.dictation) {
              resp = dict.dictation;
            } else {
              resp =
                l === "hi"
                  ? "आज के रिमाइंडर और दवा का शेड्यूल खोल रहा हूँ।"
                  : l === "as"
                    ? "আজিৰ সোঁৱৰণী আৰু ঔষধ তালিকা খুলি আছোঁ।"
                    : l === "bn"
                      ? "আজকের রিমাইন্ডার ও ওষুধ তালিকা খুলছি।"
                      : "Opening your schedule and medication reminders.";
            }
            setLastResponse(resp);
            setStatusMessage(resp);
            await speak(resp);
          } catch {
            const fallbackResp =
              l === "hi"
                ? "आज के रिमाइंडर और दवा का शेड्यूल खोल दिया गया है।"
                : "Your daily reminders schedule has been opened.";
            setLastResponse(fallbackResp);
            setStatusMessage(fallbackResp);
            await speak(fallbackResp);
          }
          break;
        }

        case "NEXT_REMINDER": {
          navigate({ to: "/routine" });
          triggerAutoClose();

          try {
            const dict = await voiceApi.getRemindersDictation(language, user?.id);
            let resp = "";
            if (dict && dict.next_task) {
              const t = dict.next_task;
              resp =
                l === "hi"
                  ? `आपका अगला रिमाइंडर ${t.time} पर ${t.title} का है।`
                  : l === "as"
                    ? `আপোনাৰ পৰৱৰ্তী কাম হৈছে ${t.time}ত ${t.title}।`
                    : l === "bn"
                      ? `আপনার পরবর্তী রিমাইন্ডার হলো ${t.time} টায় ${t.title}।`
                      : l === "ne"
                        ? `तपाईंको अर्को रिमाइन्डर ${t.time} मा ${t.title} हो।`
                        : `Your next reminder is ${t.title} scheduled at ${t.time}.`;
            } else {
              resp =
                l === "hi"
                  ? "आज के लिए आपका कोई और बाकी काम नहीं है।"
                  : l === "as"
                    ? "আজিলৈ আপোনাৰ কোনো বাকী থকা কাম নাই।"
                    : l === "bn"
                      ? "আজকের জন্য আপনার আর কোনো বকেয়া কাজ নেই।"
                      : l === "ne"
                        ? "आजको लागि तपाईंको कुनै बाँकी काम छैन।"
                        : l === "te"
                          ? "ఈ రోజుకి మీకు ఇకపై పెండింగ్ పనులు ఏవీ లేవు."
                          : l === "ta"
                            ? "இன்று உங்களுக்கு வேறு நிலுவையில் உள்ள பணிகள் எதுவும் இல்லை."
                            : l === "mr"
                              ? "आज तुमच्यासाठी कोणतेही प्रलंबित काम उरलेले नाही."
                              : l === "gu"
                                ? "આજે તમારા માટે કોઈ બાકી કાર્યો નથી."
                                : "You have no more pending tasks scheduled for today.";
            }
            setLastResponse(resp);
            setStatusMessage(resp);
            await speak(resp);
          } catch {
            const resp =
              l === "hi"
                ? "आज के लिए आपका कोई और बाकी काम नहीं है।"
                : "You have no more pending tasks scheduled for today.";
            setLastResponse(resp);
            setStatusMessage(resp);
            await speak(resp);
          }
          break;
        }

        case "OPEN_PROGRESS": {
          const resp =
            l === "hi"
              ? "एआई कॉग्निटिव एनालिटिक्स और प्रोग्रेस रिपोर्ट खोल रहा हूँ।"
              : l === "as"
                ? "প্ৰগতি আৰু এনালাইটিক্স ৰিপোৰ্ট খুলি আছোঁ।"
                : l === "bn"
                  ? "কগনিটিভ অ্যানালিটিক্স রিপোর্ট খুলছি।"
                  : "Opening AI Cognitive Analytics dashboard.";
          setLastResponse(resp);
          setStatusMessage(resp);
          navigate({ to: "/analytics" });
          triggerAutoClose();
          await speak(resp);
          break;
        }

        case "OPEN_MEMORIES": {
          const resp =
            l === "hi"
              ? "पारिवारिक यादें और एल्बम खोल रहा हूँ।"
              : l === "as"
                ? "স্মৃতি আৰু ফটো এলবাম খুলি আছোঁ।"
                : l === "bn"
                  ? "স্মৃতি ও অ্যালবাম খুলছি।"
                  : "Opening your family memories album.";
          setLastResponse(resp);
          setStatusMessage(resp);
          navigate({ to: "/memories" });
          triggerAutoClose();
          await speak(resp);
          break;
        }

        case "OPEN_CAREGIVER": {
          if (user?.role === "caretaker" || user?.role === "doctor") {
            const resp =
              l === "hi"
                ? "केयरगिवर मॉनिटरिंग डैशबोर्ड खोल रहा हूँ।"
                : "Opening Caregiver monitoring dashboard.";
            setLastResponse(resp);
            setStatusMessage(resp);
            navigate({ to: "/caregiver" });
            triggerAutoClose();
            await speak(resp);
          } else {
            const resp =
              l === "hi"
                ? "यह पृष्ठ केवल देखभालकर्ता (Caretaker) के लिए उपलब्ध है।"
                : "Caregiver dashboard is accessible to authorized caretakers.";
            setLastResponse(resp);
            setStatusMessage(resp);
            await speak(resp);
          }
          break;
        }

        case "HELP": {
          setShowHelp(true);
          const resp =
            l === "hi"
              ? "आप कह सकते हैं: गेम खेलो, वॉटर जग खोलो, मेरे रिमाइंडर दिखाओ, या प्रोग्रेस दिखाओ।"
              : l === "as"
                ? "আপুনি ক'ব পাৰে: খেল খোলক, সোঁৱৰণী দেখুওৱা, বা প্ৰগতি দেখুওৱা।"
                : l === "bn"
                  ? "আপনি বলতে পারেন: গেম খেলুন, রিমাইন্ডার দেখান, বা প্রোগ্রেস দেখান।"
                  : "You can say: play games, open water jugs, show my reminders, or show my progress.";
          setLastResponse(resp);
          setStatusMessage(resp);
          await speak(resp);
          break;
        }

        default: {
          const resp =
            l === "hi"
              ? "क्षमा करें, मैं समझ नहीं पाया। आप 'गेम खेलो' या 'रिमाइंडर दिखाओ' कह सकते हैं।"
              : l === "as"
                ? "মই বুজি নাপালোঁ। 'খেল খোলক' বা 'সোঁৱৰণী দেখুওৱা' বুলি ক'ব পাৰে।"
                : l === "bn"
                  ? "বুঝতে পারিনি। 'গেম খেলুন' বা 'রিমাইন্ডার দেখান' বলতে পারেন।"
                  : "I didn't quite catch that. Try saying 'play games' or 'show my reminders'.";
          setLastResponse(resp);
          setStatusMessage(resp);
          await speak(resp);
          break;
        }
      }
    },
    [language, navigate, shortLang, speak, triggerAutoClose, user?.id, user?.role],
  );

  const processTextInput = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;
      const clean = text.trim();

      // Elder-friendly direct voice/text dismissal commands
      if (/^(close|exit|quit|band karo|बंद करो|बंद कर दो|বন্ধ করুন|বন্ধ কৰক|बन्द गर)$/i.test(clean)) {
        triggerAutoClose(50);
        setStatus("idle");
        return;
      }

      setTranscript(clean);
      setStatus("processing");
      setStatusMessage(
        shortLang === "hi"
          ? "आपकी बात समझ रहे हैं…"
          : shortLang === "as"
            ? "বুজি আছোঁ…"
            : shortLang === "bn"
              ? "বুঝছি…"
              : "Understanding your command…",
      );

      try {
        const result = await voiceApi.interpretText(clean, language);
        setStatus("success");
        await executeCommand(result);
      } catch {
        setStatus("error");
        setStatusMessage("Could not process command. Please try again.");
        toast.error("Could not interpret command");
      }
    },
    [executeCommand, language, shortLang, triggerAutoClose],
  );

  const cleanup = useCallback(() => {
    if (monitorTimerRef.current) {
      clearInterval(monitorTimerRef.current);
      monitorTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setStatus("processing");
      setStatusMessage(
        shortLang === "hi"
          ? "आपकी आवाज़ समझी जा रही है…"
          : shortLang === "as"
            ? "আপোনাৰ কথা বুজা হৈছে…"
            : shortLang === "bn"
              ? "আপনার কথা বোঝা হচ্ছে…"
              : "Processing your voice command…",
      );
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, [shortLang]);

  const startListening = useCallback(async () => {
    if (status === "listening") {
      stopListening();
      return;
    }

    cleanup();
    nativeTranscriptRef.current = "";

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setStatusMessage(
        "Voice recording is not supported in this browser. Please type your command.",
      );
      toast.error("Audio recording unsupported");
      return;
    }

    try {
      // 1. Immediately request microphone access (direct user gesture)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // 2. Dual Engine Part A: Start browser Web Speech Recognition for instant 0ms real-time feedback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          recognitionRef.current = rec;
          // Map language codes appropriately (e.g. Nepali in Google Speech is ne-NP)
          rec.lang = language === "ne-IN" ? "ne-NP" : language;
          rec.continuous = false;
          rec.interimResults = true;
          rec.maxAlternatives = 1;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rec.onresult = (event: any) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                final += res[0].transcript;
              } else {
                interim += res[0].transcript;
              }
            }
            const spoken = (final || interim).trim();
            if (spoken) {
              setTranscript(spoken);
              if (final) {
                nativeTranscriptRef.current = final.trim();
              }
            }
          };

          rec.onerror = () => {
            // Non-fatal: MediaRecorder + Sarvam STT runs concurrently as resilient backbone
          };

          rec.onend = () => {
            // If browser recognition captured full sentence, wrap up listening
            if (nativeTranscriptRef.current && mediaRecorderRef.current?.state === "recording") {
              stopListening();
            }
          };

          rec.start();
        } catch {
          // Native speech recognition unavailable or blocked, fallback cleanly to MediaRecorder + Sarvam
        }
      }

      // 3. Dual Engine Part B: Start MediaRecorder concurrently (Sarvam saaras:v3 backbone)
      const mime =
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        cleanup();
        setStatus("processing");
        setStatusMessage(
          shortLang === "hi"
            ? "आपकी बात समझ रहे हैं…"
            : shortLang === "as"
              ? "আপোনাৰ কথা বুজি আছোঁ…"
              : shortLang === "bn"
                ? "আপনার কথা বুঝছি…"
                : "Understanding your command…",
        );

        // Path A: If browser native speech recognition already transcribed the text, execute immediately! (0ms upload delay!)
        const fastTranscript = nativeTranscriptRef.current.trim();
        if (fastTranscript) {
          setTranscript(fastTranscript);
          await processTextInput(fastTranscript);
          return;
        }

        // Path B: Upload audioBlob to Sarvam saaras:v3 for 100% multilingual Indic speech accuracy
        try {
          const transcribedText = await voiceApi.transcribeAudio(audioBlob, language);
          if (transcribedText && transcribedText.trim()) {
            setTranscript(transcribedText.trim());
            await processTextInput(transcribedText.trim());
          } else {
            setStatus("idle");
            setStatusMessage(
              shortLang === "hi"
                ? "सुनने के लिए तैयार। बोलने के लिए माइक दबाएं, या नीचे कोई विकल्प चुनें।"
                : shortLang === "as"
                  ? "শুনিবলৈ সাজু। ক'বলৈ মাইক্ৰ'ফ'নত টিপক, বা তলৰ বিকল্প বাছক।"
                  : shortLang === "bn"
                    ? "শোনার জন্য প্রস্তুত। কথা বলতে মাইক্রোফোনে ট্যাপ করুন।"
                    : "Ready to listen. Tap the microphone to speak, or choose a command below.",
            );
          }
        } catch {
          setStatus("error");
          setStatusMessage("Could not understand voice. Please try again or type your command.");
        }
      };

      recorder.start(250);
      setStatus("listening");
      setStatusMessage(
        shortLang === "hi"
          ? "सुन रहा हूँ… बोलिए। समाप्त होने पर माइक दबाएं या रुकें।"
          : shortLang === "as"
            ? "শুনি আছোঁ… কওক। শেষ হ'লে মাইকত টিপক।"
            : shortLang === "bn"
              ? "শুনছি… বলুন। শেষ হলে মাইকে ট্যাপ করুন।"
              : "Listening… Speak now, then tap microphone to stop.",
      );

      // 4. Web Audio API energy monitoring with elder-friendly voice threshold
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const samples = new Uint8Array(analyser.fftSize);
        let heardSpeech = false;
        let speechStartTime = 0;
        let lastSound = Date.now();

        monitorTimerRef.current = window.setInterval(() => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
          analyser.getByteTimeDomainData(samples);
          let energy = 0;
          for (let i = 0; i < samples.length; i++) {
            energy += Math.abs(samples[i]! - 128);
          }
          const average = energy / samples.length;

          // Comfortable voice energy threshold (average > 2.2) to capture elder speech
          if (average > 2.2) {
            if (!heardSpeech) {
              speechStartTime = Date.now();
            }
            heardSpeech = true;
            lastSound = Date.now();
          }

          const now = Date.now();
          const speechDuration = heardSpeech ? now - speechStartTime : 0;

          // Auto-stop after at least 500ms of speech followed by 1400ms of silence
          if (heardSpeech && speechDuration > 500 && now - lastSound > 1400) {
            stopListening();
          }
        }, 80);
      } catch {
        // fallback to timer
      }

      // 5. 12-second max duration hard safety timeout (matches Project B standard)
      maxTimerRef.current = window.setTimeout(() => {
        stopListening();
      }, 12000);
    } catch (err: unknown) {
      cleanup();
      setStatus("error");
      const isDenied = (err as Error)?.name === "NotAllowedError";
      setStatusMessage(
        isDenied
          ? "Microphone access was denied. Please allow microphone permission in your browser address bar."
          : "Could not access microphone. Please try again or type your command below.",
      );
      toast.error(isDenied ? "Microphone permission denied" : "Microphone access error");
    }
  }, [cleanup, language, processTextInput, shortLang, status, stopListening]);

  useEffect(() => {
    return () => {
      cleanup();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [cleanup]);

  return {
    language,
    setLanguage,
    status,
    statusMessage,
    transcript,
    lastResponse,
    lastIntent,
    showHelp,
    setShowHelp,
    startListening,
    stopListening,
    processTextInput,
    speak,
    triggerAutoClose,
    closeModal: triggerAutoClose,
  };
}
