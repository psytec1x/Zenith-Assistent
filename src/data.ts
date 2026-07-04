import { 
  DashboardPage, 
  Task, 
  Email, 
  Contact, 
  NewsArticle, 
  Meeting, 
  SmartHomeDevice, 
  Bookmark,
  QuickLink,
  AppSettings
} from "./types";

export const INITIAL_QUICK_LINKS: QuickLink[] = [
  { id: "1", title: "Gemini AI", url: "https://gemini.google.com", icon: "Sparkles", color: "text-blue-400 bg-blue-950/40 border-blue-900/50" },
  { id: "2", title: "ChatGPT", url: "https://chatgpt.com", icon: "Brain", color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/50" },
  { id: "3", title: "Claude AI", url: "https://claude.ai", icon: "Bot", color: "text-amber-400 bg-amber-950/40 border-amber-900/50" },
  { id: "4", title: "DeepL Translate", url: "https://www.deepl.com", icon: "Languages", color: "text-teal-400 bg-teal-950/40 border-teal-900/50" },
  { id: "5", title: "GitHub Copilot", url: "https://github.com", icon: "Code", color: "text-violet-400 bg-violet-950/40 border-violet-900/50" }
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  { id: "b1", title: "Google Search", url: "https://google.com", category: "Arbeit" },
  { id: "b2", title: "GitHub Dashboard", url: "https://github.com", category: "Entwicklung" },
  { id: "b3", title: "Next.js Docs", url: "https://nextjs.org/docs", category: "Lernen" },
  { id: "b4", title: "Notion Workspace", url: "https://notion.so", category: "Organisation" },
  { id: "b5", title: "Google Calendar", url: "https://calendar.google.com", category: "Arbeit" }
];

export const INITIAL_SMART_DEVICES: SmartHomeDevice[] = [
  { id: "sd1", name: "Wohnzimmer Licht", type: "light", status: "online", power: true, value: 80, color: "#eab308" },
  { id: "sd2", name: "Büro Heizung", type: "thermostat", status: "online", power: true, value: 21 },
  { id: "sd3", name: "Smart Plug Kaffeemaschine", type: "plug", status: "online", power: false, value: 0 },
  { id: "sd4", name: "Teufel Soundbar", type: "speaker", status: "offline", power: false, value: 30 }
];

export const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "KI-Modell-Vergleich dokumentieren", date: "2026-06-24", time: "10:00", priority: "high", category: "Arbeit", completed: false, notes: "Fokus auf Latenz und Kosten von Gemini 2.5 Flash und Claude." },
  { id: "t2", title: "Arzttermin dr. Schmidt", date: "2026-06-24", time: "15:30", priority: "medium", category: "Gesundheit", completed: false, notes: "Vorsorgeuntersuchung, Unterlagen mitbringen." },
  { id: "t3", title: "Geburtstagsgeschenk besorgen", date: "2026-06-25", time: "18:00", priority: "low", category: "Persönlich", completed: false, notes: "Gutschein oder Buch kaufen." },
  { id: "t4", title: "Google Calendar API einrichten", date: "2026-06-23", time: "16:00", priority: "high", category: "Entwicklung", completed: true, notes: "Anmeldedaten heruntergeladen und im Dashboard konfiguriert." }
];

