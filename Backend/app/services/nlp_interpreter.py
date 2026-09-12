import json
import logging
import re
import urllib.request
import urllib.error
from typing import Any

logger = logging.getLogger("nlp_interpreter")

SYSTEM_PROMPT = """You are an intent classifier for SmritiSetu, an elderly-care voice assistant cognitive app.
The app features:
  1. Games section - 22 cognitive exercises (Memory Match, Water Jugs, Tower of Hanoi, Number Puzzle, Word Scramble, Quick Math, Stroop Test, Maze, Ball Sort, etc.)
  2. Reminders & Medication section - today's schedule, medicines, and tasks
  3. Memories album - family photos, audio recollections
  4. AI Cognitive Analytics - cognitive performance, memory retention trends
  5. Caregiver section - caregiver monitoring view

Your job: read what the user said (in any language) and return ONLY a JSON object - no prose.

Valid intents:
  OPEN_GAMES      - user wants to see or play games (e.g. "play", "games", "bored", "khelna hai", "गेम खेलो", "খেল খোলক")
  NEXT_GAME       - user wants another game (e.g. "next game", "another game", "अगला गेम")
  OPEN_GAME       - user names a specific game; set entity to one of:
                    MEMORY_MATCH, WATER_JUGS, TOWER_OF_HANOI, BALL_SORT, NUMBER_PUZZLE, WORD_PUZZLE,
                    MAZE, STROOP, QUICK_MATH, SCHULTE_TABLE, DUAL_TASK, VISUAL_SEARCH, PATTERN_MATRIX
  OPEN_REMINDERS  - user wants to see reminders/tasks/meds (e.g. "remind me", "my tasks", "रिमाइंडर", "दवा")
  TODAY_REMINDERS - user asks specifically what to do today (e.g. "what's on today", "आज क्या करना है", "आजि কি")
  NEXT_REMINDER   - user wants the next reminder item (e.g. "next reminder", "अगला काम", "পৰৱৰ্তী কাম")
  OPEN_PROGRESS   - user asks for progress/analytics (e.g. "my score", "progress", "analytics", "प्रोग्रेस", "स्कोर")
  OPEN_MEMORIES   - user asks for memories/photos (e.g. "memories", "photos", "family", "यादें", "फोटो")
  OPEN_CAREGIVER  - user asks for caregiver view (e.g. "caregiver", "caretaker", "केयरगिवर")
  HELP            - user asks what they can say or asks for help
  UNKNOWN         - cannot determine intent

Respond with ONLY valid JSON, exactly this shape, nothing else:
{"intent":"OPEN_GAMES","confidence":0.95,"entity":null}"""


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"[?!,.\"']", " ", (text or "").lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def includes_any(text: str, phrases: list[str]) -> bool:
    return any(p in text for p in phrases)


def includes_all(text: str, words: list[str]) -> bool:
    return all(w in text for w in words)


# Fallback Phrase Tables
EN_PHRASES = {
    "help": ["help", "what can i say", "what can i do", "commands", "guide"],
    "nextGame": ["next game", "show next game", "another game", "another one", "give me another", "next one"],
    "nextReminder": ["next reminder", "next task", "what is next", "what should i do next", "next medicine"],
    "today": ["today reminder", "reminders today", "what should i do today", "today tasks", "tell me today", "need to do today", "what do i need to do", "today's schedule"],
    "reminders": ["open reminders", "show reminders", "my reminders", "my tasks", "today tasks", "medication", "medicine", "schedule"],
    "games": ["play game", "play games", "show me games", "i want to play", "feel like playing", "open games", "let me play", "exercises"],
    "progress": ["progress", "analytics", "my score", "performance", "cognitive score", "report"],
    "memories": ["memories", "photos", "family photos", "album", "recollections"],
    "caregiver": ["caregiver", "caretaker", "caregiver dashboard", "caretaker view"],
}

