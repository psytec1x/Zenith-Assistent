export interface DashboardPage {
  id: string;
  title: string;
  icon: string;
  widgets: DashboardWidget[];
  subpages: string[]; // List of page IDs
  contentBlocks: ContentBlock[];
  headerImage?: string;
}

export interface DashboardWidget {
  id: string;
  type: 
    | "ai-chat"
    | "todo"
    | "calendar"
    | "bookmarks"
    | "quick-links"
    | "smart-home"
    | "news-bias"
    | "music-player"
    | "email-inbox"
    | "writing-assistant"
    | "contacts-manager"
    | "meeting-assistant"
    | "voice-recorder"
    | "maps-itinerary"
    | "search-engine"
    | "pomodoro"
    | "finance"
    | "weather";
  title: string;
  w: number; // grid col-span (e.g. 1, 2, 3, 4)
  h: number; // height variant or custom (e.g. "small", "medium", "large")
  color: string; // e.g. "slate", "blue", "emerald", "amber", "rose", "violet"
  collapsed?: boolean;
  settings?: Record<string, any>;
}

export interface ContentBlock {
  id: string;
  type: "text" | "code" | "html" | "image" | "video" | "list" | "audio" | "midi";
  value: string;
  language?: string; // html, javascript, python, css, shell
  title?: string;
  isExecuted?: boolean; // if true, render running HTML/JS
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
  category: string;
  completed: boolean;
  notes?: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  summary?: string;
  category: string; // Wichtig, Arbeit, Finanzen, Newsletter, Soziales, Spam
  priority: "high" | "medium" | "low";
  actionItems?: string[];
  sentiment?: string;
  receivedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationshipStrength: number; // 0-100
  lastContactDate: string;
  notes: string;
  suggestions?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  text: string;
  summary?: string;
  biasAnalysis?: string;
  mainstreamView?: string;
  alternativeView?: string;
  credibilityScore?: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  transcript: string;
  notes?: string;
  actionItems?: string[];
}

export interface SmartHomeDevice {
  id: string;
  name: string;
  type: "light" | "plug" | "speaker" | "thermostat";
  status: "online" | "offline" | "connected";
  power: boolean;
  value: number; // brightness %, temp degrees, volume %
  color?: string; // hex color for smart lights
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
}

export interface AppSettings {
  theme: "cosmic-dark" | "slate-minimal" | "amber-warm" | "forest-green" | "editorial-light" | "oled-black";
  accentColor: "gold" | "blue" | "amber" | "rose" | "violet" | "emerald";
  accentIntensity: "subtle" | "normal" | "vibrant";
  backgroundType: "gradient" | "flat" | "glass";
  primaryFont: "Inter" | "Space Grotesk" | "Outfit" | "Playfair Display" | "JetBrains Mono";
  fontSize: "small" | "medium" | "large";
  lineSpacing: "compact" | "normal" | "spacious";
  idleLockTime: "none" | "5min" | "15min" | "30min";
  encryptLocalData: boolean;
  privacyMode: boolean;
  anonymizeAiLogs: boolean;
  geminiModel: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-1.5-pro" | "gemini-1.5-flash";
  geminiApiKey?: string;
  customApiUrl: string;
  aiTemperature: number;
  systemPromptModifier: string;
  enabledSkills: {
    aiChat: boolean;
    nlpTasks: boolean;
    meetingAssistant: boolean;
    voiceCommands: boolean;
    mapsTravel: boolean;
    audioSynth: boolean;
  };
  audioFeedback: boolean;
  voiceWakeWord: boolean;
}

