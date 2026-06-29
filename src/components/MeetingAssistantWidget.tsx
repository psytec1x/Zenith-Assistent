import React, { useState } from "react";
import { Meeting, Task } from "../types";
import { Mic, MicOff, RefreshCw, Sparkles, Check, Play, Square, Calendar } from "lucide-react";

interface MeetingAssistantWidgetProps {
  initialMeetings: Meeting[];
  onAddTask: (task: Task) => void;
  onAddLog: (log: string) => void;
}

export default function MeetingAssistantWidget({ initialMeetings, onAddTask, onAddLog }: MeetingAssistantWidgetProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTranscript, setRecordingTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const activeMeeting = meetings[selectedIdx];

  // Speech Recognition hook-up
  let recognition: any = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.lang = "de-DE";
    recognition.interimResults = true;
  }

  const startSpeechRecording = () => {
    if (!recognition) {
      alert("Spracherkennung wird in diesem Browser nicht unterstützt. Simuliere Gespräch...");
      setIsRecording(true);
      setRecordingTranscript("Wir besprechen heute das Projekt-Budget. Thomas soll den Projektplan bis Freitag erstellen. Die Werbekampagne wird auf September verschoben.");
      return;
    }

    setIsRecording(true);
    setRecordingTranscript("");
    recognition.start();

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setRecordingTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  const stopSpeechRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleProcessTranscript = async () => {
    if (!recordingTranscript.trim()) return;
    setProcessing(true);

    try {
      // Prompt proxy server-side chat
      const prompt = `Analysiere folgendes Meeting-Protokoll (Transkript) und erstelle strukturierte Notizen sowie eine To-Do Action-Item Liste im JSON Format.
Transkript:
"${recordingTranscript}"

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "notes": Zusammenfassung des Gesprächs auf Deutsch
- "actionItems": Array von konkreten To-Do-Aktionen auf Deutsch (z.B. ["Thomas soll Projektplan erstellen bis Freitag"])`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, modelName: "gemini-2.5-flash" })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse JSON from text response
      const cleanedText = (data.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      const title = newTitle.trim() || `Besprechung ${new Date().toLocaleDateString()}`;
      const newMeeting: Meeting = {
        id: "meet-" + Date.now(),
        title,
        date: new Date().toISOString().split("T")[0],
        transcript: recordingTranscript,
        notes: parsed.notes || "Zusammenfassung konnte nicht generiert werden.",
        actionItems: parsed.actionItems || []
      };

      // Add parsed actions automatically as Sync tasks
      if (parsed.actionItems && Array.isArray(parsed.actionItems)) {
        parsed.actionItems.forEach((item: string, idx: number) => {
          onAddTask({
            id: `task-meet-${Date.now()}-${idx}`,
            title: item,
            date: new Date().toISOString().split("T")[0],
            time: "12:00",
            priority: "medium",
            category: "Meeting",
            completed: false,
            notes: `Automatisch erstellt aus Meeting: "${title}"`
          });
        });
      }

      setMeetings((prev) => [newMeeting, ...prev]);
      setSelectedIdx(0);
      setRecordingTranscript("");
      setNewTitle("");
      onAddLog(`Besprechungsassistent: Meeting "${title}" transkribiert. ${newMeeting.actionItems?.length || 0} To-Dos exportiert.`);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei Protokollanalyse: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Meetings Selector & Recording toggles */}
      <div className="flex gap-2 items-center justify-between border-b border-white/5 pb-2">
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(parseInt(e.target.value))}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[10px] flex-1 focus:outline-none"
        >
          {meetings.map((m, idx) => (
            <option key={m.id} value={idx}>
              {m.title} ({m.date})
            </option>
          ))}
        </select>

        <div className="flex space-x-1 shrink-0">
          {isRecording ? (
            <button
              onClick={stopSpeechRecording}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-slate-950 rounded flex items-center space-x-1 text-[10px] font-bold animate-pulse"
            >
              <Square size={10} fill="currentColor" />
              <span>Stopp</span>
            </button>
          ) : (
            <button
              onClick={startSpeechRecording}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded flex items-center space-x-1 text-[10px] font-bold"
            >
              <Play size={10} fill="currentColor" />
              <span>Aufnahme</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Recording Workspace vs Selected Meeting Info */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Recording / Transcript pannel */}
        <div className="flex flex-col space-y-1.5">
          <span className="text-slate-500 font-bold block font-mono text-[9px] uppercase">Laufende Transkription:</span>
          <div className="flex-1 bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] text-slate-300 overflow-y-auto max-h-[140px] custom-scrollbar italic leading-relaxed">
            {recordingTranscript || "Aufnahme starten, um Echtzeit-Transkription zu starten..."}
          </div>

          {recordingTranscript && (
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Name der Besprechung..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-[10px] focus:outline-none"
              />
              <button
                onClick={handleProcessTranscript}
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-1 rounded transition-colors flex items-center justify-center space-x-1 text-[10px]"
              >
                {processing ? (
                  <>
                    <RefreshCw size={10} className="animate-spin" />
                    <span>KI analysiert Transkript...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={10} />
                    <span>Besprechungsprotokoll generieren</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Selected Meeting Info Panel */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/60 overflow-y-auto max-h-[180px] custom-scrollbar text-[10px] space-y-2.5">
          {activeMeeting ? (
            <>
              <div>
                <span className="text-slate-200 font-bold block mb-1 font-mono text-[9px] flex items-center space-x-1">
                  <Calendar size={10} />
                  <span>Notizen & Zusammenfassung ({activeMeeting.date}):</span>
                </span>
                <p className="text-slate-300 leading-normal italic">{activeMeeting.notes}</p>
              </div>

              {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1 font-mono text-[9px] uppercase">Erfasste Aufgaben (To-Dos):</span>
                  <ul className="space-y-1 pl-2">
                    {activeMeeting.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5 text-slate-300 leading-tight">
                        <Check size={8} className="text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-600 italic py-8 font-mono">Keine Besprechung ausgewählt.</div>
          )}
        </div>
      </div>
    </div>
  );
}