HI_PHRASES = {
    "help": ["मदद", "क्या बोल", "कमांड", "सहायता"],
    "nextGame": ["अगला गेम", "दूसरा गेम", "नेक्स्ट गेम", "अगला खेल"],
    "nextReminder": ["अगला रिमाइंडर", "अगला काम", "नेक्स्ट रिमाइंडर", "अगली दवा"],
    "today": ["आज मुझे क्या करना है", "आज के रिमाइंडर", "आज क्या करना", "आज के काम", "आज का शेड्यूल"],
    "reminders": ["रिमाइंडर दिखाओ", "मेरे रिमाइंडर", "काम दिखाओ", "क्या करना है", "दवा दिखाओ", "दवाई"],
    "games": ["गेम खोलो", "गेम खेलना है", "गेम खेलो", "गेम दिखाओ", "खेल दिखाओ", "खेलना है"],
    "progress": ["प्रोग्रेस", "स्कोर", "एनालिटिक्स", "मेरा स्कोर", "प्रदर्शन"],
    "memories": ["यादें", "पुरानी यादें", "फोटो", "तस्वीरें", "एल्बम"],
    "caregiver": ["केयरगिवर", "केयरटेकर", "देखभाल"],
}

AS_PHRASES = {
    "help": ["সহায়", "কি কওঁ", "কমান্ড"],
    "nextGame": ["পৰৱৰ্তী গেম", "আন গেম", "নেক্সট গেম", "পৰৱৰ্তী খেল"],
    "nextReminder": ["পৰৱৰ্তী সোঁৱৰণী", "পৰৱৰ্তী কাম", "নেক্সট ৰিমাইণ্ডাৰ", "পৰৱৰ্তী ঔষধ"],
    "today": ["আজি মই কি কৰিব লাগিব", "আজিৰ সোঁৱৰণী", "আজি কি কৰিব", "আজিৰ কাম"],
    "reminders": ["সোঁৱৰণী দেখুওৱা", "মোৰ সোঁৱৰণী", "কাম দেখুওৱা", "কি কৰিব লাগিব", "ঔষধ"],
    "games": ["খেল খোলক", "গেম খোলক", "গেম খেলিব", "গেম দেখুওৱা", "খেল দেখুওৱা"],
    "progress": ["প্ৰগতি", "স্কোৰ", "মোৰ প্ৰদৰ্শন"],
    "memories": ["স্মৃতি", "ফটো", "এলবাম"],
    "caregiver": ["কেয়াৰগিভাৰ", "যত্নলোৱা"],
}

NE_PHRASES = {
    "help": ["मद्दत", "सहयोग", "के भन्न सक्छु", "कमाण्ड"],
    "nextGame": ["अर्को खेल", "अर्को गेम", "नेक्स्ट गेम"],
    "nextReminder": ["अर्को रिमाइन्डर", "अर्को काम", "अर्को औषधि"],
    "today": ["आज के छ", "आजका रिमाइन्डर", "आजका काम", "आजको तालिका", "आज के के छन्"],
    "reminders": ["रिमाइन्डर देखाउनुहोस्", "मेरो औषधि देखाउनुहोस्", "औषधि", "काम देखाउनुहोस्", "तालिका"],
    "games": ["खेल खोल्नुहोस्", "खेल खेल्नुहोस्", "गेम खेल्नुहोस्", "गेम देखाउनुहोस्"],
    "progress": ["प्रगति देखाउनुहोस्", "प्रगति", "स्कोर"],
    "memories": ["सम्झनाहरू खोल्नुहोस्", "सम्झनाहरू", "फोटोहरू"],
    "caregiver": ["हेरचाहकर्ता"],
}

