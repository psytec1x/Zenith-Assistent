import React, { useState, useEffect, useMemo } from "react";
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  FirebaseUser
} from "./firebase";
import { 
  DashboardPage, 
  DashboardWidget, 
  Task, 
  Bookmark, 
  QuickLink, 
  SmartHomeDevice, 
  Email, 
  Contact, 
  NewsArticle, 
  Meeting, 
  ContentBlock,
  AppSettings
} from "./types";
import { 
  INITIAL_PAGES, 
  INITIAL_TASKS, 
  INITIAL_BOOKMARKS, 
  INITIAL_QUICK_LINKS, 
  INITIAL_SMART_DEVICES, 
  INITIAL_EMAILS, 
  INITIAL_CONTACTS, 
  INITIAL_NEWS, 
  INITIAL_MEETINGS,
  DEFAULT_SETTINGS
} from "./data";

// Widgets
import WidgetWrapper from "./components/WidgetWrapper";
import AIChatWidget from "./components/AIChatWidget";
import TodoWidget from "./components/TodoWidget";
import CalendarWidget from "./components/CalendarWidget";
import BookmarksWidget from "./components/BookmarksWidget";
import QuickLinksWidget from "./components/QuickLinksWidget";
import SmartHomeWidget from "./components/SmartHomeWidget";
import NewsBiasWidget from "./components/NewsBiasWidget";
import MusicPlayerWidget from "./components/MusicPlayerWidget";
import EmailInboxWidget from "./components/EmailInboxWidget";
import WritingAssistantWidget from "./components/WritingAssistantWidget";
import ContactsManagerWidget from "./components/ContactsManagerWidget";
import MeetingAssistantWidget from "./components/MeetingAssistantWidget";
import MapsItineraryWidget from "./components/MapsItineraryWidget";
import ContentBlockEditor from "./components/ContentBlockEditor";
import SettingsModal from "./components/SettingsModal";
import PomodoroWidget from "./components/PomodoroWidget";
import FinanceWidget from "./components/FinanceWidget";
import WeatherWidget from "./components/WeatherWidget";

// UI elements & motion
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Map, 
  Plus, 
  Search, 
  LogOut, 
  LogIn, 
  Share2, 
  Download, 
  Bell, 
  Bot, 
  Moon, 
  Menu, 
  X, 
  ChevronRight, 
  User, 
  CheckCircle, 
  AlertCircle,
  FileCode,
  Sparkles,
  Info,
  Mic,
  MicOff,
  Bookmark as BookmarkIcon,
  Mail,
  Music,
  FileText,
  Calendar,
  Settings,
  Shield,
  Palette,
  Type,
  Cpu,
  Layers,
  Database,
  Clock,
  Coins,
  CloudSun,
  Monitor,
  Smartphone
} from "lucide-react";

interface AlertLog {
  id: string;
  message: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
  read: boolean;
}

interface WidgetCatalogItem {
  type: DashboardWidget["type"];
  title: string;
  description: string;
  category: "KI & Agenten" | "Organisation" | "Medien & Links" | "Utilities";
  icon: string;
  iconColor: string;
  color: string;
}

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: "ai-chat",
    title: "KI-Agent",
    description: "Unterhalte dich mit einem intelligenten Assistenten, stelle Fragen oder brainstorme Ideen.",
    category: "KI & Agenten",
    icon: "Bot",
    iconColor: "text-amber-400",
    color: "slate",
  },
  {
    type: "writing-assistant",
    title: "Schreib-KI",
    description: "Lass Texte umschreiben, korrigieren oder neue kreative Entwürfe erstellen.",
    category: "KI & Agenten",
    icon: "Sparkles",
    iconColor: "text-purple-400",
    color: "violet",
  },
  {
    type: "news-bias",
    title: "News-Bias",
    description: "Sammle aktuelle Schlagzeilen und analysiere Nachrichtenartikel auf journalistische Voreingenommenheit.",
    category: "KI & Agenten",
    icon: "FileText",
    iconColor: "text-rose-400",
    color: "rose",
  },
  {
    type: "meeting-assistant",
    title: "Meeting-Assistent",
    description: "Nimm Audiospur auf, transkribiere Gespräche und leite Action-Items ab.",
    category: "KI & Agenten",
    icon: "Mic",
    iconColor: "text-emerald-400",
    color: "emerald",
  },
  {
    type: "email-inbox",
    title: "E-Mail",
    description: "Verwalte dein intelligentes Postfach mit Zusammenfassungen und Antwort-Vorschlägen.",
    category: "KI & Agenten",
    icon: "Mail",
    iconColor: "text-blue-400",
    color: "blue",
  },
  {
    type: "todo",
    title: "Aufgaben",
    description: "Verwalte Aufgaben. Erkennt automatisch Prioritäten und Fälligkeiten aus natürlicher Sprache.",
    category: "Organisation",
    icon: "CheckCircle",
    iconColor: "text-emerald-400",
    color: "emerald",
  },
  {
    type: "calendar",
    title: "Kalender",
    description: "Behalte deine tägliche Agenda und Termine im Blick, verknüpft mit Aufgaben.",
    category: "Organisation",
    icon: "Calendar",
    iconColor: "text-blue-400",
    color: "blue",
  },
  {
    type: "contacts-manager",
    title: "CRM & Kontakte",
    description: "Pflege deine Beziehungen und visualisiere Verbindungen in einem Beziehungsnetzwerk.",
    category: "Organisation",
    icon: "User",
    iconColor: "text-purple-400",
    color: "violet",
  },
  {
    type: "maps-itinerary",
    title: "Reisebegleiter",
    description: "Erstelle Reiserouten, entdecke Sehenswürdigkeiten und nutze den Echtzeit-Übersetzer.",
    category: "Organisation",
    icon: "Map",
    iconColor: "text-rose-400",
    color: "rose",
  },
  {
    type: "bookmarks",
    title: "Lesezeichen",
    description: "Speichere wichtige Lesezeichen mit Ordnern und importiere deine echten Chrome-Lesezeichen.",
    category: "Medien & Links",
    icon: "Bookmark",
    iconColor: "text-amber-400",
    color: "amber",
  },
  {
    type: "quick-links",
    title: "Schnelllinks",
    description: "Richte eine Sammlung von Schnelllinks für deine meistbesuchten Webseiten ein.",
    category: "Medien & Links",
    icon: "LayoutDashboard",
    iconColor: "text-teal-400",
    color: "teal",
  },
  {
    type: "smart-home",
    title: "Smart Home",
    description: "Simuliere die Steuerung und Automatisierung von Smart Home Bluetooth-Geräten.",
    category: "Utilities",
    icon: "Moon",
    iconColor: "text-cyan-400",
    color: "slate",
  },
  {
    type: "music-player",
    title: "Musik-Player",
    description: "Spiele Musikplaylists von Spotify, YouTube und SoundCloud per URL-Eingabe oder intelligenter Suche ab.",
    category: "Medien & Links",
    icon: "Music",
    iconColor: "text-pink-400",
    color: "violet",
  },
  {
    type: "pomodoro",
    title: "Pomodoro",
    description: "Optimiere deine Produktivität mit Intervallsitzungen und wählbaren Natur-Soundscapes.",
    category: "Organisation",
    icon: "Clock",
    iconColor: "text-amber-500",
    color: "amber",
  },
  {
    type: "finance",
    title: "Finanzen",
    description: "Behalte Live-Kurse wie EUR, USD, Gold und Bitcoin mit interaktiven Sparkline-Charts im Blick.",
    category: "Utilities",
    icon: "Coins",
    iconColor: "text-emerald-400",
    color: "emerald",
  },
  {
    type: "weather",
    title: "Wetter",
    description: "Sief das aktuelle Wetter und eine 3-Tage-Vorschau wichtiger europäischer Großstädte.",
    category: "Utilities",
    icon: "CloudSun",
    iconColor: "text-sky-400",
    color: "blue",
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Bot": return Bot;
    case "Sparkles": return Sparkles;
    case "FileText": return FileText;
    case "Mic": return Mic;
    case "Mail": return Mail;
    case "CheckCircle": return CheckCircle;
    case "Calendar": return Calendar;
    case "User": return User;
    case "Map": return Map;
    case "Bookmark": return BookmarkIcon;
    case "LayoutDashboard": return LayoutDashboard;
    case "Moon": return Moon;
    case "Music": return Music;
    case "Clock": return Clock;
    case "Coins": return Coins;
    case "CloudSun": return CloudSun;
    default: return LayoutDashboard;
  }
};

const getIconComponentForWidget = (type: string) => {
  const item = WIDGET_CATALOG.find(w => w.type === type);
  return item ? getIconComponent(item.icon) : LayoutDashboard;
};

const getIconColorForWidget = (type: string) => {
  const item = WIDGET_CATALOG.find(w => w.type === type);
  return item ? item.iconColor : "text-gray-400";
};

