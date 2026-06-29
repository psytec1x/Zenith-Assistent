import React, { useState } from "react";
import { Contact } from "../types";
import { Users, UserPlus, Trash2, Heart, MessageSquare, Phone, Sparkles, RefreshCw } from "lucide-react";

interface ContactsManagerWidgetProps {
  initialContacts: Contact[];
  onAddLog: (log: string) => void;
}

export default function ContactsManagerWidget({ initialContacts, onAddLog }: ContactsManagerWidgetProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const activeContact = contacts[selectedIdx];

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newC: Contact = {
      id: "cont-" + Date.now(),
      name: newName.trim(),
      email: newEmail.trim() || "Keine E-Mail",
      phone: newPhone.trim() || "Keine Nummer",
      relationshipStrength: 50,
      lastContactDate: new Date().toISOString().split("T")[0],
      notes: newNotes.trim() || "Keine zusätzlichen Notizen.",
      suggestions: ["Melde dich zeitnah für ein kurzes Gespräch."]
    };

    setContacts((prev) => [...prev, newC]);
    setSelectedIdx(contacts.length); // Select newly added contact
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewNotes("");
    setShowAddForm(false);
    onAddLog(`Kontaktverwaltung: Neuer Kontakt "${newC.name}" hinzugefügt.`);
  };

  const getAIEmpfehlungen = async () => {
    if (!activeContact) return;
    setLoadingSuggestions(true);

    try {
      const res = await fetch("/api/suggest-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: [activeContact],
          activityLogs: [`Letzter Kontakt am ${activeContact.lastContactDate}. Notiz: ${activeContact.notes}`]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContact.id
            ? { ...c, suggestions: data.suggestions || ["Keine neuen Vorschläge."] }
            : c
        )
      );
      onAddLog(`Netzwerkassistent: KI-Beziehungsanalyse für "${activeContact.name}" durchgeführt.`);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei Netzwerk-Empfehlung: " + err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* List Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="font-mono text-slate-400 flex items-center space-x-1">
          <Users size={12} className="text-emerald-400" />
          <span>Kontaktnetzwerk & Beziehungsanalysen:</span>
        </span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-emerald-400 hover:text-white text-[10px] font-mono flex items-center space-x-0.5"
        >
          <UserPlus size={10} />
          <span>Neu</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Contact List */}
        <div className="space-y-1.5 overflow-y-auto max-h-[160px] custom-scrollbar">
          {contacts.map((c, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-2 rounded border transition-all ${
                  isSelected
                    ? "bg-emerald-950/30 border-emerald-800"
                    : "bg-slate-900/60 border-slate-900 hover:bg-slate-900"
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{c.name}</div>
                <div className="flex justify-between items-center text-[8px] font-mono mt-1 text-slate-500">
                  <span>Schnittpunkt: {c.relationshipStrength}%</span>
                  <span>{c.lastContactDate}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Contact Details & AI suggestions */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/60 overflow-y-auto max-h-[160px] custom-scrollbar text-[10px] space-y-2.5">
          {showAddForm ? (
            <form onSubmit={handleAddContact} className="space-y-2">
              <span className="text-slate-400 font-bold block mb-1 font-mono text-[9px] uppercase">Neuer Kontakt</span>
              <input
                type="text"
                placeholder="Name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="email"
                  placeholder="E-Mail..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Telefon..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Notizen zur Beziehung/Projekt..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={1.5}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none custom-scrollbar resize-none"
              />
              <div className="flex justify-end space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded"
                >
                  Abbrechen
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded">
                  Hinzufügen
                </button>
              </div>
            </form>
          ) : activeContact ? (
            <>
              <div className="border-b border-white/5 pb-1">
                <div className="font-bold text-slate-200">{activeContact.name}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex flex-col space-y-0.5">
                  <span className="flex items-center space-x-1">
                    <MessageSquare size={8} />
                    <span>{activeContact.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Phone size={8} />
                    <span>{activeContact.phone}</span>
                  </span>
                </div>
              </div>

              {/* Relationship strength bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span>Netzwerk-Gürtelstärke:</span>
                  <span className="text-emerald-400 font-bold">{activeContact.relationshipStrength}%</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-lg"
                    style={{ width: `${activeContact.relationshipStrength}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-0.5 font-mono text-[9px] uppercase">Hintergrund-Notizen:</span>
                <p className="text-slate-400 leading-normal italic">{activeContact.notes}</p>
              </div>

              {activeContact.suggestions && activeContact.suggestions.length > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded">
                  <span className="text-emerald-400 font-bold block mb-1 font-mono text-[9px] flex items-center space-x-1">
                    <Sparkles size={10} />
                    <span>KI-Beziehungs-Empfehlung:</span>
                  </span>
                  <ul className="list-disc pl-3.5 space-y-1 text-slate-300 leading-tight">
                    {activeContact.suggestions.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={getAIEmpfehlungen}
                disabled={loadingSuggestions}
                className="w-full bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-200 font-mono font-medium py-1 rounded flex items-center justify-center space-x-1"
              >
                {loadingSuggestions ? (
                  <>
                    <RefreshCw size={10} className="animate-spin text-emerald-400" />
                    <span>Analysiere Beziehungsdaten...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={10} />
                    <span>Beziehungs-Update anfordern</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center text-slate-600 italic py-8 font-mono">Kein Kontakt vorhanden.</div>
          )}
        </div>
      </div>
    </div>
  );
}
