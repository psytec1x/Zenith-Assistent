import React, { useState } from "react";
import { Task } from "../types";
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock } from "lucide-react";

interface CalendarWidgetProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
}

export default function CalendarWidget({ tasks, onAddTask }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 23)); // Match current mock time (June 2026)
  const [selectedDay, setSelectedDay] = useState<number | null>(23);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventCategory, setNewEventCategory] = useState("Arbeit");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Adjusted index so Monday is the first day of the week
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Filter tasks that belong to the current date
  const getTasksForDay = (day: number) => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return tasks.filter((t) => t.date === formattedDate);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || selectedDay === null) return;

    const formattedDate = `${year}-${(month + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
    const newTask: Task = {
      id: "event-" + Date.now(),
      title: newEventTitle,
      date: formattedDate,
      time: newEventTime,
      priority: "medium",
      category: newEventCategory,
      completed: false,
      notes: "Ereignis direkt über den Kalender erstellt."
    };

    onAddTask(newTask);
    setNewEventTitle("");
    setShowAddEvent(false);
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="font-semibold text-slate-200 font-mono">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 font-mono">
        <span>Mo</span>
        <span>Di</span>
        <span>Mi</span>
        <span>Do</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>So</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {Array.from({ length: startDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-7" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const isSelected = selectedDay === day;
          const dayTasks = getTasksForDay(day);
          const hasTasks = dayTasks.length > 0;

          // Check if today is June 23, 2026
          const isToday = year === 2026 && month === 5 && day === 23;

          return (
            <button
              key={`day-${day}`}
              onClick={() => setSelectedDay(day)}
              className={`h-7 rounded flex flex-col items-center justify-center relative transition-all ${
                isSelected
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : isToday
                  ? "bg-slate-800 border border-emerald-500/40 text-emerald-400"
                  : "bg-slate-950/40 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <span className="text-[10px] font-mono">{day}</span>
              {hasTasks && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    isSelected ? "bg-slate-950" : "bg-emerald-400 animate-pulse"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Events View & Add Event */}
      {selectedDay !== null && (
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 space-y-2 mt-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="font-semibold text-[10px] text-slate-400 font-mono">
              Events am {selectedDay}. {monthNames[month]}
            </span>
            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 text-[10px] font-mono font-medium"
            >
              <Plus size={10} />
              <span>Termin</span>
            </button>
          </div>

          {showAddEvent ? (
            <form onSubmit={handleAddEventSubmit} className="space-y-2 pt-1 text-[10px]">
              <input
                type="text"
                placeholder="Titel des Termins..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <span className="text-slate-500 block mb-0.5">Uhrzeit:</span>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-slate-500 block mb-0.5">Kategorie:</span>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
                  >
                    <option value="Arbeit">Arbeit</option>
                    <option value="Persönlich">Persönlich</option>
                    <option value="Lernen">Lernen</option>
                    <option value="Gesundheit">Gesundheit</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded"
                >
                  Speichern
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
              {getTasksForDay(selectedDay).length === 0 ? (
                <div className="text-slate-600 italic text-[10px] font-mono">Keine Termine für diesen Tag.</div>
              ) : (
                getTasksForDay(selectedDay).map((event) => (
                  <div key={event.id} className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                    <span className="font-semibold text-slate-300 truncate pr-2">{event.title}</span>
                    <span className="flex items-center space-x-0.5 text-[9px] text-emerald-400/80 font-mono shrink-0">
                      <Clock size={8} />
                      <span>{event.time}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
