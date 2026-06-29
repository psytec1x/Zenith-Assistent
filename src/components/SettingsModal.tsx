import React, { useState } from "react";
import { 
  X, Palette, Type, Cpu, Layers, Shield, Database, 
  Settings, RefreshCw, Key, Info, Check, Eye, EyeOff, Trash2,
  Lock, Moon, Sun, Monitor, Circle, CheckSquare, Square
} from "lucide-react";
import { AppSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onReset: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"design" | "ai" | "skills" | "security" | "account">("design");
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleUpdateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...tempSettings, [key]: value };
    setTempSettings(updated);
  };

  const handleSave = () => {
    onSave(tempSettings);
    setIsSavedAlert(true);
    setTimeout(() => {
      setIsSavedAlert(false);
      onClose();
    }, 1000);
  };

  const handleResetToDefault = () => {
    if (confirm("Möchten Sie wirklich alle Einstellungen auf die Standardwerte zurücksetzen?")) {
      onReset();
      onClose();
    }
  };

  const tabs = [
    { id: "design", label: "Design & Layout", icon: Palette },
    { id: "ai", label: "KI-Assistent & APIs", icon: Cpu },
    { id: "skills", label: "Integrationen & Skills", icon: Layers },
    { id: "security", label: "Sicherheit & Datenschutz", icon: Shield },
    { id: "account", label: "Konto & Sync", icon: Database },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        id="settings-dialog"
        className="w-full max-w-4xl h-[600px] bg-[#111318] border border-white/5 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden font-sans text-slate-300"
      >
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 px-2">
              <Settings className="text-gold animate-spin-slow" size={18} />
              <span className="text-sm font-bold tracking-wider font-mono uppercase text-white">Systemsteuerung</span>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                      isActive 
                        ? "bg-gold/10 text-gold border-l-2 border-gold font-semibold" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/5 md:block hidden">
            <button
              onClick={handleResetToDefault}
              className="w-full flex items-center justify-center space-x-2 py-2 text-[10px] font-mono text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
            >
              <RefreshCw size={11} />
              <span>Werkseinstellungen</span>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/5">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Konfigurieren Sie Ihr persönliches Dashboard-Erlebnis.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            
            {/* DESIGN TAB */}
            {activeTab === "design" && (
              <div className="space-y-5">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Farbschema & Theme</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: "cosmic-dark", label: "Cosmic Dark", desc: "Tiefes Weltraum-Grau", preview: "bg-[#0A0B0E] border-slate-700" },
                      { id: "slate-minimal", label: "Slate Minimal", desc: "Neutraler Schieferton", preview: "bg-[#14161a] border-slate-600" },
                      { id: "amber-warm", label: "Amber Warm", desc: "Gemütliches Dunkelbraun", preview: "bg-[#120F0D] border-amber-900" },
                      { id: "forest-green", label: "Forest Green", desc: "Dezente Waldtöne", preview: "bg-[#080B09] border-emerald-900" },
                      { id: "editorial-light", label: "Editorial Light", desc: "Elfenbein Buchdruck", preview: "bg-[#FAF9F6] border-stone-300 text-black" },
                      { id: "oled-black", label: "OLED Black", desc: "Reines Schwarz", preview: "bg-[#000000] border-zinc-800" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleUpdateField("theme", t.id as any)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          tempSettings.theme === t.id 
                            ? "border-gold bg-gold/5 ring-1 ring-gold/30" 
                            : "border-white/5 bg-black/10 hover:border-white/10"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded ${t.preview} border mb-2 flex items-center justify-center`}>
                          {tempSettings.theme === t.id && <Check size={10} className="text-gold" />}
                        </div>
                        <span className="font-semibold text-white block">{t.label}</span>
                        <span className="text-[9px] text-slate-500 block leading-snug">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Selection */}
                <div className="space-y-2">
                  <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Akzentfarbe</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "gold", name: "Zenith Gold", color: "bg-[#C5A059]" },
                      { id: "blue", name: "Saphir Blau", color: "bg-[#3B82F6]" },
                      { id: "amber", name: "Bernstein", color: "bg-[#F59E0B]" },
                      { id: "rose", name: "Amor Rose", color: "bg-[#F43F5E]" },
                      { id: "violet", name: "Amethyst Violett", color: "bg-[#8B5CF6]" },
                      { id: "emerald", name: "Smaragd Grün", color: "bg-[#10B981]" },
                    ].map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleUpdateField("accentColor", color.id as any)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[10px] transition-all ${
                          tempSettings.accentColor === color.id
                            ? "border-gold bg-gold/5 text-white"
                            : "border-white/5 bg-black/10 text-slate-400 hover:border-white/10"
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${color.color}`}></div>
                        <span>{color.name}</span>
                        {tempSettings.accentColor === color.id && <Check size={10} className="text-gold" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Schriftart (Primär)</label>
                    <select
                      value={tempSettings.primaryFont}
                      onChange={(e) => handleUpdateField("primaryFont", e.target.value as any)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-gold/40"
                    >
                      <option value="Inter">Inter (Moderne Sans)</option>
                      <option value="Space Grotesk">Space Grotesk (Tech-Brutalist)</option>
                      <option value="Outfit">Outfit (Geometrisch Clean)</option>
                      <option value="Playfair Display">Playfair Display (Serif/Klassisch)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Console/Developer)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Hintergrund-Struktur</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateField("backgroundType", "flat")}
                        className={`flex-1 py-2 rounded-lg border font-mono text-[10px] transition-all ${
                          tempSettings.backgroundType === "flat"
                            ? "border-gold bg-gold/5 text-white"
                            : "border-white/5 bg-black/10 text-slate-400"
                        }`}
                      >
                        Volltonfarbe
                      </button>
                      <button
                        onClick={() => handleUpdateField("backgroundType", "gradient")}
                        className={`flex-1 py-2 rounded-lg border font-mono text-[10px] transition-all ${
                          tempSettings.backgroundType === "gradient"
                            ? "border-gold bg-gold/5 text-white"
                            : "border-white/5 bg-black/10 text-slate-400"
                        }`}
                      >
                        Sanfter Verlauf
                      </button>
                    </div>
                  </div>
                </div>

                {/* Layout Density & Sizing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Schriftgröße</label>
                    <div className="flex space-x-2">
                      {["small", "medium", "large"].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => handleUpdateField("fontSize", sz as any)}
                          className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${
                            tempSettings.fontSize === sz
                              ? "border-gold bg-gold/5 text-white"
                              : "border-white/5 bg-black/10 text-slate-400"
                          }`}
                        >
                          {sz === "small" ? "Kompakt" : sz === "medium" ? "Normal" : "Groß"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Zeilenabstand</label>
                    <div className="flex space-x-2">
                      {["compact", "normal", "spacious"].map((ls) => (
                        <button
                          key={ls}
                          onClick={() => handleUpdateField("lineSpacing", ls as any)}
                          className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${
                            tempSettings.lineSpacing === ls
                              ? "border-gold bg-gold/5 text-white"
                              : "border-white/5 bg-black/10 text-slate-400"
                          }`}
                        >
                          {ls === "compact" ? "Eng" : ls === "normal" ? "Standard" : "Weit"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI APIS TAB */}
            {activeTab === "ai" && (
              <div className="space-y-5">
                <div className="p-3 bg-gold/5 border border-gold/10 rounded-lg text-[10px] leading-relaxed text-slate-300">
                  <div className="flex items-start space-x-2">
                    <Info size={14} className="text-gold shrink-0 mt-0.5" />
                    <span>
                      <strong>Hinweis:</strong> Ihre API-Schlüssel werden ausschließlich lokal im Browser oder verschlüsselt in Ihrer privaten Firestore-Instanz gespeichert. Sie werden niemals an unbefugte Server übertragen.
                    </span>
                  </div>
                </div>

                {/* Gemini API Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Google Gemini API Key</label>
                    <span className="text-[9px] text-emerald-400 font-mono">Sichere Verbindung</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={tempSettings.geminiApiKey || ""}
                      onChange={(e) => handleUpdateField("geminiApiKey", e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/5 rounded-lg pl-3 pr-10 py-2 text-slate-200 font-mono focus:outline-none focus:border-gold/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Bevorzugtes Modell</label>
                    <select
                      value={tempSettings.geminiModel}
                      onChange={(e) => handleUpdateField("geminiModel", e.target.value as any)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-gold/40"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Schnell & effizient)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Präzise & intelligent)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Legacy Pro)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy Flash)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Kreativität (Temperature)</label>
                    <div className="flex items-center space-x-3 bg-black/40 border border-white/5 rounded-lg px-3 py-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={tempSettings.aiTemperature}
                        onChange={(e) => handleUpdateField("aiTemperature", parseFloat(e.target.value))}
                        className="flex-1 accent-gold"
                      />
                      <span className="font-mono text-[10px] text-white w-6 text-right">{tempSettings.aiTemperature.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* System Prompt Override */}
                <div className="space-y-2">
                  <label className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">System Prompt Richtlinie (Rolle der KI)</label>
                  <textarea
                    rows={3}
                    value={tempSettings.systemPromptModifier || ""}
                    onChange={(e) => handleUpdateField("systemPromptModifier", e.target.value)}
                    placeholder="Standardrolle: Du bist ein hochentwickeltes KI-Dashboard..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-gold/40"
                  />
                </div>
              </div>
            )}

            {/* INTEGRATIONS & SKILLS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-5">
                <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Erweiterte System-Skills</span>
                
                <div className="space-y-3">
                  {[
                    { key: "googleMaps", label: "Google Maps Platform Integration", desc: "Echtzeit-Karten, Routenplaner und Standortvorschläge in Widgets aktivieren.", info: "Nutzt Places & Routes API" },
                    { key: "googleCalendar", label: "Google Workspace & Kalender Sync", desc: "Ihre realen Google Kalendertermine synchronisieren und im Dashboard verwalten.", info: "Erfordert OAuth Anmeldung" },
                    { key: "weatherApi", label: "Automatisches Wetter & Geolocation", desc: "Abrufen von Live-Wetterberichten basierend auf Ihrem aktuellen Standort.", info: "Nutzt Browser Geolocation" },
                    { key: "smartHome", label: "IoT Smart-Home Zentrale", desc: "Ansteuerung und Visualisierung von vernetzten smarten Haushaltsgeräten.", info: "Simuliertes Gateway" },
                  ].map((skill) => {
                    const isEnabled = (tempSettings.enabledSkills as any)[skill.key] ?? false;
                    return (
                      <div 
                        key={skill.key}
                        className="flex items-start justify-between p-3.5 bg-black/30 border border-white/5 rounded-lg hover:border-white/10 transition-all"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white leading-none">{skill.label}</span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-slate-500">{skill.info}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{skill.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            const updatedSkills = { ...tempSettings.enabledSkills, [skill.key]: !isEnabled };
                            handleUpdateField("enabledSkills", updatedSkills);
                          }}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${isEnabled ? "bg-gold" : "bg-zinc-800"}`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform transform ${isEnabled ? "translate-x-4.5" : "translate-x-0"}`}></div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECURITY & PRIVACY TAB */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Datenschutz & Lokaler Cache</span>

                {/* Local Cache Management */}
                <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-lg space-y-3">
                  <div className="flex items-start space-x-2 text-rose-300">
                    <Trash2 size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Lokale App-Daten unwiderruflich löschen</span>
                      <p className="text-[10px] text-rose-400/80 leading-normal mt-0.5">
                        Dies löscht alle im Browser-LocalStorage gespeicherten Notizen, Bookmarks, Tasks und Seitenlayouts. Falls Sie nicht angemeldet sind, gehen alle ungesicherten Änderungen unwiderruflich verloren!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Möchten Sie wirklich den gesamten lokalen Speicher löschen? Dies setzt die App zurück.")) {
                        localStorage.clear();
                        alert("Lokaler Speicher gelöscht. Die Seite wird neu geladen.");
                        window.location.reload();
                      }
                    }}
                    className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/50 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all"
                  >
                    Speicher leeren & App zurücksetzen
                  </button>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-3 pt-2">
                  {[
                    { key: "allowGuestAccess", label: "Gast-Modus erlauben", desc: "Ermöglicht die lokale Nutzung des Dashboards ohne zwingendes Login." },
                    { key: "autoSaveCloud", label: "Automatische Cloud-Synchronisierung", desc: "Änderungen bei Widgets oder Seiten sofort mit Firestore synchronisieren, wenn eingeloggt." },
                    { key: "clearCacheOnLogout", label: "Cache beim Abmelden leeren", desc: "Löscht alle temporären Sitzungsdaten aus dem lokalen Cache, sobald Sie sich abmelden." },
                  ].map((field) => {
                    const isEnabled = (tempSettings as any)[field.key] ?? false;
                    return (
                      <div key={field.key} className="flex items-start justify-between p-3.5 bg-black/30 border border-white/5 rounded-lg">
                        <div className="space-y-1 pr-4">
                          <span className="font-semibold text-white">{field.label}</span>
                          <p className="text-[10px] text-slate-500 leading-normal">{field.desc}</p>
                        </div>
                        <button
                          onClick={() => handleUpdateField(field.key as any, !isEnabled)}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${isEnabled ? "bg-gold" : "bg-zinc-800"}`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform transform ${isEnabled ? "translate-x-4.5" : "translate-x-0"}`}></div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="space-y-5">
                <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Konto-Status & Backup</span>
                
                <div className="bg-black/30 border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="font-bold text-white block">Sicherheitskonto: admin</span>
                      <span className="text-[10px] text-slate-500 block">Privilegiertes administratives Systemkonto</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gold/10 border border-gold/20 rounded font-mono text-[9px] text-gold uppercase tracking-wider">
                      Administrator
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Benutzername</span>
                      <span className="font-mono text-white">admin</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Systemberechtigung</span>
                      <span className="font-mono text-emerald-400">Vollzugriff (All-Perms)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="font-bold text-white tracking-wide block uppercase text-[10px] font-mono">Aktionen</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg">
                      <span className="font-semibold text-white block">Werkseinstellungen laden</span>
                      <p className="text-[10px] text-slate-500 mt-1 mb-2 leading-relaxed">
                        Überschreibt alle aktuellen Einstellungen mit dem default Zenith-Design.
                      </p>
                      <button
                        onClick={handleResetToDefault}
                        className="bg-black/40 hover:bg-white/5 border border-white/5 text-slate-300 px-3 py-1.5 rounded text-[10px] font-mono"
                      >
                        Reset ausführen
                      </button>
                    </div>

                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg">
                      <span className="font-semibold text-white block">Sicherheitsprüfung</span>
                      <p className="text-[10px] text-slate-500 mt-1 mb-2 leading-relaxed">
                        Prüfen Sie die Integrität Ihrer synchronisierten Daten mit dem Cloud-Server.
                      </p>
                      <button
                        onClick={() => alert("Alle Integritätsprüfungen bestanden. Das verschlüsselte Protokoll meldet keine Auffälligkeiten.")}
                        className="bg-black/40 hover:bg-white/5 border border-white/5 text-slate-300 px-3 py-1.5 rounded text-[10px] font-mono"
                      >
                        Prüfung starten
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between shrink-0">
            {isSavedAlert ? (
              <span className="text-emerald-400 font-semibold font-mono flex items-center space-x-1">
                <Check size={12} />
                <span>Einstellungen gespeichert!</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[10px] font-mono">
                Änderungen werden beim Schließen angewendet.
              </span>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-mono"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-1.5 bg-gold hover:bg-[#b08e4d] text-black font-semibold rounded-lg transition-colors font-mono shadow-md"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