export const INITIAL_EMAILS: Email[] = [
  {
    id: "e1",
    sender: "max.mustermann@firma.de",
    subject: "Wichtige Projektaktualisierung - Bitte prüfen!",
    body: "Hallo zusammen, wir haben das Deployment auf nächste Woche verschoben. Wir müssen sicherstellen, dass die Firebase-Sicherheitsregeln bis dahin vollständig auditiert sind. Bitte schaut euch das Schema noch einmal an.",
    summary: "Das Deployment wurde auf nächste Woche verschoben, um die Firebase-Sicherheitsregeln zu prüfen.",
    category: "Wichtig",
    priority: "high",
    actionItems: ["Firebase-Regeln prüfen", "Terminplan anpassen"],
    sentiment: "Dringend",
    receivedAt: "2026-06-23T10:30:00Z"
  },
  {
    id: "e2",
    sender: "newsletter@techcrunch.com",
    subject: "TechCrunch Weekly: Die Zukunft der lokalen KI-Agenten",
    body: "In dieser Ausgabe beleuchten wir Web Bluetooth API, Offline-TensorFlow.js-Modelle und wie Browser-basierte KI-Assistenten die Produktivität revolutionieren.",
    summary: "Newsletter über Browser-basierte KI-Agenten, Web Bluetooth und lokale Modelle.",
    category: "Newsletter",
    priority: "low",
    actionItems: ["Artikel über Web Bluetooth lesen"],
    sentiment: "Informativ",
    receivedAt: "2026-06-22T08:15:00Z"
  },
  {
    id: "e3",
    sender: "marketing@spam-bots.net",
    subject: "Gewinnen Sie ein brandneues iPhone 17 Pro!",
    body: "Glückwunsch! Ihre E-Mail wurde für den Hauptpreis ausgewählt. Klicken Sie einfach hier, um Ihre Adresse zu verifizieren.",
    summary: "Typische Spam-Gewinnspiel-E-Mail.",
    category: "Spam",
    priority: "low",
    actionItems: ["E-Mail löschen"],
    sentiment: "Verdächtig",
    receivedAt: "2026-06-21T23:50:00Z"
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Dr. Clara Schumann",
    email: "clara.s@universitaet.de",
    phone: "+49 172 1234567",
    relationshipStrength: 85,
    lastContactDate: "2026-06-15",
    notes: "KI-Forscherin an der TU. Sehr interessiert an Browser-basierter Spracherkennung und TensorFlow.js.",
    suggestions: ["Lade Clara zum Fachsimpeln über Web-Audio & Synthesizer ein."]
  },
  {
    id: "c2",
    name: "Thomas Müller",
    email: "t.mueller@smarttech.com",
    phone: "+49 151 9876543",
    relationshipStrength: 40,
    lastContactDate: "2026-05-10",
    notes: "Potenzieller Partner für die Web Bluetooth Smart Home Gerätesteuerung.",
    suggestions: ["Melde dich nach über einem Monat Funkstille, um ein kurzes Update zu geben."]
  },
  {
    id: "c3",
    name: "Sophie Binder",
    email: "sophie.b@design-studio.at",
    phone: "+43 664 1112223",
    relationshipStrength: 95,
    lastContactDate: "2026-06-22",
    notes: "Designerin. Unterstützt uns beim 'dunklen Material-UI' Look & Feel und der Framer Motion Choreografie.",
    suggestions: ["Bedanke dich für das Feedback zum Notion-artigen Widgets-Layout."]
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "n1",
    title: "KI-Sicherheit und Datenschutz im Web",
    url: "https://example.com/news1",
    text: "Etablierte Stellen fordern strengere Regeln für die Verarbeitung persönlicher Daten durch Server-Modelle. Alternative Experten verweisen darauf, dass lokale Browser-KI das Problem elegant löst, indem Daten das Gerät nie verlassen.",
    summary: "Diskussion über KI-Datenschutz zwischen Server- und lokalen Client-Modellen.",
    biasAnalysis: "Der Artikel stellt beide Seiten dar, tendiert aber leicht zur Befürwortung lokaler Lösungen.",
    mainstreamView: "Fokus auf staatliche Regulierung, Audits und zentrale Server-Sicherheit.",
    alternativeView: "Fokus auf Dezentralisierung, Open-Source-Modelle und lokale Hardware-Souveränität.",
    credibilityScore: 88
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "m1",
    title: "Kickoff-Meeting Smart Assistant",
    date: "2026-06-22",
    transcript: "Wir besprechen heute das Widget-System. Der Benutzer soll wie in Notion Widgets in der Größe ändern (col-span) und farblich anpassen können. Firebase Auth und Firestore sorgen für die Synchronisierung. Wir wollen auch Google Maps und Calendar API anbinden. Sophie kümmert sich um das Design, Clara um die KI-Modellauswahl.",
    notes: "Notion-artiges Widget-System im Fokus. Firebase synchronisiert Daten. Google-Dienste integrieren.",
    actionItems: ["Dashboard-Layout implementieren (Sophie)", "Firebase anbinden (Thomas)", "Gemini-Integration fertigstellen"]
  }
];

