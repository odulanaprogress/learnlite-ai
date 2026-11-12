import type { Flashcard, KeyConcept, QuizQuestion, StudyPack } from "./api";

/**
 * Offline Study Pack Generator
 * Generates summaries, key concepts, flashcards, and quizzes directly inside
 * the student's browser when offline or when network connectivity is lost.
 */

export function generateOfflineStudyPack(
  text: string,
  filename: string = "Offline Notes",
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate"
): StudyPack {
  const cleanText = text.trim();
  const sentences = cleanText
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // 1. Coherent, Structured Academic Summary
  const overviewSentences = sentences.slice(0, 3).join(". ") + (sentences.length > 0 ? "." : "");
  const detailPoints = sentences
    .slice(3, 7)
    .map((s) => `• ${s}.`)
    .join("\n");

  const summary = `### 📖 Executive Overview\n${overviewSentences}\n\n### 🔑 Core Principles & Mechanisms\n${detailPoints || "• Foundational lecture principles and key definitions."}\n\n### 💡 Key Takeaways for Revision\nReview the key definitions and active recall flashcards to prepare for exams on ${filename}.`;

  // 2. Extract potential key terms (capitalized words, terms followed by is/are/refers to)
  const keyConcepts: KeyConcept[] = [];
  const flashcards: Flashcard[] = [];
  const quiz: QuizQuestion[] = [];

  const definitionRegex = /([A-Z][A-Za-z0-9\s\-]{2,30})\s+(?:is|are|refers to|means|defined as)\s+([^.!?\n]+)/g;
  let match: RegExpExecArray | null;

  while ((match = definitionRegex.exec(cleanText)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    if (term.length > 2 && definition.length > 10 && !keyConcepts.some((k) => k.term === term)) {
      keyConcepts.push({ term, definition: `${term} is ${definition}.` });
      flashcards.push({
        question: `What is ${term}?`,
        answer: `${term} is ${definition}.`,
        category: filename,
      });
    }
    if (keyConcepts.length >= 6) break;
  }

  // If definition regex yielded fewer than 4, extract from sentences
  if (keyConcepts.length < 4) {
    sentences.forEach((sentence, idx) => {
      if (keyConcepts.length >= 6) return;
      const words = sentence.split(/\s+/);
      const possibleTerm = words.slice(0, 3).join(" ").replace(/[^a-zA-Z0-9\s]/g, "");
      if (possibleTerm.length > 3 && !keyConcepts.some((k) => k.term === possibleTerm)) {
        keyConcepts.push({
          term: possibleTerm,
          definition: sentence,
        });
        flashcards.push({
          question: `Explain the concept: "${possibleTerm}"`,
          answer: sentence,
          category: filename,
        });
      }
    });
  }

  // Ensure at least 6 flashcards
  sentences.slice(0, 8).forEach((s, idx) => {
    if (flashcards.length >= 8) return;
    const parts = s.split(/,|;|because|due to/);
    if (parts.length > 1) {
      flashcards.push({
        question: `Based on your notes: ${parts[0].trim()}...?`,
        answer: s,
        category: filename,
      });
    } else {
      flashcards.push({
        question: `Review point #${idx + 1}: What is the significance of this concept?`,
        answer: s,
        category: filename,
      });
    }
  });

  // 4. Generate Practice Quiz
  const pool = keyConcepts.length > 0 ? keyConcepts : sentences.map((s, i) => ({ term: `Concept ${i + 1}`, definition: s }));

  pool.slice(0, 5).forEach((item, idx) => {
    const correct = item.definition;
    const distractors = pool
      .filter((_, i) => i !== idx)
      .map((p) => p.definition)
      .slice(0, 3);

    while (distractors.length < 3) {
      distractors.push(`Alternative theoretical mechanism not applicable to ${item.term}.`);
    }

    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(correct);

    quiz.push({
      question: `Which statement accurately describes "${item.term}"?`,
      options,
      correct_answer_index: correctIndex >= 0 ? correctIndex : 0,
      explanation: `According to your study material: ${correct}`,
    });
  });

  return {
    id: "offline_" + Date.now(),
    filename,
    difficulty,
    summary: summary || "Lecture summary generated offline on your device.",
    key_concepts: keyConcepts,
    flashcards: flashcards.length > 0 ? flashcards : [
      {
        question: `What is the core subject of ${filename}?`,
        answer: summary || "Foundational principles extracted from your notes.",
        category: filename,
      },
    ],
    quiz: quiz.length > 0 ? quiz : [
      {
        question: `What does ${filename} primarily cover?`,
        options: [
          summary.slice(0, 80) || "The core principles of this lecture.",
          "An unrelated historical overview.",
          "General computational methods.",
          "Standard experimental protocol."
        ],
        correct_answer_index: 0,
        explanation: "This option directly summarizes the provided study text.",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

