import type { StudyPack, TutorResponse, TutorSource } from "./api";
import type { LibraryMaterial } from "./library";

/**
 * Offline AI Tutor Engine
 * Executes 100% locally in the browser when offline or when network is unavailable.
 * Searches saved IndexedDB documents, summaries, key concepts, flashcards and quizzes.
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
  "which", "who", "whom", "this", "that", "these", "those", "am", "is",
  "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "would", "should", "could",
  "ought", "i", "you", "he", "she", "it", "we", "they", "me", "him",
  "her", "us", "them", "my", "your", "his", "its", "our", "their",
  "mine", "yours", "hers", "ours", "theirs", "can", "explain", "tell",
  "about", "please", "help", "how", "why", "where", "when", "does", "mean"
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function answerOfflineQuestion(
  question: string,
  pack: StudyPack | null,
  materials: LibraryMaterial[] = []
): TutorResponse {
  const keywords = extractKeywords(question);
  const sources: TutorSource[] = [];

  // 1. Search in Key Concepts of current pack
  const matchedConcepts: Array<{ term: string; definition: string }> = [];
  if (pack?.key_concepts) {
    for (const concept of pack.key_concepts) {
      const termWords = extractKeywords(concept.term);
      const defWords = extractKeywords(concept.definition);
      const hasMatch = keywords.some(
        (kw) => termWords.includes(kw) || defWords.includes(kw)
      );
      if (hasMatch) {
        matchedConcepts.push(concept);
      }
    }
  }

  // 2. Search in Flashcards of current pack
  const matchedCards: Array<{ question: string; answer: string }> = [];
  if (pack?.flashcards) {
    for (const card of pack.flashcards) {
      const cardKeywords = extractKeywords(`${card.question} ${card.answer}`);
      const matches = keywords.filter((kw) => cardKeywords.includes(kw));
      if (matches.length > 0) {
        matchedCards.push(card);
      }
    }
  }

  // 3. Search in Text Content of saved materials / pack summary
  const allTexts: Array<{ title: string; text: string; pageNumber: number }> = [];

  if (pack?.summary) {
    allTexts.push({
      title: pack.filename || "Study Notes",
      text: pack.summary,
      pageNumber: 1,
    });
  }

  materials.forEach((m, idx) => {
    if (m.textContent && m.textContent.trim()) {
      allTexts.push({
        title: m.name,
        text: m.textContent,
        pageNumber: idx + 2,
      });
    }
  });

  const matchingSentences: Array<{ text: string; pageNumber: number; score: number }> = [];

  for (const doc of allTexts) {
    const sentences = doc.text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 20);
    for (const s of sentences) {
      const sKeywords = extractKeywords(s);
      const matchCount = keywords.filter((kw) => sKeywords.includes(kw)).length;
      if (matchCount > 0) {
        matchingSentences.push({
          text: s,
          pageNumber: doc.pageNumber,
          score: matchCount,
        });
      }
    }
  }

  matchingSentences.sort((a, b) => b.score - a.score);

  // If we found any relevant content locally:
  if (matchedConcepts.length > 0 || matchedCards.length > 0 || matchingSentences.length > 0) {
    let answer = `📌 **[Offline Study Engine • Grounded in Your Saved Notes]**\n\n`;

    if (matchedConcepts.length > 0) {
      answer += `**Key Definition:**\n`;
      matchedConcepts.slice(0, 2).forEach((c) => {
        answer += `• **${c.term}**: ${c.definition}\n`;
      });
      answer += `\n`;
      sources.push({
        page_number: 1,
        excerpt: `${matchedConcepts[0].term}: ${matchedConcepts[0].definition.slice(0, 120)}`,
      });
    }

    if (matchingSentences.length > 0) {
      answer += `**From Your Coursework Excerpts:**\n`;
      const topSentences = matchingSentences.slice(0, 3);
      topSentences.forEach((s) => {
        answer += `> "${s.text}"\n\n`;
        if (sources.length < 3) {
          sources.push({
            page_number: s.pageNumber,
            excerpt: s.text.slice(0, 130),
          });
        }
      });
    }

    if (matchedCards.length > 0) {
      const topCard = matchedCards[0];
      answer += `💡 **Active Recall Check:**\n`;
      answer += `*Q: ${topCard.question}*\n`;
      answer += `*A: ${topCard.answer}*\n`;
    }

    answer += `\n*(Note: This response was generated instantly from materials downloaded to this device.)*`;

    return {
      answer,
      sources,
      insufficient_context: false,
    };
  }

  // Fallback when no keywords matched downloaded notes
  const availableDocs = [pack?.filename, ...materials.map((m) => m.name)]
    .filter(Boolean)
    .join(", ");

  return {
    answer:
      `📶 **[Working in Offline Mode]**\n\n` +
      `I searched your local study notes for "${question}", but didn't find a direct mention in your currently downloaded materials.\n\n` +
      `**Your Saved Offline Materials:**\n` +
      (availableDocs ? `• ${availableDocs}\n\n` : `• No study notes downloaded yet.\n\n`) +
      `**Tips for studying offline:**\n` +
      `1. Try asking questions using specific keywords from your lecture titles or flashcards.\n` +
      `2. Review your flashcards and practice quizzes in the dashboard tabs.\n` +
      `3. Once you reconnect to the internet, you can ask open-ended questions across any academic domain.`,
    sources: [],
    insufficient_context: true,
  };
}

