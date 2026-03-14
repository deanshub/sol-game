export interface SentenceQuestion {
  sentence: string; // use ___ for the blank
  answer: string;
  options: string[];
}

export const QUESTIONS: SentenceQuestion[] = [
  // חיות
  { sentence: "ל___ יש ארבע רגליים וזנב", answer: "כלב", options: ["כלב", "דג", "ציפור"] },
  { sentence: "ה___ שרה בבוקר על העץ", answer: "ציפור", options: ["ציפור", "חתול", "דג"] },
  { sentence: "ה___ חי במים ויודע לשחות", answer: "דג", options: ["דג", "כלב", "ארנב"] },
  // צבעים
  { sentence: "השמיים הם בצבע ___", answer: "כחול", options: ["כחול", "אדום", "ירוק"] },
  { sentence: "העגבנייה היא בצבע ___", answer: "אדום", options: ["אדום", "כחול", "צהוב"] },
  { sentence: "הבננה היא בצבע ___", answer: "צהוב", options: ["צהוב", "ירוק", "כתום"] },
  // משפחה
  { sentence: "ה___ שלי מכינה לי ארוחת בוקר כל יום", answer: "אמא", options: ["אמא", "מורה", "שכנה"] },
  { sentence: "ה___ הוא הבעל של אמא", answer: "אבא", options: ["אבא", "חבר", "שכן"] },
  { sentence: "___ היא אמא של אמא או של אבא", answer: "סבתא", options: ["סבתא", "אחות", "חברה"] },
  // בית ספר
  { sentence: "אני כותב עם ___ במחברת", answer: "עיפרון", options: ["עיפרון", "מספריים", "סרגל"] },
  { sentence: "ה___ מלמדת אותנו בכיתה", answer: "מורה", options: ["מורה", "רופאה", "שוטר"] },
  { sentence: "אני קורא ___ מהספרייה", answer: "ספר", options: ["ספר", "כדור", "תיק"] },
  // אוכל
  { sentence: "ה___ הוא לבן ובא מהפרה", answer: "חלב", options: ["חלב", "מים", "מיץ"] },
  { sentence: "ה___ הוא פרי עגול ואדום", answer: "תפוח", options: ["תפוח", "בננה", "ענב"] },
  // טבע
  { sentence: "ה___ זורחת בשמיים ביום", answer: "שמש", options: ["שמש", "ירח", "כוכב"] },
  { sentence: "כשיורד ___ אני לוקח מטרייה", answer: "גשם", options: ["גשם", "שלג", "רוח"] },
  // גוף
  { sentence: "אני רואה עם ה___ שלי", answer: "עיניים", options: ["עיניים", "אוזניים", "ידיים"] },
  { sentence: "אני שומע עם ה___ שלי", answer: "אוזניים", options: ["אוזניים", "עיניים", "רגליים"] },
  // פעולות
  { sentence: "בלילה אני ___ במיטה", answer: "ישן", options: ["ישן", "רוקד", "שר"] },
  { sentence: "כשאני שמח אני ___", answer: "מחייך", options: ["מחייך", "בוכה", "צועק"] },
];
