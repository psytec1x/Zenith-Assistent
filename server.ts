import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Gemini API
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set in environment. App will run in fallback mock mode.");
    }
    aiClient = new GoogleGenAI({ apiKey: key || "MOCK_KEY" });
  }
  return aiClient;
}

// 1. General Agent Chat Endpoint with multiple model select support
app.post("/api/chat", async (req, res) => {
  const { message, history, systemInstruction, modelName = "gemini-2.5-flash" } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      text: `[Fallback-Modus] Der KI-Assistent antwortet auf: "${message}". Bitte fügen Sie Ihren GEMINI_API_KEY im AI Studio UI hinzu, um echte KI-Power zu aktivieren!`,
      model: modelName + " (Mocked)"
    });
  }

  try {
    const ai = getAI();
    const contents = [];

    // Add chat history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({
      text: response.text || "Keine Antwort erhalten.",
      model: modelName
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Fehler bei der Generierung der KI-Antwort." });
  }
});

// 2. Natural Language Task Parsing (NLP for Task Management)
app.post("/api/parse-task", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text erforderlich" });

  if (!process.env.GEMINI_API_KEY) {
    // Basic local parsing fallback
    const lowerText = text.toLowerCase();
    let date = new Date().toISOString().split('T')[0];
    let time = "12:00";
    let priority: "high" | "medium" | "low" = "medium";

    if (lowerText.includes("heute")) {
      date = new Date().toISOString().split('T')[0];
    } else if (lowerText.includes("morgen")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else if (lowerText.includes("nächste woche") || lowerText.includes("naechste woche")) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      date = nextWeek.toISOString().split('T')[0];
    }

    if (lowerText.includes("dringend") || lowerText.includes("wichtig") || lowerText.includes("prio a")) {
      priority = "high";
    }

    // Simple time regex match (e.g. 14:00, 14 uhr, 9 uhr)
    const timeMatch = lowerText.match(/(\d{1,2})[\s:]*(uhr|:00)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      if (hour >= 0 && hour <= 23) {
        time = `${hour.toString().padStart(2, "0")}:00`;
      }
    }

    return res.json({
      title: text.replace(/(heute|morgen|dringend|wichtig|uhr)/gi, "").trim() || text,
      date,
      time,
      priority,
      category: lowerText.includes("arbeit") || lowerText.includes("work") ? "Arbeit" : "Persönlich",
      notes: "Automatisch lokal analysiert (Kein API-Schlüssel)."
    });
  }

  try {
    const ai = getAI();
    const prompt = `Analysiere folgenden Text zur Aufgabenstellung und extrahiere strukturierte Daten als JSON. 
Text: "${text}"
Aktuelles Datum und Zeit: ${new Date().toISOString()}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke (kein \`\`\`json). Das JSON muss folgende Felder enthalten:
- "title": Kurzer, prägnanter Aufgabentitel auf Deutsch
- "date": Datum im Format YYYY-MM-DD
- "time": Uhrzeit im Format HH:MM (falls erwähnt, sonst "12:00")
- "priority": Entweder "high", "medium" oder "low"
- "category": Eine Kategorie (z.B. "Arbeit", "Persönlich", "Einkauf", "Gesundheit", "Lernen")
- "notes": Zusätzliche Details oder Bemerkungen`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Parse Task Error:", error);
    res.status(500).json({ error: "Fehler beim Parsen der Aufgabe." });
  }
});

// 3. Email Summary & Smart Categorization
app.post("/api/categorize-email", async (req, res) => {
  const { sender, subject, body } = req.body;
  if (!body) return res.status(400).json({ error: "E-Mail-Inhalt erforderlich" });

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      summary: `Zusammenfassung: E-Mail von ${sender || "Unbekannt"} über "${subject || "Kein Betreff"}". Inhalt hat ${body.length} Zeichen.`,
      category: "Allgemein",
      priority: "medium",
      actionItems: ["E-Mail lesen", "Gegebenenfalls antworten"],
      sentiment: "Neutral"
    });
  }

  try {
    const ai = getAI();
    const prompt = `Analysiere diese E-Mail und erstelle eine strukturierte Zusammenfassung und Kategorisierung als JSON.
Absender: ${sender || "Unbekannt"}
Betreff: ${subject || "Kein Betreff"}
Inhalt:
${body}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "summary": Eine prägnante, deutsche Zusammenfassung (1-2 Sätze)
- "category": "Wichtig", "Arbeit", "Finanzen", "Newsletter", "Soziales" oder "Spam"
- "priority": "high", "medium" oder "low"
- "actionItems": Ein Array von vorgeschlagenen To-Do-Aktionen auf Deutsch
- "sentiment": Die emotionale Tonalität (z.B. "Positiv", "Neutral", "Dringend", "Frustriert")`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Categorize Email Error:", error);
    res.status(500).json({ error: "Fehler bei der E-Mail-Kategorisierung." });
  }
});