const THEME_MAP: Record<string, { bg: string; panel: string; text: string; textMuted: string; borderColor: string; bgGradient: string }> = {
  "cosmic-dark": {
    bg: "#0A0B0E",
    panel: "#111318",
    text: "#D1D5DB",
    textMuted: "#9CA3AF",
    borderColor: "rgba(255, 255, 255, 0.05)",
    bgGradient: "linear-gradient(to bottom, #0A0B0E, #111318)",
  },
  "slate-minimal": {
    bg: "#14161a",
    panel: "#1d2026",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    borderColor: "rgba(255, 255, 255, 0.06)",
    bgGradient: "none",
  },
  "amber-warm": {
    bg: "#120F0D",
    panel: "#1A1613",
    text: "#EADCD0",
    textMuted: "#BBAA9B",
    borderColor: "rgba(197, 160, 89, 0.08)",
    bgGradient: "linear-gradient(to bottom, #120F0D, #1A1613)",
  },
  "forest-green": {
    bg: "#080B09",
    panel: "#0E1410",
    text: "#D8E2DC",
    textMuted: "#A3B19B",
    borderColor: "rgba(255, 255, 255, 0.04)",
    bgGradient: "linear-gradient(to bottom, #080B09, #0E1410)",
  },
  "editorial-light": {
    bg: "#FAF9F6",
    panel: "#FFFFFF",
    text: "#1C1917",
    textMuted: "#6B6661",
    borderColor: "rgba(0, 0, 0, 0.08)",
    bgGradient: "linear-gradient(to bottom, #FAF9F6, #F2EFE9)",
  },
  "oled-black": {
    bg: "#000000",
    panel: "#080808",
    text: "#F3F4F6",
    textMuted: "#9CA3AF",
    borderColor: "rgba(255, 255, 255, 0.1)",
    bgGradient: "none",
  },
};

const ACCENT_COLOR_MAP: Record<string, string> = {
  gold: "#C5A059",
  blue: "#3B82F6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#8B5CF6",
  emerald: "#10B981",
};

const ACCENT_COLOR_DARK_MAP: Record<string, string> = {
  gold: "#8B7344",
  blue: "#1D4ED8",
  amber: "#B45309",
  rose: "#BE123C",
  violet: "#6D28D9",
  emerald: "#047857",
};

