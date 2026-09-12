import type { NlpInterpretation, VoiceCommandExecutionResult, VoiceEntity } from "../types/voice";

// Entity to actual CuCove game route mapping
export const GAME_ENTITY_ROUTE_MAP: Record<
  string,
  { route: string; name: Record<string, string> }
> = {
  MEMORY_MATCH: {
    route: "/games/card-matching",
    name: {
      en: "Memory Match",
      hi: "मेमोरी मैच",
      as: "মেমৰি মেচ",
      bn: "মেমোরি ম্যাচ",
      mni: "মেমৰি মেচ",
      brx: "মেমৰি মেচ",
      ne: "मेमोरी म्याच",
    },
  },
  NUMBER_PUZZLE: {
    route: "/games/number-sequence",
    name: {
      en: "Number Puzzle",
      hi: "नंबर पज़ल",
      as: "নাম্বাৰ পাজল",
      bn: "নম্বর পাজল",
      mni: "নাম্বাৰ পাজল",
      brx: "নাম্বাৰ পাজল",
      ne: "नम्बर पजल",
    },
  },
  WORD_PUZZLE: {
    route: "/games/word-scramble",
    name: {
      en: "Word Scramble",
      hi: "वर्ड पज़ल",
      as: "শব্দ পাজল",
      bn: "শব্দ পাজল",
      mni: "শব্দ পাজল",
      brx: "শব্দ পাজল",
      ne: "शब्द पजल",
    },
  },
  TOWER_OF_HANOI: {
    route: "/games/tower-of-hanoi",
    name: {
      en: "Tower of Hanoi",
      hi: "टावर ऑफ हनोई",
      as: "হনয়ৰ টাৱাৰ",
      bn: "হ্যানয়ের টাওয়ার",
      mni: "হনয়গী টাৱাৰ",
      brx: "হানোই টাওয়ার",
      ne: "टावर अफ हनोई",
    },
  },
  STROOP: {
    route: "/games/stroop",
    name: {
      en: "Stroop Test",
      hi: "स्ट्रूप टेस्ट",
      as: "ষ্ট্ৰুপ টেষ্ট",
      bn: "স্ট্রুপ টেস্ট",
      mni: "স্ট্রুপ টেষ্ট",
      brx: "স্ট্রুপ টেষ্ট",
      ne: "स्ट्रूप टेस्ट",
    },
  },
  MAZE: {
    route: "/games/maze",
    name: {
      en: "Pathway Maze",
      hi: "भूलभुलैया",
      as: "মেক খেল",
      bn: "গোলকধাঁধা",
      mni: "ভুলভুলাইয়া",
      brx: "ভুলভুলাইয়া",
      ne: "भूलभुलैया",
    },
  },
  SIMON_SAYS: {
    route: "/games/simon-says",
    name: {
      en: "Simon Says",
      hi: "साइमन सेज",
      as: "চাইমন চেজ",
      bn: "সাইমন সেজ",
      mni: "সাইমন সেজ",
      brx: "সাইমন সেজ",
      ne: "साइमन सेज",
    },
  },
};

// Available game IDs for cycling through NEXT_GAME
export const REGISTERED_GAMES_LIST = [
  "MEMORY_MATCH",
  "NUMBER_PUZZLE",
  "WORD_PUZZLE",
  "TOWER_OF_HANOI",
  "STROOP",
  "MAZE",
  "SIMON_SAYS",
];