BN_PHRASES = {
    "help": ["সাহায্য", "কী বলব", "কমান্ড"],
    "nextGame": ["পরের গেম", "অন্য গেম", "পরবর্তী খেলা"],
    "nextReminder": ["পরের রিমাইন্ডার", "পরের কাজ", "পরবর্তী ওষুধ"],
    "today": ["আজকে কী করতে হবে", "আজকের রিমাইন্ডার", "আজকের কাজ"],
    "reminders": ["রিমাইন্ডার দেখান", "আমার রিমাইন্ডার", "ওষুধ দেখাও", "কাজের তালিকা"],
    "games": ["গেম খেলুন", "গেম দেখাও", "খেলা খুলুন", "গেম খেলতে চাই"],
    "progress": ["অগ্রগতি", "স্কোর", "অ্যানালিটিক্স"],
    "memories": ["স্মৃতি", "ছবি", "অ্যালবাম"],
    "caregiver": ["কেয়ারগিভার"],
}


def find_game_entity(text: str, language: str) -> str | None:
    # Universal alias lookup for all cognitive games across English, Hindi, Assamese, Bengali, Nepali
    game_entities: list[tuple[str, list[str]]] = [
        (
            "WATER_JUGS",
            [
                "water jug", "water jugs", "jug", "jugs", "वॉटर जग", "वाटर जग", "वाटर", "वॉटर",
                "पानी का जग", "पानी जग", "পানীৰ জগ", "ওয়াটার জাগ", "ওয়াটার", "জাগ", "পানিको जग",
                "पानीको जग खेल"
            ],
        ),
        (
            "TOWER_OF_HANOI",
            [
                "tower of hanoi", "hanoi", "टावर ऑफ हनोई", "हैनोई", "हनोई", "হানোই",
                "টাওয়ার অফ হ্যানয়", "টাওয়ার অফ হানোই", "হ্যানয়", "टावर अफ हनोई"
            ],
        ),
        (
            "BALL_SORT",
            [
                "ball sort", "ball puzzle", "sort balls", "बॉल सॉर्ट", "বল সৰ্ট",
                "বল সাজানো", "বল সর্ট", "बल सर्ट"
            ],
        ),
        (
            "MEMORY_MATCH",
            [
                "memory match", "card match", "memory game", "cards", "मेमोरी कार्ड मैच", "मेमोरी",
                "याददाश्त", "कार्ड मैच", "মেমৰি কাৰ্ড", "মেমৰি", "স্মৃতি মেমরি", "তাস", "मेमोरी म्याच"
            ],
        ),
        (
            "NUMBER_PUZZLE",
            [
                "number sequence", "number puzzle", "math sequence", "नंबर पहेली", "नंबर",
                "संख्या খেল", "সংখ্যার ধাঁধা", "সংখ্যা ধাঁধা", "नम्बर पजल", "अंक"
            ],
        ),
        (
            "WORD_PUZZLE",
            [
                "word scramble", "word puzzle", "anagram", "शब्द पहेली", "शब्द খেল",
                "শব্দ ধাঁধা", "शब्द पजल", "ওয়ার্ড", "শব্দ", "अक्षर"
            ],
        ),
        (
            "MAZE",
            [
                "maze", "pathway maze", "भूलभुलैया", "রাস্তা খেল", "গোলকধাঁধা",
                "भुलभुलैया", "बाटो"
            ],
        ),
        (
            "STROOP",
            [
                "stroop", "color test", "स्ट्रूप कलर टेस्ट", "स्ट्रूप", "ৰং পৰীক্ষা",
                "রঙের খেলা", "रङ्ग परीक्षण", "रंग"
            ],
        ),
        (
            "QUICK_MATH",
            [
                "quick math", "arithmetic", "क्विक मैथ", "দ্ৰুত অংক", "দ্রুত গণিত",
                "छिटो गणित", "गणित", "অংক"
            ],
        ),
        ("SCHULTE_TABLE", ["schulte", "schulte table", "शुल्टे"]),
        ("DUAL_TASK", ["dual task", "multitask", "ड्यूल टास्क"]),
        ("VISUAL_SEARCH", ["visual search", "find shape", "विजुअल सर्च"]),
        ("PATTERN_MATRIX", ["pattern matrix", "grid pattern", "पैटर्न"]),
    ]

    for entity, aliases in game_entities:
        if includes_any(text, aliases):
            return entity
    return None