export const INITIAL_PAGES: DashboardPage[] = [
  {
    id: "main",
    title: "Haupt-Dashboard",
    icon: "LayoutDashboard",
    headerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    widgets: [
      { id: "w-chat", type: "ai-chat", title: "KI-Agent", w: 2, h: 2, color: "slate" },
      { id: "w-todo", type: "todo", title: "Aufgaben", w: 2, h: 2, color: "blue" },
      { id: "w-calendar", type: "calendar", title: "Kalender", w: 2, h: 2, color: "emerald" },
      { id: "w-links", type: "quick-links", title: "Schnelllinks", w: 2, h: 1, color: "violet" },
      { id: "w-bookmarks", type: "bookmarks", title: "Lesezeichen", w: 2, h: 1, color: "amber" },
      { id: "w-home", type: "smart-home", title: "Smart Home", w: 2, h: 1, color: "rose" },
      { id: "w-music", type: "music-player", title: "Musik-Player", w: 2, h: 1, color: "teal" }
    ],
    subpages: ["wissen-wiki", "reise-planer"],
    contentBlocks: [
      { id: "cb1", type: "text", value: "Willkommen auf Ihrem persönlichen Assistenten-Dashboard! Nutzen Sie die Widgets unten, passen Sie sie nach Belieben an, oder erstellen Sie neue Unterseiten." },
      { id: "cb2", type: "html", title: "Echtzeit-Uhr Widget (Ausführbares HTML)", value: `<div class="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono">
  <div id="clock-time" class="text-3xl text-emerald-400 font-bold">00:00:00</div>
  <div class="text-xs text-slate-500 mt-1">Echtzeit-HTML-Sandbox</div>
</div>
<script>
  setInterval(() => {
    const timeEl = document.getElementById('clock-time');
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString();
    }
  }, 1000);
</script>`, isExecuted: true }
    ]
  },
  {
    id: "wissen-wiki",
    title: "Wissensdatenbank & Notizen",
    icon: "BookOpen",
    headerImage: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80",
    widgets: [
      { id: "w-writing", type: "writing-assistant", title: "Schreib-KI", w: 2, h: 2, color: "violet" },
      { id: "w-meeting", type: "meeting-assistant", title: "Meeting-Assistent", w: 2, h: 2, color: "slate" },
      { id: "w-contacts", type: "contacts-manager", title: "CRM & Kontakte", w: 2, h: 2, color: "emerald" }
    ],
    subpages: [],
    contentBlocks: [
      { id: "cb3", type: "text", value: "Hier pflegen Sie Ihre Notizen und Wissen. Verknüpfen Sie Notizen untereinander und nutzen Sie den KI-Schreibassistenten für hervorragenden Ausdruck." },
      { id: "cb4", type: "code", title: "Python Primzahlensieb (Referenz-Code)", language: "python", value: `def sieve_of_eratosthenes(n):
    prime = [True for i in range(n+1)]
    p = 2
    while (p * p <= n):
        if (prime[p] == True):
            for i in range(p * p, n+1, p):
                prime[i] = False
        p += 1
    return [p for p in range(2, n+1) if prime[p]]

# Beispielausgabe
print(sieve_of_eratosthenes(30)) # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]` }
    ]
  },
  {
    id: "reise-planer",
    title: "Reiseplanung & Begleiter",
    icon: "Map",
    headerImage: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80",
    widgets: [
      { id: "w-maps", type: "maps-itinerary", title: "Reisebegleiter", w: 4, h: 2, color: "rose" },
      { id: "w-news", type: "news-bias", title: "News-Bias", w: 2, h: 2, color: "amber" },
      { id: "w-email", type: "email-inbox", title: "E-Mail", w: 2, h: 2, color: "blue" }
    ],
    subpages: [],
    contentBlocks: [
      { id: "cb5", type: "text", value: "Planen Sie Ihre nächsten Reisen mit Google Maps, behalten Sie die Nachrichtenlage im Blick und verwalten Sie Ihre E-Mails intelligent mit KI-Zusammenfassungen." }
    ]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "cosmic-dark",
  accentColor: "gold",
  accentIntensity: "normal",
  backgroundType: "gradient",
  primaryFont: "Inter",
  fontSize: "medium",
  lineSpacing: "normal",
  idleLockTime: "none",
  encryptLocalData: false,
  privacyMode: false,
  anonymizeAiLogs: false,
  geminiModel: "gemini-2.5-flash",
  geminiApiKey: "",
  customApiUrl: "",
  aiTemperature: 0.7,
  systemPromptModifier: "Du bist Zenith, ein hochentwickelter KI-Sicherheits- und Produktivitäts-Assistent.",
  enabledSkills: {
    aiChat: true,
    nlpTasks: true,
    meetingAssistant: true,
    voiceCommands: true,
    mapsTravel: true,
    audioSynth: true,
  },
  audioFeedback: true,
  voiceWakeWord: false,
};