// 4. Writing Assistant / Schreibassistent
app.post("/api/writing-assistant", async (req, res) => {
  const { text, mode = "formal" } = req.body; // mode: formal, creative, concise, friendly
  if (!text) return res.status(400).json({ error: "Text erforderlich" });

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      correctedText: text,
      suggestions: ["Bitte fügen Sie Ihren GEMINI_API_KEY hinzu, um Grammatik- und Stilvorschläge zu erhalten."],
      improvements: []
    });
  }

  try {
    const ai = getAI();
    const prompt = `Optimiere folgenden deutschen Text im Stil: "${mode}". 
Originaltext:
"${text}"

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "correctedText": Der komplett korrigierte und optimierte deutsche Text
- "suggestions": Ein Array von konkreten stilistischen Vorschlägen oder Erklärungen (Deutsch)
- "improvements": Ein Array von geänderten Wortpaaren, z.B. [{"original": "altes Wort", "replacement": "neues Wort"}]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Writing Assistant Error:", error);
    res.status(500).json({ error: "Fehler beim Optimieren des Textes." });
  }
});

// 5. Intelligent News Summarizer with Bias Detection (Mainstream vs Alternative Viewpoints)
app.post("/api/summarize-news", async (req, res) => {
  const { articleUrl, articleText, title } = req.body;
  if (!articleText && !title) return res.status(400).json({ error: "Artikeltext oder Titel erforderlich" });

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      summary: "Zusammenfassung des Nachrichtenthemas (Fallback).",
      biasAnalysis: "Tendenz: Ausgewogen. Bitte fügen Sie Ihren API-Schlüssel für eine echte Deep Analysis hinzu.",
      mainstreamView: "Sichtweise der etablierten Medien: Konzentriert sich primär auf offizielle Erklärungen und konsolidierte Berichte.",
      alternativeView: "Alternative Sichtweise: Beleuchtet oft zusätzliche, weniger beachtete Aspekte oder hinterfragt Regierungsnarrative.",
      credibilityScore: 75
    });
  }

  try {
    const ai = getAI();
    const prompt = `Analysiere folgende Nachricht (Titel/Text) auf Tendenzen (Bias), erstelle eine neutrale Zusammenfassung und beleuchte das Thema aus verschiedenen Perspektiven (Mainstream-Medien vs. Alternative Medien).
Titel: ${title || "Nachrichtenthema"}
Inhalt:
${articleText || "Kein Volltext bereitgestellt."}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "summary": Eine neutrale, verständliche deutsche Zusammenfassung (2-3 Sätze)
- "biasAnalysis": Detaillierte Analyse über die sprachliche Färbung und politische Tendenz des Artikels
- "mainstreamView": Wie etablierte Medien dieses Thema üblicherweise darstellen (Deutsch)
- "alternativeView": Wie alternative Medien oder Blogs dieses Thema beleuchten (Deutsch)
- "credibilityScore": Eine geschätzte Glaubwürdigkeitsbewertung von 0 bis 100 basierend auf sachlicher Berichterstattung`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("News Summarizer Error:", error);
    res.status(500).json({ error: "Fehler bei der Nachrichtenanalyse." });
  }
});

// 6. Suggest Networking & Contact Relationship Analytics
app.post("/api/suggest-network", async (req, res) => {
  const { contacts, activityLogs } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      suggestions: [
        "Lade einen Kontakt ein, von dem du lange nichts gehört hast.",
        "Erstelle eine Notiz über dein letztes Gespräch für bessere Beziehungspflege."
      ],
      relationshipInsight: "Pflege deine Beziehungen regelmäßig, um ein starkes Netzwerk aufzubauen."
    });
  }

  try {
    const ai = getAI();
    const prompt = `Analysiere diese Kontakte und Aktivitätslogs. Erstelle Beziehungsanalysen und gib konkrete Netzwerk-Empfehlungen (Wen kontaktieren? Warum? Gesprächsideen?).
Kontakte: ${JSON.stringify(contacts || [])}
Aktivitäten: ${JSON.stringify(activityLogs || [])}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "suggestions": Ein Array von konkreten Netzwerk-Empfehlungen auf Deutsch
- "relationshipInsight": Eine kurze Zusammenfassung der Netzwerk-Gesundheit`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Network suggestion error:", error);
    res.status(500).json({ error: "Fehler bei der Netzwerkanalyse." });
  }
});

// 7. Knowledge Base Autocategorization
app.post("/api/categorize-knowledge", async (req, res) => {
  const { title, content } = req.body;
  if (!title && !content) return res.status(400).json({ error: "Titel oder Inhalt erforderlich" });

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      category: "Wissen",
      tags: ["Info", "Notiz"],
      backlinkSuggestions: []
    });
  }

  try {
    const ai = getAI();
    const prompt = `Analysiere dieses Wissensdokument und kategorisiere es. Schlage Tags vor und gib Ideen, womit dieses Thema verknüpft sein könnte.
Titel: ${title || "Unbenannt"}
Inhalt:
${content || ""}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Code-Blöcke. Das JSON muss folgende Felder enthalten:
- "category": Hauptkategorie (z.B. "Programmierung", "Finanzen", "Persönliches", "Haus & Garten", "Rezept", "Fitness")
- "tags": Array von passenden Tags (maximal 5)
- "backlinkSuggestions": Array von verwandten Begriffen oder Themen für Backlinks`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanedText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Categorize Knowledge Error:", error);
    res.status(500).json({ error: "Fehler bei der Wissenskategorisierung." });
  }
});

// Vite middleware integration or production static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