// Multilingual spoken response dictionaries
export const LOCALIZED_RESPONSES = {
  openGames: {
    en: "Opening Cognitive Training Center. You can choose from 22 brain exercises.",
    hi: "गेम्स केंद्र खोल रहा हूँ। आप 22 दिमागी खेलों में से कोई भी चुन सकते हैं।",
    as: "জ্ঞান বিকাশ কেন্দ্র খোলি আছোঁ। আপুনি ২২ টা খেলৰ পৰা বাছি ল'ব পাৰে।",
    bn: "কগনিটিভ গেমস সেন্টার খুলছি। আপনি ২২টি ব্যায়ামের মধ্যে বেছে নিতে পারেন।",
    mni: "খেল মফম থংনবা। নত্ত্রা ২২ খেলসিংদগী অমা থীজিনু।",
    brx: "গামি মফম থংনবা। নংগীর ২২ গামিসো বাছনো।",
    ne: "गेम केन्द्र खोल्दैछु। तपाईंका २२ वटा खेलहरू उपलब्ध छन्।",
  },
  openGame: {
    en: (name: string) => `Opening ${name}. Get ready to play!`,
    hi: (name: string) => `${name} खेल खोल रहा हूँ। खेलने के लिए तैयार हो जाइए!`,
    as: (name: string) => `${name} খেল খোলি আছোঁ। খেলিবলৈ সাজু হওক!`,
    bn: (name: string) => `${name} খুলছি। খেলার জন্য প্রস্তুত হন!`,
    mni: (name: string) => `${name} থীজিল্লে। শানবা সাজু ওইরিবা!`,
    brx: (name: string) => `${name} বাছ। শানবা সাজু!`,
    ne: (name: string) => `${name} खोल्दैछु। खेल्नका लागि तयार हुनुहोस्!`,
  },
  nextGame: {
    en: (name: string) => `Next game is ${name}. Navigating there now.`,
    hi: (name: string) => `अगला गेम है ${name}। अब वहाँ ले जा रहा हूँ।`,
    as: (name: string) => `পৰৱৰ্তী খেল: ${name}। এতিয়া তালৈ লৈ গৈ আছোঁ।`,
    bn: (name: string) => `পরের গেম হলো ${name}। সেখানে যাচ্ছি।`,
    mni: (name: string) => `মতম অদুগী খেল ${name}নি।`,
    brx: (name: string) => `গাবো গামি ${name}নি।`,
    ne: (name: string) => `अर्को खेल ${name} हो। त्यहाँ जाँदैछु।`,
  },
  openReminders: {
    en: "Opening your daily routine and schedule.",
    hi: "आपकी दैनिक दिनचर्या और कार्यों की सूची खोल रहा हूँ।",
    as: "আপোনাৰ দৈনিক ৰুটিন আৰু সোঁৱৰণী তালিকা খোলি আছোঁ।",
    bn: "আপনার দৈনিক রুটিন এবং রিমাইন্ডার তালিকা খুলছি।",
    mni: "নুমিদাংগী সোঁৱৰণী থীজিল্লে।",
    brx: "গাবোর রিমাইন্ডার বাছ।",
    ne: "तपाईंको दैनिक कार्य तालिका खोल्दैछु।",
  },
  todayReminders: {
    en: (summary: string) => `Today's schedule: ${summary}. Opening your routine.`,
    hi: (summary: string) => `आज का शेड्यूल: ${summary}। आपकी दिनचर्या खोल रहा हूँ।`,
    as: (summary: string) => `আজিৰ কাৰ্যসূচী: ${summary}। আপোনাৰ ৰুটিন খোলি আছোঁ।`,
    bn: (summary: string) => `আজকের সময়সূচী: ${summary}। আপনার রুটিন খুলছি।`,
    mni: (summary: string) => `নুমিদাংগী কাযর্নবী: ${summary}।`,
    brx: (summary: string) => `গাবোর খামনি: ${summary}।`,
    ne: (summary: string) => `आजको कार्यतालिका: ${summary}। तपाईंको तालिका खोल्दैछु।`,
  },
  nextReminder: {
    en: (item: string) => `Your next scheduled activity is: ${item}.`,
    hi: (item: string) => `आपका अगला निर्धारित कार्य है: ${item}।`,
    as: (item: string) => `আপোনাৰ পৰৱৰ্তী নিৰ্ধাৰিত কাম: ${item}।`,
    bn: (item: string) => `আপনার পরের নির্ধারিত কাজ: ${item}।`,
    mni: (item: string) => `নত্ত্রা মতম অদুগী সোঁৱৰণী: ${item}।`,
    brx: (item: string) => `নংগীর গাবো রিমাইন্ডার: ${item}।`,
    ne: (item: string) => `तपाईंको अर्को निर्धारित कार्य: ${item}।`,
  },
  openMedications: {
    en: "Opening your medicine timeline and prescriptions.",
    hi: "आपकी दवाओं का शेड्यूल और प्रिस्क्रिप्शन खोल रहा हूँ।",
    as: "আপোনাৰ ঔষধৰ সময়সূচী খোলি আছোঁ।",
    bn: "আপনার ওষুধের সময়সূচী খুলছি।",
    mni: "ওয়াঠোক চক্লু মফম।",
    brx: "দাও খাও মফম।",
    ne: "औषधि तालिका खोल्दैछु।",
  },
  goHome: {
    en: "Navigating to home dashboard.",
    hi: "मुख्य डैशबोर्ड पर जा रहा हूँ।",
    as: "মূল ডেচব’ৰ্ডলৈ গৈ আছোঁ।",
    bn: "মূল ড্যাশবোর্ডে ফিরে যাচ্ছি।",
    mni: "হোম পেজদা চৎলে।",
    brx: "হোম পেজাও থাং।",
    ne: "गृहपृष्ठमा जाँदैछु।",
  },
  openAnalytics: {
    en: "Opening your cognitive progress and assessment report.",
    hi: "आपकी संज्ञानात्मक प्रगति और रिपोर्ट खोल रहा हूँ।",
    as: "আপোনাৰ প্ৰগতি আৰু মূল্যায়ন প্ৰতিবেদন খোলি আছোঁ।",
    bn: "আপনার মানসিক প্রগতি ও মূল্যায়ন রিপোর্ট খুলছি।",
    mni: "প্ৰগতি ৰিপোৰ্ট।",
    brx: "উন্নতি রিপোর্ট।",
    ne: "प्रगति तथा मूल्यांकन रिपोर्ट खोल्दैछु।",
  },
  openCaregiver: {
    en: "Opening Caregiver Hub.",
    hi: "केयरगिवर हब खोल रहा हूँ।",
    as: "কেয়াৰগিভাৰ হাব খোলি আছোঁ।",
    bn: "কেয়ারগিভার হাব খুলছি।",
    mni: "কেয়াৰগিভাৰ মফম।",
    brx: "কেয়ারগিভার হাব।",
    ne: "हेरचाह केन्द्र खोल्दैछु।",
  },
  unauthorizedRole: {
    en: (portal: string) =>
      `Access restricted. The ${portal} is reserved for authorized caregivers and clinical staff.`,
    hi: (portal: string) =>
      `पहुंच सीमित है। ${portal} केवल अधिकृत देखभालकर्ताओं और डॉक्टरों के लिए है।`,
    as: (portal: string) => `প্ৰৱেশ সীমিত। ${portal} কেৱল কৰ্তৃত্বপ্ৰাপ্ত কেয়াৰগিভাৰসকলৰ বাবে।`,
    bn: (portal: string) => `অনুমতি সীমাবদ্ধ। ${portal} শুধুমাত্র অনুমোদিত পরিচর্যাকারীদের জন্য।`,
    mni: () => "প্ৰৱেশ অথোইবা নত্তে।",
    brx: () => "অনুমতি গৈয়া।",
    ne: () => "पहुँच सीमित छ। यो भाग अधिकृत हेरचाहकर्ताका लागि मात्र हो।",
  },
  help: {
    en: "You can say: Play memory match, Open games, What should I do today, Show my reminders, Show my medicine, or Go home.",
    hi: "आप कह सकते हैं: मेमोरी गेम खेलो, गेम खोलो, आज मुझे क्या करना है, मेरे रिमाइंडर दिखाओ, दवा दिखाओ, या घर जाओ।",
    as: "আপুনি ক'ব পাৰে: মেমৰি খেল খোলক, খেল খোলক, আজি মই কি কৰিব লাগিব, মোৰ সোঁৱৰণী দেখুওৱা, অথবা ঘৰলৈ যাওক।",
    bn: "আপনি বলতে পারেন: মেমোরি গেম খেলুন, গেম খুলুন, আজ আমি কী করব, আমার রিমাইন্ডার দেখান, অথবা হোমে যান।",
    mni: "নত্ত্রা হায়থোক্তুনা: খেল শানবা, সোঁৱৰণী থীজিনু, নাইতনা হোমদা চৎনু।",
    brx: "নংগীর হানজা: গামি মফম, রিমাইন্ডার বাছ, হোম পেজাও থাং।",
    ne: "तपाईं भन्न सक्नुहुन्छ: मेमोरी खेल खेल्नुस्, गेम खोल्नुस्, आज के गर्ने, वा घर जानुस्।",
  },
  stopSpeaking: {
    en: "Voice response stopped.",
    hi: "बोलना रोक दिया गया।",
    as: "কণ্ঠ স্তব্ধ কৰা হ'ল।",
    bn: "কথা বলা বন্ধ করা হলো।",
    mni: "হায়বা তোক্লে।",
    brx: "বায়না তোক্লে।",
    ne: "आवाज रोकियो।",
  },
  unknown: {
    en: "I didn't quite catch that. Try saying 'Play game' or 'What should I do today?'.",
    hi: "मैं समझ नहीं पाया। आप 'गेम खेलो' या 'आज मुझे क्या करना है' कह सकते हैं।",
    as: "মই বুজি নাপালোঁ। 'খেল খোলক' বা 'আজি কি কৰিব লাগিব' বুলি চেষ্টা কৰক।",
    bn: "আমি বুঝতে পারিনি। 'গেম খেলুন' বা 'আজ কী করব' বলে দেখুন।",
    mni: "মই বুজিদ্রে। খেল শানবা হায়বিনু।",
    brx: "মই বুজিদ্রে। গামি মফম হায়নো।",
    ne: "मैले बुझ्न सकिनँ। 'खेल खेल्नुस्' वा 'आज के गर्ने' भन्नुहोस्।",
  },
};