def interpret_fallback(input_text: str, language: str = "en") -> dict[str, Any]:
    text = normalize_text(input_text)
    if not text:
        return {"intent": "UNKNOWN", "confidence": 0.0, "entity": None}

    entity = find_game_entity(text, language)
    if entity:
        return {"intent": "OPEN_GAME", "confidence": 0.96, "entity": entity}

    lang_code = (language or "en").lower().split("-")[0]

    # Check primary language first, then search cross-lingual
    all_help = (
        EN_PHRASES["help"] + HI_PHRASES["help"] + AS_PHRASES["help"] +
        BN_PHRASES["help"] + NE_PHRASES["help"] +
        ["help", "मदद", "सहाय", "সাহায্য", "मद्दत"]
    )
    all_next_game = (
        EN_PHRASES["nextGame"] + HI_PHRASES["nextGame"] + AS_PHRASES["nextGame"] +
        BN_PHRASES["nextGame"] + NE_PHRASES["nextGame"]
    )
    all_next_reminder = (
        EN_PHRASES["nextReminder"] + HI_PHRASES["nextReminder"] + AS_PHRASES["nextReminder"] +
        BN_PHRASES["nextReminder"] + NE_PHRASES["nextReminder"]
    )
    all_today = (
        EN_PHRASES["today"] + HI_PHRASES["today"] + AS_PHRASES["today"] +
        BN_PHRASES["today"] + NE_PHRASES["today"] +
        ["today", "आज", "আজি", "আজকে", "आजका", "आजको", "আজকের"]
    )
    all_progress = (
        EN_PHRASES["progress"] + HI_PHRASES["progress"] + AS_PHRASES["progress"] +
        BN_PHRASES["progress"] + NE_PHRASES["progress"] +
        ["progress", "score", "analytics", "प्रोग्रेस", "स्कोर", "এনালাইটিক্স", "প্রোগ্রেস", "प्रगति"]
    )
    all_memories = (
        EN_PHRASES["memories"] + HI_PHRASES["memories"] + AS_PHRASES["memories"] +
        BN_PHRASES["memories"] + NE_PHRASES["memories"] +
        ["memory", "memories", "photos", "यादें", "फोटो", "স্মৃতি", "सम्झनाहरू", "অ্যালবাম", "এলবাম"]
    )
    all_caregiver = (
        EN_PHRASES["caregiver"] + HI_PHRASES["caregiver"] + AS_PHRASES["caregiver"] +
        BN_PHRASES["caregiver"] + NE_PHRASES["caregiver"] +
        ["caregiver", "caretaker", "केयरगिवर", "কেয়াৰগিভাৰ", "केयरटेकर", "हेरचाहकर्ता"]
    )
    all_reminders = (
        EN_PHRASES["reminders"]
        + HI_PHRASES["reminders"]
        + AS_PHRASES["reminders"]
        + BN_PHRASES["reminders"]
        + NE_PHRASES["reminders"]
        + [
            "reminder", "reminders", "task", "tasks", "medicine", "medicines", "medication",
            "meds", "dawa", "dawai", "dawaya", "dawaiyan", "goli", "aushadh", "oukhod", "oshudh",
            "दवा", "दवाई", "दवाइयाँ", "औষধ", "ওষুধ", "औषधि", "काम", "schedule", "routine",
            "रूटीन", "routine dikhao", "সময়সূচি", "तालिका"
        ]
    )
    all_games = (
        EN_PHRASES["games"]
        + HI_PHRASES["games"]
        + AS_PHRASES["games"]
        + BN_PHRASES["games"]
        + NE_PHRASES["games"]
        + [
            "game", "games", "play", "play game", "play games", "khel", "khelo", "khelna", "khelna hai",
            "गेम", "खेल", "খেল", "খেলা", "puzzle", "puzzles", "पजल"
        ]
    )

    if includes_any(text, all_help):
        return {"intent": "HELP", "confidence": 0.97, "entity": None}
    if includes_any(text, all_next_game):
        return {"intent": "NEXT_GAME", "confidence": 0.95, "entity": None}
    if includes_any(text, all_next_reminder):
        return {"intent": "NEXT_REMINDER", "confidence": 0.95, "entity": None}
    if includes_any(text, all_today):
        return {"intent": "TODAY_REMINDERS", "confidence": 0.95, "entity": None}
    if includes_any(text, all_progress):
        return {"intent": "OPEN_PROGRESS", "confidence": 0.94, "entity": None}
    if includes_any(text, all_memories):
        return {"intent": "OPEN_MEMORIES", "confidence": 0.94, "entity": None}
    if includes_any(text, all_caregiver):
        return {"intent": "OPEN_CAREGIVER", "confidence": 0.94, "entity": None}
    if includes_any(text, all_reminders):
        return {"intent": "OPEN_REMINDERS", "confidence": 0.92, "entity": None}
    if includes_any(text, all_games):
        return {"intent": "OPEN_GAMES", "confidence": 0.92, "entity": None}

    return {"intent": "UNKNOWN", "confidence": 0.30, "entity": None}