const FONT_MAP: Record<string, string> = {
  "Inter": "'Inter', sans-serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  "Outfit": "'Outfit', sans-serif",
  "Playfair Display": "'Playfair Display', serif",
  "JetBrains Mono": "'JetBrains Mono', monospace",
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  // App Data states
  const [pages, setPages] = useState<DashboardPage[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState("main");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(INITIAL_BOOKMARKS);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(INITIAL_QUICK_LINKS);
  const [smartDevices, setSmartDevices] = useState<SmartHomeDevice[]>(INITIAL_SMART_DEVICES);
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [logs, setLogs] = useState<AlertLog[]>([
    { id: "log-1", message: "System gestartet: Wilkommen bei Ihrem KI-Assistenten-Dashboard.", priority: "low", timestamp: new Date().toLocaleTimeString(), read: false }
  ]);

  // Share Dialog state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // App Settings state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [previewMode, setPreviewMode] = useState<"desktop" | "android">("desktop");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPageOptionsModal, setShowPageOptionsModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("Neue Unterseite");
  const [newPageIcon, setNewPageIcon] = useState("BookOpen");
  const [newPageTemplate, setNewPageTemplate] = useState("notes");
  const [newPageCount, setNewPageCount] = useState(1);

  // Custom Cover image state
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState("");

  // Widget catalog search/category states
  const [widgetSearchQuery, setWidgetSearchQuery] = useState("");
  const [selectedWidgetCategory, setSelectedWidgetCategory] = useState("Alle");
  const [isWidgetCatalogExpanded, setIsWidgetCatalogExpanded] = useState(true);

  // Drag and Drop states for widgets
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggedWidgetId;
    if (draggedId && draggedId !== targetId) {
      handleReorderWidgets(draggedId, targetId);
    }
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleReorderWidgets = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    setPages((prevPages) => {
      const updated = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        const widgets = [...page.widgets];
        const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
        const targetIndex = widgets.findIndex((w) => w.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return page;

        const [draggedWidget] = widgets.splice(draggedIndex, 1);
        widgets.splice(targetIndex, 0, draggedWidget);

        return { ...page, widgets };
      });
      saveData(updated, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, activePageId);
      return updated;
    });
    addSystemLog("Widgets neu angeordnet.", "low");
  };

  // Voice control states
  const [isListeningForVoice, setIsListeningForVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Klicken Sie auf das Mikrofon, um zu sprechen.");
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showVoiceHelpModal, setShowVoiceHelpModal] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  // Authentication Observer
  useEffect(() => {
    const storedCustomUser = localStorage.getItem("custom_user");
    if (storedCustomUser) {
      setCurrentUser(JSON.parse(storedCustomUser));
      setAuthLoading(false);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // Fetch or Save user data from Firestore/LocalStorage
  useEffect(() => {
    if (authLoading) return;

    if (currentUser && currentUser.uid !== "admin_user") {
      // Sync from Firestore for real Firebase users
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.pages) setPages(cloudData.pages);
          if (cloudData.tasks) setTasks(cloudData.tasks);
          if (cloudData.bookmarks) setBookmarks(cloudData.bookmarks);
          if (cloudData.quickLinks) setQuickLinks(cloudData.quickLinks);
          if (cloudData.smartDevices) setSmartDevices(cloudData.smartDevices);
          if (cloudData.emails) setEmails(cloudData.emails);
          if (cloudData.contacts) setContacts(cloudData.contacts);
          if (cloudData.news) setNews(cloudData.news);
          if (cloudData.meetings) setMeetings(cloudData.meetings);
          if (cloudData.activePageId) setActivePageId(cloudData.activePageId);
          if (cloudData.sidebarOpen !== undefined) setSidebarOpen(cloudData.sidebarOpen);
          if (cloudData.settings) setSettings(cloudData.settings);
          addSystemLog("Cloud-Daten erfolgreich synchronisiert.", "low");
        } else {
          // Initialize user data in Firestore
          const initialCloudState = {
            pages: INITIAL_PAGES,
            tasks: INITIAL_TASKS,
            bookmarks: INITIAL_BOOKMARKS,
            quickLinks: INITIAL_QUICK_LINKS,
            smartDevices: INITIAL_SMART_DEVICES,
            emails: INITIAL_EMAILS,
            contacts: INITIAL_CONTACTS,
            news: INITIAL_NEWS,
            meetings: INITIAL_MEETINGS,
            activePageId: "main",
            sidebarOpen: true,
            settings: DEFAULT_SETTINGS
          };
          setDoc(userDocRef, initialCloudState);
          addSystemLog("Cloud-Speicher für neuen Benutzer initialisiert.", "medium");
        }
      }).catch((err) => {
        console.error("Firestore sync error:", err);
        addSystemLog("Verbindungsfehler beim Abrufen der Cloud-Daten.", "high");
      });
    } else {
      // LocalStorage fallback for Admin user or Guest mode
      const isSimulatedAdmin = currentUser?.uid === "admin_user";
      const prefix = isSimulatedAdmin ? "admin_" : "ki_";

      const localPages = localStorage.getItem(`${prefix}pages`);
      const localTasks = localStorage.getItem(`${prefix}tasks`);
      const localBookmarks = localStorage.getItem(`${prefix}bookmarks`);
      const localQuickLinks = localStorage.getItem(`${prefix}quicklinks`);
      const localSmartDevices = localStorage.getItem(`${prefix}smartdevices`);
      const localActivePageId = localStorage.getItem(`${prefix}activePageId`);
      const localSidebarOpen = localStorage.getItem(`${prefix}sidebarOpen`);
      const localSettings = localStorage.getItem(`${prefix}settings`);

      if (localPages) {
        setPages(JSON.parse(localPages));
      } else {
        setPages(INITIAL_PAGES);
      }
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      } else {
        setTasks(INITIAL_TASKS);
      }
      if (localBookmarks) {
        setBookmarks(JSON.parse(localBookmarks));
      } else {
        setBookmarks(INITIAL_BOOKMARKS);
      }
      if (localQuickLinks) {
        setQuickLinks(JSON.parse(localQuickLinks));
      } else {
        setQuickLinks(INITIAL_QUICK_LINKS);
      }
      if (localSmartDevices) {
        setSmartDevices(JSON.parse(localSmartDevices));
      } else {
        setSmartDevices(INITIAL_SMART_DEVICES);
      }
      if (localActivePageId) {
        setActivePageId(localActivePageId);
      } else {
        setActivePageId("main");
      }
      if (localSidebarOpen !== null) {
        setSidebarOpen(localSidebarOpen === "true");
      } else {
        setSidebarOpen(true);
      }
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      
      addSystemLog(isSimulatedAdmin ? "Admin-Modus aktiv: Lokale Speicherung." : "Gast-Modus aktiv: Lokale Speicherung.", "low");
    }
  }, [currentUser, authLoading]);

  // Autosave triggers (cloud or local storage)
  const saveData = (
    updatedPages?: DashboardPage[],
    updatedTasks?: Task[],
    updatedBookmarks?: Bookmark[],
    updatedQuickLinks?: QuickLink[],
    updatedSmartDevices?: SmartHomeDevice[],
    updatedEmails?: Email[],
    updatedContacts?: Contact[],
    updatedNews?: NewsArticle[],
    updatedMeetings?: Meeting[],
    updatedActivePageId?: string,
    updatedSidebarOpen?: boolean,
    updatedSettings?: AppSettings
  ) => {
    const currentPages = updatedPages || pages;
    const currentTasks = updatedTasks || tasks;
    const currentBookmarks = updatedBookmarks || bookmarks;
    const currentQuickLinks = updatedQuickLinks || quickLinks;
    const currentSmartDevices = updatedSmartDevices || smartDevices;
    const currentEmails = updatedEmails || emails;
    const currentContacts = updatedContacts || contacts;
    const currentNews = updatedNews || news;
    const currentMeetings = updatedMeetings || meetings;
    const currentActivePageId = updatedActivePageId !== undefined ? updatedActivePageId : activePageId;
    const currentSidebarOpen = updatedSidebarOpen !== undefined ? updatedSidebarOpen : sidebarOpen;
    const currentSettings = updatedSettings || settings;

    if (currentUser && currentUser.uid !== "admin_user") {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, {
        pages: currentPages,
        tasks: currentTasks,
        bookmarks: currentBookmarks,
        quickLinks: currentQuickLinks,
        smartDevices: currentSmartDevices,
        emails: currentEmails,
        contacts: currentContacts,
        news: currentNews,
        meetings: currentMeetings,
        activePageId: currentActivePageId,
        sidebarOpen: currentSidebarOpen,
        settings: currentSettings
      }).catch((err) => console.error("Firestore update failed:", err));
    } else {
      const isSimulatedAdmin = currentUser?.uid === "admin_user";
      const prefix = isSimulatedAdmin ? "admin_" : "ki_";

      localStorage.setItem(`${prefix}pages`, JSON.stringify(currentPages));
      localStorage.setItem(`${prefix}tasks`, JSON.stringify(currentTasks));
      localStorage.setItem(`${prefix}bookmarks`, JSON.stringify(currentBookmarks));
      localStorage.setItem(`${prefix}quicklinks`, JSON.stringify(currentQuickLinks));
      localStorage.setItem(`${prefix}smartdevices`, JSON.stringify(currentSmartDevices));
      localStorage.setItem(`${prefix}activePageId`, currentActivePageId);
      localStorage.setItem(`${prefix}sidebarOpen`, String(currentSidebarOpen));
      localStorage.setItem(`${prefix}settings`, JSON.stringify(currentSettings));
    }
  };

  const addSystemLog = (message: string, priority: "high" | "medium" | "low" = "low") => {
    const newLog: AlertLog = {
      id: "log-" + Date.now(),
      message,
      priority,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    const trimmedEmail = email.trim();
    if (trimmedEmail.toLowerCase() === "admin") {
      if (password === "25041982") {
        const simulatedUser = {
          uid: "admin_user",
          email: "admin@zenith.local",
          displayName: "Admin"
        };
        localStorage.setItem("custom_user", JSON.stringify(simulatedUser));
        setCurrentUser(simulatedUser as any);
        addSystemLog("Erfolgreich als Admin angemeldet.", "medium");
        setEmail("");
        setPassword("");
        return;
      } else {
        setAuthError("Falsches Passwort für Admin.");
        return;
      }
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        addSystemLog("Registrierung erfolgreich. Willkommen!", "medium");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        addSystemLog("Erfolgreich angemeldet.", "medium");
      }
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Authentifizierungsfehler.");
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      addSystemLog("Erfolgreich mit Google angemeldet.", "medium");
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Fehler bei der Google-Anmeldung.");
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("custom_user");
      await signOut(auth);
      setPages(INITIAL_PAGES);
      setTasks(INITIAL_TASKS);
      setBookmarks(INITIAL_BOOKMARKS);
      setQuickLinks(INITIAL_QUICK_LINKS);
      setSmartDevices(INITIAL_SMART_DEVICES);
      setEmails(INITIAL_EMAILS);
      setContacts(INITIAL_CONTACTS);
      setNews(INITIAL_NEWS);
      setMeetings(INITIAL_MEETINGS);
      setSettings(DEFAULT_SETTINGS);
      setActivePageId("main");
      setSidebarOpen(true);
      addSystemLog("Abgemeldet.", "medium");
    } catch (err: any) {
      console.error(err);
    }
  };

  // Dashboard customization actions
  const activePage = useMemo(() => {
    return pages.find((p) => p.id === activePageId) || pages[0];
  }, [pages, activePageId]);

  const filteredCatalog = useMemo(() => {
    return WIDGET_CATALOG.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(widgetSearchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(widgetSearchQuery.toLowerCase());
      const matchesCategory = selectedWidgetCategory === "Alle" || item.category === selectedWidgetCategory;
      return matchesSearch && matchesCategory;
    });
  }, [widgetSearchQuery, selectedWidgetCategory]);

  const handlePageTitleChange = (newPageTitle: string) => {
    const updated = pages.map((p) => p.id === activePageId ? { ...p, title: newPageTitle } : p);
    setPages(updated);
    saveData(updated);
  };

  const handleAddWidget = (type: DashboardWidget["type"]) => {
    if (!activePage) return;

    const catalogItem = WIDGET_CATALOG.find((w) => w.type === type);
    const newWidget: DashboardWidget = {
      id: "w-" + Date.now(),
      type,
      title: catalogItem ? catalogItem.title : "Neues Widget",
      w: 2,
      h: type === "maps-itinerary" || type === "todo" || type === "ai-chat" ? 2 : 1,
      color: "slate"
    };

    const updatedPages = pages.map((p) => 
      p.id === activePageId 
        ? { ...p, widgets: [...p.widgets, newWidget] } 
        : p
    );

    setPages(updatedPages);
    saveData(updatedPages);
    addSystemLog(`Widget "${newWidget.title}" zum Dashboard hinzugefügt.`, "low");
  };

  const handleUpdateWidget = (updatedWidget: DashboardWidget) => {
    const updatedPages = pages.map((p) => 
      p.id === activePageId 
        ? { ...p, widgets: p.widgets.map((w) => w.id === updatedWidget.id ? updatedWidget : w) } 
        : p
    );
    setPages(updatedPages);
    saveData(updatedPages);
  };

  const handleDeleteWidget = (widgetId: string) => {
    const targetWidget = activePage.widgets.find((w) => w.id === widgetId);
    const updatedPages = pages.map((p) => 
      p.id === activePageId 
        ? { ...p, widgets: p.widgets.filter((w) => w.id !== widgetId) } 
        : p
    );
    setPages(updatedPages);
    saveData(updatedPages);
    if (targetWidget) {
      addSystemLog(`Widget "${targetWidget.title}" entfernt.`, "low");
    }
  };

  const handleUpdateContentBlocks = (updatedBlocks: ContentBlock[]) => {
    const updatedPages = pages.map((p) => 
      p.id === activePageId 
        ? { ...p, contentBlocks: updatedBlocks } 
        : p
    );
    setPages(updatedPages);
    saveData(updatedPages);
  };

  const PRESET_COVERS = [
    { name: "Fluid Gold & Charcoal", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" },
    { name: "Geometric Golden Lines", url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80" },
    { name: "Cosmic Gold Dust", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80" },
    { name: "Warm Architecture", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" },
    { name: "Minimal Dark Marble", url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80" }
  ];

  const handleSelectCoverImage = (url: string) => {
    if (!activePage) return;
    const updatedPages = pages.map((p) =>
      p.id === activePageId ? { ...p, headerImage: url } : p
    );
    setPages(updatedPages);
    saveData(updatedPages);
    addSystemLog(`Header-Bild für "${activePage.title}" wurde angepasst.`, "low");
  };

  // Add new Custom Page
  const handleAddNewPage = (options?: { 
    title?: string; 
    icon?: string; 
    isEmpty?: boolean; 
    count?: number; 
    prefilledWidgets?: DashboardWidget["type"][] 
  }) => {
    const count = options?.count || 1;
    let updatedPages = [...pages];
    let lastPageId = "";

    for (let i = 0; i < count; i++) {
      const pageId = "page-" + Date.now() + "-" + i;
      const displayTitle = count > 1 
        ? `${options?.title || "Leere Seite"} ${i + 1}` 
        : (options?.title || "Neue Unterseite");
      
      const newWidgets: DashboardWidget[] = [];
      if (options?.prefilledWidgets) {
        options.prefilledWidgets.forEach((wType, index) => {
          newWidgets.push({
            id: `widget-${wType}-${Date.now()}-${index}`,
            type: wType,
            title: wType === "ai-chat" ? "Persönlicher KI-Agent" : wType === "todo" ? "Aufgabenliste" : wType === "pomodoro" ? "Focus Timer" : "Widget",
            w: 2,
            h: 2,
            color: "slate"
          });
        });
      }

      const newPage: DashboardPage = {
        id: pageId,
        title: displayTitle,
        icon: options?.icon || "BookOpen",
        widgets: newWidgets,
        subpages: [],
        headerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        contentBlocks: options?.isEmpty 
          ? [] 
          : [
              { id: "cb-init-" + Date.now() + "-" + i, type: "text", value: "Notizen, HTML Visualisierungen oder Codesprachen können hier hinzugefügt werden." }
            ]
      };

      updatedPages.push(newPage);
      lastPageId = pageId;
    }

    setPages(updatedPages);
    setActivePageId(lastPageId);
    saveData(updatedPages, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, lastPageId);
    addSystemLog(`${count} neue Seite(n) erstellt.`, "low");
  };

  // Delete Custom Page
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    const target = pages.find((p) => p.id === pageId);
    const updatedPages = pages.filter((p) => p.id !== pageId);
    setPages(updatedPages);
    setActivePageId(pages[0].id);
    saveData(updatedPages, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, pages[0].id);
    if (target) {
      addSystemLog(`Seite "${target.title}" gelöscht.`, "low");
    }
  };

  // Tasks actions
  const handleAddTask = (task: Task) => {
    const updatedTasks = [task, ...tasks];
    setTasks(updatedTasks);
    saveData(undefined, updatedTasks);
    addSystemLog(`Aufgabe "${task.title}" hinzugefügt.`, "low");
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    saveData(undefined, updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    saveData(undefined, updatedTasks);
  };

  // Bookmarks Actions
  const handleAddBookmark = (b: Bookmark) => {
    const updated = [b, ...bookmarks];
    setBookmarks(updated);
    saveData(undefined, undefined, updated);
  };

  const handleAddBookmarks = (newBms: Bookmark[]) => {
    const updated = [...newBms, ...bookmarks];
    setBookmarks(updated);
    saveData(undefined, undefined, updated);
    addSystemLog(`${newBms.length} Google Chrome Lesezeichen erfolgreich importiert.`, "medium");
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveData(undefined, undefined, updated);
  };

  // Quick Links Actions
  const handleAddQuickLink = (link: QuickLink) => {
    const updated = [...quickLinks, link];
    setQuickLinks(updated);
    saveData(undefined, undefined, undefined, updated);
  };

  const handleDeleteQuickLink = (id: string) => {
    const updated = quickLinks.filter((l) => l.id !== id);
    setQuickLinks(updated);
    saveData(undefined, undefined, undefined, updated);
  };

  // Smart Home Device Actions
  const handleUpdateSmartDevice = (updated: SmartHomeDevice) => {
    const updatedDevices = smartDevices.map((d) => d.id === updated.id ? updated : d);
    setSmartDevices(updatedDevices);
    saveData(undefined, undefined, undefined, undefined, updatedDevices);
  };

  // Intelligent Search (Searches across ALL widgets, notes, documents, tasks, contacts, etc.)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();

    const matchedPages = pages.filter((p) => p.title.toLowerCase().includes(query));
    const matchedTasks = tasks.filter((t) => t.title.toLowerCase().includes(query) || (t.notes && t.notes.toLowerCase().includes(query)));
    const matchedBookmarks = bookmarks.filter((b) => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query));
    const matchedContacts = contacts.filter((c) => c.name.toLowerCase().includes(query) || c.notes.toLowerCase().includes(query));
    const matchedMeetings = meetings.filter((m) => m.title.toLowerCase().includes(query) || m.transcript.toLowerCase().includes(query));

    return {
      pages: matchedPages,
      tasks: matchedTasks,
      bookmarks: matchedBookmarks,
      contacts: matchedContacts,
      meetings: matchedMeetings
    };
  }, [searchQuery, pages, tasks, bookmarks, contacts, meetings]);

  // Export Data (JSON)
  const handleExportJSON = () => {
    const fullData = { pages, tasks, bookmarks, quickLinks, smartDevices, emails, contacts, news, meetings };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ki-assistent-backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addSystemLog("Backup-Daten erfolgreich exportiert.", "low");
  };

  // Export Markdown Summary
  const handleExportMarkdown = () => {
    let md = `# KI-Assistent-Dashboard - Bericht\n\nErstellt am ${new Date().toLocaleDateString()}\n\n`;
    
    md += `## 📋 Aufgaben & Termine\n`;
    tasks.forEach((t) => {
      md += `- [${t.completed ? "x" : " "}] ${t.title} (Fällig: ${t.date} um ${t.time}) - Kategorie: ${t.category}\n`;
    });

    md += `\n## 👥 Kontaktnetzwerk Beziehungsdaten\n`;
    contacts.forEach((c) => {
      md += `- **${c.name}** (${c.email}) - Beziehungsstärke: ${c.relationshipStrength}% - Notiz: ${c.notes}\n`;
    });

    md += `\n## 📰 Letzte Nachrichten-Analysen\n`;
    news.forEach((n) => {
      md += `- **${n.title}**\n  - Zusammenfassung: ${n.summary}\n  - Bias-Analyse: ${n.biasAnalysis}\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ki-assistent-bericht.md");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addSystemLog("Bericht im Markdown-Format exportiert.", "low");
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Voice Command Processor & Web Speech API integration
  const processVoiceCommand = (transcript: string) => {
    const clean = transcript.trim().toLowerCase();
    const text = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

    // 1. Help Commands
    if (text === "hilfe" || text === "help" || text === "befehle" || text === "commands") {
      setVoiceStatus("Hilfe geöffnet. Sie können Aufgaben hinzufügen oder Seiten wechseln.");
      addSystemLog("Sprachsteuerung Hilfe aufgerufen.", "low");
      setShowVoiceHelpModal(true);
      return true;
    }

    // 2. Export Markdown Report
    if (
      text.includes("bericht exportieren") ||
      text.includes("exportiere bericht") ||
      text.includes("markdown exportieren") ||
      text.includes("export report") ||
      text.includes("download report") ||
      text.includes("export markdown")
    ) {
      setVoiceStatus("Bericht wird exportiert...");
      handleExportMarkdown();
      addSystemLog("Sprachbefehl: Bericht exportieren", "medium");
      return true;
    }

    // 3. Export Backup JSON
    if (
      text.includes("backup exportieren") ||
      text.includes("daten exportieren") ||
      text.includes("json exportieren") ||
      text.includes("export backup") ||
      text.includes("export json")
    ) {
      setVoiceStatus("Backup wird exportiert...");
      handleExportJSON();
      addSystemLog("Sprachbefehl: Backup exportieren", "medium");
      return true;
    }

    // 4. Create New Page
    if (
      text.includes("neue seite") ||
      text.includes("seite erstellen") ||
      text.includes("seite hinzufügen") ||
      text.includes("create page") ||
      text.includes("new page") ||
      text.includes("add page")
    ) {
      setVoiceStatus("Neue Seite wird erstellt...");
      handleAddNewPage();
      addSystemLog("Sprachbefehl: Neue Seite erstellen", "medium");
      return true;
    }

    // 5. Switch page
    const pagePrefixes = [
      "gehe zu", "öffne", "seite wechseln nach", "seite wechseln", "seite öffnen",
      "go to", "open page", "open", "switch to", "switch"
    ];

    for (const prefix of pagePrefixes) {
      if (text.startsWith(prefix + " ")) {
        const targetTitle = text.slice(prefix.length + 1).trim();
        if (targetTitle) {
          const matchedPage = pages.find(p => p.title.toLowerCase().includes(targetTitle) || targetTitle.includes(p.title.toLowerCase()));
          if (matchedPage) {
            setActivePageId(matchedPage.id);
            setVoiceStatus(`Wechsle zur Seite: ${matchedPage.title}`);
            addSystemLog(`Sprachbefehl: Wechsle zur Seite "${matchedPage.title}"`, "medium");
            return true;
          } else {
            setVoiceStatus(`Seite "${targetTitle}" nicht gefunden.`);
            return false;
          }
        }
      }
    }

    // 6. Add Task
    const taskPrefixes = [
      "aufgabe hinzufügen", "aufgabe", "neue aufgabe",
      "add task", "create task", "task"
    ];

    for (const prefix of taskPrefixes) {
      if (text.startsWith(prefix + " ")) {
        const taskTitle = text.slice(prefix.length + 1).trim();
        if (taskTitle) {
          const formattedTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
          const newTask: Task = {
            id: "task-" + Date.now(),
            title: formattedTitle,
            date: new Date().toISOString().split('T')[0],
            time: "12:00",
            priority: "medium",
            category: "Allgemein",
            completed: false
          };
          handleAddTask(newTask);
          setVoiceStatus(`Aufgabe hinzugefügt: ${formattedTitle}`);
          addSystemLog(`Sprachbefehl: Aufgabe "${formattedTitle}" hinzugefügt`, "medium");
          return true;
        }
      }
    }

    return false;
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Web Speech API wird von Ihrem Browser nicht unterstützt (Empfohlen: Google Chrome).");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "de-DE";

      rec.onstart = () => {
        setIsListeningForVoice(true);
        setVoiceTranscript("");
        setVoiceStatus("Höre zu... Sagen Sie z. B. 'Aufgabe Milch kaufen' oder 'Gehe zu Kalender'");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalResult = event.results[i][0].transcript;
            setVoiceTranscript(finalResult);
            const success = processVoiceCommand(finalResult);
            if (success) {
              rec.stop();
            } else {
              setVoiceStatus(`Befehl nicht erkannt: "${finalResult}". Versuchen Sie es erneut.`);
            }
          } else {
            interim += event.results[i][0].transcript;
            setVoiceTranscript(interim);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          setVoiceStatus("Keine Sprache erkannt. Bitte erneut versuchen.");
        } else {
          setVoiceStatus(`Fehler: ${event.error}`);
        }
        setIsListeningForVoice(false);
      };

      rec.onend = () => {
        setIsListeningForVoice(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningForVoice(false);
  };

  const unreadLogsCount = logs.filter((l) => !l.read).length;

  const isAndroid = previewMode === "android";

  const renderInnerLayout = () => {
    return (
      <div className={`flex flex-1 w-full min-w-0 relative ${isAndroid ? "h-full bg-[var(--bg-color)]" : ""}`}>
      
      {/* Notion Sidebar Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[var(--border-color)] bg-[var(--panel-color)] flex flex-col h-screen shrink-0 relative overflow-hidden"
          >
            {/* App Branding */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-gold" />
                </div>
                <div>
                  <h1 className="text-gold font-serif italic text-lg tracking-tight leading-tight">KI-Dashboard</h1>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-gray-500 block">Zenith Assistant</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white sm:hidden">
                <X size={16} />
              </button>
            </div>

            {/* Global Search box */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-600" size={13} />
                <input
                  type="text"
                  placeholder="Globale Suche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-mono"
                />
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold font-mono text-gray-500 uppercase tracking-widest block px-2 mb-2">Seiten & Dokumente</span>
                {pages.map((p) => {
                  const isActive = p.id === activePageId;
                  return (
                    <div key={p.id} className="space-y-0.5">
                      <div
                        className={`group/page flex items-center justify-between rounded-lg p-2.5 transition-all ${
                          isActive
                            ? "bg-white/5 border border-gold/20 text-white font-medium"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <button
                          onClick={() => setActivePageId(p.id)}
                          className={`flex items-center space-x-2.5 flex-1 min-w-0 text-left text-xs ${isActive ? "text-white font-semibold" : "text-slate-400"}`}
                        >
                          {isActive ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 animate-pulse"></div>
                          ) : (
                            p.icon === "LayoutDashboard" ? <LayoutDashboard size={13} className="text-gray-500" /> : <BookOpen size={13} className="text-gray-500" />
                          )}
                          <span className="truncate">{p.title}</span>
                        </button>

                        {/* Delete Custom Pages */}
                        {pages.length > 1 && (
                          <button
                            onClick={() => handleDeletePage(p.id)}
                            className="opacity-0 group-hover/page:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded transition-opacity"
                            title="Seite löschen"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Nest widgets under each page */}
                      {p.widgets && p.widgets.length > 0 && (
                        <div className="pl-4 pr-1 py-1 space-y-1 border-l border-white/5 ml-3.5 mb-1.5 animate-fadeIn">
                          {p.widgets.map((widget) => {
                            const IconComponent = getIconComponentForWidget(widget.type);
                            const iconColor = getIconColorForWidget(widget.type);
                            return (
                              <button
                                key={widget.id}
                                onClick={() => {
                                  // Switch page if needed
                                  if (p.id !== activePageId) {
                                    setActivePageId(p.id);
                                  }
                                  // Scroll the widget into view and flash highlight it
                                  setTimeout(() => {
                                    const el = document.getElementById(`widget-${widget.id}`);
                                    if (el) {
                                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                                      el.classList.add("ring-2", "ring-gold", "duration-500");
                                      setTimeout(() => {
                                        el.classList.remove("ring-2", "ring-gold");
                                      }, 1500);
                                    }
                                  }, 100);
                                }}
                                className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-white transition-colors py-1 px-1.5 rounded hover:bg-white/5 text-left group/widget"
                              >
                                <span className="flex items-center space-x-2 truncate">
                                  <IconComponent size={11} className={`${iconColor} opacity-70 group-hover/widget:opacity-100 shrink-0`} />
                                  <span className="truncate font-sans text-slate-400 group-hover/widget:text-slate-200">
                                    {widget.title || widget.type}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => setShowPageOptionsModal(true)}
                  className="w-full flex items-center space-x-2 px-2.5 py-2 hover:bg-white/5 text-gray-500 hover:text-gold border border-dashed border-white/5 rounded-lg text-left text-xs transition-colors"
                >
                  <Plus size={14} />
                  <span className="font-semibold font-mono text-[10px]">Neue Seite erstellen</span>
                </button>
              </div>

              {/* Quick Backup/Export Actions */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-[10px]">
                <span className="font-bold font-mono text-gray-500 uppercase tracking-widest block px-2 mb-1">Berichte & Backup</span>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-colors font-mono"
                >
                  <Download size={12} className="text-gold" />
                  <span>Markdown-Bericht</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-colors font-mono"
                >
                  <FileCode size={12} className="text-gold" />
                  <span>Backup (JSON) exportieren</span>
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-colors font-mono mt-1"
                >
                  <Settings size={12} className="text-gold" />
                  <span>Systemeinstellungen</span>
                </button>
              </div>
            </div>

            {/* Profile / Firebase Auth Area */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold to-gold-dark flex items-center justify-center shrink-0 shadow-md">
                      <User size={12} className="text-black font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-white block truncate">{currentUser.email}</span>
                      <span className="text-[8px] font-mono text-gold tracking-wider uppercase block">Cloud Synchronized</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-[10px] font-mono bg-black/30 hover:bg-rose-950/20 hover:text-rose-400 rounded-lg border border-white/5 text-slate-400 transition-all"
                  >
                    <LogOut size={10} />
                    <span>Abmelden</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold font-mono text-gray-500 uppercase tracking-wider block">Cloud Sync aktivieren</span>
                  <form onSubmit={handleAuthSubmit} className="space-y-1.5 text-[9px] font-mono">
                    <input
                      type="text"
                      placeholder="E-Mail oder Benutzername..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/5 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-gold/30"
                    />
                    <input
                      type="password"
                      placeholder="Passwort..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/5 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-gold/30"
                    />
                    {authError && (
                      <span className="text-rose-400 block leading-snug">{authError.substring(0, 45)}</span>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-gold hover:bg-[#b08e4d] text-black font-bold py-1.5 rounded transition-colors flex items-center justify-center space-x-1 uppercase text-[8px] cursor-pointer"
                    >
                      <LogIn size={10} />
                      <span>{isRegistering ? "Registrieren" : "Anmelden"}</span>
                    </button>
                  </form>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[7px] uppercase font-mono">
                      <span className="bg-[#111318] px-2 text-slate-500">Oder</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold py-1.5 rounded transition-all flex items-center justify-center space-x-2 text-[8px] uppercase font-mono cursor-pointer"
                  >
                    <svg className="w-3 h-3 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Mit Google anmelden</span>
                  </button>

                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[8px] text-slate-400 hover:text-white underline text-center block w-full font-mono mt-1"
                  >
                    {isRegistering ? "Bereits Account? Anmelden" : "Kein Account? Registrieren"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
        
        {/* Universal Top Dashboard Header */}
        <header className={`${previewMode === "android" ? "h-16 px-4" : "h-20 px-8"} border-b border-white/5 flex items-center justify-between bg-[#111318]/20 shrink-0`}>
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <Menu size={16} />
              </button>
            )}
            
            <div>
              <p className="text-[9px] text-[#C5A059] uppercase tracking-[0.2em] font-mono font-semibold mb-0.5">
                {currentUser ? `CHIEF ARCHITECT : ${currentUser.uid.substring(0, 6).toUpperCase()}` : "GUEST WORKSPACE : GUEST-992"}
              </p>
              <div className="flex items-center">
                <input
                  type="text"
                  value={activePage ? activePage.title : "Unbenannt"}
                  onChange={(e) => handlePageTitleChange(e.target.value)}
                  className={`bg-transparent font-serif text-white focus:outline-none focus:border-b focus:border-gold/30 rounded px-1 ${
                    previewMode === "android" ? "text-sm min-w-[100px] max-w-[125px]" : "text-lg min-w-[200px]"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Viewport Switcher */}
            <div className="flex bg-black/40 border border-white/5 p-1 rounded-full text-xs shrink-0 mr-1 sm:mr-2">
              <button
                onClick={() => {
                  setPreviewMode("desktop");
                  addSystemLog("Ansicht gewechselt: Desktop", "low");
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-all ${
                  previewMode === "desktop"
                    ? "bg-gold text-black font-bold shadow-md shadow-gold/10"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Desktop-Ansicht"
              >
                <Monitor size={12} />
                <span className="hidden md:inline text-[10px]">Desktop</span>
              </button>
              <button
                onClick={() => {
                  setPreviewMode("android");
                  addSystemLog("Ansicht gewechselt: Android (Mobil)", "low");
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-all ${
                  previewMode === "android"
                    ? "bg-gold text-black font-bold shadow-md shadow-gold/10"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Android-Mobil-Ansicht"
              >
                <Smartphone size={12} />
                <span className="hidden md:inline text-[10px]">Android</span>
              </button>
            </div>

            {previewMode !== "android" && (
              <>
                {/* Quick Share anchor */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-5 py-1.5 border border-white/10 rounded-full text-xs text-slate-300 hover:bg-white/5 transition-colors font-mono"
                >
                  Teilen
                </button>

                {/* Voice Control Toggle Button */}
                <button
                  onClick={() => {
                    setShowVoicePanel(!showVoicePanel);
                    if (showVoicePanel) {
                      stopVoiceRecognition();
                    } else {
                      startVoiceRecognition();
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-5 py-1.5 border rounded-full text-xs font-mono transition-all ${
                    isListeningForVoice
                      ? "bg-rose-950/30 border-rose-600/50 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                      : showVoicePanel
                      ? "bg-gold/15 border-gold/40 text-gold"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                  title="Sprachsteuerung umschalten"
                >
                  {isListeningForVoice ? <Mic className="animate-bounce text-rose-400" size={13} /> : <Mic size={13} />}
                  <span>Voice Control</span>
                </button>

                {/* Markdown Export Report Button */}
                <button
                  onClick={handleExportMarkdown}
                  className="px-5 py-1.5 bg-[#C5A059] text-black font-semibold rounded-full text-xs hover:bg-[#b08e4d] transition-colors"
                >
                  Bericht exportieren
                </button>
              </>
            )}

            {/* Priorities Alarm Log Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white relative"
                title="System-Benachrichtigungen"
              >
                <Bell size={16} />
                {unreadLogsCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white font-bold text-[8px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadLogsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotificationCenter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 z-50 bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-xl w-72 text-xs space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar"
                  >
                    <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5 flex justify-between items-center font-mono">
                      <span>Benachrichtigungen & Warnungen</span>
                      <button
                        onClick={() => {
                          setLogs(logs.map((l) => ({ ...l, read: true })));
                          setShowNotificationCenter(false);
                        }}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        Alle gelesen
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {logs.length === 0 ? (
                        <div className="text-slate-600 text-[10px] py-4 text-center">Keine neuen Logs.</div>
                      ) : (
                        logs.map((log) => (
                          <div
                            key={log.id}
                            className={`p-2 rounded border text-[10px] font-mono flex items-start space-x-2 ${
                              log.priority === "high" ? "bg-rose-950/20 border-rose-900/40 text-rose-300" :
                              log.priority === "medium" ? "bg-amber-950/20 border-amber-900/40 text-amber-300" :
                              "bg-slate-900 border-slate-850 text-slate-400"
                            }`}
                          >
                            {log.priority === "high" ? <AlertCircle size={12} className="shrink-0 mt-0.5" /> : <Info size={12} className="shrink-0 mt-0.5" />}
                            <div className="flex-1 leading-snug">
                              <div>{log.message}</div>
                              <span className="text-[8px] text-slate-600 block mt-0.5">{log.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              title="Systemeinstellungen"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Voice Control Floating Command Board */}
        <AnimatePresence>
          {showVoicePanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#111318]/90 border-b border-white/5 backdrop-blur-md overflow-hidden shrink-0"
            >
              <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Glowing Mic button */}
                  <button
                    onClick={isListeningForVoice ? stopVoiceRecognition : startVoiceRecognition}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isListeningForVoice
                        ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse"
                        : "bg-gold hover:bg-[#b08e4d] text-black"
                    }`}
                    title={isListeningForVoice ? "Zuhören stoppen" : "Zuhören starten"}
                  >
                    {isListeningForVoice ? <Mic size={20} className="animate-bounce text-white" /> : <Mic size={20} className="text-black" />}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C5A059] font-mono">
                        Zenith Voice Control
                      </span>
                      {isListeningForVoice && (
                        <span className="flex space-x-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          <span className="text-[9px] text-rose-400 font-mono">LIVE</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white mt-1 leading-tight">
                      {voiceStatus}
                    </p>
                    {voiceTranscript && (
                      <p className="text-[10px] text-slate-300 mt-1 italic font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 inline-block">
                        Gezielt erkannt: "{voiceTranscript}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Available commands list */}
                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 max-w-md w-full">
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#C5A059] uppercase tracking-wider mb-1 font-mono">
                    <span>Unterstützte Sprachbefehle :</span>
                    <button 
                      onClick={() => setShowVoiceHelpModal(true)}
                      className="text-white hover:underline lowercase font-normal text-[9px]"
                    >
                      Befehlsliste öffnen
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] font-mono text-gray-400">
                    <div>• <span className="text-white">"Aufgabe [titel]"</span></div>
                    <div>• <span className="text-white">"Gehe zu [seite]"</span></div>
                    <div>• <span className="text-white">"Neue Seite"</span></div>
                    <div>• <span className="text-white">"Bericht exportieren"</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Global Search results modal view */}
        {searchQuery.trim() && (
          <div className="bg-[#0b0f19] border-b border-slate-900 p-6 overflow-y-auto max-h-[300px] shrink-0 custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1">
              <Search size={14} className="text-emerald-400" />
              <span>Intelligente Suchergebnisse für: "{searchQuery}"</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults?.tasks && searchResults.tasks.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg space-y-1.5">
                  <span className="font-bold text-[10px] text-emerald-400 block font-mono">Aufgaben ({searchResults.tasks.length})</span>
                  {searchResults.tasks.map((t) => (
                    <div key={t.id} className="text-[11px] hover:underline cursor-pointer" onClick={() => setSearchQuery("")}>
                      • {t.title}
                    </div>
                  ))}
                </div>
              )}

              {searchResults?.contacts && searchResults.contacts.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg space-y-1.5">
                  <span className="font-bold text-[10px] text-emerald-400 block font-mono">Kontakte ({searchResults.contacts.length})</span>
                  {searchResults.contacts.map((c) => (
                    <div key={c.id} className="text-[11px] hover:underline cursor-pointer" onClick={() => setSearchQuery("")}>
                      • {c.name} ({c.email})
                    </div>
                  ))}
                </div>
              )}

              {searchResults?.meetings && searchResults.meetings.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg space-y-1.5">
                  <span className="font-bold text-[10px] text-emerald-400 block font-mono">Besprechungen ({searchResults.meetings.length})</span>
                  {searchResults.meetings.map((m) => (
                    <div key={m.id} className="text-[11px] hover:underline cursor-pointer" onClick={() => setSearchQuery("")}>
                      • {m.title} ({m.date})
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(!searchResults?.tasks.length && !searchResults?.contacts.length && !searchResults?.meetings.length) && (
              <span className="text-slate-500 font-mono text-[11px]">Keine passenden Übereinstimmungen gefunden.</span>
            )}
          </div>
        )}

        {/* Primary Page Canvas Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          
          {/* Customizable Cover Banner */}
          {activePage && (
            <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden group mb-6 border border-white/5 shadow-2xl" id="page-cover-banner">
              <img
                src={activePage.headerImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"}
                alt="Page Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              {/* Cover adjustment overlay */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setShowCoverModal(true)}
                  className="px-4 py-1.5 bg-black/70 border border-white/10 hover:border-gold/40 text-slate-200 hover:text-white rounded-full text-[10px] font-mono hover:bg-gold hover:text-black transition-all flex items-center space-x-1.5 shadow-lg backdrop-blur-sm"
                  title="Header-Bild anpassen"
                  id="change-header-btn"
                >
                  <Sparkles size={11} className="text-gold" />
                  <span>Header anpassen</span>
                </button>
              </div>

              {/* Title overlay or breadcrumb on the banner */}
              <div className="absolute bottom-4 left-6 pointer-events-none">
                <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-gold font-semibold drop-shadow-md">
                  Zenith Workspace Cover
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white drop-shadow-md mt-1 italic font-medium">
                  {activePage.title}
                </h2>
              </div>
            </div>
          )}

          {/* Custom Description Block Editor */}
          {activePage && (
            <section className="max-w-4xl space-y-4">
              <ContentBlockEditor
                blocks={activePage.contentBlocks || []}
                onUpdateBlocks={handleUpdateContentBlocks}
              />
            </section>
          )}

          {/* Notion-style Widget Directory */}
          {activePage && (
            <section className="space-y-4 bg-slate-950/30 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex justify-between items-center w-full md:w-auto">
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] font-mono block mb-1">
                      Workspace-Anpassung
                    </span>
                    <h3 className="text-sm font-serif text-white tracking-wide flex items-center space-x-1.5 italic">
                      <Plus size={14} className="text-gold animate-pulse" />
                      <span>Widget & Integrationsverzeichnis</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsWidgetCatalogExpanded(!isWidgetCatalogExpanded)}
                    className="md:hidden px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono border border-white/5 transition-all"
                  >
                    {isWidgetCatalogExpanded ? "Einklappen ▲" : "Ausklappen ▼"}
                  </button>
                </div>

                {/* Search & Categories container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setIsWidgetCatalogExpanded(!isWidgetCatalogExpanded)}
                    className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono border border-white/5 transition-all"
                  >
                    <span>{isWidgetCatalogExpanded ? "Verzeichnis einklappen ▲" : "Verzeichnis ausklappen ▼"}</span>
                  </button>

                  {/* Search bar */}
                  {isWidgetCatalogExpanded && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                      <input
                        type="text"
                        placeholder="Nach Widgets filtern..."
                        value={widgetSearchQuery}
                        onChange={(e) => setWidgetSearchQuery(e.target.value)}
                        className="w-full sm:w-56 bg-black/40 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-sans transition-all"
                      />
                      {widgetSearchQuery && (
                        <button 
                          onClick={() => setWidgetSearchQuery("")}
                          className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isWidgetCatalogExpanded && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Category selector */}
                  <div className="flex flex-wrap gap-1.5">
                    {["Alle", "KI & Agenten", "Organisation", "Medien & Links", "Utilities"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedWidgetCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border ${
                          selectedWidgetCategory === cat
                            ? "bg-gold border-transparent text-black font-bold shadow-lg shadow-gold/10"
                            : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Widgets Grid */}
                  <div className={`grid gap-4 pt-2 ${isAndroid ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                    {filteredCatalog.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-slate-500 font-mono text-[11px] border border-dashed border-white/5 rounded-xl bg-black/10">
                        Keine Widgets entsprechen deiner Suche.
                      </div>
                    ) : (
                      filteredCatalog.map((item) => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                          <div
                            key={item.type}
                            onClick={() => handleAddWidget(item.type)}
                            className="group bg-black/30 hover:bg-black/50 border border-white/5 hover:border-gold/40 rounded-xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-md"
                          >
                            {/* Hover overlay border */}
                            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2.5">
                                <div className={`p-2 rounded-lg bg-white/5 shrink-0 ${item.iconColor}`}>
                                  <IconComponent size={14} />
                                </div>
                                <span className="font-serif text-xs font-semibold text-white tracking-wide group-hover:text-gold transition-colors">
                                  {item.title}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                              <span className="text-[8px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {item.category}
                              </span>
                              
                              <span className="text-[9px] font-bold text-slate-400 group-hover:text-gold transition-colors flex items-center space-x-0.5 font-mono">
                                <span>+ Hinzufügen</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Grid Layout of active page Widgets */}
          {activePage && (
            <section className="space-y-4">
              <div className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] font-mono">Interaktives Kontrollzentrum :</div>
              <div className={`grid gap-6 ${isAndroid ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"}`}>
                <AnimatePresence>
                  {activePage.widgets.map((widget) => (
                    <WidgetWrapper
                      key={widget.id}
                      widget={widget}
                      onUpdate={handleUpdateWidget}
                      onDelete={() => handleDeleteWidget(widget.id)}
                      isMobile={isAndroid}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      onDrop={handleDrop}
                      isDragging={draggedWidgetId === widget.id}
                      isDragOver={dragOverWidgetId === widget.id}
                    >
                      {widget.type === "ai-chat" && (
                        <AIChatWidget onAddLog={(log) => addSystemLog(log, "low")} />
                      )}
                      {widget.type === "todo" && (
                        <TodoWidget
                          tasks={tasks}
                          onAddTask={handleAddTask}
                          onToggleTask={handleToggleTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      )}
                      {widget.type === "calendar" && (
                        <CalendarWidget
                          tasks={tasks}
                          onAddTask={handleAddTask}
                        />
                      )}
                      {widget.type === "bookmarks" && (
                        <BookmarksWidget
                          bookmarks={bookmarks}
                          onAddBookmark={handleAddBookmark}
                          onAddBookmarks={handleAddBookmarks}
                          onDeleteBookmark={handleDeleteBookmark}
                        />
                      )}
                      {widget.type === "quick-links" && (
                        <QuickLinksWidget
                          links={quickLinks}
                          onAddLink={handleAddQuickLink}
                          onDeleteLink={handleDeleteQuickLink}
                        />
                      )}
                      {widget.type === "smart-home" && (
                        <SmartHomeWidget
                          devices={smartDevices}
                          onUpdateDevice={handleUpdateSmartDevice}
                          onAddLog={(log) => addSystemLog(log, "low")}
                        />
                      )}
                      {widget.type === "news-bias" && (
                        <NewsBiasWidget
                          initialNews={news}
                          onAddLog={(log) => addSystemLog(log, "medium")}
                        />
                      )}
                      {widget.type === "music-player" && (
                        <MusicPlayerWidget />
                      )}
                      {widget.type === "email-inbox" && (
                        <EmailInboxWidget
                          initialEmails={emails}
                          onAddLog={(log) => addSystemLog(log, "low")}
                        />
                      )}
                      {widget.type === "writing-assistant" && (
                        <WritingAssistantWidget />
                      )}
                      {widget.type === "contacts-manager" && (
                        <ContactsManagerWidget
                          initialContacts={contacts}
                          onAddLog={(log) => addSystemLog(log, "medium")}
                        />
                      )}
                      {widget.type === "meeting-assistant" && (
                        <MeetingAssistantWidget
                          initialMeetings={meetings}
                          onAddTask={handleAddTask}
                          onAddLog={(log) => addSystemLog(log, "medium")}
                        />
                      )}
                      {widget.type === "maps-itinerary" && (
                        <MapsItineraryWidget />
                      )}
                      {widget.type === "pomodoro" && (
                        <PomodoroWidget />
                      )}
                      {widget.type === "finance" && (
                        <FinanceWidget />
                      )}
                      {widget.type === "weather" && (
                        <WeatherWidget />
                      )}
                    </WidgetWrapper>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

  return (
    <div 
      className={`min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex font-sans overflow-x-hidden antialiased ${
        isAndroid 
          ? "items-center justify-center py-10 px-4 bg-neutral-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/30 via-black to-black" 
          : ""
      }`}
      style={{
        "--bg-color": THEME_MAP[settings.theme]?.bg || "#0A0B0E",
        "--panel-color": THEME_MAP[settings.theme]?.panel || "#111318",
        "--text-color": THEME_MAP[settings.theme]?.text || "#D1D5DB",
        "--text-muted": THEME_MAP[settings.theme]?.textMuted || "#9CA3AF",
        "--border-color": THEME_MAP[settings.theme]?.borderColor || "rgba(255, 255, 255, 0.05)",
        "--color-gold": ACCENT_COLOR_MAP[settings.accentColor] || "#C5A059",
        "--color-gold-dark": ACCENT_COLOR_DARK_MAP[settings.accentColor] || "#8B7344",
        "--font-sans": FONT_MAP[settings.primaryFont] || "'Inter', sans-serif",
        background: isAndroid 
          ? "none" 
          : (settings.backgroundType === "gradient" ? THEME_MAP[settings.theme]?.bgGradient : THEME_MAP[settings.theme]?.bg),
        fontSize: settings.fontSize === "small" ? "13px" : settings.fontSize === "large" ? "16px" : "14px",
        lineHeight: settings.lineSpacing === "compact" ? "1.25" : settings.lineSpacing === "spacious" ? "1.75" : "1.5",
      } as React.CSSProperties}
    >
      {isAndroid ? (
        <div className="w-full h-screen sm:w-[390px] sm:h-[844px] bg-[var(--bg-color)] sm:rounded-[24px] sm:border sm:border-white/10 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] sm:ring-1 sm:ring-white/5 flex flex-col overflow-hidden relative animate-scaleIn">
          <div className="flex-1 overflow-hidden relative">
            {renderInnerLayout()}
          </div>
        </div>
      ) : (
        renderInnerLayout()
      )}

      {/* Share/Embed modal popover */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl w-full max-w-sm text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 font-mono">
              <span className="font-bold text-slate-200">Dashboard teilen & einbetten</span>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Teile dein individualisiertes Assistenten-Dashboard mit anderen Benutzern oder binde es per iframe in dein persönliches Wiki ein.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] break-all select-all text-slate-400">
              {window.location.href}
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleShareLink}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Share2 size={12} />
                <span>{copiedLink ? "Link kopiert!" : "Link kopieren"}</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Control Help Modal */}
      {showVoiceHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-md text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-serif italic text-base text-gold flex items-center space-x-2">
                <Mic size={16} className="text-gold shrink-0 animate-pulse" />
                <span>Sprachsteuerung Befehlsliste</span>
              </span>
              <button 
                onClick={() => setShowVoiceHelpModal(false)} 
                className="text-gray-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-400 leading-relaxed font-sans">
              Steuern Sie Ihr Zenith-Dashboard ganz einfach über Ihre Stimme. Wir unterstützen deutsche und englische Befehle! Sprechen Sie fließend und klar.
            </p>

            <div className="space-y-3 font-mono text-[10px] max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
              <div className="border border-white/5 bg-black/30 p-3 rounded-lg space-y-1">
                <div className="text-[#C5A059] font-bold uppercase tracking-wider">• Aufgabe hinzufügen</div>
                <div className="text-white font-semibold">"Aufgabe [titel]" / "Add task [title]"</div>
                <div className="text-gray-500 text-[9px]">Beispiel: "Aufgabe Milch kaufen"</div>
              </div>

              <div className="border border-white/5 bg-black/30 p-3 rounded-lg space-y-1">
                <div className="text-[#C5A059] font-bold uppercase tracking-wider">• Seite wechseln</div>
                <div className="text-white font-semibold">"Gehe zu [seite]" / "Go to [page]"</div>
                <div className="text-gray-500 text-[9px]">Beispiel: "Gehe zu Terminkalender" oder "Go to Main"</div>
              </div>

              <div className="border border-white/5 bg-black/30 p-3 rounded-lg space-y-1">
                <div className="text-[#C5A059] font-bold uppercase tracking-wider">• Neue Seite erstellen</div>
                <div className="text-white font-semibold">"Neue Seite" / "Create page"</div>
                <div className="text-gray-500 text-[9px]">Erstellt augenblicklich eine neue, leere Seite.</div>
              </div>

              <div className="border border-white/5 bg-black/30 p-3 rounded-lg space-y-1">
                <div className="text-[#C5A059] font-bold uppercase tracking-wider">• Berichte & Daten exportieren</div>
                <div className="text-white font-semibold">"Bericht exportieren" / "Backup exportieren"</div>
                <div className="text-gray-500 text-[9px]">Lädt Berichte (Markdown) oder Backups (JSON) herunter.</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowVoiceHelpModal(false)}
                className="w-full bg-[#C5A059] hover:bg-[#b08e4d] text-black font-semibold py-2 rounded-lg transition-colors text-[11px]"
              >
                Verstanden & Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Cover Selector Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn" id="cover-modal">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-lg text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-serif italic text-base text-gold flex items-center space-x-2">
                <Sparkles size={16} className="text-gold shrink-0 animate-pulse" />
                <span>Header-Bild anpassen</span>
              </span>
              <button 
                onClick={() => setShowCoverModal(false)} 
                className="text-gray-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-400 leading-relaxed font-sans">
              Wählen Sie eines unserer exklusiven, kuratierten Zenith-Motive oder fügen Sie eine eigene Bild-URL ein, um das Aussehen dieser Seite zu personalisieren.
            </p>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block font-mono">Zenith Presets :</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      handleSelectCoverImage(preset.url);
                      setShowCoverModal(false);
                    }}
                    className={`group relative h-20 rounded-lg overflow-hidden border border-white/5 hover:border-gold/50 transition-all text-left ${
                      activePage?.headerImage === preset.url ? "ring-2 ring-gold border-transparent" : ""
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/60 flex items-end p-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-mono text-white truncate w-full">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block font-mono">Eigene Bild-URL einfügen :</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-mono"
                />
                <button
                  onClick={() => {
                    if (customCoverUrl.trim()) {
                      handleSelectCoverImage(customCoverUrl.trim());
                      setCustomCoverUrl("");
                      setShowCoverModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-gold hover:bg-[#b08e4d] text-black font-semibold rounded-lg text-xs transition-colors font-sans"
                >
                  Anwenden
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowCoverModal(false)}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-[10px]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          saveData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newSettings);
        }}
        onReset={() => {
          setSettings(DEFAULT_SETTINGS);
          saveData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, DEFAULT_SETTINGS);
        }}
      />

      {/* Page template & selection options modal */}
      {showPageOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-md text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-serif italic text-sm text-gold flex items-center space-x-2">
                <Plus size={16} className="text-gold shrink-0 animate-pulse" />
                <span>Neue Seite konfigurieren</span>
              </span>
              <button 
                onClick={() => setShowPageOptionsModal(false)} 
                className="text-gray-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {/* Page Title */}
              <div>
                <label className="text-[10px] font-bold text-gold uppercase tracking-wider block font-mono mb-1">
                  Seitentitel
                </label>
                <input
                  type="text"
                  placeholder="z.B. Lernecke, Arbeitsbereich..."
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-sans"
                />
              </div>

              {/* Icon Choice */}
              <div>
                <label className="text-[10px] font-bold text-gold uppercase tracking-wider block font-mono mb-1">
                  Symbol / Icon wählen
                </label>
                <div className="flex gap-2">
                  {[
                    { key: "BookOpen", label: "📄 Buch" },
                    { key: "LayoutDashboard", label: "📊 Dashboard" },
                    { key: "Compass", label: "🧭 Kompass" },
                    { key: "Star", label: "⭐ Stern" },
                    { key: "Calendar", label: "📅 Kalender" }
                  ].map((ic) => (
                    <button
                      key={ic.key}
                      onClick={() => setNewPageIcon(ic.key)}
                      className={`flex-1 py-1.5 rounded-lg border text-center text-[10px] transition-all font-sans ${
                        newPageIcon === ic.key
                          ? "bg-gold border-transparent text-black font-semibold"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Choice */}
              <div>
                <label className="text-[10px] font-bold text-gold uppercase tracking-wider block font-mono mb-1">
                  Vorlage / Inhaltstyp
                </label>
                <div className="space-y-2">
                  {[
                    { 
                      key: "notes", 
                      title: "Dokumenten- & Notizen-Vorlage", 
                      desc: "Enthält ein Standard-Textblock für Dokumente und Mitschriften." 
                    },
                    { 
                      key: "blank", 
                      title: "Einzelne leere Seite", 
                      desc: "Eine vollkommen leere Seite ohne vordefinierte Bausteine." 
                    },
                    { 
                      key: "blank-multiple", 
                      title: "Mehrere leere Seiten erstellen (Massen-Erstellung)", 
                      desc: "Erstellt eine Serie von vollkommen leeren Seiten auf einmal." 
                    },
                    { 
                      key: "ai", 
                      title: "KI-Fokus Workspace", 
                      desc: "Wird vorausgestattet mit KI-Chatbot, Schreibassistent und Pomodoro." 
                    },
                    { 
                      key: "finance", 
                      title: "Arbeits- & Finanzhub", 
                      desc: "Wird vorausgestattet mit Aufgabenliste, Finanzticker und Wetter." 
                    }
                  ].map((tpl) => (
                    <div
                      key={tpl.key}
                      onClick={() => setNewPageTemplate(tpl.key)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        newPageTemplate === tpl.key
                          ? "bg-gold/10 border-gold/40 text-white"
                          : "bg-black/30 border-white/5 hover:border-white/10 text-slate-400"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[11px] font-semibold ${newPageTemplate === tpl.key ? "text-gold" : "text-slate-300"}`}>
                          {tpl.title}
                        </span>
                        {newPageTemplate === tpl.key && <span className="text-[9px] text-gold">✓ Aktiv</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{tpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of blank pages input if blank-multiple is chosen */}
              {newPageTemplate === "blank-multiple" && (
                <div className="animate-fadeIn space-y-1">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-wider block font-mono">
                    Anzahl der leeren Seiten
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newPageCount}
                    onChange={(e) => setNewPageCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-mono"
                  />
                  <span className="text-[9px] text-gray-500 block font-mono">Maximal 10 Seiten auf einmal erstellen.</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex gap-2.5 justify-end">
              <button
                onClick={() => setShowPageOptionsModal(false)}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-[10px]"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  let isEmpty = false;
                  let count = 1;
                  let prefilledWidgets: any[] | undefined = undefined;

                  if (newPageTemplate === "blank") {
                    isEmpty = true;
                  } else if (newPageTemplate === "blank-multiple") {
                    isEmpty = true;
                    count = newPageCount;
                  } else if (newPageTemplate === "ai") {
                    prefilledWidgets = ["ai-chat", "writing-assistant", "pomodoro"];
                  } else if (newPageTemplate === "finance") {
                    prefilledWidgets = ["todo", "finance", "weather"];
                  }

                  handleAddNewPage({
                    title: newPageTitle.trim() || "Neue Seite",
                    icon: newPageIcon,
                    isEmpty,
                    count,
                    prefilledWidgets
                  });

                  setShowPageOptionsModal(false);
                }}
                className="bg-gold hover:bg-[#b08e4d] text-black font-bold py-2 px-4 rounded-lg transition-colors text-[10px]"
              >
                Seite(n) erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