export function getLangKey(code: string): "en" | "hi" | "as" | "bn" | "mni" | "brx" | "ne" {
  const prefix = code.split("-")[0].toLowerCase();
  if (prefix === "hi") return "hi";
  if (prefix === "as") return "as";
  if (prefix === "bn") return "bn";
  if (prefix === "mni") return "mni";
  if (prefix === "brx") return "brx";
  if (prefix === "ne") return "ne";
  return "en";
}

let nextGameIndex = 0;

export interface CommandContext {
  languageCode: string;
  userRole?: string;
  todayTasks?: Array<{ id: string; title: string; scheduled_time: string; status: string }>;
  todayMeds?: Array<{ id: string; status: string }>;
  navigate: (options: { to: string }) => void;
  stopAudio?: () => void;
}

export function executeVoiceCommand(
  interpretation: NlpInterpretation,
  ctx: CommandContext,
): VoiceCommandExecutionResult {
  const { intent, entity, confidence } = interpretation;
  const lang = getLangKey(ctx.languageCode);

  // Confidence safety check
  if (confidence < 0.6) {
    return {
      success: false,
      intent: "UNKNOWN",
      spokenMessage: LOCALIZED_RESPONSES.unknown[lang],
      actionSummary: "Command not recognized with sufficient certainty",
    };
  }

  switch (intent) {
    case "OPEN_GAMES": {
      ctx.navigate({ to: "/games" });
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.openGames[lang],
        actionSummary: "Navigated to Cognitive Training Center (/games)",
        routeNavigated: "/games",
      };
    }

    case "OPEN_GAME": {
      const targetEntity = (entity || "MEMORY_MATCH").toUpperCase();
      const gameInfo = GAME_ENTITY_ROUTE_MAP[targetEntity] || GAME_ENTITY_ROUTE_MAP.MEMORY_MATCH;
      ctx.navigate({ to: gameInfo.route });
      const localizedName = gameInfo.name[lang] || gameInfo.name.en;
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.openGame[lang](localizedName),
        actionSummary: `Opened ${localizedName} (${gameInfo.route})`,
        routeNavigated: gameInfo.route,
      };
    }

    case "NEXT_GAME": {
      nextGameIndex = (nextGameIndex + 1) % REGISTERED_GAMES_LIST.length;
      const entityKey = REGISTERED_GAMES_LIST[nextGameIndex];
      const gameInfo = GAME_ENTITY_ROUTE_MAP[entityKey];
      ctx.navigate({ to: gameInfo.route });
      const localizedName = gameInfo.name[lang] || gameInfo.name.en;
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.nextGame[lang](localizedName),
        actionSummary: `Navigated to next game: ${localizedName}`,
        routeNavigated: gameInfo.route,
      };
    }

    case "OPEN_REMINDERS": {
      ctx.navigate({ to: "/routine" });
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.openReminders[lang],
        actionSummary: "Navigated to Routine & Reminders (/routine)",
        routeNavigated: "/routine",
      };
    }

    case "TODAY_REMINDERS": {
      ctx.navigate({ to: "/routine" });
      const pendingTasks = (ctx.todayTasks || []).filter((t) => t.status !== "completed");
      const summary =
        pendingTasks.length > 0
          ? `${pendingTasks.length} pending items: ${pendingTasks
              .slice(0, 3)
              .map((t) => t.title)
              .join(", ")}`
          : "All scheduled routine tasks are completed for today!";
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.todayReminders[lang](summary),
        actionSummary: "Announced today's schedule and opened /routine",
        routeNavigated: "/routine",
      };
    }

    case "NEXT_REMINDER": {
      ctx.navigate({ to: "/routine" });
      const nextPending = (ctx.todayTasks || []).find((t) => t.status !== "completed");
      const itemTitle = nextPending
        ? `${nextPending.title} at ${nextPending.scheduled_time.slice(0, 5)}`
        : "No more pending tasks scheduled today";
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.nextReminder[lang](itemTitle),
        actionSummary: `Reported next reminder: ${itemTitle}`,
        routeNavigated: "/routine",
      };
    }

    case "OPEN_MEDICATIONS": {
      ctx.navigate({ to: "/medication" });
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.openMedications[lang],
        actionSummary: "Navigated to Medication Timeline (/medication)",
        routeNavigated: "/medication",
      };
    }

    case "GO_HOME": {
      ctx.navigate({ to: "/" });
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.goHome[lang],
        actionSummary: "Navigated to Home Dashboard (/)",
        routeNavigated: "/",
      };
    }

    case "OPEN_ANALYTICS": {
      ctx.navigate({ to: "/analytics" });
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.openAnalytics[lang],
        actionSummary: "Navigated to Cognitive Analytics (/analytics)",
        routeNavigated: "/analytics",
      };
    }

    case "OPEN_CAREGIVER": {
      if (ctx.userRole === "caretaker" || ctx.userRole === "admin") {
        ctx.navigate({ to: "/caregiver" });
        return {
          success: true,
          intent,
          spokenMessage: LOCALIZED_RESPONSES.openCaregiver[lang],
          actionSummary: "Navigated to Caregiver Hub (/caregiver)",
          routeNavigated: "/caregiver",
        };
      }
      return {
        success: false,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.unauthorizedRole[lang]("Caregiver Hub"),
        actionSummary: "Caregiver Hub restricted to caretakers and clinical staff",
      };
    }

    case "OPEN_DOCTOR": {
      if (ctx.userRole === "doctor" || ctx.userRole === "admin") {
        ctx.navigate({ to: "/doctor" });
        return {
          success: true,
          intent,
          spokenMessage: "Opening Doctor Clinical Portal.",
          actionSummary: "Navigated to Doctor Portal (/doctor)",
          routeNavigated: "/doctor",
        };
      }
      return {
        success: false,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.unauthorizedRole[lang]("Doctor Portal"),
        actionSummary: "Doctor Portal restricted to doctors and clinical staff",
      };
    }

    case "OPEN_MEMORIES": {
      ctx.navigate({ to: "/memories" });
      return {
        success: true,
        intent,
        spokenMessage: "Opening your personal Reminiscence Gallery.",
        actionSummary: "Navigated to Memories (/memories)",
        routeNavigated: "/memories",
      };
    }

    case "STOP_SPEAKING": {
      if (ctx.stopAudio) ctx.stopAudio();
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.stopSpeaking[lang],
        actionSummary: "Speech playback silenced",
      };
    }

    case "HELP": {
      return {
        success: true,
        intent,
        spokenMessage: LOCALIZED_RESPONSES.help[lang],
        actionSummary: "Opened Voice Command Help",
      };
    }

    case "READ_SCREEN": {
      // Dynamic screen reader logic
      const h1Text = document.querySelector("h1")?.textContent?.trim();
      const summary = h1Text
        ? `You are currently viewing ${h1Text}.`
        : "You are currently viewing CuCove.";
      return {
        success: true,
        intent,
        spokenMessage: summary,
        actionSummary: "Read screen contents aloud",
      };
    }

    default: {
      return {
        success: false,
        intent: "UNKNOWN",
        spokenMessage: LOCALIZED_RESPONSES.unknown[lang],
        actionSummary: "Unrecognized command",
      };
    }
  }
}