def classify_with_llm(input_text: str, language: str, api_key: str) -> dict[str, Any]:
    lang_map = {
        "hi": "Hindi",
        "as": "Assamese",
        "bn": "Bengali",
        "mni": "Manipuri",
        "brx": "Bodo",
        "ne": "Nepali",
        "en": "English",
        "te": "Telugu",
        "ta": "Tamil",
        "mr": "Marathi",
        "gu": "Gujarati",
    }
    lang_label = lang_map.get(language, "English / Multilingual")
    user_message = f'Language hint: {lang_label}\nUser said: "{input_text}"'

    payload = {
        "model": "sarvam-105b-conversations",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.1,
        "max_tokens": 120,
    }

    req = urllib.request.Request(
        "https://api.sarvam.ai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=4.0) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Sarvam LLM status {resp.status}")
        raw_resp = json.loads(resp.read().decode("utf-8"))

    content = raw_resp.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        raise RuntimeError("Empty response from Sarvam LLM")

    # Strip code fences if present
    clean_json = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
    clean_json = re.sub(r"\s*```$", "", clean_json).strip()
    parsed = json.loads(clean_json)

    valid_intents = {
        "OPEN_GAMES", "NEXT_GAME", "OPEN_GAME", "OPEN_REMINDERS",
        "TODAY_REMINDERS", "NEXT_REMINDER", "OPEN_PROGRESS",
        "OPEN_MEMORIES", "OPEN_CAREGIVER", "HELP", "UNKNOWN",
    }
    intent = parsed.get("intent", "UNKNOWN")
    if intent not in valid_intents:
        raise RuntimeError(f"Unrecognized intent from LLM: {intent}")

    return {
        "intent": intent,
        "confidence": float(parsed.get("confidence", 0.90)),
        "entity": parsed.get("entity"),
    }


def interpret_command(input_text: str, language: str = "en", api_key: str | None = None) -> dict[str, Any]:
    """
    Classifies user command text.
    Checks specific game entity first for precision; then tries Sarvam LLM; falls back to rule matcher.
    """
    if input_text and input_text.strip():
        entity = find_game_entity(normalize_text(input_text), language)
        if entity:
            return {"intent": "OPEN_GAME", "confidence": 0.98, "entity": entity}

    if api_key and input_text and input_text.strip():
        try:
            result = classify_with_llm(input_text, language, api_key)
            logger.info(f'[LLM] "{input_text}" -> {result["intent"]} ({round(result["confidence"] * 100)}%)')
            return result
        except Exception as exc:
            logger.warning(f'[LLM] Classification fallback triggered: {exc}')

    result = interpret_fallback(input_text, language)
    logger.info(f'[Fallback] "{input_text}" -> {result["intent"]} ({round(result["confidence"] * 100)}%)')
    return result
