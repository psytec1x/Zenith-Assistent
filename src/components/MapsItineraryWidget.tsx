import React, { useState } from "react";
import { Map, MapPin, Navigation, Languages, Mic, Volume2, Sparkles, RefreshCw } from "lucide-react";

export default function MapsItineraryWidget() {
  const [startLoc, setStartLoc] = useState("Berlin");
  const [endLoc, setEndLoc] = useState("München");
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; stops: string[] } | null>({
    distance: "585 km",
    duration: "5 Std. 30 Min.",
    stops: ["Nürnberg (Tankstopp)", "Leipzig (Kaffeepause)"]
  });
  const [planning, setPlanning] = useState(false);

  // Translation states
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("en-US");
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Web Speech synthesis
  const speakTranslation = () => {
    if (!translatedText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition for Translation
  let recognition: any = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.lang = "de-DE";
  }

  const startTranslationListening = () => {
    if (!recognition) {
      alert("Spracherkennung wird nicht unterstützt.");
      return;
    }
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      translateWord(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const translateWord = async (textToTranslate: string) => {
    const trimmed = textToTranslate.trim();
    if (!trimmed) return;
    setTranslating(true);

    try {
      const prompt = `Übersetze folgenden deutschen Text exakt in das Sprachkürzel: ${targetLang}. 
Text: "${trimmed}"
Antworte NUR mit dem reinen übersetzten Text, ohne Anmerkungen, Anführungszeichen oder Markdown.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, modelName: "gemini-2.5-flash" })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTranslatedText(data.text.trim());
    } catch (err) {
      console.error(err);
      setTranslatedText("[Übersetzungsfehler - Bitte API-Key prüfen]");
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    translateWord(inputText);
  };

  const handleRoutePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLoc.trim() || !endLoc.trim()) return;
    setPlanning(true);

    try {
      const prompt = `Berechne eine Reiseroute von "${startLoc}" nach "${endLoc}" per Fortbewegungsmittel: ${travelMode}.
Gib strukturierte Reisedetails im JSON Format zurück.
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "distance": z.B. "585 km"
- "duration": z.B. "5 Std. 30 Min."
- "stops": Array von sinnvollen Zwischenstopps oder Pausenempfehlungen auf Deutsch`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, modelName: "gemini-2.5-flash" })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const cleanedText = (data.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      setRouteInfo({
        distance: parsed.distance || "Unbekannt",
        duration: parsed.duration || "Unbekannt",
        stops: parsed.stops || []
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setRouteInfo({
        distance: "Berechnet (Simuliert)",
        duration: "4 Std. 45 Min.",
        stops: ["Autobahnraststätte", "Spritstopp"]
      });
    } finally {
      setPlanning(false);
    }
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case "en-US": return "Englisch";
      case "es-ES": return "Spanisch";
      case "fr-FR": return "Französisch";
      case "it-IT": return "Italienisch";
      case "ja-JP": return "Japanisch";
      default: return code;
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      <div className="grid grid-cols-2 gap-4 flex-1">
        
        {/* Left column: Itinerary Route Planner with Google Maps API simulator */}
        <div className="space-y-2 flex flex-col justify-between">
          <form onSubmit={handleRoutePlan} className="space-y-1.5 text-[10px]">
            <span className="text-slate-400 font-semibold font-mono flex items-center space-x-1">
              <MapPin size={10} className="text-rose-400" />
              <span>Routenplanung (Google Maps Proxy):</span>
            </span>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="text"
                placeholder="Startort..."
                value={startLoc}
                onChange={(e) => setStartLoc(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Zielort..."
                value={endLoc}
                onChange={(e) => setEndLoc(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded text-[9px] px-1 py-0.5"
              >
                <option value="DRIVING">Auto (PKW)</option>
                <option value="TRANSIT">ÖPNV / Bahn</option>
                <option value="BICYCLING">Fahrrad</option>
                <option value="WALKING">Fußweg</option>
              </select>
              <button
                type="submit"
                disabled={planning}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded flex items-center space-x-1 text-[9px]"
              >
                {planning ? <RefreshCw size={8} className="animate-spin" /> : <Navigation size={8} />}
                <span>Route planen</span>
              </button>
            </div>
          </form>

          {/* Maps Iframe Visualizer */}
          <div className="flex-1 bg-slate-950/40 rounded-lg border border-slate-900 overflow-hidden relative min-h-[90px]">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(startLoc)}+to+${encodeURIComponent(endLoc)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {routeInfo && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-900/60 text-[9px] font-mono flex justify-between items-center">
              <div>Distanz: <span className="text-emerald-400 font-bold">{routeInfo.distance}</span></div>
              <div>Dauer: <span className="text-emerald-400 font-bold">{routeInfo.duration}</span></div>
            </div>
          )}
        </div>

        {/* Right column: Voice translator */}
        <div className="space-y-2 flex flex-col justify-between">
          <form onSubmit={handleTranslateSubmit} className="space-y-1.5 text-[10px]">
            <span className="text-slate-400 font-semibold font-mono flex items-center space-x-1">
              <Languages size={10} className="text-emerald-400" />
              <span>Echtzeit-Sprachübersetzer:</span>
            </span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={startTranslationListening}
                className={`p-1.5 rounded border transition-all shrink-0 ${
                  isListening
                    ? "bg-rose-950/40 border-rose-700 text-rose-400 animate-pulse"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
                title="Sprechen zum Übersetzen"
              >
                <Mic size={12} />
              </button>
              <input
                type="text"
                placeholder="Gib Text ein oder sprich..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded text-[9px] px-1 py-0.5"
              >
                <option value="en-US">nach Englisch</option>
                <option value="es-ES">nach Spanisch</option>
                <option value="fr-FR">nach Französisch</option>
                <option value="it-IT">nach Italienisch</option>
                <option value="ja-JP">nach Japanisch</option>
              </select>
              <button
                type="submit"
                disabled={translating || !inputText.trim()}
                className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center space-x-1 text-[9px]"
              >
                {translating ? <RefreshCw size={8} className="animate-spin" /> : <Sparkles size={8} />}
                <span>Übersetzen</span>
              </button>
            </div>
          </form>

          {/* Translation Result Panel */}
          <div className="flex-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex flex-col justify-between max-h-[110px]">
            <div className="overflow-y-auto custom-scrollbar flex-1 italic leading-normal pr-1">
              {translatedText || "Übersetzung wird hier angezeigt..."}
            </div>

            {translatedText && (
              <button
                onClick={speakTranslation}
                className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 text-[9px] font-mono mt-2 pt-1 border-t border-white/5 w-max"
              >
                <Volume2 size={10} />
                <span>Lautsprecher ({getLanguageLabel(targetLang)})</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
