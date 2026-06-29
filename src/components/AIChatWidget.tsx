import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Mic, MicOff, Volume2, VolumeX, Send, Bot, User } from "lucide-react";

interface AIChatWidgetProps {
  onAddLog: (log: string) => void;
}

export default function AIChatWidget({ onAddLog }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "Hallo! Ich bin dein intelligenter KI-Agent. Wie kann ich dir heute assistieren?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [speakResponse, setSpeakResponse] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Web Speech Synthesis
  const speakText = (text: string) => {
    if (!speakResponse) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "de-DE";
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition
  let recognition: any = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.lang = "de-DE";
    recognition.interimResults = false;
  }

  const toggleSpeechRecognition = () => {
    if (!recognition) {
      alert("Spracherkennung wird in diesem Browser leider nicht unterstützt.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          modelName: selectedModel,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            content: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
      speakText(data.text);
      onAddLog(`KI-Chat (${selectedModel}): "${userMessage}" -> "${data.text.substring(0, 30)}..."`);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", text: `Fehler: ${err.message || "Es gab ein Verbindungsproblem."}` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Settings Row */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center space-x-1">
          <Bot size={14} className="text-gold" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-black/60 border border-white/5 text-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-gold/30 font-mono"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Standard)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Experte)</option>
            <option value="llama3">Llama 3 (Minds)</option>
            <option value="mistral">Mistral (Open Source)</option>
          </select>
        </div>

        <button
          onClick={() => setSpeakResponse(!speakResponse)}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border transition-all ${
            speakResponse ? "text-gold bg-gold/10 border-gold/20" : "text-gray-500 bg-black/40 border-white/5 hover:text-white"
          } text-[10px]`}
          title="Text-zu-Sprache vorlesen"
        >
          {speakResponse ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span>{speakResponse ? "Laut" : "Stumm"}</span>
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[300px] p-2 bg-black/30 rounded-lg border border-white/5 custom-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role !== "user" && (
              <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                <Bot size={10} className="text-gold" />
              </div>
            )}
            <div
              className={`p-2.5 rounded-lg max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-gold/10 border border-gold/20 text-white"
                  : "bg-dark-panel border border-white/5 text-slate-300"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User size={10} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px]">
            <Sparkles size={12} className="animate-spin text-gold" />
            <span>KI-Agent generiert Antwort...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-1.5 pt-1">
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2 rounded-lg border shrink-0 transition-colors ${
            isListening
              ? "bg-rose-950/40 border-rose-700 text-rose-400 animate-pulse"
              : "bg-black/40 hover:bg-[#15181e] border-white/5 text-gray-400 hover:text-white"
          }`}
          title="Spracheingabe (Speech-to-Text)"
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Höre zu..." : "Schreibe dem Assistenten..."}
          className="flex-1 bg-black/40 border border-white/5 focus:border-gold/30 rounded-lg px-3 py-1.5 text-slate-200 placeholder-gray-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2 bg-gold hover:bg-[#b08e4d] disabled:bg-gold/20 text-black rounded-lg disabled:text-[#8B7344] transition-colors font-semibold"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
